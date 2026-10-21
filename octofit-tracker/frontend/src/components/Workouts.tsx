import { useApiResource } from './useApiResource.js';
import { apiPaths, getJson } from '../api/client.js';

type WorkoutSuggestion = {
  _id?: string;
  title?: string;
  focus: string;
  minutes: number;
  difficulty: string;
  reason: string;
};

type WorkoutsResponse = { suggestions: WorkoutSuggestion[] };

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const state = useApiResource<WorkoutsResponse>(apiPaths.workoutSuggestions(userEmail), getJson);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Workout suggestions</h2>
    <p>Recommend workouts from activity patterns.</p>
    {state.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
    {state.status === 'error' && <p role="alert">Unable to load workout suggestions: {state.message}</p>}
    {state.status === 'success' && (state.data.suggestions.length === 0
      ? <p>No workout suggestions yet.</p>
      : <ul className="list-group list-group-flush">{state.data.suggestions.map((suggestion, index) => (
        <li className="list-group-item px-0" key={suggestion._id ?? `${suggestion.title ?? 'workout'}-${index}`}>
          <h3 className="h6 mb-1">{suggestion.title ?? suggestion.focus ?? 'Workout'}</h3>
          {(suggestion.minutes || suggestion.difficulty) && <p className="mb-1">
            {[suggestion.minutes && `${suggestion.minutes} minutes`, suggestion.difficulty].filter(Boolean).join(' · ')}
          </p>}
          <p className="mb-0 text-body-secondary">{suggestion.reason}</p>
        </li>
      ))}</ul>)}
  </div></section>;
}
