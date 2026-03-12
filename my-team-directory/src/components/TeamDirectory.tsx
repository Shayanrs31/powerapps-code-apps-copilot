import { useCallback } from 'react';
import { useTeamDirectory, type TeamMember } from '../hooks/useTeamDirectory';
import { UserCard } from './UserCard';
import './TeamDirectory.css';

export function TeamDirectory() {
  const { members, loading, error, query, setQuery, loadPhoto } = useTeamDirectory();

  const handleLoadPhoto = useCallback(
    (member: TeamMember) => {
      void loadPhoto(member);
    },
    [loadPhoto],
  );

  return (
    <div className="team-dir">
      <header className="team-dir__header">
        <h1 className="team-dir__title">Team Directory</h1>
        <p className="team-dir__subtitle">Search your organisation's people directory</p>
      </header>

      <div className="team-dir__search-bar">
        <svg className="team-dir__search-icon" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M8.5 3a5.5 5.5 0 1 0 3.45 9.81l3.37 3.37a.75.75 0 1 0 1.06-1.06l-3.37-3.37A5.5 5.5 0 0 0 8.5 3Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
            fill="currentColor"
          />
        </svg>
        <input
          className="team-dir__input"
          type="search"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search team members"
        />
        {loading && <span className="team-dir__spinner" aria-label="Loading…" />}
      </div>

      {error && (
        <div className="team-dir__error" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && members.length === 0 && (
        <p className="team-dir__empty">
          {query ? 'No results found.' : 'Type a name to search the directory.'}
        </p>
      )}

      <div className="team-dir__grid">
        {members.map((member) => (
          <UserCard key={member.id || member.userPrincipalName} member={member} onVisible={handleLoadPhoto} />
        ))}
      </div>
    </div>
  );
}
