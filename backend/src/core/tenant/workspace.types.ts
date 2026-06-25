export interface WorkspaceContext {
  organizationId: string;
  slug: string;
  role: string;
  membershipId: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    workspace?: WorkspaceContext;
  }
}