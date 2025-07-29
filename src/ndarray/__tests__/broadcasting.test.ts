/**
 * Tests for NDArray broadcasting and arithmetic operations
 */

import { describe, test, expect } from 'vitest';
import { NDArray } from '../ndarray.js';
import { DimensionError, MathematicalError } from '../../types/errors.js';

describe('NDArray Broadcasting', () => {
  describe('Scalar Broadcasting', () => {
    test('should add scalar to 1D array', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      const result = arr.add(5);
      
      expect(result.shape).toEqual([3]);
      expect(result.get(0)).toBe(6);
      expect(result.get(1)).toBe(7);
      expect(result.get(2)).toBe(8);
    });

    test('should multiply scalar with 2D array', () => {
      const arr = new NDArray([[1, 2], [3, 4]], [2, 2]);
      const result = arr.multiply(2);
      
      expect(result.shape).toEqual([2, 2]);
      expect(result.get(0, 0)).toBe(2);
      expect(result.get(0, 1)).toBe(4);
      expect(result.get(1, 0)).toBe(6);
      expect(result.get(1, 1)).toBe(8);
    });

    test('should subtract scalar from array', () => {
      const arr = new NDArray([10, 20, 30], [3]);
      const result = arr.subtract(5);
      
      expect(result.shape).toEqual([3]);
      expect(result.get(0)).toBe(5);
      expect(result.get(1)).toBe(15);
      expect(result.get(2)).toBe(25);
    });

    test('should divide array by scalar', () => {
      const arr = new NDArray([10, 20, 30], [3]);
      const result = arr.divide(5);
      
      expect(result.shape).toEqual([3]);
      expect(result.get(0)).toBe(2);
      expect(result.get(1)).toBe(4);
      expect(result.get(2)).toBe(6);
    });

    test('should raise array to scalar power', () => {
      const arr = new NDArray([2, 3, 4], [3]);
      const result = arr.power(2);
      
      expect(result.shape).toEqual([3]);
      expect(result.get(0)).toBe(4);
      expect(result.get(1)).toBe(9);
      expect(result.get(2)).toBe(16);
    });

    test('should compute modulo with scalar', () => {
      const arr = new NDArray([7, 8, 9], [3]);
      const result = arr.mod(3);
      
      expect(result.shape).toEqual([3]);
      expect(result.get(0)).toBe(1);
      expect(result.get(1)).toBe(2);
      expect(result.get(2)).toBe(0);
    });
  });

  describe('Array Broadcasting', () => {
    test('should broadcast 1D array with 2D array', () => {
      const a = new NDArray([[1, 2, 3], [4, 5, 6]], [2, 3]); // 2x3
      const b = new NDArray([10, 20, 30], [3]); // 3
      const result = a.add(b);
      
      expect(result.shape).toEqual([2, 3]);
      expect(result.get(0, 0)).toBe(11); // 1 + 10
      expect(result.get(0, 1)).toBe(22); // 2 + 20
      expect(result.get(0, 2)).toBe(33); // 3 + 30
      expect(result.get(1, 0)).toBe(14); // 4 + 10
      expect(result.get(1, 1)).toBe(25); // 5 + 20
      expect(result.get(1, 2)).toBe(36); // 6 + 30
    });

    test('should broadcast arrays with compatible shapes', () => {
      const a = new NDArray([[1], [2], [3]], [3, 1]); // 3x1
      const b = new NDArray([10, 20], [2]); // 2
      const result = a.add(b);
      
      expect(result.shape).toEqual([3, 2]);
      expect(result.get(0, 0)).toBe(11); // 1 + 10
      expect(result.get(0, 1)).toBe(21); // 1 + 20
      expect(result.get(1, 0)).toBe(12); // 2 + 10
      expect(result.get(1, 1)).toBe(22); // 2 + 20
      expect(result.get(2, 0)).toBe(13); // 3 + 10
      expect(result.get(2, 1)).toBe(23); // 3 + 20
    });

    test('should broadcast same-shaped arrays', () => {
      const a = new NDArray([1, 2, 3], [3]);
      const b = new NDArray([4, 5, 6], [3]);
      const result = a.multiply(b);
      
      expect(result.shape).toEqual([3]);
      expect(result.get(0)).toBe(4);  // 1 * 4
      expect(result.get(1)).toBe(10); // 2 * 5
      expect(result.get(2)).toBe(18); // 3 * 6
    });

    test('should handle single-element arrays', () => {
      const a = new NDArray([5], [1]);
      const b = new NDArray([1, 2, 3], [3]);
      const result = a.add(b);
      
      expect(result.shape).toEqual([3]);
      expect(result.get(0)).toBe(6); // 5 + 1
      expect(result.get(1)).toBe(7); // 5 + 2
      expect(result.get(2)).toBe(8); // 5 + 3
    });
  });

  describe('Broadcasting Error Handling', () => {
    test('should throw error for incompatible shapes', () => {
      const a = new NDArray([[1, 2, 3]], [1, 3]); // 1x3
      const b = new NDArray([[1, 2]], [1, 2]); // 1x2
      
      expect(() => a.add(b)).toThrow(DimensionError);
    });

    test('should throw error for division by zero', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      
      expect(() => arr.divide(0)).toThrow(MathematicalError);
    });

    test('should throw error for modulo by zero', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      
      expect(() => arr.mod(0)).toThrow(MathematicalError);
    });

    test('should handle complex incompatible broadcasting', () => {
      const a = new NDArray([[[1, 2]], [[3, 4]]], [2, 1, 2]); // 2x1x2
      const b = new NDArray([[1, 2, 3]], [1, 3]); // 1x3
      
      expect(() => a.add(b)).toThrow(DimensionError);
    });
  });

  describe('Broadcasting Edge Cases', () => {
    test('should handle empty arrays', () => {
      const arr = new NDArray([], [0]);
      const result = arr.add(5);
      
      expect(result.shape).toEqual([0]);
      expect(result.size).toBe(0);
    });

    test('should preserve data types', () => {
      const arr = new NDArray([1, 2, 3], [3], { dtype: 'int32' });
      const result = arr.add(1);
      
      expect(result.dtype).toBe('int32');
    });

    test('should handle very large numbers', () => {
      const arr = new NDArray([1e10, 2e10], [2]);
      const result = arr.multiply(2);
      
      expect(result.get(0)).toBe(2e10);
      expect(result.get(1)).toBe(4e10);
    });

    test('should handle negative numbers', () => {
      const arr = new NDArray([-1, -2, -3], [3]);
      const result = arr.multiply(-1);
      
      expect(result.get(0)).toBe(1);
      expect(result.get(1)).toBe(2);
      expect(result.get(2)).toBe(3);
    });
  });
});