/**
 * Tests for Universal Functions (ufuncs)
 */

import { describe, test, expect } from 'vitest';
import { NDArray } from '../../ndarray/ndarray.js';
import { MathematicalError } from '../../types/errors.js';
import {
  // Mathematical functions
  abs, sqrt, cbrt, exp, log, sin, cos, tan,
  // Binary functions
  add, subtract, multiply, divide, power, minimum, maximum,
  // Activation functions
  sigmoid, relu, leakyRelu, softplus,
  // Utility functions
  createUnaryUfunc, createBinaryUfunc, applyUnary, applyBinary
} from '../ufuncs.js';

describe('Universal Functions', () => {
  describe('Unary Mathematical Functions', () => {
    test('should work with scalars', () => {
      expect(abs(-5)).toBe(5);
      expect(sqrt(9)).toBe(3);
      expect(exp(0)).toBe(1);
      expect(sin(0)).toBe(0);
      expect(cos(0)).toBe(1);
    });

    test('should work with NDArrays', () => {
      const arr = new NDArray([-2, 0, 2], [3]);
      const result = abs(arr);
      
      expect(result).toBeInstanceOf(NDArray);
      expect(result.shape).toEqual([3]);
      expect(result.get(0)).toBe(2);
      expect(result.get(1)).toBe(0);
      expect(result.get(2)).toBe(2);
    });

    test('should work with 2D NDArrays', () => {
      const arr = new NDArray([[1, 4], [9, 16]], [2, 2]);
      const result = sqrt(arr);
      
      expect(result.shape).toEqual([2, 2]);
      expect(result.get(0, 0)).toBe(1);
      expect(result.get(0, 1)).toBe(2);
      expect(result.get(1, 0)).toBe(3);
      expect(result.get(1, 1)).toBe(4);
    });

    test('should preserve data types', () => {
      const arr = new NDArray([1, 2, 3], [3], { dtype: 'float32' });
      const result = abs(arr);
      
      expect(result.dtype).toBe('float32');
    });

    test('should handle domain errors', () => {
      expect(() => sqrt(-1)).toThrow(MathematicalError);
      expect(() => log(0)).toThrow(MathematicalError);
      expect(() => log(-1)).toThrow(MathematicalError);
    });

    test('should handle domain errors in arrays', () => {
      const arr = new NDArray([-1, 0, 1], [3]);
      expect(() => sqrt(arr)).toThrow(MathematicalError);
    });
  });

  describe('Binary Mathematical Functions', () => {
    test('should work with two scalars', () => {
      expect(add(2, 3)).toBe(5);
      expect(subtract(5, 2)).toBe(3);
      expect(multiply(3, 4)).toBe(12);
      expect(divide(10, 2)).toBe(5);
      expect(power(2, 3)).toBe(8);
    });

    test('should work with scalar and NDArray', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      const result = add(arr, 10);
      
      expect(result).toBeInstanceOf(NDArray);
      expect(result.shape).toEqual([3]);
      expect(result.get(0)).toBe(11);
      expect(result.get(1)).toBe(12);
      expect(result.get(2)).toBe(13);
    });

    test('should work with NDArray and scalar', () => {
      const arr = new NDArray([10, 20, 30], [3]);
      const result = divide(arr, 10);
      
      expect(result.get(0)).toBe(1);
      expect(result.get(1)).toBe(2);
      expect(result.get(2)).toBe(3);
    });

    test('should work with two NDArrays', () => {
      const a = new NDArray([1, 2, 3], [3]);
      const b = new NDArray([4, 5, 6], [3]);
      const result = multiply(a, b);
      
      expect(result.get(0)).toBe(4);  // 1 * 4
      expect(result.get(1)).toBe(10); // 2 * 5
      expect(result.get(2)).toBe(18); // 3 * 6
    });

    test('should broadcast arrays', () => {
      const a = new NDArray([[1, 2], [3, 4]], [2, 2]);
      const b = new NDArray([10, 20], [2]);
      const result = add(a, b);
      
      expect(result.shape).toEqual([2, 2]);
      expect(result.get(0, 0)).toBe(11); // 1 + 10
      expect(result.get(0, 1)).toBe(22); // 2 + 20
      expect(result.get(1, 0)).toBe(13); // 3 + 10
      expect(result.get(1, 1)).toBe(24); // 4 + 20
    });

    test('should handle division by zero', () => {
      expect(() => divide(1, 0)).toThrow(MathematicalError);
      
      const arr = new NDArray([1, 2, 3], [3]);
      expect(() => divide(arr, 0)).toThrow(MathematicalError);
    });

    test('should work with minimum and maximum', () => {
      const a = new NDArray([1, 5, 3], [3]);
      const b = new NDArray([4, 2, 6], [3]);
      
      const minResult = minimum(a, b);
      const maxResult = maximum(a, b);
      
      expect(minResult.get(0)).toBe(1); // min(1, 4)
      expect(minResult.get(1)).toBe(2); // min(5, 2)
      expect(minResult.get(2)).toBe(3); // min(3, 6)
      
      expect(maxResult.get(0)).toBe(4); // max(1, 4)
      expect(maxResult.get(1)).toBe(5); // max(5, 2)
      expect(maxResult.get(2)).toBe(6); // max(3, 6)
    });
  });

  describe('Activation Functions', () => {
    test('sigmoid should work correctly', () => {
      expect(sigmoid(0)).toBe(0.5);
      
      const arr = new NDArray([-1, 0, 1], [3]);
      const result = sigmoid(arr);
      
      expect(result.get(1)).toBe(0.5); // sigmoid(0) = 0.5
      expect(result.get(0)).toBeLessThan(0.5); // sigmoid(-1) < 0.5
      expect(result.get(2)).toBeGreaterThan(0.5); // sigmoid(1) > 0.5
    });

    test('relu should work correctly', () => {
      expect(relu(-5)).toBe(0);
      expect(relu(0)).toBe(0);
      expect(relu(5)).toBe(5);
      
      const arr = new NDArray([-2, 0, 3], [3]);
      const result = relu(arr);
      
      expect(result.get(0)).toBe(0);
      expect(result.get(1)).toBe(0);
      expect(result.get(2)).toBe(3);
    });

    test('leakyRelu should work correctly', () => {
      expect(leakyRelu(5, 0.01)).toBe(5);
      expect(leakyRelu(-2, 0.01)).toBe(-0.02);
      
      const arr = new NDArray([-2, 0, 3], [3]);
      const alpha = 0.1;
      const result = leakyRelu(arr, alpha);
      
      expect(result.get(0)).toBe(-0.2); // -2 * 0.1
      expect(result.get(1)).toBe(0);
      expect(result.get(2)).toBe(3);
    });

    test('softplus should work correctly', () => {
      expect(softplus(0)).toBeCloseTo(Math.log(2), 5);
      
      const arr = new NDArray([-1, 0, 1], [3]);
      const result = softplus(arr);
      
      expect(result.get(1)).toBeCloseTo(Math.log(2), 5);
      expect(result.get(0)).toBeGreaterThan(0);
      expect(result.get(2)).toBeGreaterThan(result.get(1));
    });
  });

  describe('Custom Ufunc Creation', () => {
    test('should create custom unary ufunc', () => {
      const square = createUnaryUfunc((x: number) => x * x, 'square');
      
      expect(square(3)).toBe(9);
      
      const arr = new NDArray([2, 3, 4], [3]);
      const result = square(arr);
      
      expect(result.get(0)).toBe(4);
      expect(result.get(1)).toBe(9);
      expect(result.get(2)).toBe(16);
    });

    test('should create custom binary ufunc', () => {
      const hypot = createBinaryUfunc((x: number, y: number) => Math.sqrt(x*x + y*y), 'hypot');
      
      expect(hypot(3, 4)).toBe(5);
      
      const a = new NDArray([3, 5], [2]);
      const b = new NDArray([4, 12], [2]);
      const result = hypot(a, b);
      
      expect(result.get(0)).toBe(5);  // sqrt(3² + 4²)
      expect(result.get(1)).toBe(13); // sqrt(5² + 12²)
    });

    test('should handle errors in custom ufuncs', () => {
      const safeDivide = createUnaryUfunc((x: number) => {
        if (x === 0) throw new Error('Cannot divide by zero');
        return 1 / x;
      }, 'safeDivide');
      
      expect(() => safeDivide(0)).toThrow(MathematicalError);
      
      const arr = new NDArray([1, 0, 2], [3]);
      expect(() => safeDivide(arr)).toThrow(MathematicalError);
    });
  });

  describe('Utility Functions', () => {
    test('applyUnary should work', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      const result = applyUnary(arr, (x: number) => x * 2, 'double');
      
      expect(result.get(0)).toBe(2);
      expect(result.get(1)).toBe(4);
      expect(result.get(2)).toBe(6);
    });

    test('applyBinary should work', () => {
      const a = new NDArray([1, 2, 3], [3]);
      const result = applyBinary(a, 5, (x: number, y: number) => x + y, 'addFive');
      
      expect((result as NDArray).get(0)).toBe(6);
      expect((result as NDArray).get(1)).toBe(7);
      expect((result as NDArray).get(2)).toBe(8);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty arrays', () => {
      const arr = new NDArray([], [0]);
      const result = abs(arr);
      
      expect(result.shape).toEqual([0]);
      expect(result.size).toBe(0);
    });

    test('should handle very large numbers', () => {
      const arr = new NDArray([1e10, -1e10], [2]);
      const result = abs(arr);
      
      expect(result.get(0)).toBe(1e10);
      expect(result.get(1)).toBe(1e10);
    });

    test('should handle special values', () => {
      // Our validation doesn't allow infinite values, so test the error
      expect(() => abs(Infinity)).toThrow();
      expect(() => abs(-Infinity)).toThrow();
      expect(() => abs(NaN)).toThrow();
    });
  });
});