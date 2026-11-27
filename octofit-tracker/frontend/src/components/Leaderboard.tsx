import { CapabilityCard } from './CapabilityCard.js';
import { useApiResource } from '../api/useApiResource.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const resource = useApiResource<LeaderboardResponse>('/api/leaderboard');
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      resource={resource}
      isEmpty={(data) => data.leaderboard.length === 0}
      emptyMessage="No leaderboard rankings yet."
    >
      {(data) => (
        <ol className="list-group list-group-numbered">
          {data.leaderboard.map((entry) => (
            <li className="list-group-item" key={entry.rank}>
              <strong>{entry.teamName}</strong>: {entry.totalPoints} points
            </li>
          ))}
        </ol>
      )}
    </CapabilityCard>
  );
}
