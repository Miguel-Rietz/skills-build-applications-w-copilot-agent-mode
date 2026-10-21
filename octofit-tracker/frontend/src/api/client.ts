// Relative /api paths go through the Vite dev proxy, so port 8000 never needs to be public.
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export const apiPaths = {
  activities: '/api/activities',
  teams: '/api/teams',
  leaderboard: '/api/leaderboard',
  workoutSuggestions: (userEmail: string) => `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`,
};

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json() as Promise<T>;
}
