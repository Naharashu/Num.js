/**
 * Tests for Comparison and Logical Universal Functions
 */

import { describe, test, expect } from 'vitest';
import { NDArray } from '../../ndarray/ndarray.js';
import { InvalidParameterError } from '../../types/errors.js';
import {
  // Comparison functions
  equal, notEqual, less, lessEqual, greater, greaterEqual,
  // Logical functions
  logicalNot, logicalAnd, logicalOr, logicalXor,
  // Boolean reduction functions
  any, all,
  // Utility functions
  toBooleanArray, countNonzero, nonzero, where
} from '../ufuncs.js';

describe('Comparison and Logical Universal Functions', () => {
  describe('Comparison Functions', () => {
    test('should work with scalars', () => {
      expect(equal(5, 5)).toBe(1);
      expect(equal(5, 3)).toBe(0);
      expect(notEqual(5, 3)).toBe(1);
      expect(notEqual(5, 5)).toBe(0);
      expect(less(3, 5)).toBe(1);
      expect(less(5, 3)).toBe(0);
      expect(lessEqual(3, 5)).toBe(1);
      expect(lessEqual(5, 5)).toBe(1);
      expect(greater(5, 3)).toBe(1);
      expect(greater(3, 5)).toBe(0);
      expect(greaterEqual(5, 3)).toBe(1);
      expect(greaterEqual(5, 5)).toBe(1);
    });

    test('should work with NDArrays', () => {
      const a = new NDArray([1, 2, 3], [3]);
      const b = new NDArray([1, 4, 2], [3]);
      
      const eqResult = equal(a, b);
      expect(eqResult.get(0)).toBe(1); // 1 == 1
      expect(eqResult.get(1)).toBe(0); // 2 != 4
      expect(eqResult.get(2)).toBe(0); // 3 != 2
      
      const ltResult = less(a, b);
      expect(ltResult.get(0)).toBe(0); // 1 < 1 is false
      expect(ltResult.get(1)).toBe(1); // 2 < 4 is true
      expect(ltResult.get(2)).toBe(0); // 3 < 2 is false
      
      const gtResult = greater(a, b);
      expect(gtResult.get(0)).toBe(0); // 1 > 1 is false
      expect(gtResult.get(1)).toBe(0); // 2 > 4 is false
      expect(gtResult.get(2)).toBe(1); // 3 > 2 is true
    });

    test('should work with scalar and NDArray', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      const result = greater(arr, 2);
      
      expect(result.get(0)).toBe(0); // 1 > 2 is false
      expect(result.get(1)).toBe(0); // 2 > 2 is false
      expect(result.get(2)).toBe(1); // 3 > 2 is true
    });

    test('should work with 2D arrays', () => {
      const a = new NDArray([[1, 2], [3, 4]], [2, 2]);
      const b = new NDArray([[1, 3], [2, 4]], [2, 2]);
      
      const result = equal(a, b);
      expect(result.get(0, 0)).toBe(1); // 1 == 1
      expect(result.get(0, 1)).toBe(0); // 2 != 3
      expect(result.get(1, 0)).toBe(0); // 3 != 2
      expect(result.get(1, 1)).toBe(1); // 4 == 4
    });
  });

  describe('Logical Functions', () => {
    test('should work with scalars', () => {
      expect(logicalNot(0)).toBe(1);
      expect(logicalNot(5)).toBe(0);
      expect(logicalNot(-3)).toBe(0);
      
      expect(logicalAnd(0, 0)).toBe(0);
      expect(logicalAnd(0, 1)).toBe(0);
      expect(logicalAnd(1, 0)).toBe(0);
      expect(logicalAnd(1, 1)).toBe(1);
      expect(logicalAnd(5, 3)).toBe(1); // Both non-zero
      
      expect(logicalOr(0, 0)).toBe(0);
      expect(logicalOr(0, 1)).toBe(1);
      expect(logicalOr(1, 0)).toBe(1);
      expect(logicalOr(1, 1)).toBe(1);
      
      expect(logicalXor(0, 0)).toBe(0);
      expect(logicalXor(0, 1)).toBe(1);
      expect(logicalXor(1, 0)).toBe(1);
      expect(logicalXor(1, 1)).toBe(0);
    });

    test('should work with NDArrays', () => {
      const a = new NDArray([0, 1, 2, 0], [4]);
      const b = new NDArray([0, 0, 1, 3], [4]);
      
      const notResult = logicalNot(a);
      expect(notResult.get(0)).toBe(1); // NOT 0 = 1
      expect(notResult.get(1)).toBe(0); // NOT 1 = 0
      expect(notResult.get(2)).toBe(0); // NOT 2 = 0
      expect(notResult.get(3)).toBe(1); // NOT 0 = 1
      
      const andResult = logicalAnd(a, b);
      expect(andResult.get(0)).toBe(0); // 0 AND 0 = 0
      expect(andResult.get(1)).toBe(0); // 1 AND 0 = 0
      expect(andResult.get(2)).toBe(1); // 2 AND 1 = 1
      expect(andResult.get(3)).toBe(0); // 0 AND 3 = 0
      
      const orResult = logicalOr(a, b);
      expect(orResult.get(0)).toBe(0); // 0 OR 0 = 0
      expect(orResult.get(1)).toBe(1); // 1 OR 0 = 1
      expect(orResult.get(2)).toBe(1); // 2 OR 1 = 1
      expect(orResult.get(3)).toBe(1); // 0 OR 3 = 1
      
      const xorResult = logicalXor(a, b);
      expect(xorResult.get(0)).toBe(0); // 0 XOR 0 = 0
      expect(xorResult.get(1)).toBe(1); // 1 XOR 0 = 1
      expect(xorResult.get(2)).toBe(0); // 2 XOR 1 = 0 (both truthy)
      expect(xorResult.get(3)).toBe(1); // 0 XOR 3 = 1
    });

    test('should work with broadcasting', () => {
      const arr = new NDArray([0, 1, 2], [3]);
      const result = logicalAnd(arr, 1);
      
      expect(result.get(0)).toBe(0); // 0 AND 1 = 0
      expect(result.get(1)).toBe(1); // 1 AND 1 = 1
      expect(result.get(2)).toBe(1); // 2 AND 1 = 1
    });
  });

  describe('Boolean Reduction Functions', () => {
    test('any should work correctly', () => {
      const allZeros = new NDArray([0, 0, 0], [3]);
      const someNonZero = new NDArray([0, 1, 0], [3]);
      const allNonZero = new NDArray([1, 2, 3], [3]);
      
      expect(any(allZeros)).toBe(false);
      expect(any(someNonZero)).toBe(true);
      expect(any(allNonZero)).toBe(true);
    });

    test('all should work correctly', () => {
      const allZeros = new NDArray([0, 0, 0], [3]);
      const someNonZero = new NDArray([0, 1, 0], [3]);
      const allNonZero = new NDArray([1, 2, 3], [3]);
      
      expect(all(allZeros)).toBe(false);
      expect(all(someNonZero)).toBe(false);
      expect(all(allNonZero)).toBe(true);
    });

    test('should work with 2D arrays', () => {
      const arr2d = new NDArray([[0, 1], [2, 0]], [2, 2]);
      
      expect(any(arr2d)).toBe(true);
      expect(all(arr2d)).toBe(false);
    });

    test('should handle empty arrays', () => {
      const empty = new NDArray([], [0]);
      
      expect(any(empty)).toBe(false);
      expect(all(empty)).toBe(true); // Vacuous truth
    });

    test('should throw error for axis parameter (not implemented)', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      
      expect(() => any(arr, 0)).toThrow(InvalidParameterError);
      expect(() => all(arr, 0)).toThrow(InvalidParameterError);
    });
  });

  describe('Utility Functions', () => {
    test('toBooleanArray should work correctly', () => {
      const arr = new NDArray([0, 1, -1, 2, 0], [5]);
      const result = toBooleanArray(arr);
      
      expect(result.get(0)).toBe(0); // 0 -> 0
      expect(result.get(1)).toBe(1); // 1 -> 1
      expect(result.get(2)).toBe(1); // -1 -> 1 (non-zero)
      expect(result.get(3)).toBe(1); // 2 -> 1 (non-zero)
      expect(result.get(4)).toBe(0); // 0 -> 0
    });

    test('countNonzero should work correctly', () => {
      const arr = new NDArray([0, 1, 0, 2, 0, -1], [6]);
      
      expect(countNonzero(arr)).toBe(3); // 1, 2, -1 are non-zero
    });

    test('countNonzero should work with 2D arrays', () => {
      const arr2d = new NDArray([[0, 1], [2, 0], [0, 3]], [3, 2]);
      
      expect(countNonzero(arr2d)).toBe(3); // 1, 2, 3 are non-zero
    });

    test('nonzero should return correct indices', () => {
      const arr = new NDArray([0, 1, 0, 2], [4]);
      const indices = nonzero(arr);
      
      expect(indices).toHaveLength(2);
      expect(indices[0]).toEqual([1]); // Index 1 has value 1
      expect(indices[1]).toEqual([3]); // Index 3 has value 2
    });

    test('nonzero should work with 2D arrays', () => {
      const arr2d = new NDArray([[0, 1], [2, 0]], [2, 2]);
      const indices = nonzero(arr2d);
      
      expect(indices).toHaveLength(2);
      expect(indices[0]).toEqual([0, 1]); // Position (0,1) has value 1
      expect(indices[1]).toEqual([1, 0]); // Position (1,0) has value 2
    });

    test('where should work correctly', () => {
      const condition = new NDArray([1, 0, 1, 0], [4]);
      const x = new NDArray([10, 20, 30, 40], [4]);
      const y = new NDArray([1, 2, 3, 4], [4]);
      
      const result = where(condition, x, y);
      
      expect(result.get(0)).toBe(10); // condition[0] = 1, so x[0]
      expect(result.get(1)).toBe(2);  // condition[1] = 0, so y[1]
      expect(result.get(2)).toBe(30); // condition[2] = 1, so x[2]
      expect(result.get(3)).toBe(4);  // condition[3] = 0, so y[3]
    });

    test('where should work with scalars', () => {
      const condition = new NDArray([1, 0, 1], [3]);
      const result = where(condition, 100, 200);
      
      expect(result.get(0)).toBe(100); // condition[0] = 1, so 100
      expect(result.get(1)).toBe(200); // condition[1] = 0, so 200
      expect(result.get(2)).toBe(100); // condition[2] = 1, so 100
    });
  });

  describe('Integration with Comparison Functions', () => {
    test('should create boolean masks for filtering', () => {
      const arr = new NDArray([1, 5, 3, 8, 2], [5]);
      const mask = greater(arr, 3); // Elements > 3
      
      expect(mask.get(0)).toBe(0); // 1 > 3 is false
      expect(mask.get(1)).toBe(1); // 5 > 3 is true
      expect(mask.get(2)).toBe(0); // 3 > 3 is false
      expect(mask.get(3)).toBe(1); // 8 > 3 is true
      expect(mask.get(4)).toBe(0); // 2 > 3 is false
      
      expect(any(mask)).toBe(true);
      expect(countNonzero(mask)).toBe(2);
    });

    test('should combine multiple conditions', () => {
      const arr = new NDArray([1, 5, 3, 8, 2], [5]);
      const mask1 = greater(arr, 2);    // > 2
      const mask2 = less(arr, 7);       // < 7
      const combined = logicalAnd(mask1, mask2); // 2 < x < 7
      
      expect(combined.get(0)).toBe(0); // 1: not > 2
      expect(combined.get(1)).toBe(1); // 5: 2 < 5 < 7
      expect(combined.get(2)).toBe(1); // 3: 2 < 3 < 7
      expect(combined.get(3)).toBe(0); // 8: not < 7
      expect(combined.get(4)).toBe(0); // 2: not > 2
      
      expect(countNonzero(combined)).toBe(2);
    });
  });
});