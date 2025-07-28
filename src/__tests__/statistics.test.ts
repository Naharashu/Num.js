/**
 * Unit tests for statistical functions
 */

import { test, expect, describe } from "bun:test";
import {
  mean,
  median,
  mode,
  variance,
  standardDeviation,
  percentile,
  quantile,
  iqr,
  min,
  max,
  range,
  skewness,
  kurtosis,
  covariance,
  correlation,
  summary,
  histogram,
} from "../core/statistics";
import { 
  InvalidParameterError, 
  EmptyArrayError, 
  MathematicalError 
} from "../types/errors";

describe("Basic Statistical Functions", () => {
  describe("mean", () => {
    test("should calculate correct mean", () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3);
      expect(mean([10, 20, 30])).toBe(20);
      expect(mean([0])).toBe(0);
      expect(mean([-1, 0, 1])).toBe(0);
    });

    test("should handle decimal values", () => {
      expect(mean([1.5, 2.5, 3.5])).toBeCloseTo(2.5, 10);
      expect(mean([0.1, 0.2, 0.3])).toBeCloseTo(0.2, 10);
    });

    test("should throw for empty array", () => {
      expect(() => mean([])).toThrow(EmptyArrayError);
    });

    test("should throw for invalid input", () => {
      expect(() => mean([1, NaN, 3])).toThrow(InvalidParameterError);
      expect(() => mean([1, Infinity, 3])).toThrow(InvalidParameterError);
    });
  });

  describe("median", () => {
    test("should calculate correct median for odd length arrays", () => {
      expect(median([1, 2, 3, 4, 5])).toBe(3);
      expect(median([5, 1, 3, 2, 4])).toBe(3); // unsorted input
      expect(median([1])).toBe(1);
    });

    test("should calculate correct median for even length arrays", () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
      expect(median([1, 2])).toBe(1.5);
      expect(median([4, 1, 3, 2])).toBe(2.5); // unsorted input
    });

    test("should handle negative numbers", () => {
      expect(median([-3, -1, 0, 1, 3])).toBe(0);
      expect(median([-2, -1])).toBe(-1.5);
    });

    test("should throw for empty array", () => {
      expect(() => median([])).toThrow(EmptyArrayError);
    });
  });

  describe("mode", () => {
    test("should find single mode", () => {
      expect(mode([1, 2, 2, 3, 4])).toBe(2);
      expect(mode([1, 1, 1, 2, 3])).toBe(1);
      expect(mode([5])).toBe(5);
    });

    test("should find multiple modes", () => {
      const result = mode([1, 1, 2, 2, 3]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([1, 2]);
    });

    test("should handle all elements equally frequent", () => {
      const result = mode([1, 2, 3, 4, 5]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test("should sort multiple modes", () => {
      const result = mode([3, 1, 3, 1, 2]);
      expect(result).toEqual([1, 3]);
    });

    test("should throw for empty array", () => {
      expect(() => mode([])).toThrow(EmptyArrayError);
    });
  });
});

describe("Measures of Variability", () => {
  describe("variance", () => {
    test("should calculate population variance", () => {
      expect(variance([1, 2, 3, 4, 5])).toBeCloseTo(2, 10);
      expect(variance([0, 0, 0])).toBe(0);
    });

    test("should calculate sample variance with ddof=1", () => {
      expect(variance([1, 2, 3, 4, 5], { ddof: 1 })).toBeCloseTo(2.5, 10);
    });

    test("should handle single element", () => {
      expect(variance([5])).toBe(0);
    });

    test("should throw for empty array", () => {
      expect(() => variance([])).toThrow(EmptyArrayError);
    });

    test("should throw for invalid ddof", () => {
      expect(() => variance([1, 2, 3], { ddof: 3 })).toThrow(InvalidParameterError);
      expect(() => variance([1, 2, 3], { ddof: -1 })).toThrow(InvalidParameterError);
    });
  });

  describe("standardDeviation", () => {
    test("should calculate standard deviation", () => {
      expect(standardDeviation([1, 2, 3, 4, 5])).toBeCloseTo(Math.sqrt(2), 10);
      expect(standardDeviation([0, 0, 0])).toBe(0);
    });

    test("should calculate sample standard deviation", () => {
      expect(standardDeviation([1, 2, 3, 4, 5], { ddof: 1 })).toBeCloseTo(Math.sqrt(2.5), 10);
    });

    test("should handle single element", () => {
      expect(standardDeviation([5])).toBe(0);
    });
  });
});

describe("Percentiles and Quantiles", () => {
  describe("percentile", () => {
    test("should calculate correct percentiles", () => {
      const data = [1, 2, 3, 4, 5];
      expect(percentile(data, 0)).toBe(1);
      expect(percentile(data, 50)).toBe(3);
      expect(percentile(data, 100)).toBe(5);
    });

    test("should handle interpolation", () => {
      const data = [1, 2, 3, 4];
      expect(percentile(data, 25)).toBeCloseTo(1.75, 10);
      expect(percentile(data, 75)).toBeCloseTo(3.25, 10);
    });

    test("should throw for invalid percentile", () => {
      expect(() => percentile([1, 2, 3], -1)).toThrow(InvalidParameterError);
      expect(() => percentile([1, 2, 3], 101)).toThrow(InvalidParameterError);
    });

    test("should throw for empty array", () => {
      expect(() => percentile([], 50)).toThrow(EmptyArrayError);
    });
  });

  describe("quantile", () => {
    test("should calculate correct quantiles", () => {
      const data = [1, 2, 3, 4, 5];
      expect(quantile(data, 0)).toBe(1);
      expect(quantile(data, 0.5)).toBe(3);
      expect(quantile(data, 1)).toBe(5);
    });

    test("should throw for invalid quantile", () => {
      expect(() => quantile([1, 2, 3], -0.1)).toThrow(InvalidParameterError);
      expect(() => quantile([1, 2, 3], 1.1)).toThrow(InvalidParameterError);
    });
  });

  describe("iqr", () => {
    test("should calculate interquartile range", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const iqrValue = iqr(data);
      const q1 = quantile(data, 0.25);
      const q3 = quantile(data, 0.75);
      expect(iqrValue).toBeCloseTo(q3 - q1, 10);
    });
  });
});

describe("Range and Extremes", () => {
  describe("min", () => {
    test("should find minimum value", () => {
      expect(min([3, 1, 4, 1, 5])).toBe(1);
      expect(min([5])).toBe(5);
      expect(min([-1, -5, -2])).toBe(-5);
    });

    test("should throw for empty array", () => {
      expect(() => min([])).toThrow(EmptyArrayError);
    });
  });

  describe("max", () => {
    test("should find maximum value", () => {
      expect(max([3, 1, 4, 1, 5])).toBe(5);
      expect(max([5])).toBe(5);
      expect(max([-1, -5, -2])).toBe(-1);
    });

    test("should throw for empty array", () => {
      expect(() => max([])).toThrow(EmptyArrayError);
    });
  });

  describe("range", () => {
    test("should calculate range", () => {
      expect(range([1, 2, 3, 4, 5])).toBe(4);
      expect(range([5])).toBe(0);
      expect(range([-2, 0, 3])).toBe(5);
    });
  });
});

describe("Distribution Shape Measures", () => {
  describe("skewness", () => {
    test("should calculate skewness for symmetric distribution", () => {
      const symmetric = [1, 2, 3, 4, 5];
      expect(Math.abs(skewness(symmetric))).toBeLessThan(0.1); // approximately 0
    });

    test("should calculate positive skewness for right-skewed distribution", () => {
      const rightSkewed = [1, 1, 1, 2, 3, 4, 5];
      expect(skewness(rightSkewed)).toBeGreaterThan(0);
    });

    test("should throw for insufficient data", () => {
      expect(() => skewness([1, 2])).toThrow(InvalidParameterError);
    });

    test("should throw for zero standard deviation", () => {
      expect(() => skewness([1, 1, 1])).toThrow(MathematicalError);
    });
  });

  describe("kurtosis", () => {
    test("should calculate kurtosis", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const kurt = kurtosis(data);
      expect(typeof kurt).toBe('number');
      expect(Number.isFinite(kurt)).toBe(true);
    });

    test("should throw for insufficient data", () => {
      expect(() => kurtosis([1, 2, 3])).toThrow(InvalidParameterError);
    });

    test("should throw for zero standard deviation", () => {
      expect(() => kurtosis([1, 1, 1, 1])).toThrow(MathematicalError);
    });
  });
});

describe("Correlation and Covariance", () => {
  describe("covariance", () => {
    test("should calculate positive covariance", () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      expect(covariance(x, y)).toBeGreaterThan(0);
    });

    test("should calculate negative covariance", () => {
      const x = [1, 2, 3, 4, 5];
      const y = [5, 4, 3, 2, 1];
      expect(covariance(x, y)).toBeLessThan(0);
    });

    test("should calculate zero covariance for independent variables", () => {
      const x = [1, 2, 3, 4, 5];
      const y = [1, 4, 2, 5, 3]; // no linear relationship
      const cov = covariance(x, y);
      expect(Math.abs(cov)).toBeLessThan(2); // should be relatively small
    });

    test("should throw for arrays of different lengths", () => {
      expect(() => covariance([1, 2, 3], [1, 2])).toThrow(InvalidParameterError);
    });

    test("should throw for empty arrays", () => {
      expect(() => covariance([], [])).toThrow(EmptyArrayError);
    });
  });

  describe("correlation", () => {
    test("should calculate perfect positive correlation", () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      expect(correlation(x, y)).toBeCloseTo(1, 10);
    });

    test("should calculate perfect negative correlation", () => {
      const x = [1, 2, 3, 4, 5];
      const y = [5, 4, 3, 2, 1];
      expect(correlation(x, y)).toBeCloseTo(-1, 10);
    });

    test("should calculate correlation close to zero", () => {
      const x = [1, 2, 3, 4, 5];
      const y = [3, 1, 4, 2, 5]; // weak relationship
      const corr = correlation(x, y);
      expect(corr).toBeGreaterThan(-1);
      expect(corr).toBeLessThan(1);
    });

    test("should throw for zero standard deviation", () => {
      const x = [1, 1, 1];
      const y = [2, 3, 4];
      expect(() => correlation(x, y)).toThrow(MathematicalError);
    });
  });
});

describe("Summary Statistics", () => {
  describe("summary", () => {
    test("should calculate comprehensive summary", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const stats = summary(data);
      
      expect(stats.count).toBe(9);
      expect(stats.mean).toBe(5);
      expect(stats.median).toBe(5);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(9);
      expect(stats.range).toBe(8);
      expect(stats.variance).toBeCloseTo(6.67, 1);
      expect(stats.standardDeviation).toBeCloseTo(2.58, 1);
      expect(stats.q1).toBeCloseTo(3, 1);
      expect(stats.q3).toBeCloseTo(7, 1);
      expect(stats.iqr).toBeCloseTo(4, 1);
      expect(stats.skewness).toBeDefined();
      expect(stats.kurtosis).toBeDefined();
    });

    test("should handle small datasets", () => {
      const data = [1, 2];
      const stats = summary(data);
      
      expect(stats.count).toBe(2);
      expect(stats.mean).toBe(1.5);
      expect(stats.skewness).toBeUndefined(); // not enough data
      expect(stats.kurtosis).toBeUndefined(); // not enough data
    });

    test("should handle constant data", () => {
      const data = [5, 5, 5, 5, 5];
      const stats = summary(data);
      
      expect(stats.mean).toBe(5);
      expect(stats.median).toBe(5);
      expect(stats.variance).toBe(0);
      expect(stats.standardDeviation).toBe(0);
      expect(stats.skewness).toBeUndefined(); // zero std dev
      expect(stats.kurtosis).toBeUndefined(); // zero std dev
    });

    test("should throw for empty array", () => {
      expect(() => summary([])).toThrow(EmptyArrayError);
    });
  });
});

describe("Histogram and Frequency Analysis", () => {
  describe("histogram", () => {
    test("should create histogram with specified number of bins", () => {
      const data = [1, 2, 2, 3, 3, 3, 4];
      const hist = histogram(data, 4);
      
      expect(hist.bins).toHaveLength(5); // n+1 bin edges
      expect(hist.counts).toHaveLength(4); // n bins
      expect(hist.counts.reduce((a, b) => a + b, 0)).toBe(data.length);
    });

    test("should create histogram with custom bin edges", () => {
      const data = [1, 2, 3, 4, 5];
      const binEdges = [0, 2, 4, 6];
      const hist = histogram(data, binEdges);
      
      expect(hist.bins).toEqual(binEdges);
      expect(hist.counts).toHaveLength(3);
      expect(hist.counts.reduce((a, b) => a + b, 0)).toBe(data.length);
    });

    test("should handle edge cases", () => {
      const data = [1, 1, 1];
      const hist = histogram(data, 2);
      
      expect(hist.counts.reduce((a, b) => a + b, 0)).toBe(3);
    });

    test("should throw for invalid bins", () => {
      expect(() => histogram([1, 2, 3], 0)).toThrow(InvalidParameterError);
      expect(() => histogram([1, 2, 3], [1])).toThrow(InvalidParameterError);
    });

    test("should throw for empty array", () => {
      expect(() => histogram([], 5)).toThrow(EmptyArrayError);
    });
  });
});

describe("Edge Cases and Error Handling", () => {
  test("should handle arrays with one element", () => {
    expect(mean([5])).toBe(5);
    expect(median([5])).toBe(5);
    expect(mode([5])).toBe(5);
    expect(variance([5])).toBe(0);
    expect(standardDeviation([5])).toBe(0);
  });

  test("should handle negative numbers", () => {
    const data = [-5, -3, -1, 0, 1, 3, 5];
    expect(mean(data)).toBe(0);
    expect(median(data)).toBe(0);
    expect(min(data)).toBe(-5);
    expect(max(data)).toBe(5);
  });

  test("should handle floating point precision", () => {
    const data = [0.1, 0.2, 0.3];
    expect(mean(data)).toBeCloseTo(0.2, 10);
    expect(variance(data)).toBeCloseTo(0.006666666666666667, 10);
  });

  test("should validate input parameters", () => {
    expect(() => mean("invalid" as any)).toThrow(InvalidParameterError);
    expect(() => median([1, "invalid", 3] as any)).toThrow(InvalidParameterError);
    expect(() => variance([1, 2, 3], { ddof: "invalid" as any })).toThrow(InvalidParameterError);
  });
});

describe("Type Safety", () => {
  test("should work with TypeScript strict mode", () => {
    const data: number[] = [1, 2, 3, 4, 5];
    const meanValue: number = mean(data);
    const stats: ReturnType<typeof summary> = summary(data);
    
    expect(typeof meanValue).toBe('number');
    expect(typeof stats.mean).toBe('number');
    expect(typeof stats.count).toBe('number');
  });

  test("should maintain type safety with return values", () => {
    const data = [1, 2, 2, 3];
    const modeResult = mode(data);
    
    // Mode can return number or number[]
    if (typeof modeResult === 'number') {
      expect(typeof modeResult).toBe('number');
    } else {
      expect(Array.isArray(modeResult)).toBe(true);
      expect(modeResult.every(x => typeof x === 'number')).toBe(true);
    }
  });
});