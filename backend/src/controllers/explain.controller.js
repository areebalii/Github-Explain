import ExplanationCache from '../models/explanation.model.js';
import { getContextForLine } from '../services/github.service.js';
import { generateExplanation } from '../services/llm.service.js';

export const explainLine = async (req, res, next) => {
  try {
    // 1. Extract codeSnippet from the request body
    const { owner, repo, filePath, branch = 'main', targetLine, codeSnippet } = req.body;

    if (!owner || !repo || !filePath || !targetLine) {
      return res.status(400).json({ error: "Missing required fields: owner, repo, filePath, targetLine." });
    }

    const githubContext = await getContextForLine(owner, repo, filePath, branch, targetLine);

    const cachedData = await ExplanationCache.findOne({
      owner,
      repo,
      filePath,
      commitHash: githubContext.commitHash,
      targetLine
    });

    if (cachedData) {
      return res.status(200).json({
        source: 'cache',
        contextFetched: githubContext,
        explanation: cachedData.aiExplanation,
      });
    }

    // 2. Pass the extracted codeSnippet to the LLM
    const aiExplanation = await generateExplanation(githubContext, codeSnippet);

    ExplanationCache.create({
      owner,
      repo,
      filePath,
      commitHash: githubContext.commitHash,
      targetLine,
      commitMessage: githubContext.commitMessage,
      prDescription: githubContext.pr ? githubContext.pr.body : null,
      aiExplanation
    }).catch(err => console.error("Cache save failed:", err));

    res.status(200).json({
      source: 'llm_generated',
      contextFetched: githubContext,
      explanation: aiExplanation
    });

  } catch (error) {
    next(error);
  }
};