/**
 * Test script to verify broadcasting functionality in NDArray
 */

import { NDArray } from '../src/index.js';

function testBroadcasting() {
    console.log('Testing NDArray Broadcasting...\n');

    // Test 1: Scalar broadcasting
    console.log('Test 1: Scalar Broadcasting');
    const a = new NDArray([1, 2, 3, 4], [2, 2]);
    console.log('Array a:', a.toArray());
    
    const result1 = a.add(10);
    console.log('a + 10:', result1.toArray());
    
    const result2 = a.multiply(2);
    console.log('a * 2:', result2.toArray());
    console.log();

    // Test 2: 1D array broadcasting with 2D array
    console.log('Test 2: 1D to 2D Broadcasting');
    const b = new NDArray([10, 20], [2]);  // 1D array
    const c = new NDArray([[1, 2], [3, 4]], [2, 2]);  // 2D array
    
    console.log('Array b (1D):', b.toArray());
    console.log('Array c (2D):', c.toArray());
    
    try {
        const result3 = c.add(b);
        console.log('c + b (broadcasting):', result3.toArray());
    } catch (error) {
        console.log('Broadcasting failed:', error.message);
    }
    console.log();

    // Test 3: Compatible shape broadcasting
    console.log('Test 3: Compatible Shape Broadcasting');
    const d = new NDArray([[1], [2]], [2, 1]);  // Column vector
    const e = new NDArray([[10, 20, 30]], [1, 3]);  // Row vector
    
    console.log('Array d (column):', d.toArray());
    console.log('Array e (row):', e.toArray());
    
    try {
        const result4 = d.add(e);
        console.log('d + e (broadcasting):', result4.toArray());
        console.log('Result shape:', result4.shape);
    } catch (error) {
        console.log('Broadcasting failed:', error.message);
    }
    console.log();

    // Test 4: Incompatible shapes
    console.log('Test 4: Incompatible Shape Broadcasting (should fail)');
    const f = new NDArray([1, 2, 3], [3]);
    const g = new NDArray([1, 2], [2]);
    
    console.log('Array f:', f.toArray());
    console.log('Array g:', g.toArray());
    
    try {
        const result5 = f.add(g);
        console.log('f + g:', result5.toArray());
    } catch (error) {
        console.log('Expected failure - Broadcasting incompatible:', error.message);
    }
}

testBroadcasting();
