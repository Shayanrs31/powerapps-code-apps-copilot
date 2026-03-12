import { useEffect } from 'react';
import type { TeamMember } from '../hooks/useTeamDirectory';
import './UserCard.css';

interface Props {
  member: TeamMember;
  onVisible: (member: TeamMember) => void;
}

export function UserCard({ member, onVisible }: Props) {
  // Trigger photo load once the card scrolls into view
  useEffect(() => {
    if (member.photoUrl !== null) return;
    onVisible(member);
  }, [member, onVisible]);

  const initials = member.displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <article className="user-card">
      <div className="user-card__avatar">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={member.displayName} className="user-card__photo" />
        ) : (
          <span className="user-card__initials">{initials}</span>
        )}
      </div>
      <div className="user-card__info">
        <p className="user-card__name">{member.displayName}</p>
        {member.jobTitle && <p className="user-card__title">{member.jobTitle}</p>}
        {member.department && (
          <p className="user-card__meta">
            <span className="user-card__label">Dept</span> {member.department}
          </p>
        )}
        {member.officeLocation && (
          <p className="user-card__meta">
            <span className="user-card__label">Office</span> {member.officeLocation}
          </p>
        )}
        {member.mail && (
          <a href={`mailto:${member.mail}`} className="user-card__email">
            {member.mail}
          </a>
        )}
      </div>
    </article>
  );
}
