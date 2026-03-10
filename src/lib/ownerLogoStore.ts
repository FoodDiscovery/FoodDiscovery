type OwnerLogoListener = () => void;

let ownerLogoUrl: string | null = null;
const listeners = new Set<OwnerLogoListener>();

export function getOwnerLogoUrl() {
  return ownerLogoUrl;
}

export function setOwnerLogoUrl(nextUrl: string | null) {
  ownerLogoUrl = nextUrl;
  listeners.forEach((listener) => listener());
}

export function subscribeOwnerLogoUrl(listener: OwnerLogoListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
