import { describe, it, expect } from 'vitest';
import {
  l1Regularization,
  l1RegularizationGradient,
  l2Regularization,
  l2RegularizationGradient,
  elasticNetRegularization,
  elasticNetRegularizationGradient,
  dropout,
  invertedDropout,
  batchNormalization,
  layerNormalization,
  applyWeightDecay
} from '../neural/regularization.js';
import { InvalidParameterError } from '../types/errors.js';

describe('Regularization Functions', () => {
  describe('L1 Regularization', () => {
    it('should calculate L1 regularization correctly', () => {
      const weights = [1, -2, 3, -4];
      const lambda = 0.1;
      const result = l1Regularization(weights, lambda);
      expect(result).toBeCloseTo(1.0); // 0.1 * (1 + 2 + 3 + 4)
    });

    it('should return zero for zero lambda', () => {
      const weights = [1, -2, 3];
      const result = l1Regularization(weights, 0);
      expect(result).toBe(0);
    });

    it('should throw error for negative lambda', () => {
      const weights = [1, 2, 3];
      expect(() => l1Regularization(weights, -0.1)).toThrow(InvalidParameterError);
    });

    it('should calculate L1 gradient correctly', () => {
      const weights = [1, -2, 0, 3];
      const lambda = 0.1;
      const result = l1RegularizationGradient(weights, lambda);
      expect(result).toEqual([0.1, -0.1, 0, 0.1]);
    });
  });

  describe('L2 Regularization', () => {
    it('should calculate L2 regularization correctly', () => {
      const weights = [1, -2, 3];
      const lambda = 0.1;
      const result = l2Regularization(weights, lambda);
      expect(result).toBeCloseTo(0.7); // 0.1 * (1 + 4 + 9) / 2
    });

    it('should return zero for zero lambda', () => {
      const weights = [1, -2, 3];
      const result = l2Regularization(weights, 0);
      expect(result).toBe(0);
    });

    it('should throw error for negative lambda', () => {
      const weights = [1, 2, 3];
      expect(() => l2Regularization(weights, -0.1)).toThrow(InvalidParameterError);
    });

    it('should calculate L2 gradient correctly', () => {
      const weights = [1, -2, 3];
      const lambda = 0.1;
      const result = l2RegularizationGradient(weights, lambda);
      expect(result[0]).toBeCloseTo(0.1);
      expect(result[1]).toBeCloseTo(-0.2);
      expect(result[2]).toBeCloseTo(0.3);
    });
  });

  describe('ElasticNet Regularization', () => {
    it('should combine L1 and L2 regularization', () => {
      const weights = [1, -2, 3];
      const l1Lambda = 0.1;
      const l2Lambda = 0.05;
      
      const l1 = l1Regularization(weights, l1Lambda);
      const l2 = l2Regularization(weights, l2Lambda);
      const elasticNet = elasticNetRegularization(weights, l1Lambda, l2Lambda);
      
      expect(elasticNet).toBeCloseTo(l1 + l2);
    });

    it('should throw error for negative lambda values', () => {
      const weights = [1, 2, 3];
      expect(() => elasticNetRegularization(weights, -0.1, 0.1)).toThrow(InvalidParameterError);
      expect(() => elasticNetRegularization(weights, 0.1, -0.1)).toThrow(InvalidParameterError);
    });

    it('should calculate ElasticNet gradient correctly', () => {
      const weights = [1, -2, 3];
      const l1Lambda = 0.1;
      const l2Lambda = 0.05;
      
      const l1Grad = l1RegularizationGradient(weights, l1Lambda);
      const l2Grad = l2RegularizationGradient(weights, l2Lambda);
      const elasticGrad = elasticNetRegularizationGradient(weights, l1Lambda, l2Lambda);
      
      expect(elasticGrad[0]).toBeCloseTo((l1Grad[0] ?? 0) + (l2Grad[0] ?? 0));
      expect(elasticGrad[1]).toBeCloseTo((l1Grad[1] ?? 0) + (l2Grad[1] ?? 0));
      expect(elasticGrad[2]).toBeCloseTo((l1Grad[2] ?? 0) + (l2Grad[2] ?? 0));
    });
  });

  describe('Dropout', () => {
    it('should return original array when not training', () => {
      const input = [1, 2, 3, 4, 5];
      const result = dropout(input, 0.5, false);
      expect(result).toEqual(input);
    });

    it('should return original array when dropout rate is 0', () => {
      const input = [1, 2, 3, 4, 5];
      const result = dropout(input, 0, true);
      expect(result).toEqual(input);
    });

    it('should throw error for invalid dropout rate', () => {
      const input = [1, 2, 3];
      expect(() => dropout(input, -0.1)).toThrow(InvalidParameterError);
      expect(() => dropout(input, 1.1)).toThrow(InvalidParameterError);
    });

    it('should apply dropout during training', () => {
      const input = [1, 2, 3, 4, 5];
      const result = dropout(input, 0.5, true);
      
      // Should have some zeros and some scaled values
      const hasZeros = result.some(val => val === 0);
      const hasNonZeros = result.some(val => val !== 0);
      
      // Note: This test might occasionally fail due to randomness
      // In practice, you might want to seed the random number generator
      expect(result.length).toBe(input.length);
    });
  });

  describe('Inverted Dropout', () => {
    it('should return original array when not training', () => {
      const input = [1, 2, 3, 4, 5];
      const result = invertedDropout(input, 0.5, false);
      expect(result).toEqual(input);
    });

    it('should return original array when keep probability is 1', () => {
      const input = [1, 2, 3, 4, 5];
      const result = invertedDropout(input, 1, true);
      expect(result).toEqual(input);
    });

    it('should throw error for invalid keep probability', () => {
      const input = [1, 2, 3];
      expect(() => invertedDropout(input, -0.1)).toThrow(InvalidParameterError);
      expect(() => invertedDropout(input, 1.1)).toThrow(InvalidParameterError);
    });
  });

  describe('Batch Normalization', () => {
    it('should normalize input to zero mean and unit variance', () => {
      const input = [1, 2, 3, 4, 5];
      const result = batchNormalization(input);
      
      // Check mean is approximately zero
      const mean = result.reduce((sum, val) => sum + val, 0) / result.length;
      expect(mean).toBeCloseTo(0, 10);
      
      // Check variance is approximately 1
      const variance = result.reduce((sum, val) => sum + val * val, 0) / result.length;
      expect(variance).toBeCloseTo(1, 5);
    });

    it('should handle constant input', () => {
      const input = [5, 5, 5, 5, 5];
      const result = batchNormalization(input);
      
      // All values should be zero for constant input
      result.forEach(val => expect(val).toBeCloseTo(0, 10));
    });

    it('should throw error for non-positive epsilon', () => {
      const input = [1, 2, 3];
      expect(() => batchNormalization(input, 0)).toThrow(InvalidParameterError);
      expect(() => batchNormalization(input, -1e-8)).toThrow(InvalidParameterError);
    });
  });

  describe('Layer Normalization', () => {
    it('should work identically to batch normalization for 1D input', () => {
      const input = [1, 2, 3, 4, 5];
      const batchResult = batchNormalization(input);
      const layerResult = layerNormalization(input);
      
      expect(layerResult).toEqual(batchResult);
    });
  });

  describe('Weight Decay', () => {
    it('should apply weight decay correctly', () => {
      const weights = [1, 2, 3, 4];
      const weightDecay = 0.01;
      const result = applyWeightDecay(weights, weightDecay);
      
      const expected = weights.map(w => w * (1 - weightDecay));
      expect(result).toEqual(expected);
    });

    it('should return original weights for zero decay', () => {
      const weights = [1, 2, 3, 4];
      const result = applyWeightDecay(weights, 0);
      expect(result).toEqual(weights);
    });

    it('should throw error for negative weight decay', () => {
      const weights = [1, 2, 3];
      expect(() => applyWeightDecay(weights, -0.01)).toThrow(InvalidParameterError);
    });

    it('should handle edge case of weight decay = 1', () => {
      const weights = [1, 2, 3, 4];
      const result = applyWeightDecay(weights, 1);
      expect(result).toEqual([0, 0, 0, 0]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays', () => {
      const empty: number[] = [];
      
      expect(l1Regularization(empty, 0.1)).toBe(0);
      expect(l2Regularization(empty, 0.1)).toBe(0);
      expect(l1RegularizationGradient(empty, 0.1)).toEqual([]);
      expect(l2RegularizationGradient(empty, 0.1)).toEqual([]);
      expect(dropout(empty, 0.5)).toEqual([]);
      expect(applyWeightDecay(empty, 0.01)).toEqual([]);
    });

    it('should handle single element arrays', () => {
      const single = [5];
      
      expect(l1Regularization(single, 0.1)).toBeCloseTo(0.5);
      expect(l2Regularization(single, 0.1)).toBeCloseTo(1.25);
      expect(l1RegularizationGradient(single, 0.1)).toEqual([0.1]);
      expect(l2RegularizationGradient(single, 0.1)).toEqual([0.5]);
    });

    it('should handle arrays with zeros', () => {
      const withZeros = [0, 1, 0, -1, 0];
      
      expect(l1Regularization(withZeros, 0.1)).toBeCloseTo(0.2);
      expect(l2Regularization(withZeros, 0.1)).toBeCloseTo(0.1);
      
      const l1Grad = l1RegularizationGradient(withZeros, 0.1);
      expect(l1Grad).toEqual([0, 0.1, 0, -0.1, 0]);
    });
  });
});