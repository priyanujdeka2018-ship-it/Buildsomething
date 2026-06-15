export const CLAUDE_API_KEY_STORAGE = "cos-claude-api-key";
export const CLAUDE_MODEL_STORAGE = "cos-claude-model";
export const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";

export function getClaudeApiKey() {
  try {
    return window.localStorage.getItem(CLAUDE_API_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

export function setClaudeApiKey(value) {
  try {
    const trimmed = String(value || "").trim();

    if (!trimmed) {
      window.localStorage.removeItem(CLAUDE_API_KEY_STORAGE);
      return false;
    }

    window.localStorage.setItem(CLAUDE_API_KEY_STORAGE, trimmed);
    return true;
  } catch {
    return false;
  }
}

export function clearClaudeApiKey() {
  try {
    window.localStorage.removeItem(CLAUDE_API_KEY_STORAGE);
    return true;
  } catch {
    return false;
  }
}

export function getClaudeModel() {
  try {
    return window.localStorage.getItem(CLAUDE_MODEL_STORAGE) || DEFAULT_CLAUDE_MODEL;
  } catch {
    return DEFAULT_CLAUDE_MODEL;
  }
}

export function setClaudeModel(value) {
  try {
    window.localStorage.setItem(CLAUDE_MODEL_STORAGE, value || DEFAULT_CLAUDE_MODEL);
    return true;
  } catch {
    return false;
  }
}