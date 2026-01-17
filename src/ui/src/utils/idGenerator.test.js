import { generateId } from './idGenerator.js';

afterEach(() => {
  jest.restoreAllMocks();
});

test('generates unique IDs', () => {
  jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
  jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

  const first = generateId();
  const second = generateId();

  expect(first).not.toBe(second);
});

test('IDs are strings', () => {
  const id = generateId();
  expect(typeof id).toBe('string');
});

test('multiple calls produce different IDs', () => {
  const ids = new Set([generateId(), generateId(), generateId()]);
  expect(ids.size).toBe(3);
});
