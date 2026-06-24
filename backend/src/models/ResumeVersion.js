const { Schema, model, Types } = require('mongoose');

const linkSchema = new Schema({ label: String, url: String }, { _id: false });

const basicsSchema = new Schema(
  {
    name: String,
    title: String,
    email: String,
    phone: String,
    location: String,
    links: [linkSchema],
  },
  { _id: false }
);

const experienceSchema = new Schema(
  { role: String, company: String, period: String, bullets: [String] },
  { _id: false }
);

const educationSchema = new Schema(
  { degree: String, school: String, period: String },
  { _id: false }
);

const projectSchema = new Schema(
  { name: String, tech: [String], summary: String },
  { _id: false }
);

const certificationSchema = new Schema(
  { name: String, year: Number },
  { _id: false }
);

const parsedSectionsSchema = new Schema(
  {
    basics: basicsSchema,
    summary: String,
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [String],
    projects: [projectSchema],
    certifications: [certificationSchema],
    languages: [String],
    interests: [String],
  },
  { _id: false }
);

const resumeVersionSchema = new Schema(
  {
    resumeId: { type: Types.ObjectId, ref: 'Resume', required: true, index: true },
    label: { type: String, required: true },
    sourceType: { type: String, enum: ['upload', 'rewrite'], required: true },
    rawText: { type: String, default: '' },
    parsedSections: { type: parsedSectionsSchema, default: {} },
    score: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = model('ResumeVersion', resumeVersionSchema);
