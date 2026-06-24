const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const Analysis = require('../models/Analysis');
const ActivityLog = require('../models/ActivityLog');

// GET /api/analytics/insights
async function insights(req, res, next) {
  try {
    const userId = req.user._id;

    const userResumes = await Resume.find({ userId }).lean();
    const resumeIds = userResumes.map((r) => r._id);
    const resumeMap = Object.fromEntries(userResumes.map((r) => [r._id.toString(), r]));

    const analyses = await Analysis.find({ userId }).sort({ createdAt: 1 }).lean();
    if (!analyses.length) {
      return res.json({
        averageScore: 0,
        bestScore: null,
        totalAnalyses: 0,
        scoreTrend: [],
        topIssues: [],
        topMissingKeywords: [],
        topPresentKeywords: [],
        resumePerformance: [],
      });
    }

    const averageScore = Math.round(
      analyses.reduce((sum, a) => sum + a.atsScore, 0) / analyses.length
    );

    const best = analyses.reduce((b, a) => (a.atsScore > b.atsScore ? a : b));
    const bestResume = resumeMap[best.resumeId.toString()];

    const scoreTrend = analyses.map((a) => ({
      score: a.atsScore,
      at: a.createdAt,
      resumeTitle: resumeMap[a.resumeId.toString()]?.title ?? '',
    }));

    // Top issues — aggregate across all analyses
    const issueCounts = {};
    for (const a of analyses) {
      for (const issue of a.issues) {
        const key = issue.title;
        if (!issueCounts[key]) issueCounts[key] = { title: issue.title, severity: issue.severity, count: 0 };
        issueCounts[key].count++;
      }
    }
    const topIssues = Object.values(issueCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top missing keywords
    const missingCounts = {};
    for (const a of analyses) {
      for (const kw of a.keywordsMissing) {
        missingCounts[kw] = (missingCounts[kw] ?? 0) + 1;
      }
    }
    const topMissingKeywords = Object.entries(missingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    // Top present keywords
    const presentCounts = {};
    for (const a of analyses) {
      for (const kw of a.keywordsPresent) {
        presentCounts[kw] = (presentCounts[kw] ?? 0) + 1;
      }
    }
    const topPresentKeywords = Object.entries(presentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    // Per-resume performance
    const resumePerformance = userResumes.map((resume) => {
      const rAnalyses = analyses.filter((a) => a.resumeId.toString() === resume._id.toString());
      if (!rAnalyses.length) return null;
      const latestScore = rAnalyses.at(-1).atsScore;
      const firstScore = rAnalyses[0].atsScore;
      const rBest = Math.max(...rAnalyses.map((a) => a.atsScore));
      return {
        resumeId: resume._id,
        title: resume.title,
        latestScore,
        bestScore: rBest,
        improvement: latestScore - firstScore,
        analysesCount: rAnalyses.length,
      };
    }).filter(Boolean);

    res.json({
      averageScore,
      bestScore: { value: best.atsScore, resumeId: best.resumeId, resumeTitle: bestResume?.title ?? '' },
      totalAnalyses: analyses.length,
      scoreTrend,
      topIssues,
      topMissingKeywords,
      topPresentKeywords,
      resumePerformance,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/versions
async function versions(req, res, next) {
  try {
    const userId = req.user._id;

    const userResumes = await Resume.find({ userId }).lean();
    const resumeIds = userResumes.map((r) => r._id);
    const resumeMap = Object.fromEntries(userResumes.map((r) => [r._id.toString(), r]));

    const allVersions = await ResumeVersion.find({ resumeId: { $in: resumeIds } })
      .sort({ createdAt: -1 })
      .lean();

    const uploads = allVersions.filter((v) => v.sourceType === 'upload').length;
    const rewrites = allVersions.filter((v) => v.sourceType === 'rewrite').length;

    res.json({
      totals: { all: allVersions.length, uploads, rewrites },
      versions: allVersions.map((v) => ({
        id: v._id,
        label: v.label,
        resumeId: v.resumeId,
        resumeTitle: resumeMap[v.resumeId.toString()]?.title ?? '',
        sourceType: v.sourceType,
        score: v.score ?? null,
        createdAt: v.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/history
async function history(req, res, next) {
  try {
    const userId = req.user._id;

    const logs = await ActivityLog.find({ userId }).sort({ createdAt: -1 }).lean();

    const totals = { all: logs.length, upload: 0, analyze: 0, rewrite: 0 };
    for (const log of logs) {
      if (totals[log.type] !== undefined) totals[log.type]++;
    }

    const events = logs.map((log) => ({
      id: log._id,
      type: log.type,
      title: log.title,
      subtitle: log.subtitle,
      label: log.label,
      at: log.createdAt,
      resumeId: log.resumeId,
    }));

    res.json({ totals, events });
  } catch (err) {
    next(err);
  }
}

module.exports = { insights, versions, history };
