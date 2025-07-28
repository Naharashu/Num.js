/**
 * Mathematical constants for Num.js TypeScript migration
 * Provides comprehensive collection of mathematical constants with proper TypeScript typing
 */

// ============================================================================
// Standard Mathematical Constants (from JavaScript Math object)
// ============================================================================

/**
 * Euler's number (e) - the base of natural logarithms
 * Approximately 2.718281828459045
 */
export const E = Math.E;

/**
 * Natural logarithm of 2
 * Approximately 0.6931471805599453
 */
export const LN2 = Math.LN2;

/**
 * Natural logarithm of 10
 * Approximately 2.302585092994046
 */
export const LN10 = Math.LN10;

/**
 * Base-2 logarithm of E
 * Approximately 1.4426950408889634
 */
export const LOG2E = Math.LOG2E;

/**
 * Base-10 logarithm of E
 * Approximately 0.4342944819032518
 */
export const LOG10E = Math.LOG10E;

/**
 * Pi (π) - the ratio of a circle's circumference to its diameter
 * Approximately 3.141592653589793
 */
export const PI = Math.PI;

/**
 * Square root of 1/2
 * Approximately 0.7071067811865476
 */
export const SQRT1_2 = Math.SQRT1_2;

/**
 * Square root of 2
 * Approximately 1.4142135623730951
 */
export const SQRT2 = Math.SQRT2;

// ============================================================================
// Extended Mathematical Constants
// ============================================================================

/**
 * Euler's number (e) with higher precision
 * The base of natural logarithms, limit of (1 + 1/n)^n as n approaches infinity
 */
export const EULER = 2.7182818284590452354 as const;

/**
 * Pi (π) with higher precision
 * The ratio of a circle's circumference to its diameter
 */
export const PI_HIGH_PRECISION = 3.1415926535897932384626433832795 as const;

/**
 * Tau (τ) = 2π
 * The ratio of a circle's circumference to its radius
 */
export const TAU = 2 * Math.PI;

/**
 * Pi divided by 2 (π/2)
 * 90 degrees in radians
 */
export const PI_2 = Math.PI / 2;

/**
 * Pi divided by 4 (π/4)
 * 45 degrees in radians
 */
export const PI_4 = Math.PI / 4;

/**
 * 2 divided by Pi (2/π)
 * Useful in various mathematical calculations
 */
export const TWO_PI = 2 / Math.PI;

/**
 * 2 divided by square root of Pi (2/√π)
 * Used in probability and statistics
 */
export const TWO_SQRTPI = 2 / Math.sqrt(Math.PI);

// ============================================================================
// Special Mathematical Constants
// ============================================================================

/**
 * Golden ratio (φ) - (1 + √5) / 2
 * Approximately 1.618033988749895
 * The ratio such that (a+b)/a = a/b = φ
 */
export const PHI = (1 + Math.sqrt(5)) / 2;

/**
 * Euler-Mascheroni constant (γ)
 * Approximately 0.5772156649015329
 * The limiting difference between the harmonic series and natural logarithm
 */
export const EULER_MASCHERONI = 0.57721566490153286060651209008240243104215933593992 as const;

/**
 * Catalan's constant (G)
 * Approximately 0.9159655941772190
 * Defined as the alternating sum 1 - 1/9 + 1/25 - 1/49 + ...
 */
export const CATALAN = 0.9159655941772190150546035149323841107741493742816721342664981196217630197762547694793565129261151062485744226 as const;

/**
 * Apéry's constant (ζ(3))
 * Approximately 1.2020569031595943
 * The value of the Riemann zeta function at s = 3
 */
export const APERY = 1.2020569031595942853997381615114499907649862923404988817922715553418382057863130901864558736093352581461991577 as const;

/**
 * Khinchin's constant (K₀)
 * Approximately 2.6854520010653064
 * The geometric mean of the coefficients in continued fraction expansions of most real numbers
 */
export const KHINCHIN = 2.6854520010653064453097148354817956938203822939944629530511523455572188595371520028011411749318476979077280 as const;

/**
 * Plastic constant (ρ)
 * Approximately 1.3247179572447460
 * The real root of x³ = x + 1
 */
export const PLASTIC = 1.3247179572447460259609088544780973407344040569017333645066213289168166442781953186456308401563659094 as const;

/**
 * Glaisher-Kinkelin constant (A)
 * Approximately 1.2824271291006226
 * Related to the asymptotic behavior of the Barnes G-function
 */
export const GLAISHER_KINKELIN = 1.2824271291006226368753425688697917277676889273250011920637400217404063088588264611297364877026887 as const;

/**
 * Conway's constant (λ)
 * Approximately 1.3035772690342963
 * The invariant growth rate of all derived strings similar to the look-and-say sequence
 */
export const CONWAY = 1.3035772690342963912570991121525518907307025046594478910620080822651750692244531128 as const;

/**
 * Mills' constant (θ)
 * Approximately 1.3063778838630806
 * The smallest positive number such that floor(θ^(3^n)) is prime for all n ≥ 1
 */
export const MILLS = 1.3063778838630806904686144926026057129167846441544571917137037 as const;

// ============================================================================
// Physical and Universal Constants (Dimensionless)
// ============================================================================

/**
 * Fine structure constant (α)
 * Approximately 0.0072973525693
 * A fundamental physical constant characterizing the strength of electromagnetic interaction
 */
export const FINE_STRUCTURE = 0.0072973525693 as const;

/**
 * Feigenbaum constant δ
 * Approximately 4.669201609102990
 * Universal constant for period-doubling bifurcations
 */
export const FEIGENBAUM_DELTA = 4.669201609102990671853203820466201617258185577475768632745651343004134330211314737138 as const;

/**
 * Feigenbaum constant α
 * Approximately 2.502907875095892
 * Universal constant for period-doubling bifurcations
 */
export const FEIGENBAUM_ALPHA = 2.502907875095892822283902873218215786381271376727149977336192444021970807051263289 as const;

// ============================================================================
// Computational Constants
// ============================================================================

/**
 * Machine epsilon for double precision floating point
 * The smallest positive number such that 1 + ε ≠ 1
 */
export const EPSILON = Number.EPSILON;

/**
 * Maximum safe integer in JavaScript
 * 2^53 - 1 = 9007199254740991
 */
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * Minimum safe integer in JavaScript
 * -(2^53 - 1) = -9007199254740991
 */
export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;

/**
 * Maximum finite number representable in JavaScript
 * Approximately 1.7976931348623157e+308
 */
export const MAX_VALUE = Number.MAX_VALUE;

/**
 * Smallest positive normalized number representable in JavaScript
 * Approximately 2.2250738585072014e-308
 */
export const MIN_VALUE = Number.MIN_VALUE;

/**
 * Positive infinity
 */
export const POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

/**
 * Negative infinity
 */
export const NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;

// ============================================================================
// Angle Conversion Constants
// ============================================================================

/**
 * Degrees to radians conversion factor (π/180)
 * Multiply degrees by this to get radians
 */
export const DEG_TO_RAD = Math.PI / 180;

/**
 * Radians to degrees conversion factor (180/π)
 * Multiply radians by this to get degrees
 */
export const RAD_TO_DEG = 180 / Math.PI;

// ============================================================================
// Logarithmic Constants
// ============================================================================

/**
 * Natural logarithm of π
 * Approximately 1.1447298858494002
 */
export const LN_PI = Math.log(Math.PI);

/**
 * Natural logarithm of 2π
 * Approximately 1.8378770664093453
 */
export const LN_2PI = Math.log(2 * Math.PI);

/**
 * Natural logarithm of √(2π)
 * Approximately 0.9189385332046727
 */
export const LN_SQRT_2PI = Math.log(Math.sqrt(2 * Math.PI));

/**
 * Base-10 logarithm of 2
 * Approximately 0.3010299956639812
 */
export const LOG10_2 = Math.log10(2);

/**
 * Base-10 logarithm of π
 * Approximately 0.4971498726941338
 */
export const LOG10_PI = Math.log10(Math.PI);

// ============================================================================
// Square Root Constants
// ============================================================================

/**
 * Square root of 3
 * Approximately 1.7320508075688772
 */
export const SQRT3 = Math.sqrt(3);

/**
 * Square root of 5
 * Approximately 2.23606797749979
 */
export const SQRT5 = Math.sqrt(5);

/**
 * Square root of π
 * Approximately 1.7724538509055159
 */
export const SQRT_PI = Math.sqrt(Math.PI);

/**
 * Square root of 2π
 * Approximately 2.5066282746310005
 */
export const SQRT_2PI = Math.sqrt(2 * Math.PI);

/**
 * 1 divided by square root of 2π
 * Approximately 0.3989422804014327
 * Used in normal distribution calculations
 */
export const INV_SQRT_2PI = 1 / Math.sqrt(2 * Math.PI);

// ============================================================================
// Comprehensive Constants Object
// ============================================================================

/**
 * Comprehensive collection of all mathematical constants
 * Organized by category for easy access
 */
export const MATH_CONSTANTS = {
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
} as const;

// ============================================================================
// Legacy Aliases for Backward Compatibility
// ============================================================================

/**
 * @deprecated Use EULER instead
 * Legacy alias for Euler's number
 */
export const e = EULER;

/**
 * @deprecated Use PI instead  
 * Legacy alias for Pi
 */
export const pi = PI;

/**
 * @deprecated Use EULER_MASCHERONI instead
 * Legacy alias for Euler-Mascheroni constant
 */
export const y = EULER_MASCHERONI;

/**
 * @deprecated Use PHI instead
 * Legacy alias for golden ratio
 */
export const phi = PHI;

/**
 * @deprecated Use KHINCHIN instead
 * Legacy alias for Khinchin's constant
 */
export const kninchin = KHINCHIN;

/**
 * @deprecated Use PLASTIC instead
 * Legacy alias for plastic constant
 */
export const plactic = PLASTIC;

/**
 * @deprecated Use APERY instead
 * Legacy alias for Apéry's constant
 */
export const apery = APERY;

/**
 * @deprecated Use CATALAN instead
 * Legacy alias for Catalan's constant
 */
export const catalan = CATALAN;

// ============================================================================
// Utility Functions for Constants
// ============================================================================

/**
 * Check if a number is approximately equal to a mathematical constant
 * @param value - The value to check
 * @param constant - The constant to compare against
 * @param tolerance - The tolerance for comparison (default: EPSILON)
 * @returns True if the value is approximately equal to the constant
 * 
 * @example
 * isApproximatelyEqual(22/7, PI, 0.01) // true
 * isApproximatelyEqual(1.618, PHI, 0.01) // true
 */
export function isApproximatelyEqual(
  value: number, 
  constant: number, 
  tolerance: number = EPSILON
): boolean {
  return Math.abs(value - constant) <= tolerance;
}

/**
 * Get the name of a mathematical constant if the value matches
 * @param value - The value to identify
 * @param tolerance - The tolerance for comparison (default: 1e-10)
 * @returns The name of the constant or null if no match found
 * 
 * @example
 * getConstantName(3.14159) // "PI"
 * getConstantName(2.71828) // "E"
 * getConstantName(1.61803) // "PHI"
 */
export function getConstantName(value: number, tolerance: number = 1e-10): string | null {
  const constants = [
    { name: 'E', value: E },
    { name: 'PI', value: PI },
    { name: 'PHI', value: PHI },
    { name: 'EULER_MASCHERONI', value: EULER_MASCHERONI },
    { name: 'CATALAN', value: CATALAN },
    { name: 'APERY', value: APERY },
    { name: 'KHINCHIN', value: KHINCHIN },
    { name: 'PLASTIC', value: PLASTIC },
    { name: 'SQRT2', value: SQRT2 },
    { name: 'SQRT3', value: SQRT3 },
    { name: 'SQRT5', value: SQRT5 },
    { name: 'TAU', value: TAU },
  ];
  
  for (const constant of constants) {
    if (isApproximatelyEqual(value, constant.value, tolerance)) {
      return constant.name;
    }
  }
  
  return null;
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 * 
 * @example
 * degreesToRadians(180) // PI
 * degreesToRadians(90) // PI_2
 */
export function degreesToRadians(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

/**
 * Convert radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 * 
 * @example
 * radiansToDegrees(PI) // 180
 * radiansToDegrees(PI_2) // 90
 */
export function radiansToDegrees(radians: number): number {
  return radians * RAD_TO_DEG;
}