import fs from 'node:fs';
import path from 'node:path';

const base = path.resolve(process.cwd(), 'src', 'styles');

const readFile = (file) => fs.readFileSync(path.join(base, file), 'utf8');

test('defines core CSS variables', () => {
  const content = readFile('variables.css');
  expect(content).toContain('--color-primary-teal');
  expect(content).toContain('--color-primary-purple');
  expect(content).toContain('--radius-lg');
  expect(content).toContain('--space-4');
});

test('includes gradient utility classes', () => {
  const content = readFile('utilities.css');
  expect(content).toContain('.gradient-primary');
});

test('typography scales with clamp', () => {
  const content = readFile('global.css');
  expect(content).toContain('clamp');
});
