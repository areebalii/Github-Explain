import { graphql } from '@octokit/graphql';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Custom Error class for GitHub-specific upstream failures
 */
export class GitHubServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'GitHubServiceError';
    this.statusCode = statusCode;
  }
}

/**
 * Fetches blame and Pull Request context for a specific line in a GitHub repository.
 *
 * @param {string} owner - Repository owner (e.g., 'facebook')
 * @param {string} repo - Repository name (e.g., 'react')
 * @param {string} filePath - Path to file (e.g., 'packages/react/index.js')
 * @param {string} branch - Branch or commit SHA (e.g., 'main')
 * @param {number} targetLine - 1-based index line number
 * @returns {Promise<Object>} Aggregated git and PR context
 */
export const getContextForLine = async (owner, repo, filePath, branch = 'main', targetLine) => {
  if (!process.env.GITHUB_TOKEN) {
    throw new GitHubServiceError('Missing GITHUB_TOKEN in environment configuration.', 500);
  }

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  const query = `
    query getFileBlame($owner: String!, $repo: String!, $filePath: String!, $branch: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: $branch) {
          ... on Commit {
            blame(path: $filePath) {
              ranges {
                startingLine
                endingLine
                commit {
                  oid
                  message
                  committedDate
                  author {
                    name
                    email
                  }
                  associatedPullRequests(first: 1) {
                    nodes {
                      number
                      title
                      body
                      url
                      mergedAt
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await graphqlWithAuth(query, {
      owner,
      repo,
      filePath,
      branch,
    });

    if (!response?.repository) {
      throw new GitHubServiceError(`Repository ${owner}/${repo} not found or inaccessible.`, 404);
    }

    const commitObject = response.repository.object;
    if (!commitObject) {
      throw new GitHubServiceError(`Branch or revision '${branch}' could not be resolved.`, 404);
    }

    const blameRanges = commitObject.blame?.ranges;
    if (!blameRanges || blameRanges.length === 0) {
      throw new GitHubServiceError(`File '${filePath}' was not found at branch '${branch}'.`, 404);
    }

    // Identify the specific blame hunk containing the selected line
    const targetRange = blameRanges.find(
      (range) => targetLine >= range.startingLine && targetLine <= range.endingLine
    );

    if (!targetRange) {
      const maxLine = blameRanges[blameRanges.length - 1].endingLine;
      throw new GitHubServiceError(
        `Line ${targetLine} is out of bounds. File has ${maxLine} lines.`,
        400
      );
    }

    const { commit } = targetRange;
    const prNode = commit.associatedPullRequests?.nodes?.[0] || null;

    return {
      commitHash: commit.oid,
      author: commit.author?.name || 'Unknown Author',
      committedDate: commit.committedDate,
      commitMessage: commit.message.trim(),
      lineRange: {
        start: targetRange.startingLine,
        end: targetRange.endingLine,
      },
      pr: prNode
        ? {
          number: prNode.number,
          title: prNode.title,
          body: prNode.body ? prNode.body.trim() : 'No PR description provided.',
          url: prNode.url,
          mergedAt: prNode.mergedAt,
        }
        : null, // Direct commit without an associated PR
    };
  } catch (error) {
    if (error instanceof GitHubServiceError) throw error;

    // Handle Octokit and HTTP network errors
    if (error.status === 401) {
      throw new GitHubServiceError('Invalid or expired GitHub Personal Access Token.', 401);
    }
    if (error.status === 403) {
      throw new GitHubServiceError('GitHub API rate limit exceeded or permissions restricted.', 403);
    }
    if (error.errors && error.errors.length > 0) {
      throw new GitHubServiceError(`GitHub GraphQL Error: ${error.errors[0].message}`, 400);
    }

    throw new GitHubServiceError(error.message || 'Failed to retrieve repository data.', 500);
  }
};