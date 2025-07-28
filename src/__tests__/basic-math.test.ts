import { test, expect, describe } from "bun:test";
import {
  range,
  linspace,
  randin,
  randint,
  randomArray,
  root,
  power,
  factorial,
  doubleFactorial,
  combinations,
  permutations,
  fibonacci,
  fibonacciSequence,
  sigmoid,
  sigmoidArray,
  softmax,
  relu,
  reluArray,
  leakyRelu,
  tanh,
  clamp,
  lerp,
  mapRange,
  approxEqual,
} from "../core/basic-math.js";
import {
  InvalidParameterError,
  MathematicalError,
  NumericalOverflowError,
  DivisionByZeroError,
  EmptyArrayError,
} from "../types/errors.js";

describe("Basic Math Functions", () => {
  describe("Range and Sequence Generation", () => {
    test("range should generate correct sequences", () => {
      expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
      expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
      expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
      expect(range(0, 0)).toEqual([]);
      expect(range(5, 5)).toEqual([]);
    });

    test("range should handle edge cases", () => {
      expect(range(1, 2, 0.5)).toEqual([1, 1.5]);
      expect(range(-5, -2)).toEqual([-5, -4, -3]);
      expect(range(10, 5, 1)).toEqual([]); // Invalid range
    });

    test("range should throw for invalid parameters", () => {
      expect(() => range(0, 5, 0)).toThrow(InvalidParameterError);
      expect(() => range(NaN, 5)).toThrow(InvalidParameterError);
      expect(() => range(0, Infinity)).toThrow(InvalidParameterError);
    });

    test("linspace should generate linearly spaced arrays", () => {
      expect(linspace(0, 1, 5)).toEqual([0, 0.25, 0.5, 0.75, 1]);
      expect(linspace(0, 10, 3)).toEqual([0, 5, 10]);
      expect(linspace(5, 5, 1)).toEqual([5]);
    });

    test("linspace should throw for invalid parameters", () => {
      expect(() => linspace(0, 1, 0)).toThrow(InvalidParameterError);
      expect(() => linspace(0, 1, -1)).toThrow(InvalidParameterError);
    });
  });

  describe("Random Number Generation", () => {
    test("randin should generate numbers in range", () => {
      for (let i = 0; i < 100; i++) {
        const val = randin(0, 1);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }

      for (let i = 0; i < 100; i++) {
        const val = randin(-5, 5);
        expect(val).toBeGreaterThanOrEqual(-5);
        expect(val).toBeLessThan(5);
      }
    });

    test("randin should throw for invalid ranges", () => {
      expect(() => randin(5, 5)).toThrow(InvalidParameterError);
      expect(() => randin(10, 5)).toThrow(InvalidParameterError);
      expect(() => randin(NaN, 5)).toThrow(InvalidParameterError);
    });

    test("randint should generate integers in range", () => {
      for (let i = 0; i < 100; i++) {
        const val = randint(1, 6);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(6);
        expect(Number.isInteger(val)).toBe(true);
      }
    });

    test("randint should throw for invalid parameters", () => {
      expect(() => randint(1.5, 6)).toThrow(InvalidParameterError);
      expect(() => randint(6, 1)).toThrow(InvalidParameterError);
    });

    test("randomArray should generate arrays of correct size", () => {
      const arr = randomArray(10);
      expect(arr).toHaveLength(10);
      arr.forEach(val => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      });

      const arr2 = randomArray(5, -1, 1);
      expect(arr2).toHaveLength(5);
      arr2.forEach(val => {
        expect(val).toBeGreaterThanOrEqual(-1);
        expect(val).toBeLessThan(1);
      });
    });
  });

  describe("Power and Root Functions", () => {
    test("root should calculate correct roots", () => {
      expect(root(8, 3)).toBeCloseTo(2);
      expect(root(16, 4)).toBeCloseTo(2);
      expect(root(9, 2)).toBeCloseTo(3);
      expect(root(0, 5)).toBe(0);
      expect(root(1, 100)).toBe(1);
    });

    test("root should handle negative numbers correctly", () => {
      expect(root(-8, 3)).toBeCloseTo(-2);
      expect(() => root(-4, 2)).toThrow(MathematicalError);
      expect(() => root(-16, 4)).toThrow(MathematicalError);
    });

    test("root should throw for invalid parameters", () => {
      expect(() => root(8, 0)).toThrow(MathematicalError);
      expect(() => root(NaN, 2)).toThrow(InvalidParameterError);
    });

    test("power should calculate powers correctly", () => {
      expect(power(2, 3)).toBe(8);
      expect(power(4, 0.5)).toBeCloseTo(2);
      expect(power(10, 0)).toBe(1);
      expect(power(0, 5)).toBe(0);
    });

    test("power should handle edge cases", () => {
      expect(power(-2, 3)).toBe(-8);
      expect(power(-2, 2)).toBe(4);
    });
  });

  describe("Factorial and Combinatorial Functions", () => {
    test("factorial should calculate correct values", () => {
      expect(factorial(0)).toBe(1);
      expect(factorial(1)).toBe(1);
      expect(factorial(5)).toBe(120);
      expect(factorial(10)).toBe(3628800);
    });

    test("factorial should throw for invalid parameters", () => {
      expect(() => factorial(-1)).toThrow(InvalidParameterError);
      expect(() => factorial(1.5)).toThrow(InvalidParameterError);
      expect(() => factorial(171)).toThrow(NumericalOverflowError);
    });

    test("doubleFactorial should calculate correct values", () => {
      expect(doubleFactorial(5)).toBe(15); // 5 * 3 * 1
      expect(doubleFactorial(6)).toBe(48); // 6 * 4 * 2
      expect(doubleFactorial(0)).toBe(1);
      expect(doubleFactorial(1)).toBe(1);
    });

    test("combinations should calculate binomial coefficients", () => {
      expect(combinations(5, 2)).toBe(10);
      expect(combinations(10, 3)).toBe(120);
      expect(combinations(5, 0)).toBe(1);
      expect(combinations(5, 5)).toBe(1);
      expect(combinations(3, 5)).toBe(0); // k > n
    });

    test("permutations should calculate correct values", () => {
      expect(permutations(5, 2)).toBe(20);
      expect(permutations(10, 3)).toBe(720);
      expect(permutations(5, 0)).toBe(1);
      expect(permutations(3, 5)).toBe(0); // k > n
    });
  });

  describe("Fibonacci Functions", () => {
    test("fibonacci should calculate correct values", () => {
      expect(fibonacci(0)).toBe(0);
      expect(fibonacci(1)).toBe(1);
      expect(fibonacci(2)).toBe(1);
      expect(fibonacci(10)).toBe(55);
      expect(fibonacci(20)).toBe(6765);
    });

    test("fibonacci should throw for invalid parameters", () => {
      expect(() => fibonacci(-1)).toThrow(InvalidParameterError);
      expect(() => fibonacci(1.5)).toThrow(InvalidParameterError);
      expect(() => fibonacci(79)).toThrow(NumericalOverflowError);
    });

    test("fibonacciSequence should generate correct sequences", () => {
      expect(fibonacciSequence(8)).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
      expect(fibonacciSequence(1)).toEqual([0]);
      expect(fibonacciSequence(2)).toEqual([0, 1]);
    });
  });

  describe("Activation Functions", () => {
    test("sigmoid should calculate correct values", () => {
      expect(sigmoid(0)).toBeCloseTo(0.5);
      expect(sigmoid(1)).toBeCloseTo(0.7310585786300049);
      expect(sigmoid(-1)).toBeCloseTo(0.2689414213699951);
      expect(sigmoid(500)).toBeCloseTo(1);
      expect(sigmoid(-500)).toBeCloseTo(0);
    });

    test("sigmoidArray should apply sigmoid to arrays", () => {
      const result = sigmoidArray([0, 1, -1]);
      expect(result[0]).toBeCloseTo(0.5);
      expect(result[1]).toBeCloseTo(0.7310585786300049);
      expect(result[2]).toBeCloseTo(0.2689414213699951);
    });

    test("softmax should calculate probability distributions", () => {
      const result = softmax([1, 2, 3]);
      expect(result.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
      expect(result[2]!).toBeGreaterThan(result[1]!);
      expect(result[1]!).toBeGreaterThan(result[0]!);

      const uniform = softmax([0, 0, 0]);
      uniform.forEach(val => expect(val).toBeCloseTo(1/3));
    });

    test("softmax should throw for empty arrays", () => {
      expect(() => softmax([])).toThrow(EmptyArrayError);
    });

    test("relu should apply rectified linear unit", () => {
      expect(relu(5)).toBe(5);
      expect(relu(-3)).toBe(0);
      expect(relu(0)).toBe(0);
    });

    test("reluArray should apply relu to arrays", () => {
      expect(reluArray([1, -2, 3, -4, 0])).toEqual([1, 0, 3, 0, 0]);
    });

    test("leakyRelu should handle negative values", () => {
      expect(leakyRelu(5)).toBe(5);
      expect(leakyRelu(-2)).toBeCloseTo(-0.02);
      expect(leakyRelu(-2, 0.1)).toBeCloseTo(-0.2);
    });

    test("tanh should calculate hyperbolic tangent", () => {
      expect(tanh(0)).toBe(0);
      expect(tanh(1)).toBeCloseTo(0.7615941559557649);
      expect(tanh(-1)).toBeCloseTo(-0.7615941559557649);
    });
  });

  describe("Utility Functions", () => {
    test("clamp should constrain values to range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    test("clamp should throw for invalid ranges", () => {
      expect(() => clamp(5, 10, 0)).toThrow(InvalidParameterError);
    });

    test("lerp should interpolate linearly", () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0.2)).toBe(2);
      expect(lerp(5, 15, 0.8)).toBe(13);
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
    });

    test("mapRange should map values between ranges", () => {
      expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
      expect(mapRange(2, 0, 4, -1, 1)).toBe(0);
      expect(mapRange(0, 0, 10, 100, 200)).toBe(100);
      expect(mapRange(10, 0, 10, 100, 200)).toBe(200);
    });

    test("mapRange should throw for zero-width source range", () => {
      expect(() => mapRange(5, 10, 10, 0, 100)).toThrow(DivisionByZeroError);
    });

    test("approxEqual should compare floating point numbers", () => {
      expect(approxEqual(0.1 + 0.2, 0.3)).toBe(true);
      expect(approxEqual(1, 1.0001, 0.001)).toBe(true);
      expect(approxEqual(1, 1.1, 0.05)).toBe(false);
      expect(approxEqual(1, 1, 0)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    test("should validate all function parameters", () => {
      expect(() => range(NaN, 5)).toThrow(InvalidParameterError);
      expect(() => root(4, NaN)).toThrow(InvalidParameterError);
      expect(() => factorial(Infinity)).toThrow(InvalidParameterError);
      expect(() => sigmoid(NaN)).toThrow(InvalidParameterError);
    });

    test("should throw appropriate mathematical errors", () => {
      expect(() => root(-4, 2)).toThrow(MathematicalError);
      expect(() => root(8, 0)).toThrow(MathematicalError);
    });

    test("should handle numerical overflow", () => {
      expect(() => factorial(171)).toThrow(NumericalOverflowError);
      expect(() => fibonacci(79)).toThrow(NumericalOverflowError);
    });

    test("should handle division by zero", () => {
      expect(() => mapRange(5, 10, 10, 0, 100)).toThrow(DivisionByZeroError);
    });
  });

  describe("Type Safety", () => {
    test("should work with TypeScript strict mode", () => {
      const numbers: number[] = [1, 2, 3, 4, 5];
      const result = softmax(numbers);
      expect(result).toHaveLength(5);
      expect(typeof result[0]).toBe('number');
    });

    test("should maintain type safety with arrays", () => {
      const arr = randomArray(5);
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.every(x => typeof x === 'number')).toBe(true);
    });
  });
});