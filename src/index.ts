/**
 * Num.js - A comprehensive mathematical library for JavaScript/TypeScript
 * 
 * This is the main entry point that exports all functionality from the library.
 * Provides both named exports and a default namespace export for flexibility.
 * 
 * @version 1.4.0
 * @author Num.js Contributors
 * @license MIT
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  Numeric,
  NumericArray,
  NumericMatrix,
  Numeric3D,
  Shape,
  Axis,
  Dimensions,
  StatisticalOptions,
  ComparisonOptions,
  ComplexNumber
} from './types/common.js';



export {
  MathematicalError,
  DimensionError,
  SingularMatrixError,
  InvalidParameterError
} from './types/errors.js';

// ============================================================================
// Core Mathematical Functions
// ============================================================================

export {
  range,
  root,
  factorial,
  fibonacci,
  sigmoid,
  softmax,
  lineFunc,
  quadraticFunc,
  cubicFunc,
  isOdd,
  isEven,
  isPrime,
  factorize,
  reFactorial,
  logWithBase,
  cth,
  sech,
  csch,
  riemann_zeta,
  gamma,
  beta,
  lambert,
  gauss,
  Farmi,
  gabor,
  ackermann,
  boltzmann,
  logisticMap,
  crazyTrig,
  poldan,
  supreme_poldan,
  broadcast,
  softplus,
  softsign,
  gaussian,
  sawtooth,
  carcas,
  carcasRevarn,
  carcasVoid,
  carcasVoidless,
  multyCarcas,
  multyCarcasRevarn
} from './core/basic-math.js';

export {
  MATH_CONSTANTS
} from './core/constants.js';

// Universal Functions (ufuncs)
export {
  // Mathematical ufuncs
  abs,
  sqrt,
  cbrt,
  exp,
  exp2,
  expm1,
  log,
  log2,
  log10,
  log1p,
  sign,
  ceil,
  floor,
  round,
  trunc,
  // Trigonometric ufuncs
  sin,
  cos,
  tan,
  asin,
  acos,
  atan,
  atan2,
  // Hyperbolic ufuncs
  sinh,
  cosh,
  tanh,
  asinh,
  acosh,
  atanh,
  // Binary arithmetic ufuncs
  add,
  subtract,
  multiply,
  divide,
  floorDivide,
  mod,
  power,
  minimum,
  maximum,
  // Comparison ufuncs
  equal,
  notEqual,
  less,
  lessEqual,
  greater,
  greaterEqual,
  // Logical ufuncs
  logicalNot,
  logicalAnd,
  logicalOr,
  logicalXor,
  // Activation function ufuncs
  sigmoid as ufuncSigmoid,
  relu as ufuncRelu,
  leakyRelu as ufuncLeakyRelu,
  softplus as ufuncSoftplus,
  softsign as ufuncSoftsign,
  // Boolean reduction functions
  any,
  all,
  // Utility functions
  toBooleanArray,
  countNonzero,
  nonzero,
  where,
  // Ufunc creation utilities
  createUnaryUfunc,
  createBinaryUfunc,
  applyUnary,
  applyBinary,
  isUfunc
} from './core/ufuncs.js';

export {
  getShape,
  getDimensions,
  isFiniteNumber,
  isNumericArray,
  isShape
} from './core/utilities.js';

// ============================================================================
// Performance and Optimization
// ============================================================================

export {
  benchmark,
  compareBenchmarks,
  benchmarkArithmetic,
  benchmarkFactoryFunctions,
  printBenchmarkResults
} from './core/performance.js';

export type { BenchmarkResult } from './core/performance.js';

export {
  lazy,
  LazyNDArray
} from './core/lazy.js';

export type { LazyOperation } from './core/lazy.js';



export {
  mean,
  median,
  mode,
  standardDeviation,
  variance,
  percentile,
  quantile,
  iqr,
  min,
  max,
  range as statisticalRange,
  correlation,
  covariance,
  correlationMatrix,
  covarianceMatrix,
  histogram,
  skewness,
  kurtosis,
  geometricMean,
  harmonicMean,
  trimmedMean,
  medianAbsoluteDeviation,
  rootMeanSquare,
  summary,
  percentiles,
  quantiles,
  coefficientOfVariation,
  jarqueBeraTest,
  andersonDarlingTest
} from './core/statistics.js';



// ============================================================================
// N-Dimensional Array (NumPy-like)
// ============================================================================

export { NDArray } from './ndarray/ndarray.js';
export type { DType, NDArrayOptions } from './ndarray/ndarray.js';

// NDArray factory functions
export {
  zeros,
  ones,
  full,
  eye,
  arange,
  linspace,
  fromArray,
  random as ndarrayRandom
} from './ndarray/factory.js';

// ============================================================================
// Linear Algebra Functions
// ============================================================================

export {
  det,
  inv,
  inverse,
  rank,
  trace,
  norm,
  solve,
  isPositiveDefinite,
  isSymmetric
} from './linalg/linalg.js';

// ============================================================================
// Random Number Generation
// ============================================================================

export {
  randin,
  random,
  randint,
  randomArray,
  uniform,
  randintArray,
  normal,
  exponential,
  gamma as randomGamma,
  beta as randomBeta,
  binomial,
  poisson,
  choice,
  shuffle,
  permutation,
  seed,
  getState,
  randomBytes
} from './random/random.js';

// ============================================================================
// Specialized Data Types
// ============================================================================

export {
  Int128,
  fromNumber as int128FromNumber,
  fromString as int128FromString,
  INT128_ZERO,
  INT128_ONE,
  INT128_MAX,
  INT128_MIN
} from './core/int128.js';

// ============================================================================
// Neural Network Functions
// ============================================================================

export type {
  ActivationFunction,
  ActivationArrayFunction,
  DerivativeFunction
} from './neural/activations.js';

export {
  relu,
  reluDerivative,
  sigmoid as neuralSigmoid,
  sigmoidDerivative,
  tanhDerivative,
  leakyRelu,
  leakyReluDerivative,
  elu,
  eluDerivative,
  selu,
  swish,
  silu,
  gelu,
  mish,
  hardSwish,
  squarePlus,
  softmax as neuralSoftmax,
  logSoftmax,
  applyActivation,
  getActivationFunction,
  getDerivativeFunction,
  randomWeights,
  forecast,
  normalize
} from './neural/activations.js';

export type {
  LossFunction,
  GradientFunction
} from './neural/losses.js';

export {
  mse,
  mseGradient,
  mae,
  huberLoss,
  bce,
  bceGradient,
  cce,
  sparseCce,
  focalLoss,
  klDivergence,
  getLossFunction,
  getGradientFunction
} from './neural/losses.js';

export type {
  SGDParams,
  AdamParams,
  RMSpropParams,
  AdaGradParams,
  OptimizerState
} from './neural/optimizers.js';

export {
  sgd,
  adam,
  rmsprop,
  adagrad
} from './neural/optimizers.js';

export {
  l1Regularization,
  l1RegularizationGradient,
  l2Regularization,
  l2RegularizationGradient,
  l3Regularization,
  l3RegularizationGradient,
  elasticNetRegularization,
  elasticNetRegularizationGradient,
  dropout,
  invertedDropout,
  batchNormalization,
  layerNormalization,
  applyWeightDecay,
  softDropout,
  lineDropout,
  crazyDropout
} from './neural/regularization.js';

// ============================================================================
// Default Namespace Export
// ============================================================================

import * as core from './core/basic-math.js';
import * as constants from './core/constants.js';
import * as utilities from './core/utilities.js';
import * as statistics from './core/statistics.js';
import * as ufuncs from './core/ufuncs.js';

import { NDArray } from './ndarray/ndarray.js';
import * as factory from './ndarray/factory.js';
import * as linalg from './linalg/linalg.js';
import * as random from './random/random.js';
import * as activations from './neural/activations.js';
import * as losses from './neural/losses.js';
import * as optimizers from './neural/optimizers.js';
import * as regularization from './neural/regularization.js';
import * as errors from './types/errors.js';
import * as performance from './core/performance.js';
import * as lazy from './core/lazy.js';

/**
 * Default namespace export containing all library functionality
 * Useful for importing the entire library as a single object
 * 
 * @example
 * ```typescript
 * import Num from 'num.js';
 * 
 * const data = [1, 2, 3, 4, 5];
 * const avg = Num.mean(data);
 * const matrix = new Num.NDArray([[1, 2], [3, 4]], [2, 2]);
 * const det = Num.linalg.det(matrix);
 * const randomData = Num.random.normal([10], 0, 1);
 * ```
 */
const Num = {
  // Error classes
  ...errors,

  // Core functions
  ...core,
  ...constants,
  ...utilities,
  ...statistics,
  
  // Universal functions
  ufuncs,



  // N-dimensional array
  NDArray,

  // NDArray factory functions
  ndarray: {
    ...factory,
    NDArray
  },

  // Linear algebra functions
  linalg,

  // Random number generation
  random,

  // Neural network functions
  neural: {
    activations,
    losses,
    optimizers,
    regularization
  },

  // Performance utilities
  performance,
  lazy
};

export default Num;

// ============================================================================
// Library Metadata
// ============================================================================

/** Library version information */
export const VERSION = '2.0.0';

/** Library name */
export const LIBRARY_NAME = 'Num.js';

/** Library description */
export const DESCRIPTION = 'A comprehensive mathematical library for JavaScript/TypeScript';