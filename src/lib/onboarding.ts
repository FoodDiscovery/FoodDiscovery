export function isCustomerOnboardingRequired(role: string | null | undefined, fullName: string | null | undefined): boolean {
  if (role !== "customer") {
    return false;
  }

  return !fullName?.trim();
}

export function formatPublicCustomerName(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  const firstName = parts[0];
  const lastName = parts.at(-1);

  if (!lastName || parts.length === 1) {
    return firstName;
  }

  return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
}
