
export enum UserRole {
  AGENCY_ADMIN = 'AGENCY_ADMIN',
  CLIENT = 'CLIENT'
}

export enum PhaseStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'AI_GENERATE';
  timestamp: string;
  details: string;
}

export interface Phase {
  id: number;
  title: string;
  status: PhaseStatus;
  fields: Record<string, string>;
  feedback?: string;
  approvalTimestamp?: string;
  approvedBy?: string;
  logs: AuditLog[];
}

export interface Proposal {
  id: string;
  title: string;
  clientName: string;
  client_email: string;
  status: ProposalStatus;
  phases: Phase[];
  createdAt: string;
  updatedAt: string;
  logs: AuditLog[];
}

export interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    clientId?: string;
  } | null;
}