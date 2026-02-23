import {
  formatPublicCustomerName,
  isCustomerOnboardingRequired,
} from "../../src/lib/onboarding";

describe("onboarding helpers", () => {
  it("requires onboarding for customers without full name", () => {
    expect(isCustomerOnboardingRequired("customer", null)).toBe(true);
    expect(isCustomerOnboardingRequired("customer", "   ")).toBe(true);
  });

  it("does not require onboarding for owners or named customers", () => {
    expect(isCustomerOnboardingRequired("owner", null)).toBe(false);
    expect(isCustomerOnboardingRequired("customer", "Jane Smith")).toBe(false);
  });

  it("formats a public-facing customer name", () => {
    expect(formatPublicCustomerName("Jane Smith")).toBe("Jane S.");
    expect(formatPublicCustomerName("Madonna")).toBe("Madonna");
    expect(formatPublicCustomerName("  Jane   Mary  Smith ")).toBe("Jane S.");
  });
});
