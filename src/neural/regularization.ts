import { NumericArray } from '../types/common.js';
import { InvalidParameterError } from '../types/errors.js';

/**
 * L1 regularization (Lasso) - adds penalty equal to sum of absolute values of parameters
 * @param weights - Array of weight values
 * @param lambda - Regularization strength (must be non-negative)
 * @returns L1 regularization penalty
 */
export function l1Regularization(weights: NumericArray, lambda: number): number {
  if (lambda < 0) {
    throw new InvalidParameterError('Lambda must be non-negative', 'l1Regularization', { lambda });
  }
  
  return lambda * weights.reduce((sum, weight) => sum + Math.abs(weight), 0);
}

/**
 * L1 regularization gradient
 * @param weights - Array of weight values
 * @param lambda - Regularization strength
 * @returns Gradient of L1 regularization
 */
export function l1RegularizationGradient(weights: NumericArray, lambda: number): NumericArray {
  if (lambda < 0) {
    throw new InvalidParameterError('Lambda must be non-negative', 'l1RegularizationGradient', { lambda });
  }
  
  return weights.map(weight => lambda * Math.sign(weight));
}

/**
 * L2 regularization (Ridge) - adds penalty equal to sum of squared parameters
 * @param weights - Array of weight values
 * @param lambda - Regularization strength (must be non-negative)
 * @returns L2 regularization penalty
 */
export function l2Regularization(weights: NumericArray, lambda: number): number {
  if (lambda < 0) {
    throw new InvalidParameterError('Lambda must be non-negative', 'l2Regularization', { lambda });
  }
  
  return lambda * weights.reduce((sum, weight) => sum + weight * weight, 0) / 2;
}

/**
 * L2 regularization gradient
 * @param weights - Array of weight values
 * @param lambda - Regularization strength
 * @returns Gradient of L2 regularization
 */
export function l2RegularizationGradient(weights: NumericArray, lambda: number): NumericArray {
  if (lambda < 0) {
    throw new InvalidParameterError('Lambda must be non-negative', 'l2RegularizationGradient', { lambda });
  }
  
  return weights.map(weight => lambda * weight);
}

/**
 * ElasticNet regularization - combines L1 and L2 regularization
 * @param weights - Array of weight values
 * @param l1Lambda - L1 regularization strength
 * @param l2Lambda - L2 regularization strength
 * @returns ElasticNet regularization penalty
 */
export function elasticNetRegularization(
  weights: NumericArray, 
  l1Lambda: number, 
  l2Lambda: number
): number {
  if (l1Lambda < 0 || l2Lambda < 0) {
    throw new InvalidParameterError('Lambda values must be non-negative', 'elasticNetRegularization', { l1Lambda, l2Lambda });
  }
  
  return l1Regularization(weights, l1Lambda) + l2Regularization(weights, l2Lambda);
}

/**
 * ElasticNet regularization gradient
 * @param weights - Array of weight values
 * @param l1Lambda - L1 regularization strength
 * @param l2Lambda - L2 regularization strength
 * @returns Gradient of ElasticNet regularization
 */
export function elasticNetRegularizationGradient(
  weights: NumericArray, 
  l1Lambda: number, 
  l2Lambda: number
): NumericArray {
  if (l1Lambda < 0 || l2Lambda < 0) {
    throw new InvalidParameterError('Lambda values must be non-negative', 'elasticNetRegularizationGradient', { l1Lambda, l2Lambda });
  }
  
  const l1Grad = l1RegularizationGradient(weights, l1Lambda);
  const l2Grad = l2RegularizationGradient(weights, l2Lambda);
  
  return l1Grad.map((grad, i) => grad + (l2Grad[i] ?? 0));
}

/**
 * Dropout function - randomly sets elements to zero with given probability
 * @param input - Input array
 * @param dropoutRate - Probability of dropping each element (0-1)
 * @param training - Whether in training mode (dropout only applied during training)
 * @returns Array with dropout applied
 */
export function dropout(input: NumericArray, dropoutRate: number, training: boolean = true): NumericArray {
  if (dropoutRate < 0 || dropoutRate > 1) {
    throw new InvalidParameterError('Dropout rate must be between 0 and 1', 'dropout', { dropoutRate });
  }
  
  if (!training || dropoutRate === 0) {
    return [...input];
  }
  
  const scale = 1 / (1 - dropoutRate);
  return input.map(value => Math.random() > dropoutRate ? value * scale : 0);
}

/**
 * Inverted dropout - applies dropout with inverted scaling
 * @param input - Input array
 * @param keepProb - Probability of keeping each element (0-1)
 * @param training - Whether in training mode
 * @returns Array with inverted dropout applied
 */
export function invertedDropout(input: NumericArray, keepProb: number, training: boolean = true): NumericArray {
  if (keepProb < 0 || keepProb > 1) {
    throw new InvalidParameterError('Keep probability must be between 0 and 1', 'invertedDropout', { keepProb });
  }
  
  if (!training || keepProb === 1) {
    return [...input];
  }
  
  return input.map(value => Math.random() < keepProb ? value / keepProb : 0);
}

/**
 * Batch normalization - normalizes input to have zero mean and unit variance
 * @param input - Input array
 * @param epsilon - Small constant to prevent division by zero
 * @returns Normalized array
 */
export function batchNormalization(input: NumericArray, epsilon: number = 1e-8): NumericArray {
  if (epsilon <= 0) {
    throw new InvalidParameterError('Epsilon must be positive', 'batchNormalization', { epsilon });
  }
  
  const mean = input.reduce((sum, val) => sum + val, 0) / input.length;
  const variance = input.reduce((sum, val) => sum + (val - mean) ** 2, 0) / input.length;
  const std = Math.sqrt(variance + epsilon);
  
  return input.map(value => (value - mean) / std);
}

/**
 * Layer normalization - normalizes across features for each sample
 * @param input - Input array
 * @param epsilon - Small constant to prevent division by zero
 * @returns Normalized array
 */
export function layerNormalization(input: NumericArray, epsilon: number = 1e-8): NumericArray {
  return batchNormalization(input, epsilon);
}

/**
 * Weight decay - applies L2 penalty directly to weights during optimization
 * @param weights - Current weights
 * @param weightDecay - Weight decay coefficient
 * @returns Updated weights with decay applied
 */
export function applyWeightDecay(weights: NumericArray, weightDecay: number): NumericArray {
  if (weightDecay < 0) {
    throw new InvalidParameterError('Weight decay must be non-negative', 'applyWeightDecay', { weightDecay });
  }
  
  return weights.map(weight => weight * (1 - weightDecay));
}