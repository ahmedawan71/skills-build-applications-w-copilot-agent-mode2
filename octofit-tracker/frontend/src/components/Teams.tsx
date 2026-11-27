import { CapabilityCard } from './CapabilityCard.js';
import { useApiResource } from '../api/useApiResource.js';

type Team = { _id?: string; name: string; mascot: string; members: string[] };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  const resource = useApiResource<TeamResponse>('/api/teams');
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      resource={resource}
      isEmpty={(data) => data.teams.length === 0}
      emptyMessage="No teams yet."
    >
      {(data) => (
        <ul className="list-group">
          {data.teams.map((team, index) => (
            <li className="list-group-item" key={team._id ?? `${team.name}-${index}`}>
              <strong>{team.name}</strong> ({team.mascot})
              <span className="d-block">Members: {team.members.length ? team.members.join(', ') : 'None'}</span>
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
