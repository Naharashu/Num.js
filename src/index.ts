/**
 * Num.js - A comprehensive mathematical library for JavaScript/TypeScript
 * 
 * This is the main entry point that exports all functionality from the library.
 * Provides both named exports and a default namespace export for flexibility.
 * 
 * @version 2.0.0
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

export type {
  MatrixLike,
  MatrixOperations,
  Array3dLike
} from './types/matrix.js';

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
  randin,
  randint,
  random,
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
  sinh,
  cosh,
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

export {
  getShape,
  getDimensions,
  hasSameShape,
  isBroadcastable,
  getBroadcastShape,
  flatten,
  reshape,
  transpose,
  zeros,
  ones,
  full,
  eye,
  allEqual,
  unique,
  countUnique,
  isFiniteNumber,
  isNumericArray,
  isShape,
  isMatrixLike,
  isArray3dLike
} from './core/utilities.js';

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
// Matrix and Array Operations
// ============================================================================

export { Matrix } from './matrix/Matrix.js';
export { Array3d } from './matrix/Array3d.js';

// ============================================================================
// N-Dimensional Array (NumPy-like)
// ============================================================================

export { NDArray } from './ndarray/ndarray.js';
export type { DType, NDArrayOptions } from './ndarray/ndarray.js';

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
  tanh,
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
import { Matrix } from './matrix/Matrix.js';
import { Array3d } from './matrix/Array3d.js';
import { NDArray } from './ndarray/ndarray.js';
import * as activations from './neural/activations.js';
import * as losses from './neural/losses.js';
import * as optimizers from './neural/optimizers.js';
import * as regularization from './neural/regularization.js';
import * as errors from './types/errors.js';

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
 * const matrix = new Num.Matrix([[1, 2], [3, 4]]);
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

  // Matrix classes
  Matrix,
  Array3d,
  
  // N-dimensional array
  NDArray,

  // Neural network functions
  neural: {
    activations,
    losses,
    optimizers,
    regularization
  }
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