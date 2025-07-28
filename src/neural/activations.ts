/**
 * Neural network activation functions for Num.js TypeScript migration
 * Provides type-safe implementations of activation functions and their derivatives
 */

import type { NumericArray } from '../types/common.js';
import { 
  InvalidParameterError, 
  MathematicalError 
} from '../types/errors.js';
import { 
  validateFiniteNumber,
  validateNumericArray 
} from '../types/validation.js';

// ============================================================================
// Type Definitions
// ============================================================================

/** Function that operates on a single number */
export type ActivationFunction = (x: number) => number;

/** Function that operates on an array of numbers */
export type ActivationArrayFunction = (arr: NumericArray) => NumericArray;

/** Function that computes the derivative of an activation function */
export type DerivativeFunction = (x: number) => number;

// ============================================================================
// Basic Activation Functions
// ============================================================================

/**
 * ReLU (Rectified Linear Unit) activation function
 * @param x - Input value
 * @returns max(0, x)
 * 
 * @example
 * relu(5) // 5
 * relu(-3) // 0
 */
export const relu: ActivationFunction = (x: number): number => {
  validateFiniteNumber(x, 'x');
  return Math.max(0, x);
};

/**
 * ReLU derivative function
 * @param x - Input value
 * @returns 1 if x > 0, else 0
 */
export const reluDerivative: DerivativeFunction = (x: number): number => {
  validateFiniteNumber(x, 'x');
  return x > 0 ? 1 : 0;
};

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
 * Leaky ReLU derivative function
 * @param x - Input value
 * @param alpha - Slope for negative values (default: 0.01)
 * @returns 1 if x > 0, else alpha
 */
export function leakyReluDerivative(x: number, alpha: number = 0.01): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(alpha, 'alpha');
  return x > 0 ? 1 : alpha;
}

/**
 * Sigmoid activation function
 * @param x - Input value
 * @returns 1 / (1 + e^(-x))
 * 
 * @example
 * sigmoid(0) // 0.5
 * sigmoid(1) // 0.7310585786300049
 */
export const sigmoid: ActivationFunction = (x: number): number => {
  validateFiniteNumber(x, 'x');
  
  // Prevent overflow for very large negative values
  if (x < -500) return 0;
  if (x > 500) return 1;
  
  return 1 / (1 + Math.exp(-x));
};

/**
 * Sigmoid derivative function
 * @param x - Input value
 * @returns sigmoid(x) * (1 - sigmoid(x))
 */
export const sigmoidDerivative: DerivativeFunction = (x: number): number => {
  const s = sigmoid(x);
  return s * (1 - s);
};

/**
 * Hyperbolic tangent activation function
 * @param x - Input value
 * @returns tanh(x)
 * 
 * @example
 * tanh(0) // 0
 * tanh(1) // 0.7615941559557649
 */
export const tanh: ActivationFunction = (x: number): number => {
  validateFiniteNumber(x, 'x');
  return Math.tanh(x);
};

/**
 * Tanh derivative function
 * @param x - Input value
 * @returns 1 - tanh²(x)
 */
export const tanhDerivative: DerivativeFunction = (x: number): number => {
  const t = tanh(x);
  return 1 - t * t;
};

// ============================================================================
// Advanced Activation Functions
// ============================================================================

/**
 * ELU (Exponential Linear Unit) activation function
 * @param x - Input value
 * @param alpha - Scale parameter for negative values (default: 1.0)
 * @returns x if x > 0, else alpha * (e^x - 1)
 * 
 * @example
 * elu(2) // 2
 * elu(-1) // -0.632 (approximately)
 */
export function elu(x: number, alpha: number = 1.0): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(alpha, 'alpha');
  
  if (x > 0) {
    return x;
  } else {
    return alpha * (Math.exp(x) - 1);
  }
}

/**
 * ELU derivative function
 * @param x - Input value
 * @param alpha - Scale parameter for negative values (default: 1.0)
 * @returns 1 if x > 0, else alpha * e^x
 */
export function eluDerivative(x: number, alpha: number = 1.0): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(alpha, 'alpha');
  
  if (x > 0) {
    return 1;
  } else {
    return alpha * Math.exp(x);
  }
}

/**
 * SELU (Scaled Exponential Linear Unit) activation function
 * @param x - Input value
 * @returns Self-normalizing activation function
 */
export function selu(x: number): number {
  validateFiniteNumber(x, 'x');
  
  const alpha = 1.6732632423543772848170429916717;
  const scale = 1.0507009873554804934193349852946;
  
  if (x > 0) {
    return scale * x;
  } else {
    return scale * alpha * (Math.exp(x) - 1);
  }
}

/**
 * Swish (SiLU) activation function
 * @param x - Input value
 * @param beta - Scale parameter (default: 1.0)
 * @returns x * sigmoid(beta * x)
 * 
 * @example
 * swish(1) // 0.7310585786300049
 * swish(-1) // -0.2689414213699951
 */
export function swish(x: number, beta: number = 1.0): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(beta, 'beta');
  
  return x * sigmoid(beta * x);
}

/**
 * SiLU (Sigmoid Linear Unit) - same as Swish with beta=1
 * @param x - Input value
 * @returns x * sigmoid(x)
 */
export const silu: ActivationFunction = (x: number): number => {
  return swish(x, 1.0);
};

/**
 * GELU (Gaussian Error Linear Unit) activation function
 * @param x - Input value
 * @returns 0.5 * x * (1 + erf(x / sqrt(2)))
 * 
 * @example
 * gelu(1) // 0.8413447460685429
 * gelu(-1) // -0.15865525393145705
 */
export function gelu(x: number): number {
  validateFiniteNumber(x, 'x');
  
  return 0.5 * x * (1 + erf(x / Math.sqrt(2)));
}

/**
 * Mish activation function
 * @param x - Input value
 * @returns x * tanh(softplus(x))
 * 
 * @example
 * mish(1) // 0.8650983882673103
 * mish(-1) // -0.30340147637611453
 */
export function mish(x: number): number {
  validateFiniteNumber(x, 'x');
  
  const softplusX = Math.log(1 + Math.exp(x));
  return x * Math.tanh(softplusX);
}

/**
 * Hard Swish activation function
 * @param x - Input value
 * @returns x * max(0, min(1, (x + 3) / 6))
 * 
 * @example
 * hardSwish(3) // 3
 * hardSwish(-3) // 0
 * hardSwish(0) // 0
 */
export function hardSwish(x: number): number {
  validateFiniteNumber(x, 'x');
  
  return x * Math.max(0, Math.min(1, (x + 3) / 6));
}

/**
 * Square Plus activation function
 * @param x - Input value
 * @param b - Shape parameter (default: 4)
 * @returns (x + sqrt(x² + b)) / 2
 */
export function squarePlus(x: number, b: number = 4): number {
  validateFiniteNumber(x, 'x');
  validateFiniteNumber(b, 'b');
  
  if (b < 0) {
    throw new InvalidParameterError('b', 'non-negative number', b);
  }
  
  return (x + Math.sqrt(x * x + b)) / 2;
}

// ============================================================================
// Array-based Activation Functions
// ============================================================================

/**
 * Softmax activation function for arrays
 * @param arr - Array of input values
 * @returns Array of softmax probabilities (sum = 1)
 * 
 * @example
 * softmax([1, 2, 3]) // [0.090, 0.245, 0.665]
 * softmax([0, 0, 0]) // [0.333, 0.333, 0.333]
 */
export const softmax: ActivationArrayFunction = (arr: NumericArray): NumericArray => {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new InvalidParameterError('arr', 'non-empty array', arr);
  }
  
  // Subtract max for numerical stability
  const max = Math.max(...arr);
  const exps: NumericArray = [];
  let sum = 0;
  
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    const exp = Math.exp(value - max);
    exps.push(exp);
    sum += exp;
  }
  
  if (sum === 0) {
    throw new MathematicalError('Softmax sum is zero', 'softmax');
  }
  
  return exps.map(e => e / sum);
};

/**
 * Log Softmax activation function for arrays
 * @param arr - Array of input values
 * @returns Array of log softmax values
 * 
 * @example
 * logSoftmax([1, 2, 3]) // [-2.407, -1.407, -0.407]
 */
export function logSoftmax(arr: NumericArray): NumericArray {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new InvalidParameterError('arr', 'non-empty array', arr);
  }
  
  // Subtract max for numerical stability
  const max = Math.max(...arr);
  let logSumExp = 0;
  
  // Calculate log(sum(exp(x_i - max)))
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    logSumExp += Math.exp(value - max);
  }
  logSumExp = Math.log(logSumExp);
  
  // Calculate log softmax
  const result: NumericArray = [];
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    result.push(value - max - logSumExp);
  }
  
  return result;
}

/**
 * Apply activation function to array element-wise
 * @param arr - Array of input values
 * @param activationFn - Activation function to apply
 * @returns Array with activation function applied
 * 
 * @example
 * applyActivation([1, -2, 3], relu) // [1, 0, 3]
 * applyActivation([0, 1, -1], sigmoid) // [0.5, 0.731, 0.269]
 */
export function applyActivation(
  arr: NumericArray, 
  activationFn: ActivationFunction
): NumericArray {
  validateNumericArray(arr, 'arr');
  
  const result: NumericArray = [];
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    result.push(activationFn(value));
  }
  
  return result;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Error function approximation (used in GELU)
 * @param x - Input value
 * @returns Error function value
 */
function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return sign * y;
}

/**
 * Get activation function by name
 * @param name - Name of the activation function
 * @returns Activation function
 * 
 * @example
 * const reluFn = getActivationFunction('relu');
 * reluFn(5) // 5
 */
export function getActivationFunction(name: string): ActivationFunction {
  const activations: Record<string, ActivationFunction> = {
    'relu': relu,
    'sigmoid': sigmoid,
    'tanh': tanh,
    'silu': silu,
    'elu': (x: number) => elu(x),
    'selu': selu,
    'swish': (x: number) => swish(x),
    'gelu': gelu,
    'mish': mish,
    'hardswish': hardSwish,
    'squareplus': (x: number) => squarePlus(x),
    'leakyrelu': (x: number) => leakyRelu(x),
  };
  
  const fn = activations[name.toLowerCase()];
  if (!fn) {
    throw new InvalidParameterError(
      'name', 
      'valid activation function name', 
      name,
      `Available functions: ${Object.keys(activations).join(', ')}`
    );
  }
  
  return fn;
}

/**
 * Get derivative function by activation name
 * @param name - Name of the activation function
 * @returns Derivative function
 * 
 * @example
 * const reluDeriv = getDerivativeFunction('relu');
 * reluDeriv(5) // 1
 */
export function getDerivativeFunction(name: string): DerivativeFunction {
  const derivatives: Record<string, DerivativeFunction> = {
    'relu': reluDerivative,
    'sigmoid': sigmoidDerivative,
    'tanh': tanhDerivative,
    'elu': (x: number) => eluDerivative(x),
    'leakyrelu': (x: number) => leakyReluDerivative(x),
  };
  
  const fn = derivatives[name.toLowerCase()];
  if (!fn) {
    throw new InvalidParameterError(
      'name', 
      'activation function with available derivative', 
      name,
      `Available derivatives: ${Object.keys(derivatives).join(', ')}`
    );
  }
  
  return fn;
}