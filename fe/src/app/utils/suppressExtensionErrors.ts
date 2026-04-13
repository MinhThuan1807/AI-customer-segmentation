/**
 * suppressExtensionErrors.ts
 * --------------------------
 * Suppresses runtime errors caused by browser extensions (e.g. MetaMask, Coinbase Wallet)
 * that attempt to redefine `window.ethereum` when it has already been set as
 * non-configurable by another extension.
 *
 * This error is NOT from our app — it originates entirely from browser extension
 * conflicts. We silence it so it doesn't surface as a false alarm in the console.
 *
 * IMPORTANT: This file must be imported FIRST, before any other module in App.tsx.
 */

if (typeof window !== "undefined") {
  // ── Strategy 1: Intercept Object.defineProperty calls on window.ethereum ──
  // Some extensions use Object.defineProperty to inject window.ethereum.
  // If it's already defined as non-configurable, this throws a TypeError.
  // We wrap defineProperty to catch only that specific failure silently.
  const _nativeDefineProperty = Object.defineProperty.bind(Object);

  try {
    Object.defineProperty(Object, "defineProperty", {
      configurable: true,
      writable: true,
      value: function defineProperty(
        obj: object,
        prop: PropertyKey,
        descriptor: PropertyDescriptor
      ) {
        // Only intercept window.ethereum redefinition attempts
        if (obj === window && prop === "ethereum") {
          try {
            return _nativeDefineProperty(obj, prop, descriptor);
          } catch {
            // Silently ignore — another extension already owns window.ethereum
            return obj;
          }
        }
        // All other defineProperty calls pass through normally
        return _nativeDefineProperty(obj, prop, descriptor);
      },
    });
  } catch {
    // If we can't wrap defineProperty itself, fall back to the error event approach
  }

  // ── Strategy 2: Suppress via window error event ──
  // Catches any uncaught errors related to ethereum property redefinition
  // that slip past Strategy 1.
  const handleWindowError = (event: ErrorEvent) => {
    const msg = event?.message ?? "";
    if (
      msg.includes("ethereum") &&
      (msg.includes("redefine") || msg.includes("Cannot redefine property"))
    ) {
      event.preventDefault(); // prevent the error from showing in the console
      event.stopImmediatePropagation();
    }
  };

  window.addEventListener("error", handleWindowError, { capture: true });
}
