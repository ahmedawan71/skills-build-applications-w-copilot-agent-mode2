import { CapabilityCard } from './CapabilityCard.js';
import { useApiResource } from '../api/useApiResource.js';

/*second push */

type WorkoutSuggestion = {
  _id?: string;
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
};
type WorkoutResponse = { suggestions: WorkoutSuggestion[] };

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const resource = useApiResource<WorkoutResponse>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`);
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      resource={resource}
      isEmpty={(data) => data.suggestions.length === 0}
      emptyMessage="No workout suggestions are available yet."
    >
      {(data) => (
        <ul className="list-group">
          {data.suggestions.map((suggestion, index) => (
            <li className="list-group-item" key={suggestion._id ?? `${suggestion.title}-${index}`}>
              <strong>{suggestion.title}</strong>
              {suggestion.focus && <span>: {suggestion.focus}</span>}
              {suggestion.minutes !== undefined && <span> · {suggestion.minutes} minutes</span>}
              {suggestion.difficulty && <span> · {suggestion.difficulty}</span>}
              {suggestion.reason && <p className="mb-0">{suggestion.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
