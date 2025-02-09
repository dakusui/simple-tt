import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export function require<T, E extends Error>(value: T, predicate: (v: T) => boolean, func: (v: string) => E): T {
  if (predicate(value)) return value;
  throw func("<" + value + "> did not satisfy: <" + predicate + ">");
}

export function requireArgument<T>(value: T, predicate: (v: T) => boolean): T {
  return require(value, predicate, (m: string) => new IllegalArgumentException(m));
}
export class IllegalArgumentException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IllegalArgumentException";
  }
}

export function requireMethodIsPOST(req) {
  return requireMethod(req, "POST");
}

export function requireMethod(req: NextApiRequest, expectedMethod: string): NextApiRequest {
  return require(req, r => r.method === expectedMethod, m => new UnsupportedMethodException(m));
}

export function requireMethodIsGET(req: NextApiRequest) {
  return requireMethod(req, "GET");
}

export class UnsupportedMethodException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedMethodException";
  }
}

export function isDefined<T>(value: T): boolean {
  return value !== undefined;
}
export function isDefinedString(v): boolean {
  return isDefined(v) && typeof v == "string";
}

export function handleError(error: Error): NextResponse {
  if (error instanceof IllegalArgumentException) {
    return NextResponse.json({ error: "Invalid Request: <" + error.message + ">" }, { status: 200 });
  } else if (error instanceof UnsupportedMethodException) {
    return NextResponse.json({ error: "Method Not Allowed: <" + error.message + ">" }, { status: 405 });
  }
  return NextResponse.json({ error: "Internal Server Error: <" + error.message + ">" }, { status: 500 });
}
