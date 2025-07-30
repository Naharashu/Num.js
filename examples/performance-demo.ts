/**
 * Performance Optimization Demonstration
 * Shows the performance improvements in Num.js 2.0
 */

import { 
  NDArray, 
  Matrix,
  ndarrayZeros as zeros,
  ndarrayOnes as ones,
  ndarrayRandom as random,
  benchmark,
  compareBenchmarks,
  benchmarkArithmetic,
  benchmarkMemoryAllocation,
  printBenchmarkResults,
  lazy
} from '../src/index.js';

console.log('🚀 Num.js Performance Optimization Demo\n');

// ============================================================================
// 1. Matrix Multiplication Performance
// ============================================================================

console.log('1️⃣ Matrix Multiplication Performance');
console.log('=====================================');

const size = 100;
const ndarrayA = random([size, size]);
const ndarrayB = random([size, size]);
const matrixA = Matrix.random(size, size);
const matrixB = Matrix.random(size, size);

const matmulResults = compareBenchmarks([
  {
    name: 'NDArray.dot() (optimized)',
    fn: () => ndarrayA.dot(ndarrayB)
  },
  {
    name: 'Matrix.dot() (legacy)',
    fn: () => matrixA.dot(matrixB)
  }
], 10);

printBenchmarkResults(matmulResults);

// ============================================================================
// 2. Scalar Operations Performance
// ============================================================================

console.log('\n2️⃣ Scalar Operations Performance');
console.log('=================================');

const largeArray = random([10000]);
const scalarResults = compareBenchmarks([
  {
    name: 'NDArray scalar add (optimized kernel)',
    fn: () => largeArray.add(2.5)
  },
  {
    name: 'NDArray scalar multiply (optimized kernel)',
    fn: () => largeArray.multiply(1.5)
  },
  {
    name: 'JavaScript array map',
    fn: () => Array.from({ length: 10000 }, () => Math.random()).map(x => x + 2.5)
  }
], 100);

printBenchmarkResults(scalarResults);

// ============================================================================
// 3. Method Chaining Performance
// ============================================================================

console.log('\n3️⃣ Method Chaining Performance');
console.log('===============================');

const chainArray = random([5000]);
const chainingResults = compareBenchmarks([
  {
    name: 'Fluent chaining (a.add(1).multiply(2).subtract(0.5))',
    fn: () => chainArray.add(1).multiply(2).subtract(0.5)
  },
  {
    name: 'Separate operations (3 intermediate arrays)',
    fn: () => {
      const temp1 = chainArray.add(1);
      const temp2 = temp1.multiply(2);
      const temp3 = temp2.subtract(0.5);
      return temp3;
    }
  }
], 50);

printBenchmarkResults(chainingResults);

// ============================================================================
// 4. Lazy Evaluation Demo
// ============================================================================

console.log('\n4️⃣ Lazy Evaluation Demo');
console.log('========================');

const lazyArray = random([1000]);

console.log('Building lazy operation chain...');
const lazyChain = lazy(lazyArray)
  .add(5)
  .multiply(2)
  .subtract(1)
  .reshape([20, 50])
  .transpose();

console.log('Operations queued (not executed yet)');

const lazyResults = compareBenchmarks([
  {
    name: 'Lazy evaluation (deferred execution)',
    fn: () => {
      const chain = lazy(lazyArray).add(5).multiply(2).subtract(1);
      return chain.evaluate();
    }
  },
  {
    name: 'Immediate evaluation (eager execution)',
    fn: () => {
      return lazyArray.add(5).multiply(2).subtract(1);
    }
  }
], 100);

printBenchmarkResults(lazyResults);

// ============================================================================
// 5. Memory Allocation Performance
// ============================================================================

console.log('\n5️⃣ Memory Allocation Performance');
console.log('=================================');

const memoryResults = benchmarkMemoryAllocation(10000);
printBenchmarkResults(memoryResults);

// ============================================================================
// 6. Comprehensive Arithmetic Benchmark
// ============================================================================

console.log('\n6️⃣ Comprehensive Arithmetic Benchmark');
console.log('======================================');

const arithmeticResults = benchmarkArithmetic(200);
printBenchmarkResults(arithmeticResults);

// ============================================================================
// 7. Zero-Copy Operations Demo
// ============================================================================

console.log('\n7️⃣ Zero-Copy Operations Demo');
console.log('=============================');

const originalArray = random([1000, 1000]);

const zeroCopyResults = compareBenchmarks([
  {
    name: 'Zero-copy transpose (view)',
    fn: () => originalArray.transpose()
  },
  {
    name: 'Zero-copy reshape (view)',
    fn: () => originalArray.reshape([500, 2000])
  },
  {
    name: 'Data copy operation (new array)',
    fn: () => originalArray.add(0) // Forces new array creation
  }
], 50);

printBenchmarkResults(zeroCopyResults);

// ============================================================================
// 8. Broadcasting Performance
// ============================================================================

console.log('\n8️⃣ Broadcasting Performance');
console.log('============================');

const broadcastArray1 = random([100, 100]);
const broadcastArray2 = random([100, 1]);
const broadcastScalar = 2.5;

const broadcastResults = compareBenchmarks([
  {
    name: 'Array + Scalar (broadcasting)',
    fn: () => broadcastArray1.add(broadcastScalar)
  },
  {
    name: 'Array + Array (broadcasting)',
    fn: () => broadcastArray1.add(broadcastArray2)
  },
  {
    name: 'Array + Array (same shape)',
    fn: () => broadcastArray1.add(broadcastArray1)
  }
], 50);

printBenchmarkResults(broadcastResults);

console.log('\n✅ Performance demonstration complete!');
console.log('\n📊 Key Performance Improvements:');
console.log('• Optimized arithmetic kernels with loop unrolling');
console.log('• Zero-copy operations for reshape/transpose');
console.log('• Efficient matrix multiplication algorithm');
console.log('• Method chaining for fluent API');
console.log('• Lazy evaluation for complex operation chains');
console.log('• Broadcasting support for efficient operations');
console.log('• TypedArray-based storage for better memory performance');

// Example of the new fluent API
console.log('\n🎯 Example of New Fluent API:');
const demo = random([3, 3]);
console.log('Original array:');
console.log(demo.toString());

const result = demo
  .add(1)           // Add 1 to all elements
  .multiply(2)      // Multiply by 2
  .transpose()      // Transpose the matrix
  .subtract(0.5);   // Subtract 0.5

console.log('\nAfter: add(1).multiply(2).transpose().subtract(0.5):');
console.log(result.toString());

// Lazy evaluation example
console.log('\n⏳ Lazy Evaluation Example:');
const lazyDemo = demo.lazy()
  .add(10)
  .multiply(0.1)
  .power(2);

console.log('Lazy operations queued (not executed)');
const lazyResult = lazyDemo.evaluate();
console.log('Result after evaluation:');
console.log(lazyResult.toString());