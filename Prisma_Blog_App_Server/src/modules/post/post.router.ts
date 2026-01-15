import express, { Router, Request, Response, NextFunction } from "express";
import { postController } from "./post.controller";

const router: Router = express.Router();

// auth middleware
const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("middleware");
    next();
  };
};

// use auth middleware on this route
router.post("/", auth(), postController.createPostHandler);

export const postRouter: Router = router;
