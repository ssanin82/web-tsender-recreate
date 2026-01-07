import { describe, it, expect } from 'vitest';
import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {

  it('returns 0 for empty string', () => {
    expect(calculateTotal('')).toBe(0);
  });

  it('parses single number', () => {
    expect(calculateTotal('42')).toBe(42);
  });

  it('parses comma-separated numbers', () => {
    expect(calculateTotal('1,2,3.5')).toBe(6.5);
  });

  it('parses newline-separated numbers', () => {
    expect(calculateTotal('10\n20\n30')).toBe(60);
  });

  it('parses mixed commas and newlines', () => {
    expect(calculateTotal('1,2\n3,4\n5')).toBe(15);
  });

  it('ignores whitespace around numbers', () => {
    expect(calculateTotal(' 1 , 2 \n 3 ')).toBe(6);
  });

  it('ignores invalid numbers', () => {
    expect(calculateTotal('1,abc,2')).toBe(3);
  });

  it('handles negative numbers', () => {
    expect(calculateTotal('-1,2,-3')).toBe(-2);
  });

  it('returns 0 if all values are invalid', () => {
    expect(calculateTotal('a,b,c')).toBe(0);
  });

});
