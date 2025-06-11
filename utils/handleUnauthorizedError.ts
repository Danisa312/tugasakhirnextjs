export function handleUnauthorizedError(error: any) {
  const status =
    (error as any)?.response?.status || // axios-style error
    (error as any)?.status || // fetch-style error
    null;

  if (status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"; // Redirect to login page
    }
  }
}
