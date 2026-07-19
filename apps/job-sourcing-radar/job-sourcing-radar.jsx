import { useState, useEffect, useCallback } from "react";
import {
  Radar, Briefcase, ScrollText, Settings, Search, Star,
  AlertCircle, Loader2, Check, X, Globe, IndianRupee, DollarSign,
  Building2, ListChecks, SlidersHorizontal, Clock,
  Archive, ArchiveRestore, ExternalLink, FlaskConical, Trash2,
} from "lucide-react";

// ============================================================
// JOB SOURCING RADAR — v1 (Artifact Edition)
// Spec: apps/job-sourcing-radar/docs/spec.md
//
// BUILT SO FAR (milestones 1-3):
//   M1 — four zones (Scan / Pipeline / Log / Settings), default settings
//        (spec §3 targets+sources, §6 weights, §7 caps), window.storage
//        layer with try/catch (personal scope, explicit shared:false — §8),
//        loading/empty/error states
//   M2 — roles list ranked by fit, track/shift/source badges, star/archive,
//        dedupe (hash of company+title; re-finds bump last_seen only),
//        sample data loader
//   M3 — live scan engine: deterministic search-plan builder, two capped
//        web-search API calls (Track A then B), strict top-12 JSON contract
//        with defensive parsing, progressive merge into the pipeline
//   M4 — deterministic client-side scoring (weights from settings, comp
//        floors, startup/tech/sub-manager deductions), visible score
//        breakdown per card, persistent scan log with per-track search
//        counts and India-gate drop visibility
// Coming next: M5 settings editor.
//
// HARD CONSTRAINTS BUILT AGAINST (spec §4):
//   - runs as a single-file React artifact inside Claude.ai
//   - never uses browser local/session storage APIs (they fail in artifacts)
//   - no HTML form elements — plain onClick/onChange handlers
//   - Tailwind core utility classes only
// ============================================================

// ============================================================
// SECTION 1: CONSTANTS & DEFAULT SETTINGS
// ============================================================

const APP_VERSION = "1.0.0-m4";

// The three storage keys (spec §5). One key per dataset — each is read once
// on load and written whole on change. No per-record storage calls.
const STORAGE_KEYS = {
  roles: "radar:roles",
  scans: "radar:scans",
  settings: "radar:settings",
};

// Bottom-nav zones (mirrors the Career OS shell).
const ZONES = [
  { id: "scan", label: "Scan", icon: Radar },
  { id: "pipeline", label: "Pipeline", icon: Briefcase },
  { id: "log", label: "Log", icon: ScrollText },
  { id: "settings", label: "Settings", icon: Settings },
];

// Everything a scan needs lives in settings so it can be edited in-app later
// (Milestone 5) without code changes — spec acceptance criterion 6.
const DEFAULT_SETTINGS = {
  schemaVersion: "1.0",
  lastUpdated: null,

  // Model used for the two scan calls (spec §4 — required model for artifact API calls).
  model: "claude-sonnet-4-6",

  // §7 usage guardrails: hard cap 12 searches per scan, split across tracks.
  // Enforced later via the web-search tool's max_uses — the API stops searching
  // at the cap instead of running past it.
  searchCaps: { trackA: 8, trackB: 4 },

  // §3: optional hard domain restriction on the search tool. Default OFF —
  // restricting risks missing company career sites hosted on SuccessFactors etc.
  restrictToSourceDomains: false,

  // §2 comp criteria, per track.
  compFloors: {
    trackA_LPA: 40,            // ₹40 LPA headline floor (Track A)
    trackA_gccBandMin: 30,     // accept 30–50L band at financial-services GCCs
    trackA_gccBandMax: 50,
    trackB_USD: 50000,         // $50K USD floor (Track B) ≈ the ₹40L line
  },

  // §3 Track A target companies — config, not hardcode.
  // Track B has NO company list in v1 (portal-driven discovery only).
  companyTiers: {
    tier1: ["Fidelity Investments India", "Fidelity International", "Northern Trust", "State Street", "BNY", "Wells Fargo India"],
    tier2: ["Honeywell", "Schneider Electric", "Siemens", "Cummins", "Caterpillar", "Emerson", "ABB", "Collins Aerospace"],
    tier3: ["SAP Labs India", "Intuit India", "Adobe India"],
  },

  // §3 keyword clusters (used by both tracks to build search queries).
  keywordClusters: [
    "operations manager OR operations director",
    "process excellence OR lean six sigma",
    "revenue operations",
    "collections OR receivables OR order-to-cash",
    "program manager",
    "business transformation",
    "client operations OR implementation",
  ],

  // §3 sources — these drive deterministic search-plan construction in M3.
  // track: "A", "B", or "AB" (both). priority 1 sources are queried first.
  sources: [
    { domain: "naukri.com", label: "Naukri", track: "A", priority: 1, enabled: true },
    { domain: "linkedin.com", label: "LinkedIn", track: "AB", priority: 1, enabled: true },
    { domain: "iimjobs.com", label: "IIMJobs", track: "A", priority: 1, enabled: true },
    { domain: "myworkdayjobs.com", label: "Workday sites", track: "A", priority: 1, enabled: true },
    { domain: "indeed.com", label: "Indeed", track: "A", priority: 2, enabled: true },
    { domain: "foundit.in", label: "Foundit", track: "A", priority: 2, enabled: true },
    { domain: "himalayas.app", label: "Himalayas", track: "B", priority: 2, enabled: true },
    { domain: "weworkremotely.com", label: "WeWorkRemotely", track: "B", priority: 2, enabled: true },
  ],

  // §6 fit-scoring weights (must total 100). Applied in Milestone 4.
  scoringWeights: {
    roleFamily: 30,
    remoteFlex: 20,
    seniority: 15,
    comp: 15,
    shift: 10,
    wlb: 10,
  },
};

// Fresh-install defaults for the other two keys.
const DEFAULT_ROLES = [];   // array of role objects (spec §5)
const DEFAULT_SCANS = [];   // array of scan-log entries (spec §5)

// ============================================================
// SECTION 2: STORAGE LAYER (window.storage — personal scope ONLY)
// ============================================================
// Spec §8: every call passes an explicit { shared: false } so nothing can
// accidentally land in a shared scope. All calls are wrapped in try/catch —
// a storage failure must surface as a readable error, never a blank screen.

async function storageGet(key, fallback) {
  try {
    const result = await window.storage.get(key, { shared: false });
    return result && result.value != null ? JSON.parse(result.value) : fallback;
  } catch {
    // Treat read failures as "no data yet" — the caller renders the empty state.
    return fallback;
  }
}

async function storageSet(key, value) {
  try {
    const result = await window.storage.set(key, JSON.stringify(value), { shared: false });
    return !!result;
  } catch {
    return false;
  }
}

// Load all three datasets in one pass (called once on mount).
async function loadAllData() {
  const [settings, roles, scans] = await Promise.all([
    storageGet(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
    storageGet(STORAGE_KEYS.roles, DEFAULT_ROLES),
    storageGet(STORAGE_KEYS.scans, DEFAULT_SCANS),
  ]);
  // Merge stored settings over defaults so new fields added in later
  // versions get their default value instead of being undefined.
  return { settings: { ...DEFAULT_SETTINGS, ...settings }, roles, scans };
}

// ============================================================
// SECTION 2B: ROLE IDENTITY & DEDUPE (spec §5)
// ============================================================
// A role's identity is hash(company + normalized title). When a scan re-finds
// a role we already have, we ONLY update its last_seen timestamp — star/archive
// status, scores, and everything else stay untouched.

// Normalize text so "Senior Manager — O2C" and "senior manager o2c" match:
// lowercase, strip punctuation, collapse whitespace.
function normalizeText(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// Small stable string hash (djb2), rendered base-36. Not cryptographic —
// just a compact, deterministic id for dedupe.
function hashString(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function roleId(company, title) {
  return "r" + hashString(normalizeText(company) + "::" + normalizeText(title));
}

// Merge incoming roles (from a scan, or the sample loader) into the existing
// list. Returns the merged array plus counts for the scan log / toast.
function mergeRoles(existing, incoming, now = new Date().toISOString()) {
  const byId = new Map((existing || []).map(r => [r.id, r]));
  let added = 0;
  for (const raw of incoming || []) {
    const id = roleId(raw.company, raw.title);
    const prev = byId.get(id);
    if (prev) {
      // Already known: refresh last_seen ONLY (spec §5 dedupe rule).
      byId.set(id, { ...prev, last_seen: now });
    } else {
      byId.set(id, { ...raw, id, status: "new", first_seen: now, last_seen: now });
      added++;
    }
  }
  return { roles: Array.from(byId.values()), found: (incoming || []).length, added };
}

/* ---------------------------------------------------------------
   TEST HARNESS (unit-style, per spec milestone 2)
   Paste into any JS console alongside the four functions above:

   // 1. id is stable across punctuation/case variants
   roleId("Northern Trust", "Senior Manager — Fund Servicing")
     === roleId("northern trust", "senior manager fund servicing")   // → true

   // 2. different roles get different ids
   roleId("Northern Trust", "Senior Manager") !==
   roleId("State Street", "Senior Manager")                          // → true

   // 3. first merge adds everything
   const inc = [{ company: "Acme", title: "Ops Manager", fit_score: 80 }];
   const m1 = mergeRoles([], inc, "2026-01-01T00:00:00Z");
   m1.added === 1 && m1.roles[0].status === "new"
     && m1.roles[0].first_seen === "2026-01-01T00:00:00Z"            // → true

   // 4. re-merge is a no-op except last_seen; status survives
   m1.roles[0].status = "starred";
   const m2 = mergeRoles(m1.roles, inc, "2026-02-02T00:00:00Z");
   m2.added === 0 && m2.roles[0].status === "starred"
     && m2.roles[0].first_seen === "2026-01-01T00:00:00Z"
     && m2.roles[0].last_seen === "2026-02-02T00:00:00Z"             // → true
   --------------------------------------------------------------- */

// ============================================================
// SECTION 2C: SAMPLE DATA (Milestone 2 — removed from the UI once
// the real scan engine lands in M3; harmless to keep as fixtures)
// ============================================================
// Six realistic roles covering both tracks, all shift signals, several
// sources, and a spread of fit scores so the ranked list is visible.
// NOTE: every Track B sample has india_eligible: true — ineligible roles
// are dropped before storage by the M4 hard gate, so none should ever
// exist in the pipeline.

const SAMPLE_ROLES = [
  {
    track: "A", company: "Fidelity Investments India", title: "Director, Process Excellence (Lean Six Sigma)",
    url: "https://jobs.fidelity.com/sample-1", source: "linkedin.com", location: "Chennai",
    remote_type: "hybrid", india_eligible: true, comp_signal: { amount: 55, currency: "INR" },
    shift_signal: "mixed", wlb_notes: "Tier-1 target; established GCC, strong tenure signals",
    fit_score: 91, rationale: "Director band at a Tier-1 company, comp well above floor, process-excellence core match",
  },
  {
    track: "A", company: "State Street", title: "Program Manager, Business Transformation",
    url: "https://careers.statestreet.com/sample-2", source: "myworkdayjobs.com", location: "Pune",
    remote_type: "remote", india_eligible: true, comp_signal: { amount: 46, currency: "INR" },
    shift_signal: "india_day", wlb_notes: "Remote within India; day-shift program work",
    fit_score: 88, rationale: "Transformation PM at Tier-1, remote, above floor, india_day",
  },
  {
    track: "A", company: "Northern Trust", title: "Senior Manager — Fund Servicing Operations",
    url: "https://careers.northerntrust.com/sample-3", source: "naukri.com", location: "Bengaluru",
    remote_type: "hybrid", india_eligible: true, comp_signal: { amount: 42, currency: "INR" },
    shift_signal: "india_day", wlb_notes: "Stable fin-services GCC, WLB-first reputation",
    fit_score: 84, rationale: "Ops leadership in fin-services GCC, comp above floor, day shift",
  },
  {
    track: "B", company: "GitLab", title: "Manager, Revenue Operations",
    url: "https://boards.example.com/sample-4", source: "weworkremotely.com", location: "Remote (Global)",
    remote_type: "remote", india_eligible: true, comp_signal: { amount: 65000, currency: "USD" },
    shift_signal: "mixed", wlb_notes: "All-remote handbook company; async-first",
    fit_score: 82, rationale: "RevOps manager at an established all-remote enterprise, above USD floor",
  },
  {
    track: "B", company: "Atlassian", title: "Program Manager, Customer Operations",
    url: "https://jobs.example.com/sample-5", source: "himalayas.app", location: "Remote (India eligible)",
    remote_type: "remote", india_eligible: true, comp_signal: { amount: 72000, currency: "USD" },
    shift_signal: "us_night", wlb_notes: "India-eligible confirmed; expects US-hours overlap",
    fit_score: 79, rationale: "Strong role family and comp; night-shift overlap is the visible tradeoff",
  },
  {
    track: "A", company: "Wells Fargo India", title: "Operations Manager — Order to Cash",
    url: "https://careers.wellsfargo.com/sample-6", source: "iimjobs.com", location: "Hyderabad",
    remote_type: "hybrid", india_eligible: true, comp_signal: { amount: 34, currency: "INR" },
    shift_signal: "us_night", wlb_notes: "Large GCC; O2C is a direct experience match",
    fit_score: 68, rationale: "In GCC comp band but under headline floor; night shift deducted",
  },
];

// ============================================================
// SECTION 2D: SCAN ENGINE (Milestone 3 — spec §3, §4, §7)
// ============================================================
// One scan = two Messages API calls (Track A, then Track B). Each call gets
// the web-search tool with max_uses set from settings — the API stops
// searching at the cap instead of running past it. No API key appears
// anywhere: inside Claude.ai the platform injects auth and usage draws from
// the Claude plan.

// --- Deterministic search-plan builder --------------------------------------
// This is what kills random searching (spec §3): queries are constructed
// mechanically from settings — track × source priority × keyword cluster —
// so two scans with the same settings produce the same plan.
function buildSearchPlan(settings, track) {
  const cap = track === "A" ? settings.searchCaps.trackA : settings.searchCaps.trackB;
  const clusters = settings.keywordClusters;
  // Sources for this track (AB sources serve both), priority 1 first.
  const sources = settings.sources
    .filter(s => s.enabled && (s.track === track || s.track === "AB"))
    .sort((a, b) => a.priority - b.priority);
  const queries = [];
  if (track === "A") {
    // Alternate company-targeted and source-targeted queries so both target
    // lists and job portals get coverage inside the cap.
    const companies = [
      ...settings.companyTiers.tier1,
      ...settings.companyTiers.tier2,
      ...settings.companyTiers.tier3,
    ];
    let ci = 0, si = 0, ki = 0;
    while (queries.length < cap && (companies.length || sources.length)) {
      if (queries.length % 2 === 0 && companies.length) {
        queries.push(`"${companies[ci % companies.length]}" ${clusters[ki % clusters.length]} jobs India`);
        ci++;
      } else if (sources.length) {
        queries.push(`${clusters[ki % clusters.length]} jobs India manager site:${sources[si % sources.length].domain}`);
        si++;
      }
      ki++;
    }
  } else {
    // Track B: portal-driven only — no company list in v1 (spec §3).
    let si = 0, ki = 0;
    while (queries.length < cap && sources.length) {
      queries.push(`remote ${clusters[ki % clusters.length]} jobs worldwide "anywhere" OR "India" site:${sources[si % sources.length].domain}`);
      si++; ki++;
    }
  }
  return queries;
}

// --- Scan system prompts ----------------------------------------------------
// Both prompts demand ONLY compact JSON (spec §4): max_tokens is fixed at
// 1000 per call, so 12 roles with short strings is the whole budget.

function buildTrackASystem(settings) {
  const f = settings.compFloors;
  const plan = buildSearchPlan(settings, "A");
  return `You are a job-sourcing scanner. Execute the SEARCH PLAN below using the web_search tool (budget ${settings.searchCaps.trackA} searches — follow the plan in order; skip a query only if earlier results already covered it). Then return the best CURRENTLY-OPEN roles as compact JSON.

CRITERIA (Track A — financial services / GCC, India):
- India-based; remote or strong-hybrid preferred
- Non-technical / non-coding roles only (operations, program, transformation, process)
- Manager / Senior Manager / Director band — nothing below Manager
- Comp ₹${f.trackA_LPA} LPA+ (a ${f.trackA_gccBandMin}-${f.trackA_gccBandMax}L band is acceptable at financial-services GCCs)
- Prefer stable, WLB-first companies; flag shift timing honestly
- Priority companies: ${settings.companyTiers.tier1.join(", ")}
- Also good: ${[...settings.companyTiers.tier2, ...settings.companyTiers.tier3].join(", ")}

SEARCH PLAN:
${plan.map((q, i) => `${i + 1}. ${q}`).join("\n")}

OUTPUT — respond with ONLY this JSON. No preamble, no markdown, no code fences.
Max 12 roles, ranked best-fit first. Keep EVERY string short (rationale ≤ 15 words, wlb_notes ≤ 10 words):
{"roles":[{"company":"","title":"","url":"","source":"domain only","location":"","remote_type":"remote|hybrid|onsite","comp_signal":{"amount":0,"currency":"INR"},"shift_signal":"india_day|mixed|us_night","wlb_notes":"","fit":0,"rationale":""}]}
comp_signal amount is in LPA lakhs; set comp_signal to null when pay is not stated. fit is your 0-100 estimate against the criteria.`;
}

function buildTrackBSystem(settings) {
  const f = settings.compFloors;
  const plan = buildSearchPlan(settings, "B");
  return `You are a job-sourcing scanner. Execute the SEARCH PLAN below using the web_search tool (budget ${settings.searchCaps.trackB} searches — follow the plan in order; skip a query only if earlier results already covered it). Then return the best CURRENTLY-OPEN roles as compact JSON.

CRITERIA (Track B — remote-first enterprises, global):
- Fully remote roles at ESTABLISHED companies (no early-stage startups: funding-stage language, tiny headcount, "wear many hats" are disqualifiers)
- HARD GATE: the role must be workable from India. If it restricts residency to US/EU/other regions or excludes India, DROP it entirely — do not include it in the output. Count drops in dropped_ineligible.
- Non-technical ops / program / transformation roles
- Manager / Senior Manager / Director band
- Comp floor $${f.trackB_USD.toLocaleString()} USD; flag shift expectations honestly (us_night is common and fine to report)

SEARCH PLAN:
${plan.map((q, i) => `${i + 1}. ${q}`).join("\n")}

OUTPUT — respond with ONLY this JSON. No preamble, no markdown, no code fences.
Max 12 roles, ranked best-fit first. Keep EVERY string short (rationale ≤ 15 words, wlb_notes ≤ 10 words):
{"dropped_ineligible":0,"roles":[{"company":"","title":"","url":"","source":"domain only","location":"","remote_type":"remote","india_eligible":true,"comp_signal":{"amount":0,"currency":"USD"},"shift_signal":"india_day|mixed|us_night","wlb_notes":"","fit":0,"rationale":""}]}
comp_signal amount is absolute annual USD; set comp_signal to null when pay is not stated. india_eligible must be true for every role you return — set dropped_ineligible to how many otherwise-good roles you discarded for failing the India gate.`;
}

// --- API call ---------------------------------------------------------------
// Mirrors the Career OS callClaudeAPI pattern, plus the web-search tool.
// NOTE (spec §4/§8): the request carries no key or auth header of any kind —
// running inside Claude.ai IS the auth. max_tokens is pinned at 1000.
async function callScanAPI({ settings, systemPrompt, userMessage, maxUses, track }) {
  const tool = { type: "web_search_20250305", name: "web_search", max_uses: maxUses };
  // Optional hard domain restriction (settings toggle, default OFF — spec §3):
  // subdomains are automatically included by the API.
  if (settings.restrictToSourceDomains) {
    tool.allowed_domains = settings.sources
      .filter(s => s.enabled && (s.track === track || s.track === "AB"))
      .map(s => s.domain);
  }
  const body = {
    model: settings.model,
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    tools: [tool],
  };
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API error ${response.status} — try again in a minute`);
  const data = await response.json();
  // The response interleaves text blocks with server_tool_use (searches) and
  // web_search_tool_result blocks; we want the text and the search count.
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  const searchesUsed = (data.content || []).filter(b => b.type === "server_tool_use").length;
  return { text, searchesUsed, stopReason: data.stop_reason };
}

// --- Defensive parser -------------------------------------------------------
// The contract says "JSON only", but we never trust that: strip code fences,
// slice from first { to last }, validate every field, cap at 12, and (Track B)
// drop anything not positively India-eligible — the §2 extraction gate.
function parseScanJson(text, track) {
  let t = (text || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{"), end = t.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("response contained no JSON object");
  const parsed = JSON.parse(t.slice(start, end + 1));
  const list = Array.isArray(parsed.roles) ? parsed.roles : [];
  let droppedIneligible = Number(parsed.dropped_ineligible) || 0;

  const roles = list.slice(0, 12).map(r => ({
    track,
    company: String(r.company || "").slice(0, 80),
    title: String(r.title || "").slice(0, 120),
    url: String(r.url || "").slice(0, 300),
    source: String(r.source || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].slice(0, 60),
    location: String(r.location || "").slice(0, 80),
    remote_type: ["remote", "hybrid", "onsite"].includes(r.remote_type) ? r.remote_type : "unknown",
    // Track A roles are India-based by definition; Track B needs the explicit flag.
    india_eligible: track === "A" ? true : r.india_eligible === true,
    comp_signal: (r.comp_signal && typeof r.comp_signal.amount === "number" && r.comp_signal.amount > 0)
      ? { amount: r.comp_signal.amount, currency: r.comp_signal.currency === "USD" ? "USD" : (r.comp_signal.currency === "INR" ? "INR" : (track === "A" ? "INR" : "USD")) }
      : null,
    shift_signal: ["india_day", "mixed", "us_night"].includes(r.shift_signal) ? r.shift_signal : "mixed",
    wlb_notes: String(r.wlb_notes || "").slice(0, 160),
    fit_score: Math.max(0, Math.min(100, Math.round(Number(r.fit) || 0))),
    rationale: String(r.rationale || "").slice(0, 240),
  })).filter(r => r.company && r.title);

  // Belt-and-braces Track B gate: if the model returned an ineligible role
  // despite instructions, drop it here — ineligible roles are never stored.
  let gated = roles;
  if (track === "B") {
    gated = roles.filter(r => r.india_eligible === true);
    droppedIneligible += roles.length - gated.length;
  }
  return { roles: gated, droppedIneligible };
}

// ============================================================
// SECTION 2E: FIT SCORING (Milestone 4 — spec §6)
// ============================================================
// Deterministic 0-100 score computed CLIENT-SIDE from the extracted signals
// and the weights in settings. The model's own fit estimate (from M3) is kept
// as model_fit for reference, but ranking uses this score — so a weights edit
// in Settings changes ranking on the next scan without touching code.

// Deduction marker lists (spec §6). On Track B these are the primary
// stability filter — there is no pre-vetted company list doing that work.
const STARTUP_MARKERS = ["startup", "early stage", "seed round", "series a", "series b", "series c", "wear many hats", "scrappy", "founding team", "fast paced startup"];
const TECH_MARKERS = ["software engineer", "developer", "sde", "full stack", "backend", "frontend", "devops", "data engineer", "machine learning", "coding required"];
const SUB_MANAGER_MARKERS = ["analyst", "associate", "coordinator", "specialist", "intern", "account executive"];

// Each sub-score returns 0..1; the weighted sum is then hit with deductions.

function roleFamilyScore(role, settings) {
  const t = normalizeText(role.title);
  // Split clusters like "operations manager OR operations director" into terms.
  const terms = settings.keywordClusters
    .flatMap(c => c.split(/\s+OR\s+|\//i)).map(normalizeText).filter(Boolean);
  if (terms.some(term => t.includes(term))) return 1.0;
  const generic = ["operations", "program", "transformation", "process", "revenue", "collections", "receivables", "order to cash", "client", "implementation", "delivery"];
  if (generic.some(g => t.includes(g))) return 0.7;
  return 0.3;
}

function remoteFlexScore(role) {
  return { remote: 1.0, hybrid: 0.7, onsite: 0.2 }[role.remote_type] ?? 0.5;
}

function seniorityScore(role) {
  const t = " " + normalizeText(role.title) + " ";
  if (/ (director|head of|vice president|vp|avp|general manager) /.test(t)) return 1.0;
  if (/ senior manager /.test(t)) return 0.9;
  if (/ (manager|lead) /.test(t)) return 0.8;
  if (SUB_MANAGER_MARKERS.some(m => t.includes(" " + m + " "))) return 0.2;
  return 0.6;
}

// Comp vs the per-track floor (spec §2). Unknown comp scores neutral 0.5 —
// missing data shouldn't sink an otherwise strong role.
function compScore(role, settings) {
  const c = role.comp_signal;
  if (!c || !c.amount) return 0.5;
  const f = settings.compFloors;
  if (role.track === "A") {
    if (c.currency !== "INR") return 0.5; // can't compare confidently
    if (c.amount >= f.trackA_LPA) return 1.0;
    // 30-50L band is acceptable at financial-services GCCs (tier 1 list).
    const co = normalizeText(role.company);
    const finServ = settings.companyTiers.tier1.some(x => {
      const n = normalizeText(x);
      return n.includes(co) || co.includes(n);
    });
    if (finServ && c.amount >= f.trackA_gccBandMin && c.amount <= f.trackA_gccBandMax) return 0.8;
    return Math.max(0, Math.min(1, c.amount / f.trackA_LPA));
  }
  if (c.currency !== "USD") return 0.5;
  return c.amount >= f.trackB_USD ? 1.0 : Math.max(0, Math.min(1, c.amount / f.trackB_USD));
}

function shiftScore(role) {
  return { india_day: 1.0, mixed: 0.7, us_night: 0.4 }[role.shift_signal] ?? 0.7;
}

// WLB / stability: being on the vetted Track A tier list is the strongest
// signal; otherwise look for stability language in the extracted notes.
function wlbScore(role, settings) {
  const co = normalizeText(role.company);
  const allTiers = [...settings.companyTiers.tier1, ...settings.companyTiers.tier2, ...settings.companyTiers.tier3].map(normalizeText);
  const inTiers = allTiers.some(t => t === co || t.includes(co) || co.includes(t));
  if (inTiers) return 1.0;
  const notes = normalizeText((role.wlb_notes || "") + " " + (role.rationale || ""));
  if (/(stable|established|enterprise|handbook|async|work life|wlb first)/.test(notes)) return 0.85;
  return 0.6;
}

// The scorer. Returns the clamped score plus a human-readable breakdown so
// the reasoning is visible on every role card (non-developer verifiability).
// NOTE: Track B india_eligible=false roles never reach this function — they
// are dropped at extraction by parseScanJson (spec §2 hard gate).
function scoreRole(role, settings) {
  const w = settings.scoringWeights;
  const parts = [
    ["role", roleFamilyScore(role, settings), w.roleFamily],
    ["remote", remoteFlexScore(role), w.remoteFlex],
    ["seniority", seniorityScore(role), w.seniority],
    ["comp", compScore(role, settings), w.comp],
    ["shift", shiftScore(role), w.shift],
    ["wlb", wlbScore(role, settings), w.wlb],
  ];
  let score = parts.reduce((sum, [, s, weight]) => sum + s * weight, 0);
  const notes = parts.map(([n, s, weight]) => `${n} ${Math.round(s * weight)}/${weight}`);

  // Deductions (spec §6) — scanned across all extracted text for the role.
  const blob = normalizeText([role.company, role.title, role.wlb_notes, role.rationale].join(" "));
  if (STARTUP_MARKERS.some(m => blob.includes(m))) { score -= 15; notes.push("−15 startup markers"); }
  if (TECH_MARKERS.some(m => blob.includes(m))) { score -= 20; notes.push("−20 pure-tech"); }
  const t = " " + normalizeText(role.title) + " ";
  const hasSenior = / (director|head of|vice president|vp|avp|general manager|manager|lead) /.test(t);
  if (!hasSenior && SUB_MANAGER_MARKERS.some(m => t.includes(" " + m + " "))) { score -= 10; notes.push("−10 sub-manager"); }

  return { score: Math.max(0, Math.min(100, Math.round(score))), notes: notes.join(" · ") };
}

// Attach scores to a batch of freshly-parsed roles (used by scan + samples).
function applyScoring(roles, settings) {
  return roles.map(r => {
    const { score, notes } = scoreRole(r, settings);
    return { ...r, model_fit: r.fit_score, fit_score: score, score_notes: notes };
  });
}

/* ---------------------------------------------------------------
   TEST HARNESS (unit-style) — paste alongside the functions above:

   const S = DEFAULT_SETTINGS;
   // strong Track A role at a tier-1 company scores high
   scoreRole({ track:"A", company:"Northern Trust",
     title:"Senior Manager Operations", remote_type:"remote",
     comp_signal:{amount:45,currency:"INR"}, shift_signal:"india_day",
     wlb_notes:"", rationale:"" }, S).score >= 90            // → true

   // startup markers cost 15 (Track B's stability filter)
   const base = { track:"B", company:"Acme", title:"Operations Manager",
     remote_type:"remote", comp_signal:{amount:60000,currency:"USD"},
     shift_signal:"mixed", wlb_notes:"", rationale:"" };
   scoreRole(base, S).score -
   scoreRole({ ...base, wlb_notes:"seed round, wear many hats" }, S).score
     === 15                                                   // → true

   // GCC band: ₹34L at a tier-1 fin-services company beats ₹34L elsewhere
   scoreRole({ ...base, track:"A", company:"Wells Fargo India",
     comp_signal:{amount:34,currency:"INR"} }, S).score >
   scoreRole({ ...base, track:"A", company:"Unknown Co",
     comp_signal:{amount:34,currency:"INR"} }, S).score       // → true
   --------------------------------------------------------------- */

// ============================================================
// SECTION 3: SMALL SHARED UI PIECES (Career OS patterns)
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

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
        <Icon size={24} className="text-gray-500" />
      </div>
      <h3 className="text-sm font-medium text-gray-300 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-xs">{description}</p>
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

// ============================================================
// SECTION 4: ZONE — SCAN (Milestone 3: live engine)
// ============================================================
// Scan state lives in the app root (so switching tabs mid-scan doesn't lose
// it); this zone renders the track cards, the trigger, and per-track status.

function ZoneScan({ data, scan, scanning, onScan }) {
  const s = data.settings;
  const tierCount = s.companyTiers.tier1.length + s.companyTiers.tier2.length + s.companyTiers.tier3.length;
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white">Scan</h2>
        <p className="text-xs text-gray-500 mt-0.5">One click runs both tracks · hard cap {s.searchCaps.trackA + s.searchCaps.trackB} searches per scan</p>
      </div>

      {/* Track A summary card */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="amber">Track A</Badge>
          <span className="text-xs font-medium text-gray-200">Financial services / GCC · India</span>
          <span className="ml-auto text-[10px] text-gray-500">{s.searchCaps.trackA} searches</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400">
          <span className="inline-flex items-center gap-1"><IndianRupee size={11} />₹{s.compFloors.trackA_LPA} LPA+ (GCC band {s.compFloors.trackA_gccBandMin}–{s.compFloors.trackA_gccBandMax}L)</span>
          <span className="inline-flex items-center gap-1"><Building2 size={11} />{tierCount} target companies</span>
          <span className="inline-flex items-center gap-1"><Clock size={11} />shift flagged</span>
        </div>
      </div>

      {/* Track B summary card */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="teal">Track B</Badge>
          <span className="text-xs font-medium text-gray-200">Remote-first enterprises · global</span>
          <span className="ml-auto text-[10px] text-gray-500">{s.searchCaps.trackB} searches</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400">
          <span className="inline-flex items-center gap-1"><DollarSign size={11} />${(s.compFloors.trackB_USD / 1000).toFixed(0)}K USD floor</span>
          <span className="inline-flex items-center gap-1"><Globe size={11} />India-eligible = hard gate</span>
          <span className="inline-flex items-center gap-1"><Building2 size={11} />portal-driven, no company list</span>
        </div>
      </div>

      {/* Scan trigger — one click runs Track A then Track B, merging results
          into the pipeline as each track finishes (progressive render). */}
      <button
        onClick={onScan}
        disabled={scanning}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {scanning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
        {scanning ? "Scanning…" : "Run Scan"}
      </button>

      {/* Per-track status cards: pending → running → done/error. One track
          failing never hides the other's results (visible error states). */}
      {(scan.a.state !== "idle" || scan.b.state !== "idle") && (
        <div className="space-y-2">
          {[["a", "Track A", "amber"], ["b", "Track B", "teal"]].map(([k, label, variant]) => {
            const t = scan[k];
            return (
              <div key={k} className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant={variant}>{label}</Badge>
                  {t.state === "running" && <span className="flex items-center gap-1.5 text-amber-300"><Loader2 size={12} className="animate-spin" />{t.note}</span>}
                  {t.state === "done" && <span className="flex items-center gap-1.5 text-emerald-300"><Check size={12} />{t.note}</span>}
                  {t.state === "error" && <span className="flex items-center gap-1.5 text-red-300"><AlertCircle size={12} />failed</span>}
                  {t.state === "pending" && <span className="text-gray-500">queued</span>}
                </div>
                {t.state === "error" && <p className="text-[11px] text-red-300/80 leading-relaxed">{t.note}</p>}
              </div>
            );
          })}
          {scan.summary && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
              {scan.summary} — see the Pipeline tab.
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-gray-600 text-center">
        Manual trigger only · searches stop at the cap via max_uses · results merge into the pipeline with dedupe.
      </p>
    </div>
  );
}

// ============================================================
// SECTION 5: ZONE — PIPELINE (Milestone 2: list + star/archive)
// ============================================================

// Compact comp display: Track A stores lakhs-per-annum, Track B absolute USD.
function compLabel(c) {
  if (!c || !c.amount) return null;
  if (c.currency === "INR") return `₹${c.amount}L`;
  if (c.currency === "USD") return `$${Math.round(c.amount / 1000)}K`;
  return `${c.amount} ${c.currency}`;
}

// Shift badge colors: india_day is the good case, us_night is the visible
// tradeoff (spec §2 — the flag working, not noise).
const SHIFT_BADGE = {
  india_day: { label: "india day", variant: "green" },
  mixed: { label: "mixed shift", variant: "blue" },
  us_night: { label: "US night", variant: "amber" },
};

function shortDate(iso) {
  return String(iso || "").slice(0, 10);
}

// One role row: title/company, badge strip, fit score, star/archive actions.
function RoleCard({ role, onStar, onArchive }) {
  const shift = SHIFT_BADGE[role.shift_signal] || null;
  const comp = compLabel(role.comp_signal);
  const starred = role.status === "starred";
  const archived = role.status === "archived";
  return (
    <div className={`p-3 rounded-lg bg-white/5 border space-y-2 ${starred ? "border-amber-500/30" : "border-white/5"} ${archived ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-200 leading-snug">{role.title}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">{role.company} · {role.location}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-amber-400 leading-none">{role.fit_score}</div>
          <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">fit</div>
        </div>
      </div>

      {/* Badge strip: track · source · shift · remote · comp · eligibility */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant={role.track === "B" ? "teal" : "amber"}>Track {role.track}</Badge>
        <Badge>{role.source}</Badge>
        {shift && <Badge variant={shift.variant}>{shift.label}</Badge>}
        {role.remote_type && <Badge variant="blue">{role.remote_type}</Badge>}
        {comp && <Badge variant="green">{comp}</Badge>}
        {role.track === "B" && role.india_eligible && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400"><Globe size={10} />India-eligible</span>
        )}
      </div>

      {role.rationale && <p className="text-[10px] text-gray-500 leading-relaxed">{role.rationale}</p>}
      {/* M4: the deterministic score breakdown — reasoning stays visible */}
      {role.score_notes && (
        <p className="text-[9px] text-gray-600 leading-relaxed" style={{ fontFamily: "ui-monospace, monospace" }}>
          {role.score_notes}{role.model_fit != null ? ` · model est ${role.model_fit}` : ""}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onStar(role.id)}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded transition-colors ${starred ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-gray-400 hover:text-amber-400"}`}
        >
          <Star size={11} fill={starred ? "currentColor" : "none"} /> {starred ? "Starred" : "Star"}
        </button>
        <button
          onClick={() => onArchive(role.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
        >
          {archived ? <><ArchiveRestore size={11} /> Restore</> : <><Archive size={11} /> Archive</>}
        </button>
        {role.url && (
          <a href={role.url} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300">
            View <ExternalLink size={11} />
          </a>
        )}
      </div>

      <div className="text-[9px] text-gray-600">first seen {shortDate(role.first_seen)} · last seen {shortDate(role.last_seen)}</div>
    </div>
  );
}

function ZonePipeline({ data, onSaveRoles }) {
  const roles = data.roles || [];
  const [filter, setFilter] = useState("active"); // active | starred | archived | all
  const [confirmClear, setConfirmClear] = useState(false);

  // Status changes rewrite the whole array to storage (spec §5 batching).
  const setStatus = (id, status) =>
    onSaveRoles(roles.map(r => r.id === id ? { ...r, status } : r));
  const toggleStar = id => {
    const r = roles.find(x => x.id === id);
    if (r) setStatus(id, r.status === "starred" ? "new" : "starred");
  };
  const toggleArchive = id => {
    const r = roles.find(x => x.id === id);
    if (r) setStatus(id, r.status === "archived" ? "new" : "archived");
  };

  // Sample loader (M2 stub; kept as a fixture). Samples flow through the SAME
  // scoring + merge path as real scan results, so pressing it twice
  // demonstrates dedupe and the cards show real computed score breakdowns.
  const loadSamples = () => {
    const scored = applyScoring(SAMPLE_ROLES, data.settings);
    const { roles: merged, found, added } = mergeRoles(roles, scored);
    onSaveRoles(merged, `Samples merged: ${found} found · ${added} new${added === 0 ? " (dedupe working)" : ""}`);
  };
  const clearAll = () => { onSaveRoles([], "Pipeline cleared"); setConfirmClear(false); };

  const counts = {
    active: roles.filter(r => r.status !== "archived").length,
    starred: roles.filter(r => r.status === "starred").length,
    archived: roles.filter(r => r.status === "archived").length,
    all: roles.length,
  };
  const shown = roles
    .filter(r =>
      filter === "all" ? true :
      filter === "starred" ? r.status === "starred" :
      filter === "archived" ? r.status === "archived" :
      r.status !== "archived")
    .sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0)); // ranked by fit

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Pipeline</h2>
          <p className="text-xs text-gray-500 mt-0.5">{counts.all} roles · {counts.starred} starred · ranked by fit</p>
        </div>
        <button onClick={loadSamples} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-[11px] hover:text-gray-200 transition-colors" title="Milestone 2 stub — replaced by the real scan in M3">
          <FlaskConical size={12} /> Load samples
        </button>
      </div>

      {roles.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Roles Yet"
          description="Run a scan from the Scan tab (Milestone 3) — or tap Load samples above to try the list, star/archive, and dedupe with realistic stub data."
        />
      ) : (
        <>
          {/* Status filter chips */}
          <div className="flex gap-1.5">
            {[["active", "Active"], ["starred", "Starred"], ["archived", "Archived"], ["all", "All"]].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${filter === id ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}>
                {label} <span className="opacity-60">{counts[id]}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {shown.length === 0 ? (
              <div className="text-[11px] text-gray-600 text-center py-6">Nothing under this filter.</div>
            ) : (
              shown.map(r => <RoleCard key={r.id} role={r} onStar={toggleStar} onArchive={toggleArchive} />)
            )}
          </div>

          {/* Destructive clear needs a second tap */}
          {!confirmClear ? (
            <button onClick={() => setConfirmClear(true)} className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-red-400 transition-colors">
              <Trash2 size={11} /> Clear all roles
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setConfirmClear(false)} className="flex-1 py-1.5 text-xs bg-white/5 rounded text-gray-400">Cancel</button>
              <button onClick={clearAll} className="flex-1 py-1.5 text-xs bg-red-500/20 rounded text-red-300">Delete {counts.all} roles</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// SECTION 6: ZONE — LOG (Milestone 4: persistent scan history)
// ============================================================
// Every scan attempt is recorded — searches used vs. the cap per track
// (acceptance criterion 5), found/new counts, the India-gate drop count
// (criterion 4: if 0, we say so explicitly), and any errors.

function ZoneLog({ data }) {
  const scans = (data.scans || []).slice().reverse(); // newest first
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white">Scan Log</h2>
        <p className="text-xs text-gray-500 mt-0.5">{scans.length} scans recorded · searches shown as used/cap</p>
      </div>
      {scans.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No Scans Yet"
          description="Every scan logs its timestamp, searches used per track (vs. the cap), roles found vs. new, and India-gate drops."
        />
      ) : (
        <div className="space-y-2">
          {scans.map(sc => (
            <div key={sc.id} className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-300">{String(sc.timestamp || "").slice(0, 10)}</span>
                <span className="text-gray-600">{String(sc.timestamp || "").slice(11, 16)}</span>
                {sc.duration_s != null && <span className="text-[10px] text-gray-600">· {sc.duration_s}s</span>}
                <span className="ml-auto text-[11px]">
                  <span className="text-gray-200 font-medium">{sc.roles_found}</span>
                  <span className="text-gray-500"> found · </span>
                  <span className="text-emerald-400 font-medium">{sc.roles_new}</span>
                  <span className="text-gray-500"> new</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant={sc.searches_used_a <= sc.searches_cap_a ? "amber" : "red"}>A: {sc.searches_used_a}/{sc.searches_cap_a} searches</Badge>
                <Badge variant={sc.searches_used_b <= sc.searches_cap_b ? "teal" : "red"}>B: {sc.searches_used_b}/{sc.searches_cap_b} searches</Badge>
                {sc.dropped_ineligible > 0
                  ? <Badge variant="blue">{sc.dropped_ineligible} dropped (India gate)</Badge>
                  : <span className="text-[10px] text-gray-600">India gate: 0 dropped — none encountered this scan</span>}
              </div>
              {(sc.errors || []).length > 0 && (
                <div className="text-[11px] text-red-300/90 flex items-start gap-1.5">
                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                  <span>{sc.errors.join(" · ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SECTION 7: ZONE — SETTINGS (read-only in M1; editor is M5)
// ============================================================
// Shows the live settings object so the user can verify defaults are
// stored and loaded correctly. Editing arrives in Milestone 5.

function SettingsRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs border-b border-white/5 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-medium text-right">{value}</span>
    </div>
  );
}

function ZoneSettings({ data, onResetDefaults }) {
  const s = data.settings;
  const w = s.scoringWeights;
  return (
    <div className="p-4 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white">Settings</h2>
        <p className="text-xs text-gray-500 mt-0.5">Read-only view — the in-app editor arrives in Milestone 5</p>
      </div>

      <div>
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><SlidersHorizontal size={11} />Engine</div>
        <SettingsRow label="Model" value={s.model} />
        <SettingsRow label="Search cap (A / B)" value={`${s.searchCaps.trackA} / ${s.searchCaps.trackB}`} />
        <SettingsRow label="Restrict search to source domains" value={s.restrictToSourceDomains ? "ON" : "OFF (default)"} />
      </div>

      <div>
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><IndianRupee size={11} />Comp floors</div>
        <SettingsRow label="Track A floor" value={`₹${s.compFloors.trackA_LPA} LPA`} />
        <SettingsRow label="Track A GCC band" value={`₹${s.compFloors.trackA_gccBandMin}–${s.compFloors.trackA_gccBandMax}L`} />
        <SettingsRow label="Track B floor" value={`$${s.compFloors.trackB_USD.toLocaleString()} USD`} />
      </div>

      <div>
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Building2 size={11} />Track A company tiers</div>
        {["tier1", "tier2", "tier3"].map(t => (
          <div key={t} className="py-1.5 border-b border-white/5 last:border-0">
            <div className="text-[10px] text-gray-500 uppercase mb-1">{t}</div>
            <div className="flex flex-wrap gap-1">
              {s.companyTiers[t].map(c => <Badge key={c}>{c}</Badge>)}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><ListChecks size={11} />Keyword clusters</div>
        <div className="flex flex-wrap gap-1">
          {s.keywordClusters.map(k => <Badge key={k} variant="blue">{k}</Badge>)}
        </div>
      </div>

      <div>
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Globe size={11} />Sources</div>
        {s.sources.map(src => (
          <div key={src.domain} className="flex items-center gap-2 py-1.5 text-xs border-b border-white/5 last:border-0">
            <span className={`w-1.5 h-1.5 rounded-full ${src.enabled ? "bg-emerald-400" : "bg-gray-700"}`} />
            <span className="text-gray-300">{src.label}</span>
            <span className="text-gray-600 text-[10px]">{src.domain}</span>
            <span className="ml-auto flex items-center gap-1">
              <Badge variant={src.track === "B" ? "teal" : src.track === "AB" ? "blue" : "amber"}>{src.track === "AB" ? "A+B" : src.track}</Badge>
              <span className="text-[10px] text-gray-500">P{src.priority}</span>
            </span>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Fit-scoring weights (total {Object.values(w).reduce((a, b) => a + b, 0)})</div>
        <SettingsRow label="Role family" value={w.roleFamily} />
        <SettingsRow label="Remote / hybrid flexibility" value={w.remoteFlex} />
        <SettingsRow label="Seniority" value={w.seniority} />
        <SettingsRow label="Comp vs floor" value={w.comp} />
        <SettingsRow label="Shift timing" value={w.shift} />
        <SettingsRow label="WLB / stability" value={w.wlb} />
      </div>

      <button
        onClick={onResetDefaults}
        className="w-full py-2 text-xs text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
      >
        Reset settings to defaults
      </button>

      <div className="pt-2 border-t border-white/5 text-xs text-gray-600 space-y-0.5">
        <div>Job Sourcing Radar v{APP_VERSION}</div>
        <div>Storage: window.storage · personal scope (shared: false)</div>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 8: APP ROOT
// ============================================================

export default function JobSourcingRadar() {
  const [zone, setZone] = useState("scan");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [data, setData] = useState({ settings: DEFAULT_SETTINGS, roles: DEFAULT_ROLES, scans: DEFAULT_SCANS });

  // Load everything once on mount. First-ever run also persists the default
  // settings so they exist in storage from day one.
  useEffect(() => {
    (async () => {
      try {
        const loaded = await loadAllData();
        setData(loaded);
        if (!loaded.settings.lastUpdated) {
          const seeded = { ...loaded.settings, lastUpdated: new Date().toISOString() };
          const ok = await storageSet(STORAGE_KEYS.settings, seeded);
          if (ok) setData(d => ({ ...d, settings: seeded }));
        }
      } catch (err) {
        // Visible error state, never a blank screen (spec acceptance criterion 7).
        setError("Failed to load data: " + (err?.message || err));
      }
      setLoading(false);
    })();
  }, []);

  // Write the whole roles array to storage, then reflect it in state.
  // All role mutations (star, archive, merge, clear) flow through here.
  const saveRoles = useCallback(async (nextRoles, toastMsg) => {
    const ok = await storageSet(STORAGE_KEYS.roles, nextRoles);
    if (ok) {
      setData(d => ({ ...d, roles: nextRoles }));
      if (toastMsg) setToast({ message: toastMsg, type: "success" });
    } else {
      setToast({ message: "Could not save roles — storage unavailable", type: "error" });
    }
    return ok;
  }, []);

  // Persist the whole scan-log array (spec §5 batching — one key, whole write).
  const saveScans = useCallback(async (nextScans) => {
    const ok = await storageSet(STORAGE_KEYS.scans, nextScans);
    if (ok) setData(d => ({ ...d, scans: nextScans }));
    else setToast({ message: "Could not save scan log — storage unavailable", type: "error" });
    return ok;
  }, []);

  // ---- Scan orchestration (Milestone 3) ----
  // Sequential: Track A call → parse → merge → save (pipeline updates
  // immediately), then Track B the same way. Each track has its own
  // try/catch so one failure never hides the other's results.
  const IDLE_SCAN = { a: { state: "idle", note: "" }, b: { state: "idle", note: "" }, summary: null, meta: null };
  const [scan, setScan] = useState(IDLE_SCAN);
  const [scanning, setScanning] = useState(false);

  const runScan = useCallback(async () => {
    if (scanning) return;
    setScanning(true);
    const startedAt = Date.now();
    const s = data.settings;
    setScan({ a: { state: "running", note: `searching (cap ${s.searchCaps.trackA})…` }, b: { state: "pending", note: "" }, summary: null, meta: null });

    let rolesNow = data.roles || [];
    const meta = { searches_used_a: 0, searches_used_b: 0, found: 0, added: 0, dropped_ineligible: 0, errors: [] };

    // --- Track A ---
    try {
      const res = await callScanAPI({
        settings: s, track: "A",
        systemPrompt: buildTrackASystem(s),
        userMessage: "Run the Track A scan now. Respond with ONLY the JSON.",
        maxUses: s.searchCaps.trackA,
      });
      meta.searches_used_a = res.searchesUsed;
      const { roles: found } = parseScanJson(res.text, "A");
      // M4: deterministic client-side scoring replaces the model's estimate.
      const merged = mergeRoles(rolesNow, applyScoring(found, s));
      rolesNow = merged.roles;
      meta.found += merged.found; meta.added += merged.added;
      await saveRoles(rolesNow); // progressive render: A results land before B runs
      setScan(sc => ({ ...sc, a: { state: "done", note: `${merged.found} found · ${merged.added} new · ${res.searchesUsed} searches` } }));
    } catch (err) {
      meta.errors.push("A: " + (err?.message || err));
      setScan(sc => ({ ...sc, a: { state: "error", note: String(err?.message || err) } }));
    }

    // --- Track B ---
    setScan(sc => ({ ...sc, b: { state: "running", note: `searching (cap ${s.searchCaps.trackB})…` } }));
    try {
      const res = await callScanAPI({
        settings: s, track: "B",
        systemPrompt: buildTrackBSystem(s),
        userMessage: "Run the Track B scan now. Respond with ONLY the JSON.",
        maxUses: s.searchCaps.trackB,
      });
      meta.searches_used_b = res.searchesUsed;
      const { roles: found, droppedIneligible } = parseScanJson(res.text, "B");
      meta.dropped_ineligible = droppedIneligible;
      const merged = mergeRoles(rolesNow, applyScoring(found, s));
      rolesNow = merged.roles;
      meta.found += merged.found; meta.added += merged.added;
      await saveRoles(rolesNow);
      setScan(sc => ({ ...sc, b: { state: "done", note: `${merged.found} found · ${merged.added} new · ${res.searchesUsed} searches · ${droppedIneligible} dropped (India gate)` } }));
    } catch (err) {
      meta.errors.push("B: " + (err?.message || err));
      setScan(sc => ({ ...sc, b: { state: "error", note: String(err?.message || err) } }));
    }

    const secs = Math.round((Date.now() - startedAt) / 1000);
    const okAny = meta.found > 0 || meta.errors.length < 2;
    setScan(sc => ({
      ...sc,
      summary: okAny ? `Scan finished in ${secs}s: ${meta.found} roles found, ${meta.added} new` : null,
      meta,
    }));

    // M4: persist the scan-log entry (spec §5 radar:scans) — written even on
    // failure so the Log tab is an honest record of every attempt.
    const entry = {
      id: "scan-" + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      duration_s: secs,
      searches_used_a: meta.searches_used_a, searches_cap_a: s.searchCaps.trackA,
      searches_used_b: meta.searches_used_b, searches_cap_b: s.searchCaps.trackB,
      roles_found: meta.found, roles_new: meta.added,
      dropped_ineligible: meta.dropped_ineligible,
      errors: meta.errors,
    };
    await saveScans([...(data.scans || []), entry]);
    setScanning(false);
  }, [scanning, data.settings, data.roles, data.scans, saveRoles, saveScans]);

  const resetDefaults = useCallback(async () => {
    const fresh = { ...DEFAULT_SETTINGS, lastUpdated: new Date().toISOString() };
    const ok = await storageSet(STORAGE_KEYS.settings, fresh);
    if (ok) {
      setData(d => ({ ...d, settings: fresh }));
      setToast({ message: "Settings reset to defaults", type: "success" });
    } else {
      setToast({ message: "Could not write settings — storage unavailable", type: "error" });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={24} className="text-amber-400 animate-spin mx-auto mb-2" />
          <div className="text-xs text-gray-500">Loading Job Sourcing Radar…</div>
        </div>
      </div>
    );
  }

  const renderZone = () => {
    switch (zone) {
      case "scan": return <ZoneScan data={data} scan={scan} scanning={scanning} onScan={runScan} />;
      case "pipeline": return <ZonePipeline data={data} onSaveRoles={saveRoles} />;
      case "log": return <ZoneLog data={data} />;
      case "settings": return <ZoneSettings data={data} onResetDefaults={resetDefaults} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center gap-2">
        <Radar size={16} className="text-amber-400" />
        <h1 className="text-sm font-bold text-white tracking-tight">Job Sourcing Radar</h1>
        <span className="ml-auto text-[10px] text-gray-600">2-track · manual scan</span>
      </header>

      {/* Zone content */}
      <main className="flex-1 overflow-auto pb-20">
        {error && (
          <div className="mx-4 mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X size={12} /></button>
          </div>
        )}
        {renderZone()}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur border-t border-white/5 px-1 py-1.5 flex justify-around">
        {ZONES.map(z => {
          const Icon = z.icon;
          const active = zone === z.id;
          return (
            <button
              key={z.id}
              onClick={() => setZone(z.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${active ? "text-amber-400" : "text-gray-600 hover:text-gray-400"}`}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px]">{z.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
