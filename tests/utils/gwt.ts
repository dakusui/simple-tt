import { describe, it, expect, Assertion } from "vitest";

export function Given<T, U>(value: T): (message: string, task: (value: T) => U, ...whens: ((t: U) => void)[]) => void {
  return (message, task, whens) =>  {
    return __Given<T, U>(message, task, whens)(value);
  };
}
function __Given<T, U>(message: string, task: (value: T) => U, ...whens: ((t: U) => void)[]): (value: T) => void {
  return value => {
    describe("Given: " + String(value) + ": " + message, () => {
      for (const each of whens) {
        const v = task(value);
        each(v);
      }
    });
  };
}

export function When<U>(
  message: string,
  task: (value: U) => unknown,
  ...thens: ((value: unknown) => void)[]
): (value: U) => void {
  return value => {
    describe("When: " + message, () => {
      for (const each of thens) {
        const v = task(value);
        each(v);
      }
    });
  };
}

export function Then<V>(message: string, task: (v: V) => void): (v: V) => void {
  return (v: V) => {
    it("Then: " + message, () => {
      return task(v);
    });
  };
}
export function ThenExpect<V>(message: string, task: (v: Assertion<V>) => void): (v: V) => void {
  return (v: V) => {
    it("Then: " + message, () => {
      return task(expect(v));
    });
  };
}
