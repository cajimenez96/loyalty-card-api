import { Request } from 'express';
import { Role } from '../enums/role.enum.js';

export interface UserPayload {
  userId: string;
  role: Role;
  nombre: string;
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}
