const { Schema, model, Types } = require('mongoose');

const activityLogSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Types.ObjectId, ref: 'Resume', required: true },
    versionId: { type: Types.ObjectId, ref: 'ResumeVersion', default: null },
    type: { type: String, enum: ['upload', 'analyze', 'rewrite', 'export'], required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    label: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = model('ActivityLog', activityLogSchema);
