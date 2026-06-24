const { Schema, model, Types } = require('mongoose');

const resumeSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    currentVersionId: { type: Types.ObjectId, ref: 'ResumeVersion', default: null },
    bestScore: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = model('Resume', resumeSchema);
