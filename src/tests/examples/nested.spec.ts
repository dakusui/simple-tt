import { describe, it, beforeEach, expect } from "vitest";

let log: string[] = [];

beforeEach(() => {
  log = [];
  log.push("beforeEach");
});

describe("Outer suite", () => {
  describe("", () => {
    log.push("Outer beforeEach");
  });

  describe("should run with both beforeEach hooks (1)", () => {
    log.push("Test executed");
    expect(log).toEqual([
      "beforeEach", // Runs first
      "Outer beforeEach", // Runs second
      "Test executed" // Test runs last
    ]);
  });

  describe("Inner suite", () => {
    log.push("Inner beforeEach");
  });

  it("should run with both beforeEach hooks (2)", () => {
    log.push("Test executed");
    expect(log).toEqual([
      "beforeEach",
      "Outer beforeEach", // Runs first
      "Inner beforeEach", // Runs second
      "Test executed" // Test runs last
    ]);
  });
});
