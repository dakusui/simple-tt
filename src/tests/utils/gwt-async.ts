import { isAsyncFunction } from "util/types";
import { afterAll, describe, it } from "vitest";

type Func<V, W> = (value: V) => W;
type ExplainedFunc<V, W> = Func<V, W> & {
  explain(message: string): ExplainedFunc<V, W>;
  explanation: string;
};
type Task<V> = Func<V, void>;
type ExplainedTask<V> = ExplainedFunc<V, void>;
type TestTask<T, U> = (
  task: Func<T, Promise<U>> | ExplainedFunc<T, Promise<U>>,
  ...whens: ExplainedTask<U>[]
) => (done: Task<U>) => void;
type ThenTask<V> = ExplainedTask<V>;

export function Given<T, U>(value?: T): TestTask<T, U> {
  return (task, ...whens) => {
    return (done: Task<U>) => {
      return __Given<T, U>(describe, task, whens as ExplainedTask<U>[], done)(value as T);
    };
  };
}

export function Done<U>(done: Task<U>): Task<U> {
  return explainIfNecessary(done);
}

export function func<V, W>(func: (value: V) => W): ExplainedFunc<V, W> {
  const ret = Object.assign(func, { explanation: objToSimpleString(func) }) as ExplainedFunc<V, W>;
  ret.explain = (message: string): ExplainedFunc<V, W> => {
    return Object.assign(ret, { explanation: message });
  };
  return ret;
}
export function explainIfNecessary<V, W>(f: (value: V) => W): ExplainedFunc<V, W> {
  if (!("explanation" in f)) {
    return func(f);
  }

  return func as ExplainedFunc<V, W>;
}
function objToSimpleString(object: any): string {
  if ("explanation" in object) {
    return object.expl;
  }
  return object
    .toString()
    .replaceAll(/(await|const|async|return)+/g, " ")
    .replaceAll(/; */g, ",")
    .replaceAll(/,+/g, ",")
    .replaceAll(/[\t \n]+/g, " ")
    .replaceAll(/[\{\}]/g, "")
    .replaceAll(/ +/g, " ")
    .replaceAll(/[, ]+$/g, "");
}

function __Given<T, U>(
  describeFunc,
  givenClause: Func<T, Promise<U>> | ExplainedFunc<T | undefined, Promise<U>>,
  whens: ExplainedTask<U>[],
  done: Task<U>
): (value: T) => void {
  return func(async value => {
    const v = await givenClause(value);
    for (const eachWhenClause of whens) {
      describeFunc("Given: " + objToSimpleString(givenClause), async () => {
        return eachWhenClause(v);
      });
    }
    afterAll(() => done(v));
  });
}

export function When<U, V>(
  task: Func<U, Promise<V>> | ExplainedFunc<U, Promise<V>>,
  ...thens: ThenTask<V>[]
): ExplainedTask<U> {
  return __When(it, task, ...thens);
}

export function __When<U, V>(
  itFunc,
  whenClause: Func<U, Promise<V>> | ExplainedFunc<U, Promise<V>>,
  ...thens: ThenTask<V>[]
): ExplainedTask<U> {
  return func(async value => {
    const v = await whenClause(value);
    for (const eachThenClause of thens) {
      itFunc("When: " + objToSimpleString(whenClause) + "; Then: " + objToSimpleString(eachThenClause), async () => {
        await eachThenClause(v);
      });
    }
  });
}

export function Then<V>(task: Task<V> | ExplainedTask<V>): ThenTask<V> {
  const ret: Task<V> = async v => {
    await task(v);
  };
  return explainIfNecessary(ret).explain(objToSimpleString(task));
}

type Pred<T> = ExplainedFunc<T, boolean>;
export function Ensure<T>(
  context?: T
): (message: string, p: Pred<T | undefined>, ...tasks: ExplainedTask<T>[]) => void {
  return (message, p, tasks) => __Ensure<T>(message, p, tasks)(context as T);
}

function __Ensure<T>(message: string, p: Pred<T | undefined>, ...tasks: ExplainedTask<T>[]): ExplainedTask<T> {
  return func(context => {
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
  });
}
export class GwtAbort extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetriableError";
  }
}
