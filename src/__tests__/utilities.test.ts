/**
 * Unit tests for core utilities
 */

import { test, expect, describe } from "bun:test";
import {
  getShape,
  getDimensions,
  hasSameShape,
  isBroadcastable,
  getBroadcastShape,
  flatten,
  reshape,
  transpose,
  zeros,
  ones,
  full,
  eye,
  allEqual,
  unique,
  countUnique,
  isShape,
  isMatrixLike,
  isArray3dLike
} from "../core/utilities";
import { InvalidParameterError, DimensionError } from "../types/errors";

describe("Shape Detection and Analysis", () => {
  describe("getShape", () => {
    test("should get shape of 1D array", () => {
      expect(getShape([1, 2, 3])).toEqual([3]);
      expect(getShape([5])).toEqual([1]);
      expect(getShape([])).toEqual([0]);
    });

    test("should get shape of 2D array", () => {
      expect(getShape([[1, 2], [3, 4]])).toEqual([2, 2]);
      expect(getShape([[1, 2, 3], [4, 5, 6]])).toEqual([2, 3]);
      expect(getShape([[1]])).toEqual([1, 1]);
    });

    test("should get shape of 3D array", () => {
      expect(getShape([[[1, 2]], [[3, 4]]])).toEqual([2, 1, 2]);
      expect(getShape([[[1, 2, 3], [4, 5, 6]]])).toEqual([1, 2, 3]);
    });

    test("should throw error for invalid input", () => {
      expect(() => getShape("invalid" as any)).toThrow(InvalidParameterError);
      expect(() => getShape([[1, 2], [3, "invalid"]] as any)).toThrow();
    });
  });

  describe("getDimensions", () => {
    test("should get dimensions for 2D array", () => {
      const dims = getDimensions([[1, 2, 3], [4, 5, 6]]);
      expect(dims.shape).toEqual([2, 3]);
      expect(dims.ndim).toBe(2);
      expect(dims.size).toBe(6);
    });

    test("should get dimensions for 1D array", () => {
      const dims = getDimensions([1, 2, 3, 4]);
      expect(dims.shape).toEqual([4]);
      expect(dims.ndim).toBe(1);
      expect(dims.size).toBe(4);
    });
  });

  describe("hasSameShape", () => {
    test("should return true for same shapes", () => {
      expect(hasSameShape([1, 2, 3], [4, 5, 6])).toBe(true);
      expect(hasSameShape([[1, 2]], [[3, 4]])).toBe(true);
    });

    test("should return false for different shapes", () => {
      expect(hasSameShape([1, 2], [1, 2, 3])).toBe(false);
      expect(hasSameShape([1, 2], [[1, 2]])).toBe(false);
    });
  });

  describe("isBroadcastable", () => {
    test("should return true for broadcastable shapes", () => {
      expect(isBroadcastable([3, 4], [4])).toBe(true);
      expect(isBroadcastable([3, 1], [1, 4])).toBe(true);
      expect(isBroadcastable([3, 4], [3, 4])).toBe(true);
      expect(isBroadcastable([1], [5])).toBe(true);
    });

    test("should return false for non-broadcastable shapes", () => {
      expect(isBroadcastable([3, 4], [2, 4])).toBe(false);
      expect(isBroadcastable([3, 4], [3, 5])).toBe(false);
    });
  });

  describe("getBroadcastShape", () => {
    test("should calculate correct broadcast shape", () => {
      expect(getBroadcastShape([3, 4], [4])).toEqual([3, 4]);
      expect(getBroadcastShape([3, 1], [1, 4])).toEqual([3, 4]);
      expect(getBroadcastShape([1], [5])).toEqual([5]);
    });

    test("should throw error for non-broadcastable shapes", () => {
      expect(() => getBroadcastShape([3, 4], [2, 4])).toThrow(DimensionError);
    });
  });
});

describe("Array Reshaping and Manipulation", () => {
  describe("flatten", () => {
    test("should flatten 2D array", () => {
      expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });

    test("should flatten 3D array", () => {
      expect(flatten([[[1, 2]], [[3, 4]]])).toEqual([1, 2, 3, 4]);
    });

    test("should handle 1D array", () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe("reshape", () => {
    test("should reshape 1D to 2D", () => {
      expect(reshape([1, 2, 3, 4], [2, 2])).toEqual([[1, 2], [3, 4]]);
      expect(reshape([1, 2, 3, 4, 5, 6], [2, 3])).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    test("should reshape 1D to 3D", () => {
      expect(reshape([1, 2, 3, 4, 5, 6, 7, 8], [2, 2, 2])).toEqual([
        [[1, 2], [3, 4]], 
        [[5, 6], [7, 8]]
      ]);
    });

    test("should handle 1D reshape", () => {
      expect(reshape([1, 2, 3], [3])).toEqual([1, 2, 3]);
    });

    test("should throw error for incompatible size", () => {
      expect(() => reshape([1, 2, 3], [2, 2])).toThrow(DimensionError);
    });

    test("should throw error for invalid shape", () => {
      expect(() => reshape([1, 2, 3], [0, 3])).toThrow(InvalidParameterError);
      expect(() => reshape([1, 2, 3], [])).toThrow(InvalidParameterError);
    });
  });

  describe("transpose", () => {
    test("should transpose 2D matrix", () => {
      expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
    });

    test("should transpose square matrix", () => {
      expect(transpose([[1, 2], [3, 4]])).toEqual([[1, 3], [2, 4]]);
    });

    test("should handle single row", () => {
      expect(transpose([[1, 2, 3]])).toEqual([[1], [2], [3]]);
    });
  });
});

describe("Array Generation Utilities", () => {
  describe("zeros", () => {
    test("should create 1D zeros array", () => {
      expect(zeros([3])).toEqual([0, 0, 0]);
    });

    test("should create 2D zeros array", () => {
      expect(zeros([2, 3])).toEqual([[0, 0, 0], [0, 0, 0]]);
    });

    test("should create 3D zeros array", () => {
      expect(zeros([2, 1, 2])).toEqual([[[0, 0]], [[0, 0]]]);
    });

    test("should throw error for invalid shape", () => {
      expect(() => zeros([])).toThrow(InvalidParameterError);
      expect(() => zeros([2, 3, 4, 5])).toThrow(InvalidParameterError);
    });
  });

  describe("ones", () => {
    test("should create 1D ones array", () => {
      expect(ones([3])).toEqual([1, 1, 1]);
    });

    test("should create 2D ones array", () => {
      expect(ones([2, 2])).toEqual([[1, 1], [1, 1]]);
    });
  });

  describe("full", () => {
    test("should create array filled with value", () => {
      expect(full([3], 5)).toEqual([5, 5, 5]);
      expect(full([2, 2], 3.14)).toEqual([[3.14, 3.14], [3.14, 3.14]]);
    });

    test("should throw error for invalid value", () => {
      expect(() => full([2], NaN)).toThrow(InvalidParameterError);
      expect(() => full([2], Infinity)).toThrow(InvalidParameterError);
    });
  });

  describe("eye", () => {
    test("should create identity matrix", () => {
      expect(eye(3)).toEqual([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]);
    });

    test("should create 2x2 identity", () => {
      expect(eye(2)).toEqual([[1, 0], [0, 1]]);
    });

    test("should throw error for invalid size", () => {
      expect(() => eye(0)).toThrow(InvalidParameterError);
      expect(() => eye(-1)).toThrow(InvalidParameterError);
      expect(() => eye(1.5)).toThrow(InvalidParameterError);
    });
  });
});

describe("Array Comparison and Analysis", () => {
  describe("allEqual", () => {
    test("should return true for equal elements", () => {
      expect(allEqual([1, 1, 1])).toBe(true);
      expect(allEqual([5])).toBe(true);
      expect(allEqual([])).toBe(true);
    });

    test("should return false for different elements", () => {
      expect(allEqual([1, 2, 1])).toBe(false);
      expect(allEqual([1, 1.1])).toBe(false);
    });

    test("should handle tolerance", () => {
      expect(allEqual([1, 1.0001, 1], 0.001)).toBe(true);
      expect(allEqual([1, 1.1, 1], 0.05)).toBe(false);
    });
  });

  describe("unique", () => {
    test("should return unique elements", () => {
      expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
      expect(unique([3, 1, 2])).toEqual([1, 2, 3]);
    });

    test("should handle empty array", () => {
      expect(unique([])).toEqual([]);
    });

    test("should handle single element", () => {
      expect(unique([5])).toEqual([5]);
    });
  });

  describe("countUnique", () => {
    test("should count unique elements", () => {
      const counts = countUnique([1, 2, 2, 3, 1]);
      expect(counts.get(1)).toBe(2);
      expect(counts.get(2)).toBe(2);
      expect(counts.get(3)).toBe(1);
    });

    test("should handle single element", () => {
      const counts = countUnique([5]);
      expect(counts.get(5)).toBe(1);
      expect(counts.size).toBe(1);
    });
  });
});

describe("Type Guards", () => {
  describe("isShape", () => {
    test("should return true for valid shapes", () => {
      expect(isShape([3])).toBe(true);
      expect(isShape([2, 3])).toBe(true);
      expect(isShape([1, 2, 3])).toBe(true);
    });

    test("should return false for invalid shapes", () => {
      expect(isShape([])).toBe(false);
      expect(isShape([0, 3])).toBe(false);
      expect(isShape([1.5, 2])).toBe(false);
      expect(isShape("invalid")).toBe(false);
    });
  });

  describe("isMatrixLike", () => {
    test("should return true for matrix-like objects", () => {
      const matrixLike = {
        rows: 2,
        cols: 3,
        data: [[1, 2, 3], [4, 5, 6]]
      };
      expect(isMatrixLike(matrixLike)).toBe(true);
    });

    test("should return false for non-matrix-like objects", () => {
      expect(isMatrixLike({})).toBe(false);
      expect(isMatrixLike({ rows: 2 })).toBe(false);
      expect(isMatrixLike(null)).toBe(false);
      expect(isMatrixLike("invalid")).toBe(false);
    });
  });

  describe("isArray3dLike", () => {
    test("should return true for 3D array-like objects", () => {
      const array3dLike = {
        x: 2,
        y: 2,
        z: 2,
        data: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
      };
      expect(isArray3dLike(array3dLike)).toBe(true);
    });

    test("should return false for non-3D array-like objects", () => {
      expect(isArray3dLike({})).toBe(false);
      expect(isArray3dLike({ x: 2, y: 2 })).toBe(false);
      expect(isArray3dLike(null)).toBe(false);
    });
  });
});

describe("Edge Cases and Error Handling", () => {
  test("should handle empty arrays appropriately", () => {
    expect(getShape([])).toEqual([0]);
    expect(flatten([])).toEqual([]);
  });

  test("should validate input parameters", () => {
    expect(() => getShape(null as any)).toThrow(InvalidParameterError);
    expect(() => reshape(null as any, [2, 2])).toThrow();
    expect(() => transpose(null as any)).toThrow();
  });

  test("should handle numerical edge cases", () => {
    expect(allEqual([0, -0])).toBe(true);
    expect(unique([0, -0])).toEqual([0]);
  });
});