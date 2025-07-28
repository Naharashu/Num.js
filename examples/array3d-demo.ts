/**
 * Demonstration of the fixed Array3d class
 * Shows the difference between the original buggy implementation and the fixed version
 */

import { Array3d, Array3dCompat } from '../src/matrix/Array3d.js';

console.log('=== Array3d Fixes Demonstration ===\n');

// Test 3D arrays
const a = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
const b = [[[1, 1], [1, 1]], [[1, 1], [1, 1]]];

console.log('Array3d A:');
console.log(a);
console.log('\nArray3d B:');
console.log(b);

// Original buggy behavior demonstration
console.log('\n--- Original Buggy Implementation Issues ---');

// 1. Equals method bug (would compare a[i][j] instead of a[i][j][t])
console.log('1. Equals method bug: The original compared a[i][j] !== b[i][j] instead of a[i][j][t] !== b[i][j][t]');

// 2. Add/Sub operations were scalar operations, not element-wise
console.log('2. Add/Sub were scalar operations (adding/subtracting a number), not element-wise array operations');

// Fixed implementation
console.log('\n--- Fixed Implementation ---');

// Proper element-wise operations
const addResult = Array3dCompat.add(a, b);
console.log('Element-wise addition A + B:', addResult);

const subResult = Array3dCompat.sub(a, b);
console.log('Element-wise subtraction A - B:', subResult);

// Proper equals comparison
const equalsResult = Array3dCompat.equals(a, a);
console.log('Equals comparison A === A:', equalsResult);

const notEqualsResult = Array3dCompat.equals(a, b);
console.log('Equals comparison A === B:', notEqualsResult);

// Using the Array3d class directly
console.log('\n--- Using Array3d Class ---');
const array3dA = new Array3d(a);
const array3dB = new Array3d(b);

console.log('Array3d A shape:', array3dA.shape);
console.log('Array3d A size:', array3dA.size);
console.log('Element at [0,0,0]:', array3dA.get(0, 0, 0));
console.log('Element at [1,1,1]:', array3dA.get(1, 1, 1));

const classAddResult = array3dA.add(array3dB);
console.log('Class addition result:', classAddResult.data);

// Additional utility methods
console.log('Sum of all elements in A:', array3dA.sum());
console.log('Mean of all elements in A:', array3dA.mean());
console.log('Min element in A:', array3dA.min());
console.log('Max element in A:', array3dA.max());

console.log('\n--- New Features Not in Original ---');
console.log('✅ Proper element-wise operations between 3D arrays');
console.log('✅ Type-safe element access with bounds checking');
console.log('✅ Comprehensive validation and error handling');
console.log('✅ Utility methods (sum, mean, min, max)');
console.log('✅ Immutable operations (original data is never modified)');
console.log('✅ Full TypeScript type safety');