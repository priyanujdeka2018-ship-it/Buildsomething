import { useState, useEffect, useCallback } from "react";
import {
  Radar, Briefcase, ScrollText, Settings, Search, Star,
  AlertCircle, Loader2, Check, X, Globe, IndianRupee, DollarSign,
  Building2, ListChecks, SlidersHorizontal, Clock,
} from "lucide-react";

// ============================================================
// JOB SOURCING RADAR — v1 (Artifact Edition)
// Spec: apps/job-sourcing-radar/docs/spec.md
//
// MILESTONE 1 (this file's current state): app shell only.
//   - Four zones: Scan / Pipeline / Log / Settings
//   - Default settings object (spec §3 targets+sources, §6 weights, §7 caps)
//   - window.storage load/save layer with try/catch (personal scope,
//     explicit shared:false on EVERY call — spec §8)
//   - Loading, empty, and error states
// Coming next: M2 roles list + star/archive, M3 scan engine,
// M4 scoring, M5 settings editor.
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

const APP_VERSION = "1.0.0-m1";

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
// SECTION 4: ZONE — SCAN
// ============================================================
// M1: shows what a scan WILL do (both track cards, criteria summary, caps).
// The actual scan engine (two Messages API calls with web search) is M3;
// the button is present but disabled so the layout is real.

function ZoneScan({ data }) {
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

      {/* Scan trigger — wired up in Milestone 3 */}
      <button
        disabled
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg bg-amber-500/15 text-amber-400 opacity-30 cursor-not-allowed"
      >
        <Search size={14} /> Run Scan
      </button>
      <p className="text-[10px] text-gray-600 text-center">Scan engine arrives in Milestone 3 — this build is the app shell.</p>
    </div>
  );
}

// ============================================================
// SECTION 5: ZONE — PIPELINE
// ============================================================
// M1: empty state only. Role list, badges, star/archive land in M2.

function ZonePipeline({ data }) {
  const roles = data.roles || [];
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white">Pipeline</h2>
        <p className="text-xs text-gray-500 mt-0.5">{roles.length} roles stored</p>
      </div>
      {roles.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No Roles Yet"
          description="Run a scan from the Scan tab to fill the pipeline. Found roles are deduplicated, scored, and ranked here."
        />
      )}
    </div>
  );
}

// ============================================================
// SECTION 6: ZONE — LOG
// ============================================================
// M1: empty state only. Scan-log entries get written in M4.

function ZoneLog({ data }) {
  const scans = data.scans || [];
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white">Scan Log</h2>
        <p className="text-xs text-gray-500 mt-0.5">{scans.length} scans recorded</p>
      </div>
      {scans.length === 0 && (
        <EmptyState
          icon={ScrollText}
          title="No Scans Yet"
          description="Every scan logs its timestamp, searches used per track (vs. the cap), and how many roles were found vs. new."
        />
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
      case "scan": return <ZoneScan data={data} />;
      case "pipeline": return <ZonePipeline data={data} />;
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
