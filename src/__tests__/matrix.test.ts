import { test, expect, describe } from "bun:test";
import { Matrix, MatrixCompat } from "../matrix/Matrix.js";
import {
  DimensionError,
  InvalidParameterError,
  SingularMatrixError,
  NonSquareMatrixError,
} from "../types/errors.js";

describe("Matrix Class", () => {
  describe("Constructor and Properties", () => {
    test("should create matrix from 2D array", () => {
      const data = [[1, 2], [3, 4]];
      const matrix = new Matrix(data);
      
      expect(matrix.rows).toBe(2);
      expect(matrix.cols).toBe(2);
      expect(matrix.data).toEqual(data);
      expect(matrix.shape).toEqual([2, 2]);
      expect(matrix.size).toBe(4);
    });

    test("should create immutable matrix (data is copied)", () => {
      const data = [[1, 2], [3, 4]];
      const matrix = new Matrix(data);
      
      // Modify original data
      const firstRow = data[0];
      if (firstRow) {
        firstRow[0] = 999;
      }
      
      // Matrix should be unchanged
      expect(matrix.get(0, 0)).toBe(1);
      const matrixData = matrix.data;
      const matrixFirstRow = matrixData[0];
      if (matrixFirstRow) {
        expect(matrixFirstRow[0]).toBe(1);
      }
    });

    test("should throw error for invalid data", () => {
      expect(() => new Matrix([])).toThrow();
      expect(() => new Matrix([[]])).toThrow();
      expect(() => new Matrix([[1, 2], [3]])).toThrow();
      expect(() => new Matrix([[1, 2], [3, "4"]] as any)).toThrow();
    });
  });

  describe("Static Factory Methods", () => {
    test("create should make matrix with fill value", () => {
      const matrix = Matrix.create(2, 3, 5);
      
      expect(matrix.rows).toBe(2);
      expect(matrix.cols).toBe(3);
      expect(matrix.data).toEqual([[5, 5, 5], [5, 5, 5]]);
    });

    test("identity should create identity matrix", () => {
      const matrix = Matrix.identity(3);
      
      expect(matrix.data).toEqual([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]);
    });

    test("zeros should create zero matrix", () => {
      const matrix = Matrix.zeros(2, 2);
      
      expect(matrix.data).toEqual([[0, 0], [0, 0]]);
    });

    test("ones should create ones matrix", () => {
      const matrix = Matrix.ones(2, 2);
      
      expect(matrix.data).toEqual([[1, 1], [1, 1]]);
    });

    test("diagonal should create diagonal matrix", () => {
      const matrix = Matrix.diagonal([1, 2, 3]);
      
      expect(matrix.data).toEqual([
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 3]
      ]);
    });

    test("random should create matrix with values in range", () => {
      const matrix = Matrix.random(2, 2, 0, 1);
      
      expect(matrix.rows).toBe(2);
      expect(matrix.cols).toBe(2);
      
      // Check all values are in range [0, 1)
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const val = matrix.get(i, j);
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThan(1);
        }
      }
    });
  });

  describe("Element Access", () => {
    const matrix = new Matrix([[1, 2, 3], [4, 5, 6]]);

    test("get should return correct element", () => {
      expect(matrix.get(0, 0)).toBe(1);
      expect(matrix.get(0, 2)).toBe(3);
      expect(matrix.get(1, 1)).toBe(5);
    });

    test("get should throw for invalid indices", () => {
      expect(() => matrix.get(-1, 0)).toThrow(InvalidParameterError);
      expect(() => matrix.get(2, 0)).toThrow(InvalidParameterError);
      expect(() => matrix.get(0, 3)).toThrow(InvalidParameterError);
    });

    test("getRow should return correct row", () => {
      expect(matrix.getRow(0)).toEqual([1, 2, 3]);
      expect(matrix.getRow(1)).toEqual([4, 5, 6]);
    });

    test("getColumn should return correct column", () => {
      expect(matrix.getColumn(0)).toEqual([1, 4]);
      expect(matrix.getColumn(1)).toEqual([2, 5]);
      expect(matrix.getColumn(2)).toEqual([3, 6]);
    });
  });

  describe("Basic Operations", () => {
    test("add should add matrices element-wise", () => {
      const a = new Matrix([[1, 2], [3, 4]]);
      const b = new Matrix([[5, 6], [7, 8]]);
      const result = a.add(b);
      
      expect(result.data).toEqual([[6, 8], [10, 12]]);
    });

    test("add should throw for incompatible dimensions", () => {
      const a = new Matrix([[1, 2]]);
      const b = new Matrix([[1], [2]]);
      
      expect(() => a.add(b)).toThrow(DimensionError);
    });

    test("subtract should subtract matrices element-wise", () => {
      const a = new Matrix([[5, 6], [7, 8]]);
      const b = new Matrix([[1, 2], [3, 4]]);
      const result = a.subtract(b);
      
      expect(result.data).toEqual([[4, 4], [4, 4]]);
    });

    test("multiply should multiply matrices element-wise", () => {
      const a = new Matrix([[1, 2], [3, 4]]);
      const b = new Matrix([[2, 3], [4, 5]]);
      const result = a.multiply(b);
      
      expect(result.data).toEqual([[2, 6], [12, 20]]);
    });

    test("multiplyScalar should multiply by scalar", () => {
      const a = new Matrix([[1, 2], [3, 4]]);
      const result = a.multiplyScalar(2);
      
      expect(result.data).toEqual([[2, 4], [6, 8]]);
    });

    test("dot should perform matrix multiplication", () => {
      const a = new Matrix([[1, 2], [3, 4]]);
      const b = new Matrix([[5, 6], [7, 8]]);
      const result = a.dot(b);
      
      // [1*5 + 2*7, 1*6 + 2*8] = [19, 22]
      // [3*5 + 4*7, 3*6 + 4*8] = [43, 50]
      expect(result.data).toEqual([[19, 22], [43, 50]]);
    });

    test("dot should throw for incompatible dimensions", () => {
      const a = new Matrix([[1, 2]]);
      const b = new Matrix([[1], [2], [3]]);
      
      expect(() => a.dot(b)).toThrow(DimensionError);
    });

    test("transpose should transpose matrix", () => {
      const a = new Matrix([[1, 2, 3], [4, 5, 6]]);
      const result = a.transpose();
      
      expect(result.data).toEqual([[1, 4], [2, 5], [3, 6]]);
    });

    test("equals should compare matrices correctly", () => {
      const a = new Matrix([[1, 2], [3, 4]]);
      const b = new Matrix([[1, 2], [3, 4]]);
      const c = new Matrix([[1, 2], [3, 5]]);
      
      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });

    test("clone should create independent copy", () => {
      const a = new Matrix([[1, 2], [3, 4]]);
      const b = a.clone();
      
      expect(a.equals(b)).toBe(true);
      expect(a).not.toBe(b); // Different objects
    });

    test("map should transform elements", () => {
      const a = new Matrix([[1, 2], [3, 4]]);
      const result = a.map((val, i, j) => val * 2 + i + j);
      
      // [1*2+0+0, 2*2+0+1] = [2, 5]
      // [3*2+1+0, 4*2+1+1] = [7, 10]
      expect(result.data).toEqual([[2, 5], [7, 10]]);
    });
  });

  describe("Advanced Operations", () => {
    test("determinant should calculate 2x2 determinant", () => {
      const matrix = new Matrix([[1, 2], [3, 4]]);
      const det = matrix.determinant();
      
      expect(det).toBe(1 * 4 - 2 * 3); // -2
    });

    test("determinant should calculate 3x3 determinant", () => {
      const matrix = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]);
      const det = matrix.determinant();
      
      expect(Math.abs(det)).toBeLessThan(1e-10); // This matrix is singular (close to 0)
    });

    test("determinant should throw for non-square matrix", () => {
      const matrix = new Matrix([[1, 2, 3], [4, 5, 6]]);
      
      expect(() => matrix.determinant()).toThrow(DimensionError);
    });

    test("inverse should calculate 2x2 inverse", () => {
      const matrix = new Matrix([[1, 2], [3, 4]]);
      const inv = matrix.inverse();
      
      // Verify A * A^-1 = I
      const identity = matrix.dot(inv);
      const expected = Matrix.identity(2);
      
      // Check with tolerance for floating point errors
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          expect(Math.abs(identity.get(i, j) - expected.get(i, j))).toBeLessThan(1e-10);
        }
      }
    });

    test("inverse should throw for singular matrix", () => {
      const singular = new Matrix([[1, 2], [2, 4]]);
      
      expect(() => singular.inverse()).toThrow(SingularMatrixError);
    });

    test("trace should calculate sum of diagonal elements", () => {
      const matrix = new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const trace = matrix.trace();
      
      expect(trace).toBe(1 + 5 + 9); // 15
    });

    test("rank should calculate matrix rank", () => {
      const matrix = new Matrix([[1, 2], [3, 4]]);
      expect(matrix.rank()).toBe(2);
      
      const singular = new Matrix([[1, 2], [2, 4]]);
      expect(singular.rank()).toBe(1);
    });

    test("norm should calculate Frobenius norm", () => {
      const matrix = new Matrix([[1, 2], [3, 4]]);
      const norm = matrix.norm('fro');
      
      expect(norm).toBeCloseTo(Math.sqrt(1 + 4 + 9 + 16)); // sqrt(30)
    });

    test("isSquare should identify square matrices", () => {
      const square = new Matrix([[1, 2], [3, 4]]);
      const rect = new Matrix([[1, 2, 3], [4, 5, 6]]);
      
      expect(square.isSquare()).toBe(true);
      expect(rect.isSquare()).toBe(false);
    });

    test("isSymmetric should identify symmetric matrices", () => {
      const symmetric = new Matrix([[1, 2], [2, 3]]);
      const asymmetric = new Matrix([[1, 2], [3, 4]]);
      
      expect(symmetric.isSymmetric()).toBe(true);
      expect(asymmetric.isSymmetric()).toBe(false);
    });

    test("solve should solve linear system", () => {
      const A = new Matrix([[2, 1], [1, 1]]);
      const b = [3, 2];
      const x = A.solve(b);
      
      // Verify Ax = b
      const result = A.dot(new Matrix([x]).transpose());
      expect(result.get(0, 0)).toBeCloseTo(3);
      expect(result.get(1, 0)).toBeCloseTo(2);
    });
  });

  describe("Backward Compatibility", () => {
    test("MatrixCompat.create should work like original", () => {
      const result = MatrixCompat.create(2, 2, 5);
      
      expect(result).toEqual([[5, 5], [5, 5]]);
    });

    test("MatrixCompat.add should work like original", () => {
      const a = [[1, 2], [3, 4]];
      const b = [[5, 6], [7, 8]];
      const result = MatrixCompat.add(a, b);
      
      expect(result).toEqual([[6, 8], [10, 12]]);
    });

    test("MatrixCompat.dot should perform matrix multiplication (FIXED)", () => {
      const a = [[1, 2], [3, 4]];
      const b = [[5, 6], [7, 8]];
      const result = MatrixCompat.dot(a, b);
      
      // Should be matrix multiplication, not division
      expect(result).toEqual([[19, 22], [43, 50]]);
    });

    test("MatrixCompat.equals should work like original", () => {
      const a = [[1, 2], [3, 4]];
      const b = [[1, 2], [3, 4]];
      const c = [[1, 2], [3, 5]];
      
      expect(MatrixCompat.equals(a, b)).toBe(true);
      expect(MatrixCompat.equals(a, c)).toBe(false);
    });

    test("MatrixCompat.map should work like original", () => {
      const matrix = [[1, 2], [3, 4]];
      const result = MatrixCompat.map(matrix, (val, i, j) => val * 2);
      
      expect(result).toEqual([[2, 4], [6, 8]]);
    });
  });

  describe("String Representation", () => {
    test("toString should format matrix nicely", () => {
      const matrix = new Matrix([[1, 2], [3, 4]]);
      const str = matrix.toString();
      
      expect(str).toContain('[1, 2]');
      expect(str).toContain('[3, 4]');
    });
  });

  describe("Error Handling", () => {
    test("should validate constructor parameters", () => {
      expect(() => new Matrix([] as any)).toThrow();
      expect(() => new Matrix([[1, 2], [3]] as any)).toThrow();
    });

    test("should validate static method parameters", () => {
      expect(() => Matrix.create(0, 2)).toThrow(InvalidParameterError);
      expect(() => Matrix.create(2, -1)).toThrow(InvalidParameterError);
      expect(() => Matrix.identity(-1)).toThrow(InvalidParameterError);
    });

    test("should validate operation compatibility", () => {
      const a = new Matrix([[1, 2]]);
      const b = new Matrix([[1], [2]]);
      
      expect(() => a.add(b)).toThrow(DimensionError);
      expect(() => a.subtract(b)).toThrow(DimensionError);
      expect(() => a.multiply(b)).toThrow(DimensionError);
    });

    test("should handle singular matrices appropriately", () => {
      const singular = new Matrix([[1, 2], [2, 4]]);
      
      expect(() => singular.inverse()).toThrow(SingularMatrixError);
    });
  });
});