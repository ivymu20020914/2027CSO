import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosForBackend } from './http';

export interface Member {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'member';
}

interface Session { user: Member | null }
interface AuthState {
  user: Member | null;
  isLoading: boolean;
  isError: boolean;
  refresh: () => void;
  updateSession: (session: Session) => Promise<void>;
}

const AuthContext = createContext<AuthState>({ user: null, isLoading: true, isError: false, refresh: () => {}, updateSession: async () => {} });
const sessionKey = ['forum-session'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: sessionKey,
    queryFn: async () => (await axiosForBackend.get<Session>('/api/auth/session')).data,
    refetchInterval: 30_000,
    staleTime: 0,
    retry: false,
  });

  async function updateSession(next: Session) {
    await queryClient.cancelQueries();
    queryClient.setQueryData(sessionKey, next);
    await queryClient.resetQueries({ predicate: query => query.queryKey[0] !== sessionKey[0] });
  }

  useEffect(() => {
    const expired = () => { void updateSession({ user: null }); };
    window.addEventListener('cso-session-expired', expired);
    return () => window.removeEventListener('cso-session-expired', expired);
  }, [queryClient]);

  useEffect(() => {
    void queryClient.resetQueries({ predicate: query => query.queryKey[0] !== sessionKey[0] });
  }, [session.data?.user?.id, queryClient]);

  return <AuthContext.Provider value={{ user: session.data?.user ?? null, isLoading: session.isLoading, isError: session.isError, refresh: () => { void session.refetch(); }, updateSession }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
