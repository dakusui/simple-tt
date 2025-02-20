import { describe, it, expect, Assertion } from "vitest";

export function Given<T, U>(value?: T): (message: string, task: (value: T) => U, ...whens: ((t: U) => void)[]) => void {
  return (message, task, whens) => {
    const msg: string = value ? message + ":<" + String(value) + ">" : message;
    return __Given<T, U>(msg, task, whens)(value as T);
  };
}
export function GivenOnly<T, U>(value?: T): (message: string, task: (value: T) => U, ...whens: ((t: U) => void)[]) => void {
  return (message, task, whens) => {
    const msg: string = value ? message + ":<" + String(value) + ">" : message;
    return __GivenOnly<T, U>(msg, task, whens)(value as T);
  };
}

function __Given<T, U>(message: string, task: (value?: T) => U, ...whens: ((t: U) => void)[]): (value: T) => void {
  return value => {
    describe("Given: " + message, () => {
      for (const each of whens) {
        const v = task(value);
        each(v);
      }
    });
  };
}
function __GivenOnly<T, U>(message: string, task: (value?: T) => U, ...whens: ((t: U) => void)[]): (value: T) => void {
  return value => {
    describe.only("Given: " + message, () => {
      for (const each of whens) {
        const v = task(value);
        each(v);
      }
    });
  };
}

export function WhenOnly<U>(
  message: string,
  task: (value: U) => unknown,
  ...thens: ((value: unknown) => void)[]
): (value: U) => void {
  return value => {
    describe.only("When: " + message, () => {
      for (const each of thens) {
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

export function ThenOnly<V>(message: string, task: (v: V) => void): (v: V) => void {
  return (v: V) => {
    it.only("Then: " + message, () => {
      return task(v);
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

export function Ensure<T>(context?: T): (message: string, p: (context?: T) => boolean, ...tasks: ((value: T) => void)[]) => void {
  return (message, p, tasks) => __Ensure<T>(message, p, tasks)(context as T);
}

function __Ensure<T>(message: string, p: (context?: T) => boolean, ...tasks: ((value: T) => void)[]): (context: T) => void {
  return context => {
    if (p(context)) return;
    for (const each of tasks) {
      try {
        each(context);
      } catch (e) {
        if (e instanceof GwtAbort)
          throw e;
      }
      if (p(context)) return;
    }
    throw new Error("Failed to ensure: " + message);
  };
}
export class GwtAbort extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetriableError";
  }
}
