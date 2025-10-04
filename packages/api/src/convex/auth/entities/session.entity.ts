import type { Doc } from '../../_generated/dataModel';

export type AuthSession = Doc<'authSessions'>;

export type SessionId = AuthSession['_id'];
