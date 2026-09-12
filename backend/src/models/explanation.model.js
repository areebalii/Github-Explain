import mongoose from 'mongoose';

const explanationSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true, trim: true },
    repo: { type: String, required: true, trim: true },
    filePath: { type: String, required: true, trim: true },
    commitHash: { type: String, required: true, index: true },
    targetLine: { type: Number, required: true },
    commitMessage: { type: String },
    prDescription: { type: String },
    aiExplanation: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound index to quickly serve cached explanations for identical code commits
explanationSchema.index({ owner: 1, repo: 1, filePath: 1, commitHash: 1 });

export default mongoose.model('Explanation', explanationSchema);