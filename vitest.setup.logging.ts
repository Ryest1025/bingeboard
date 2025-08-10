// vitest.setup.logging.ts - fail tests on unexpected console.error
import { beforeAll, afterAll, vi, expect } from 'vitest';

const allowedPatterns = [
  /Missing `Description`/, // known Radix Dialog warning we may address later
];

let errorMessages: string[] = [];

beforeAll(() => {
  const origError = console.error;
  // @ts-ignore
  console.error = (...args: any[]) => {
    const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    if (!allowedPatterns.some(p => p.test(msg))) {
      errorMessages.push(msg);
    }
    origError.apply(console, args as any);
  };
});

afterAll(() => {
  if (process.env.LOG_FILTER && errorMessages.length) {
    // eslint-disable-next-line no-console
    console.log('\nUnexpected console.error messages:\n', errorMessages.join('\n')); // show for debugging
    expect(errorMessages).toEqual([]);
  }
});
