/**
 * Test script to verify Universal Functions (ufuncs) functionality
 */

import { zeros, ones, fromArray } from '../src/ndarray/factory.js';
import { 
    abs, sin, cos, exp, log, sqrt, 
    add, subtract, multiply, divide,
    sigmoid, relu, leakyRelu,
    addKernel, multiplyKernel
} from '../src/core/ufuncs.js';

function testUfuncs() {
    console.log('Testing Universal Functions (ufuncs)...\n');

    // Test 1: Scalar operations
    console.log('Test 1: Scalar Operations');
    console.log('abs(-5):', abs(-5));
    console.log('sin(π/2):', sin(Math.PI / 2));
    console.log('exp(1):', exp(1));
    console.log('sqrt(16):', sqrt(16));
    console.log();

    // Test 2: Unary ufuncs on NDArrays
    console.log('Test 2: Unary Ufuncs on NDArrays');
    const arr1 = fromArray([-2, -1, 0, 1, 2]);
    console.log('Original array:', arr1.toArray());
    console.log('abs(arr):', abs(arr1).toArray());
    console.log('relu(arr):', relu(arr1).toArray());
    
    const arr2 = fromArray([0, Math.PI/4, Math.PI/2, Math.PI]);
    console.log('Angles:', arr2.toArray());
    console.log('sin(angles):', sin(arr2).toArray());
    console.log('cos(angles):', cos(arr2).toArray());
    console.log();

    // Test 3: Binary ufuncs with broadcasting
    console.log('Test 3: Binary Ufuncs with Broadcasting');
    const a = fromArray([[1, 2], [3, 4]]);
    const b = fromArray([10, 20]);
    
    console.log('Array a:', a.toArray());
    console.log('Array b:', b.toArray());
    console.log('add(a, b):', add(a, b).toArray());
    console.log('multiply(a, 5):', multiply(a, 5).toArray());
    console.log();

    // Test 4: Activation functions
    console.log('Test 4: Activation Functions');
    const inputs = fromArray([-2, -1, 0, 1, 2]);
    console.log('Inputs:', inputs.toArray());
    console.log('sigmoid(inputs):', sigmoid(inputs).toArray());
    console.log('relu(inputs):', relu(inputs).toArray());
    
    // Leaky ReLU with alpha=0.1
    console.log('leakyRelu(inputs, 0.1):', leakyRelu(inputs, 0.1).toArray());
    console.log();

    // Test 5: Chained operations
    console.log('Test 5: Chained Operations');
    const x = fromArray([1, 2, 3, 4]);
    console.log('x:', x.toArray());
    
    // Chain: abs(sin(x * 2) + 1)
    const result = abs(add(sin(multiply(x, 2)), 1));
    console.log('abs(sin(x * 2) + 1):', result.toArray());
    console.log();

    // Test 6: Type preservation
    console.log('Test 6: Type Preservation');
    const float32Array = ones([3], { dtype: 'float32' });
    const int32Array = ones([3], { dtype: 'int32' });
    
    console.log('Float32 array dtype:', float32Array.dtype);
    console.log('Int32 array dtype:', int32Array.dtype);
    
    const sqrtFloat32 = sqrt(float32Array);
    const absInt32 = abs(int32Array);
    
    console.log('sqrt(float32) dtype:', sqrtFloat32.dtype);
    console.log('abs(int32) dtype:', absInt32.dtype);
    console.log();

    // Test 7: Performance kernels
    console.log('Test 7: Performance Kernels');
    const large1 = ones([1000]);
    const large2 = ones([1000]);
    
    console.time('Standard add');
    const standardResult = add(large1, large2);
    console.timeEnd('Standard add');
    
    console.time('Kernel add');
    const kernelResult = addKernel(large1, large2);
    console.timeEnd('Kernel add');
    
    // Compare first few elements (handle NestedArray type properly)
    const standardArray = standardResult.toArray() as number[];
    const kernelArray = kernelResult.toArray() as number[];
    console.log('Results equal:', 
        JSON.stringify(standardArray.slice(0, 5)) === 
        JSON.stringify(kernelArray.slice(0, 5))
    );
    console.log();

    // Test 8: Error handling
    console.log('Test 8: Error Handling');
    try {
        const negativeLog = log(-1);
        console.log('This should not print');
    } catch (error) {
        console.log('Expected error for log(-1):', error.message);
    }
    
    try {
        const divByZero = divide(5, 0);
        console.log('This should not print');
    } catch (error) {
        console.log('Expected error for divide by zero:', error.message);
    }
}

testUfuncs();
