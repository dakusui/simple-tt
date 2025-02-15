import { describe, it, beforeEach, expect } from "vitest";

let log: string[] = [];
beforeEach(() => {
  log = [];
  log.push("beforeEach");
});

function given<T, U>(message: string, task: (value: T) => U, ...whens: ((t: U) => void)[]): (value: T) => void {
  console.log(message, task, whens);
  return value => {
    for (const each of whens) {
      const v = task(value);
      each(v);
    }
  };
}

function when<U>(
  message: string,
  task: (value: U) => unknown,
  ...thens: ((value: unknown) => void)[]
): (value: U) => void {
  return value => {
    for (const each of thens) {
      const v = task(value);
      each(v);
    }
  };
}
function then<V>(message: string, task: (v: V) => void): (v: V) => void {
  return task;
}
{
  given<void, string>(
    "Hiroshi Ukai",
    () => "Hiroshi Ukai",
    when<string>(
      "prependSuffix",
      s => prependSuffix(s),
      then("Prefix is 'Dr.'", (v: string) => v.startsWith("Dr.")),
      then("Not empty", (v: string) => v.length > 0)
    ),
    when<string>(
      "appendSuffix",
      s => appendSuffix(s),
      then("Suffix is '-san'", (v: string) => v.endsWith("-san"))
    )
  )();
}

function prependSuffix(name: string): string {
  return "Mr." + name;
}
function appendSuffix(name: string): string {
  return name + "-san";
}
describe("Outer suite", () => {
  given("", {}, () => {
    log.push("Outer beforeEach");
  });

  when("should run with both beforeEach hooks (1)", () => {
    log.push("Test executed");
    then(log).toEqual([
      "beforeEach", // Runs first
      "Outer beforeEach", // Runs second
      "Test executed" // Test runs last
    ]);
  });

  describe("Inner suite", () => {
    beforeEach(() => {
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
});
