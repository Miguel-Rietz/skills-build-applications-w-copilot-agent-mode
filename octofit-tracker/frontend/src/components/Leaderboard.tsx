import { useApiResource } from './useApiResource.js';
import { apiPaths, getJson } from '../api/client.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const state = useApiResource<LeaderboardResponse>(
    apiPaths.leaderboard,
    () => getJson<LeaderboardResponse>(apiPaths.leaderboard),
  );

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Leaderboard</h2>
    <p>Compare team point totals.</p>
    {state.status === 'loading' && <p role="status">Loading leaderboard...</p>}
    {state.status === 'error' && <p role="alert">Unable to load leaderboard: {state.message}</p>}
    {state.status === 'success' && (state.data.leaderboard.length === 0
      ? <p>No leaderboard rankings yet.</p>
      : <div className="table-responsive"><table className="table table-striped align-middle mb-0">
        <thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Points</th></tr></thead>
        <tbody>{state.data.leaderboard.map((entry) => (
          <tr key={`${entry.rank}-${entry.teamName}`}>
            <th scope="row">{entry.rank}</th><td>{entry.teamName}</td><td>{entry.totalPoints}</td>
          </tr>
        ))}</tbody>
      </table></div>)}
  </div></section>;
}
