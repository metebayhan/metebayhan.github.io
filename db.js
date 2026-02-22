// Simple in-memory "database" to simulate a backend API.
// In a real deployment, these endpoints would be implemented on a server
// with a real database. Here we just keep data in memory so that
// multiple open tabs (computer + TV) in the same origin share the data.

const TvWallDB = (() => {
  /** @type {Array<{id:string,title:string,message:string,phone:string,createdAt:string}>} */
  let entries = [];

  function getAll() {
    return entries.slice();
  }

  function setAll(next) {
    entries = next.slice();
  }

  function add(entry) {
    entries.push(entry);
  }

  function removeById(id) {
    entries = entries.filter((e) => e.id !== id);
  }

  function clear() {
    entries = [];
  }

  return {
    getAll,
    setAll,
    add,
    removeById,
    clear,
  };
})();

// Tiny "API" wrapper that mimics async network calls
const TvWallAPI = {
  async fetchEntries() {
    // simulate small network delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    return TvWallDB.getAll();
  },

  async saveEntries(entries) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    TvWallDB.setAll(entries);
    return TvWallDB.getAll();
  },

  async addEntry(entry) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    TvWallDB.add(entry);
    return TvWallDB.getAll();
  },

  async deleteEntry(id) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    TvWallDB.removeById(id);
    return TvWallDB.getAll();
  },

  async clearAll() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    TvWallDB.clear();
    return TvWallDB.getAll();
  },
};
