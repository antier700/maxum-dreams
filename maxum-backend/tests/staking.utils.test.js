const { roundMoney, parseAmount } = require('../utils/staking');

describe('roundMoney', () => {
  test('rounds to 8 decimal places', () => {
    expect(roundMoney(1.234567891)).toBe(1.23456789);
    expect(roundMoney(10)).toBe(10);
  });

  test('returns 0 for non-finite', () => {
    expect(roundMoney(NaN)).toBe(0);
    expect(roundMoney(Infinity)).toBe(0);
  });
});

describe('parseAmount', () => {
  test('accepts positive numbers and strings', () => {
    expect(parseAmount(100)).toBe(100);
    expect(parseAmount('50.5')).toBe(50.5);
    expect(parseAmount('  10  ')).toBe(10);
  });

  test('throws for invalid values', () => {
    expect(() => parseAmount(0)).toThrow(/Invalid amount/);
    expect(() => parseAmount(-1)).toThrow(/Invalid amount/);
    expect(() => parseAmount('abc')).toThrow(/Invalid amount/);
    expect(() => parseAmount('')).toThrow(/Invalid amount/);
  });

  test('applies roundMoney to result', () => {
    expect(parseAmount('1.234567891')).toBe(1.23456789);
  });
});
