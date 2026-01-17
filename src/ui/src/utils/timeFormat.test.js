import formatTimeAgo from './timeFormat.js';

test('formats recent times correctly', () => {
  jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-10T10:00:00Z').getTime());
  expect(formatTimeAgo('2025-01-10T09:59:40Z')).toBe('just now');
  expect(formatTimeAgo('2025-01-10T09:50:00Z')).toBe('10 minutes ago');
  Date.now.mockRestore();
});

test('handles hour boundaries', () => {
  jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-10T12:00:00Z').getTime());
  expect(formatTimeAgo('2025-01-10T11:00:00Z')).toBe('about 1 hour ago');
  expect(formatTimeAgo('2025-01-10T08:00:00Z')).toBe('about 4 hours ago');
  Date.now.mockRestore();
});

test('handles day boundaries', () => {
  jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-10T12:00:00Z').getTime());
  expect(formatTimeAgo('2025-01-09T12:00:00Z')).toBe('1 days ago');
  Date.now.mockRestore();
});

test('handles invalid dates', () => {
  expect(formatTimeAgo('invalid')).toBe('just now');
});

test('handles future dates', () => {
  jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-10T12:00:00Z').getTime());
  expect(formatTimeAgo('2025-01-11T12:00:00Z')).toBe('just now');
  Date.now.mockRestore();
});
