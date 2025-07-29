/**
 * Unit tests for NDArray class
 */

import { test, expect, describe } from "bun:test";
import { NDArray } from "../ndarray/ndarray.js";
import { DimensionError, InvalidParameterError, IndexOutOfBoundsError } from "../types/errors.js";

describe("NDArray Class", () => {
  describe("Constructor and Properties", () => {
    test("should create 1D array from flat data", () => {
      const arr = new NDArray([1, 2, 3, 4], [4]);
      
      expect(arr.shape).toEqual([4]);
      expect(arr.ndim).toBe(1);
      expect(arr.size).toBe(4);
      expect(arr.dtype).toBe('float64');
      expect(arr.readonly).toBe(false);
    });

    test("should create 2D array from nested data", () => {
      const arr = new NDArray([[1, 2], [3, 4]], [2, 2]);
      
      expect(arr.shape).toEqual([2, 2]);
      expect(arr.ndim).toBe(2);
      expect(arr.size).toBe(4);
    });

    test("should create 3D array from nested data", () => {
      const arr = new NDArray([[[1, 2]], [[3, 4]]], [2, 1, 2]);
      
      expect(arr.shape).toEqual([2, 1, 2]);
      expect(arr.ndim).toBe(3);
      expect(arr.size).toBe(4);
    });

    test("should create array with specified dtype", () => {
      const arr = new NDArray([1, 2, 3], [3], { dtype: 'int32' });
      
      expect(arr.dtype).toBe('int32');
    });

    test("should create read-only array", () => {
      const arr = new NDArray([1, 2, 3], [3], { readonly: true });
      
      expect(arr.readonly).toBe(true);
    });

    test("should throw error for mismatched data size and shape", () => {
      expect(() => new NDArray([1, 2, 3], [2, 2])).toThrow(DimensionError);
    });

    test("should throw error for invalid shape", () => {
      expect(() => new NDArray([1, 2, 3], [0, 3])).toThrow(InvalidParameterError);
      expect(() => new NDArray([1, 2, 3], [])).toThrow(InvalidParameterError);
    });
  });

  describe("Element Access", () => {
    test("should get elements from 1D array", () => {
      const arr = new NDArray([1, 2, 3, 4], [4]);
      
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
      expect(arr.get(3)).toBe(4);
    });

    test("should get elements from 2D array", () => {
      const arr = new NDArray([[1, 2], [3, 4]], [2, 2]);
      
      expect(arr.get(0, 0)).toBe(1);
      expect(arr.get(0, 1)).toBe(2);
      expect(arr.get(1, 0)).toBe(3);
      expect(arr.get(1, 1)).toBe(4);
    });

    test("should get elements from 3D array", () => {
      const arr = new NDArray([[[1, 2]], [[3, 4]]], [2, 1, 2]);
      
      expect(arr.get(0, 0, 0)).toBe(1);
      expect(arr.get(0, 0, 1)).toBe(2);
      expect(arr.get(1, 0, 0)).toBe(3);
      expect(arr.get(1, 0, 1)).toBe(4);
    });

    test("should handle negative indexing", () => {
      const arr = new NDArray([1, 2, 3, 4], [4]);
      
      expect(arr.get(-1)).toBe(4);
      expect(arr.get(-2)).toBe(3);
    });

    test("should set elements in mutable array", () => {
      const arr = new NDArray([1, 2, 3, 4], [4]);
      
      arr.set(0, 10);
      expect(arr.get(0)).toBe(10);
      
      arr.set(1, 20);
      expect(arr.get(1)).toBe(20);
    });

    test("should set elements in 2D array", () => {
      const arr = new NDArray([[1, 2], [3, 4]], [2, 2]);
      
      arr.set(0, 0, 10);
      expect(arr.get(0, 0)).toBe(10);
      
      arr.set(1, 1, 40);
      expect(arr.get(1, 1)).toBe(40);
    });

    test("should throw error when setting in read-only array", () => {
      const arr = new NDArray([1, 2, 3], [3], { readonly: true });
      
      expect(() => arr.set(0, 10)).toThrow('Cannot modify read-only array');
    });

    test("should throw error for invalid indices", () => {
      const arr = new NDArray([1, 2, 3, 4], [4]);
      
      expect(() => arr.get(4)).toThrow(IndexOutOfBoundsError);
      expect(() => arr.get(-5)).toThrow(IndexOutOfBoundsError);
    });

    test("should throw error for wrong number of indices", () => {
      const arr = new NDArray([[1, 2], [3, 4]], [2, 2]);
      
      expect(() => arr.get(0)).toThrow(DimensionError);
      expect(() => arr.get(0, 0, 0)).toThrow(DimensionError);
    });

    test("should throw error for non-integer indices", () => {
      const arr = new NDArray([1, 2, 3], [3]);
      
      expect(() => arr.get(1.5)).toThrow(InvalidParameterError);
    });
  });

  describe("String Representation", () => {
    test("should provide basic string representation", () => {
      const arr = new NDArray([1, 2, 3, 4], [4]);
      
      expect(arr.toString()).toBe('NDArray(shape=[4], dtype=float64)');
    });

    test("should provide detailed representation", () => {
      const arr = new NDArray([[1, 2], [3, 4]], [2, 2]);
      
      expect(arr.repr()).toBe('NDArray(shape=[2, 2], dtype=float64, size=4)');
    });
  });

  describe("Edge Cases", () => {
    test("should handle single element array", () => {
      const arr = new NDArray([42], [1]);
      
      expect(arr.get(0)).toBe(42);
      expect(arr.size).toBe(1);
      expect(arr.ndim).toBe(1);
    });

    test("should handle scalar-like array", () => {
      const arr = new NDArray([42], [1, 1, 1]);
      
      expect(arr.get(0, 0, 0)).toBe(42);
      expect(arr.size).toBe(1);
      expect(arr.ndim).toBe(3);
    });

    test("should validate finite numbers in nested arrays", () => {
      expect(() => new NDArray([[1, NaN], [3, 4]], [2, 2])).toThrow(InvalidParameterError);
      expect(() => new NDArray([[1, Infinity], [3, 4]], [2, 2])).toThrow(InvalidParameterError);
    });
  });
});