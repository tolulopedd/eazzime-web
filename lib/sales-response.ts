/** Parse backend responses without exposing browser-specific JSON errors or HTML. */
export async function salesResponse(response: Response) {
  const local =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  const unavailable = local
    ? "The sales backend is not running on this preview. Open the site through Netlify Dev to use admin sign-in."
    : "The sales service is currently unavailable. Please try again later or contact info@eazzime.com.";
  const error = (message: string, status = response.status) =>
    Object.assign(new Error(message), { status });
  if (response.status === 429) {
    throw error("Too many requests. Please wait a few minutes and try again.");
  }
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw error(unavailable, 503);
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw error(unavailable, 503);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw error(unavailable, 503);
  }
  if (!response.ok) {
    throw error(typeof data.error === "string" ? data.error : unavailable);
  }
  return data;
}
