/**
 * Neural network loss functions for Num.js TypeScript migration
 * Provides type-safe implementations of loss functions and their gradients
 */

import type { NumericArray } from '../types/common.js';
import { 
  InvalidParameterError, 
  MathematicalError,
  DivisionByZeroError 
} from '../types/errors.js';
import { 
  validateFiniteNumber,
  validateNumericArray,
  validateNonNegativeNumber 
} from '../types/validation.js';

// ============================================================================
// Type Definitions
// ============================================================================

/** Loss function that takes true and predicted values */
export type LossFunction = (yTrue: NumericArray, yPred: NumericArray) => number;

/** Gradient function that computes loss gradients */
export type GradientFunction = (yTrue: NumericArray, yPred: NumericArray) => NumericArray;

// ============================================================================
// Regression Loss Functions
// ============================================================================

/**
 * Mean Squared Error (MSE) loss function
 * @param yTrue - True values
 * @param yPred - Predicted values
 * @returns MSE loss value
 * 
 * @example
 * mse([1, 2, 3], [1.1, 2.1, 2.9]) // 0.0033333333333333335
 */
export function mse(yTrue: NumericArray, yPred: NumericArray): number {
  validateNumericArray(yTrue, 'yTrue');
  validateNumericArray(yPred, 'yPred');
  
  if (yTrue.length !== yPred.length) {
    throw new InvalidParameterError(
      'yPred', 
      `array of length ${yTrue.length}`, 
      yPred,
      'True and predicted arrays must have the same length'
    );
  }
  
  if (yTrue.length === 0) {
    throw new InvalidParameterError('yTrue', 'non-empty array', yTrue);
  }
  
  let sumSquaredErrors = 0;
  for (let i = 0; i < yTrue.length; i++) {
    const trueVal = yTrue[i];
    const predVal = yPred[i];
    
    if (trueVal === undefined || predVal === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { yTrue, yPred });
    }
    
    const error = trueVal - predVal;
    sumSquaredErrors += error * error;
  }
  
  return sumSquaredErrors / yTrue.length;
}

/**
 * MSE gradient function
 * @param yTrue - True values
 * @param yPred - Predicted values
 * @returns Gradient array
 */
export function mseGradient(yTrue: NumericArray, yPred: NumericArray): NumericArray {
  validateNumericArray(yTrue, 'yTrue');
  validateNumericArray(yPred, 'yPred');
  
  if (yTrue.length !== yPred.length) {
    throw new InvalidParameterError(
      'yPred', 
      `array of length ${yTrue.length}`, 
      yPred
    );
  }
  
  const gradient: NumericArray = [];
  const n = yTrue.length;
  
  for (let i = 0; i < n; i++) {
    const trueVal = yTrue[i];
    const predVal = yPred[i];
    
    if (trueVal === undefined || predVal === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { yTrue, yPred });
    }
    
    gradient.push((2 / n) * (predVal - trueVal));
  }
  
  return gradient;
}

/**
 * Mean Absolute Error (MAE) loss function
 * @param yTrue - True values
 * @param yPred - Predicted values
 * @returns MAE loss value
 * 
 * @example
 * mae([1, 2, 3], [1.1, 2.1, 2.9]) // 0.1
 */
export function mae(yTrue: NumericArray, yPred: NumericArray): number {
  validateNumericArray(yTrue, 'yTrue');
  validateNumericArray(yPred, 'yPred');
  
  if (yTrue.length !== yPred.length) {
    throw new InvalidParameterError(
      'yPred', 
      `array of length ${yTrue.length}`, 
      yPred
    );
  }
  
  if (yTrue.length === 0) {
    throw new InvalidParameterError('yTrue', 'non-empty array', yTrue);
  }
  
  let sumAbsoluteErrors = 0;
  for (let i = 0; i < yTrue.length; i++) {
    const trueVal = yTrue[i];
    const predVal = yPred[i];
    
    if (trueVal === undefined || predVal === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { yTrue, yPred });
    }
    
    sumAbsoluteErrors += Math.abs(trueVal - predVal);
  }
  
  return sumAbsoluteErrors / yTrue.length;
}

/**
 * Huber loss function (robust to outliers)
 * @param yTrue - True values
 * @param yPred - Predicted values
 * @param delta - Threshold parameter (default: 1.0)
 * @returns Huber loss value
 * 
 * @example
 * huberLoss([1, 2, 3], [1.1, 2.1, 2.9], 1.0) // 0.005
 */
export function huberLoss(yTrue: NumericArray, yPred: NumericArray, delta: number = 1.0): number {
  validateNumericArray(yTrue, 'yTrue');
  validateNumericArray(yPred, 'yPred');
  validateFiniteNumber(delta, 'delta');
  
  if (delta <= 0) {
    throw new InvalidParameterError('delta', 'positive number', delta);
  }
  
  if (yTrue.length !== yPred.length) {
    throw new InvalidParameterError(
      'yPred', 
      `array of length ${yTrue.length}`, 
      yPred
    );
  }
  
  if (yTrue.length === 0) {
    throw new InvalidParameterError('yTrue', 'non-empty array', yTrue);
  }
  
  let totalLoss = 0;
  for (let i = 0; i < yTrue.length; i++) {
    const trueVal = yTrue[i];
    const predVal = yPred[i];
    
    if (trueVal === undefined || predVal === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { yTrue, yPred });
    }
    
    const error = Math.abs(trueVal - predVal);
    
    if (error <= delta) {
      totalLoss += 0.5 * error * error;
    } else {
      totalLoss += delta * (error - 0.5 * delta);
    }
  }
  
  return totalLoss / yTrue.length;
}

// ============================================================================
// Classification Loss Functions
// ============================================================================

/**
 * Binary Cross-Entropy (BCE) loss function
 * @param yTrue - True binary labels (0 or 1)
 * @param yPred - Predicted probabilities (0 to 1)
 * @returns BCE loss value
 * 
 * @example
 * bce([1, 0, 1], [0.9, 0.1, 0.8]) // 0.10536051565782628
 */
export function bce(yTrue: NumericArray, yPred: NumericArray): number {
  validateNumericArray(yTrue, 'yTrue');
  validateNumericArray(yPred, 'yPred');
  
  if (yTrue.length !== yPred.length) {
    throw new InvalidParameterError(
      'yPred', 
      `array of length ${yTrue.length}`, 
      yPred
    );
  }
  
  if (yTrue.length === 0) {
    throw new InvalidParameterError('yTrue', 'non-empty array', yTrue);
  }
  
  let totalLoss = 0;
  const epsilon = 1e-15; // Small value to prevent log(0)
  
  for (let i = 0; i < yTrue.length; i++) {
    const trueVal = yTrue[i];
    const predVal = yPred[i];
    
    if (trueVal === undefined || predVal === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { yTrue, yPred });
    }
    
    // Validate binary labels
    if (trueVal !== 0 && trueVal !== 1) {
      throw new InvalidParameterError(
        `yTrue[${i}]`, 
        'binary value (0 or 1)', 
        trueVal
      );
    }
    
    // Validate probability range
    if (predVal < 0 || predVal > 1) {
      throw new InvalidParameterError(
        `yPred[${i}]`, 
        'probability value (0 to 1)', 
        predVal
      );
    }
    
    // Clip predictions to prevent log(0)
    const clippedPred = Math.max(epsilon, Math.min(1 - epsilon, predVal));
    
    totalLoss += -(trueVal * Math.log(clippedPred) + (1 - trueVal) * Math.log(1 - clippedPred));
  }
  
  return totalLoss / yTrue.length;
}

/**
 * BCE gradient function
 * @param yTrue - True binary labels
 * @param yPred - Predicted probabilities
 * @returns Gradient array
 */
export function bceGradient(yTrue: NumericArray, yPred: NumericArray): NumericArray {
  validateNumericArray(yTrue, 'yTrue');
  validateNumericArray(yPred, 'yPred');
  
  if (yTrue.length !== yPred.length) {
    throw new InvalidParameterError(
      'yPred', 
      `array of length ${yTrue.length}`, 
      yPred
    );
  }
  
  const gradient: NumericArray = [];
  const epsilon = 1e-15;
  
  for (let i = 0; i < yTrue.length; i++) {
    const trueVal = yTrue[i];
    const predVal = yPred[i];
    
    if (trueVal === undefined || predVal === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { yTrue, yPred });
    }
    
    // Clip predictions to prevent division by zero
    const clippedPred = Math.max(epsilon, Math.min(1 - epsilon, predVal));
    
    gradient.push(-(trueVal / clippedPred) + ((1 - trueVal) / (1 - clippedPred)));
  }
  
  return gradient;
}

/**
 * Categorical Cross-Entropy (CCE) loss function
 * @param yTrue - True one-hot encoded labels
 * @param yPred - Predicted probabilities
 * @returns CCE loss value
 * 
 * @example
 * cce([1, 0, 0], [0.7, 0.2, 0.1]) // 0.35667494393873245
 */
export function cce(yTrue: NumericArray, yPred: NumericArray): number {
  validateNumericArray(yTrue, 'yTrue');
  validateNumericArray(yPred, 'yPred');
  
  if (yTrue.length !== yPred.length) {
    throw new InvalidParameterError(
      'yPred', 
      `array of length ${yTrue.length}`, 
      yPred
    );
  }
  
  if (yTrue.length === 0) {
    throw new InvalidParameterError('yTrue', 'non-empty array', yTrue);
  }
  
  let totalLoss = 0;
  const epsilon = 1e-15;
  
  for (let i = 0; i < yTrue.length; i++) {
    const trueVal = yTrue[i];
    const predVal = yPred[i];
    
    if (trueVal === undefined || predVal === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { yTrue, yPred });
    }
    
    // Validate one-hot encoding
    if (trueVal < 0 || trueVal > 1) {
      throw new InvalidParameterError(
        `yTrue[${i}]`, 
        'value between 0 and 1', 
        trueVal
      );
    }
    
    // Validate probability
    if (predVal < 0 || predVal > 1) {
      throw new InvalidParameterError(
        `yPred[${i}]`, 
        'probability value (0 to 1)', 
        predVal
      );
    }
    
    // Clip predictions to prevent log(0)
    const clippedPred = Math.max(epsilon, Math.min(1 - epsilon, predVal));
    
    totalLoss += -(trueVal * Math.log(clippedPred));
  }
  
  return totalLoss;
}

/**
 * Sparse Categorical Cross-Entropy loss function
 * @param yTrue - True class indices
 * @param yPred - Predicted probabilities for each class
 * @returns Sparse CCE loss value
 * 
 * @example
 * sparseCce([0, 1, 2], [[0.7, 0.2, 0.1], [0.1, 0.8, 0.1], [0.2, 0.3, 0.5]]) // 0.35667494393873245
 */
export function sparseCce(yTrue: NumericArray, yPred: NumericArray[]): number {
  validateNumericArray(yTrue, 'yTrue');
  
  if (!Array.isArray(yPred) || yPred.length === 0) {
    throw new InvalidParameterError('yPred', '2D array', yPred);
  }
  
  if (yTrue.length !== yPred.length) {
    throw new InvalidParameterError(
      'yPred', 
      `array of length ${yTrue.length}`, 
      yPred
    );
  }
  
  let totalLoss = 0;
  const epsilon = 1e-15;
  
  for (let i = 0; i < yTrue.length; i++) {
    const trueClass = yTrue[i];
    const predProbs = yPred[i];
    
    if (trueClass === undefined || !Array.isArray(predProbs)) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { yTrue, yPred });
    }
    
    // Validate class index
    if (!Number.isInteger(trueClass) || trueClass < 0 || trueClass >= predProbs.length) {
      throw new InvalidParameterError(
        `yTrue[${i}]`, 
        `integer between 0 and ${predProbs.length - 1}`, 
        trueClass
      );
    }
    
    const predProb = predProbs[trueClass];
    if (predProb === undefined) {
      throw new InvalidParameterError(`yPred[${i}][${trueClass}]`, 'finite number', predProb);
    }
    
    // Clip prediction to prevent log(0)
    const clippedPred = Math.max(epsilon, Math.min(1 - epsilon, predProb));
    
    totalLoss += -Math.log(clippedPred);
  }
  
  return totalLoss / yTrue.length;
}

// ============================================================================
// Advanced Loss Functions
// ============================================================================

/**
 * Focal Loss function (for handling class imbalance)
 * @param yTrue - True binary labels
 * @param yPred - Predicted probabilities
 * @param gamma - Focusing parameter (default: 2.0)
 * @param alpha - Weighting parameter (default: 1.0)
 * @returns Focal loss value
 * 
 * @example
 * focalLoss([1, 0, 1], [0.9, 0.1, 0.8], 2.0) // Lower loss for confident correct predictions
 */
export function focalLoss(
  yTrue: NumericArray, 
  yPred: NumericArray, 
  gamma: number = 2.0,
  alpha: number = 1.0
): number {
  validateNumericArray(yTrue, 'yTrue');
  validateNumericArray(yPred, 'yPred');
  validateFiniteNumber(gamma, 'gamma');
  validateFiniteNumber(alpha, 'alpha');
  
  if (yTrue.length !== yPred.length) {
    throw new InvalidParameterError(
      'yPred', 
      `array of length ${yTrue.length}`, 
      yPred
    );
  }
  
  if (yTrue.length === 0) {
    throw new InvalidParameterError('yTrue', 'non-empty array', yTrue);
  }
  
  let totalLoss = 0;
  const epsilon = 1e-15;
  
  for (let i = 0; i < yTrue.length; i++) {
    const trueVal = yTrue[i];
    const predVal = yPred[i];
    
    if (trueVal === undefined || predVal === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { yTrue, yPred });
    }
    
    // Validate binary labels
    if (trueVal !== 0 && trueVal !== 1) {
      throw new InvalidParameterError(
        `yTrue[${i}]`, 
        'binary value (0 or 1)', 
        trueVal
      );
    }
    
    // Clip predictions
    const clippedPred = Math.max(epsilon, Math.min(1 - epsilon, predVal));
    
    // Calculate pt (probability of true class)
    const pt = trueVal * clippedPred + (1 - trueVal) * (1 - clippedPred);
    
    // Calculate focal loss
    totalLoss += -alpha * Math.pow(1 - pt, gamma) * Math.log(pt);
  }
  
  return totalLoss / yTrue.length;
}

/**
 * Kullback-Leibler Divergence loss function
 * @param yTrue - True probability distribution
 * @param yPred - Predicted probability distribution
 * @returns KL divergence value
 * 
 * @example
 * klDivergence([0.5, 0.3, 0.2], [0.4, 0.4, 0.2]) // 0.02228
 */
export function klDivergence(yTrue: NumericArray, yPred: NumericArray): number {
  validateNumericArray(yTrue, 'yTrue');
  validateNumericArray(yPred, 'yPred');
  
  if (yTrue.length !== yPred.length) {
    throw new InvalidParameterError(
      'yPred', 
      `array of length ${yTrue.length}`, 
      yPred
    );
  }
  
  if (yTrue.length === 0) {
    throw new InvalidParameterError('yTrue', 'non-empty array', yTrue);
  }
  
  let totalDivergence = 0;
  const epsilon = 1e-15;
  
  for (let i = 0; i < yTrue.length; i++) {
    const trueVal = yTrue[i];
    const predVal = yPred[i];
    
    if (trueVal === undefined || predVal === undefined) {
      throw new InvalidParameterError('arrays', 'arrays with valid elements', { yTrue, yPred });
    }
    
    // Validate probability distributions
    if (trueVal < 0 || predVal < 0) {
      throw new InvalidParameterError(
        'probability values', 
        'non-negative numbers', 
        { trueVal, predVal }
      );
    }
    
    if (trueVal > 0) {
      // Clip to prevent log(0)
      const clippedPred = Math.max(epsilon, predVal);
      totalDivergence += trueVal * Math.log(trueVal / clippedPred);
    }
  }
  
  return totalDivergence;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get loss function by name
 * @param name - Name of the loss function
 * @returns Loss function
 * 
 * @example
 * const mseLoss = getLossFunction('mse');
 * mseLoss([1, 2], [1.1, 2.1]) // 0.01
 */
export function getLossFunction(name: string): LossFunction {
  const losses: Record<string, LossFunction> = {
    'mse': mse,
    'mae': mae,
    'bce': bce,
    'cce': cce,
    'huber': (yTrue: NumericArray, yPred: NumericArray) => huberLoss(yTrue, yPred),
    'focal': (yTrue: NumericArray, yPred: NumericArray) => focalLoss(yTrue, yPred),
    'kl': klDivergence,
    'kldivergence': klDivergence,
  };
  
  const fn = losses[name.toLowerCase()];
  if (!fn) {
    throw new InvalidParameterError(
      'name', 
      'valid loss function name', 
      name,
      `Available functions: ${Object.keys(losses).join(', ')}`
    );
  }
  
  return fn;
}

/**
 * Get gradient function by loss name
 * @param name - Name of the loss function
 * @returns Gradient function
 * 
 * @example
 * const mseGrad = getGradientFunction('mse');
 * mseGrad([1, 2], [1.1, 2.1]) // [0.2, 0.2]
 */
export function getGradientFunction(name: string): GradientFunction {
  const gradients: Record<string, GradientFunction> = {
    'mse': mseGradient,
    'bce': bceGradient,
  };
  
  const fn = gradients[name.toLowerCase()];
  if (!fn) {
    throw new InvalidParameterError(
      'name', 
      'loss function with available gradient', 
      name,
      `Available gradients: ${Object.keys(gradients).join(', ')}`
    );
  }
  
  return fn;
}