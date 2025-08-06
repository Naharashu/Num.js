/**
 * Neural network optimizer functions for Num.js TypeScript migration
 * Provides type-safe implementations of optimization algorithms
 */

import type { NumericArray } from '../types/common.js';
import { 
  InvalidParameterError, 
  MathematicalError 
} from '../types/errors.js';
import { 
  validateFiniteNumber,
  validateNumericArray,
  validatePositiveNumber,
  validateNonNegativeNumber 
} from '../types/validation.js';

// ============================================================================
// Type Definitions
// ============================================================================

/** Optimizer state for stateful optimizers */
export interface OptimizerState {
  [key: string]: NumericArray | number | boolean;
}

/** SGD optimizer parameters */
export interface SGDParams {
  readonly learningRate: number;
  readonly momentum?: number;
  readonly dampening?: number;
  readonly weightDecay?: number;
  readonly nesterov?: boolean;
}

/** Adam optimizer parameters */
export interface AdamParams {
  readonly learningRate: number;
  readonly beta1?: number;
  readonly beta2?: number;
  readonly epsilon?: number;
  readonly weightDecay?: number;
  readonly amsgrad?: boolean;
}

/** RMSprop optimizer parameters */
export interface RMSpropParams {
  readonly learningRate: number;
  readonly alpha?: number;
  readonly epsilon?: number;
  readonly weightDecay?: number;
  readonly momentum?: number;
  readonly centered?: boolean;
}

/** AdaGrad optimizer parameters */
export interface AdaGradParams {
  readonly learningRate: number;
  readonly epsilon?: number;
  readonly weightDecay?: number;
}

/** Optimizer update result */
export interface OptimizerResult {
  readonly weights: NumericArray;
  readonly state: OptimizerState;
}

// ============================================================================
// Stochastic Gradient Descent (SGD)
// ============================================================================

/**
 * SGD optimizer step
 * @param weights - Current weights
 * @param gradients - Gradients
 * @param params - SGD parameters
 * @param state - Optimizer state (optional)
 * @returns Updated weights and state
 * 
 * @example
 * const result = sgd([1, 2], [0.1, 0.2], { learningRate: 0.01 });
 * // result.weights: [0.999, 1.998]
 */
export function sgd(
  weights: NumericArray,
  gradients: NumericArray,
  params: SGDParams,
  state: OptimizerState = {}
): OptimizerResult {
  validateNumericArray(weights, 'weights');
  validateNumericArray(gradients, 'gradients');
  validateSGDParams(params);
  
  if (weights.length !== gradients.length) {
    throw new InvalidParameterError(
      'gradients',
      `array of length ${weights.length}`,
      gradients
    );
  }
  
  const {
    learningRate,
    momentum = 0,
    dampening = 0,
    weightDecay = 0,
    nesterov = false
  } = params;
  
  // Get or initialize momentum buffer
  let momentumBuffer = (state.momentumBuffer as NumericArray) || new Array(weights.length).fill(0);
  
  const newWeights: NumericArray = [];
  const newMomentumBuffer: NumericArray = [];
  
  for (let i = 0; i < weights.length; i++) {
    const weight = weights[i];
    let grad = gradients[i];
    
    if (weight === undefined || grad === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { weights, gradients });
    }
    
    // Apply weight decay
    if (weightDecay !== 0) {
      grad = grad + weightDecay * weight;
    }
    
    // Apply momentum
    if (momentum !== 0) {
      const prevMomentum = momentumBuffer[i] || 0;
      const newMomentum = momentum * prevMomentum + (1 - dampening) * grad;
      newMomentumBuffer[i] = newMomentum;
      
      if (nesterov) {
        grad = grad + momentum * newMomentum;
      } else {
        grad = newMomentum;
      }
    } else {
      newMomentumBuffer[i] = 0;
    }
    
    // Update weight
    newWeights[i] = weight - learningRate * grad;
  }
  
  return {
    weights: newWeights,
    state: { momentumBuffer: newMomentumBuffer }
  };
}

/**
 * Simple SGD step without momentum
 * @param weights - Current weights
 * @param gradients - Gradients
 * @param learningRate - Learning rate
 * @returns Updated weights
 * 
 * @example
 * const newWeights = sgdSimple([1, 2], [0.1, 0.2], 0.01);
 * // [0.999, 1.998]
 */
export function sgdSimple(
  weights: NumericArray,
  gradients: NumericArray,
  learningRate: number
): NumericArray {
  validateNumericArray(weights, 'weights');
  validateNumericArray(gradients, 'gradients');
  validatePositiveNumber(learningRate, 'learningRate');
  
  if (weights.length !== gradients.length) {
    throw new InvalidParameterError(
      'gradients',
      `array of length ${weights.length}`,
      gradients
    );
  }
  
  const newWeights: NumericArray = [];
  
  for (let i = 0; i < weights.length; i++) {
    const weight = weights[i];
    const grad = gradients[i];
    
    if (weight === undefined || grad === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { weights, gradients });
    }
    
    newWeights[i] = weight - learningRate * grad;
  }
  
  return newWeights;
}

// ============================================================================
// Adam Optimizer
// ============================================================================

/**
 * Adam optimizer step
 * @param weights - Current weights
 * @param gradients - Gradients
 * @param params - Adam parameters
 * @param state - Optimizer state
 * @returns Updated weights and state
 * 
 * @example
 * const result = adam([1, 2], [0.1, 0.2], { learningRate: 0.001 }, { step: 1 });
 */
export function adam(
  weights: NumericArray,
  gradients: NumericArray,
  params: AdamParams,
  state: OptimizerState = {}
): OptimizerResult {
  validateNumericArray(weights, 'weights');
  validateNumericArray(gradients, 'gradients');
  validateAdamParams(params);
  
  if (weights.length !== gradients.length) {
    throw new InvalidParameterError(
      'gradients',
      `array of length ${weights.length}`,
      gradients
    );
  }
  
  const {
    learningRate,
    beta1 = 0.9,
    beta2 = 0.999,
    epsilon = 1e-8,
    weightDecay = 0,
    amsgrad = false
  } = params;
  
  // Get or initialize state
  const step = (state.step as number) || 0;
  const newStep = step + 1;
  
  let m = (state.m as NumericArray) || new Array(weights.length).fill(0);
  let v = (state.v as NumericArray) || new Array(weights.length).fill(0);
  let vMax = amsgrad ? ((state.vMax as NumericArray) || new Array(weights.length).fill(0)) : null;
  
  const newWeights: NumericArray = [];
  const newM: NumericArray = [];
  const newV: NumericArray = [];
  const newVMax: NumericArray = amsgrad ? [] : [];
  
  for (let i = 0; i < weights.length; i++) {
    const weight = weights[i];
    let grad = gradients[i];
    
    if (weight === undefined || grad === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { weights, gradients });
    }
    
    // Apply weight decay
    if (weightDecay !== 0) {
      grad = grad + weightDecay * weight;
    }
    
    // Update biased first moment estimate
    const mPrev = m[i] || 0;
    const mNew = beta1 * mPrev + (1 - beta1) * grad;
    newM[i] = mNew;
    
    // Update biased second raw moment estimate
    const vPrev = v[i] || 0;
    const vNew = beta2 * vPrev + (1 - beta2) * grad * grad;
    newV[i] = vNew;
    
    // Compute bias-corrected first moment estimate
    const mHat = mNew / (1 - Math.pow(beta1, newStep));
    
    // Compute bias-corrected second raw moment estimate
    let vHat = vNew / (1 - Math.pow(beta2, newStep));
    
    // AMSGrad variant
    if (amsgrad && vMax) {
      const vMaxPrev = vMax[i] || 0;
      const vMaxNew = Math.max(vMaxPrev, vNew);
      newVMax[i] = vMaxNew;
      vHat = vMaxNew / (1 - Math.pow(beta2, newStep));
    }
    
    // Update weight
    newWeights[i] = weight - learningRate * mHat / (Math.sqrt(vHat) + epsilon);
  }
  
  const newState: OptimizerState = {
    step: newStep,
    m: newM,
    v: newV
  };
  
  if (amsgrad) {
    newState.vMax = newVMax;
  }
  
  return {
    weights: newWeights,
    state: newState
  };
}

// ============================================================================
// RMSprop Optimizer
// ============================================================================

/**
 * RMSprop optimizer step
 * @param weights - Current weights
 * @param gradients - Gradients
 * @param params - RMSprop parameters
 * @param state - Optimizer state
 * @returns Updated weights and state
 * 
 * @example
 * const result = rmsprop([1, 2], [0.1, 0.2], { learningRate: 0.01 });
 */
export function rmsprop(
  weights: NumericArray,
  gradients: NumericArray,
  params: RMSpropParams,
  state: OptimizerState = {}
): OptimizerResult {
  validateNumericArray(weights, 'weights');
  validateNumericArray(gradients, 'gradients');
  validateRMSpropParams(params);
  
  if (weights.length !== gradients.length) {
    throw new InvalidParameterError(
      'gradients',
      `array of length ${weights.length}`,
      gradients
    );
  }
  
  const {
    learningRate,
    alpha = 0.99,
    epsilon = 1e-8,
    weightDecay = 0,
    momentum = 0,
    centered = false
  } = params;
  
  // Get or initialize state
  let squareAvg = (state.squareAvg as NumericArray) || new Array(weights.length).fill(0);
  let momentumBuffer = momentum > 0 ? ((state.momentumBuffer as NumericArray) || new Array(weights.length).fill(0)) : null;
  let gradAvg = centered ? ((state.gradAvg as NumericArray) || new Array(weights.length).fill(0)) : null;
  
  const newWeights: NumericArray = [];
  const newSquareAvg: NumericArray = [];
  const newMomentumBuffer: NumericArray = momentum > 0 ? [] : [];
  const newGradAvg: NumericArray = centered ? [] : [];
  
  for (let i = 0; i < weights.length; i++) {
    const weight = weights[i];
    let grad = gradients[i];
    
    if (weight === undefined || grad === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { weights, gradients });
    }
    
    // Apply weight decay
    if (weightDecay !== 0) {
      grad = grad + weightDecay * weight;
    }
    
    // Update square average
    const squareAvgPrev = squareAvg[i] || 0;
    const squareAvgNew = alpha * squareAvgPrev + (1 - alpha) * grad * grad;
    newSquareAvg[i] = squareAvgNew;
    
    let avg = squareAvgNew;
    
    // Centered variant
    if (centered && gradAvg) {
      const gradAvgPrev = gradAvg[i] || 0;
      const gradAvgNew = alpha * gradAvgPrev + (1 - alpha) * grad;
      newGradAvg[i] = gradAvgNew;
      avg = squareAvgNew - gradAvgNew * gradAvgNew;
    }
    
    // Apply momentum
    if (momentum > 0 && momentumBuffer) {
      const momentumPrev = momentumBuffer[i] || 0;
      const momentumNew = momentum * momentumPrev + grad / (Math.sqrt(avg) + epsilon);
      newMomentumBuffer[i] = momentumNew;
      grad = momentumNew;
    } else {
      grad = grad / (Math.sqrt(avg) + epsilon);
    }
    
    // Update weight
    newWeights[i] = weight - learningRate * grad;
  }
  
  const newState: OptimizerState = {
    squareAvg: newSquareAvg
  };
  
  if (momentum > 0) {
    newState.momentumBuffer = newMomentumBuffer;
  }
  
  if (centered) {
    newState.gradAvg = newGradAvg;
  }
  
  return {
    weights: newWeights,
    state: newState
  };
}

// ============================================================================
// AdaGrad Optimizer
// ============================================================================

/**
 * AdaGrad optimizer step
 * @param weights - Current weights
 * @param gradients - Gradients
 * @param params - AdaGrad parameters
 * @param state - Optimizer state
 * @returns Updated weights and state
 * 
 * @example
 * const result = adagrad([1, 2], [0.1, 0.2], { learningRate: 0.01 });
 */
export function adagrad(
  weights: NumericArray,
  gradients: NumericArray,
  params: AdaGradParams,
  state: OptimizerState = {}
): OptimizerResult {
  validateNumericArray(weights, 'weights');
  validateNumericArray(gradients, 'gradients');
  validateAdaGradParams(params);
  
  if (weights.length !== gradients.length) {
    throw new InvalidParameterError(
      'gradients',
      `array of length ${weights.length}`,
      gradients
    );
  }
  
  const {
    learningRate,
    epsilon = 1e-10,
    weightDecay = 0
  } = params;
  
  // Get or initialize state
  let sumSquaredGrads = (state.sumSquaredGrads as NumericArray) || new Array(weights.length).fill(0);
  
  const newWeights: NumericArray = [];
  const newSumSquaredGrads: NumericArray = [];
  
  for (let i = 0; i < weights.length; i++) {
    const weight = weights[i];
    let grad = gradients[i];
    
    if (weight === undefined || grad === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { weights, gradients });
    }
    
    // Apply weight decay
    if (weightDecay !== 0) {
      grad = grad + weightDecay * weight;
    }
    
    // Update sum of squared gradients
    const sumPrev = sumSquaredGrads[i] || 0;
    const sumNew = sumPrev + grad * grad;
    newSumSquaredGrads[i] = sumNew;
    
    // Update weight
    newWeights[i] = weight - learningRate * grad / (Math.sqrt(sumNew) + epsilon);
  }
  
  return {
    weights: newWeights,
    state: { sumSquaredGrads: newSumSquaredGrads }
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Initialize optimizer state
 * @param weightsLength - Length of weights array
 * @param optimizerType - Type of optimizer
 * @returns Initial optimizer state
 */
export function initializeOptimizerState(
  weightsLength: number,
  optimizerType: 'sgd' | 'adam' | 'rmsprop' | 'adagrad'
): OptimizerState {
  validatePositiveNumber(weightsLength, 'weightsLength');
  
  const zeros = new Array(weightsLength).fill(0);
  
  switch (optimizerType) {
    case 'sgd':
      return { momentumBuffer: zeros };
    
    case 'adam':
      return {
        step: 0,
        m: zeros,
        v: zeros
      };
    
    case 'rmsprop':
      return {
        squareAvg: zeros,
        momentumBuffer: zeros,
        gradAvg: zeros
      };
    
    case 'adagrad':
      return { sumSquaredGrads: zeros };
    
    default:
      throw new InvalidParameterError(
        'optimizerType',
        'valid optimizer type',
        optimizerType,
        'Available types: sgd, adam, rmsprop, adagrad'
      );
  }
}

/**
 * Get optimizer function by name
 * @param name - Name of the optimizer
 * @returns Optimizer function
 */
export function getOptimizer(name: string): (
  weights: NumericArray,
  gradients: NumericArray,
  params: any,
  state?: OptimizerState
) => OptimizerResult {
  const optimizers = {
    'sgd': sgd,
    'adam': adam,
    'rmsprop': rmsprop,
    'adagrad': adagrad
  };
  
  const optimizer = optimizers[name.toLowerCase() as keyof typeof optimizers];
  if (!optimizer) {
    throw new InvalidParameterError(
      'name',
      'valid optimizer name',
      name,
      `Available optimizers: ${Object.keys(optimizers).join(', ')}`
    );
  }
  
  return optimizer;
}

// ============================================================================
// Parameter Validation Functions
// ============================================================================

function validateSGDParams(params: SGDParams): void {
  validatePositiveNumber(params.learningRate, 'learningRate');
  
  if (params.momentum !== undefined) {
    validateNonNegativeNumber(params.momentum, 'momentum');
    if (params.momentum >= 1) {
      throw new InvalidParameterError('momentum', 'value less than 1', params.momentum);
    }
  }
  
  if (params.dampening !== undefined) {
    validateNonNegativeNumber(params.dampening, 'dampening');
  }
  
  if (params.weightDecay !== undefined) {
    validateNonNegativeNumber(params.weightDecay, 'weightDecay');
  }
}

function validateAdamParams(params: AdamParams): void {
  validatePositiveNumber(params.learningRate, 'learningRate');
  
  if (params.beta1 !== undefined) {
    validateFiniteNumber(params.beta1, 'beta1');
    if (params.beta1 < 0 || params.beta1 >= 1) {
      throw new InvalidParameterError('beta1', 'value in [0, 1)', params.beta1);
    }
  }
  
  if (params.beta2 !== undefined) {
    validateFiniteNumber(params.beta2, 'beta2');
    if (params.beta2 < 0 || params.beta2 >= 1) {
      throw new InvalidParameterError('beta2', 'value in [0, 1)', params.beta2);
    }
  }
  
  if (params.epsilon !== undefined) {
    validatePositiveNumber(params.epsilon, 'epsilon');
  }
  
  if (params.weightDecay !== undefined) {
    validateNonNegativeNumber(params.weightDecay, 'weightDecay');
  }
}

function validateRMSpropParams(params: RMSpropParams): void {
  validatePositiveNumber(params.learningRate, 'learningRate');
  
  if (params.alpha !== undefined) {
    validateFiniteNumber(params.alpha, 'alpha');
    if (params.alpha < 0 || params.alpha > 1) {
      throw new InvalidParameterError('alpha', 'value in [0, 1]', params.alpha);
    }
  }
  
  if (params.epsilon !== undefined) {
    validatePositiveNumber(params.epsilon, 'epsilon');
  }
  
  if (params.weightDecay !== undefined) {
    validateNonNegativeNumber(params.weightDecay, 'weightDecay');
  }
  
  if (params.momentum !== undefined) {
    validateNonNegativeNumber(params.momentum, 'momentum');
  }
}

function validateAdaGradParams(params: AdaGradParams): void {
  validatePositiveNumber(params.learningRate, 'learningRate');
  
  if (params.epsilon !== undefined) {
    validatePositiveNumber(params.epsilon, 'epsilon');
  }
  
  if (params.weightDecay !== undefined) {
    validateNonNegativeNumber(params.weightDecay, 'weightDecay');
  }
}