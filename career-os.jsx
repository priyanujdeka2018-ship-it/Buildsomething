import { useState, useEffect, useReducer, useCallback, useRef } from "react";
import {
  Briefcase, Target, FileSearch, Mic, GraduationCap, Settings,
  Upload, Download, Trash2, ChevronRight, ChevronLeft, Check, AlertCircle,
  Loader2, X, FileText, Plus, BarChart3, BookOpen,
  Copy, Sparkles, Users, Brain, ListChecks, ArrowRight,
  Clock, Building2, MapPin, AlertTriangle, Repeat, DollarSign, Wand2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ============================================================
// SECTION 1: CONSTANTS & THEME
// ============================================================

const APP_VERSION = "1.0.0";
const SCHEMA_VERSION = "1.0";

const STORAGE_KEYS = {
  profile: "cos-profile",
  stars: "cos-stars",
  pipeline: "cos-pipeline",
  skills: "cos-skills",
  vocab: "cos-vocab",
  settings: "cos-settings",
};

const ZONES = [
  { id: "onboard", label: "Onboard", icon: Briefcase, description: "Career profile & STAR stories" },
  { id: "pipeline", label: "Pipeline", icon: Target, description: "Role tracking & pipeline board" },
  { id: "analyzer", label: "Analyze", icon: FileSearch, description: "JD scoring & playbook generation" },
  { id: "prep", label: "Prep", icon: Mic, description: "Interview prep & mock practice" },
  { id: "skills", label: "Skills", icon: GraduationCap, description: "Skill tracks & certifications" },
  { id: "settings", label: "Settings", icon: Settings, description: "Configuration & data management" },
];

const MD_IMPORT_TYPES = [
  { zone: 1, type: "career-profile", label: "Career Profile", targetKey: "profile" },
  { zone: 1, type: "star-stories", label: "STAR Stories", targetKey: "stars" },
  { zone: 3, type: "red-team", label: "Red Team Results", targetKey: "pipeline" },
  { zone: 4, type: "mock-results", label: "Mock Interview Results", targetKey: "stars" },
  { zone: 5, type: "practice-results", label: "Practice Results", targetKey: "skills" },
];

// Offload prompt templates (free AI tools). {variable} injection at runtime.
const OFFLOAD_PROMPTS = {
  "OP-01": {
    title: "Voice Onboarding Interview",
    tool: "Gemini Voice (free)",
    tip: "Open Gemini, paste this prompt, then talk through your career for ~20 minutes. Copy the formatted output and tap \"Import .md\".",
    template: `You are conducting a structured career data intake interview. Your goal is to collect
comprehensive career information through natural conversation. Be thorough but efficient
— ask follow-up questions when answers are vague or missing specifics.

COLLECT THE FOLLOWING (in this order):

1. IDENTITY: Full name, current job title, employer name (+ brief description),
   how long you've been there, who you report to, and their reporting chain up to CEO.

2. ORG STRUCTURE: How many people report to you (directly and total)? Names and titles
   of direct reports with their team sizes. Where are teams located? Any peers worth noting?

3. CAREER GOAL: What roles are you targeting? Which industries? Which locations?
   What's your "elevator pitch" for why you're a fit despite coming from a different domain?

4. CAREER HISTORY: Walk me through your title progression at this company (dates, titles,
   key events at each level). Any prior companies?

5. ACHIEVEMENT HEADLINE: What's the single most impressive thing you've done here?
   Give me the numbers — before/after, scale, timeline.

6. PERFORMANCE METRICS: Year-by-year key numbers (revenue, volume, team size, KPIs).
   Current year targets and actuals so far.

7. OPERATIONAL WINS: Top 3-5 process improvements with before/after metrics.

8. TECHNOLOGY: What tools and platforms have you used or implemented? Which should go
   on a resume and which should be excluded?

9. GOVERNANCE: Any formal documents, policies, or frameworks you've authored or been
   signatory on? Who approved them?

10. EDUCATION: Degrees, institutions, years. Any test scores worth noting? Any GPAs
    you'd prefer NOT to share?

11. PSYCHOMETRICS: Have you taken CliftonStrengths, DISC, Myers-Briggs, or similar?
    What are your results? What are your known strengths and development areas?

12. RESUME RULES: Anything that should NEVER appear on your resume? Any terms that
    should always be reframed (e.g., your internal jargon vs. market language)?

For each metric or claim, note whether it's from a document, something you stated,
or something you calculated.

WHEN DONE, format all collected information as a single markdown document using
EXACTLY these headers (this is critical — the output will be imported into an app):

<!-- COS_IMPORT zone:1 type:career-profile date:{today} -->

## IDENTITY
## REPORTING_CHAIN
## ORG_STRUCTURE
## CAREER_GOAL
## TITLE_PROGRESSION
## ACHIEVEMENT_STATEMENT
## PERFORMANCE_METRICS
## PORTFOLIO_SCALE
## OPERATIONAL_METRICS
## INTELLIGENCE_PLATFORM
## TECHNOLOGY_STACK
## GOVERNANCE_ARTIFACTS
## EDUCATION
## PSYCHOMETRICS
## RESUME_RULES

Use "key: value" format for single fields. Use markdown tables for tabular data.
Do not skip any section — write "Not provided" if the person didn't share something.`,
  },
  "OP-02": {
    title: "STAR Story Builder",
    tool: "Gemini Voice (free)",
    tip: "Talk through each story; the AI probes for metrics and names, then formats everything for import. Aim for 10-15 stories.",
    template: `You are a behavioral interview story builder. You'll help me create STAR-format
stories from my career experiences. Each story needs:
- Situation: Business context and problem (2-3 sentences)
- Task: What I was specifically accountable for (1-2 sentences)
- Action: Specific steps I took with granular detail (3-5 sentences)
- Result: Quantified outcomes with numbers (2-3 sentences)

INTERVIEW CATEGORIES TO COVER:
1. Risk/Governance — a time you managed risk, compliance, or quality standards
2. Team Leadership — building, scaling, or developing a team
3. Transformation — redesigning a process or system
4. Stakeholder Management — influencing senior leaders or cross-functional partners
5. Data/Analytics — using data to drive a decision
6. Crisis Management — handling an urgent problem
7. Financial Impact — delivering measurable financial results
8. Building from Scratch — creating something that didn't exist
9. Failure/Learning — something that didn't go as planned (with honest reflection)
10. Assertiveness — pushing back or holding a standard under pressure

For each category, ask me: "Tell me about a time you [category-specific prompt]."
Then probe with follow-up questions to get specific metrics, names, timelines.

After EACH story, ask:
- "What's the key metric that proves this worked?"
- "How long did this take?"
- "Who else was involved and what was YOUR specific contribution?"
- "On a scale of 1-3, how strong is the evidence for this story?"

After collecting all stories, format as markdown:

<!-- COS_IMPORT zone:1 type:star-stories date:{today} -->

## STAR_STORIES

### S1: [Short Title]
category: [from the 13 categories]
starRating: [1-3]
situation: [text]
task: [text]
action: [text]
result: [text]
metrics: [comma-separated key numbers]
source: STATED
interviewNotes: [any coaching notes]

Repeat for each story. Number sequentially (S1, S2, S3...).
Aim for 10-15 stories minimum across the categories.`,
  },
};

// ============================================================
// SECTION 2: DEFAULT DATA STRUCTURES
// ============================================================

const DEFAULT_SETTINGS = {
  schemaVersion: SCHEMA_VERSION,
  lastUpdated: new Date().toISOString(),
  userName: "",
  apiConfigured: false,
  driveConnected: false,
  driveFolderId: null,
  lastBackup: null,
  lastImport: null,
  onboardingComplete: false,
  scoringWeights: [
    { dim: 1, name: "Functional Alignment", weight: 20 },
    { dim: 2, name: "Technical/Cert Prereqs", weight: 10 },
    { dim: 3, name: "Leadership & Vocab", weight: 15 },
    { dim: 4, name: "Programme Scale Match", weight: 10 },
    { dim: 5, name: "Domain Relevance", weight: 10 },
    { dim: 6, name: "AI/Portfolio Relevance", weight: 5 },
    { dim: 7, name: "Stakeholder Altitude", weight: 10 },
    { dim: 8, name: "Geographic/Mode Fit", weight: 5 },
    { dim: 9, name: "Compensation Alignment", weight: 10 },
    { dim: 10, name: "Career Trajectory Value", weight: 5 },
  ],
  segmentCriteria: {
    P3A: { minAddressable: 80, maxGap: 10, boundaryExceptionMin: 85 },
    P3B: { minAddressable: 70, maxAddressable: 79 },
    P3C: { maxAddressable: 69 },
  },
  capacityCaps: { P2: 5, P3B: 7 },
  stalenessWeeks: { P3A: 6, P3B: 8, P3C: 12, P2_submitted: 4, skillStallDays: 3 },
  theme: "dark",
  currency: "INR",
  currencySymbol: "₹",
  currencyUnit: "L",
};

const DEFAULT_PROFILE = {
  schemaVersion: SCHEMA_VERSION,
  lastUpdated: null,
  identity: { name: "", currentTitle: "", employer: "", employerDescription: "", tenureStart: "", location: "", targetLocation: "", email: "", linkedin: "", reportsTo: { name: "", title: "" } },
  orgStructure: { totalHeadcount: 0, directReports: [], peers: [] },
  careerGoal: { transitionSummary: "", targetFunctions: [], targetIndustries: [], coreReframe: "", aiDifferentiator: "" },
  titleProgression: [],
  achievementStatement: "",
  performanceMetrics: { annual: [], headline: [] },
  operationalMetrics: [],
  education: [],
  psychometrics: { cliftonStrengths: [], disc: { high: [], low: [] }, strengths: [], developmentAreas: [] },
  resumeRules: { neverInclude: [], vocabularyOverrides: [], framingRules: [] },
};

const DEFAULT_STARS = {
  schemaVersion: SCHEMA_VERSION,
  lastUpdated: null,
  categoryEnum: [
    "RISK_GOVERNANCE", "TEAM_LEADERSHIP", "TRANSFORMATION", "STAKEHOLDER",
    "ASSERTIVENESS", "AI_AUGMENTATION", "DATA_OPS", "CRISIS", "FINANCIAL",
    "PRODUCT_DELIVERY", "SCALE_OPS", "SELF_AWARENESS", "RESERVED",
  ],
  stories: [],
  mockSessions: [],
  bqRouter: [
    { questionPattern: "Walk me through your career", primary: null, backup: null },
    { questionPattern: "Tell me about a time you failed", primary: null, backup: null },
    { questionPattern: "What's your weakness", primary: null, backup: null },
    { questionPattern: "Biggest achievement", primary: null, backup: null },
    { questionPattern: "Time you held a standard under pressure", primary: null, backup: null },
    { questionPattern: "Time you pushed back on leadership", primary: null, backup: null },
    { questionPattern: "Cross-functional stakeholder management", primary: null, backup: null },
    { questionPattern: "Process you redesigned", primary: null, backup: null },
    { questionPattern: "Data-driven decision", primary: null, backup: null },
    { questionPattern: "Remote / multi-geo team leadership", primary: null, backup: null },
    { questionPattern: "Building something from scratch", primary: null, backup: null },
    { questionPattern: "Scaling under volume pressure", primary: null, backup: null },
    { questionPattern: "Senior presentations / influence", primary: null, backup: null },
    { questionPattern: "Conflict or disagreement", primary: null, backup: null },
    { questionPattern: "Building team capability", primary: null, backup: null },
    { questionPattern: "Time you owned an outcome solo", primary: null, backup: null },
  ],
};

const DEFAULT_PIPELINE = { schemaVersion: SCHEMA_VERSION, lastUpdated: null, roles: [] };
const DEFAULT_SKILLS = { schemaVersion: SCHEMA_VERSION, lastUpdated: null, tracks: [], certPriorityStack: [] };
const DEFAULT_VOCAB = { schemaVersion: SCHEMA_VERSION, lastUpdated: null, employerName: "", mandatoryReframes: [], contextualReframes: [], roleOverlays: {}, canonicalMetrics: [], positioningAnchors: { coreReframe: "", aiDifferentiator: "", transitionScript: "" } };

const DEFAULTS = {
  profile: DEFAULT_PROFILE,
  stars: DEFAULT_STARS,
  pipeline: DEFAULT_PIPELINE,
  skills: DEFAULT_SKILLS,
  vocab: DEFAULT_VOCAB,
  settings: DEFAULT_SETTINGS,
};

// ============================================================
// SECTION 3: STORAGE ABSTRACTION
// ============================================================

async function storageGet(key) {
  try {
    const result = await window.storage.get(key);
    return result ? JSON.parse(result.value) : null;
  } catch { return null; }
}

async function storageSet(key, value) {
  try {
    const serialized = JSON.stringify(value);
    const result = await window.storage.set(key, serialized);
    return !!result;
  } catch { return false; }
}

async function storageDelete(key) {
  try {
    await window.storage.delete(key);
    return true;
  } catch { return false; }
}

async function loadAllData() {
  const data = {};
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    const stored = await storageGet(key);
    data[name] = stored || DEFAULTS[name];
  }
  return data;
}

async function saveData(name, value) {
  const key = STORAGE_KEYS[name];
  if (!key) return false;
  const updated = { ...value, lastUpdated: new Date().toISOString() };
  return storageSet(key, updated);
}

async function exportAllData() {
  const data = await loadAllData();
  return JSON.stringify(data, null, 2);
}

async function clearAllData() {
  for (const key of Object.values(STORAGE_KEYS)) {
    await storageDelete(key);
  }
}

// ============================================================
// SECTION 4: MD PARSER
// ============================================================

function parseMdMetadata(text) {
  const match = text.match(/<!--\s*COS_IMPORT\s+zone:(\d+)\s+type:([\w-]+)\s+date:([\d-]+)\s*-->/);
  if (!match) return null;
  return { zone: parseInt(match[1]), type: match[2], date: match[3] };
}

function parseMdSections(text) {
  const sections = {};
  let currentSection = null;
  let currentContent = [];

  for (const line of text.split("\n")) {
    const headerMatch = line.match(/^## ([A-Z_]+(?:\s*[A-Z_]*)*)\s*$/);
    if (headerMatch) {
      if (currentSection) sections[currentSection] = currentContent.join("\n").trim();
      currentSection = headerMatch[1].trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  if (currentSection) sections[currentSection] = currentContent.join("\n").trim();
  return sections;
}

function parseMdKeyValues(text) {
  const result = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^(\w[\w\s]*?):\s*(.+)$/);
    if (match) result[match[1].trim()] = match[2].trim();
  }
  return result;
}

function parseMdSubRecords(text) {
  const records = [];
  let current = null;
  let currentContent = [];

  for (const line of text.split("\n")) {
    const subMatch = line.match(/^### (.+)$/);
    if (subMatch) {
      if (current) { current.content = parseMdKeyValues(currentContent.join("\n")); current.rawContent = currentContent.join("\n"); records.push(current); }
      current = { title: subMatch[1].trim(), content: {}, rawContent: "" };
      currentContent = [];
    } else if (current) {
      currentContent.push(line);
    }
  }
  if (current) { current.content = parseMdKeyValues(currentContent.join("\n")); current.rawContent = currentContent.join("\n"); records.push(current); }
  return records;
}

function parseImportedMd(text) {
  const metadata = parseMdMetadata(text);
  const sections = parseMdSections(text);
  return { metadata, sections, raw: text };
}

// --- Structural helpers (tables, lists, keyed blocks) ---

function splitComma(s) {
  return (s || "").split(",").map(x => x.trim()).filter(Boolean);
}

function parseMdTable(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.startsWith("|"));
  if (lines.length < 2) return [];
  const headers = lines[0].split("|").slice(1, -1).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split("|").slice(1, -1).map(c => c.trim());
    if (cells.every(c => /^[-:\s]*$/.test(c))) continue; // separator row
    const row = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] || ""; });
    rows.push(row);
  }
  return rows;
}

function parseMdList(text) {
  return text.split("\n").map(l => l.trim()).filter(l => l.startsWith("- ")).map(l => l.slice(2).trim());
}

// Bullet lines that follow a `key:` line, up to the next key.
function linesAfterKey(text, key) {
  const lines = text.split("\n");
  const out = [];
  let cap = false;
  for (const raw of lines) {
    const t = raw.trim();
    if (!cap) { if (new RegExp(`^${key}\\s*:\\s*$`).test(t)) cap = true; continue; }
    if (/^- /.test(t)) out.push(t.slice(2).trim());
    else if (t === "") continue;
    else break;
  }
  return out;
}

// Bullet lines under a `### Heading` within a section.
function linesAfterHeading(text, heading) {
  const lines = text.split("\n");
  let cap = false;
  const out = [];
  for (const raw of lines) {
    const t = raw.trim();
    const h = t.match(/^###\s+(.+)$/);
    if (h) { cap = new RegExp(`^${heading}`, "i").test(h[1].trim()); continue; }
    if (cap && /^- /.test(t)) out.push(t.slice(2).trim());
  }
  return out;
}

function parseReport(s) {
  let teamSize = 0, location = "";
  let head = s;
  const paren = s.match(/\(([^)]*)\)\s*$/);
  if (paren) {
    head = s.slice(0, paren.index).trim();
    const inner = paren[1];
    const rm = inner.match(/(\d+)\s*reports?/i);
    if (rm) teamSize = parseInt(rm[1]);
    const loc = inner.split(",").map(p => p.trim()).find(p => p && !/reports?/i.test(p));
    if (loc) location = loc;
  }
  const ci = head.indexOf(",");
  const name = ci >= 0 ? head.slice(0, ci).trim() : head.trim();
  const title = ci >= 0 ? head.slice(ci + 1).trim() : "";
  return { name, title, teamSize, location, note: "" };
}

function parseDisc(s) {
  const high = [], low = [];
  for (const part of splitComma(s)) {
    const m = part.match(/^(High|Low)\s+(\w+)/i);
    if (m) (m[1].toLowerCase() === "high" ? high : low).push(m[2].toUpperCase());
  }
  return { high, low };
}

function parseReframe(s) {
  const m = s.match(/(.+?)\s*(?:→|->|=>)\s*(.+)$/);
  if (!m) return null;
  const clean = v => v.trim().replace(/^["“]|["”]$/g, "").trim();
  return { source: clean(m[1]), target: clean(m[2]) };
}

// ============================================================
// SECTION 4B: ZONE-SPECIFIC PARSERS (MD → data model)
// ============================================================

function parseCareerProfile(sections) {
  const profilePatch = {};
  const vocabPatch = {};

  if (sections.IDENTITY) {
    const kv = parseMdKeyValues(sections.IDENTITY);
    const id = {};
    for (const k of ["name", "currentTitle", "employer", "employerDescription", "tenureStart", "location", "targetLocation", "email", "phone", "linkedin"]) {
      if (kv[k]) id[k] = kv[k];
    }
    if (Object.keys(id).length) profilePatch.identity = id;
  }

  if (sections.REPORTING_CHAIN) {
    const kv = parseMdKeyValues(sections.REPORTING_CHAIN);
    profilePatch.identity = profilePatch.identity || {};
    if (kv.reportsTo) {
      const parts = splitComma(kv.reportsTo);
      profilePatch.identity.reportsTo = parts.length > 1
        ? { title: parts[0], name: parts.slice(1).join(", ") }
        : { name: parts[0], title: "" };
    }
    const chain = linesAfterKey(sections.REPORTING_CHAIN, "chain");
    if (chain.length) {
      profilePatch.identity.reportsToChain = chain.map((c, i) => {
        const clean = c.replace(/\*\*/g, "").replace(/\(you\)/i, "").trim();
        const ci = clean.indexOf(",");
        return ci >= 0
          ? { title: clean.slice(0, ci).trim(), name: clean.slice(ci + 1).trim(), level: i + 1 }
          : { title: clean, name: "", level: i + 1 };
      });
    }
  }

  if (sections.ORG_STRUCTURE) {
    const kv = parseMdKeyValues(sections.ORG_STRUCTURE);
    const org = {};
    if (kv.totalHeadcount) org.totalHeadcount = parseInt(kv.totalHeadcount) || 0;
    const breakdown = linesAfterKey(sections.ORG_STRUCTURE, "breakdown").map(b => {
      const ci = b.indexOf(":");
      return ci >= 0 ? { location: b.slice(0, ci).trim(), count: parseInt(b.slice(ci + 1)) || 0, note: "" } : { location: b, count: 0, note: "" };
    });
    if (breakdown.length) org.headcountBreakdown = breakdown;
    const dr = linesAfterKey(sections.ORG_STRUCTURE, "directReports").map(parseReport);
    if (dr.length) org.directReports = dr;
    const peers = linesAfterKey(sections.ORG_STRUCTURE, "peers").map(p => {
      const ci = p.indexOf(",");
      return ci >= 0 ? { name: p.slice(0, ci).trim(), title: p.slice(ci + 1).trim(), note: "" } : { name: p, title: "", note: "" };
    });
    if (peers.length) org.peers = peers;
    if (Object.keys(org).length) profilePatch.orgStructure = org;
  }

  if (sections.CAREER_GOAL) {
    const kv = parseMdKeyValues(sections.CAREER_GOAL);
    const g = {};
    if (kv.transitionSummary) g.transitionSummary = kv.transitionSummary;
    if (kv.targetFunctions) g.targetFunctions = splitComma(kv.targetFunctions);
    if (kv.targetIndustries) g.targetIndustries = splitComma(kv.targetIndustries);
    if (kv.coreReframe) g.coreReframe = kv.coreReframe;
    if (kv.aiDifferentiator) g.aiDifferentiator = kv.aiDifferentiator;
    if (Object.keys(g).length) profilePatch.careerGoal = g;
  }

  if (sections.TITLE_PROGRESSION) {
    const rows = parseMdTable(sections.TITLE_PROGRESSION);
    const tp = rows.map(r => ({ period: r.Period || r.period || "", title: r.Title || r.title || "", keyEvent: r["Key Event"] || r.keyEvent || "" }));
    if (tp.length) profilePatch.titleProgression = tp;
  }

  if (sections.ACHIEVEMENT_STATEMENT) {
    const txt = sections.ACHIEVEMENT_STATEMENT.trim();
    if (txt && !/^not provided$/i.test(txt)) profilePatch.achievementStatement = txt;
  }

  if (sections.PERFORMANCE_METRICS) {
    const headline = linesAfterHeading(sections.PERFORMANCE_METRICS, "Headline Metrics").map(h => ({ label: h, value: "", context: "", source: "STATED" }));
    const annualRows = parseMdTable(sections.PERFORMANCE_METRICS);
    const pm = {};
    if (headline.length) pm.headline = headline;
    if (annualRows.length) pm.annual = annualRows.map(r => ({ year: parseInt(r.Year || r.year) || null, raw: r }));
    if (Object.keys(pm).length) profilePatch.performanceMetrics = pm;
  }

  if (sections.OPERATIONAL_METRICS) {
    const rows = parseMdTable(sections.OPERATIONAL_METRICS);
    const om = rows.map(r => ({ name: r.Metric || "", before: r.Before || "", after: r.After || "", reduction: r.Improvement || "", context: "" }));
    if (om.length) profilePatch.operationalMetrics = om;
  }

  if (sections.PORTFOLIO_SCALE) {
    const items = parseMdList(sections.PORTFOLIO_SCALE).map(b => {
      const ci = b.indexOf(":");
      return ci >= 0 ? { dimension: b.slice(0, ci).trim(), value: b.slice(ci + 1).trim(), note: "" } : { dimension: b, value: "", note: "" };
    });
    if (items.length) profilePatch.portfolioScale = { items };
  }

  if (sections.TECHNOLOGY_STACK) {
    const rows = parseMdTable(sections.TECHNOLOGY_STACK);
    const ts = rows.map(r => ({ platform: r.Platform || "", usage: r.Usage || "", resumeInclude: /^y/i.test(r["Include in Resume"] || r.resumeInclude || "") }));
    if (ts.length) profilePatch.technologyStack = ts;
  }

  if (sections.GOVERNANCE_ARTIFACTS) {
    const ga = parseMdList(sections.GOVERNANCE_ARTIFACTS).map(b => {
      const ci = b.indexOf(":");
      return ci >= 0 ? { docId: b.slice(0, ci).trim(), name: b.slice(ci + 1).trim(), approver: "", date: "", signatoryRole: "" } : { docId: "", name: b, approver: "", date: "", signatoryRole: "" };
    });
    if (ga.length) profilePatch.governanceArtifacts = ga;
  }

  if (sections.EDUCATION) {
    const rows = parseMdTable(sections.EDUCATION);
    const ed = rows.map(r => ({ qualification: r.Qualification || "", institution: r.Institution || "", years: r.Years || "", note: r.Note || "", gpa: null, volunteerGPA: false }));
    if (ed.length) profilePatch.education = ed;
  }

  if (sections.PSYCHOMETRICS) {
    const kv = parseMdKeyValues(sections.PSYCHOMETRICS);
    const ps = {};
    if (kv.cliftonStrengths) ps.cliftonStrengths = splitComma(kv.cliftonStrengths);
    if (kv.disc) ps.disc = parseDisc(kv.disc);
    if (kv.strengths) ps.strengths = splitComma(kv.strengths);
    if (kv.developmentAreas) ps.developmentAreas = splitComma(kv.developmentAreas);
    if (Object.keys(ps).length) profilePatch.psychometrics = ps;
  }

  if (sections.RESUME_RULES) {
    const kv = parseMdKeyValues(sections.RESUME_RULES);
    const rr = {};
    if (kv.neverInclude) rr.neverInclude = splitComma(kv.neverInclude);
    const vo = linesAfterKey(sections.RESUME_RULES, "vocabularyOverrides").map(parseReframe).filter(Boolean);
    if (vo.length) rr.vocabularyOverrides = vo.map(v => ({ wrong: v.source, correct: v.target }));
    const fr = linesAfterKey(sections.RESUME_RULES, "framingRules");
    if (fr.length) rr.framingRules = fr;
    if (Object.keys(rr).length) profilePatch.resumeRules = rr;
    if (vo.length) vocabPatch.mandatoryReframes = vo.map(v => ({ source: v.source, target: v.target, note: "" }));
  }

  return { profilePatch, vocabPatch };
}

const STORY_FIELD_KEYS = ["category", "starRating", "status", "situation", "task", "action", "result", "metrics", "source", "applicableRoles", "interviewNotes", "deploymentTips"];

function parseStoryFields(raw) {
  const fields = {};
  let cur = null;
  for (const line of raw.split("\n")) {
    const m = line.match(/^([a-zA-Z]+):\s?(.*)$/);
    if (m && STORY_FIELD_KEYS.includes(m[1])) {
      cur = m[1];
      fields[cur] = m[2];
    } else if (cur) {
      fields[cur] += (fields[cur] ? "\n" : "") + line;
    }
  }
  Object.keys(fields).forEach(k => { fields[k] = fields[k].trim(); });
  return fields;
}

function parseStarStories(sections, existing) {
  const text = sections.STAR_STORIES || "";
  if (!text) return existing || [];

  const records = [];
  let head = null, buf = [];
  for (const line of text.split("\n")) {
    const h = line.match(/^###\s+(.+)$/);
    if (h) { if (head !== null) records.push({ head, body: buf.join("\n") }); head = h[1].trim(); buf = []; }
    else if (head !== null) buf.push(line);
  }
  if (head !== null) records.push({ head, body: buf.join("\n") });

  const map = new Map((existing || []).map(s => [s.storyId, s]));
  let auto = (existing || []).length;
  for (const r of records) {
    const idm = r.head.match(/^(S\d+)\s*[:\-—]\s*(.+)$/) || r.head.match(/^(S\d+)\s*(.*)$/);
    const storyId = idm ? idm[1] : "S" + (++auto);
    const title = (idm ? idm[2] : r.head).trim();
    const f = parseStoryFields(r.body);
    const prev = map.get(storyId) || {};
    map.set(storyId, {
      storyId,
      title: title || prev.title || "",
      category: f.category || prev.category || "TRANSFORMATION",
      starRating: f.starRating ? parseInt(f.starRating) || 2 : (prev.starRating || 2),
      status: f.status || prev.status || (f.result ? "DRAFT" : "STUB"),
      situation: f.situation || prev.situation || "",
      task: f.task || prev.task || "",
      action: f.action || prev.action || "",
      result: f.result || prev.result || "",
      metrics: f.metrics ? splitComma(f.metrics) : (prev.metrics || []),
      sourceLabels: prev.sourceLabels || {},
      applicableRoleIds: f.applicableRoles ? splitComma(f.applicableRoles) : (prev.applicableRoleIds || []),
      rolesTested: prev.rolesTested || [],
      lastRehearsed: prev.lastRehearsed || null,
      rehearsalCount: prev.rehearsalCount || 0,
      lastReframed: prev.lastReframed || null,
      reframeOf: prev.reframeOf || null,
      interviewNotes: f.interviewNotes || prev.interviewNotes || "",
      deploymentTips: f.deploymentTips || prev.deploymentTips || "",
    });
  }
  return Array.from(map.values());
}

function mergeProfile(base, patch) {
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v == null) continue;
    if (Array.isArray(v)) { if (v.length) out[k] = v; }
    else if (typeof v === "object") out[k] = { ...(base[k] || {}), ...v };
    else out[k] = v;
  }
  out.lastUpdated = new Date().toISOString();
  return out;
}

function mergeReframes(base, incoming) {
  const map = new Map((base || []).map(r => [r.source, r]));
  for (const r of incoming) map.set(r.source, { ...map.get(r.source), ...r });
  return Array.from(map.values());
}

// ============================================================
// SECTION 5: CLAUDE API HELPER
// ============================================================

async function callClaudeAPI({ systemPrompt, userMessage, maxTokens = 2000, mcpServers = [] }) {
  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  };
  if (mcpServers.length > 0) body.mcp_servers = mcpServers;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();

  const textBlocks = data.content?.filter(b => b.type === "text").map(b => b.text) || [];
  const toolResults = data.content?.filter(b => b.type === "mcp_tool_result").map(b => b.content?.[0]?.text || "") || [];

  return { text: textBlocks.join("\n"), toolResults, raw: data };
}

// Prompt + clipboard utilities (used by offload panels)
function buildPrompt(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
}

const todayStr = () => new Date().toISOString().slice(0, 10);

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch { return false; }
}

// ============================================================
// SECTION 5B: ANALYZER PROMPT BUILDERS & PARSERS
// ============================================================

const SCORING_SCALE = {
  "10": "perfect match or overqualified",
  "8": "strong match with minor vocabulary gap",
  "6": "solid transferable match requiring meaningful reframe",
  "4": "partial match with genuine capability gap",
  "2": "weak match requiring major skill acquisition",
  "1": "no relevant experience",
};

const DIMENSION_NAMES = {
  1: "Functional Alignment", 2: "Technical/Cert Prereqs", 3: "Leadership & Vocab",
  4: "Programme Scale Match", 5: "Domain Relevance", 6: "AI/Portfolio Relevance",
  7: "Stakeholder Altitude", 8: "Geographic/Mode Fit", 9: "Compensation Alignment",
  10: "Career Trajectory Value",
};

function condensedProfile(p) {
  const id = p.identity || {};
  return {
    name: id.name, title: id.currentTitle, employer: id.employer, employerDescription: id.employerDescription,
    tenureStart: id.tenureStart, location: id.location, targetLocation: id.targetLocation,
    teamSize: p.orgStructure?.totalHeadcount,
    achievementStatement: p.achievementStatement,
    transitionSummary: p.careerGoal?.transitionSummary,
    coreReframe: p.careerGoal?.coreReframe,
    aiDifferentiator: p.careerGoal?.aiDifferentiator,
    targetFunctions: p.careerGoal?.targetFunctions,
    targetIndustries: p.careerGoal?.targetIndustries,
    headlineMetrics: (p.performanceMetrics?.headline || []).slice(0, 10).map(h => h.label || h.value).filter(Boolean),
    operationalMetrics: (p.operationalMetrics || []).map(o => `${o.name}: ${o.before}→${o.after}`),
    techStack: (p.technologyStack || []).map(t => t.platform).filter(Boolean),
    education: (p.education || []).map(e => `${e.qualification}, ${e.institution} (${e.years})`),
    psychometrics: p.psychometrics,
  };
}

function buildAP01System(data) {
  const s = data.settings;
  return `You are a career fit scoring engine. You score job descriptions against a candidate's
career profile using a 10-dimension weighted framework.

SCORING METHOD:
Each dimension: 1-10 scale.
${JSON.stringify(s.scoringScale || SCORING_SCALE)}

DIMENSION WEIGHTS:
${JSON.stringify(s.scoringWeights)}

BASE FIT = sum of (dimension_score × weight) / 100
ADDRESSABLE FIT = base + gap-closure uplift (max +3 per dimension, only for actionable gaps)
GAP = addressable - base

STABILITY DISCOUNT: Apply -10 to net fit for pre-profit companies, <3yr history,
active turnaround, or significant org instability. Format: "capability [X] - 10 = net [Y]"

TRI-SCORE: Functional = dim 1, Technical/Cert = dim 2, Leadership/Vocab = dim 3

SEGMENT RECOMMENDATION:
${JSON.stringify(s.segmentCriteria)}

CANDIDATE BASELINE:
${JSON.stringify(condensedProfile(data.profile))}

CANDIDATE STAR STORIES (titles only for mapping):
${JSON.stringify((data.stars.stories || []).map(st => ({ storyId: st.storyId, title: st.title, category: st.category })))}

CANDIDATE VOCABULARY TABLE:
${JSON.stringify(data.vocab.mandatoryReframes || [])}

CANDIDATE CERTIFICATIONS / SKILLS IN PROGRESS:
${JSON.stringify((data.skills.tracks || []).map(t => ({ name: t.name, status: t.status })))}

OUTPUT FORMAT — respond with ONLY this JSON, no prose:
{
  "role": "", "company": "", "location": "", "workMode": "", "slug": "",
  "fitBase": 0, "fitTarget": 0, "fitGap": 0, "stabilityDiscount": 0, "fitNet": 0,
  "subScores": { "functional": 0, "technicalCert": 0, "leadershipVocab": 0 },
  "dimensionScores": [
    { "dim": 1, "score": 0, "evidence": "", "upliftPossible": 0, "upliftAction": "" }
  ],
  "segmentRecommendation": "P3A|P3B|P3C",
  "segmentReasoning": "",
  "statusRecommendation": "",
  "ctcEstimate": { "min": 0, "max": 0, "midpoint": 0, "confidence": "HIGH|MED|LOW", "currency": "${s.currency || "INR"}" },
  "walkAwayFloor": 0,
  "whatItIs": "", "top3Requirements": "", "reframeStrategy": "",
  "gaps": [""], "certsNeeded": [""], "effortTier": "", "prepMonths": 0,
  "suggestedStarIds": [""], "convProbability": "", "psych": "", "notes": ""
}
Include all 10 dimensions in dimensionScores.`;
}

function buildAP02System(data, scoreCard) {
  return `You are a career playbook builder. You produce a single-page HTML playbook for a job
application. The playbook is a comprehensive preparation document.

PLAYBOOK SECTIONS (10 core + 2 conditional, in order):
01 · Snapshot — stat grid (Net Fit, Status, Conv Probability, Target CTC) + one-line thesis
02 · Role Decode — what the role actually is, JD requirements decoded, vocabulary translation table
03 · Fit & Gap — 10-dimension scoring detail with evidence per dimension + tri-score
04 · STAR Mapping — exactly 5 stories mapped to role requirements with S-codes + BQ router table
05 · 30·60·90 Plan — first 90 days structured plan
06 · AI Differentiator — how AI/automation portfolio maps to role
07 · Interview Kit — 20+ predicted questions with story routing + coaching notes
08 · Comp Intel — CTC band with sources, walk-away floor, negotiation anchors
09 · Cert Roadmap — required/preferred/nice-to-have certs with timeline
10 · Close & Outreach — application strategy, referral paths, cover letter hooks

Conditional: !! Risk & Red Flags (if instability); ++ Stakeholder Decode (if hiring manager known).

DENSITY FLOORS: JD requirements ≥9, vocabulary translations ≥15, gaps 3-5, STAR stories exactly 5,
AI portfolio projects ≥3, timeline items ≥15, interview questions ≥20, total content cards ≥60.

DESIGN RULES:
- Single HTML file, no external dependencies except Google Fonts
- Brand-derived palette from the target company
- Left-rail vertical tab navigation; Mobile <768px: tabs become dropdown
- No horizontal table scroll

CANDIDATE DATA:
${JSON.stringify(data.profile)}

STAR STORIES:
${JSON.stringify(data.stars.stories || [])}

VOCABULARY TABLE:
${JSON.stringify(data.vocab)}

ROLE SCORES:
${JSON.stringify(scoreCard)}

POSITIONING ANCHORS:
Core reframe: ${data.profile.careerGoal?.coreReframe || ""}
AI differentiator: ${data.profile.careerGoal?.aiDifferentiator || ""}
Psychometrics: ${JSON.stringify(data.profile.psychometrics || {})}

Produce the complete HTML file. No code fences — raw HTML only.`;
}

function buildOP06(roleTitle, company, artifactType, artifactContent) {
  return `You are a skeptical hiring manager at ${company || "the company"} reviewing this candidate's
${artifactType} for the ${roleTitle || "role"} role. Your job is to find weaknesses,
not validate strengths.

${artifactContent}

EVALUATE:
1. GAPS FOUND: What would make you skeptical? Where does the positioning feel
   generic vs. genuinely differentiated? What follow-up questions would expose a weakness?
2. SUGGESTED STRENGTHENING: For each gap, suggest a specific fix referencing the artifact.
3. RED FLAGS: Any vocabulary slips, inflated claims, or missing proof points.

Format your output as:

<!-- COS_IMPORT zone:3 type:red-team date:${todayStr()} -->

## RED_TEAM_RESULTS
role: ${roleTitle || ""} at ${company || ""}
source: chatgpt
date: ${todayStr()}

## GAPS_FOUND
- [gap 1]
- [gap 2]

## SUGGESTED_STRENGTHENING
- [fix 1]
- [fix 2]

## RED_FLAGS
- [flag 1]
- [flag 2]`;
}

function vocabTableText(vocab) {
  const mr = vocab?.mandatoryReframes || [];
  if (!mr.length) return "(none provided)";
  return mr.map(r => `${r.source} → ${r.target}`).join("\n");
}

function storiesForRole(role, stars) {
  const all = stars.stories || [];
  if (role && (role.starIds || []).length) {
    const mapped = role.starIds.map(id => all.find(s => s.storyId === id)).filter(Boolean);
    if (mapped.length) return mapped;
  }
  return all;
}

function buildOP03(role, stories, vocab, aiTool = "chatgpt") {
  const company = role?.company || "the company";
  const roleTitle = role?.role || "the target role";
  return `You are a hiring manager at ${company} interviewing a candidate for the role of
${roleTitle}. Conduct a behavioral interview with 5 questions.

ROLE CONTEXT:
${role?.whatItIs || role?.top3Requirements || roleTitle}

CANDIDATE'S AVAILABLE STORIES (use these to evaluate relevance of answers):
${stories.map(s => `${s.storyId}: ${s.title} — ${s.result || s.situation || ""}`).join("\n") || "(none on file)"}

CANDIDATE'S VOCABULARY TABLE (flag if they use the LEFT column instead of RIGHT):
${vocabTableText(vocab)}

INTERVIEW PROTOCOL:
1. Ask ONE question at a time. Wait for the full answer before responding.
2. After each answer, score on 4 dimensions (1-3 scale):
   - Structure: STAR compliance, ≤2 minutes, clear flow
   - Specificity: 3+ metrics, named outcomes, quantified scale
   - Vocabulary: Zero domain-specific jargon from current employer (flag any slips)
   - Assertiveness: Leads with decisions/actions, no hedging ("I think", "we sort of")
3. Give brief feedback after each answer, then move to the next question.
4. Mix question types: at least 1 failure/weakness, 1 leadership, 1 process, 1 data-driven.
5. Include 1 unexpected question not from the standard behavioral set.

AFTER ALL 5 QUESTIONS, format your output as:

<!-- COS_IMPORT zone:4 type:mock-results date:${todayStr()} -->

## MOCK_RESULTS
role: ${roleTitle}
date: ${todayStr()}
source: ${aiTool}
questionsAsked: 5

### Q1: [question text]
storyUsed: [S-code if identifiable]
structure: [1-3]
specificity: [1-3]
vocabulary: [1-3]
assertiveness: [1-3]
feedback: [specific coaching]

[repeat for each question]

## SCORE_SUMMARY
| Dimension | Avg Score | Trend |
|-----------|-----------|-------|
| Structure | X.X | — |
| Specificity | X.X | — |
| Vocabulary | X.X | — |
| Assertiveness | X.X | — |

## IMPROVEMENT_ACTIONS
1. [most important fix]
2. [second fix]
3. [third fix]`;
}

function buildOP04(roleTitle, company, rawAnswer, vocab) {
  return `Polish this behavioral interview answer for a ${roleTitle || "target"} role${company ? ` at ${company}` : ""}.

ORIGINAL ANSWER:
${rawAnswer}

RULES:
1. Maintain STAR structure (Situation → Task → Action → Result)
2. Target length: ≤300 words (≈2 minutes spoken)
3. Apply these vocabulary translations (MUST use right column, never left):
${vocabTableText(vocab)}
4. Lead with decisions and actions, not analysis
5. Use "I decided / I built / I held / I escalated" — never "I think" or "we sort of"
6. Include 3+ specific metrics in the Result section
7. End on the outcome, not on what you learned (save learning for follow-up)

OUTPUT:
Provide the polished answer, then a bullet list of what you changed and why.
Do NOT format as .md import — this is for inline review only.`;
}

function buildOP05(role, settings) {
  const cur = settings.currency || "INR";
  const unit = settings.currencyUnit || "L";
  const company = role?.company || "the company";
  const roleTitle = role?.role || "the target role";
  return `You are an HR Business Partner at ${company} extending an offer for ${roleTitle}.
Run a realistic salary negotiation simulation.

OFFER DETAILS:
- Role: ${roleTitle}
- Grade/Level: ${role?.effortTier ? `tier ${role.effortTier}` : "as discussed"}
- Base salary offered: ${role?.ctcMin || "?"} ${unit} (${cur})
- Total comp offered: ${role?.ctcMidpoint || role?.ctcMin || "?"} ${unit} (${cur})
- The candidate's research suggests market rate is ${role?.ctcMax || "?"} ${unit} (${cur})

NEGOTIATION COUNTERS TO DEPLOY (vary which ones you use — don't use all):
A. CTC Demand: "We need your current compensation for internal banding."
B. Grade Lock: "This role is graded at [level] and the band is non-negotiable."
C. Title Downgrade: "We can't offer [higher title], but the scope is equivalent."
D. Exploding Offer: "We need your decision by Friday."
E. Benefits Offset: "The benefits package bridges the gap."
F. Future Promise: "Next review is in 6 months, high performers get 15-20% bumps."

Deploy 3-4 of these across the conversation. Include at least ONE unexpected counter.

CANDIDATE RULES (things they should practice):
- Never volunteer current compensation. Deflect: "I'd prefer to focus on the value
  I bring and the market rate for this scope."
- Always push one level/band higher than offered
- If pressed on title, negotiate accelerated review timeline
- If exploding offer, request a specific extension date

Run the simulation as a natural conversation. After it concludes, provide:
1. Assessment of the candidate's negotiation performance
2. Moments where they conceded too easily
3. Moments where they held well
4. One thing to practice for next time`;
}

function parseLooseList(text) {
  return (text || "").split("\n").map(l => l.trim()).filter(l => /^(?:\d+\.|[-*])\s+/.test(l)).map(l => l.replace(/^(?:\d+\.|[-*])\s+/, "").trim());
}

function parseMockResults(sections) {
  const meta = parseMdKeyValues(sections.MOCK_RESULTS || "");
  const recs = parseMdSubRecords(sections.MOCK_RESULTS || "");
  const num = v => { const n = parseInt(v); return isNaN(n) ? null : n; };
  const questions = recs.map(r => ({
    question: r.title,
    storyUsed: r.content.storyUsed || null,
    structure: num(r.content.structure),
    specificity: num(r.content.specificity),
    vocabulary: num(r.content.vocabulary),
    assertiveness: num(r.content.assertiveness),
    feedback: r.content.feedback || "",
  }));
  const dims = ["structure", "specificity", "vocabulary", "assertiveness"];
  const averages = {};
  for (const d of dims) {
    const vals = questions.map(q => q[d]).filter(v => v != null);
    averages[d] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
  }
  return {
    role: meta.role || "",
    date: meta.date || todayStr(),
    source: meta.source || "chatgpt",
    questionsAsked: num(meta.questionsAsked) || questions.length,
    questions,
    averages,
    actions: parseLooseList(sections.IMPROVEMENT_ACTIONS || ""),
  };
}

function parseJsonResponse(text) {
  let t = (text || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{"), end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

function makeRoleFromScore(score, jdText, settings, playbookBuilt) {
  const now = new Date().toISOString();
  const fitBase = Number(score.fitBase) || 0;
  const fitTarget = Number(score.fitTarget) || fitBase;
  const fitGap = Number(score.fitGap) || Math.max(0, fitTarget - fitBase);
  const segment = score.segmentRecommendation || computeSegment(fitTarget, fitGap, settings.segmentCriteria);
  const ctc = score.ctcEstimate || {};
  const dims = (score.dimensionScores || []).map(d => ({
    dim: d.dim, name: DIMENSION_NAMES[d.dim] || `Dim ${d.dim}`, score: d.score || 0, evidence: d.evidence || "",
  }));
  return {
    id: score.slug || slugify(score.company, score.role),
    role: score.role || "", company: score.company || "",
    division: "", cluster: "", location: score.location || "", workMode: score.workMode || "remote",
    segment, status: score.statusRecommendation || "EXPLORATORY", applicationStatus: "BUILD",
    statusReason: null, boundaryException: null,
    fitBase, fitTarget, fitGap,
    stabilityDiscount: Number(score.stabilityDiscount) || 0,
    fitNet: Number(score.fitNet) || fitBase,
    subScores: score.subScores || { functional: 0, technicalCert: 0, leadershipVocab: 0 },
    dimensionScores: dims,
    ctcMin: Number(ctc.min) || 0, ctcMax: Number(ctc.max) || 0, ctcMidpoint: Number(ctc.midpoint) || 0,
    ctcCurrency: ctc.currency || settings.currency || "INR", ctcConfidence: ctc.confidence || "LOW",
    walkAwayFloor: Number(score.walkAwayFloor) || 0,
    prepMonths: Number(score.prepMonths) || 0, effortTier: score.effortTier || "MODERATE",
    whatItIs: score.whatItIs || "", top3Requirements: score.top3Requirements || "",
    reframeStrategy: score.reframeStrategy || "",
    gaps: Array.isArray(score.gaps) ? score.gaps.join("; ") : (score.gaps || ""),
    certs: Array.isArray(score.certsNeeded) ? score.certsNeeded.join("; ") : (score.certsNeeded || ""),
    psych: score.psych || "",
    starIds: score.suggestedStarIds || [], aiProjects: [], portfolioRelevance: "",
    resumeStatus: "PENDING", resumeVersion: null,
    playbookStatus: playbookBuilt ? "BUILT" : "PENDING", coverNoteStatus: "PENDING",
    stageTracker: { currentStage: playbookBuilt ? "PLAYBOOKED" : "RESEARCHED", lastUpdated: now, history: [{ stage: "RESEARCHED", date: now, note: "Scored via JD Analyzer" }] },
    referrals: [], redTeamFindings: [],
    intakeDate: now, lastScored: now, lastActivity: now,
    jdUrl: "", jdText: jdText || "", notes: score.notes || "",
  };
}

function parseRedTeam(sections) {
  const meta = parseMdKeyValues(sections.RED_TEAM_RESULTS || "");
  const gaps = parseMdList(sections.GAPS_FOUND || "");
  const strengthening = parseMdList(sections.SUGGESTED_STRENGTHENING || "");
  const flags = parseMdList(sections.RED_FLAGS || "");
  const parts = [];
  if (gaps.length) parts.push("GAPS:\n- " + gaps.join("\n- "));
  if (strengthening.length) parts.push("STRENGTHENING:\n- " + strengthening.join("\n- "));
  if (flags.length) parts.push("RED FLAGS:\n- " + flags.join("\n- "));
  return {
    role: meta.role || "",
    source: meta.source || "chatgpt",
    date: meta.date || todayStr(),
    findings: parts.join("\n\n"),
    gaps, strengthening, flags,
  };
}

// ============================================================
// SECTION 6: APP REDUCER
// ============================================================

const initialState = {
  activeZone: "onboard",
  loading: true,
  error: null,
  importModal: { open: false, type: null },
  toast: null,
  importNonce: 0,
  data: {
    profile: DEFAULT_PROFILE,
    stars: DEFAULT_STARS,
    pipeline: DEFAULT_PIPELINE,
    skills: DEFAULT_SKILLS,
    vocab: DEFAULT_VOCAB,
    settings: DEFAULT_SETTINGS,
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_ZONE": return { ...state, activeZone: action.zone };
    case "DATA_LOADED": return { ...state, loading: false, data: action.data };
    case "DATA_UPDATED": return { ...state, data: { ...state.data, [action.key]: action.value } };
    case "BUMP_IMPORT": return { ...state, importNonce: state.importNonce + 1 };
    case "SET_ERROR": return { ...state, error: action.error };
    case "CLEAR_ERROR": return { ...state, error: null };
    case "OPEN_IMPORT": return { ...state, importModal: { open: true, type: action.importType || null } };
    case "CLOSE_IMPORT": return { ...state, importModal: { open: false, type: null } };
    case "SHOW_TOAST": return { ...state, toast: { message: action.message, type: action.toastType || "info" } };
    case "CLEAR_TOAST": return { ...state, toast: null };
    case "SET_LOADING": return { ...state, loading: action.loading };
    default: return state;
  }
}

// ============================================================
// SECTION 7: STATS HELPERS
// ============================================================

function getProfileCompletion(profile) {
  if (!profile?.identity?.name) return 0;
  let filled = 0; const total = 8;
  if (profile.identity.name) filled++;
  if (profile.identity.currentTitle) filled++;
  if (profile.identity.employer) filled++;
  if (profile.achievementStatement) filled++;
  if (profile.education?.length > 0) filled++;
  if (profile.performanceMetrics?.headline?.length > 0) filled++;
  if (profile.psychometrics?.cliftonStrengths?.length > 0) filled++;
  if (profile.careerGoal?.transitionSummary) filled++;
  return Math.round((filled / total) * 100);
}

function getPipelineStats(pipeline) {
  const roles = pipeline?.roles || [];
  return {
    total: roles.length,
    P2: roles.filter(r => r.segment === "P2").length,
    P3A: roles.filter(r => r.segment === "P3A").length,
    P3B: roles.filter(r => r.segment === "P3B").length,
    P3C: roles.filter(r => r.segment === "P3C").length,
    submitted: roles.filter(r => r.applicationStatus === "SUBMITTED").length,
    interviewing: roles.filter(r => r.applicationStatus === "INTERVIEW").length,
  };
}

function getStoryCount(stars) { return stars?.stories?.length || 0; }
function getTrackCount(skills) { return skills?.tracks?.length || 0; }
function getActiveTrackCount(skills) { return skills?.tracks?.filter(t => t.status === "ACTIVE").length || 0; }

// ============================================================
// SECTION 7B: PIPELINE HELPERS
// ============================================================

const PIPELINE_COLUMNS = [
  { id: "watch", label: "Watch", sub: "P3C", kind: "segment", segment: "P3C", accent: "default" },
  { id: "tracking", label: "Tracking", sub: "P3B", kind: "segment", segment: "P3B", accent: "blue", capKey: "P3B" },
  { id: "promotion", label: "Promotion", sub: "P3A", kind: "segment", segment: "P3A", accent: "teal" },
  { id: "active", label: "Active", sub: "P2", kind: "segment", segment: "P2", accent: "amber", capKey: "P2" },
  { id: "submitted", label: "Submitted", kind: "status", status: "SUBMITTED", accent: "blue" },
  { id: "interview", label: "Interview", kind: "status", status: "INTERVIEW", accent: "teal" },
  { id: "complete", label: "Complete", kind: "status", status: "COMPLETE", accent: "green" },
];

function roleColumn(role) {
  const st = role.applicationStatus;
  if (st === "COMPLETE") return "complete";
  if (st === "INTERVIEW") return "interview";
  if (st === "SUBMITTED") return "submitted";
  return ({ P2: "active", P3A: "promotion", P3B: "tracking", P3C: "watch" })[role.segment] || "watch";
}

function slugify(company, role) {
  return [company, role].filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "role-" + Date.now();
}

function computeSegment(fitTarget, fitGap, sc = {}) {
  const a = Number(fitTarget) || 0, g = Number(fitGap) || 0;
  const p3a = sc.P3A || {}, p3b = sc.P3B || {};
  if (a >= (p3a.minAddressable ?? 80) && g <= (p3a.maxGap ?? 10)) return "P3A";
  if (a >= (p3b.minAddressable ?? 70)) return "P3B";
  return "P3C";
}

function getStaleness(role, settings) {
  const ref = role.lastActivity || role.intakeDate || role.lastScored;
  if (!ref) return { stale: false, weeks: 0 };
  const weeks = Math.floor((Date.now() - new Date(ref).getTime()) / (7 * 864e5));
  const sw = settings.stalenessWeeks || {};
  const thr = roleColumn(role) === "submitted" ? sw.P2_submitted : sw[role.segment];
  if (!thr) return { stale: false, weeks };
  return { stale: weeks >= thr, weeks };
}

// Counts only roles that live in a given column (excludes one role by id).
function columnCount(roles, colId, excludeId) {
  return roles.filter(r => r.id !== excludeId && roleColumn(r) === colId).length;
}

// Capacity gate for a target column move. Returns { ok, warn, message }.
function checkCapacity(roles, col, settings, movingId) {
  if (!col.capKey) return { ok: true };
  const caps = settings.capacityCaps || {};
  const cap = caps[col.capKey];
  if (!cap) return { ok: true };
  const next = columnCount(roles, col.id, movingId) + 1;
  if (next <= cap) return { ok: true };
  const overflow = next - cap;
  if (col.capKey === "P2") {
    return { ok: false, message: `Active (P2) is at capacity (${cap}). Demote a lower-fit role before promoting.` };
  }
  // P3B: tolerate small overflow with a flag, block beyond escalation.
  const tol = caps.overflowTolerance ?? 2;
  if (overflow > tol) return { ok: false, message: `Tracking (P3B) overflow of ${overflow} exceeds limit. Kill or promote a role first.` };
  return { ok: true, warn: true, message: `Tracking (P3B) over cap by ${overflow}. Resolve by next weekly refresh.` };
}

function ctcRange(role, settings) {
  const sym = settings.currencySymbol || "₹";
  const unit = settings.currencyUnit || "L";
  if (!role.ctcMin && !role.ctcMax) return null;
  if (role.ctcMin && role.ctcMax) return `${sym}${role.ctcMin}–${role.ctcMax}${unit}`;
  return `${sym}${role.ctcMin || role.ctcMax}${unit}`;
}

function fitVariant(score) {
  const s = Number(score) || 0;
  if (s >= 80) return "green";
  if (s >= 70) return "teal";
  if (s >= 60) return "amber";
  return "default";
}

function makeRole(input, settings) {
  const now = new Date().toISOString();
  const fitBase = Number(input.fitBase) || 0;
  const fitTarget = Number(input.fitTarget) || fitBase;
  const fitGap = Math.max(0, fitTarget - fitBase);
  const segment = input.segment || computeSegment(fitTarget, fitGap, settings.segmentCriteria);
  return {
    id: slugify(input.company, input.role),
    role: input.role || "",
    company: input.company || "",
    division: "", cluster: "",
    location: input.location || "",
    workMode: input.workMode || "remote",
    segment,
    status: "EXPLORATORY",
    applicationStatus: "BUILD",
    statusReason: null,
    boundaryException: null,
    fitBase, fitTarget, fitGap,
    stabilityDiscount: 0,
    fitNet: fitBase,
    subScores: { functional: 0, technicalCert: 0, leadershipVocab: 0 },
    dimensionScores: [],
    ctcMin: Number(input.ctcMin) || 0,
    ctcMax: Number(input.ctcMax) || 0,
    ctcMidpoint: Number(input.ctcMin && input.ctcMax ? (Number(input.ctcMin) + Number(input.ctcMax)) / 2 : 0),
    ctcCurrency: settings.currency || "INR",
    ctcConfidence: "LOW",
    walkAwayFloor: 0,
    prepMonths: 0,
    effortTier: "MODERATE",
    whatItIs: input.whatItIs || "",
    top3Requirements: "",
    reframeStrategy: "",
    gaps: input.gaps || "",
    certs: "",
    psych: "",
    starIds: [],
    aiProjects: [],
    portfolioRelevance: "",
    resumeStatus: "PENDING",
    resumeVersion: null,
    playbookStatus: "PENDING",
    coverNoteStatus: "PENDING",
    stageTracker: { currentStage: "IDENTIFIED", lastUpdated: now, history: [{ stage: "IDENTIFIED", date: now, note: "Added manually" }] },
    referrals: [],
    redTeamFindings: [],
    intakeDate: now,
    lastScored: input.fitBase ? now : null,
    lastActivity: now,
    jdUrl: input.jdUrl || "",
    jdText: input.jdText || "",
    notes: input.notes || "",
  };
}

// ============================================================
// SECTION 8: SHARED UI COMPONENTS
// ============================================================

function Badge({ children, variant = "default" }) {
  const colors = {
    default: "bg-white/10 text-gray-300",
    amber: "bg-amber-500/15 text-amber-400",
    teal: "bg-teal-500/15 text-teal-400",
    red: "bg-red-500/15 text-red-400",
    green: "bg-emerald-500/15 text-emerald-400",
    blue: "bg-blue-500/15 text-blue-400",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[variant]}`}>{children}</span>;
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={14} className="text-gray-600" />}
      </div>
      <div className="text-xl font-semibold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
        <Icon size={24} className="text-gray-500" />
      </div>
      <h3 className="text-sm font-medium text-gray-300 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-xs mb-4">{description}</p>
      {action && (
        <button onClick={onAction} className="px-3 py-1.5 bg-amber-500/15 text-amber-400 rounded text-xs font-medium hover:bg-amber-500/25 transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}

function Toast({ message, type, onDismiss }) {
  const colors = { info: "border-blue-500/30 bg-blue-500/10", success: "border-emerald-500/30 bg-emerald-500/10", error: "border-red-500/30 bg-red-500/10" };
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg border ${colors[type] || colors.info} text-sm text-gray-200 shadow-lg max-w-xs text-center`}>
      {message}
    </div>
  );
}

// --- Form primitives (used by the onboarding wizard) ---

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      {label && <span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span>}
      <input
        type={type}
        value={value ?? ""}
        onChange={e => onChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
        placeholder={placeholder}
        className={`${label ? "mt-1 " : ""}w-full bg-black/30 rounded-lg px-3 py-2 text-sm text-white border border-white/5 focus:border-amber-500/30 focus:outline-none`}
      />
    </label>
  );
}

function Area({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="block">
      {label && <span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span>}
      <textarea
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${label ? "mt-1 " : ""}w-full bg-black/30 rounded-lg px-3 py-2 text-sm text-gray-200 border border-white/5 focus:border-amber-500/30 focus:outline-none resize-none leading-relaxed`}
      />
    </label>
  );
}

// Comma-separated array editor. Keeps its own text state so commas type naturally;
// remount (via key) reseeds from value after an import.
function TagField({ label, value, onChange, placeholder }) {
  const [txt, setTxt] = useState((value || []).join(", "));
  return (
    <label className="block">
      {label && <span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span>}
      <input
        value={txt}
        onChange={e => { setTxt(e.target.value); onChange(splitComma(e.target.value)); }}
        placeholder={placeholder}
        className={`${label ? "mt-1 " : ""}w-full bg-black/30 rounded-lg px-3 py-2 text-sm text-white border border-white/5 focus:border-amber-500/30 focus:outline-none`}
      />
      {(value || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {value.map((v, i) => <Badge key={i} variant="teal">{v}</Badge>)}
        </div>
      )}
    </label>
  );
}

// Generic list-of-records editor with controlled text/number inputs.
function RecordList({ items, fields, onChange, blank, addLabel = "Add" }) {
  const list = items || [];
  const update = (i, key, val) => onChange(list.map((it, idx) => idx === i ? { ...it, [key]: val } : it));
  const remove = i => onChange(list.filter((_, idx) => idx !== i));
  const add = () => onChange([...list, { ...blank }]);
  return (
    <div className="space-y-2">
      {list.map((it, i) => (
        <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {fields.map(f => (
              <div key={f.key} className={f.full ? "col-span-2" : ""}>
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={it[f.key] ?? ""}
                  onChange={e => update(i, f.key, f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-black/30 rounded px-2.5 py-1.5 text-xs text-white border border-white/5 focus:border-amber-500/30 focus:outline-none"
                />
              </div>
            ))}
          </div>
          <button onClick={() => remove(i)} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 size={11} /> Remove
          </button>
        </div>
      ))}
      <button onClick={add} className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors">
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

// Offload prompt preview + copy + import (Gemini Voice / ChatGPT handoff)
function PromptPanel({ promptId, dispatch }) {
  const p = OFFLOAD_PROMPTS[promptId];
  const [copied, setCopied] = useState(false);
  if (!p) return null;
  const text = buildPrompt(p.template, { today: todayStr() });
  const doCopy = async () => { const ok = await copyToClipboard(text); setCopied(true); setTimeout(() => setCopied(false), 2000); if (!ok) dispatch({ type: "SHOW_TOAST", message: "Copy failed — select & copy manually", toastType: "error" }); };
  return (
    <div className="rounded-lg bg-white/5 border border-white/5 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <Sparkles size={14} className="text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-200 truncate">{p.title}</div>
          <div className="text-[10px] text-gray-500">Recommended: {p.tool}</div>
        </div>
      </div>
      <pre className="px-3 py-2 max-h-40 overflow-auto text-[10px] leading-relaxed text-gray-400 whitespace-pre-wrap" style={{ fontFamily: "ui-monospace, monospace" }}>{text}</pre>
      <div className="flex gap-2 p-2 border-t border-white/5">
        <button onClick={doCopy} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors">
          {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied" : "Copy Prompt"}
        </button>
        <button onClick={() => dispatch({ type: "OPEN_IMPORT" })} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
          <Upload size={12} /> Import .md
        </button>
      </div>
      {p.tip && <div className="px-3 pb-2 text-[10px] text-gray-600 leading-relaxed">{p.tip}</div>}
    </div>
  );
}

// Dynamic prompt panel for runtime-built prompts (OP-03/04/05/06).
function RawPromptPanel({ title, tool, text, dispatch, allowImport, tip, icon: Icon = Sparkles }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => { const ok = await copyToClipboard(text); setCopied(true); setTimeout(() => setCopied(false), 2000); if (!ok) dispatch({ type: "SHOW_TOAST", message: "Copy failed — select & copy manually", toastType: "error" }); };
  return (
    <div className="rounded-lg bg-white/5 border border-white/5 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <Icon size={14} className="text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-200 truncate">{title}</div>
          {tool && <div className="text-[10px] text-gray-500">Recommended: {tool}</div>}
        </div>
      </div>
      <pre className="px-3 py-2 max-h-40 overflow-auto text-[10px] leading-relaxed text-gray-400 whitespace-pre-wrap" style={{ fontFamily: "ui-monospace, monospace" }}>{text}</pre>
      <div className="flex gap-2 p-2 border-t border-white/5">
        <button onClick={doCopy} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors">
          {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied" : "Copy Prompt"}
        </button>
        {allowImport && (
          <button onClick={() => dispatch({ type: "OPEN_IMPORT" })} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
            <Upload size={12} /> Import .md
          </button>
        )}
      </div>
      {tip && <div className="px-3 pb-2 text-[10px] text-gray-600 leading-relaxed">{tip}</div>}
    </div>
  );
}

// ============================================================
// SECTION 9: IMPORT MODAL
// ============================================================

function ImportModal({ open, onClose, onImport }) {
  const [text, setText] = useState("");
  const [detected, setDetected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!text.trim()) { setDetected(null); setError(null); return; }
    const parsed = parseImportedMd(text);
    if (parsed.metadata) {
      const importType = MD_IMPORT_TYPES.find(t => t.type === parsed.metadata.type);
      setDetected(importType || null);
      setError(importType ? null : `Unknown import type: ${parsed.metadata.type}`);
    } else {
      setDetected(null);
      setError("No COS_IMPORT metadata found. Paste .md output from an AI tool.");
    }
  }, [text]);

  if (!open) return null;

  const handleImport = () => {
    if (!detected) return;
    onImport(text, detected);
    setText("");
    setDetected(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-end justify-center" onClick={onClose}>
      <div className="bg-gray-900 rounded-t-xl w-full max-w-lg max-h-[80vh] flex flex-col border-t border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          <h3 className="text-sm font-medium text-white">Import .md</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-300"><X size={16} /></button>
        </div>

        <div className="p-3 flex-1 overflow-auto">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your .md output from Gemini, ChatGPT, or another AI tool..."
            className="w-full h-40 bg-black/30 rounded-lg p-3 text-xs text-gray-300 font-mono border border-white/5 focus:border-amber-500/30 focus:outline-none resize-none"
          />

          {detected && (
            <div className="mt-2 flex items-center gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
              <Check size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-300">Detected: {detected.label} (Zone {detected.zone})</span>
            </div>
          )}
          {error && (
            <div className="mt-2 flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-xs text-red-300">{error}</span>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-white/5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-xs text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
          <button
            onClick={handleImport}
            disabled={!detected}
            className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
          >
            Import {detected?.label || ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 10: ZONE 1 — ONBOARDING WIZARD
// ============================================================

const ONBOARD_STEPS = [
  { id: "facts", label: "Career Facts", icon: Briefcase },
  { id: "org", label: "Org Structure", icon: Users },
  { id: "metrics", label: "Key Metrics", icon: BarChart3 },
  { id: "stories", label: "STAR Stories", icon: BookOpen },
  { id: "psych", label: "Psychometrics", icon: Brain },
  { id: "vocab", label: "Vocabulary", icon: ListChecks },
  { id: "targets", label: "Targets", icon: Target },
];

function WizardProgress({ step }) {
  const total = ONBOARD_STEPS.length;
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-300">{ONBOARD_STEPS[step].label}</span>
        <span className="text-[11px] text-gray-500">Step {step + 1} of {total} · {pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-1">
        {ONBOARD_STEPS.map((s, i) => (
          <div key={s.id} className={`flex-1 h-1 rounded-full ${i <= step ? "bg-amber-400/60" : "bg-white/5"}`} />
        ))}
      </div>
    </div>
  );
}

function StepHeader({ title, hint }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {hint && <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

function ZoneOnboard({ data, dispatch, importNonce }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(() => ({ profile: data.profile, stars: data.stars, vocab: data.vocab }));

  // Reseed local draft from storage after an import (nonce bumps).
  useEffect(() => {
    setDraft({ profile: data.profile, stars: data.stars, vocab: data.vocab });
  }, [importNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  const profile = draft.profile;
  const identity = profile.identity || {};
  const org = profile.orgStructure || {};
  const goal = profile.careerGoal || {};
  const psych = profile.psychometrics || { disc: {} };
  const rules = profile.resumeRules || {};
  const stories = draft.stars.stories || [];

  const setIdentity = patch => setDraft(d => ({ ...d, profile: { ...d.profile, identity: { ...d.profile.identity, ...patch } } }));
  const setOrg = patch => setDraft(d => ({ ...d, profile: { ...d.profile, orgStructure: { ...d.profile.orgStructure, ...patch } } }));
  const setGoal = patch => setDraft(d => ({ ...d, profile: { ...d.profile, careerGoal: { ...d.profile.careerGoal, ...patch } } }));
  const setProfileField = patch => setDraft(d => ({ ...d, profile: { ...d.profile, ...patch } }));
  const setPsych = patch => setDraft(d => ({ ...d, profile: { ...d.profile, psychometrics: { ...d.profile.psychometrics, ...patch } } }));
  const setRules = patch => setDraft(d => ({ ...d, profile: { ...d.profile, resumeRules: { ...d.profile.resumeRules, ...patch } } }));
  const setStories = next => setDraft(d => ({ ...d, stars: { ...d.stars, stories: next } }));
  const setVocab = patch => setDraft(d => ({ ...d, vocab: { ...d.vocab, ...patch } }));

  const persist = useCallback(async (partial) => {
    for (const key of Object.keys(partial)) {
      const value = { ...partial[key], lastUpdated: new Date().toISOString() };
      await saveData(key, partial[key]);
      dispatch({ type: "DATA_UPDATED", key, value });
    }
  }, [dispatch]);

  const commitDraft = useCallback(async () => {
    await persist({ profile: draft.profile, stars: draft.stars, vocab: draft.vocab });
  }, [persist, draft]);

  const goNext = async () => { setSaving(true); await commitDraft(); setSaving(false); setStep(s => Math.min(s + 1, ONBOARD_STEPS.length - 1)); };
  const goBack = async () => { setSaving(true); await commitDraft(); setSaving(false); setStep(s => Math.max(s - 1, 0)); };

  const finish = async () => {
    setSaving(true);
    await commitDraft();
    await persist({ settings: { ...data.settings, onboardingComplete: true } });
    setSaving(false);
    dispatch({ type: "SHOW_TOAST", message: "Onboarding saved ✓", toastType: "success" });
  };

  const completion = getProfileCompletion(profile);
  const cur = ONBOARD_STEPS[step].id;

  const renderStep = () => {
    switch (cur) {
      case "facts":
        return (
          <div className="space-y-3">
            <StepHeader title="Career Facts" hint="Who you are and where you're heading. Talk it through with Gemini Voice, or type it in." />
            <PromptPanel promptId="OP-01" dispatch={dispatch} />
            <div className="space-y-3">
              <Field label="Full Name" value={identity.name} onChange={v => setIdentity({ name: v })} placeholder="Jane Smith" />
              <Field label="Current Title" value={identity.currentTitle} onChange={v => setIdentity({ currentTitle: v })} placeholder="Senior Manager, Revenue Operations" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Employer" value={identity.employer} onChange={v => setIdentity({ employer: v })} placeholder="Acme Corp" />
                <Field label="Tenure Start" value={identity.tenureStart} onChange={v => setIdentity({ tenureStart: v })} placeholder="2019-06" />
              </div>
              <Field label="Employer Description" value={identity.employerDescription} onChange={v => setIdentity({ employerDescription: v })} placeholder="$2B global logistics company" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Location" value={identity.location} onChange={v => setIdentity({ location: v })} placeholder="Mumbai, India" />
                <Field label="Email" value={identity.email} onChange={v => setIdentity({ email: v })} placeholder="jane@email.com" />
              </div>
              <Field label="LinkedIn" value={identity.linkedin} onChange={v => setIdentity({ linkedin: v })} placeholder="linkedin.com/in/janesmith" />
              <Area label="Transition Summary" value={goal.transitionSummary} onChange={v => setGoal({ transitionSummary: v })} placeholder="Moving from revenue ops into product management at tech companies" />
              <Area label="Core Reframe (elevator pitch)" value={goal.coreReframe} onChange={v => setGoal({ coreReframe: v })} placeholder="I've been doing product management for 5 years — I just haven't been calling it that" />
              <Area label="AI Differentiator" value={goal.aiDifferentiator} onChange={v => setGoal({ aiDifferentiator: v })} placeholder="Built an 8-project automation portfolio that cut manual ops 60%" />
            </div>
          </div>
        );

      case "org":
        return (
          <div className="space-y-3">
            <StepHeader title="Org Structure" hint="Your reporting line, team, and peers — proof of scale and altitude." />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Total Headcount" type="number" value={org.totalHeadcount} onChange={v => setOrg({ totalHeadcount: v })} placeholder="45" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Reports To (Name)" value={identity.reportsTo?.name} onChange={v => setIdentity({ reportsTo: { ...identity.reportsTo, name: v } })} placeholder="Sarah Chen" />
              <Field label="Reports To (Title)" value={identity.reportsTo?.title} onChange={v => setIdentity({ reportsTo: { ...identity.reportsTo, title: v } })} placeholder="VP Revenue" />
            </div>
            <div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Direct Reports</div>
              <RecordList
                items={org.directReports}
                onChange={dr => setOrg({ directReports: dr })}
                blank={{ name: "", title: "", teamSize: 0, location: "", note: "" }}
                addLabel="Add Direct Report"
                fields={[
                  { key: "name", placeholder: "Name" },
                  { key: "title", placeholder: "Title" },
                  { key: "teamSize", placeholder: "Team size", type: "number" },
                  { key: "location", placeholder: "Location" },
                ]}
              />
            </div>
            <div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Peers</div>
              <RecordList
                items={org.peers}
                onChange={p => setOrg({ peers: p })}
                blank={{ name: "", title: "", note: "" }}
                addLabel="Add Peer"
                fields={[
                  { key: "name", placeholder: "Name" },
                  { key: "title", placeholder: "Title" },
                ]}
              />
            </div>
          </div>
        );

      case "metrics":
        return (
          <div className="space-y-3">
            <StepHeader title="Key Metrics" hint="The headline numbers and process wins that anchor every application." />
            <Area label="Achievement Statement" rows={4} value={profile.achievementStatement} onChange={v => setProfileField({ achievementStatement: v })} placeholder="Scaled revenue operations 8x ($50M → $400M ARR) while cutting bad debt 45%..." />
            <div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Headline Metrics</div>
              <RecordList
                items={profile.performanceMetrics?.headline}
                onChange={h => setProfileField({ performanceMetrics: { ...profile.performanceMetrics, headline: h } })}
                blank={{ label: "", value: "", context: "", source: "STATED" }}
                addLabel="Add Headline Metric"
                fields={[
                  { key: "label", placeholder: "8x revenue scale", full: true },
                  { key: "value", placeholder: "$50M → $400M" },
                  { key: "context", placeholder: "2019–2025" },
                ]}
              />
            </div>
            <div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Operational Metrics (before → after)</div>
              <RecordList
                items={profile.operationalMetrics}
                onChange={om => setProfileField({ operationalMetrics: om })}
                blank={{ name: "", before: "", after: "", reduction: "", context: "" }}
                addLabel="Add Operational Metric"
                fields={[
                  { key: "name", placeholder: "Invoice processing TAT", full: true },
                  { key: "before", placeholder: "Before (15 days)" },
                  { key: "after", placeholder: "After (3 days)" },
                  { key: "reduction", placeholder: "Improvement (80%)", full: true },
                ]}
              />
            </div>
          </div>
        );

      case "stories":
        return (
          <div className="space-y-3">
            <StepHeader title="STAR Story Builder" hint="Behavioral stories in Situation–Task–Action–Result form. Build by voice or add manually." />
            <PromptPanel promptId="OP-02" dispatch={dispatch} />
            <StoryBuilder stories={stories} categoryEnum={draft.stars.categoryEnum} onChange={setStories} />
          </div>
        );

      case "psych":
        return (
          <div className="space-y-3">
            <StepHeader title="Psychometric Self-Assessment" hint="Your strengths profile — used to frame fit and answer 'weakness' questions." />
            <TagField label="CliftonStrengths" value={psych.cliftonStrengths} onChange={v => setPsych({ cliftonStrengths: v })} placeholder="Achiever, Analytical, Strategic, Relator" />
            <div className="grid grid-cols-2 gap-2">
              <TagField label="DISC — High" value={psych.disc?.high} onChange={v => setPsych({ disc: { ...psych.disc, high: v } })} placeholder="C, D" />
              <TagField label="DISC — Low" value={psych.disc?.low} onChange={v => setPsych({ disc: { ...psych.disc, low: v } })} placeholder="I, S" />
            </div>
            <TagField label="Strengths" value={psych.strengths} onChange={v => setPsych({ strengths: v })} placeholder="Data-driven, structured executor, builds trust" />
            <TagField label="Development Areas" value={psych.developmentAreas} onChange={v => setPsych({ developmentAreas: v })} placeholder="Delegation under pressure, public speaking" />
          </div>
        );

      case "vocab":
        return (
          <div className="space-y-3">
            <StepHeader title="Vocabulary Reframe Table" hint="Map your internal jargon to market language. Applied across resumes, playbooks, and mocks." />
            <div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Mandatory Reframes (your term → market term)</div>
              <RecordList
                items={draft.vocab.mandatoryReframes}
                onChange={mr => setVocab({ mandatoryReframes: mr })}
                blank={{ source: "", target: "", note: "" }}
                addLabel="Add Reframe"
                fields={[
                  { key: "source", placeholder: "collections" },
                  { key: "target", placeholder: "revenue operations" },
                ]}
              />
            </div>
            <TagField label="Never Include on Resume" value={rules.neverInclude} onChange={v => setRules({ neverInclude: v })} placeholder="WhatsApp Business, salary figures" />
          </div>
        );

      case "targets":
        return (
          <div className="space-y-3">
            <StepHeader title="Target Preferences" hint="The roles, industries, and locations your pipeline and scoring will optimize for." />
            <TagField label="Target Functions" value={goal.targetFunctions} onChange={v => setGoal({ targetFunctions: v })} placeholder="Product Management, Business Operations" />
            <TagField label="Target Industries" value={goal.targetIndustries} onChange={v => setGoal({ targetIndustries: v })} placeholder="FinTech, SaaS, Enterprise Tech" />
            <Field label="Target Location" value={identity.targetLocation} onChange={v => setIdentity({ targetLocation: v })} placeholder="Bangalore, India" />
            <div className="mt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Check size={14} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">Ready to finish</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">Save your onboarding to unlock JD scoring and pipeline tracking. You can return and edit any time.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isLast = step === ONBOARD_STEPS.length - 1;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Onboarding</h2>
          <p className="text-xs text-gray-500 mt-0.5">Build your career data foundation</p>
        </div>
        <div className="flex items-center gap-2">
          {data.settings.onboardingComplete && <Badge variant="green">Complete</Badge>}
          <div className="text-right">
            <div className="text-sm font-semibold text-amber-400">{completion}%</div>
            <div className="text-[10px] text-gray-600">profile</div>
          </div>
        </div>
      </div>

      <WizardProgress step={step} />

      {/* Step tab strip */}
      <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {ONBOARD_STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={async () => { setSaving(true); await commitDraft(); setSaving(false); setStep(i); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${i === step ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}
            >
              <Icon size={13} />
              <span className="text-[11px] font-medium">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div key={`${cur}-${importNonce}`} className="pt-1">
        {renderStep()}
      </div>

      {/* Footer nav */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={goBack}
          disabled={step === 0 || saving}
          className="flex items-center gap-1 px-3 py-2 text-xs text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <div className="flex-1 text-center text-[10px] text-gray-600">{saving ? "Saving…" : "Auto-saved on navigation"}</div>
        {isLast ? (
          <button onClick={finish} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-300 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
            <Check size={14} /> Finish
          </button>
        ) : (
          <button onClick={goNext} disabled={saving} className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-amber-400 bg-amber-500/15 rounded-lg hover:bg-amber-500/25 transition-colors disabled:opacity-50">
            Next <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function nextStoryId(stories) {
  let max = 0;
  for (const s of stories || []) { const m = /^S(\d+)$/.exec(s.storyId || ""); if (m) max = Math.max(max, parseInt(m[1])); }
  return "S" + (max + 1);
}

function StoryBuilder({ stories, categoryEnum, onChange }) {
  const [openId, setOpenId] = useState(null);

  const update = (id, patch) => onChange(stories.map(s => s.storyId === id ? { ...s, ...patch } : s));
  const remove = id => onChange(stories.filter(s => s.storyId !== id));
  const add = () => {
    const id = nextStoryId(stories);
    onChange([...stories, {
      storyId: id, title: "", category: categoryEnum?.[2] || "TRANSFORMATION", starRating: 2, status: "DRAFT",
      situation: "", task: "", action: "", result: "", metrics: [], sourceLabels: {},
      applicableRoleIds: [], rolesTested: [], lastRehearsed: null, rehearsalCount: 0,
      lastReframed: null, reframeOf: null, interviewNotes: "", deploymentTips: "",
    }]);
    setOpenId(id);
  };

  return (
    <div className="space-y-2">
      {stories.length === 0 && (
        <div className="text-center py-6 text-xs text-gray-600 bg-white/5 rounded-lg border border-white/5">
          No stories yet. Add one manually or import from Gemini Voice above.
        </div>
      )}
      {stories.map(s => {
        const open = openId === s.storyId;
        return (
          <div key={s.storyId} className="rounded-lg bg-white/5 border border-white/5 overflow-hidden">
            <button onClick={() => setOpenId(open ? null : s.storyId)} className="w-full flex items-center gap-2 p-2.5 text-left">
              <span className="text-[10px] font-mono text-amber-400 shrink-0">{s.storyId}</span>
              <span className="flex-1 min-w-0 text-xs text-gray-200 truncate">{s.title || "Untitled story"}</span>
              <span className="text-[9px] text-teal-400 shrink-0">{"★".repeat(s.starRating || 0)}</span>
              <Badge variant="default">{(s.category || "").replace(/_/g, " ").toLowerCase()}</Badge>
              <ChevronRight size={14} className={`text-gray-600 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
            </button>
            {open && (
              <div className="p-2.5 pt-0 space-y-2 border-t border-white/5">
                <Field label="Title" value={s.title} onChange={v => update(s.storyId, { title: v })} placeholder="Invoice Processing TAT Reduction" />
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider">Category</span>
                    <select value={s.category} onChange={e => update(s.storyId, { category: e.target.value })} className="mt-1 w-full bg-black/30 rounded-lg px-2.5 py-2 text-xs text-white border border-white/5 focus:border-amber-500/30 focus:outline-none">
                      {(categoryEnum || []).map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider">Star Rating</span>
                    <select value={s.starRating} onChange={e => update(s.storyId, { starRating: parseInt(e.target.value) })} className="mt-1 w-full bg-black/30 rounded-lg px-2.5 py-2 text-xs text-white border border-white/5 focus:border-amber-500/30 focus:outline-none">
                      <option value={3}>★★★ Strongest</option>
                      <option value={2}>★★ Solid</option>
                      <option value={1}>★ Supporting</option>
                    </select>
                  </label>
                </div>
                <Area label="Situation" value={s.situation} onChange={v => update(s.storyId, { situation: v })} placeholder="Business context and problem" />
                <Area label="Task" value={s.task} onChange={v => update(s.storyId, { task: v })} placeholder="What you were accountable for" />
                <Area label="Action" value={s.action} onChange={v => update(s.storyId, { action: v })} placeholder="Specific steps you took" rows={4} />
                <Area label="Result" value={s.result} onChange={v => update(s.storyId, { result: v })} placeholder="Quantified outcomes with numbers" />
                <TagField label="Metrics" value={s.metrics} onChange={v => update(s.storyId, { metrics: v })} placeholder="15→3 days, 80% reduction" />
                <Area label="Interview Notes" value={s.interviewNotes} onChange={v => update(s.storyId, { interviewNotes: v })} placeholder="Lead with the 80% number" rows={2} />
                <button onClick={() => remove(s.storyId)} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={11} /> Delete story
                </button>
              </div>
            )}
          </div>
        );
      })}
      <button onClick={add} className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors">
        <Plus size={13} /> Add Story
      </button>
    </div>
  );
}

function ArtifactDots({ role }) {
  const dot = status => {
    const c = status === "BUILT" ? "bg-emerald-400" : status === "DEFERRED" ? "bg-amber-400" : "bg-gray-700";
    return <span className={`w-1.5 h-1.5 rounded-full ${c}`} />;
  };
  return (
    <div className="flex items-center gap-1" title="Resume · Playbook · Cover note">
      {dot(role.resumeStatus)}{dot(role.playbookStatus)}{dot(role.coverNoteStatus)}
    </div>
  );
}

function RoleCard({ role, settings, onOpen }) {
  const fit = role.fitNet || role.fitBase || 0;
  const target = role.fitTarget || fit;
  const ctc = ctcRange(role, settings);
  const { stale, weeks } = getStaleness(role, settings);
  return (
    <button onClick={onOpen} className="w-full text-left p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors space-y-1.5">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-200 truncate">{role.role || "Untitled role"}</div>
          <div className="text-[10px] text-gray-500 truncate">{role.company}</div>
        </div>
        <Badge variant={fitVariant(target)}>{target}{target !== fit ? <span className="opacity-60"> ←{fit}</span> : null}</Badge>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {ctc && <span className="text-[10px] text-gray-400">{ctc}</span>}
        {role.fitGap > 0 && <span className="text-[10px] text-gray-500">gap +{role.fitGap}</span>}
        <ArtifactDots role={role} />
        {stale && (
          <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
            <Clock size={9} /> {weeks}w
          </span>
        )}
      </div>
    </button>
  );
}

function AddRoleSheet({ open, onClose, onAdd, settings }) {
  const blank = { role: "", company: "", location: "", workMode: "remote", ctcMin: "", ctcMax: "", fitBase: "", fitTarget: "", gaps: "", jdUrl: "", notes: "" };
  const [form, setForm] = useState(blank);
  useEffect(() => { if (open) setForm(blank); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;
  const set = patch => setForm(f => ({ ...f, ...patch }));
  const seg = computeSegment(form.fitTarget || form.fitBase, Math.max(0, (Number(form.fitTarget) || 0) - (Number(form.fitBase) || 0)), settings.segmentCriteria);
  const submit = () => {
    if (!form.role && !form.company) { onClose(); return; }
    onAdd(makeRole(form, settings));
    onClose();
  };
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-end justify-center" onClick={onClose}>
      <div className="bg-gray-900 rounded-t-xl w-full max-w-lg max-h-[85vh] flex flex-col border-t border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          <h3 className="text-sm font-medium text-white">Add Role</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-300"><X size={16} /></button>
        </div>
        <div className="p-3 flex-1 overflow-auto space-y-3">
          <Field label="Role Title" value={form.role} onChange={v => set({ role: v })} placeholder="Senior Product Manager" />
          <Field label="Company" value={form.company} onChange={v => set({ company: v })} placeholder="Acme Corp" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Location" value={form.location} onChange={v => set({ location: v })} placeholder="Bangalore" />
            <label className="block">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">Work Mode</span>
              <select value={form.workMode} onChange={e => set({ workMode: e.target.value })} className="mt-1 w-full bg-black/30 rounded-lg px-2.5 py-2 text-sm text-white border border-white/5 focus:border-amber-500/30 focus:outline-none">
                <option value="remote">remote</option>
                <option value="hybrid">hybrid</option>
                <option value="onsite">onsite</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={`CTC Min (${settings.currencyUnit || "L"})`} type="number" value={form.ctcMin} onChange={v => set({ ctcMin: v })} placeholder="36" />
            <Field label={`CTC Max (${settings.currencyUnit || "L"})`} type="number" value={form.ctcMax} onChange={v => set({ ctcMax: v })} placeholder="65" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Base Fit" type="number" value={form.fitBase} onChange={v => set({ fitBase: v })} placeholder="72" />
            <Field label="Addressable Fit" type="number" value={form.fitTarget} onChange={v => set({ fitTarget: v })} placeholder="84" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span>Auto segment:</span>
            <Badge variant={seg === "P3A" ? "teal" : seg === "P3B" ? "blue" : "default"}>{seg}</Badge>
          </div>
          <Area label="Key Gaps" value={form.gaps} onChange={v => set({ gaps: v })} placeholder="No direct payments domain experience..." rows={2} />
          <Field label="JD URL" value={form.jdUrl} onChange={v => set({ jdUrl: v })} placeholder="https://..." />
          <Area label="Notes" value={form.notes} onChange={v => set({ notes: v })} placeholder="Referral via..." rows={2} />
        </div>
        <div className="p-3 border-t border-white/5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-xs text-gray-400 bg-white/5 rounded-lg hover:bg-white/10">Cancel</button>
          <button onClick={submit} className="flex-1 py-2 text-xs font-medium rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25">Add to Pipeline</button>
        </div>
      </div>
    </div>
  );
}

function RoleDrawer({ role, data, settings, onMove, onUpdate, onDelete, onClose }) {
  const [confirmDel, setConfirmDel] = useState(false);
  if (!role) return null;
  const ctc = ctcRange(role, settings);
  const { stale, weeks } = getStaleness(role, settings);
  const curCol = roleColumn(role);
  const linkedStories = (role.starIds || []).map(id => (data.stars.stories || []).find(s => s.storyId === id)).filter(Boolean);

  const cycleArtifact = (key) => {
    const order = ["PENDING", "BUILT", "DEFERRED"];
    const next = order[(order.indexOf(role[key]) + 1) % order.length];
    onUpdate(role.id, { [key]: next });
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-end justify-center" onClick={onClose}>
      <div className="bg-gray-900 rounded-t-xl w-full max-w-lg max-h-[88vh] flex flex-col border-t border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-3 border-b border-white/5">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{role.role || "Untitled role"}</div>
            <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
              {role.company && <span className="inline-flex items-center gap-1"><Building2 size={11} />{role.company}</span>}
              {role.location && <span className="inline-flex items-center gap-1"><MapPin size={11} />{role.location}</span>}
              {role.workMode && <Badge>{role.workMode}</Badge>}
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-300 shrink-0"><X size={16} /></button>
        </div>

        <div className="p-3 flex-1 overflow-auto space-y-4">
          {/* Scores */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Base Fit" value={role.fitBase || 0} />
            <StatCard label="Addressable" value={role.fitTarget || role.fitBase || 0} sub={role.fitGap ? `gap +${role.fitGap}` : null} />
            <StatCard label="CTC" value={ctc || "—"} />
          </div>

          {stale && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
              <AlertTriangle size={13} /> Stale — {weeks} weeks since last activity. {roleColumn(role) === "submitted" ? "Follow up or demote." : "Time to rescore."}
            </div>
          )}

          {/* Move between columns */}
          <div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Stage · Move</div>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_COLUMNS.map(c => (
                <button
                  key={c.id}
                  onClick={() => onMove(role, c.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${c.id === curCol ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                >
                  {c.label}{c.sub ? <span className="opacity-50"> ·{c.sub}</span> : null}
                </button>
              ))}
            </div>
          </div>

          {/* Artifacts */}
          <div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Artifacts (tap to cycle)</div>
            <div className="grid grid-cols-3 gap-2">
              {[["resumeStatus", "Resume"], ["playbookStatus", "Playbook"], ["coverNoteStatus", "Cover Note"]].map(([k, lbl]) => (
                <button key={k} onClick={() => cycleArtifact(k)} className="p-2 rounded-lg bg-white/5 border border-white/5 text-center hover:border-white/10">
                  <div className="text-[10px] text-gray-500">{lbl}</div>
                  <Badge variant={role[k] === "BUILT" ? "green" : role[k] === "DEFERRED" ? "amber" : "default"}>{role[k] || "PENDING"}</Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Linked stories */}
          <div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Linked Stories ({linkedStories.length})</div>
            {linkedStories.length === 0 ? (
              <div className="text-[11px] text-gray-600">No stories linked yet.</div>
            ) : (
              <div className="space-y-1">
                {linkedStories.map(s => (
                  <div key={s.storyId} className="flex items-center gap-2 p-1.5 rounded bg-white/5 text-[11px]">
                    <span className="font-mono text-amber-400">{s.storyId}</span>
                    <span className="text-gray-300 truncate flex-1">{s.title}</span>
                    <span className="text-teal-400 text-[9px]">{"★".repeat(s.starRating || 0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Red team findings */}
          {(role.redTeamFindings || []).length > 0 && (
            <div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Red Team Findings ({role.redTeamFindings.length})</div>
              <div className="space-y-1.5">
                {role.redTeamFindings.map((f, i) => (
                  <div key={i} className="p-2 rounded-lg bg-red-500/5 border border-red-500/15">
                    <div className="flex items-center gap-2 mb-1 text-[10px] text-gray-500">
                      <span className="text-red-400">{f.source}</span><span>{(f.date || "").slice(0, 10)}</span>
                      {f.addressed && <Badge variant="green">addressed</Badge>}
                    </div>
                    <pre className="text-[10px] text-gray-400 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "inherit" }}>{f.findings}</pre>
                    <button onClick={() => onUpdate(role.id, { redTeamFindings: role.redTeamFindings.map((x, j) => j === i ? { ...x, addressed: !x.addressed } : x) })}
                      className="mt-1 text-[10px] text-gray-500 hover:text-emerald-400">{f.addressed ? "Mark unaddressed" : "Mark addressed"}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editable details */}
          <div className="space-y-2">
            <Area label="What it is" value={role.whatItIs} onChange={v => onUpdate(role.id, { whatItIs: v })} rows={2} placeholder="One-line description of the role" />
            <Area label="Gaps" value={role.gaps} onChange={v => onUpdate(role.id, { gaps: v })} rows={2} placeholder="Capability gaps to close" />
            <Area label="Notes" value={role.notes} onChange={v => onUpdate(role.id, { notes: v })} rows={2} placeholder="Referrals, context, reminders" />
          </div>

          {/* Stage history */}
          <div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Stage History</div>
            <div className="space-y-1">
              {(role.stageTracker?.history || []).slice().reverse().map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400/60 shrink-0" />
                  <span className="text-gray-300">{h.stage}</span>
                  <span className="text-gray-600 ml-auto">{(h.date || "").slice(0, 10)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delete */}
          {!confirmDel ? (
            <button onClick={() => setConfirmDel(true)} className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-red-400">
              <Trash2 size={12} /> Remove role
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setConfirmDel(false)} className="flex-1 py-1.5 text-xs bg-white/5 rounded text-gray-400">Cancel</button>
              <button onClick={() => onDelete(role.id)} className="flex-1 py-1.5 text-xs bg-red-500/20 rounded text-red-300">Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ZonePipeline({ data, dispatch }) {
  const roles = data.pipeline.roles || [];
  const settings = data.settings;
  const [addOpen, setAddOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const openRole = roles.find(r => r.id === openId) || null;

  const saveRoles = useCallback(async (nextRoles) => {
    const next = { ...data.pipeline, roles: nextRoles };
    await saveData("pipeline", next);
    dispatch({ type: "DATA_UPDATED", key: "pipeline", value: { ...next, lastUpdated: new Date().toISOString() } });
  }, [data.pipeline, dispatch]);

  const addRole = (role) => {
    if (roles.some(r => r.id === role.id)) role.id = role.id + "-" + Date.now().toString(36);
    saveRoles([...roles, role]);
    dispatch({ type: "SHOW_TOAST", message: `Added ${role.role || "role"} → ${role.segment}`, toastType: "success" });
  };

  const updateRole = (id, patch) => {
    saveRoles(roles.map(r => r.id === id ? { ...r, ...patch, lastActivity: new Date().toISOString() } : r));
  };

  const deleteRole = (id) => {
    saveRoles(roles.filter(r => r.id !== id));
    setOpenId(null);
    dispatch({ type: "SHOW_TOAST", message: "Role removed", toastType: "info" });
  };

  const moveRole = (role, targetColId) => {
    if (roleColumn(role) === targetColId) return;
    const col = PIPELINE_COLUMNS.find(c => c.id === targetColId);
    const cap = checkCapacity(roles, col, settings, role.id);
    if (!cap.ok) { dispatch({ type: "SHOW_TOAST", message: cap.message, toastType: "error" }); return; }
    if (cap.warn) dispatch({ type: "SHOW_TOAST", message: cap.message, toastType: "info" });

    const now = new Date().toISOString();
    const patch = { lastActivity: now };
    if (col.kind === "segment") { patch.segment = col.segment; patch.applicationStatus = "BUILD"; }
    else { patch.applicationStatus = col.status; }
    const history = [...(role.stageTracker?.history || []), { stage: col.label, date: now, note: "" }];
    patch.stageTracker = { ...role.stageTracker, currentStage: role.stageTracker?.currentStage || "IDENTIFIED", lastUpdated: now, history };
    saveRoles(roles.map(r => r.id === role.id ? { ...r, ...patch } : r));
  };

  const stats = getPipelineStats(data.pipeline);
  const caps = settings.capacityCaps || {};

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Pipeline Board</h2>
          <p className="text-xs text-gray-500 mt-0.5">{stats.total} roles · {stats.P2}/{caps.P2 || 5} active · {stats.P3B}/{caps.P3B || 7} tracking</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors">
          <Plus size={14} /> Add
        </button>
      </div>

      {roles.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Roles Yet"
          description="Add a role manually, or score a JD in the Analyze zone to auto-create a card."
          action="Add a Role"
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 snap-x">
          {PIPELINE_COLUMNS.map(col => {
            const colRoles = roles.filter(r => roleColumn(r) === col.id);
            const cap = col.capKey ? caps[col.capKey] : null;
            const over = cap && colRoles.length > cap;
            return (
              <div key={col.id} className="shrink-0 w-64 snap-start">
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-200">{col.label}</span>
                    {col.sub && <Badge variant={col.accent}>{col.sub}</Badge>}
                  </div>
                  <span className={`text-[10px] ${over ? "text-red-400" : "text-gray-500"}`}>
                    {colRoles.length}{cap ? `/${cap}` : ""}
                  </span>
                </div>
                <div className="space-y-2 min-h-[60px]">
                  {colRoles.length === 0 ? (
                    <div className="text-[10px] text-gray-700 text-center py-4 rounded-lg border border-dashed border-white/5">Empty</div>
                  ) : (
                    colRoles.map(r => <RoleCard key={r.id} role={r} settings={settings} onOpen={() => setOpenId(r.id)} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddRoleSheet open={addOpen} onClose={() => setAddOpen(false)} onAdd={addRole} settings={settings} />
      <RoleDrawer
        role={openRole}
        data={data}
        settings={settings}
        onMove={moveRole}
        onUpdate={updateRole}
        onDelete={deleteRole}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

function ScoreBar({ score, max = 10 }) {
  const pct = Math.min(100, Math.round((Number(score) / max) * 100));
  const color = score >= 8 ? "bg-emerald-400" : score >= 6 ? "bg-teal-400" : score >= 4 ? "bg-amber-400" : "bg-red-400";
  return <div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>;
}

function ScoreCard({ score, settings }) {
  const sym = settings.currencySymbol || "₹";
  const unit = settings.currencyUnit || "L";
  const ctc = score.ctcEstimate || {};
  const tri = score.subScores || {};
  return (
    <div className="space-y-4">
      {/* Headline */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-400 leading-none">{score.fitNet ?? score.fitBase ?? 0}</div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">Net Fit</div>
        </div>
        <div className="flex-1 text-[11px] text-gray-400 leading-relaxed">
          <div className="flex items-center gap-1.5 mb-1">
            <Badge variant={score.segmentRecommendation === "P3A" ? "teal" : score.segmentRecommendation === "P3B" ? "blue" : "default"}>{score.segmentRecommendation}</Badge>
            {score.fitGap > 0 && <span className="text-gray-500">base {score.fitBase} → addressable {score.fitTarget} (gap +{score.fitGap})</span>}
          </div>
          {score.segmentReasoning && <p className="text-gray-500">{score.segmentReasoning}</p>}
        </div>
      </div>

      {/* Tri-score + CTC */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Functional" value={tri.functional ?? "—"} />
        <StatCard label="Tech/Cert" value={tri.technicalCert ?? "—"} />
        <StatCard label="Lead/Vocab" value={tri.leadershipVocab ?? "—"} />
        <StatCard label="CTC" value={ctc.min || ctc.max ? `${sym}${ctc.min}–${ctc.max}${unit}` : "—"} sub={ctc.confidence} />
      </div>

      {/* Dimensions */}
      <div>
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">10-Dimension Detail</div>
        <div className="space-y-2.5">
          {(score.dimensionScores || []).map(d => (
            <div key={d.dim} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-300">{d.dim}. {DIMENSION_NAMES[d.dim] || `Dim ${d.dim}`}</span>
                <span className="text-gray-400 font-medium">{d.score}/10{d.upliftPossible ? <span className="text-teal-400"> +{d.upliftPossible}</span> : null}</span>
              </div>
              <ScoreBar score={d.score} />
              {d.evidence && <p className="text-[10px] text-gray-600 leading-relaxed">{d.evidence}</p>}
              {d.upliftAction && <p className="text-[10px] text-teal-500/80 leading-relaxed">↑ {d.upliftAction}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Gaps / certs / stories */}
      {(score.gaps?.length > 0) && (
        <div>
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Gaps</div>
          <ul className="space-y-1">{(score.gaps || []).map((g, i) => <li key={i} className="text-[11px] text-gray-400 flex gap-1.5"><span className="text-amber-400">•</span>{g}</li>)}</ul>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {score.certsNeeded?.length > 0 && (
          <div><div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Certs</div><div className="flex flex-wrap gap-1">{score.certsNeeded.map((c, i) => <Badge key={i}>{c}</Badge>)}</div></div>
        )}
        {score.suggestedStarIds?.length > 0 && (
          <div><div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Suggested Stories</div><div className="flex flex-wrap gap-1">{score.suggestedStarIds.map((s, i) => <Badge key={i} variant="amber">{s}</Badge>)}</div></div>
        )}
      </div>
      {(score.effortTier || score.prepMonths || score.convProbability) && (
        <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
          {score.effortTier && <span>Effort: <span className="text-gray-300">{score.effortTier}</span></span>}
          {score.prepMonths ? <span>Prep: <span className="text-gray-300">{score.prepMonths}mo</span></span> : null}
          {score.convProbability && <span>Conversion: <span className="text-gray-300">{score.convProbability}</span></span>}
        </div>
      )}
      {score.notes && <p className="text-[11px] text-gray-600 leading-relaxed border-t border-white/5 pt-2">{score.notes}</p>}
    </div>
  );
}

function ZoneAnalyzer({ data, dispatch }) {
  const [jdText, setJdText] = useState("");
  const [scoring, setScoring] = useState(false);
  const [score, setScore] = useState(null);
  const [building, setBuilding] = useState(false);
  const [playbook, setPlaybook] = useState(null);
  const [saved, setSaved] = useState(false);
  const [redTeam, setRedTeam] = useState(null);
  const [rtCopied, setRtCopied] = useState(false);
  const [error, setError] = useState(null);

  const profileReady = !!data.profile.identity?.name;

  const runScore = async () => {
    if (!jdText.trim()) return;
    setScoring(true); setError(null); setScore(null); setPlaybook(null); setSaved(false); setRedTeam(null);
    try {
      const res = await callClaudeAPI({ systemPrompt: buildAP01System(data), userMessage: `Score this JD:\n\n${jdText}`, maxTokens: 2500 });
      setScore(parseJsonResponse(res.text));
    } catch (err) {
      setError("Scoring failed: " + (err?.message || err) + ". Inside Claude.ai the API is available automatically.");
    }
    setScoring(false);
  };

  const buildPlaybook = async () => {
    if (!score) return;
    setBuilding(true); setError(null);
    try {
      const res = await callClaudeAPI({ systemPrompt: buildAP02System(data, score), userMessage: `Build playbook for: ${score.role} at ${score.company}\n\nJD:\n${jdText}`, maxTokens: 8000 });
      let html = (res.text || "").trim();
      const fence = html.match(/```(?:html)?\s*([\s\S]*?)```/);
      if (fence) html = fence[1].trim();
      setPlaybook(html);
      dispatch({ type: "SHOW_TOAST", message: "Playbook generated", toastType: "success" });
    } catch (err) {
      setError("Playbook generation failed: " + (err?.message || err));
    }
    setBuilding(false);
  };

  const saveToPipeline = async () => {
    if (!score) return;
    const roles = data.pipeline.roles || [];
    const role = makeRoleFromScore(score, jdText, data.settings, !!playbook);
    if (roles.some(r => r.id === role.id)) role.id = role.id + "-" + Date.now().toString(36);
    const next = { ...data.pipeline, roles: [...roles, role] };
    await saveData("pipeline", next);
    dispatch({ type: "DATA_UPDATED", key: "pipeline", value: { ...next, lastUpdated: new Date().toISOString() } });
    setSaved(true);
    dispatch({ type: "SHOW_TOAST", message: `Saved to pipeline → ${role.segment}`, toastType: "success" });
  };

  const genRedTeam = async () => {
    const artifactType = playbook ? "playbook" : "fit assessment";
    const content = playbook
      ? playbook.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 6000)
      : JSON.stringify(score, null, 2);
    const prompt = buildOP06(score?.role, score?.company, artifactType, content);
    setRedTeam(prompt);
    const ok = await copyToClipboard(prompt);
    setRtCopied(true); setTimeout(() => setRtCopied(false), 2000);
    if (ok) dispatch({ type: "SHOW_TOAST", message: "Red Team prompt copied", toastType: "success" });
  };

  const downloadPlaybook = () => {
    const blob = new Blob([playbook], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${(score?.slug || score?.company || "playbook")}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white">JD Analyzer</h2>
        <p className="text-xs text-gray-500 mt-0.5">Score a job description, then build a playbook</p>
      </div>

      {!profileReady && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
          <AlertCircle size={14} /> Complete onboarding first — scoring needs your career profile.
        </div>
      )}

      <textarea
        value={jdText}
        onChange={e => setJdText(e.target.value)}
        placeholder="Paste the full job description here..."
        className="w-full h-36 bg-black/30 rounded-lg p-3 text-xs text-gray-300 border border-white/5 focus:border-amber-500/30 focus:outline-none resize-none leading-relaxed"
      />

      <div className="flex gap-2">
        <button onClick={runScore} disabled={scoring || !jdText.trim() || !profileReady}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          {scoring ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
          {scoring ? "Scoring…" : "Score JD"}
        </button>
        {score && (
          <button onClick={saveToPipeline} disabled={saved}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg bg-teal-500/15 text-teal-400 hover:bg-teal-500/25 transition-colors disabled:opacity-40">
            {saved ? <Check size={14} /> : <Target size={14} />}{saved ? "Saved" : "Save"}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
          <AlertCircle size={14} className="shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}

      {score && (
        <div className="space-y-4 border-t border-white/5 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">{score.role || "Role"} {score.company ? `· ${score.company}` : ""}</h3>
          </div>
          <ScoreCard score={score} settings={data.settings} />

          <div className="flex gap-2">
            <button onClick={buildPlaybook} disabled={building}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg bg-white/5 text-gray-200 hover:bg-white/10 transition-colors disabled:opacity-40">
              {building ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              {building ? "Building…" : playbook ? "Regenerate Playbook" : "Generate Playbook"}
            </button>
            <button onClick={genRedTeam}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
              {rtCopied ? <Check size={14} /> : <AlertTriangle size={14} />} Red Team
            </button>
          </div>

          {redTeam && (
            <div className="rounded-lg bg-white/5 border border-white/5 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                <AlertTriangle size={13} className="text-amber-400" />
                <span className="text-xs font-medium text-gray-200 flex-1">Red Team Prompt (OP-06)</span>
                <button onClick={() => copyToClipboard(redTeam)} className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"><Copy size={11} />Copy</button>
                <button onClick={() => dispatch({ type: "OPEN_IMPORT" })} className="text-[10px] text-gray-400 hover:text-gray-200 flex items-center gap-1"><Upload size={11} />Import</button>
              </div>
              <pre className="px-3 py-2 max-h-32 overflow-auto text-[10px] text-gray-400 whitespace-pre-wrap" style={{ fontFamily: "ui-monospace, monospace" }}>{redTeam}</pre>
              <div className="px-3 pb-2 text-[10px] text-gray-600">Paste into ChatGPT, then import the red-team .md to attach findings to this role in the pipeline.</div>
            </div>
          )}

          {playbook && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider">Playbook</span>
                <button onClick={downloadPlaybook} className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1"><Download size={11} />Download .html</button>
              </div>
              <iframe srcDoc={playbook} title="Playbook" className="w-full h-[560px] rounded-lg border border-white/10 bg-white" sandbox="allow-scripts" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PREP_TABS = [
  { id: "stories", label: "Stories", icon: BookOpen },
  { id: "bq", label: "BQ Router", icon: ListChecks },
  { id: "mock", label: "Mock", icon: Mic },
  { id: "negotiate", label: "Negotiate", icon: DollarSign },
];

function PrepStories({ data, dispatch, saveStars }) {
  const stories = data.stars.stories || [];
  const [filter, setFilter] = useState("ALL");
  const [openId, setOpenId] = useState(null);
  const [polishFor, setPolishFor] = useState(null);

  const cats = ["ALL", ...Array.from(new Set(stories.map(s => s.category).filter(Boolean)))];
  const shown = filter === "ALL" ? stories : stories.filter(s => s.category === filter);
  const targetRole = (data.profile.careerGoal?.targetFunctions || [])[0] || "target role";

  const rehearse = id => saveStars({ ...data.stars, stories: stories.map(s => s.storyId === id ? { ...s, rehearsalCount: (s.rehearsalCount || 0) + 1, lastRehearsed: new Date().toISOString() } : s) });

  if (stories.length === 0) {
    return <EmptyState icon={BookOpen} title="No Stories Yet" description="Build STAR stories in Onboarding first — they power mocks, the BQ router, and playbooks." action="Go to Onboarding" onAction={() => dispatch({ type: "SET_ZONE", zone: "onboard" })} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors ${filter === c ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}>
            {c === "ALL" ? "All" : c.replace(/_/g, " ").toLowerCase()}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {shown.map(s => {
          const open = openId === s.storyId;
          return (
            <div key={s.storyId} className="rounded-lg bg-white/5 border border-white/5 overflow-hidden">
              <button onClick={() => { setOpenId(open ? null : s.storyId); setPolishFor(null); }} className="w-full flex items-center gap-2 p-2.5 text-left">
                <span className="text-[10px] font-mono text-amber-400 shrink-0">{s.storyId}</span>
                <span className="flex-1 min-w-0 text-xs text-gray-200 truncate">{s.title || "Untitled"}</span>
                <span className="text-[9px] text-teal-400">{"★".repeat(s.starRating || 0)}</span>
                {s.rehearsalCount > 0 && <span className="text-[9px] text-gray-500 inline-flex items-center gap-0.5"><Repeat size={9} />{s.rehearsalCount}</span>}
                <ChevronRight size={14} className={`text-gray-600 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
              </button>
              {open && (
                <div className="p-2.5 pt-0 space-y-2 border-t border-white/5">
                  {[["S", s.situation], ["T", s.task], ["A", s.action], ["R", s.result]].map(([k, v]) => v && (
                    <div key={k} className="flex gap-2">
                      <span className="text-[10px] font-mono text-amber-400 w-3 shrink-0">{k}</span>
                      <span className="text-[11px] text-gray-400 leading-relaxed">{v}</span>
                    </div>
                  ))}
                  {(s.metrics || []).length > 0 && <div className="flex flex-wrap gap-1">{s.metrics.map((m, i) => <Badge key={i} variant="teal">{m}</Badge>)}</div>}
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    {s.lastRehearsed && <span>Last rehearsed {s.lastRehearsed.slice(0, 10)}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => rehearse(s.storyId)} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded bg-teal-500/15 text-teal-400 hover:bg-teal-500/25"><Repeat size={11} />Rehearsed +1</button>
                    <button onClick={() => setPolishFor(polishFor === s.storyId ? null : s.storyId)} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"><Wand2 size={11} />Polish</button>
                  </div>
                  {polishFor === s.storyId && (
                    <RawPromptPanel
                      title="Answer Polishing (OP-04)" tool="Any AI" icon={Wand2} dispatch={dispatch}
                      tip="Paste into any AI for an inline-polished answer. This one is review-only — not a .md import."
                      text={buildOP04(targetRole, "", `Situation: ${s.situation}\nTask: ${s.task}\nAction: ${s.action}\nResult: ${s.result}`, data.vocab)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrepBQRouter({ data, dispatch, saveStars }) {
  const stories = data.stars.stories || [];
  const router = data.stars.bqRouter || [];
  const [openIdx, setOpenIdx] = useState(null);
  const byId = id => stories.find(s => s.storyId === id);

  const setMap = (idx, field, val) => saveStars({ ...data.stars, bqRouter: router.map((r, i) => i === idx ? { ...r, [field]: val || null } : r) });

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-gray-500">Map each behavioral question pattern to a primary and backup story.</p>
      {router.map((r, idx) => {
        const open = openIdx === idx;
        const primary = byId(r.primary);
        return (
          <div key={idx} className="rounded-lg bg-white/5 border border-white/5 overflow-hidden">
            <button onClick={() => setOpenIdx(open ? null : idx)} className="w-full flex items-center gap-2 p-2.5 text-left">
              <span className="flex-1 min-w-0 text-[11px] text-gray-300 truncate">{r.questionPattern}</span>
              {r.primary ? <Badge variant="amber">{r.primary}</Badge> : <span className="text-[10px] text-gray-600">unmapped</span>}
              <ChevronRight size={14} className={`text-gray-600 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
            </button>
            {open && (
              <div className="p-2.5 pt-0 space-y-2 border-t border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  {["primary", "backup"].map(field => (
                    <label key={field} className="block">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{field}</span>
                      <select value={r[field] || ""} onChange={e => setMap(idx, field, e.target.value)} className="mt-1 w-full bg-black/30 rounded px-2 py-1.5 text-[11px] text-white border border-white/5 focus:border-amber-500/30 focus:outline-none">
                        <option value="">—</option>
                        {stories.map(s => <option key={s.storyId} value={s.storyId}>{s.storyId}: {s.title}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
                {primary && (
                  <div className="p-2 rounded bg-black/20 space-y-1">
                    <div className="text-[10px] text-amber-400 font-mono">{primary.storyId} · {primary.title}</div>
                    {primary.result && <div className="text-[10px] text-gray-400 leading-relaxed">{primary.result}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PrepMock({ data, dispatch }) {
  const roles = data.pipeline.roles || [];
  const [roleId, setRoleId] = useState(roles[0]?.id || "");
  const role = roles.find(r => r.id === roleId) || null;
  const sessions = data.stars.mockSessions || [];

  const prompt = buildOP03(role, storiesForRole(role, data.stars), data.vocab);

  const chartData = sessions.map((s, i) => ({
    name: (s.date || `#${i + 1}`).slice(5),
    Structure: s.scores?.structure ?? null,
    Specificity: s.scores?.specificity ?? null,
    Vocabulary: s.scores?.vocabulary ?? null,
    Assertiveness: s.scores?.assertiveness ?? null,
  }));

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-[11px] text-gray-500 uppercase tracking-wider">Role</span>
        <select value={roleId} onChange={e => setRoleId(e.target.value)} className="mt-1 w-full bg-black/30 rounded-lg px-2.5 py-2 text-sm text-white border border-white/5 focus:border-amber-500/30 focus:outline-none">
          <option value="">Generic (target functions)</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.role} · {r.company}</option>)}
        </select>
      </label>

      <RawPromptPanel title="Mock Interview (OP-03)" tool="ChatGPT / Gemini" icon={Mic} dispatch={dispatch} allowImport text={prompt}
        tip="Run the 5-question mock, then import the .md results — story rehearsals and the trend below update automatically." />

      {sessions.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider">Score Trend ({sessions.length} sessions)</div>
          <div className="h-48 rounded-lg bg-white/5 border border-white/5 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#ffffff10" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#6b7280" }} />
                <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tick={{ fontSize: 9, fill: "#6b7280" }} />
                <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid #ffffff20", borderRadius: 8, fontSize: 11 }} />
                <Line type="monotone" dataKey="Structure" stroke="#fbbf24" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="Specificity" stroke="#2dd4bf" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="Vocabulary" stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="Assertiveness" stroke="#f87171" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="text-amber-400">● Structure</span><span className="text-teal-400">● Specificity</span>
            <span className="text-blue-400">● Vocabulary</span><span className="text-red-400">● Assertiveness</span>
          </div>
          <div className="space-y-1.5">
            {sessions.slice().reverse().slice(0, 5).map((s, i) => (
              <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1">
                  <span className="text-gray-300">{s.role || "Mock"}</span><span>{(s.date || "").slice(0, 10)}</span><span>· {s.source}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
                  {["structure", "specificity", "vocabulary", "assertiveness"].map(d => s.scores?.[d] != null && (
                    <span key={d}>{d.slice(0, 4)}: <span className="text-gray-200">{s.scores[d]}</span></span>
                  ))}
                </div>
                {(s.actions || []).length > 0 && <ul className="mt-1 space-y-0.5">{s.actions.slice(0, 3).map((a, j) => <li key={j} className="text-[10px] text-gray-500 flex gap-1"><span className="text-amber-400">→</span>{a}</li>)}</ul>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PrepNegotiate({ data, dispatch }) {
  const roles = data.pipeline.roles || [];
  const withCtc = roles.filter(r => r.ctcMin || r.ctcMax);
  const [roleId, setRoleId] = useState(withCtc[0]?.id || "");
  const role = roles.find(r => r.id === roleId) || null;
  const sym = data.settings.currencySymbol || "₹";
  const unit = data.settings.currencyUnit || "L";

  if (withCtc.length === 0) {
    return <EmptyState icon={DollarSign} title="No Comp Data" description="Add CTC ranges to roles in the Pipeline (or score a JD) to build a negotiation script." action="Go to Pipeline" onAction={() => dispatch({ type: "SET_ZONE", zone: "pipeline" })} />;
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-[11px] text-gray-500 uppercase tracking-wider">Role</span>
        <select value={roleId} onChange={e => setRoleId(e.target.value)} className="mt-1 w-full bg-black/30 rounded-lg px-2.5 py-2 text-sm text-white border border-white/5 focus:border-amber-500/30 focus:outline-none">
          {withCtc.map(r => <option key={r.id} value={r.id}>{r.role} · {r.company}</option>)}
        </select>
      </label>

      {role && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Floor" value={role.walkAwayFloor ? `${sym}${role.walkAwayFloor}${unit}` : (role.ctcMin ? `${sym}${role.ctcMin}${unit}` : "—")} />
            <StatCard label="Anchor" value={role.ctcMidpoint ? `${sym}${role.ctcMidpoint}${unit}` : "—"} sub="midpoint" />
            <StatCard label="Target" value={role.ctcMax ? `${sym}${role.ctcMax}${unit}` : "—"} sub="push to" />
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1 text-[11px] text-gray-400">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Script Anchors</div>
            <p>• Open at <span className="text-gray-200">{role.ctcMax ? `${sym}${role.ctcMax}${unit}` : "market rate"}</span>, never volunteer current comp.</p>
            <p>• Hold floor at <span className="text-gray-200">{sym}{role.walkAwayFloor || role.ctcMin || "?"}{unit}</span> — below that, walk.</p>
            <p>• Deflect comp asks: "I'd prefer to focus on the value I bring and the market rate for this scope."</p>
          </div>
          <RawPromptPanel title="Negotiation Simulation (OP-05)" tool="ChatGPT" icon={DollarSign} dispatch={dispatch} text={buildOP05(role, data.settings)}
            tip="Run the simulation in ChatGPT to practice holding your floor under pressure." />
        </>
      )}
    </div>
  );
}

function ZonePrep({ data, dispatch }) {
  const [tab, setTab] = useState("stories");
  const storyCount = getStoryCount(data.stars);
  const mapped = (data.stars.bqRouter || []).filter(r => r.primary).length;

  const saveStars = async (next) => {
    await saveData("stars", next);
    dispatch({ type: "DATA_UPDATED", key: "stars", value: { ...next, lastUpdated: new Date().toISOString() } });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white">Prep Hub</h2>
        <p className="text-xs text-gray-500 mt-0.5">{storyCount} stories · {mapped} BQ patterns mapped · {(data.stars.mockSessions || []).length} mocks</p>
      </div>

      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        {PREP_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-medium transition-colors ${tab === t.id ? "bg-amber-500/15 text-amber-400" : "text-gray-500 hover:text-gray-300"}`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "stories" && <PrepStories data={data} dispatch={dispatch} saveStars={saveStars} />}
      {tab === "bq" && <PrepBQRouter data={data} dispatch={dispatch} saveStars={saveStars} />}
      {tab === "mock" && <PrepMock data={data} dispatch={dispatch} />}
      {tab === "negotiate" && <PrepNegotiate data={data} dispatch={dispatch} />}
    </div>
  );
}

function ZoneSkills({ data, dispatch }) {
  const trackCount = getTrackCount(data.skills);
  const activeCount = getActiveTrackCount(data.skills);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white">Skill Coach</h2>
        <p className="text-xs text-gray-500 mt-0.5">Certifications, curricula, and practice</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Tracks" value={trackCount} sub="total" icon={GraduationCap} />
        <StatCard label="Active" value={activeCount} sub="in progress" icon={BarChart3} />
      </div>

      <EmptyState
        icon={GraduationCap}
        title={trackCount === 0 ? "No Skill Tracks" : `${trackCount} Tracks`}
        description="Create skill tracks linked to your pipeline roles. The coach builds curricula, generates practice exercises, and tracks your progress."
        action="Create Track"
        onAction={() => dispatch({ type: "SHOW_TOAST", message: "Skill Coach coming in Batch 6", toastType: "info" })}
      />
    </div>
  );
}

// ============================================================
// SECTION 11: SETTINGS ZONE
// ============================================================

function ZoneSettings({ data, dispatch, onSave }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [exporting, setExporting] = useState(false);

  const stats = {
    profileComplete: getProfileCompletion(data.profile),
    stories: getStoryCount(data.stars),
    roles: data.pipeline?.roles?.length || 0,
    tracks: getTrackCount(data.skills),
    reframes: data.vocab?.mandatoryReframes?.length || 0,
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `career-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      dispatch({ type: "SHOW_TOAST", message: "Data exported", toastType: "success" });
    } catch { dispatch({ type: "SHOW_TOAST", message: "Export failed", toastType: "error" }); }
    setExporting(false);
  };

  const handleClear = async () => {
    await clearAllData();
    const fresh = {};
    for (const [name] of Object.entries(STORAGE_KEYS)) fresh[name] = DEFAULTS[name];
    dispatch({ type: "DATA_LOADED", data: fresh });
    setConfirmClear(false);
    dispatch({ type: "SHOW_TOAST", message: "All data cleared", toastType: "info" });
  };

  const handleNameChange = async (name) => {
    const updated = { ...data.settings, userName: name };
    dispatch({ type: "DATA_UPDATED", key: "settings", value: updated });
    await saveData("settings", updated);
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white">Settings</h2>
        <p className="text-xs text-gray-500 mt-0.5">Configuration and data management</p>
      </div>

      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wider">Your Name</label>
        <input
          type="text" value={data.settings.userName || ""}
          onChange={e => handleNameChange(e.target.value)}
          placeholder="Enter your name"
          className="mt-1 w-full bg-black/30 rounded-lg px-3 py-2 text-sm text-white border border-white/5 focus:border-amber-500/30 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Data Summary</label>
        <div className="space-y-1">
          {[
            ["Profile completion", `${stats.profileComplete}%`],
            ["STAR stories", stats.stories],
            ["Pipeline roles", stats.roles],
            ["Skill tracks", stats.tracks],
            ["Vocabulary reframes", stats.reframes],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-300 font-medium">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-500 uppercase tracking-wider block">Data Operations</label>

        <button onClick={() => dispatch({ type: "OPEN_IMPORT" })} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors">
          <Upload size={16} className="text-amber-400" />
          <span className="text-xs text-gray-300">Import .md from AI tool</span>
        </button>

        <button onClick={handleExport} disabled={exporting} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-teal-500/20 transition-colors">
          {exporting ? <Loader2 size={16} className="text-teal-400 animate-spin" /> : <Download size={16} className="text-teal-400" />}
          <span className="text-xs text-gray-300">Export all data as JSON</span>
        </button>

        {!confirmClear ? (
          <button onClick={() => setConfirmClear(true)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-red-500/20 transition-colors">
            <Trash2 size={16} className="text-red-400" />
            <span className="text-xs text-gray-300">Clear all data</span>
          </button>
        ) : (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2">
            <p className="text-xs text-red-300">This permanently deletes all your career data, stories, pipeline, and settings. Export a backup first.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmClear(false)} className="flex-1 py-1.5 text-xs bg-white/5 rounded text-gray-400 hover:bg-white/10">Cancel</button>
              <button onClick={handleClear} className="flex-1 py-1.5 text-xs bg-red-500/20 rounded text-red-300 hover:bg-red-500/30">Confirm Delete</button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-white/5">
        <div className="text-xs text-gray-600 space-y-0.5">
          <div>Career OS v{APP_VERSION}</div>
          <div>Schema v{SCHEMA_VERSION}</div>
          <div>Data stored locally in this artifact — private to you</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 12: APP ROOT
// ============================================================

export default function CareerOS() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const bootRef = useRef(false);

  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    (async () => {
      try {
        const data = await loadAllData();
        dispatch({ type: "DATA_LOADED", data });
        if (!data.settings.onboardingComplete && !data.profile.identity?.name) {
          dispatch({ type: "SET_ZONE", zone: "onboard" });
        }
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: "Failed to load data: " + (err?.message || err) });
        dispatch({ type: "DATA_LOADED", data: initialState.data });
      }
    })();
  }, []);

  const handleImport = useCallback(async (mdText, importType) => {
    try {
      const parsed = parseImportedMd(mdText);
      if (!parsed.metadata) throw new Error("Invalid .md format");

      const type = importType.type;
      let toastMsg = `Imported: ${importType.label}`;

      if (type === "career-profile") {
        const { profilePatch, vocabPatch } = parseCareerProfile(parsed.sections);
        const newProfile = mergeProfile(state.data.profile, profilePatch);
        await saveData("profile", newProfile);
        dispatch({ type: "DATA_UPDATED", key: "profile", value: { ...newProfile, lastUpdated: new Date().toISOString() } });

        if (vocabPatch.mandatoryReframes?.length) {
          const newVocab = {
            ...state.data.vocab,
            employerName: profilePatch.identity?.employer || state.data.vocab.employerName,
            mandatoryReframes: mergeReframes(state.data.vocab.mandatoryReframes, vocabPatch.mandatoryReframes),
          };
          await saveData("vocab", newVocab);
          dispatch({ type: "DATA_UPDATED", key: "vocab", value: { ...newVocab, lastUpdated: new Date().toISOString() } });
        }
        toastMsg = "Career profile imported ✓";
      } else if (type === "star-stories") {
        const before = state.data.stars.stories?.length || 0;
        const stories = parseStarStories(parsed.sections, state.data.stars.stories);
        const newStars = { ...state.data.stars, stories };
        await saveData("stars", newStars);
        dispatch({ type: "DATA_UPDATED", key: "stars", value: { ...newStars, lastUpdated: new Date().toISOString() } });
        toastMsg = `Imported ${stories.length - before} new (${stories.length} total) stories ✓`;
      } else if (type === "mock-results") {
        const mock = parseMockResults(parsed.sections);
        const now = new Date().toISOString();
        const used = new Set(mock.questions.map(q => q.storyUsed).filter(Boolean));
        const stories = (state.data.stars.stories || []).map(s =>
          used.has(s.storyId)
            ? { ...s, rehearsalCount: (s.rehearsalCount || 0) + 1, lastRehearsed: mock.date || now, rolesTested: mock.role && !(s.rolesTested || []).includes(mock.role) ? [...(s.rolesTested || []), mock.role] : (s.rolesTested || []) }
            : s);
        const session = { date: mock.date, role: mock.role, source: mock.source, questionsAsked: mock.questionsAsked, scores: mock.averages, actions: mock.actions };
        const newStars = { ...state.data.stars, stories, mockSessions: [...(state.data.stars.mockSessions || []), session] };
        await saveData("stars", newStars);
        dispatch({ type: "DATA_UPDATED", key: "stars", value: { ...newStars, lastUpdated: now } });
        toastMsg = `Mock logged · ${used.size} stories rehearsed ✓`;
      } else if (type === "red-team") {
        const rt = parseRedTeam(parsed.sections);
        const roles = state.data.pipeline.roles || [];
        if (roles.length === 0) throw new Error("Add a role to the pipeline before importing red-team findings");
        const needle = (rt.role || "").toLowerCase();
        const match = roles.find(r => needle && (needle.includes((r.role || "").toLowerCase()) || (r.company && needle.includes(r.company.toLowerCase()))))
          || roles.slice().sort((a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0))[0];
        const finding = { source: rt.source, date: rt.date, findings: rt.findings, addressed: false };
        const nextRoles = roles.map(r => r.id === match.id
          ? { ...r, redTeamFindings: [...(r.redTeamFindings || []), finding], lastActivity: new Date().toISOString() }
          : r);
        const nextPipeline = { ...state.data.pipeline, roles: nextRoles };
        await saveData("pipeline", nextPipeline);
        dispatch({ type: "DATA_UPDATED", key: "pipeline", value: { ...nextPipeline, lastUpdated: new Date().toISOString() } });
        toastMsg = `Red-team findings → ${match.role || match.company} ✓`;
      } else {
        // Zones 4/5 — retain raw import; zone-specific parsers land in later batches.
        const key = importType.targetKey;
        const currentData = state.data[key];
        const updatedData = {
          ...currentData,
          _lastImport: { type, date: parsed.metadata.date, raw: mdText, importedAt: new Date().toISOString() },
        };
        await saveData(key, updatedData);
        dispatch({ type: "DATA_UPDATED", key, value: { ...updatedData, lastUpdated: new Date().toISOString() } });
      }

      const newSettings = { ...state.data.settings, lastImport: new Date().toISOString() };
      await saveData("settings", newSettings);
      dispatch({ type: "DATA_UPDATED", key: "settings", value: newSettings });

      dispatch({ type: "BUMP_IMPORT" });
      dispatch({ type: "SHOW_TOAST", message: toastMsg, toastType: "success" });
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", message: `Import failed: ${err.message}`, toastType: "error" });
    }
  }, [state.data]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={24} className="text-amber-400 animate-spin mx-auto mb-2" />
          <div className="text-xs text-gray-500">Loading Career OS...</div>
        </div>
      </div>
    );
  }

  const renderZone = () => {
    switch (state.activeZone) {
      case "onboard": return <ZoneOnboard data={state.data} dispatch={dispatch} importNonce={state.importNonce} />;
      case "pipeline": return <ZonePipeline data={state.data} dispatch={dispatch} />;
      case "analyzer": return <ZoneAnalyzer data={state.data} dispatch={dispatch} />;
      case "prep": return <ZonePrep data={state.data} dispatch={dispatch} />;
      case "skills": return <ZoneSkills data={state.data} dispatch={dispatch} />;
      case "settings": return <ZoneSettings data={state.data} dispatch={dispatch} onSave={saveData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="px-4 pt-3 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">
              Career OS
              {state.data.settings.userName && <span className="text-gray-600 font-normal ml-1.5">· {state.data.settings.userName}</span>}
            </h1>
          </div>
          <button
            onClick={() => dispatch({ type: "OPEN_IMPORT" })}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/10 transition-colors"
            title="Import .md"
          >
            <Upload size={14} className="text-amber-400" />
          </button>
        </div>
      </header>

      {/* Zone Content */}
      <main className="flex-1 overflow-auto pb-20">
        {state.error && (
          <div className="mx-4 mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{state.error}</span>
            <button onClick={() => dispatch({ type: "CLEAR_ERROR" })} className="ml-auto"><X size={12} /></button>
          </div>
        )}

        {renderZone()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur border-t border-white/5 px-1 py-1.5 flex justify-around">
        {ZONES.map(zone => {
          const Icon = zone.icon;
          const isActive = state.activeZone === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => dispatch({ type: "SET_ZONE", zone: zone.id })}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 ${
                isActive ? "text-amber-400" : "text-gray-600 hover:text-gray-400"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] truncate">{zone.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Import Modal */}
      <ImportModal
        open={state.importModal.open}
        onClose={() => dispatch({ type: "CLOSE_IMPORT" })}
        onImport={handleImport}
      />

      {/* Toast */}
      {state.toast && (
        <Toast
          message={state.toast.message}
          type={state.toast.type}
          onDismiss={() => dispatch({ type: "CLEAR_TOAST" })}
        />
      )}
    </div>
  );
}
