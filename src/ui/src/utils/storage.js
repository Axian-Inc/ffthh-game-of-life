const isStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

const readStorage = (key) => {
  if (!isStorageAvailable()) {
    return { data: null, error: 'Storage unavailable' };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return { data: null, error: null };
    }
    const parsed = JSON.parse(raw);
    return { data: parsed, error: null };
  } catch (error) {
    return { data: null, error: 'Invalid storage data' };
  }
};

const writeStorage = (key, value) => {
  if (!isStorageAvailable()) {
    return { success: false, error: 'Storage unavailable' };
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: 'Unable to write storage' };
  }
};

export { isStorageAvailable, readStorage, writeStorage };
