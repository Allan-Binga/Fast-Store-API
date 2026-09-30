export function safeReturnPath(candidate) {
  if (
    typeof candidate !== "string" ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//")
  ) {
    return "/";
  }

  const destination = new URL(candidate, "https://faststore.local");

  if (destination.origin !== "https://faststore.local") return "/";
  if (["/login", "/signup", "/register"].includes(destination.pathname)) {
    return "/";
  }

  return destination.pathname + destination.search + destination.hash;
}

export function returnPath(location) {
  return safeReturnPath(
    location.pathname + location.search + location.hash,
  );
}
