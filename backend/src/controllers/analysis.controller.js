const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const Analysis = require('../models/Analysis');
const ActivityLog = require('../models/ActivityLog');
const { analyzeResume } = require('../services/ai.service');

// POST /api/resumes/:id/analyze   body: { versionId }
async function analyze(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const versionId = req.body.versionId || resume.currentVersionId;
    const version = await ResumeVersion.findOne({ _id: versionId, resumeId: resume._id });
    if (!version) return res.status(404).json({ error: 'Version not found' });

    if (!version.rawText) {
      return res.status(422).json({ error: 'Version has no text to analyze' });
    }

    const aiResult = await analyzeResume(version.rawText);

    const analysis = await Analysis.create({
      versionId: version._id,
      resumeId: resume._id,
      userId: req.user._id,
      atsScore: aiResult.atsScore,
      model: aiResult.model,
      summary: aiResult.summary,
      scoreBreakdown: aiResult.scoreBreakdown,
      issues: aiResult.issues,
      strengths: aiResult.strengths,
      keywordsPresent: aiResult.keywordsPresent,
      keywordsMissing: aiResult.keywordsMissing,
      bulletRewrites: aiResult.bulletRewrites,
    });

    // Update version score and resume bestScore
    version.score = aiResult.atsScore;
    await version.save();

    if (!resume.bestScore || aiResult.atsScore > resume.bestScore) {
      resume.bestScore = aiResult.atsScore;
      await resume.save();
    }

    await ActivityLog.create({
      userId: req.user._id,
      resumeId: resume._id,
      versionId: version._id,
      type: 'analyze',
      title: `Analyzed ${resume.title}`,
      subtitle: `${version.label} · Score ${aiResult.atsScore}/100`,
      label: 'Analysis',
    });

    res.status(201).json({ analysis });
  } catch (err) {
    next(err);
  }
}

// GET /api/resumes/:id/analyses
async function analyses(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const list = await Analysis.find({ resumeId: resume._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ analyses: list });
  } catch (err) {
    next(err);
  }
}

// GET /api/resumes/:id/versions/:versionId/analysis
async function analysisForVersion(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const analysis = await Analysis.findOne({
      versionId: req.params.versionId,
      resumeId: resume._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!analysis) return res.status(404).json({ error: 'No analysis for this version' });

    res.json({ analysis });
  } catch (err) {
    next(err);
  }
}

// POST /api/resumes/:id/rewrite   body: { analysisId, rewriteIds[] }
async function rewrite(req, res, next) {
  try {
    const { analysisId, rewriteIds = [] } = req.body;
    if (!analysisId) return res.status(400).json({ error: 'analysisId is required' });

    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const analysis = await Analysis.findOne({ _id: analysisId, resumeId: resume._id });
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });

    const sourceVersion = await ResumeVersion.findById(analysis.versionId);
    if (!sourceVersion) return res.status(404).json({ error: 'Source version not found' });

    // Filter to the selected rewrites (or all if none specified)
    const selected = rewriteIds.length
      ? analysis.bulletRewrites.filter((br) => rewriteIds.includes(br._id.toString()))
      : analysis.bulletRewrites;

    // Apply each rewrite to the raw text
    let newRawText = sourceVersion.rawText;
    for (const br of selected) {
      newRawText = newRawText.replace(br.original, br.rewritten);
    }

    // Label: V(n+1)
    const versionCount = await ResumeVersion.countDocuments({ resumeId: resume._id });
    const label = `V${versionCount + 1}`;

    const newVersion = await ResumeVersion.create({
      resumeId: resume._id,
      label,
      sourceType: 'rewrite',
      rawText: newRawText,
      parsedSections: sourceVersion.parsedSections,
      score: null,
    });

    resume.currentVersionId = newVersion._id;
    await resume.save();

    await ActivityLog.create({
      userId: req.user._id,
      resumeId: resume._id,
      versionId: newVersion._id,
      type: 'rewrite',
      title: `Applied ${selected.length} rewrite${selected.length !== 1 ? 's' : ''}`,
      subtitle: label,
      label: 'Rewrite',
    });

    res.status(201).json({ version: newVersion, appliedCount: selected.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyze, analyses, analysisForVersion, rewrite };
