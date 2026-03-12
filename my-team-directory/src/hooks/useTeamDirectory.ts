import { Office365UsersService } from '../generated/services/Office365UsersService';
import type { User } from '../generated/models/Office365UsersModel';

import { useCallback, useEffect, useState } from 'react';

export interface TeamMember {
  id: string;
  displayName: string;
  mail: string;
  jobTitle: string;
  department: string;
  officeLocation: string;
  userPrincipalName: string;
  photoUrl: string | null;
}

function mapUser(raw: User): TeamMember {
  return {
    id: raw.Id ?? raw.UserPrincipalName ?? '',
    displayName: raw.DisplayName ?? '—',
    mail: raw.Mail ?? raw.UserPrincipalName ?? '',
    jobTitle: raw.JobTitle ?? '',
    department: raw.Department ?? '',
    officeLocation: raw.OfficeLocation ?? '',
    userPrincipalName: raw.UserPrincipalName ?? '',
    photoUrl: null,
  };
}

export function useTeamDirectory() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Search or list users whenever query changes (debounced)
  const search = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const safeQuery = term.trim() || '*';
      const result = await Office365UsersService.SearchUser(safeQuery);
      const raw = result.data ?? [];
      setMembers(raw.map(mapUser));
    } catch (e) {
      setError((e as Error).message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load a photo for a single member and update list
  const loadPhoto = useCallback(async (member: TeamMember) => {
    try {
      const result = await Office365UsersService.UserPhoto_V2(member.id || member.userPrincipalName);
      if (result.data) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === member.id ? { ...m, photoUrl: `data:image/jpeg;base64,${result.data}` } : m,
          ),
        );
      }
    } catch {
      // Photos are optional — silently ignore failures
    }
  }, []);

  // Debounce search: wait 400 ms after the user stops typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      void search(query);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, search]);

  return { members, loading, error, query, setQuery, loadPhoto };
}
