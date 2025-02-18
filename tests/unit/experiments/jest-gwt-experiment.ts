
import { given, when, then } from "jest-gwt";
import { describe } from "node:test";
import { expect } from "vitest";

class Calculator {
  add(v: number, w: number) {
    return v + w;
  }
}
describe("Calculator", () => {
  let result: number;
  let calculator: Calculator;

  given("a calculator", () => {
    calculator = new Calculator();
  });

  when("I add 2 and 3", () => {
    result = calculator.add(2, 3);
  });

  then("the result should be 5", () => {
    expect(result).toBe(5);
  });
});
