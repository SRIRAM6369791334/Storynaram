import { Request } from 'express';

export interface UserPayload {
  sub: string;
  email?: string;
  roles: string[];
  [key: string]: unknown;
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}
