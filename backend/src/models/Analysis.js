const { Schema, model, Types } = require('mongoose');

const scoreBreakdownSchema = new Schema(
  { label: String, value: Number },
  { _id: false }
);

const issueSchema = new Schema(
  { title: String, severity: { type: String, enum: ['high', 'medium', 'low'] }, fix: String },
  { _id: false }
);

const strengthSchema = new Schema(
  { title: String, note: String },
  { _id: false }
);

const bulletRewriteSchema = new Schema(
  { section: String, original: String, rewritten: String, rationale: String }
);

const analysisSchema = new Schema(
  {
    versionId: { type: Types.ObjectId, ref: 'ResumeVersion', required: true, index: true },
    resumeId: { type: Types.ObjectId, ref: 'Resume', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    atsScore: { type: Number, required: true },
    model: { type: String, default: 'gemini-2.5-flash' },
    summary: { type: String, default: '' },
    scoreBreakdown: [scoreBreakdownSchema],
    issues: [issueSchema],
    strengths: [strengthSchema],
    keywordsPresent: [String],
    keywordsMissing: [String],
    bulletRewrites: [bulletRewriteSchema],
  },
  { timestamps: true }
);

module.exports = model('Analysis', analysisSchema);
