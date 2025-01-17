import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Type definition for the decoded JWT payload
interface DecodedToken extends JwtPayload {
    userId: number;
    username: string;
}

// Middleware to authenticate JWT token
const authenticateJWT = (req: Request, res: Response, next: any): void => {
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        res.status(403).json({ message: 'Access denied. No token provided.' });
        return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            console.error('JWT verification error:', err);
            res.status(403).json({ message: 'Invalid or expired token.' });
            return;
        }
        next();
    });
};

export default authenticateJWT;
