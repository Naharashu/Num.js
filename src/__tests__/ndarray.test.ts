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

  describe("Zero-Copy Operations", () => {
    describe("reshape", () => {
      test("should reshape 1D to 2D array", () => {
        const arr = new NDArray([1, 2, 3, 4, 5, 6], [6]);
        const reshaped = arr.reshape([2, 3]);
        
        expect(reshaped.shape).toEqual([2, 3]);
        expect(reshaped.get(0, 0)).toBe(1);
        expect(reshaped.get(0, 1)).toBe(2);
        expect(reshaped.get(0, 2)).toBe(3);
        expect(reshaped.get(1, 0)).toBe(4);
        expect(reshaped.get(1, 1)).toBe(5);
        expect(reshaped.get(1, 2)).toBe(6);
      });

      test("should reshape 2D to 1D array", () => {
        const arr = new NDArray([[1, 2, 3], [4, 5, 6]], [2, 3]);
        const reshaped = arr.reshape([6]);
        
        expect(reshaped.shape).toEqual([6]);
        expect(reshaped.get(0)).toBe(1);
        expect(reshaped.get(1)).toBe(2);
        expect(reshaped.get(2)).toBe(3);
        expect(reshaped.get(3)).toBe(4);
        expect(reshaped.get(4)).toBe(5);
        expect(reshaped.get(5)).toBe(6);
      });

      test("should reshape to 3D array", () => {
        const arr = new NDArray([1, 2, 3, 4, 5, 6, 7, 8], [8]);
        const reshaped = arr.reshape([2, 2, 2]);
        
        expect(reshaped.shape).toEqual([2, 2, 2]);
        expect(reshaped.get(0, 0, 0)).toBe(1);
        expect(reshaped.get(0, 0, 1)).toBe(2);
        expect(reshaped.get(0, 1, 0)).toBe(3);
        expect(reshaped.get(1, 1, 1)).toBe(8);
      });

      test("should share data with original array", () => {
        const arr = new NDArray([1, 2, 3, 4], [4]);
        const reshaped = arr.reshape([2, 2]);
        
        expect(reshaped.sharesDataWith(arr)).toBe(true);
        
        // Modifying original should affect reshaped
        arr.set(0, 99);
        expect(reshaped.get(0, 0)).toBe(99);
        
        // Modifying reshaped should affect original
        reshaped.set(1, 1, 88);
        expect(arr.get(3)).toBe(88);
      });

      test("should throw error for incompatible size", () => {
        const arr = new NDArray([1, 2, 3, 4], [4]);
        
        expect(() => arr.reshape([2, 3])).toThrow(DimensionError);
        expect(() => arr.reshape([5])).toThrow(DimensionError);
      });

      test("should throw error for invalid shape", () => {
        const arr = new NDArray([1, 2, 3, 4], [4]);
        
        expect(() => arr.reshape([0, 4])).toThrow(InvalidParameterError);
        expect(() => arr.reshape([])).toThrow(InvalidParameterError);
      });
    });

    describe("transpose", () => {
      test("should transpose 2D array (default)", () => {
        const arr = new NDArray([[1, 2, 3], [4, 5, 6]], [2, 3]);
        const transposed = arr.transpose();
        
        expect(transposed.shape).toEqual([3, 2]);
        expect(transposed.get(0, 0)).toBe(1);
        expect(transposed.get(0, 1)).toBe(4);
        expect(transposed.get(1, 0)).toBe(2);
        expect(transposed.get(1, 1)).toBe(5);
        expect(transposed.get(2, 0)).toBe(3);
        expect(transposed.get(2, 1)).toBe(6);
      });

      test("should transpose 3D array (default)", () => {
        const arr = new NDArray([[[1, 2], [3, 4]], [[5, 6], [7, 8]]], [2, 2, 2]);
        const transposed = arr.transpose();
        
        expect(transposed.shape).toEqual([2, 2, 2]);
        expect(transposed.get(0, 0, 0)).toBe(1);
        expect(transposed.get(0, 0, 1)).toBe(5);
        expect(transposed.get(0, 1, 0)).toBe(3);
        expect(transposed.get(1, 0, 0)).toBe(2);
      });

      test("should transpose with custom axes", () => {
        const arr = new NDArray([[[1, 2], [3, 4]], [[5, 6], [7, 8]]], [2, 2, 2]);
        const transposed = arr.transpose([1, 0, 2]);
        
        expect(transposed.shape).toEqual([2, 2, 2]);
        expect(transposed.get(0, 0, 0)).toBe(1);
        expect(transposed.get(0, 1, 0)).toBe(5);
        expect(transposed.get(1, 0, 0)).toBe(3);
        expect(transposed.get(1, 1, 0)).toBe(7);
      });

      test("should share data with original array", () => {
        const arr = new NDArray([[1, 2], [3, 4]], [2, 2]);
        const transposed = arr.transpose();
        
        expect(transposed.sharesDataWith(arr)).toBe(true);
        
        // Modifying original should affect transposed
        arr.set(0, 1, 99);
        expect(transposed.get(1, 0)).toBe(99);
        
        // Modifying transposed should affect original
        transposed.set(0, 1, 88);
        expect(arr.get(1, 0)).toBe(88);
      });

      test("should throw error for invalid axes length", () => {
        const arr = new NDArray([[1, 2], [3, 4]], [2, 2]);
        
        expect(() => arr.transpose([0])).toThrow(DimensionError);
        expect(() => arr.transpose([0, 1, 2])).toThrow(DimensionError);
      });

      test("should throw error for duplicate axes", () => {
        const arr = new NDArray([[1, 2], [3, 4]], [2, 2]);
        
        expect(() => arr.transpose([0, 0])).toThrow(InvalidParameterError);
        expect(() => arr.transpose([1, 1])).toThrow(InvalidParameterError);
      });

      test("should throw error for invalid axis indices", () => {
        const arr = new NDArray([[1, 2], [3, 4]], [2, 2]);
        
        expect(() => arr.transpose([0, 2])).toThrow(InvalidParameterError);
        expect(() => arr.transpose([-1, 1])).toThrow(InvalidParameterError);
      });
    });

    describe("slice", () => {
      test("should slice 1D array with single indices", () => {
        const arr = new NDArray([1, 2, 3, 4, 5], [5]);
        const sliced = arr.slice(2);
        
        expect(sliced.shape).toEqual([]);
        expect(sliced.get()).toBe(3);
      });

      test("should slice 1D array with range", () => {
        const arr = new NDArray([1, 2, 3, 4, 5], [5]);
        const sliced = arr.slice([1, 4]);
        
        expect(sliced.shape).toEqual([3]);
        expect(sliced.get(0)).toBe(2);
        expect(sliced.get(1)).toBe(3);
        expect(sliced.get(2)).toBe(4);
      });

      test("should slice 1D array with step", () => {
        const arr = new NDArray([1, 2, 3, 4, 5, 6], [6]);
        const sliced = arr.slice([0, 6, 2]);
        
        expect(sliced.shape).toEqual([3]);
        expect(sliced.get(0)).toBe(1);
        expect(sliced.get(1)).toBe(3);
        expect(sliced.get(2)).toBe(5);
      });

      test("should slice 2D array", () => {
        const arr = new NDArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [3, 3]);
        const sliced = arr.slice([1, 3], [0, 2]);
        
        expect(sliced.shape).toEqual([2, 2]);
        expect(sliced.get(0, 0)).toBe(4);
        expect(sliced.get(0, 1)).toBe(5);
        expect(sliced.get(1, 0)).toBe(7);
        expect(sliced.get(1, 1)).toBe(8);
      });

      test("should slice with negative indices", () => {
        const arr = new NDArray([1, 2, 3, 4, 5], [5]);
        const sliced = arr.slice([-2, -1]);
        
        expect(sliced.shape).toEqual([1]);
        expect(sliced.get(0)).toBe(4);
      });

      test("should share data with original array", () => {
        const arr = new NDArray([1, 2, 3, 4, 5], [5]);
        const sliced = arr.slice([1, 4]);
        
        expect(sliced.sharesDataWith(arr)).toBe(true);
        
        // Modifying original should affect sliced
        arr.set(2, 99);
        expect(sliced.get(1)).toBe(99);
        
        // Modifying sliced should affect original
        sliced.set(0, 88);
        expect(arr.get(1)).toBe(88);
      });

      test("should throw error for too many slice dimensions", () => {
        const arr = new NDArray([1, 2, 3], [3]);
        
        expect(() => arr.slice([0, 2], [0, 1])).toThrow(DimensionError);
      });

      test("should throw error for invalid step", () => {
        const arr = new NDArray([1, 2, 3], [3]);
        
        expect(() => arr.slice([0, 3, 0])).toThrow(InvalidParameterError);
      });

      test("should throw error for out of bounds index", () => {
        const arr = new NDArray([1, 2, 3], [3]);
        
        expect(() => arr.slice(5)).toThrow(IndexOutOfBoundsError);
        expect(() => arr.slice(-5)).toThrow(IndexOutOfBoundsError);
      });
    });

    describe("view", () => {
      test("should create view that shares data", () => {
        const arr = new NDArray([1, 2, 3, 4], [4]);
        const view = arr.view();
        
        expect(view.sharesDataWith(arr)).toBe(true);
        expect(view.shape).toEqual(arr.shape);
        expect(view.dtype).toBe(arr.dtype);
        expect(view.readonly).toBe(arr.readonly);
      });

      test("should allow independent modifications", () => {
        const arr = new NDArray([1, 2, 3, 4], [4]);
        const view = arr.view();
        
        // Modifying original should affect view
        arr.set(0, 99);
        expect(view.get(0)).toBe(99);
        
        // Modifying view should affect original
        view.set(1, 88);
        expect(arr.get(1)).toBe(88);
      });

      test("should preserve read-only status", () => {
        const arr = new NDArray([1, 2, 3], [3], { readonly: true });
        const view = arr.view();
        
        expect(view.readonly).toBe(true);
        expect(() => view.set(0, 99)).toThrow('Cannot modify read-only array');
      });
    });

    describe("sharesDataWith", () => {
      test("should return true for views of same array", () => {
        const arr = new NDArray([1, 2, 3, 4], [4]);
        const reshaped = arr.reshape([2, 2]);
        const transposed = arr.transpose();
        const view = arr.view();
        
        expect(arr.sharesDataWith(reshaped)).toBe(true);
        expect(arr.sharesDataWith(transposed)).toBe(true);
        expect(arr.sharesDataWith(view)).toBe(true);
        expect(reshaped.sharesDataWith(transposed)).toBe(true);
      });

      test("should return false for different arrays", () => {
        const arr1 = new NDArray([1, 2, 3, 4], [4]);
        const arr2 = new NDArray([1, 2, 3, 4], [4]);
        
        expect(arr1.sharesDataWith(arr2)).toBe(false);
      });
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