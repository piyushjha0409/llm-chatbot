import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string; // You can replace 'any' with a more specific type if you have one
    }
  }
}
