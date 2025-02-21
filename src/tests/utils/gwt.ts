import { describe, it } from "vitest";

type Func<V, W> = (value: V) => W;
type Task<V> = Func<V, void>;

export function Given<T, U>(value?: T): (message: string, task: Func<T, U>, ...whens: Task<U>[]) => void {
  return (message, task, whens) => {
    const msg: string = value ? message + ":<" + String(value) + ">" : message;
    return __Given<T, U>(describe, msg, task, whens)(value as T);
  };
}
export function GivenOnly<T, U>(value?: T): (message: string, task: Func<T, U>, ...whens: Task<U>[]) => void {
  return (message, task, whens) => {
    const msg: string = value ? message + ":<" + String(value) + ">" : message;
    return __Given<T, U>(describe.only, msg, task, whens)(value as T);
  };
}
export function GivenSkip<T, U>(value?: T): (message: string, task: Func<T, U>, ...whens: Task<U>[]) => void {
  return (message, task, whens) => {
    const msg: string = value ? message + ":<" + String(value) + ">" : message;
    return __Given<T, U>(describe.skip, msg, task, whens)(value as T);
  };
}

function __Given<T, U>(describeFunc, message: string, task: Func<T | undefined, U>, ...whens: Task<U>[]): Task<T> {
  return value => {
    for (const each of whens) {
      describeFunc("Given: " + message, () => {
        const v = task(value);
        each(v);
      });
    }
  };
}

export function When<U, V>(message: string, task: Func<U, V>, ...thens: ThenTask<V>[]): Task<U> {
  return __When(it, message, task, ...thens);
}
export function WhenOnly<U, V>(message: string, task: Func<U, V>, ...thens: ThenTask<V>[]): Task<U> {
  return __When(it.only, message, task, ...thens);
}
export function WhenSkip<U, V>(message: string, task: Func<U, V>, ...thens: ThenTask<V>[]): Task<U> {
  return __When(it.skip, message, task, ...thens);
}

export function __When<U, V>(itFunc, message: string, task: Func<U, V>, ...thens: ThenTask<V>[]): Task<U> {
  return value => {
    for (const each of thens) {
      itFunc("When: " + message + "; " + each.message, () => {
        const v = task(value);
        each(v);
      });
    }
  };
}

type ThenTask<V> = Task<V> & { message: string };

export function Then<V>(message: string, task: Task<V>): ThenTask<V> {
  const ret: ThenTask<V> = v => {
    return task(v);
  };
  ret.message = "Then: " + message;
  return ret;
}

type Pred<T> = Func<T, boolean>;
export function Ensure<T>(context?: T): (message: string, p: Pred<T | undefined>, ...tasks: Task<T>[]) => void {
  return (message, p, tasks) => __Ensure<T>(message, p, tasks)(context as T);
}

function __Ensure<T>(message: string, p: Pred<T | undefined>, ...tasks: Task<T>[]): Task<T> {
  return context => {
    if (p(context)) return;
    for (const each of tasks) {
      try {
        each(context);
      } catch (e) {
        if (e instanceof GwtAbort) throw e;
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
