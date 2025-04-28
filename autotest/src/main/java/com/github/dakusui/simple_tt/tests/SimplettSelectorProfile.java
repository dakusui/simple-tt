package com.github.dakusui.simple_tt.tests;

///  **Test Cases:** `body > div > div:nth-child(1) > div > table`
///  **Runs:** `body > div > div:nth-child(2) > div:nth-child(1) > div > table`
///  **Text Area:** `body > div > div:nth-child(2) > div:nth-child(2) > div > textarea`
///  **Save Changes:** `body > div > div:nth-child(2) > div:nth-child(2) > div > button:nth-child(3)`
public interface SimplettSelectorProfile {
  default String saveChangesButton() {
    return "body > div > div:nth-child(2) > div:nth-child(2) > div > button:nth-child(3)";
  }
  
  default String testSuitesTable() {
    return "body > div > div:nth-child(1) > div > table";
  }
  
  default String testRunsTable() {
    return "body > div > div:nth-child(2) > div:nth-child(1) > div > table";
  }
  
  default String triageTextArea() {
    return "body > div > div:nth-child(2) > div:nth-child(2) > div > textarea";
  }
}
