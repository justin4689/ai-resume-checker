const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const Analysis = require('../models/Analysis');
const ActivityLog = require('../models/ActivityLog');

// GET /api/dashboard
async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id;

    const userResumes = await Resume.find({ userId }).sort({ updatedAt: -1 }).lean();
    const resumeIds = userResumes.map((r) => r._id);

    const [versions, analyses, logs] = await Promise.all([
      ResumeVersion.find({ resumeId: { $in: resumeIds } }).sort({ createdAt: 1 }).lean(),
      Analysis.find({ userId }).sort({ createdAt: 1 }).lean(),
      ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const rewriteCount = versions.filter((v) => v.sourceType === 'rewrite').length;

    // Score series + version stack for the most recently updated resume
    const latestResume = userResumes[0] ?? null;
    let scoreSeries = [];
    let versionStack = [];

    if (latestResume) {
      const latestVersions = versions.filter(
        (v) => v.resumeId.toString() === latestResume._id.toString()
      );
      scoreSeries = latestVersions.map((v) => ({ label: v.label, score: v.score ?? 0 }));
      versionStack = latestVersions.map((v) => ({
        id: v._id,
        label: v.label,
        title: v.sourceType === 'upload' ? 'Upload' : 'Rewrite pass',
        score: v.score ?? 0,
      }));
    }

    // KPIs — derived from analyses ordered chronologically
    const lastAnalysis = analyses.at(-1) ?? null;
    const prevAnalysis = analyses.at(-2) ?? null;
    const firstAnalysis = analyses[0] ?? null;

    const spark7 = (fn) => analyses.slice(-7).map(fn);

    const kpi = {
      atsScore: {
        value: lastAnalysis?.atsScore ?? 0,
        delta: firstAnalysis && lastAnalysis ? lastAnalysis.atsScore - firstAnalysis.atsScore : 0,
        spark: spark7((a) => ({ v: a.atsScore })),
      },
      versions: {
        value: versions.length,
        spark: versions.slice(-7).map((_, i) => ({ v: i + 1 })),
      },
      issuesIdentified: {
        value: lastAnalysis?.issues.length ?? 0,
        delta: lastAnalysis && prevAnalysis
          ? lastAnalysis.issues.length - prevAnalysis.issues.length
          : 0,
        spark: spark7((a) => ({ v: a.issues.length })),
      },
      keywordsMatched: {
        value: lastAnalysis?.keywordsPresent.length ?? 0,
        total: lastAnalysis
          ? lastAnalysis.keywordsPresent.length + lastAnalysis.keywordsMissing.length
          : 0,
        delta: lastAnalysis && prevAnalysis
          ? lastAnalysis.keywordsPresent.length - prevAnalysis.keywordsPresent.length
          : 0,
        spark: spark7((a) => ({ v: a.keywordsPresent.length })),
      },
    };

    const activity = logs.map((log) => ({
      id: log._id,
      type: log.type,
      title: log.title,
      subtitle: log.subtitle,
      label: log.label,
      at: log.createdAt,
      resumeId: log.resumeId,
    }));

    res.json({
      totals: { resumes: userResumes.length, rewrites: rewriteCount, analyses: analyses.length },
      latestResume: latestResume ? { _id: latestResume._id, title: latestResume.title } : null,
      scoreSeries,
      versionStack,
      kpi,
      activity,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
