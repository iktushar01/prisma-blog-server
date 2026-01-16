
import { Request, Response, NextFunction } from "express";
import { auth as authMiddleware } from "../lib/auth";


export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}
declare global {

  namespace Express {
    interface Request {
      user?: {
        id: string; 
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}
const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try{
      //get user session
    const session = await authMiddleware.api.getSession({
      headers: req.headers as any,
    });
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!session.user.emailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
       role: session.user.role?.toUpperCase() as string,
      emailVerified: session.user.emailVerified,
    };
    if (roles.length && !roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    next();
    }catch(err){
      next(err);
    }
  };
};

export default auth;