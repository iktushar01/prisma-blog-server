import express, { Router, Request, Response, NextFunction } from "express";
import { postController } from "./post.controller";
import {auth as authMiddleware} from '../../lib/auth';
const router: Router = express.Router();

// auth middleware (accepts one or more roles)
const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //get user session
    const session = await authMiddleware.api.getSession({ 
      headers: req.headers as any
    });

    console.log(session)
    next();
  };
};

// use auth middleware on this route
router.post("/",
  auth("ADMIN", "USER"),
  postController.createPostHandler);

export const postRouter: Router = router;
