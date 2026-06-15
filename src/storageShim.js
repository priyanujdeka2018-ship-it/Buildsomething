export function installStorageShim() {
  if (typeof window === "undefined") return;
  if (window.storage) return;

  window.storage = {
    async get(key) {
      const value = window.localStorage.getItem(key);
      return value == null ? null : { value };
    },

    async set(key, value) {
      window.localStorage.setItem(key, value);
      return { key, value };
    },

    async delete(key) {
      window.localStorage.removeItem(key);
      return true;
    }
  };
}
