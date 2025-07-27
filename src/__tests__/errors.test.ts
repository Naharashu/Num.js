import { test, expect, describe } from "bun:test";
import {
  MathematicalError,
  DimensionError,
  SingularMatrixError,
  NonSquareMatrixError,
  NotPositiveDefiniteError,
  InvalidParameterError,
  ConvergenceError,
  NumericalOverflowError,
  DivisionByZeroError,
  IndexOutOfBoundsError,
  EmptyArrayError,
  isMathematicalError,
  isDimensionError,
  withErrorContext,
} from "../types/errors.js";

describe("Error Classes", () => {
  describe("MathematicalError", () => {
    test("should create error with operation context", () => {
      const error = new MathematicalError("Test error", "test_operation", { param: 42 });
      
      expect(error.name).toBe("MathematicalError");
      expect(error.message).toBe("Test error");
      expect(error.operation).toBe("test_operation");
      expect(error.context).toEqual({ param: 42 });
      expect(error instanceof MathematicalError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    test("should generate detailed error message", () => {
      const error = new MathematicalError("Test error", "test_op", { x: 1, y: "test" });
      const detailed = error.getDetailedMessage();
      
      expect(detailed).toContain("test_op: Test error");
      expect(detailed).toContain("Context:");
      expect(detailed).toContain("x=1");
      expect(detailed).toContain('y="test"');
    });
  });

  describe("DimensionError", () => {
    test("should create error with shape information", () => {
      const error = new DimensionError(
        "Incompatible shapes",
        [2, 3],
        [3, 2],
        "matrix_multiply"
      );
      
      expect(error.name).toBe("DimensionError");
      expect(error.expectedShape).toEqual([2, 3]);
      expect(error.actualShape).toEqual([3, 2]);
      expect(error.operation).toBe("matrix_multiply");
      expect(error.message).toContain("matrix_multiply");
      expect(error.message).toContain("Expected shape: [2, 3]");
      expect(error.message).toContain("got: [3, 2]");
    });

    test("should check broadcast compatibility", () => {
      // Compatible shapes
      expect(() => DimensionError.checkBroadcastCompatibility([3, 1], [3, 4])).not.toThrow();
      expect(() => DimensionError.checkBroadcastCompatibility([1], [3, 4])).not.toThrow();
      expect(() => DimensionError.checkBroadcastCompatibility([3, 4], [3, 4])).not.toThrow();
      
      // Incompatible shapes
      expect(() => DimensionError.checkBroadcastCompatibility([3, 2], [3, 4])).toThrow(DimensionError);
      expect(() => DimensionError.checkBroadcastCompatibility([2, 3], [4, 3])).toThrow(DimensionError);
    });
  });

  describe("SingularMatrixError", () => {
    test("should create error for singular matrix", () => {
      const error = new SingularMatrixError([3, 3]);
      
      expect(error.name).toBe("SingularMatrixError");
      expect(error.operation).toBe("matrix_inversion");
      expect(error.message).toContain("Matrix of shape [3, 3] is singular");
      expect(error instanceof MathematicalError).toBe(true);
    });

    test("should create error without shape", () => {
      const error = new SingularMatrixError();
      
      expect(error.message).toBe("Matrix is singular and cannot be inverted");
    });
  });

  describe("InvalidParameterError", () => {
    test("should create error with parameter details", () => {
      const error = new InvalidParameterError("x", "number", "string", "Must be numeric");
      
      expect(error.name).toBe("InvalidParameterError");
      expect(error.parameterName).toBe("x");
      expect(error.expectedType).toBe("number");
      expect(error.actualValue).toBe("string");
      expect(error.additionalInfo).toBe("Must be numeric");
      expect(error.message).toContain("Parameter 'x' expected number");
      expect(error.message).toContain("Must be numeric");
    });

    test("should create non-finite number error", () => {
      const error = InvalidParameterError.nonFiniteNumber("value", NaN);
      
      expect(error.parameterName).toBe("value");
      expect(error.expectedType).toBe("finite number");
      expect(error.message).toContain("Mathematical operations require finite numbers");
    });

    test("should create negative number error", () => {
      const error = InvalidParameterError.negativeNumber("count", -5);
      
      expect(error.parameterName).toBe("count");
      expect(error.expectedType).toBe("positive number");
      expect(error.actualValue).toBe(-5);
    });

    test("should create non-integer error", () => {
      const error = InvalidParameterError.nonInteger("index", 3.14);
      
      expect(error.parameterName).toBe("index");
      expect(error.expectedType).toBe("integer");
      expect(error.actualValue).toBe(3.14);
    });
  });

  describe("ConvergenceError", () => {
    test("should create convergence error", () => {
      const error = new ConvergenceError("newton_method", 100, 1e-6, 0.01);
      
      expect(error.name).toBe("ConvergenceError");
      expect(error.operation).toBe("newton_method");
      expect(error.maxIterations).toBe(100);
      expect(error.tolerance).toBe(1e-6);
      expect(error.finalError).toBe(0.01);
      expect(error.message).toContain("failed to converge after 100 iterations");
      expect(error.message).toContain("Final error: 0.01");
    });
  });

  describe("NumericalOverflowError", () => {
    test("should create overflow error", () => {
      const error = new NumericalOverflowError("factorial", Infinity);
      
      expect(error.name).toBe("NumericalOverflowError");
      expect(error.operation).toBe("factorial");
      expect(error.message).toContain("Numerical overflow in factorial");
      expect(error.message).toContain("result would be Infinity");
    });
  });

  describe("DivisionByZeroError", () => {
    test("should create division by zero error", () => {
      const error = new DivisionByZeroError("matrix_inverse");
      
      expect(error.name).toBe("DivisionByZeroError");
      expect(error.operation).toBe("matrix_inverse");
      expect(error.message).toBe("Division by zero");
    });
  });

  describe("IndexOutOfBoundsError", () => {
    test("should create index error", () => {
      const error = new IndexOutOfBoundsError(5, 3, 0);
      
      expect(error.name).toBe("IndexOutOfBoundsError");
      expect(error.index).toBe(5);
      expect(error.arrayLength).toBe(3);
      expect(error.dimension).toBe(0);
      expect(error.message).toContain("Index 5 is out of bounds for array of length 3 in dimension 0");
    });
  });

  describe("EmptyArrayError", () => {
    test("should create empty array error", () => {
      const error = new EmptyArrayError("mean");
      
      expect(error.name).toBe("EmptyArrayError");
      expect(error.message).toBe("Operation 'mean' cannot be performed on empty array");
    });
  });

  describe("Type Guards", () => {
    test("isMathematicalError should identify mathematical errors", () => {
      const mathError = new MathematicalError("test", "op");
      const singularError = new SingularMatrixError();
      const regularError = new Error("regular");
      
      expect(isMathematicalError(mathError)).toBe(true);
      expect(isMathematicalError(singularError)).toBe(true);
      expect(isMathematicalError(regularError)).toBe(false);
      expect(isMathematicalError("not an error")).toBe(false);
    });

    test("isDimensionError should identify dimension errors", () => {
      const dimError = new DimensionError("test", [1], [2]);
      const mathError = new MathematicalError("test", "op");
      
      expect(isDimensionError(dimError)).toBe(true);
      expect(isDimensionError(mathError)).toBe(false);
    });
  });

  describe("withErrorContext", () => {
    test("should wrap function with error context", () => {
      const throwingFn = () => {
        throw new Error("Original error");
      };
      
      const wrappedFn = withErrorContext(throwingFn, "test_operation");
      
      expect(() => wrappedFn()).toThrow(MathematicalError);
      
      try {
        wrappedFn();
      } catch (error) {
        expect(error instanceof MathematicalError).toBe(true);
        if (error instanceof MathematicalError) {
          expect(error.operation).toBe("test_operation");
          expect(error.message).toBe("Original error");
        }
      }
    });

    test("should not wrap mathematical errors", () => {
      const throwingFn = () => {
        throw new SingularMatrixError();
      };
      
      const wrappedFn = withErrorContext(throwingFn, "test_operation");
      
      expect(() => wrappedFn()).toThrow(SingularMatrixError);
      
      try {
        wrappedFn();
      } catch (error) {
        expect(error instanceof SingularMatrixError).toBe(true);
        expect(error instanceof MathematicalError).toBe(true);
      }
    });

    test("should preserve function arguments and return value", () => {
      const addFn = (a: number, b: number) => a + b;
      const wrappedFn = withErrorContext(addFn, "addition");
      
      expect(wrappedFn(2, 3)).toBe(5);
    });
  });
});