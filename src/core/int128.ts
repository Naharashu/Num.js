/**
 * 128-bit integer implementation for Num.js TypeScript migration
 * Provides operations on 128-bit integers using BigInt
 */

import { InvalidParameterError } from '../types/errors.js';

/**
 * 128-bit integer class using BigInt for high-precision integer operations
 */
export class Int128 {
  private readonly _hi: bigint;
  private readonly _lo: bigint;

  /**
   * Create a new Int128 instance
   * @param hi - High 64 bits (default: 0n)
   * @param lo - Low 64 bits (default: 0n)
   */
  constructor(hi: bigint = 0n, lo: bigint = 0n) {
    this._hi = BigInt(hi);
    this._lo = BigInt(lo);
  }

  /**
   * Get high 64 bits
   */
  get hi(): bigint {
    return this._hi;
  }

  /**
   * Get low 64 bits
   */
  get lo(): bigint {
    return this._lo;
  }

  /**
   * Create Int128 from a BigInt value
   * @param num - BigInt value to convert
   * @returns New Int128 instance
   * 
   * @example
   * const int128 = Int128.fromInt128(123456789012345678901234567890n);
   */
  static fromInt128(num: bigint): Int128 {
    if (typeof num !== 'bigint') {
      throw new InvalidParameterError('num', 'bigint', num);
    }

    const mask = (1n << 64n) - 1n;
    let lo = num & mask;
    let hi = num >> 64n;
    
    if (num < 0) {
      hi = hi - 1n;
      lo = (1n << 64n) + lo;
    }

    return new Int128(hi, lo);
  }

  /**
   * Convert to BigInt
   * @returns BigInt representation
   * 
   * @example
   * const bigIntValue = int128.toInt128();
   */
  toInt128(): bigint {
    return (this._hi << 64n) + this._lo;
  }

  /**
   * Convert to hexadecimal string
   * @returns Hexadecimal string representation
   * 
   * @example
   * const hexString = int128.hex(); // "0x1a2b3c4d5e6f7890"
   */
  hex(): string {
    return '0x' + this.toInt128().toString(16);
  }

  /**
   * Convert to string
   * @param radix - Base for string conversion (default: 10)
   * @returns String representation
   * 
   * @example
   * const str = int128.toString(); // "123456789012345678901234567890"
   * const binStr = int128.toString(2); // Binary string
   */
  toString(radix: number = 10): string {
    if (radix < 2 || radix > 36) {
      throw new InvalidParameterError('radix', 'integer between 2 and 36', radix);
    }
    
    return this.toInt128().toString(radix);
  }

  /**
   * Add two Int128 values
   * @param a - First Int128
   * @param b - Second Int128
   * @returns Sum as new Int128
   * 
   * @example
   * const sum = Int128.addI128(int128a, int128b);
   */
  static addI128(a: Int128, b: Int128): Int128 {
    if (!(a instanceof Int128) || !(b instanceof Int128)) {
      throw new InvalidParameterError('a and b', 'Int128 instances', { a, b });
    }

    const lo = a._lo + b._lo;
    const carry = lo >> 64n;
    const hi = a._hi + b._hi + carry;
    
    return new Int128(hi, lo & ((1n << 64n) - 1n));
  }

  /**
   * Subtract two Int128 values
   * @param a - First Int128 (minuend)
   * @param b - Second Int128 (subtrahend)
   * @returns Difference as new Int128
   * 
   * @example
   * const diff = Int128.subI128(int128a, int128b);
   */
  static subI128(a: Int128, b: Int128): Int128 {
    if (!(a instanceof Int128) || !(b instanceof Int128)) {
      throw new InvalidParameterError('a and b', 'Int128 instances', { a, b });
    }

    let lo = a._lo - b._lo;
    let borrow = 0n;

    if (lo < 0n) {
      lo += 1n << 64n;
      borrow = 1n;
    }

    const hi = a._hi - b._hi - borrow;

    return new Int128(hi, lo);
  }

  /**
   * Multiply two Int128 values (basic implementation)
   * @param a - First Int128
   * @param b - Second Int128
   * @returns Product as new Int128
   * 
   * @example
   * const product = Int128.mulI128(int128a, int128b);
   */
  static mulI128(a: Int128, b: Int128): Int128 {
    if (!(a instanceof Int128) || !(b instanceof Int128)) {
      throw new InvalidParameterError('a and b', 'Int128 instances', { a, b });
    }

    // Simple multiplication using BigInt conversion
    const result = a.toInt128() * b.toInt128();
    return Int128.fromInt128(result);
  }

  /**
   * Compare two Int128 values
   * @param a - First Int128
   * @param b - Second Int128
   * @returns -1 if a < b, 0 if a === b, 1 if a > b
   * 
   * @example
   * const comparison = Int128.compare(int128a, int128b);
   */
  static compare(a: Int128, b: Int128): number {
    if (!(a instanceof Int128) || !(b instanceof Int128)) {
      throw new InvalidParameterError('a and b', 'Int128 instances', { a, b });
    }

    const aValue = a.toInt128();
    const bValue = b.toInt128();

    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  }

  /**
   * Check if two Int128 values are equal
   * @param other - Other Int128 to compare with
   * @returns True if equal
   * 
   * @example
   * const isEqual = int128a.equals(int128b);
   */
  equals(other: Int128): boolean {
    if (!(other instanceof Int128)) {
      return false;
    }
    
    return this._hi === other._hi && this._lo === other._lo;
  }

  /**
   * Create a copy of this Int128
   * @returns New Int128 instance with same value
   * 
   * @example
   * const copy = int128.clone();
   */
  clone(): Int128 {
    return new Int128(this._hi, this._lo);
  }

  /**
   * Get the absolute value
   * @returns New Int128 with absolute value
   * 
   * @example
   * const abs = int128.abs();
   */
  abs(): Int128 {
    const value = this.toInt128();
    return Int128.fromInt128(value < 0n ? -value : value);
  }

  /**
   * Negate the value
   * @returns New Int128 with negated value
   * 
   * @example
   * const negated = int128.negate();
   */
  negate(): Int128 {
    return Int128.fromInt128(-this.toInt128());
  }

  /**
   * Check if the value is zero
   * @returns True if zero
   * 
   * @example
   * const isZero = int128.isZero();
   */
  isZero(): boolean {
    return this._hi === 0n && this._lo === 0n;
  }

  /**
   * Check if the value is negative
   * @returns True if negative
   * 
   * @example
   * const isNegative = int128.isNegative();
   */
  isNegative(): boolean {
    return this.toInt128() < 0n;
  }

  /**
   * Check if the value is positive
   * @returns True if positive
   * 
   * @example
   * const isPositive = int128.isPositive();
   */
  isPositive(): boolean {
    return this.toInt128() > 0n;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create Int128 from a regular number
 * @param num - Number to convert
 * @returns New Int128 instance
 * 
 * @example
 * const int128 = fromNumber(123456789);
 */
export function fromNumber(num: number): Int128 {
  if (typeof num !== 'number' || !Number.isInteger(num)) {
    throw new InvalidParameterError('num', 'integer', num);
  }
  
  return Int128.fromInt128(BigInt(num));
}

/**
 * Create Int128 from a string
 * @param str - String representation of the number
 * @param radix - Base of the string representation (default: 10)
 * @returns New Int128 instance
 * 
 * @example
 * const int128 = fromString("123456789012345678901234567890");
 * const hexInt128 = fromString("1a2b3c4d5e6f7890", 16);
 */
export function fromString(str: string, radix: number = 10): Int128 {
  if (typeof str !== 'string') {
    throw new InvalidParameterError('str', 'string', str);
  }
  
  if (radix < 2 || radix > 36) {
    throw new InvalidParameterError('radix', 'integer between 2 and 36', radix);
  }
  
  try {
    const bigIntValue = BigInt(radix === 10 ? str : parseInt(str, radix));
    return Int128.fromInt128(bigIntValue);
  } catch (error) {
    throw new InvalidParameterError('str', 'valid number string', str);
  }
}

/**
 * Constants for common Int128 values
 */
export const INT128_ZERO = new Int128(0n, 0n);
export const INT128_ONE = new Int128(0n, 1n);
export const INT128_MAX = Int128.fromInt128((1n << 127n) - 1n);
export const INT128_MIN = Int128.fromInt128(-(1n << 127n));