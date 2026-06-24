const { diffWords, diffLines } = require('diff');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const Analysis = require('../models/Analysis');
const ActivityLog = require('../models/ActivityLog');
const { extractText } = require('../services/pdf.service');
const { formatUser } = require('../utils/format');

// GET /api/resumes
async function list(req, res, next) {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    const resumeIds = resumes.map((r) => r._id);
    const counts = await ResumeVersion.aggregate([
      { $match: { resumeId: { $in: resumeIds } } },
      { $group: { _id: '$resumeId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

    const shallow = resumes.map((r) => ({
      _id: r._id,
      title: r.title,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      bestScore: r.bestScore,
      versionCount: countMap[r._id.toString()] ?? 0,
    }));

    res.json({ resumes: shallow });
  } catch (err) {
    next(err);
  }
}

// GET /api/resumes/:id
async function get(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const versions = await ResumeVersion.find({ resumeId: resume._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      resume: {
        _id: resume._id,
        title: resume.title,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        currentVersionId: resume.currentVersionId,
        bestScore: resume.bestScore,
        versionCount: versions.length,
      },
      versions,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/resumes/:id/versions/:versionId
async function getVersion(req, res, next) {
  try {
    const version = await ResumeVersion.findOne({
      _id: req.params.versionId,
      resumeId: req.params.id,
    }).lean();
    if (!version) return res.status(404).json({ error: 'Version not found' });
    res.json({ version });
  } catch (err) {
    next(err);
  }
}

// POST /api/resumes  (multipart: file + optional title)
async function upload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

    const rawText = await extractText(req.file.buffer);
    const title = req.body.title || req.file.originalname.replace(/\.pdf$/i, '');

    const resume = await Resume.create({ userId: req.user._id, title, bestScore: 0 });

    const version = await ResumeVersion.create({
      resumeId: resume._id,
      label: 'V1',
      sourceType: 'upload',
      rawText,
      parsedSections: {},
      score: null,
    });

    resume.currentVersionId = version._id;
    await resume.save();

    await ActivityLog.create({
      userId: req.user._id,
      resumeId: resume._id,
      versionId: version._id,
      type: 'upload',
      title: `Uploaded ${title}`,
      subtitle: 'V1',
      label: 'Upload',
    });

    res.status(201).json({
      resume: {
        _id: resume._id,
        title: resume.title,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        currentVersionId: resume.currentVersionId,
        bestScore: resume.bestScore,
        versionCount: 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/resumes/:id
async function remove(req, res, next) {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    await Promise.all([
      ResumeVersion.deleteMany({ resumeId: resume._id }),
      Analysis.deleteMany({ resumeId: resume._id }),
      ActivityLog.deleteMany({ resumeId: resume._id }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/resumes/:id/diff?from=<versionId>&to=<versionId>&mode=words|lines
async function diff(req, res, next) {
  try {
    const { from, to, mode = 'words' } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query params are required' });
    }

    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const [vFrom, vTo] = await Promise.all([
      ResumeVersion.findOne({ _id: from, resumeId: resume._id }).select('rawText').lean(),
      ResumeVersion.findOne({ _id: to, resumeId: resume._id }).select('rawText').lean(),
    ]);

    if (!vFrom || !vTo) return res.status(404).json({ error: 'Version not found' });

    const differ = mode === 'lines' ? diffLines : diffWords;
    const parts = differ(vFrom.rawText, vTo.rawText);

    const hunks = parts
      .filter((p) => p.value.trim())
      .map((p) => ({
        type: p.added ? 'add' : p.removed ? 'remove' : 'context',
        text: p.value.trim(),
      }));

    res.json({ hunks });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, getVersion, upload, remove, diff };
