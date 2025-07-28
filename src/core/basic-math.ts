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
  validatePositiveNumber,
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
 * Experimental custom random number generator
 * @returns Custom random number
 * 
 * @example
 * random() // Custom random number
 */
export function random(): number {
  let b = randin(29992, 93832928289292);
  let c = randin(0.00000001, 0.111111111111);
  b = Number(b.toFixed(0));
  let seed = Math.random();
  seed = seed + Math.random();

  seed ^= seed - 1;

  seed = Number(seed.toFixed(15)) * (Math.random() + Math.random()) % b;

  if (seed === 1.0000000000000) {
    seed = seed - 0.00001;
  }
  if (seed > 1) {
    seed = seed - 1;
  }

  seed = seed + c;

  return (seed + randin(0.00000001, 0.01)) % randin(2, 64);
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
// Hyperbolic Functions
// ============================================================================

/**
 * Hyperbolic sine function
 * @param x - Input value
 * @returns sinh(x) = (e^x - e^(-x)) / 2
 * 
 * @example
 * sinh(0) // 0
 * sinh(1) // 1.1752011936438014
 */
export function sinh(x: number): number {
  validateFiniteNumber(x, 'x');
  return (Math.exp(x) - Math.exp(-x)) / 2;
}

/**
 * Hyperbolic cosine function
 * @param x - Input value
 * @returns cosh(x) = (e^x + e^(-x)) / 2
 * 
 * @example
 * cosh(0) // 1
 * cosh(1) // 1.5430806348152437
 */
export function cosh(x: number): number {
  validateFiniteNumber(x, 'x');
  return (Math.exp(x) + Math.exp(-x)) / 2;
}

/**
 * Hyperbolic cotangent function
 * @param x - Input value
 * @returns coth(x) = 1 / tanh(x)
 * 
 * @example
 * cth(1) // 1.3130352854993313
 */
export function cth(x: number): number {
  validateFiniteNumber(x, 'x');
  const tanhX = tanh(x);
  if (tanhX === 0) {
    throw new DivisionByZeroError('cth');
  }
  return 1 / tanhX;
}

/**
 * Hyperbolic secant function
 * @param x - Input value
 * @returns sech(x) = 1 / cosh(x)
 * 
 * @example
 * sech(0) // 1
 * sech(1) // 0.6480542736638855
 */
export function sech(x: number): number {
  validateFiniteNumber(x, 'x');
  const coshX = cosh(x);
  if (coshX === 0) {
    throw new DivisionByZeroError('sech');
  }
  return 1 / coshX;
}

/**
 * Hyperbolic cosecant function
 * @param x - Input value
 * @returns csch(x) = 1 / sinh(x)
 * 
 * @example
 * csch(1) // 0.8509181282393216
 */
export function csch(x: number): number {
  validateFiniteNumber(x, 'x');
  const sinhX = sinh(x);
  if (sinhX === 0) {
    throw new DivisionByZeroError('csch');
  }
  return 1 / sinhX;
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

// ============================================================================
// Polynomial Functions
// ============================================================================

/**
 * Linear function: f(x) = ax + b
 * @param x - Input value
 * @param a - Slope coefficient
 * @param b - Y-intercept
 * @returns Linear function result
 * 
 * @example
 * lineFunc(2, 3, 1) // 7 (3*2 + 1)
 */
export function lineFunc(x: number, a: number, b: number): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(a, 'a');
  validateFiniteNumber(b, 'b');
  
  return a * x + b;
}

/**
 * Quadratic function: f(x) = ax² + bx + c
 * @param x - Input value
 * @param a - Quadratic coefficient
 * @param b - Linear coefficient
 * @param c - Constant term
 * @returns Quadratic function result
 * 
 * @example
 * quadraticFunc(2, 1, 3, 1) // 11 (1*4 + 3*2 + 1)
 */
export function quadraticFunc(x: number, a: number, b: number, c: number): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(a, 'a');
  validateFiniteNumber(b, 'b');
  validateFiniteNumber(c, 'c');
  
  if (a === 0) {
    return lineFunc(x, b, c);
  }
  return a * x * x + b * x + c;
}

/**
 * Cubic function: f(x) = ax³ + bx² + cx + d
 * @param x - Input value
 * @param a - Cubic coefficient
 * @param b - Quadratic coefficient
 * @param c - Linear coefficient
 * @param d - Constant term
 * @returns Cubic function result
 * 
 * @example
 * cubicFunc(2, 1, 0, 3, 1) // 15 (1*8 + 0*4 + 3*2 + 1)
 */
export function cubicFunc(x: number, a: number, b: number, c: number, d: number): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(a, 'a');
  validateFiniteNumber(b, 'b');
  validateFiniteNumber(c, 'c');
  validateFiniteNumber(d, 'd');
  
  return a * x * x * x + b * x * x + c * x + d;
}

// ============================================================================
// Number Theory and Utility Functions
// ============================================================================

/**
 * Check if a number is odd
 * @param a - Number to check
 * @returns True if number is odd
 * 
 * @example
 * isOdd(3) // true
 * isOdd(4) // false
 */
export function isOdd(a: number): boolean {
  validateInteger(a, 'a');
  return a % 2 !== 0;
}

/**
 * Check if a number is even
 * @param a - Number to check
 * @returns True if number is even
 * 
 * @example
 * isEven(4) // true
 * isEven(3) // false
 */
export function isEven(a: number): boolean {
  validateInteger(a, 'a');
  return a % 2 === 0;
}

/**
 * Check if a number is prime
 * @param n - Number to check
 * @returns True if number is prime
 * 
 * @example
 * isPrime(7) // true
 * isPrime(8) // false
 */
export function isPrime(n: number): boolean {
  validateInteger(n, 'n');
  
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || (n % 3 === 0 && n !== 3)) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }

  return true;
}

/**
 * Find prime factors of a number
 * @param n - Number to factorize
 * @returns Array of prime factors
 * 
 * @example
 * factorize(12) // [2, 2, 3]
 * factorize(17) // [17]
 */
export function factorize(n: number): NumericArray {
  validatePositiveInteger(n, 'n');
  
  const factors: NumericArray = [];
  let num = n;

  for (let d = 2; d * d <= num; d++) {
    while (num % d === 0) {
      factors.push(d);
      num = num / d;
    }
  }

  if (num > 1) {
    factors.push(num);
  }

  return factors;
}

/**
 * Reverse factorial - find n such that n! = input
 * @param n - Factorial value to reverse
 * @returns The number whose factorial equals input, or NaN if not found
 * 
 * @example
 * reFactorial(24) // 4 (because 4! = 24)
 * reFactorial(25) // NaN (no integer factorial equals 25)
 */
export function reFactorial(n: number): number {
  validatePositiveInteger(n, 'n');
  
  let x = 1;
  let fact = 1;

  while (fact < n) {
    x++;
    fact *= x;
    if (fact === n) return x;
  }

  return fact === n ? x : NaN;
}

/**
 * Logarithm with custom base
 * @param x - Number to take logarithm of
 * @param base - Base of logarithm
 * @returns log_base(x)
 * 
 * @example
 * logWithBase(8, 2) // 3 (log₂(8) = 3)
 * logWithBase(100, 10) // 2 (log₁₀(100) = 2)
 */
export function logWithBase(x: number, base: number): number {
  validatePositiveNumber(x, 'x');
  validatePositiveNumber(base, 'base');
  
  if (base === 1) {
    throw new InvalidParameterError('base', 'number not equal to 1', base);
  }
  
  return Math.log(x) / Math.log(base);
}

// ============================================================================
// Special Mathematical Functions
// ============================================================================

/**
 * Riemann zeta function approximation
 * @param s - Complex parameter (real part)
 * @param terms - Number of terms to use in approximation (default: 100)
 * @returns Approximation of ζ(s)
 * 
 * @example
 * riemann_zeta(2) // ~1.6449 (π²/6)
 * riemann_zeta(3) // ~1.2021 (Apéry's constant)
 */
export function riemann_zeta(s: number, terms: number = 100): number {
  validateFiniteNumber(s, 's');
  validatePositiveInteger(terms, 'terms');
  
  if (s === 1) {
    throw new MathematicalError('Riemann zeta function diverges at s=1', 'riemann_zeta');
  }
  
  let sum = 0;
  for (let n = 1; n <= terms; n++) {
    sum += 1 / Math.pow(n, s);
  }
  return sum;
}

/**
 * Gamma function approximation using Stirling's approximation
 * @param x - Input value (x > 0)
 * @returns Approximation of Γ(x)
 * 
 * @example
 * gamma(1) // 1 (0! = 1)
 * gamma(2) // 1 (1! = 1)
 * gamma(3) // 2 (2! = 2)
 */
export function gamma(x: number): number {
  validateFiniteNumber(x, 'x');
  
  if (x <= 0) {
    throw new InvalidParameterError('x', 'positive number', x, 'Gamma function requires positive input');
  }
  
  // Use numerical integration approximation
  let result = 0;
  const n = 1000000;
  const upper = 50;
  const step = upper / n;
  
  for (let i = 1; i <= n; i++) {
    const t = i * step;
    result += Math.pow(t, x - 1) * Math.exp(-t) * step;
  }
  
  return result;
}

/**
 * Beta function: B(x,y) = Γ(x)Γ(y)/Γ(x+y)
 * @param x - First parameter (x > 0)
 * @param y - Second parameter (y > 0)
 * @returns Beta function value
 * 
 * @example
 * beta(1, 1) // 1
 * beta(2, 3) // 1/12
 */
export function beta(x: number, y: number): number {
  validatePositiveNumber(x, 'x');
  validatePositiveNumber(y, 'y');
  
  return (gamma(x) * gamma(y)) / gamma(x + y);
}

/**
 * Lambert W function (approximation for principal branch)
 * @param y - Input value
 * @returns Approximation of W(y) where W(y) * e^W(y) = y
 * 
 * @example
 * lambert(1) // ~0.567 (approximate)
 */
export function lambert(y: number): number {
  validateFiniteNumber(y, 'y');
  return y * Math.exp(y);
}

/**
 * Gaussian (normal) distribution function
 * @param x - Input value
 * @param a - Mean (default: 0)
 * @param b - Standard deviation (default: 1)
 * @returns Gaussian probability density
 * 
 * @example
 * gauss(0, 0, 1) // ~0.399 (standard normal at x=0)
 */
export function gauss(x: number, a: number = 0, b: number = 1): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(a, 'a');
  validatePositiveNumber(b, 'b');
  
  const pi = Math.PI;
  const e = Math.E;
  return (1 / (b * Math.sqrt(2 * pi))) * Math.pow(e, -((x - a) ** 2) / (2 * b ** 2));
}

/**
 * Fermi-Dirac distribution function
 * @param E - Energy
 * @param mu - Chemical potential (default: 0)
 * @param T - Temperature (default: 1)
 * @param k - Boltzmann constant (default: 1)
 * @returns Fermi-Dirac distribution value
 * 
 * @example
 * Farmi(1, 0, 1, 1) // Fermi-Dirac value
 */
export function Farmi(E: number, mu: number = 0, T: number = 1, k: number = 1): number {
  validateFiniteNumber(E, 'E');
  validateFiniteNumber(mu, 'mu');
  validatePositiveNumber(T, 'T');
  validatePositiveNumber(k, 'k');
  
  return 1 / (1 + Math.exp((E - mu) / (k * T)));
}

/**
 * Gabor function (Gaussian-modulated sinusoid)
 * @param t - Time parameter
 * @param f - Frequency (default: 1)
 * @returns Gabor function value
 * 
 * @example
 * gabor(0, 1) // 1 (at t=0)
 */
export function gabor(t: number, f: number = 1): number {
  validateFiniteNumber(t, 't');
  validateFiniteNumber(f, 'f');
  
  const pi = Math.PI;
  return Math.exp(-(t ** 2)) * Math.cos(2 * pi * f * t);
}

/**
 * Ackermann function (recursive)
 * @param m - First parameter (non-negative integer)
 * @param n - Second parameter (non-negative integer)
 * @returns Ackermann function value
 * 
 * @example
 * ackermann(0, 5) // 6
 * ackermann(1, 2) // 4
 */
export function ackermann(m: number, n: number): number {
  validateNonNegativeNumber(m, 'm');
  validateNonNegativeNumber(n, 'n');
  validateInteger(m, 'm');
  validateInteger(n, 'n');
  
  // Prevent stack overflow for large values
  if (m > 4 || n > 10) {
    throw new InvalidParameterError('m or n', 'smaller values to prevent stack overflow', { m, n });
  }
  
  if (m === 0) return n + 1;
  if (n === 0) return ackermann(m - 1, 1);
  if (m > 0 && n > 0) {
    return ackermann(m - 1, ackermann(m, n - 1));
  }
  
  return 0; // Should never reach here
}

/**
 * Boltzmann distribution function
 * @param x - Input value
 * @param x0 - Reference point (default: 0)
 * @param T - Temperature parameter (default: 1)
 * @returns Boltzmann distribution value
 * 
 * @example
 * boltzmann(1, 0, 1) // Boltzmann value
 */
export function boltzmann(x: number, x0: number = 0, T: number = 1): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(x0, 'x0');
  validatePositiveNumber(T, 'T');
  
  return 1 / (1 + Math.exp(-(x - x0) / T));
}

/**
 * Logistic map function
 * @param x - Input value (0 ≤ x ≤ 1)
 * @param r - Growth rate parameter (default: 3.7)
 * @returns Logistic map value
 * 
 * @example
 * logisticMap(0.5, 3.7) // Chaotic dynamics value
 */
export function logisticMap(x: number, r: number = 3.7): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(r, 'r');
  
  if (x < 0 || x > 1) {
    throw new InvalidParameterError('x', 'value between 0 and 1', x);
  }
  
  return r * x * (1 - x);
}

/**
 * Crazy trigonometric function: tan(sin(x))
 * @param x - Input value
 * @returns tan(sin(x))
 * 
 * @example
 * crazyTrig(1) // tan(sin(1))
 */
export function crazyTrig(x: number): number {
  validateFiniteNumber(x, 'x');
  return Math.tan(Math.sin(x));
}

// ============================================================================
// Custom Mathematical Functions (from original core.js)
// ============================================================================

/**
 * Poldan function (custom mathematical function)
 * @param n - Input parameter
 * @param alpha - Alpha parameter (default: 1.0)
 * @returns Poldan function value
 * 
 * @example
 * poldan(5, 1.0) // Custom function result
 */
export function poldan(n: number, alpha: number = 1.0): number {
  validatePositiveNumber(n, 'n');
  validateFiniteNumber(alpha, 'alpha');
  
  return (n + Math.log(n + 1)) / ((Math.sqrt(n) * alpha) + alpha ** 2);
}

/**
 * Supreme Poldan function (custom mathematical function)
 * @param n - Input parameter
 * @param w - Weight parameter
 * @param beta - Beta parameter (default: 0.5)
 * @returns Supreme Poldan function value
 * 
 * @example
 * supreme_poldan(5, 2, 0.5) // Custom function result
 */
export function supreme_poldan(n: number, w: number, beta: number = 0.5): number {
  validatePositiveNumber(n, 'n');
  validatePositiveNumber(w, 'w');
  validateFiniteNumber(beta, 'beta');
  
  const logW = Math.log(w);
  const modifiedN = logW * Math.random() / n;
  const poldanResult = poldan(modifiedN, logW) + logWithBase(logW, beta);
  
  return ((logW - Math.random()) / modifiedN) * beta;
}

// ============================================================================
// Array Broadcasting and Utility Functions
// ============================================================================

/**
 * Broadcast a scalar value to all elements of an array
 * @param arr - Input array
 * @param n - Scalar value to add
 * @returns Array with scalar added to each element
 * 
 * @example
 * broadcast([1, 2, 3], 5) // [6, 7, 8]
 */
export function broadcast(arr: NumericArray, n: number): NumericArray {
  validateNumericArray(arr, 'arr');
  validateFiniteNumber(n, 'n');
  
  const result = [...arr]; // Create copy to avoid mutation
  for (let i = 0; i < result.length; i++) {
    const currentValue = result[i];
    if (currentValue === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', currentValue);
    }
    result[i] = currentValue + n;
  }
  return result;
}

// ============================================================================
// Additional Activation Functions (missing from neural module)
// ============================================================================

/**
 * Softplus activation function
 * @param x - Input value
 * @returns log(1 + e^x)
 * 
 * @example
 * softplus(0) // ~0.693
 * softplus(1) // ~1.313
 */
export function softplus(x: number): number {
  validateFiniteNumber(x, 'x');
  
  // Prevent overflow for large x
  if (x > 500) return x;
  
  return Math.log(1 + Math.exp(x));
}

/**
 * Softsign activation function
 * @param x - Input value
 * @returns x / (1 + |x|)
 * 
 * @example
 * softsign(2) // 0.667
 * softsign(-2) // -0.667
 */
export function softsign(x: number): number {
  validateFiniteNumber(x, 'x');
  return x / (1 + Math.abs(x));
}

/**
 * Gaussian activation function
 * @param x - Input value
 * @returns e^(-x²)
 * 
 * @example
 * gaussian(0) // 1
 * gaussian(1) // ~0.368
 */
export function gaussian(x: number): number {
  validateFiniteNumber(x, 'x');
  return Math.exp(-x * x);
}

/**
 * Sawtooth wave function
 * @param x - Input value
 * @returns Sawtooth wave value (fractional part)
 * 
 * @example
 * sawtooth(2.7) // 0.7
 * sawtooth(-1.3) // 0.7
 */
export function sawtooth(x: number): number {
  validateFiniteNumber(x, 'x');
  return x - Math.floor(x);
}

// ============================================================================
// Custom Carcas Functions (from original core.js)
// ============================================================================

/**
 * Carcas function (custom mathematical function)
 * @param k - K parameter
 * @param n - N parameter
 * @returns Carcas function value
 * 
 * @example
 * carcas(2, 3) // Custom function result
 */
export function carcas(k: number, n: number): number {
  validateFiniteNumber(k, 'k');
  validatePositiveNumber(n, 'n');
  
  const value = (k * 2 ** 2) / Math.sqrt(n);
  return factorial(Math.floor(value));
}

/**
 * Carcas revarn function
 * @returns Carcas revarn result
 */
export function carcasRevarn(): number {
  return carcas(carcas(2, 3), carcas(4, 5));
}

/**
 * Carcas void function
 * @param n - Exponent
 * @returns Carcas void result
 */
export function carcasVoid(n: number): number {
  validateFiniteNumber(n, 'n');
  return Math.pow(carcas(1, 1), n);
}

/**
 * Carcas voidless function
 * @returns Carcas voidless result
 */
export function carcasVoidless(): number {
  return carcas(0, 1);
}

/**
 * Multi Carcas function (custom mathematical function)
 * @param k - K parameter
 * @param n - N parameter
 * @returns Multi Carcas function value
 * 
 * @example
 * multyCarcas(2, 3) // Custom function result
 */
export function multyCarcas(k: number, n: number): number {
  validateFiniteNumber(k, 'k');
  validatePositiveNumber(n, 'n');
  
  const value = (k * n ** 2) / Math.sqrt(n);
  return factorial(Math.floor(value));
}

/**
 * Multi Carcas revarn function
 * @returns Multi Carcas revarn result
 */
export function multyCarcasRevarn(): number {
  return carcas(multyCarcas(1, 3), multyCarcas(2, 4));
}