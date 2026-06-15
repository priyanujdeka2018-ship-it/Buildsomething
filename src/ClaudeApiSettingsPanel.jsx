import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import {
  clearClaudeApiKey,
  getClaudeApiKey,
  getClaudeModel,
  setClaudeApiKey,
  setClaudeModel,
} from "./claudeConfig";

export default function ClaudeApiSettingsPanel() {
  const [apiKey, setApiKey] = useState(() => getClaudeApiKey());
  const [model, setModel] = useState(() => getClaudeModel());
  const [status, setStatus] = useState(null);
  const [testing, setTesting] = useState(false);

  const save = () => {
    const saved = setClaudeApiKey(apiKey);
    setClaudeModel(model);

    setStatus(
      saved
        ? {
            type: "success",
            message: "Claude API key saved locally in this browser.",
          }
        : {
            type: "error",
            message: "Paste a Claude API key before saving.",
          }
    );
  };

  const clear = () => {
    clearClaudeApiKey();
    setApiKey("");
    setStatus({
      type: "info",
      message: "Claude API key cleared from this browser.",
    });
  };

  const test = async () => {
    const key = apiKey.trim();

    if (!key) {
      setStatus({
        type: "error",
        message: "Paste and save a Claude API key first.",
      });
      return;
    }

    setTesting(true);
    setStatus(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model,
          max_tokens: 20,
          system: "You are a connection test. Reply with exactly: OK",
          messages: [{ role: "user", content: "Test the API connection." }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `API error: ${response.status}${errorText ? ` - ${errorText.slice(0, 180)}` : ""}`
        );
      }

      const data = await response.json();
      const text = data.content?.map((block) => block.text || "").join(" ") || "";

      setStatus({
        type: text.toUpperCase().includes("OK") ? "success" : "info",
        message: text.toUpperCase().includes("OK")
          ? "Claude API connection works."
          : "Claude responded, but not with the expected test text.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Claude API test failed.",
      });
    }

    setTesting(false);
  };

  const statusClass =
    status?.type === "success"
      ? "bg-teal-500/10 border-teal-500/20 text-teal-300"
      : status?.type === "error"
        ? "bg-red-500/10 border-red-500/20 text-red-300"
        : "bg-blue-500/10 border-blue-500/20 text-blue-300";

  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-3">
      <div className="flex items-start gap-2">
        <Lock size={16} className="text-amber-400 mt-0.5" />
        <div>
          <label className="text-xs text-gray-300 font-semibold">
            Claude API Key
          </label>
          <p className="text-[11px] text-gray-500 mt-0.5">
            For personal testing only. Stored locally in this browser and not included in JSON export.
          </p>
        </div>
      </div>

      <input
        type="password"
        value={apiKey}
        onChange={(event) => setApiKey(event.target.value)}
        placeholder="sk-ant-api03-..."
        autoComplete="off"
        className="w-full bg-black/30 rounded-lg px-3 py-2 text-xs text-white border border-white/5 focus:border-amber-500/30 focus:outline-none"
      />

      <div>
        <label className="text-[11px] text-gray-500 uppercase tracking-wider">
          Claude Model
        </label>
        <select
          value={model}
          onChange={(event) => {
            setModel(event.target.value);
            setClaudeModel(event.target.value);
          }}
          className="mt-1 w-full bg-black/30 rounded-lg px-3 py-2 text-xs text-white border border-white/5 focus:border-amber-500/30 focus:outline-none"
        >
          <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
          <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
          <option value="claude-opus-4-8">Claude Opus 4.8</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={save}
          className="px-3 py-2 rounded-lg bg-amber-500/15 text-amber-300 text-xs hover:bg-amber-500/20 transition-colors"
        >
          Save
        </button>

        <button
          onClick={test}
          disabled={testing}
          className="px-3 py-2 rounded-lg bg-teal-500/15 text-teal-300 text-xs hover:bg-teal-500/20 transition-colors disabled:opacity-50"
        >
          {testing ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              Test
            </span>
          ) : (
            "Test"
          )}
        </button>

        <button
          onClick={clear}
          className="px-3 py-2 rounded-lg bg-red-500/10 text-red-300 text-xs hover:bg-red-500/15 transition-colors"
        >
          Clear
        </button>
      </div>

      {status && (
        <div className={`text-[11px] rounded-lg p-2 border ${statusClass}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}