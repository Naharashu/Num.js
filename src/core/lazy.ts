/**
 * Lazy evaluation system for Num.js
 * Enables deferred computation and operation fusion for better performance
 */

import { NDArray } from '../ndarray/ndarray.js';
import type { Shape } from '../types/common.js';

// ============================================================================
// Lazy Operation Types
// ============================================================================

export type LazyOperation = 
    | { type: 'add'; operand: NDArray | number }
    | { type: 'subtract'; operand: NDArray | number }
    | { type: 'multiply'; operand: NDArray | number }
    | { type: 'divide'; operand: NDArray | number }
    | { type: 'power'; operand: NDArray | number }
    | { type: 'transpose'; axes?: number[] }
    | { type: 'reshape'; shape: Shape };

// ============================================================================
// Lazy NDArray Wrapper
// ============================================================================

/**
 * Lazy evaluation wrapper for NDArray operations
 * Defers computation until explicitly evaluated
 */
export class LazyNDArray {
    private readonly _source: NDArray;
    private readonly _operations: LazyOperation[] = [];

    constructor(source: NDArray) {
        this._source = source;
    }

    /**
     * Add lazy addition operation
     */
    add(other: NDArray | number): LazyNDArray {
        this._operations.push({ type: 'add', operand: other });
        return this;
    }

    /**
     * Add lazy subtraction operation
     */
    subtract(other: NDArray | number): LazyNDArray {
        this._operations.push({ type: 'subtract', operand: other });
        return this;
    }

    /**
     * Add lazy multiplication operation
     */
    multiply(other: NDArray | number): LazyNDArray {
        this._operations.push({ type: 'multiply', operand: other });
        return this;
    }

    /**
     * Add lazy division operation
     */
    divide(other: NDArray | number): LazyNDArray {
        this._operations.push({ type: 'divide', operand: other });
        return this;
    }

    /**
     * Add lazy power operation
     */
    power(other: NDArray | number): LazyNDArray {
        this._operations.push({ type: 'power', operand: other });
        return this;
    }

    /**
     * Add lazy transpose operation
     */
    transpose(axes?: number[]): LazyNDArray {
        this._operations.push({ type: 'transpose', ...(axes && { axes }) });
        return this;
    }

    /**
     * Add lazy reshape operation
     */
    reshape(shape: Shape): LazyNDArray {
        this._operations.push({ type: 'reshape', shape });
        return this;
    }

    /**
     * Evaluate all lazy operations and return the result
     * Applies operation fusion optimizations where possible
     */
    evaluate(): NDArray {
        if (this._operations.length === 0) {
            return this._source;
        }

        // Apply operation fusion optimizations
        const fusedOps = this._fuseOperations(this._operations);
        
        // Execute fused operations
        let result = this._source;
        for (const op of fusedOps) {
            result = this._executeOperation(result, op);
        }

        return result;
    }

    /**
     * Fuse compatible operations for better performance
     * For example: add(2).multiply(3) -> multiply(3).add(6)
     */
    private _fuseOperations(operations: LazyOperation[]): LazyOperation[] {
        const fused: LazyOperation[] = [];
        let i = 0;

        while (i < operations.length) {
            const current = operations[i];
            if (!current) break;
            
            const next = operations[i + 1];

            // Fuse scalar arithmetic operations
            if (next && this._canFuseScalarOps(current, next)) {
                const fusedOp = this._fuseScalarOps(current, next);
                if (fusedOp) {
                    fused.push(fusedOp);
                    i += 2; // Skip both operations
                    continue;
                }
            }

            fused.push(current);
            i++;
        }

        return fused;
    }

    /**
     * Check if two operations can be fused
     */
    private _canFuseScalarOps(op1: LazyOperation, op2?: LazyOperation): boolean {
        if (!op2) return false;
        
        // Only fuse scalar operations
        const isOp1Scalar = 'operand' in op1 && typeof op1.operand === 'number';
        const isOp2Scalar = 'operand' in op2 && typeof op2.operand === 'number';
        
        if (!isOp1Scalar || !isOp2Scalar) return false;

        // Can fuse certain operation combinations
        const fusableTypes = ['add', 'subtract', 'multiply', 'divide'];
        return fusableTypes.includes(op1.type) && fusableTypes.includes(op2.type);
    }

    /**
     * Fuse two scalar operations into one equivalent operation
     */
    private _fuseScalarOps(op1: LazyOperation, op2: LazyOperation): LazyOperation | null {
        if (!('operand' in op1) || !('operand' in op2)) return null;
        
        const val1 = op1.operand as number;
        const val2 = op2.operand as number;

        // Fuse multiply + add/subtract (common pattern)
        if (op1.type === 'multiply' && op2.type === 'add') {
            // x * a + b -> multiply by a, then add b (no fusion benefit here)
            return null; // Keep separate for now
        }

        // Fuse add + add
        if (op1.type === 'add' && op2.type === 'add') {
            return { type: 'add', operand: val1 + val2 };
        }

        // Fuse multiply + multiply
        if (op1.type === 'multiply' && op2.type === 'multiply') {
            return { type: 'multiply', operand: val1 * val2 };
        }

        return null;
    }

    /**
     * Execute a single operation
     */
    private _executeOperation(array: NDArray, operation: LazyOperation): NDArray {
        switch (operation.type) {
            case 'add':
                return array.add(operation.operand);
            case 'subtract':
                return array.subtract(operation.operand);
            case 'multiply':
                return array.multiply(operation.operand);
            case 'divide':
                return array.divide(operation.operand);
            case 'power':
                return array.power(operation.operand);
            case 'transpose':
                return array.transpose(operation.axes);
            case 'reshape':
                return array.reshape(operation.shape);
            default:
                throw new Error(`Unknown lazy operation: ${(operation as any).type}`);
        }
    }
}

// ============================================================================
// Lazy Evaluation Extensions
// ============================================================================

/**
 * Create a lazy evaluation wrapper for an NDArray
 */
export function lazy(array: NDArray): LazyNDArray {
    return new LazyNDArray(array);
}

/**
 * Add lazy evaluation method to NDArray prototype
 */
declare module '../ndarray/ndarray.js' {
    interface NDArray {
        lazy(): LazyNDArray;
    }
}

// Extend NDArray with lazy method
Object.defineProperty(NDArray.prototype, 'lazy', {
    value: function(this: NDArray): LazyNDArray {
        return new LazyNDArray(this);
    },
    writable: false,
    enumerable: false,
    configurable: false
});