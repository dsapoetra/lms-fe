const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("Missing API base URL environment variable: NEXT_PUBLIC_API_BASE_URL");
}

export const getApiUrl = (path: string): string => {
  // Ensure the path doesn't start with a slash if the base URL already has one
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${apiBaseUrl}/${cleanPath}`;
};