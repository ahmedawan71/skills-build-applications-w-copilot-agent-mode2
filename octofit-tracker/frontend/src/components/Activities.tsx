import { CapabilityCard } from './CapabilityCard.js';
import { useApiResource } from '../api/useApiResource.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const resource = useApiResource<ActivityResponse>('/api/activities');
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      resource={resource}
      isEmpty={(data) => data.activities.length === 0}
      emptyMessage="No activities yet."
    >
      {(data) => (
        <ul className="list-group">
          {data.activities.map((activity, index) => (
            <li className="list-group-item" key={activity._id ?? `${activity.type}-${index}`}>
              <strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
