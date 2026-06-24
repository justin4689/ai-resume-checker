export type SourceType = "upload" | "rewrite";

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Resume {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  currentVersionId: string;
  bestScore: number;
  versionCount: number;
  versions: ResumeVersion[];
}

export interface ResumeShallow {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  versionCount: number;
  bestScore: number;
}

export interface ResumeVersion {
  _id: string;
  label: string;
  sourceType: SourceType;
  createdAt: string;
  score: number;
  rawText: string;
  parsedSections: ParsedSections;
}

export interface ParsedSections {
  basics?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    links?: { label: string; url: string }[];
  };
  summary?: string;
  experience?: { role: string; company?: string; period?: string; bullets?: string[] }[];
  education?: { degree: string; school?: string; period?: string }[];
  skills?: string[];
  projects?: { name: string; tech?: string[]; summary?: string }[];
  certifications?: { name: string; year?: number }[];
  languages?: string[];
  interests?: string[];
}

export interface Issue {
  title: string;
  severity: "high" | "medium" | "low";
  fix?: string;
}

export interface Strength {
  title: string;
  note: string;
}

export interface BulletRewrite {
  _id: string;
  section: string;
  original: string;
  rewritten: string;
  rationale: string;
}

export interface Analysis {
  _id: string;
  versionId: string;
  atsScore: number;
  model: string;
  summary: string;
  scoreBreakdown: { label: string; value: number }[];
  issues: Issue[];
  strengths: Strength[];
  keywordsPresent: string[];
  keywordsMissing: string[];
  bulletRewrites: BulletRewrite[];
}

export interface DiffHunk {
  type: "add" | "remove" | "context";
  text: string;
}

export type ActivityType = "analyze" | "rewrite" | "upload" | "export";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  label: string;
  at: string | Date;
  resumeId?: string;
}

export interface ScorePoint {
  label: string;
  score: number;
  v?: number;
}

export interface VersionStackItem {
  id: string;
  label: string;
  title: string;
  score: number;
  delta?: number;
}

export interface Dashboard {
  totals: { resumes: number; rewrites: number; analyses: number };
  latestResume?: { _id: string; title: string };
  scoreSeries: ScorePoint[];
  versionStack: VersionStackItem[];
  kpi: {
    atsScore: { value: number; delta?: number; spark: { v: number }[] };
    versions: { value: number; spark: { v: number }[] };
    issuesIdentified: { value: number; delta?: number; spark: { v: number }[] };
    keywordsMatched: { value: number; total?: number; delta?: number; spark: { v: number }[] };
  };
  activity: ActivityItem[];
}

export interface Insights {
  averageScore: number;
  bestScore: { value: number; resumeId: string; resumeTitle: string };
  totalAnalyses: number;
  scoreTrend: { score: number; at: string; resumeTitle: string }[];
  topIssues: { title: string; severity: string; count: number }[];
  topMissingKeywords: { keyword: string; count: number }[];
  topPresentKeywords: { keyword: string; count: number }[];
  resumePerformance: {
    resumeId: string;
    title: string;
    latestScore: number;
    bestScore: number;
    improvement: number;
    analysesCount: number;
  }[];
}

export interface AllVersions {
  totals: { all: number; uploads: number; rewrites: number };
  versions: {
    id: string;
    label: string;
    resumeId: string;
    resumeTitle: string;
    sourceType: SourceType;
    score: number;
    createdAt: string;
  }[];
}

export interface HistoryEvent {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  label: string;
  at: string;
  resumeId: string;
}

export interface History {
  totals: { all: number; upload: number; analyze: number; rewrite: number };
  events: HistoryEvent[];
}
