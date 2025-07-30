/**
 * Performance benchmarking utilities for Num.js
 * Provides tools to measure and compare operation performance
 */

import { NDArray } from '../ndarray/ndarray.js';
import { zeros, ones, random } from '../ndarray/factory.js';

// ============================================================================
// Benchmarking Infrastructure
// ============================================================================

export interface BenchmarkResult {
    name: string;
    iterations: number;
    totalTime: number;
    averageTime: number;
    operationsPerSecond: number;
}

/**
 * Run a benchmark function multiple times and collect performance metrics
 * @param name - Name of the benchmark
 * @param fn - Function to benchmark
 * @param iterations - Number of iterations to run
 * @returns Performance metrics
 */
export function benchmark(name: string, fn: () => void, iterations: number = 1000): BenchmarkResult {
    // Warm up
    for (let i = 0; i < Math.min(10, iterations); i++) {
        fn();
    }
    
    // Force garbage collection if available
    if (global.gc) {
        global.gc();
    }
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    return {
        name,
        iterations,
        totalTime,
        averageTime: totalTime / iterations,
        operationsPerSecond: (iterations * 1000) / totalTime
    };
}

/**
 * Compare performance of multiple benchmark functions
 * @param benchmarks - Array of benchmark configurations
 * @returns Array of benchmark results sorted by performance
 */
export function compareBenchmarks(
    benchmarks: Array<{ name: string; fn: () => void }>,
    iterations: number = 1000
): BenchmarkResult[] {
    const results = benchmarks.map(({ name, fn }) => benchmark(name, fn, iterations));
    
    // Sort by operations per second (descending)
    return results.sort((a, b) => b.operationsPerSecond - a.operationsPerSecond);
}

// ============================================================================
// Pre-built Performance Tests
// ============================================================================

/**
 * Benchmark NDArray arithmetic operations
 */
export function benchmarkArithmetic(size: number = 1000): BenchmarkResult[] {
    const ndarrayData = random([size, size]);
    const ndarrayData2 = random([size, size]);
    
    return compareBenchmarks([
        {
            name: 'NDArray Addition',
            fn: () => ndarrayData.add(ones([size, size]))
        },
        {
            name: 'NDArray Addition (different arrays)',
            fn: () => ndarrayData.add(ndarrayData2)
        },
        {
            name: 'NDArray Scalar Multiplication',
            fn: () => ndarrayData.multiply(2.5)
        },
        {
            name: 'NDArray Matrix Multiplication',
            fn: () => ndarrayData.dot(ndarrayData)
        },
        {
            name: 'NDArray Element-wise Multiplication',
            fn: () => ndarrayData.multiply(ndarrayData2)
        }
    ], 100);
}

/**
 * Benchmark factory function performance
 */
export function benchmarkFactoryFunctions(size: number = 10000): BenchmarkResult[] {
    const dim = Math.sqrt(size);
    return compareBenchmarks([
        {
            name: 'NDArray zeros()',
            fn: () => zeros([dim, dim])
        },
        {
            name: 'NDArray ones()',
            fn: () => ones([dim, dim])
        },
        {
            name: 'NDArray random()',
            fn: () => random([dim, dim])
        }
    ], 1000);
}

/**
 * Print benchmark results in a formatted table
 */
export function printBenchmarkResults(results: BenchmarkResult[]): void {
    console.log('\n📊 Performance Benchmark Results');
    console.log('='.repeat(80));
    console.log(
        'Name'.padEnd(30) + 
        'Iterations'.padEnd(12) + 
        'Total (ms)'.padEnd(12) + 
        'Avg (ms)'.padEnd(12) + 
        'Ops/sec'.padEnd(14)
    );
    console.log('-'.repeat(80));
    
    results.forEach(result => {
        console.log(
            result.name.padEnd(30) +
            result.iterations.toString().padEnd(12) +
            result.totalTime.toFixed(2).padEnd(12) +
            result.averageTime.toFixed(4).padEnd(12) +
            Math.round(result.operationsPerSecond).toLocaleString().padEnd(14)
        );
    });
    
    console.log('-'.repeat(80));
    console.log(`🏆 Fastest: ${results[0]?.name} (${Math.round(results[0]?.operationsPerSecond || 0).toLocaleString()} ops/sec)`);
    
    if (results.length > 1) {
        const speedup = (results[0]?.operationsPerSecond || 0) / (results[results.length - 1]?.operationsPerSecond || 1);
        console.log(`⚡ Speedup: ${speedup.toFixed(2)}x faster than slowest`);
    }
    
    console.log('='.repeat(80));
}