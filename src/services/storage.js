/**
 * Synchronous local storage wrapper for React Native readiness.
 * In a web environment, this uses localStorage.
 * For React Native, this file can be replaced with a synchronous storage library like 'react-native-mmkv'.
 */

export const storage = {
  /**
   * Get a string value from storage.
   */
  getString: (key, fallback = null) => {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? v : fallback;
    } catch {
      return fallback;
    }
  },

  /**
   * Set a string value in storage.
   */
  setString: (key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, String(value));
      }
    } catch {
      // Ignored for quota exceeded or private mode
    }
  },

  /**
   * Get a parsed JSON object from storage.
   */
  getObject: (key, fallback = null) => {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },

  /**
   * Set a JSON object in storage.
   */
  setObject: (key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Ignored for quota exceeded or private mode
    }
  },

  /**
   * Remove an item from storage by key.
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignored
    }
  },

  /**
   * Clear all app-specific storage. Keep careful with this!
   */
  clearAll: () => {
    try {
      // Normally, you'd only clear keys with a specific prefix
      // but if the app owns the domain, clearing all is standard
      localStorage.clear();
    } catch {
      // Ignored
    }
  }
};
