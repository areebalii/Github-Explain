import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const NOISE_KEYWORDS = /\b(format|formatting|prettier|eslint|linter|style|whitespace|cleanup|typo)\b/i;

export const generateExplanation = async (githubContext, rawCodeSnippet) => {
  const { commitHash, author, commitMessage, pr } = githubContext;

  let contextString = `Code Snippet: \`${rawCodeSnippet}\`\n`;
  contextString += `Commit Hash: ${commitHash}\nAuthor: ${author}\nCommit Message: ${commitMessage}\n`;

  if (pr) {
    contextString += `Pull Request: ${pr.title}\nPR Body: ${pr.body || 'None'}\n`;
  } else {
    contextString += `Associated PR: None (Direct branch commit)\n`;
  }

  const systemPrompt = `You are a strict, senior software engineer reviewing code. 
- Explain exactly what the provided 'Code Snippet' does and why it was introduced based on the Git history.
- If the Git history (commit message/PR) is vague or missing, analyze the code syntax directly.
- DO NOT invent architectural intents, features, or background context that is not explicitly proven by the code snippet or the Git history.`;

  const userPrompt = `Analyze this specific code line and its history:\n\n${contextString}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      // Use this highly stable fallback model:
      model: 'qwen/qwen3.8-27b',
      temperature: 0.2,
      max_tokens: 450,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || 'No explanation generated.';
  } catch (error) {
    console.error('[Groq API Error]:', error.message);
    throw new Error('LLM synthesis failed. Check Groq API credentials or model availability.');
  }
};

// packages / react / index.js