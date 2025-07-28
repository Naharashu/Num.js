import { test, expect, describe } from "bun:test";
import { Array3d, Array3dCompat } from "../matrix/Array3d.js";
import {
  DimensionError,
  InvalidParameterError,
  EmptyArrayError,
} from "../types/errors.js";

describe("Array3d Class", () => {
  describe("Constructor and Properties", () => {
    test("should create 3D array from 3D array data", () => {
      const data = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
      const array3d = new Array3d(data);
      
      expect(array3d.x).toBe(2);
      expect(array3d.y).toBe(2);
      expect(array3d.z).toBe(2);
      expect(array3d.data).toEqual(data);
      expect(array3d.shape).toEqual([2, 2, 2]);
      expect(array3d.size).toBe(8);
    });

    test("should create immutable 3D array (data is copied)", () => {
      const data = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
      const array3d = new Array3d(data);
      
      // Modify original data
      const firstPlane = data[0];
      const firstRow = firstPlane?.[0];
      if (firstRow) {
        firstRow[0] = 999;
      }
      
      // Array3d should be unchanged
      expect(array3d.get(0, 0, 0)).toBe(1);
      const arrayData = array3d.data;
      const arrayFirstPlane = arrayData[0];
      const arrayFirstRow = arrayFirstPlane?.[0];
      expect(arrayFirstRow?.[0]).toBe(1);
    });

    test("should throw error for invalid data", () => {
      expect(() => new Array3d([])).toThrow();
      expect(() => new Array3d([[]])).toThrow();
      expect(() => new Array3d([[[1, 2], [3]], [[5, 6], [7, 8]]])).toThrow();
      expect(() => new Array3d([[[1, 2], [3, 4]], [[5, "6"], [7, 8]]] as any)).toThrow();
    });
  });

  describe("Static Factory Methods", () => {
    test("create should make 3D array with fill value", () => {
      const array3d = Array3d.create(2, 2, 2, 5);
      
      expect(array3d.x).toBe(2);
      expect(array3d.y).toBe(2);
      expect(array3d.z).toBe(2);
      expect(array3d.data).toEqual([[[5, 5], [5, 5]], [[5, 5], [5, 5]]]);
    });

    test("zeros should create zero 3D array", () => {
      const array3d = Array3d.zeros(2, 2, 2);
      
      expect(array3d.data).toEqual([[[0, 0], [0, 0]], [[0, 0], [0, 0]]]);
    });

    test("ones should create ones 3D array", () => {
      const array3d = Array3d.ones(2, 2, 2);
      
      expect(array3d.data).toEqual([[[1, 1], [1, 1]], [[1, 1], [1, 1]]]);
    });

    test("random should create 3D array with values in range", () => {
      const array3d = Array3d.random(2, 2, 2, 0, 1);
      
      expect(array3d.x).toBe(2);
      expect(array3d.y).toBe(2);
      expect(array3d.z).toBe(2);
      
      // Check all values are in range [0, 1)
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          for (let k = 0; k < 2; k++) {
            const val = array3d.get(i, j, k);
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(1);
          }
        }
      }
    });
  });

  describe("Element Access", () => {
    const array3d = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);

    test("get should return correct element", () => {
      expect(array3d.get(0, 0, 0)).toBe(1);
      expect(array3d.get(0, 0, 1)).toBe(2);
      expect(array3d.get(0, 1, 0)).toBe(3);
      expect(array3d.get(1, 0, 0)).toBe(5);
      expect(array3d.get(1, 1, 1)).toBe(8);
    });

    test("get should throw for invalid indices", () => {
      expect(() => array3d.get(-1, 0, 0)).toThrow(InvalidParameterError);
      expect(() => array3d.get(2, 0, 0)).toThrow(InvalidParameterError);
      expect(() => array3d.get(0, -1, 0)).toThrow(InvalidParameterError);
      expect(() => array3d.get(0, 2, 0)).toThrow(InvalidParameterError);
      expect(() => array3d.get(0, 0, -1)).toThrow(InvalidParameterError);
      expect(() => array3d.get(0, 0, 2)).toThrow(InvalidParameterError);
    });

    test("getPlane should return correct plane", () => {
      expect(array3d.getPlane(0)).toEqual([[1, 2], [3, 4]]);
      expect(array3d.getPlane(1)).toEqual([[5, 6], [7, 8]]);
    });

    test("getRow should return correct row", () => {
      expect(array3d.getRow(0, 0)).toEqual([1, 2]);
      expect(array3d.getRow(0, 1)).toEqual([3, 4]);
      expect(array3d.getRow(1, 0)).toEqual([5, 6]);
      expect(array3d.getRow(1, 1)).toEqual([7, 8]);
    });
  });

  describe("Basic Operations", () => {
    test("add should add 3D arrays element-wise", () => {
      const a = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const b = new Array3d([[[1, 1], [1, 1]], [[1, 1], [1, 1]]]);
      const result = a.add(b);
      
      expect(result.data).toEqual([[[2, 3], [4, 5]], [[6, 7], [8, 9]]]);
    });

    test("add should throw for incompatible dimensions", () => {
      const a = new Array3d([[[1, 2], [3, 4]]]);
      const b = new Array3d([[[1, 1], [1, 1]], [[1, 1], [1, 1]]]);
      
      expect(() => a.add(b)).toThrow(DimensionError);
    });

    test("subtract should subtract 3D arrays element-wise", () => {
      const a = new Array3d([[[5, 6], [7, 8]], [[9, 10], [11, 12]]]);
      const b = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const result = a.subtract(b);
      
      expect(result.data).toEqual([[[4, 4], [4, 4]], [[4, 4], [4, 4]]]);
    });

    test("multiply should multiply 3D arrays element-wise", () => {
      const a = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const b = new Array3d([[[2, 2], [2, 2]], [[2, 2], [2, 2]]]);
      const result = a.multiply(b);
      
      expect(result.data).toEqual([[[2, 4], [6, 8]], [[10, 12], [14, 16]]]);
    });

    test("divide should divide 3D arrays element-wise", () => {
      const a = new Array3d([[[4, 6], [8, 10]], [[12, 14], [16, 18]]]);
      const b = new Array3d([[[2, 2], [2, 2]], [[2, 2], [2, 2]]]);
      const result = a.divide(b);
      
      expect(result.data).toEqual([[[2, 3], [4, 5]], [[6, 7], [8, 9]]]);
    });

    test("divide should throw for division by zero", () => {
      const a = new Array3d([[[1, 2], [3, 4]]]);
      const b = new Array3d([[[0, 1], [1, 1]]]);
      
      expect(() => a.divide(b)).toThrow(InvalidParameterError);
    });

    test("multiplyScalar should multiply by scalar", () => {
      const a = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const result = a.multiplyScalar(2);
      
      expect(result.data).toEqual([[[2, 4], [6, 8]], [[10, 12], [14, 16]]]);
    });

    test("divideScalar should divide by scalar", () => {
      const a = new Array3d([[[2, 4], [6, 8]], [[10, 12], [14, 16]]]);
      const result = a.divideScalar(2);
      
      expect(result.data).toEqual([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
    });

    test("divideScalar should throw for division by zero", () => {
      const a = new Array3d([[[1, 2], [3, 4]]]);
      
      expect(() => a.divideScalar(0)).toThrow(InvalidParameterError);
    });

    test("equals should compare 3D arrays correctly", () => {
      const a = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const b = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const c = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 9]]]);
      
      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });

    test("clone should create independent copy", () => {
      const a = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const b = a.clone();
      
      expect(a.equals(b)).toBe(true);
      expect(a).not.toBe(b); // Different objects
    });

    test("map should transform elements", () => {
      const a = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const result = a.map((val, x, y, z) => val * 2 + x + y + z);
      
      // [1*2+0+0+0, 2*2+0+0+1] = [2, 5]
      // [3*2+0+1+0, 4*2+0+1+1] = [7, 10]  (3*2+0+1+0=7, 4*2+0+1+1=10)
      // [5*2+1+0+0, 6*2+1+0+1] = [11, 14]
      // [7*2+1+1+0, 8*2+1+1+1] = [16, 19] (7*2+1+1+0=16, 8*2+1+1+1=19)
      expect(result.data).toEqual([[[2, 5], [7, 10]], [[11, 14], [16, 19]]]);
    });
  });

  describe("Utility Methods", () => {
    test("sum should calculate total of all elements", () => {
      const array3d = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const sum = array3d.sum();
      
      expect(sum).toBe(1 + 2 + 3 + 4 + 5 + 6 + 7 + 8); // 36
    });

    test("mean should calculate average of all elements", () => {
      const array3d = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const mean = array3d.mean();
      
      expect(mean).toBe(36 / 8); // 4.5
    });

    test("min should find minimum element", () => {
      const array3d = new Array3d([[[5, 2], [8, 4]], [[1, 6], [7, 3]]]);
      const min = array3d.min();
      
      expect(min).toBe(1);
    });

    test("max should find maximum element", () => {
      const array3d = new Array3d([[[5, 2], [8, 4]], [[1, 6], [7, 3]]]);
      const max = array3d.max();
      
      expect(max).toBe(8);
    });
  });

  describe("Backward Compatibility", () => {
    test("Array3dCompat.create should work like original", () => {
      const result = Array3dCompat.create(2, 2, 2, 5);
      
      expect(result).toEqual([[[5, 5], [5, 5]], [[5, 5], [5, 5]]]);
    });

    test("Array3dCompat.equals should work correctly (FIXED)", () => {
      const a = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
      const b = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
      const c = [[[1, 2], [3, 4]], [[5, 6], [7, 9]]];
      
      expect(Array3dCompat.equals(a, b)).toBe(true);
      expect(Array3dCompat.equals(a, c)).toBe(false);
    });

    test("Array3dCompat.add should perform element-wise addition (FIXED)", () => {
      const a = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
      const b = [[[1, 1], [1, 1]], [[1, 1], [1, 1]]];
      const result = Array3dCompat.add(a, b);
      
      expect(result).toEqual([[[2, 3], [4, 5]], [[6, 7], [8, 9]]]);
    });

    test("Array3dCompat.sub should perform element-wise subtraction (FIXED)", () => {
      const a = [[[5, 6], [7, 8]], [[9, 10], [11, 12]]];
      const b = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
      const result = Array3dCompat.sub(a, b);
      
      expect(result).toEqual([[[4, 4], [4, 4]], [[4, 4], [4, 4]]]);
    });

    test("Array3dCompat.mulBy should multiply by scalar", () => {
      const a = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
      const result = Array3dCompat.mulBy(a, 2);
      
      expect(result).toEqual([[[2, 4], [6, 8]], [[10, 12], [14, 16]]]);
    });

    test("Array3dCompat.divBy should divide by scalar", () => {
      const a = [[[2, 4], [6, 8]], [[10, 12], [14, 16]]];
      const result = Array3dCompat.divBy(a, 2);
      
      expect(result).toEqual([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
    });

    test("Array3dCompat.multiply should perform element-wise multiplication", () => {
      const a = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
      const b = [[[2, 2], [2, 2]], [[2, 2], [2, 2]]];
      const result = Array3dCompat.multiply(a, b);
      
      expect(result).toEqual([[[2, 4], [6, 8]], [[10, 12], [14, 16]]]);
    });

    test("Array3dCompat.divide should perform element-wise division", () => {
      const a = [[[4, 6], [8, 10]], [[12, 14], [16, 18]]];
      const b = [[[2, 2], [2, 2]], [[2, 2], [2, 2]]];
      const result = Array3dCompat.divide(a, b);
      
      expect(result).toEqual([[[2, 3], [4, 5]], [[6, 7], [8, 9]]]);
    });
  });

  describe("String Representation", () => {
    test("toString should format 3D array nicely", () => {
      const array3d = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      const str = array3d.toString();
      
      expect(str).toContain('Array3d(2×2×2)');
      expect(str).toContain('Plane 0');
      expect(str).toContain('Plane 1');
      expect(str).toContain('[1, 2]');
      expect(str).toContain('[7, 8]');
    });
  });

  describe("Error Handling", () => {
    test("should validate constructor parameters", () => {
      expect(() => new Array3d([] as any)).toThrow();
      expect(() => new Array3d([[[1, 2], [3]], [[5, 6], [7, 8]]] as any)).toThrow();
    });

    test("should validate static method parameters", () => {
      expect(() => Array3d.create(0, 2, 2)).toThrow(InvalidParameterError);
      expect(() => Array3d.create(2, -1, 2)).toThrow(InvalidParameterError);
      expect(() => Array3d.create(2, 2, 0)).toThrow(InvalidParameterError);
    });

    test("should validate operation compatibility", () => {
      const a = new Array3d([[[1, 2], [3, 4]]]);
      const b = new Array3d([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      
      expect(() => a.add(b)).toThrow(DimensionError);
      expect(() => a.subtract(b)).toThrow(DimensionError);
      expect(() => a.multiply(b)).toThrow(DimensionError);
      expect(() => a.divide(b)).toThrow(DimensionError);
    });

    test("should handle division by zero appropriately", () => {
      const a = new Array3d([[[1, 2], [3, 4]]]);
      const b = new Array3d([[[0, 1], [1, 1]]]);
      
      expect(() => a.divide(b)).toThrow(InvalidParameterError);
      expect(() => a.divideScalar(0)).toThrow(InvalidParameterError);
    });
  });
});