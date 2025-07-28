/**
 * Basic mathematical functions for Num.js TypeScript migration
 * Provides type-safe implementations of fundamental mathematical operations
 */

import type { NumericArray } from '../types/common.js';
import { 
  InvalidParameterError, 
  MathematicalError,
  NumericalOverflowError,
  DivisionByZeroError 
} from '../types/errors.js';
import { 
  validateFiniteNumber, 
  validatePositiveInteger,
  validateInteger,
  validateNumericArray,
  validateNonNegativeNumber
} from '../types/validation.js';

// ============================================================================
// Range and Sequence Generation Functions
// ============================================================================

/**
 * Generate a range of numbers from start to end (exclusive) with optional step
 * @param start - Starting value (inclusive)
 * @param end - Ending value (exclusive)
 * @param step - Step size (default: 1)
 * @returns Array of numbers in the specified range
 * 
 * @example
 * range(0, 5) // [0, 1, 2, 3, 4]
 * range(0, 10, 2) // [0, 2, 4, 6, 8]
 * range(5, 0, -1) // [5, 4, 3, 2, 1]
 */
export function range(start: number, end: number, step: number = 1): NumericArray {
  validateFiniteNumber(start, 'start');
  validateFiniteNumber(end, 'end');
  validateFiniteNumber(step, 'step');
  
  if (step === 0) {
    throw new InvalidParameterError('step', 'non-zero number', step, 'Step cannot be zero');
  }
  
  // Return empty array for invalid ranges
  if (step > 0 && start >= end) return [];
  if (step < 0 && start <= end) return [];
  
  const result: NumericArray = [];
  
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }
  
  return result;
}

/**
 * Generate a linearly spaced array of numbers
 * @param start - Starting value
 * @param end - Ending value
 * @param num - Number of samples to generate (default: 50)
 * @returns Array of linearly spaced numbers
 * 
 * @example
 * linspace(0, 1, 5) // [0, 0.25, 0.5, 0.75, 1]
 */
export function linspace(start: number, end: number, num: number = 50): NumericArray {
  validateFiniteNumber(start, 'start');
  validateFiniteNumber(end, 'end');
  validatePositiveInteger(num, 'num');
  
  if (num === 1) {
    return [start];
  }
  
  const step = (end - start) / (num - 1);
  const result: NumericArray = [];
  
  for (let i = 0; i < num; i++) {
    result.push(start + i * step);
  }
  
  return result;
}

// ============================================================================
// Random Number Generation Functions
// ============================================================================

/**
 * Generate a random number between min and max (exclusive)
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random number in the specified range
 * 
 * @example
 * randin(0, 1) // Random number between 0 and 1
 * randin(-5, 5) // Random number between -5 and 5
 */
export function randin(min: number, max: number): number {
  validateFiniteNumber(min, 'min');
  validateFiniteNumber(max, 'max');
  
  if (min >= max) {
    throw new InvalidParameterError('min', 'less than max', min, `min (${min}) must be less than max (${max})`);
  }
  
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param min - Minimum integer value (inclusive)
 * @param max - Maximum integer value (inclusive)
 * @returns Random integer in the specified range
 * 
 * @example
 * randint(1, 6) // Random integer from 1 to 6 (like a dice roll)
 * randint(0, 100) // Random integer from 0 to 100
 */
export function randint(min: number, max: number): number {
  validateInteger(min, 'min');
  validateInteger(max, 'max');
  
  if (min > max) {
    throw new InvalidParameterError('min', 'less than or equal to max', min, `min (${min}) must be <= max (${max})`);
  }
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate an array of random numbers
 * @param size - Number of random numbers to generate
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (default: 1)
 * @returns Array of random numbers
 * 
 * @example
 * randomArray(5) // [0.123, 0.456, 0.789, 0.234, 0.567]
 * randomArray(3, -1, 1) // [-0.234, 0.567, -0.890]
 */
export function randomArray(size: number, min: number = 0, max: number = 1): NumericArray {
  validatePositiveInteger(size, 'size');
  validateFiniteNumber(min, 'min');
  validateFiniteNumber(max, 'max');
  
  if (min >= max) {
    throw new InvalidParameterError('min', 'less than max', min);
  }
  
  const result: NumericArray = [];
  for (let i = 0; i < size; i++) {
    result.push(randin(min, max));
  }
  
  return result;
}

// ============================================================================
// Power and Root Functions
// ============================================================================

/**
 * Calculate the nth root of a number
 * @param x - The number to find the root of
 * @param n - The root degree
 * @returns The nth root of x
 * 
 * @example
 * root(8, 3) // 2 (cube root of 8)
 * root(16, 4) // 2 (fourth root of 16)
 * root(9, 2) // 3 (square root of 9)
 */
export function root(x: number, n: number): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(n, 'n');
  
  if (n === 0) {
    throw new MathematicalError('Cannot compute root with n=0', 'root');
  }
  
  // Handle negative numbers with even roots
  if (x < 0 && n % 2 === 0) {
    throw new MathematicalError(
      `Cannot compute even root (${n}) of negative number (${x})`, 
      'root'
    );
  }
  
  // Handle special cases
  if (x === 0) return 0;
  if (n === 1) return x;
  if (n === 2) return Math.sqrt(Math.abs(x)) * (x < 0 ? -1 : 1);
  
  // For negative x with odd n, compute root of absolute value and apply sign
  if (x < 0) {
    return -Math.pow(-x, 1 / n);
  }
  
  return Math.pow(x, 1 / n);
}

/**
 * Calculate x raised to the power of y
 * @param x - Base number
 * @param y - Exponent
 * @returns x^y
 * 
 * @example
 * power(2, 3) // 8
 * power(4, 0.5) // 2 (square root of 4)
 */
export function power(x: number, y: number): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(y, 'y');
  
  const result = Math.pow(x, y);
  
  if (!Number.isFinite(result)) {
    throw new NumericalOverflowError('power', result);
  }
  
  return result;
}

// ============================================================================
// Factorial and Combinatorial Functions
// ============================================================================

/**
 * Calculate the factorial of a non-negative integer
 * @param n - Non-negative integer
 * @returns n! (n factorial)
 * 
 * @example
 * factorial(5) // 120
 * factorial(0) // 1
 * factorial(3) // 6
 */
export function factorial(n: number): number {
  validateInteger(n, 'n');
  validateNonNegativeNumber(n, 'n');
  
  // Prevent overflow for large numbers
  if (n > 170) {
    throw new NumericalOverflowError(
      'factorial', 
      Infinity
    );
  }
  
  if (n === 0 || n === 1) {
    return 1;
  }
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  
  return result;
}

/**
 * Calculate the double factorial of a number (n!!)
 * @param n - Non-negative integer
 * @returns n!! (double factorial)
 * 
 * @example
 * doubleFactorial(5) // 15 (5 * 3 * 1)
 * doubleFactorial(6) // 48 (6 * 4 * 2)
 */
export function doubleFactorial(n: number): number {
  validateInteger(n, 'n');
  validateNonNegativeNumber(n, 'n');
  
  if (n <= 1) return 1;
  
  let result = 1;
  for (let i = n; i > 0; i -= 2) {
    result *= i;
  }
  
  return result;
}

/**
 * Calculate binomial coefficient (n choose k)
 * @param n - Total number of items
 * @param k - Number of items to choose
 * @returns C(n,k) = n! / (k! * (n-k)!)
 * 
 * @example
 * combinations(5, 2) // 10
 * combinations(10, 3) // 120
 */
export function combinations(n: number, k: number): number {
  validateInteger(n, 'n');
  validateInteger(k, 'k');
  validateNonNegativeNumber(n, 'n');
  validateNonNegativeNumber(k, 'k');
  
  if (k > n) {
    return 0;
  }
  
  if (k === 0 || k === n) {
    return 1;
  }
  
  // Use the more efficient formula to avoid large factorials
  // C(n,k) = n * (n-1) * ... * (n-k+1) / (k * (k-1) * ... * 1)
  k = Math.min(k, n - k); // Take advantage of symmetry
  
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  
  return Math.round(result); // Round to handle floating point precision
}

/**
 * Calculate permutations (n P k)
 * @param n - Total number of items
 * @param k - Number of items to arrange
 * @returns P(n,k) = n! / (n-k)!
 * 
 * @example
 * permutations(5, 2) // 20
 * permutations(10, 3) // 720
 */
export function permutations(n: number, k: number): number {
  validateInteger(n, 'n');
  validateInteger(k, 'k');
  validateNonNegativeNumber(n, 'n');
  validateNonNegativeNumber(k, 'k');
  
  if (k > n) {
    return 0;
  }
  
  if (k === 0) {
    return 1;
  }
  
  let result = 1;
  for (let i = n; i > n - k; i--) {
    result *= i;
  }
  
  return result;
}

// ============================================================================
// Fibonacci and Sequence Functions
// ============================================================================

/**
 * Calculate the nth Fibonacci number
 * @param n - Position in Fibonacci sequence (0-based)
 * @returns The nth Fibonacci number
 * 
 * @example
 * fibonacci(0) // 0
 * fibonacci(1) // 1
 * fibonacci(10) // 55
 */
export function fibonacci(n: number): number {
  validateInteger(n, 'n');
  validateNonNegativeNumber(n, 'n');
  
  if (n > 78) {
    throw new NumericalOverflowError(
      'fibonacci',
      Infinity
    );
  }
  
  if (n <= 1) return n;
  
  // Use iterative approach for better performance and to avoid stack overflow
  let a = 0;
  let b = 1;
  
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  
  return b;
}

/**
 * Generate Fibonacci sequence up to n terms
 * @param n - Number of terms to generate
 * @returns Array containing the first n Fibonacci numbers
 * 
 * @example
 * fibonacciSequence(8) // [0, 1, 1, 2, 3, 5, 8, 13]
 */
export function fibonacciSequence(n: number): NumericArray {
  validatePositiveInteger(n, 'n');
  
  if (n > 78) {
    throw new NumericalOverflowError('fibonacciSequence', Infinity);
  }
  
  const result: NumericArray = [];
  
  for (let i = 0; i < n; i++) {
    result.push(fibonacci(i));
  }
  
  return result;
}

// ============================================================================
// Activation and Neural Network Functions
// ============================================================================

/**
 * Sigmoid activation function
 * @param x - Input value
 * @returns Sigmoid of x: 1 / (1 + e^(-x))
 * 
 * @example
 * sigmoid(0) // 0.5
 * sigmoid(1) // 0.7310585786300049
 * sigmoid(-1) // 0.2689414213699951
 */
export function sigmoid(x: number): number {
  validateFiniteNumber(x, 'x');
  
  // Prevent overflow for very large negative values
  if (x < -500) return 0;
  if (x > 500) return 1;
  
  return 1 / (1 + Math.exp(-x));
}

/**
 * Apply sigmoid function to an array of numbers
 * @param arr - Array of input values
 * @returns Array of sigmoid values
 * 
 * @example
 * sigmoidArray([0, 1, -1]) // [0.5, 0.731, 0.269]
 */
export function sigmoidArray(arr: NumericArray): NumericArray {
  validateNumericArray(arr, 'arr');
  
  return arr.map(x => sigmoid(x));
}

/**
 * Softmax activation function
 * @param arr - Array of input values
 * @returns Array of softmax probabilities (sum = 1)
 * 
 * @example
 * softmax([1, 2, 3]) // [0.090, 0.245, 0.665]
 * softmax([0, 0, 0]) // [0.333, 0.333, 0.333]
 */
export function softmax(arr: NumericArray): NumericArray {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new InvalidParameterError('arr', 'non-empty array', arr);
  }
  
  // Subtract max for numerical stability
  const max = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  
  if (sum === 0) {
    throw new DivisionByZeroError('softmax');
  }
  
  return exps.map(e => e / sum);
}

/**
 * ReLU (Rectified Linear Unit) activation function
 * @param x - Input value
 * @returns max(0, x)
 * 
 * @example
 * relu(5) // 5
 * relu(-3) // 0
 * relu(0) // 0
 */
export function relu(x: number): number {
  validateFiniteNumber(x, 'x');
  return Math.max(0, x);
}

/**
 * Apply ReLU function to an array of numbers
 * @param arr - Array of input values
 * @returns Array of ReLU values
 * 
 * @example
 * reluArray([1, -2, 3, -4, 0]) // [1, 0, 3, 0, 0]
 */
export function reluArray(arr: NumericArray): NumericArray {
  validateNumericArray(arr, 'arr');
  
  return arr.map(x => relu(x));
}

/**
 * Leaky ReLU activation function
 * @param x - Input value
 * @param alpha - Slope for negative values (default: 0.01)
 * @returns x if x > 0, else alpha * x
 * 
 * @example
 * leakyRelu(5) // 5
 * leakyRelu(-2) // -0.02
 * leakyRelu(-2, 0.1) // -0.2
 */
export function leakyRelu(x: number, alpha: number = 0.01): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(alpha, 'alpha');
  
  return x > 0 ? x : alpha * x;
}

/**
 * Hyperbolic tangent activation function
 * @param x - Input value
 * @returns tanh(x)
 * 
 * @example
 * tanh(0) // 0
 * tanh(1) // 0.7615941559557649
 * tanh(-1) // -0.7615941559557649
 */
export function tanh(x: number): number {
  validateFiniteNumber(x, 'x');
  return Math.tanh(x);
}

// ============================================================================
// Utility and Helper Functions
// ============================================================================

/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 * 
 * @example
 * clamp(5, 0, 10) // 5
 * clamp(-5, 0, 10) // 0
 * clamp(15, 0, 10) // 10
 */
export function clamp(value: number, min: number, max: number): number {
  validateFiniteNumber(value, 'value');
  validateFiniteNumber(min, 'min');
  validateFiniteNumber(max, 'max');
  
  if (min > max) {
    throw new InvalidParameterError('min', 'less than or equal to max', min);
  }
  
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 * 
 * @example
 * lerp(0, 10, 0.5) // 5
 * lerp(0, 10, 0.2) // 2
 * lerp(5, 15, 0.8) // 13
 */
export function lerp(a: number, b: number, t: number): number {
  validateFiniteNumber(a, 'a');
  validateFiniteNumber(b, 'b');
  validateFiniteNumber(t, 't');
  
  return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 * @param value - Value to map
 * @param fromMin - Source range minimum
 * @param fromMax - Source range maximum
 * @param toMin - Target range minimum
 * @param toMax - Target range maximum
 * @returns Mapped value
 * 
 * @example
 * mapRange(5, 0, 10, 0, 100) // 50
 * mapRange(2, 0, 4, -1, 1) // 0
 */
export function mapRange(
  value: number, 
  fromMin: number, 
  fromMax: number, 
  toMin: number, 
  toMax: number
): number {
  validateFiniteNumber(value, 'value');
  validateFiniteNumber(fromMin, 'fromMin');
  validateFiniteNumber(fromMax, 'fromMax');
  validateFiniteNumber(toMin, 'toMin');
  validateFiniteNumber(toMax, 'toMax');
  
  if (fromMin === fromMax) {
    throw new DivisionByZeroError('mapRange');
  }
  
  const normalized = (value - fromMin) / (fromMax - fromMin);
  return toMin + normalized * (toMax - toMin);
}

/**
 * Check if a number is approximately equal to another within a tolerance
 * @param a - First number
 * @param b - Second number
 * @param tolerance - Tolerance for comparison (default: Number.EPSILON)
 * @returns True if numbers are approximately equal
 * 
 * @example
 * approxEqual(0.1 + 0.2, 0.3) // true
 * approxEqual(1, 1.0001, 0.001) // true
 * approxEqual(1, 1.1, 0.05) // false
 */
export function approxEqual(a: number, b: number, tolerance: number = Number.EPSILON): boolean {
  validateFiniteNumber(a, 'a');
  validateFiniteNumber(b, 'b');
  validateNonNegativeNumber(tolerance, 'tolerance');
  
  return Math.abs(a - b) <= tolerance;
}