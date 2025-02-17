import { describe, it, expect } from 'vitest';
import { sum } from '../../utils/sum';

describe('sum function', () => {
  it('adds two positive numbers', () => {
    expect(sum(2, 3)).greaterThan(4);
  });

  it('adds a positive and a negative number', () => {
    expect(sum(5, -2)).toBe(3);
  });

  it('adds two negative numbers', () => {
    expect(sum(-3, -7)).toBe(-10);
  });

  it('adds zero to a number', () => {
    expect(sum(4, 0)).toBe(4);
  });
});
