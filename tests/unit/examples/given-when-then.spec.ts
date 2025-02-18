import { __Given, Then, When } from "../../utils/gwt";

function prependTitle(name: string): string {
  console.log("prepend:<" + name + ">")
  return "Mr." + name;
}
function appendSuffix(name: string): string {
  return name + "-san";
}

{
  const name: string = "Hiroshi Ukai";
  __Given<void, string>(
    name,
    () => name,
    When<string>(
      "prependTitle",
      s => prependTitle(s),
      Then("Prefix is 'Dr.'", v => v.toContain("Dr.")),
      Then("Not empty", v => v.lengthOf(name.length + 3))
    ),
    When<string>(
      "appendSuffix",
      s => appendSuffix(s),
      Then("Suffix is '-san'", v => v.toContain("-san"))
    )
  )();
}
