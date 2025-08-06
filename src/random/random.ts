/**
 * Random number generation functions for Num.js
 * Provides comprehensive random number generation with support for various distributions
 */

import type { NumericArray, Shape } from '../types/common.js';
import { NDArray } from '../ndarray/ndarray.js';
import { zeros } from '../ndarray/factory.js';
import { 
  InvalidParameterError
} from '../types/errors.js';
import { 
  validateFiniteNumber, 
  validatePositiveInteger,
  validatePositiveNumber,
  validateInteger
} from '../types/validation.js';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert flat index to multi-dimensional indices
 * @param flatIndex - Flat index
 * @param shape - Shape of the array
 * @returns Multi-dimensional indices
 */
function flatIndexToIndices(flatIndex: number, shape: Shape): number[] {
  const indices: number[] = [];
  let remaining = flatIndex;
  
  for (let i = shape.length - 1; i >= 0; i--) {
    const dim = shape[i]!;
    indices[i] = remaining % dim;
    remaining = Math.floor(remaining / dim);
  }
  
  return indices;
}

// ============================================================================
// Basic Random Number Generation
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
// NDArray Random Generation
// ============================================================================

/**
 * Generate an NDArray of random numbers from uniform distribution
 * @param shape - Shape of the output array
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (default: 1)
 * @returns NDArray of random numbers
 * 
 * @example
 * uniform([2, 3]) // 2x3 array of random numbers between 0 and 1
 * uniform([3], -1, 1) // 1D array of 3 random numbers between -1 and 1
 */
export function uniform(shape: Shape, min: number = 0, max: number = 1): NDArray {
  validateFiniteNumber(min, 'min');
  validateFiniteNumber(max, 'max');
  
  if (min >= max) {
    throw new InvalidParameterError('min', 'less than max', min);
  }
  
  const result = zeros(shape);
  
  // Fill the array using flat indexing
  const totalSize = shape.reduce((acc, dim) => acc * dim, 1);
  for (let i = 0; i < totalSize; i++) {
    const indices = flatIndexToIndices(i, shape);
    result.set(...indices, randin(min, max));
  }
  
  return result;
}

/**
 * Generate an NDArray of random integers
 * @param shape - Shape of the output array
 * @param min - Minimum integer value (inclusive)
 * @param max - Maximum integer value (inclusive)
 * @returns NDArray of random integers
 * 
 * @example
 * randintArray([2, 3], 0, 10) // 2x3 array of random integers between 0 and 10
 */
export function randintArray(shape: Shape, min: number, max: number): NDArray {
  validateInteger(min, 'min');
  validateInteger(max, 'max');
  
  if (min > max) {
    throw new InvalidParameterError('min', 'less than or equal to max', min);
  }
  
  const result = zeros(shape);
  const totalSize = shape.reduce((acc, dim) => acc * dim, 1);
  
  for (let i = 0; i < totalSize; i++) {
    const indices = flatIndexToIndices(i, shape);
    result.set(...indices, randint(min, max));
  }
  
  return result;
}

// ============================================================================
// Statistical Distributions
// ============================================================================

/**
 * Generate random numbers from normal (Gaussian) distribution
 * @param shape - Shape of the output array
 * @param mean - Mean of the distribution (default: 0)
 * @param std - Standard deviation (default: 1)
 * @returns NDArray of normally distributed random numbers
 * 
 * @example
 * normal([100]) // 100 samples from standard normal distribution
 * normal([2, 3], 5, 2) // 2x3 array from normal distribution with mean=5, std=2
 */
export function normal(shape: Shape, mean: number = 0, std: number = 1): NDArray {
  validateFiniteNumber(mean, 'mean');
  validatePositiveNumber(std, 'std');
  
  const result = zeros(shape);
  const totalSize = shape.reduce((acc, dim) => acc * dim, 1);
  
  // Box-Muller transform for generating normal distribution
  for (let i = 0; i < totalSize; i += 2) {
    const u1 = Math.random();
    const u2 = Math.random();
    
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    
    const indices0 = flatIndexToIndices(i, shape);
    result.set(...indices0, z0 * std + mean);
    
    if (i + 1 < totalSize) {
      const indices1 = flatIndexToIndices(i + 1, shape);
      result.set(...indices1, z1 * std + mean);
    }
  }
  
  return result;
}

/**
 * Generate random numbers from exponential distribution
 * @param shape - Shape of the output array
 * @param scale - Scale parameter (1/rate) (default: 1)
 * @returns NDArray of exponentially distributed random numbers
 * 
 * @example
 * exponential([100]) // 100 samples from exponential distribution
 * exponential([2, 3], 2) // 2x3 array from exponential distribution with scale=2
 */
export function exponential(shape: Shape, scale: number = 1): NDArray {
  validatePositiveNumber(scale, 'scale');
  
  const result = zeros(shape);
  const totalSize = shape.reduce((acc, dim) => acc * dim, 1);
  
  for (let i = 0; i < totalSize; i++) {
    const u = Math.random();
    const indices = flatIndexToIndices(i, shape);
    result.set(...indices, -scale * Math.log(1 - u));
  }
  
  return result;
}

/**
 * Generate random numbers from gamma distribution (simplified approximation)
 * @param shape - Shape of the output array
 * @param alpha - Shape parameter (default: 1)
 * @param beta - Rate parameter (default: 1)
 * @returns NDArray of gamma distributed random numbers
 * 
 * @example
 * gamma([100], 2, 1) // 100 samples from gamma distribution
 */
export function gamma(shape: Shape, alpha: number = 1, beta: number = 1): NDArray {
  validatePositiveNumber(alpha, 'alpha');
  validatePositiveNumber(beta, 'beta');
  
  const result = zeros(shape);
  const totalSize = shape.reduce((acc, dim) => acc * dim, 1);
  
  // Access the underlying data buffer
  // const data = (result as any).data as Float64Array;
  
  // Simple approximation using sum of exponentials for integer alpha
  if (alpha === Math.floor(alpha) && alpha >= 1) {
    for (let i = 0; i < totalSize; i++) {
      let sum = 0;
      for (let j = 0; j < alpha; j++) {
        const u = Math.random();
        sum += -Math.log(1 - u);
      }
      // data[i] = sum / beta;
      const indices = flatIndexToIndices(i, shape);
      result.set(...indices, sum / beta);
    }
  } else {
    // For non-integer alpha, use a simple approximation
    for (let i = 0; i < totalSize; i++) {
      // This is a simplified approximation - for production use, implement proper gamma generation
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      // data[i] = Math.max(0, alpha + Math.sqrt(alpha) * z) / beta;
      const indices = flatIndexToIndices(i, shape);
      result.set(...indices, Math.max(0, alpha + Math.sqrt(alpha) * z) / beta);
    }
  }
  
  return result;
}

/**
 * Generate random numbers from beta distribution (simplified approximation)
 * @param shape - Shape of the output array
 * @param alpha - First shape parameter (default: 1)
 * @param beta - Second shape parameter (default: 1)
 * @returns NDArray of beta distributed random numbers
 * 
 * @example
 * beta([100], 2, 5) // 100 samples from beta distribution
 */
export function beta(shape: Shape, alpha: number = 1, betaParam: number = 1): NDArray {
  validatePositiveNumber(alpha, 'alpha');
  validatePositiveNumber(betaParam, 'beta');
  
  // Generate using gamma distributions: Beta(α,β) = Gamma(α,1) / (Gamma(α,1) + Gamma(β,1))
  const gamma1 = gamma(shape, alpha, 1);
  const gamma2 = gamma(shape, betaParam, 1);
  
  const result = zeros(shape);
  const totalSize = shape.reduce((acc, dim) => acc * dim, 1);
  
  // Access the underlying data buffers
  const data = (result as any).data as Float64Array;
  const gamma1Data = (gamma1 as any).data as Float64Array;
  const gamma2Data = (gamma2 as any).data as Float64Array;
  
  for (let i = 0; i < totalSize; i++) {
    // const g1 = gamma1Data[i] ?? 0;
    // const g2 = gamma2Data[i] ?? 0;
    // data[i] = g1 / (g1 + g2);

    const indices = flatIndexToIndices(i, shape);
    const g1 = gamma1.get(...indices);
    const g2 = gamma2.get(...indices);
    result.set(...indices, g1 / (g1 + g2));
  }
  
  return result;
}

// ============================================================================
// Discrete Distributions
// ============================================================================

/**
 * Generate random numbers from binomial distribution
 * @param shape - Shape of the output array
 * @param n - Number of trials
 * @param p - Probability of success (default: 0.5)
 * @returns NDArray of binomially distributed random numbers
 * 
 * @example
 * binomial([100], 10, 0.3) // 100 samples from binomial distribution
 */
export function binomial(shape: Shape, n: number, p: number = 0.5): NDArray {
  validatePositiveInteger(n, 'n');
  validateFiniteNumber(p, 'p');
  
  if (p < 0 || p > 1) {
    throw new InvalidParameterError('p', 'probability between 0 and 1', p);
  }
  
  const result = zeros(shape);
  const totalSize = shape.reduce((acc, dim) => acc * dim, 1);
  
  // Access the underlying data buffer
  const data = (result as any).data as Float64Array;
  for (let i = 0; i < totalSize; i++) {
    let successes = 0;
    for (let trial = 0; trial < n; trial++) {
      if (Math.random() < p) {
        successes++;
      }
    }
    data[i] = successes;
  }
  
  return result;
}

/**
 * Generate random numbers from Poisson distribution (approximation)
 * @param shape - Shape of the output array
 * @param lambda - Rate parameter (default: 1)
 * @returns NDArray of Poisson distributed random numbers
 * 
 * @example
 * poisson([100], 3) // 100 samples from Poisson distribution with λ=3
 */
export function poisson(shape: Shape, lambda: number = 1): NDArray {
  validatePositiveNumber(lambda, 'lambda');
  
  const result = zeros(shape);
  const totalSize = shape.reduce((acc, dim) => acc * dim, 1);
  
  const L = Math.exp(-lambda);
  
  // Access the underlying data buffer
  const data = (result as any).data as Float64Array;
  for (let i = 0; i < totalSize; i++) {
    let k = 0;
    let p = 1;
    
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    
    data[i] = k - 1;
  }
  
  return result;
}

// ============================================================================
// Sampling Functions
// ============================================================================

/**
 * Randomly sample from an array with or without replacement
 * @param array - Array to sample from
 * @param size - Number of samples to draw
 * @param replace - Whether to sample with replacement (default: false)
 * @returns Array of sampled elements
 * 
 * @example
 * choice([1, 2, 3, 4, 5], 3) // [2, 5, 1] (without replacement)
 * choice([1, 2, 3], 5, true) // [1, 3, 1, 2, 3] (with replacement)
 */
export function choice<T>(array: T[], size: number, replace: boolean = false): T[] {
  validatePositiveInteger(size, 'size');
  
  if (array.length === 0) {
    throw new InvalidParameterError('array', 'non-empty array', array);
  }
  
  if (!replace && size > array.length) {
    throw new InvalidParameterError('size', `at most ${array.length} when replace=false`, size);
  }
  
  const result: T[] = [];
  
  if (replace) {
    for (let i = 0; i < size; i++) {
      const index = randint(0, array.length - 1);
      const element = array[index];
      if (element !== undefined) {
        result.push(element);
      }
    }
  } else {
    const indices = Array.from({ length: array.length }, (_, i) => i);
    for (let i = 0; i < size; i++) {
      const randomIndex = randint(0, indices.length - 1);
      const selectedIndex = indices.splice(randomIndex, 1)[0];
      if (selectedIndex !== undefined) {
        const element = array[selectedIndex];
        if (element !== undefined) {
          result.push(element);
        }
      }
    }
  }
  
  return result;
}

/**
 * Randomly shuffle an array in place
 * @param array - Array to shuffle
 * @returns The shuffled array (modified in place)
 * 
 * @example
 * const arr = [1, 2, 3, 4, 5];
 * shuffle(arr); // arr is now shuffled, e.g., [3, 1, 5, 2, 4]
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randint(0, i);
    const temp = array[i];
    const jElement = array[j];
    if (temp !== undefined && jElement !== undefined) {
      array[i] = jElement;
      array[j] = temp;
    }
  }
  return array;
}

/**
 * Generate a random permutation of integers from 0 to n-1
 * @param n - Number of elements
 * @returns Array containing a random permutation
 * 
 * @example
 * permutation(5) // [2, 0, 4, 1, 3] (random permutation of [0, 1, 2, 3, 4])
 */
export function permutation(n: number): NumericArray {
  validatePositiveInteger(n, 'n');
  
  const array = Array.from({ length: n }, (_, i) => i);
  return shuffle(array);
}

// ============================================================================
// Random Seed Management
// ============================================================================

/**
 * Set random seed for reproducible results
 * Note: This is a simplified implementation. For production use,
 * consider using a proper PRNG with seed support.
 * @param seed - Seed value
 * 
 * @example
 * seed(42); // Set seed for reproducible random numbers
 */
export function seed(seedValue: number): void {
  validateInteger(seedValue, 'seed');
  
  // This is a placeholder implementation
  // In a real implementation, you would replace Math.random with a seeded PRNG
  console.warn('Seed function is not fully implemented. Math.random() is not seedable.');
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get random state information
 * @returns Object containing random state information
 */
export function getState(): { generator: string; seed?: number } {
  return {
    generator: 'Math.random'
    // Math.random doesn't expose seed, so we omit the seed property
  };
}

/**
 * Generate random bytes
 * @param size - Number of bytes to generate
 * @returns Array of random bytes (0-255)
 * 
 * @example
 * randomBytes(10) // [123, 45, 67, 89, 12, 34, 56, 78, 90, 123]
 */
export function randomBytes(size: number): number[] {
  validatePositiveInteger(size, 'size');
  
  const result: number[] = [];
  for (let i = 0; i < size; i++) {
    result.push(randint(0, 255));
  }
  
  return result;
}