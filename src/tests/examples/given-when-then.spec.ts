import { expect } from "vitest";
import { Given, Then, ThenExpect, When } from "../utils/gwt";

function prependTitle(name: string): string {
  console.log("prepend:<" + name + ">")
  return "Mr." + name;
}
function appendSuffix(name: string): string {
  return name + "-san";
}

{
  const name: string = "Hiroshi Ukai";
  Given<void, string>()(
    "a name",
    () => name,
    When<string>(
      "prependTitle",
      s => prependTitle(s),
      ThenExpect("Prefix is 'Dr.'", v => v.toContain("Dr.")),
      ThenExpect("Not empty", v => v.lengthOf(name.length + 3))
    ),
    When<string>(
      "appendSuffix",
      s => appendSuffix(s),
      Then("Suffix is '-san'", v => expect(v).toContain("-san"))
    )
  );
}
