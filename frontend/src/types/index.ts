export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ResumeLink {
  label: string;
  url: string;
}

export interface ParsedBasics {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: ResumeLink[];
}

export interface ResumeExperience {
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface ResumeEducation {
  degree: string;
  school: string;
  period: string;
}

export interface ResumeProject {
  name: string;
  tech: string[];
  summary: string;
}

export interface ResumeCertification {
  name: string;
  year: number;
}

export interface ParsedSections {
  basics?: ParsedBasics;
  summary?: string;
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  skills?: string[];
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
  languages?: string[];
  interests?: string[];
}

export type SourceType = "upload" | "rewrite";

export interface ResumeVersion {
  _id: string;
  label: string;
  sourceType: SourceType;
  createdAt: string;
  score: number;
  rawText?: string;
  parsedSections?: ParsedSections;
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

export type Severity = "low" | "medium" | "high";

export interface ScoreBreakdownItem {
  label: string;
  value: number;
}

export interface Issue {
  title: string;
  severity: Severity;
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
  model?: string;
  summary?: string;
  scoreBreakdown?: ScoreBreakdownItem[];
  issues?: Issue[];
  strengths?: Strength[];
  keywordsPresent?: string[];
  keywordsMissing?: string[];
  bulletRewrites?: BulletRewrite[];
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

export interface SparkPoint {
  v: number;
}

export interface KpiStat {
  value: number;
  delta?: number;
  total?: number;
  spark: SparkPoint[];
}

export interface ScorePoint {
  label: string;
  score: number;
  v?: number;
}

export interface VersionStackItem {
  id: string;
  label: string;
  title?: string;
  score: number;
  delta?: number;
}

export interface Dashboard {
  totals: { resumes: number; rewrites: number; analyses: number };
  latestResume?: { _id: string; title: string };
  scoreSeries: ScorePoint[];
  versionStack: VersionStackItem[];
  kpi: {
    atsScore: KpiStat;
    versions: KpiStat;
    issuesIdentified: KpiStat;
    keywordsMatched: KpiStat;
  };
  activity: ActivityItem[];
}

export interface TopIssue {
  title: string;
  severity: Severity;
  count: number;
}

export interface KeywordCount {
  keyword: string;
  count: number;
}

export interface ResumePerformance {
  resumeId: string;
  title: string;
  latestScore: number;
  bestScore: number;
  improvement: number;
  analysesCount: number;
}

export interface ScoreTrendPoint {
  score: number;
  at: string;
  resumeTitle?: string;
}

export interface Insights {
  averageScore: number;
  bestScore: { value: number; resumeId: string; resumeTitle: string };
  totalAnalyses: number;
  scoreTrend: ScoreTrendPoint[];
  topIssues: TopIssue[];
  topMissingKeywords: KeywordCount[];
  topPresentKeywords: KeywordCount[];
  resumePerformance: ResumePerformance[];
}

export interface VersionListItem {
  id: string;
  label: string;
  resumeId: string;
  resumeTitle?: string;
  sourceType: SourceType;
  score: number;
  createdAt: string;
}

export interface AllVersions {
  totals: { all: number; uploads: number; rewrites: number };
  versions: VersionListItem[];
}

export interface HistoryEvent {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  label: string;
  at: string;
  resumeId?: string;
}

export interface History {
  totals: { all: number; upload: number; analyze: number; rewrite: number };
  events: HistoryEvent[];
}

export type DiffHunkType = "add" | "remove" | "context";

export interface DiffHunk {
  type: DiffHunkType;
  text: string;
}
