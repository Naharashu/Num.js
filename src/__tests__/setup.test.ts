import { test, expect, describe } from "bun:test";

describe("TypeScript Migration Setup", () => {
  test("basic test functionality works", () => {
    expect(1 + 1).toBe(2);
  });

  test("can import and test basic math", () => {
    const add = (a: number, b: number): number => a + b;
    expect(add(2, 3)).toBe(5);
  });

  test("TypeScript strict mode is working", () => {
    // This test verifies that TypeScript compilation is working
    const numbers: number[] = [1, 2, 3, 4, 5];
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    expect(sum).toBe(15);
  });
});