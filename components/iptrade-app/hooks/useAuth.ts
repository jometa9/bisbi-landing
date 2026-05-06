// Demo stub. The real `useAuth` hook returns the user's secret key (used by
// the network client). In the landing demo there is no network — we expose a
// fixed truthy `secretKey` so the providers we copied verbatim believe the
// user is "logged in" and don't bail out early.
export function useAuth() {
  return {
    secretKey: "demo-secret",
    userInfo: null,
    updateInfo: null,
    connectionError: null,
    retryValidation: () => {},
    logout: async () => {},
  };
}
