import { describe, it, expect, Assertion } from "vitest";

export function Given<T, U>(message: string, task: (value: T) => U, ...whens: ((t: U) => void)[]): (value: T) => void {
  console.log("given:" + message);
  if (typeof message !== "string") throw new Error("given?<" + message + ">" + task);
  return value => {
    describe("Given: " + message, () => {
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
  console.log("when:" + message);
  if (typeof message !== "string") throw new Error("when?<" + message + ">" + task);
  return value => {
    console.log("message: " + message + ",<" + value + ">");
    describe("When: " + message, () => {
      for (const each of thens) {
        console.log("each:<" + each + ">");
        const v = task(value);
        each(v);
      }
    });
  };
}

export function Then<V>(message: string, task: (v: Assertion<V>) => void): (v: V) => void {
  return (v: V) => {
    it("Then: " + message, () => {
      return task(expect(v));
    });
  };
}
