/**
 * Test script to verify the restructured API works correctly
 */

import { Matrix } from './src/matrix/Matrix.js';
import { det, inv, trace, solve } from './src/linalg/linalg.js';
import { normal, uniform, randintArray } from './src/random/random.js';
import { NDArray } from './src/ndarray/ndarray.js';
import { zeros, fromArray } from './src/ndarray/factory.js';

console.log('Testing restructured API...\n');

// Test linear algebra functions
console.log('=== Linear Algebra Tests ===');
const matrix = new Matrix([[2, 1], [1, 1]]);
console.log('Matrix:', matrix.data);
console.log('Determinant:', det(matrix));
console.log('Trace:', trace(matrix));

const inverse = inv(matrix);
console.log('Inverse:', inverse instanceof Matrix ? inverse.data : 'NDArray');

const b = [3, 2];
const solution = solve(matrix, b);
console.log('Solution to Ax = b:', solution);

// Test random functions
console.log('\n=== Random Generation Tests ===');
const randomNormal = normal([2, 3], 0, 1);
console.log('Normal distribution (2x3):', randomNormal.shape);

const randomUniform = uniform([5], 0, 10);
console.log('Uniform distribution (5):', randomUniform.shape);

const randomInts = randintArray([3, 2], 1, 10);
console.log('Random integers (3x2):', randomInts.shape);

// Test that everything integrates properly
console.log('\n=== Integration Tests ===');
const testArray = zeros([2, 2]);
console.log('Created zeros array:', testArray.shape);

// Test with NDArray
const ndMatrix = fromArray([[4, 2], [1, 3]]);
console.log('NDArray matrix:', ndMatrix.shape);
console.log('NDArray determinant:', det(ndMatrix));
console.log('NDArray trace:', trace(ndMatrix));

console.log('\n✅ All tests completed successfully!');