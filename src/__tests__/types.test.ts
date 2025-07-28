import { test, expect, describe } from "bun:test";
import {
  isFiniteNumber,
  isNumericArray,
  isNumericMatrix,
  isComplexNumber,
} from "../types/common.js";
import { MATH_CONSTANTS } from "../core/constants.js";
import {
  isMatrixLike,
  isNumericMatrixLike,
  isArray3dLike,
  validateMatrixDimensions,
  validateMatrixMultiplication,
  isSquareMatrix,
  getMatrixShape,
  getArray3dShape,
} from "../types/matrix.js";
import {
  validateFiniteNumber,
  validatePositiveNumber,
  validateInteger,
  validateNumericArray,
  validateNumericMatrix,
  validateSquareMatrix,
  validateSameDimensions,
  validateArrayIndex,
} from "../types/validation.js";
import {
  InvalidParameterError,
  DimensionError,
  EmptyArrayError,
} from "../types/errors.js";

describe("Common Types", () => {
  describe("Type Guards", () => {
    test("isFiniteNumber should identify finite numbers", () => {
      expect(isFiniteNumber(42)).toBe(true);
      expect(isFiniteNumber(3.14)).toBe(true);
      expect(isFiniteNumber(0)).toBe(true);
      expect(isFiniteNumber(-5)).toBe(true);
      
      expect(isFiniteNumber(NaN)).toBe(false);
      expect(isFiniteNumber(Infinity)).toBe(false);
      expect(isFiniteNumber(-Infinity)).toBe(false);
      expect(isFiniteNumber("42")).toBe(false);
      expect(isFiniteNumber(null)).toBe(false);
      expect(isFiniteNumber(undefined)).toBe(false);
    });

    test("isNumericArray should identify numeric arrays", () => {
      expect(isNumericArray([1, 2, 3])).toBe(true);
      expect(isNumericArray([0])).toBe(true);
      expect(isNumericArray([-1, 0, 1])).toBe(true);
      expect(isNumericArray([3.14, 2.71])).toBe(true);
      
      expect(isNumericArray([])).toBe(true); // Empty array is valid
      expect(isNumericArray([1, "2", 3])).toBe(false);
      expect(isNumericArray([1, NaN, 3])).toBe(false);
      expect(isNumericArray([1, Infinity, 3])).toBe(false);
      expect(isNumericArray("not array")).toBe(false);
      expect(isNumericArray(null)).toBe(false);
    });

    test("isNumericMatrix should identify numeric matrices", () => {
      expect(isNumericMatrix([[1, 2], [3, 4]])).toBe(true);
      expect(isNumericMatrix([[1]])).toBe(true);
      expect(isNumericMatrix([[1, 2, 3], [4, 5, 6]])).toBe(true);
      
      expect(isNumericMatrix([])).toBe(false); // Empty matrix
      expect(isNumericMatrix([[]])).toBe(false); // Empty rows
      expect(isNumericMatrix([[1, 2], [3]])).toBe(false); // Inconsistent row lengths
      expect(isNumericMatrix([[1, 2], [3, "4"]])).toBe(false); // Non-numeric element
      expect(isNumericMatrix([[1, 2], [3, NaN]])).toBe(false); // NaN element
      expect(isNumericMatrix("not matrix")).toBe(false);
    });

    test("isComplexNumber should identify complex numbers", () => {
      expect(isComplexNumber({ real: 1, imag: 2 })).toBe(true);
      expect(isComplexNumber({ real: 0, imag: 0 })).toBe(true);
      expect(isComplexNumber({ real: -1, imag: 3.14 })).toBe(true);
      
      expect(isComplexNumber({ real: 1 })).toBe(false); // Missing imag
      expect(isComplexNumber({ imag: 2 })).toBe(false); // Missing real
      expect(isComplexNumber({ real: "1", imag: 2 })).toBe(false); // Non-numeric real
      expect(isComplexNumber({ real: 1, imag: NaN })).toBe(false); // NaN imag
      expect(isComplexNumber(null)).toBe(false);
      expect(isComplexNumber("complex")).toBe(false);
    });
  });

  describe("Math Constants", () => {
    test("should provide correct mathematical constants", () => {
      expect(MATH_CONSTANTS.E).toBe(Math.E);
      expect(MATH_CONSTANTS.PI).toBe(Math.PI);
      expect(MATH_CONSTANTS.LN2).toBe(Math.LN2);
      expect(MATH_CONSTANTS.SQRT2).toBe(Math.SQRT2);
      expect(MATH_CONSTANTS.EPSILON).toBe(Number.EPSILON);
      expect(MATH_CONSTANTS.MAX_SAFE_INTEGER).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});

describe("Matrix Types", () => {
  describe("Type Guards", () => {
    test("isMatrixLike should identify matrix-like objects", () => {
      const matrix = {
        rows: 2,
        cols: 3,
        data: [[1, 2, 3], [4, 5, 6]]
      };
      
      expect(isMatrixLike(matrix)).toBe(true);
      
      expect(isMatrixLike({ rows: 2, cols: 3 })).toBe(false); // Missing data
      expect(isMatrixLike({ data: [[1, 2]] })).toBe(false); // Missing rows/cols
      expect(isMatrixLike({ rows: "2", cols: 3, data: [] })).toBe(false); // Non-numeric rows
      expect(isMatrixLike(null)).toBe(false);
    });

    test("isNumericMatrixLike should identify numeric matrix-like objects", () => {
      const matrix = {
        rows: 2,
        cols: 2,
        data: [[1, 2], [3, 4]]
      };
      
      expect(isNumericMatrixLike(matrix)).toBe(true);
      
      const invalidMatrix = {
        rows: 2,
        cols: 2,
        data: [[1, 2], [3, "4"]]
      };
      
      expect(isNumericMatrixLike(invalidMatrix)).toBe(false);
    });

    test("isArray3dLike should identify 3D array-like objects", () => {
      const array3d = {
        x: 2,
        y: 2,
        z: 2,
        data: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
      };
      
      expect(isArray3dLike(array3d)).toBe(true);
      
      expect(isArray3dLike({ x: 2, y: 2 })).toBe(false); // Missing z and data
      expect(isArray3dLike({ x: "2", y: 2, z: 2, data: [] })).toBe(false); // Non-numeric x
    });
  });

  describe("Utility Functions", () => {
    test("validateMatrixDimensions should check compatible dimensions", () => {
      const a = { rows: 2, cols: 3, data: [[1, 2, 3], [4, 5, 6]] };
      const b = { rows: 2, cols: 3, data: [[1, 1, 1], [2, 2, 2]] };
      const c = { rows: 3, cols: 2, data: [[1, 2], [3, 4], [5, 6]] };
      
      expect(() => validateMatrixDimensions(a, b, "addition")).not.toThrow();
      expect(() => validateMatrixDimensions(a, c, "addition")).toThrow();
    });

    test("validateMatrixMultiplication should check multiplication compatibility", () => {
      const a = { rows: 2, cols: 3, data: [[1, 2, 3], [4, 5, 6]] };
      const b = { rows: 3, cols: 2, data: [[1, 2], [3, 4], [5, 6]] };
      const c = { rows: 2, cols: 2, data: [[1, 2], [3, 4]] };
      
      expect(() => validateMatrixMultiplication(a, b)).not.toThrow();
      expect(() => validateMatrixMultiplication(a, c)).toThrow();
    });

    test("isSquareMatrix should identify square matrices", () => {
      const square = { rows: 3, cols: 3, data: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] };
      const rect = { rows: 2, cols: 3, data: [[1, 2, 3], [4, 5, 6]] };
      
      expect(isSquareMatrix(square)).toBe(true);
      expect(isSquareMatrix(rect)).toBe(false);
    });

    test("getMatrixShape should return correct shape", () => {
      const matrix = { rows: 2, cols: 3, data: [[1, 2, 3], [4, 5, 6]] };
      expect(getMatrixShape(matrix)).toEqual([2, 3]);
    });

    test("getArray3dShape should return correct shape", () => {
      const array3d = { x: 2, y: 3, z: 4, data: [] };
      expect(getArray3dShape(array3d)).toEqual([2, 3, 4]);
    });
  });
});

describe("Validation Functions", () => {
  describe("Basic Validation", () => {
    test("validateFiniteNumber should validate finite numbers", () => {
      expect(() => validateFiniteNumber(42)).not.toThrow();
      expect(() => validateFiniteNumber(3.14)).not.toThrow();
      expect(() => validateFiniteNumber(0)).not.toThrow();
      
      expect(() => validateFiniteNumber(NaN)).toThrow(InvalidParameterError);
      expect(() => validateFiniteNumber(Infinity)).toThrow(InvalidParameterError);
      expect(() => validateFiniteNumber("42")).toThrow(InvalidParameterError);
    });

    test("validatePositiveNumber should validate positive numbers", () => {
      expect(() => validatePositiveNumber(42)).not.toThrow();
      expect(() => validatePositiveNumber(0.1)).not.toThrow();
      
      expect(() => validatePositiveNumber(0)).toThrow(InvalidParameterError);
      expect(() => validatePositiveNumber(-1)).toThrow(InvalidParameterError);
      expect(() => validatePositiveNumber(NaN)).toThrow(InvalidParameterError);
    });

    test("validateInteger should validate integers", () => {
      expect(() => validateInteger(42)).not.toThrow();
      expect(() => validateInteger(0)).not.toThrow();
      expect(() => validateInteger(-5)).not.toThrow();
      
      expect(() => validateInteger(3.14)).toThrow(InvalidParameterError);
      expect(() => validateInteger(NaN)).toThrow(InvalidParameterError);
      expect(() => validateInteger("42")).toThrow(InvalidParameterError);
    });
  });

  describe("Array Validation", () => {
    test("validateNumericArray should validate numeric arrays", () => {
      expect(() => validateNumericArray([1, 2, 3])).not.toThrow();
      expect(() => validateNumericArray([0])).not.toThrow();
      expect(() => validateNumericArray([-1, 0, 1])).not.toThrow();
      
      expect(() => validateNumericArray([])).toThrow(EmptyArrayError);
      expect(() => validateNumericArray([1, "2", 3])).toThrow(InvalidParameterError);
      expect(() => validateNumericArray([1, NaN, 3])).toThrow(InvalidParameterError);
      expect(() => validateNumericArray("not array")).toThrow(InvalidParameterError);
    });

    test("validateNumericMatrix should validate numeric matrices", () => {
      expect(() => validateNumericMatrix([[1, 2], [3, 4]])).not.toThrow();
      expect(() => validateNumericMatrix([[1]])).not.toThrow();
      
      expect(() => validateNumericMatrix([])).toThrow(EmptyArrayError);
      expect(() => validateNumericMatrix([[]])).toThrow(InvalidParameterError);
      expect(() => validateNumericMatrix([[1, 2], [3]])).toThrow(DimensionError);
      expect(() => validateNumericMatrix([[1, 2], [3, "4"]])).toThrow(InvalidParameterError);
      expect(() => validateNumericMatrix("not matrix")).toThrow(InvalidParameterError);
    });
  });

  describe("Matrix Validation", () => {
    test("validateSquareMatrix should validate square matrices", () => {
      const square = { rows: 2, cols: 2, data: [[1, 2], [3, 4]] };
      const rect = { rows: 2, cols: 3, data: [[1, 2, 3], [4, 5, 6]] };
      
      expect(() => validateSquareMatrix(square)).not.toThrow();
      expect(() => validateSquareMatrix(rect)).toThrow(DimensionError);
    });

    test("validateSameDimensions should validate matching dimensions", () => {
      const a = { rows: 2, cols: 3, data: [[1, 2, 3], [4, 5, 6]] };
      const b = { rows: 2, cols: 3, data: [[1, 1, 1], [2, 2, 2]] };
      const c = { rows: 3, cols: 2, data: [[1, 2], [3, 4], [5, 6]] };
      
      expect(() => validateSameDimensions(a, b)).not.toThrow();
      expect(() => validateSameDimensions(a, c)).toThrow(DimensionError);
    });
  });

  describe("Index Validation", () => {
    test("validateArrayIndex should validate array indices", () => {
      expect(() => validateArrayIndex(0, 5)).not.toThrow();
      expect(() => validateArrayIndex(4, 5)).not.toThrow();
      
      expect(() => validateArrayIndex(-1, 5)).toThrow(InvalidParameterError);
      expect(() => validateArrayIndex(5, 5)).toThrow(InvalidParameterError);
      expect(() => validateArrayIndex(3.14, 5)).toThrow(InvalidParameterError);
    });
  });
});