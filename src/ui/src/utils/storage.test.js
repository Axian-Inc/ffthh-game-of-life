import * as storage from './storage.js';

const key = 'test-key';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('reports storage availability when localStorage works', () => {
  expect(storage.isStorageAvailable()).toBe(true);
});

test('readStorage returns null for missing keys', () => {
  expect(storage.readStorage(key)).toEqual({ data: null, error: null });
});

test('readStorage parses stored data', () => {
  const value = { name: 'Saved' };
  window.localStorage.setItem(key, JSON.stringify(value));

  expect(storage.readStorage(key)).toEqual({ data: value, error: null });
});

test('readStorage returns error for invalid json', () => {
  window.localStorage.setItem(key, '{');

  expect(storage.readStorage(key)).toEqual({ data: null, error: 'Invalid storage data' });
});

test('readStorage returns storage unavailable when localStorage throws', () => {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('fail');
  });

  expect(storage.readStorage(key)).toEqual({ data: null, error: 'Storage unavailable' });
});

test('writeStorage stores values successfully', () => {
  expect(storage.writeStorage(key, { value: 1 })).toEqual({ success: true, error: null });
});

test('writeStorage reports storage unavailable when localStorage throws', () => {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('fail');
  });

  expect(storage.writeStorage(key, { value: 1 })).toEqual({
    success: false,
    error: 'Storage unavailable',
  });
});

test('writeStorage reports failures when setItem throws after availability check', () => {
  const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
  setItemSpy.mockImplementationOnce(() => {});
  setItemSpy.mockImplementationOnce(() => {
    throw new Error('fail');
  });

  expect(storage.writeStorage(key, { value: 1 })).toEqual({
    success: false,
    error: 'Unable to write storage',
  });
});
