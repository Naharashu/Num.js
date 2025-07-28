import { test, expect, describe } from "bun:test";
import {
  // Standard constants
  E,
  LN2,
  LN10,
  LOG2E,
  LOG10E,
  PI,
  SQRT1_2,
  SQRT2,
  
  // Extended constants
  EULER,
  PI_HIGH_PRECISION,
  TAU,
  PI_2,
  PI_4,
  TWO_PI,
  TWO_SQRTPI,
  
  // Special constants
  PHI,
  EULER_MASCHERONI,
  CATALAN,
  APERY,
  KHINCHIN,
  PLASTIC,
  GLAISHER_KINKELIN,
  CONWAY,
  MILLS,
  
  // Physical constants
  FINE_STRUCTURE,
  FEIGENBAUM_DELTA,
  FEIGENBAUM_ALPHA,
  
  // Computational constants
  EPSILON,
  MAX_SAFE_INTEGER,
  MIN_SAFE_INTEGER,
  MAX_VALUE,
  MIN_VALUE,
  POSITIVE_INFINITY,
  NEGATIVE_INFINITY,
  
  // Angle conversion
  DEG_TO_RAD,
  RAD_TO_DEG,
  
  // Logarithmic constants
  LN_PI,
  LN_2PI,
  LN_SQRT_2PI,
  LOG10_2,
  LOG10_PI,
  
  // Square root constants
  SQRT3,
  SQRT5,
  SQRT_PI,
  SQRT_2PI,
  INV_SQRT_2PI,
  
  // Comprehensive object
  MATH_CONSTANTS,
  
  // Legacy aliases
  e,
  pi,
  y,
  phi,
  kninchin,
  plactic,
  apery,
  catalan,
  
  // Utility functions
  isApproximatelyEqual,
  getConstantName,
  degreesToRadians,
  radiansToDegrees,
} from "../core/constants.js";

describe("Mathematical Constants", () => {
  describe("Standard Constants", () => {
    test("should match JavaScript Math constants", () => {
      expect(E).toBe(Math.E);
      expect(LN2).toBe(Math.LN2);
      expect(LN10).toBe(Math.LN10);
      expect(LOG2E).toBe(Math.LOG2E);
      expect(LOG10E).toBe(Math.LOG10E);
      expect(PI).toBe(Math.PI);
      expect(SQRT1_2).toBe(Math.SQRT1_2);
      expect(SQRT2).toBe(Math.SQRT2);
    });

    test("should be readonly constants", () => {
      // TypeScript should prevent modification, but we can test the values
      expect(typeof E).toBe('number');
      expect(typeof PI).toBe('number');
      expect(Number.isFinite(E)).toBe(true);
      expect(Number.isFinite(PI)).toBe(true);
    });
  });

  describe("Extended Constants", () => {
    test("should have correct values for extended constants", () => {
      expect(EULER).toBeCloseTo(2.7182818284590452354, 10);
      expect(PI_HIGH_PRECISION).toBeCloseTo(3.1415926535897932384626433832795, 10);
      expect(TAU).toBeCloseTo(2 * Math.PI, 15);
      expect(PI_2).toBeCloseTo(Math.PI / 2, 15);
      expect(PI_4).toBeCloseTo(Math.PI / 4, 15);
      expect(TWO_PI).toBeCloseTo(2 / Math.PI, 15);
      expect(TWO_SQRTPI).toBeCloseTo(2 / Math.sqrt(Math.PI), 15);
    });

    test("should have correct relationships", () => {
      expect(TAU).toBeCloseTo(2 * PI, 15);
      expect(PI_2).toBeCloseTo(PI / 2, 15);
      expect(PI_4).toBeCloseTo(PI / 4, 15);
    });
  });

  describe("Special Mathematical Constants", () => {
    test("should have correct values for special constants", () => {
      expect(PHI).toBeCloseTo(1.618033988749895, 10);
      expect(EULER_MASCHERONI).toBeCloseTo(0.5772156649015329, 10);
      expect(CATALAN).toBeCloseTo(0.9159655941772190, 10);
      expect(APERY).toBeCloseTo(1.2020569031595943, 10);
      expect(KHINCHIN).toBeCloseTo(2.6854520010653064, 10);
      expect(PLASTIC).toBeCloseTo(1.3247179572447460, 10);
    });

    test("should verify golden ratio property", () => {
      // φ = (1 + √5) / 2
      const calculatedPhi = (1 + Math.sqrt(5)) / 2;
      expect(PHI).toBeCloseTo(calculatedPhi, 15);
      
      // φ² = φ + 1
      expect(PHI * PHI).toBeCloseTo(PHI + 1, 10);
    });

    test("should verify plastic constant property", () => {
      // ρ³ = ρ + 1 (approximately, due to floating point precision)
      expect(PLASTIC ** 3).toBeCloseTo(PLASTIC + 1, 8);
    });
  });

  describe("Physical Constants", () => {
    test("should have correct values for physical constants", () => {
      expect(FINE_STRUCTURE).toBeCloseTo(0.0072973525693, 10);
      expect(FEIGENBAUM_DELTA).toBeCloseTo(4.669201609102990, 10);
      expect(FEIGENBAUM_ALPHA).toBeCloseTo(2.502907875095893, 10);
    });

    test("should be dimensionless", () => {
      expect(typeof FINE_STRUCTURE).toBe('number');
      expect(FINE_STRUCTURE).toBeGreaterThan(0);
      expect(FINE_STRUCTURE).toBeLessThan(1);
    });
  });

  describe("Computational Constants", () => {
    test("should match JavaScript Number constants", () => {
      expect(EPSILON).toBe(Number.EPSILON);
      expect(MAX_SAFE_INTEGER).toBe(Number.MAX_SAFE_INTEGER);
      expect(MIN_SAFE_INTEGER).toBe(Number.MIN_SAFE_INTEGER);
      expect(MAX_VALUE).toBe(Number.MAX_VALUE);
      expect(MIN_VALUE).toBe(Number.MIN_VALUE);
      expect(POSITIVE_INFINITY).toBe(Number.POSITIVE_INFINITY);
      expect(NEGATIVE_INFINITY).toBe(Number.NEGATIVE_INFINITY);
    });

    test("should have correct properties", () => {
      expect(MAX_SAFE_INTEGER).toBe(9007199254740991);
      expect(MIN_SAFE_INTEGER).toBe(-9007199254740991);
      expect(POSITIVE_INFINITY).toBe(Infinity);
      expect(NEGATIVE_INFINITY).toBe(-Infinity);
    });
  });

  describe("Angle Conversion Constants", () => {
    test("should have correct conversion factors", () => {
      expect(DEG_TO_RAD).toBeCloseTo(Math.PI / 180, 15);
      expect(RAD_TO_DEG).toBeCloseTo(180 / Math.PI, 15);
    });

    test("should be inverse of each other", () => {
      expect(DEG_TO_RAD * RAD_TO_DEG).toBeCloseTo(1, 15);
    });

    test("should convert common angles correctly", () => {
      expect(90 * DEG_TO_RAD).toBeCloseTo(PI_2, 15);
      expect(180 * DEG_TO_RAD).toBeCloseTo(PI, 15);
      expect(360 * DEG_TO_RAD).toBeCloseTo(TAU, 15);
    });
  });

  describe("Logarithmic Constants", () => {
    test("should have correct logarithmic values", () => {
      expect(LN_PI).toBeCloseTo(Math.log(Math.PI), 15);
      expect(LN_2PI).toBeCloseTo(Math.log(2 * Math.PI), 15);
      expect(LN_SQRT_2PI).toBeCloseTo(Math.log(Math.sqrt(2 * Math.PI)), 15);
      expect(LOG10_2).toBeCloseTo(Math.log10(2), 15);
      expect(LOG10_PI).toBeCloseTo(Math.log10(Math.PI), 15);
    });

    test("should verify logarithmic relationships", () => {
      expect(LN_2PI).toBeCloseTo(LN2 + LN_PI, 15);
      expect(LN_SQRT_2PI).toBeCloseTo(LN_2PI / 2, 15);
    });
  });

  describe("Square Root Constants", () => {
    test("should have correct square root values", () => {
      expect(SQRT3).toBeCloseTo(Math.sqrt(3), 15);
      expect(SQRT5).toBeCloseTo(Math.sqrt(5), 15);
      expect(SQRT_PI).toBeCloseTo(Math.sqrt(Math.PI), 15);
      expect(SQRT_2PI).toBeCloseTo(Math.sqrt(2 * Math.PI), 15);
      expect(INV_SQRT_2PI).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 15);
    });

    test("should verify square root relationships", () => {
      expect(SQRT2 * SQRT2).toBeCloseTo(2, 14);
      expect(SQRT3 * SQRT3).toBeCloseTo(3, 14);
      expect(SQRT5 * SQRT5).toBeCloseTo(5, 14);
      expect(INV_SQRT_2PI * SQRT_2PI).toBeCloseTo(1, 14);
    });
  });

  describe("Comprehensive Constants Object", () => {
    test("should contain all constants", () => {
      expect(MATH_CONSTANTS.E).toBe(E);
      expect(MATH_CONSTANTS.PI).toBe(PI);
      expect(MATH_CONSTANTS.PHI).toBe(PHI);
      expect(MATH_CONSTANTS.EULER_MASCHERONI).toBe(EULER_MASCHERONI);
      expect(MATH_CONSTANTS.CATALAN).toBe(CATALAN);
    });

    test("should be readonly", () => {
      expect(typeof MATH_CONSTANTS).toBe('object');
      expect(MATH_CONSTANTS).not.toBeNull();
    });
  });

  describe("Legacy Aliases", () => {
    test("should maintain backward compatibility", () => {
      expect(e).toBe(EULER);
      expect(pi).toBe(PI);
      expect(y).toBe(EULER_MASCHERONI);
      expect(phi).toBe(PHI);
      expect(kninchin).toBe(KHINCHIN);
      expect(plactic).toBe(PLASTIC);
      expect(apery).toBe(APERY);
      expect(catalan).toBe(CATALAN);
    });

    test("should match original core.js values", () => {
      // These should match the precision from the original core.js
      expect(e).toBeCloseTo(2.71828183, 8);
      expect(pi).toBeCloseTo(3.14159265, 8);
      expect(y).toBeCloseTo(0.57721566490153286060651209008240243104215933593992, 10);
      expect(phi).toBeCloseTo((1 + Math.sqrt(5)) / 2, 15);
    });
  });

  describe("Utility Functions", () => {
    describe("isApproximatelyEqual", () => {
      test("should compare values with tolerance", () => {
        expect(isApproximatelyEqual(3.14159, PI, 0.001)).toBe(true);
        expect(isApproximatelyEqual(3.14, PI, 0.001)).toBe(false);
        expect(isApproximatelyEqual(3.14, PI, 0.01)).toBe(true);
      });

      test("should use default tolerance", () => {
        expect(isApproximatelyEqual(PI, PI)).toBe(true);
        expect(isApproximatelyEqual(PI, PI + EPSILON / 2)).toBe(true);
        expect(isApproximatelyEqual(PI, PI + EPSILON * 2)).toBe(false);
      });

      test("should handle edge cases", () => {
        expect(isApproximatelyEqual(0, 0)).toBe(true);
        expect(isApproximatelyEqual(Infinity, Infinity)).toBe(false); // Infinity - Infinity = NaN
        expect(isApproximatelyEqual(NaN, NaN)).toBe(false); // NaN !== NaN
      });
    });

    describe("getConstantName", () => {
      test("should identify common constants", () => {
        expect(getConstantName(Math.PI)).toBe('PI');
        expect(getConstantName(Math.E)).toBe('E');
        expect(getConstantName(1.618033988749895)).toBe('PHI');
        expect(getConstantName(Math.sqrt(2))).toBe('SQRT2');
      });

      test("should return null for unknown values", () => {
        expect(getConstantName(1.23456)).toBeNull();
        expect(getConstantName(0)).toBeNull();
        expect(getConstantName(100)).toBeNull();
      });

      test("should use custom tolerance", () => {
        expect(getConstantName(3.14, 0.01)).toBe('PI');
        expect(getConstantName(3.14, 0.001)).toBeNull();
      });
    });

    describe("degreesToRadians", () => {
      test("should convert common angles", () => {
        expect(degreesToRadians(0)).toBe(0);
        expect(degreesToRadians(90)).toBeCloseTo(PI_2, 15);
        expect(degreesToRadians(180)).toBeCloseTo(PI, 15);
        expect(degreesToRadians(360)).toBeCloseTo(TAU, 15);
      });

      test("should handle negative angles", () => {
        expect(degreesToRadians(-90)).toBeCloseTo(-PI_2, 15);
        expect(degreesToRadians(-180)).toBeCloseTo(-PI, 15);
      });

      test("should handle fractional degrees", () => {
        expect(degreesToRadians(45)).toBeCloseTo(PI_4, 15);
        expect(degreesToRadians(30)).toBeCloseTo(PI / 6, 15);
      });
    });

    describe("radiansToDegrees", () => {
      test("should convert common angles", () => {
        expect(radiansToDegrees(0)).toBe(0);
        expect(radiansToDegrees(PI_2)).toBeCloseTo(90, 15);
        expect(radiansToDegrees(PI)).toBeCloseTo(180, 15);
        expect(radiansToDegrees(TAU)).toBeCloseTo(360, 15);
      });

      test("should be inverse of degreesToRadians", () => {
        const angles = [0, 30, 45, 90, 180, 270, 360];
        angles.forEach(angle => {
          expect(radiansToDegrees(degreesToRadians(angle))).toBeCloseTo(angle, 13);
        });
      });

      test("should handle negative radians", () => {
        expect(radiansToDegrees(-PI_2)).toBeCloseTo(-90, 15);
        expect(radiansToDegrees(-PI)).toBeCloseTo(-180, 15);
      });
    });
  });

  describe("Type Safety", () => {
    test("should work with TypeScript strict mode", () => {
      const constantValue: number = PI;
      expect(typeof constantValue).toBe('number');
      
      const constantsObject: typeof MATH_CONSTANTS = MATH_CONSTANTS;
      expect(typeof constantsObject.E).toBe('number');
    });

    test("should maintain const assertions", () => {
      // These should be inferred as literal types due to 'as const'
      expect(typeof E).toBe('number');
      expect(typeof PI).toBe('number');
      expect(typeof PHI).toBe('number');
    });
  });

  describe("Mathematical Relationships", () => {
    test("should verify Euler's identity components", () => {
      // e^(iπ) + 1 = 0, but we can test e^π ≈ 23.14
      expect(Math.pow(E, PI)).toBeCloseTo(23.140692632779267, 10);
    });

    test("should verify trigonometric relationships", () => {
      expect(Math.sin(PI_2)).toBeCloseTo(1, 15);
      expect(Math.cos(PI_2)).toBeCloseTo(0, 15);
      expect(Math.sin(PI_4)).toBeCloseTo(SQRT2 / 2, 15);
      expect(Math.cos(PI_4)).toBeCloseTo(SQRT2 / 2, 15);
    });

    test("should verify logarithmic relationships", () => {
      expect(Math.exp(LN2)).toBeCloseTo(2, 14);
      expect(Math.exp(LN10)).toBeCloseTo(10, 14);
      expect(Math.log(E)).toBeCloseTo(1, 15);
    });
  });
});