/**
 * Test script to verify generic typing in factory functions
 */

import { zeros, ones, full, eye, arange, linspace, fromArray, random } from '../src/index.js';

function testFactoryGenerics() {
    console.log('Testing Factory Function Generic Typing...\n');

    // Test 1: Default typing (should be float64)
    console.log('Test 1: Default Typing');
    const defaultArray = zeros([2, 2]);
    console.log('Default zeros dtype:', defaultArray.dtype);
    console.log('Default zeros data:', defaultArray.toArray());
    console.log();

    // Test 2: Explicit generic typing
    console.log('Test 2: Explicit Generic Typing');
    const float32Array = ones<'float32'>([2, 3], { dtype: 'float32' });
    console.log('Float32 ones dtype:', float32Array.dtype);
    console.log('Float32 ones data:', float32Array.toArray());

    const int32Array = full<'int32'>([3], 42, { dtype: 'int32' });
    console.log('Int32 full dtype:', int32Array.dtype);
    console.log('Int32 full data:', int32Array.toArray());
    console.log();

    // Test 3: Different factory functions with generics
    console.log('Test 3: Various Factory Functions');
    
    const identityMatrix = eye<'float64'>(3, { dtype: 'float64' });
    console.log('Identity matrix dtype:', identityMatrix.dtype);
    console.log('Identity matrix:\n', identityMatrix.toArray());

    const rangeArray = arange<'int16'>(0, 10, 2, { dtype: 'int16' });
    console.log('Range array dtype:', rangeArray.dtype);
    console.log('Range array data:', rangeArray.toArray());

    const linspaceArray = linspace<'float32'>(0, 1, 5, { dtype: 'float32' });
    console.log('Linspace array dtype:', linspaceArray.dtype);
    console.log('Linspace array data:', linspaceArray.toArray());
    console.log();

    // Test 4: Type inference and compatibility
    console.log('Test 4: Type Inference');
    const fromArrayTest = fromArray<'uint8'>([[1, 2], [3, 4]], { dtype: 'uint8' });
    console.log('FromArray dtype:', fromArrayTest.dtype);
    console.log('FromArray data:', fromArrayTest.toArray());

    const randomArray = random<'float32'>([2, 2], { dtype: 'float32' });
    console.log('Random array dtype:', randomArray.dtype);
    console.log('Random array shape:', randomArray.shape);
    console.log();

    // Test 5: Arithmetic operations with different dtypes
    console.log('Test 5: Mixed Dtype Operations');
    const a = zeros<'float64'>([2, 2], { dtype: 'float64' });
    const b = ones<'float64'>([2, 2], { dtype: 'float64' });
    
    const result = a.add(b);
    console.log('Addition result dtype:', result.dtype);
    console.log('Addition result:', result.toArray());
    console.log();

    // Test 6: Demonstrate type safety (this should work at compile time)
    console.log('Test 6: Type Safety Demo');
    
    // These should all be properly typed
    const typedArrays = {
        float64: zeros<'float64'>([2], { dtype: 'float64' }),
        float32: ones<'float32'>([2], { dtype: 'float32' }),
        int32: full<'int32'>([2], 5, { dtype: 'int32' }),
        uint8: eye<'uint8'>(2, { dtype: 'uint8' })
    };

    Object.entries(typedArrays).forEach(([name, array]) => {
        console.log(`${name} array - dtype: ${array.dtype}, data: ${array.toArray()}`);
    });
}

testFactoryGenerics();
