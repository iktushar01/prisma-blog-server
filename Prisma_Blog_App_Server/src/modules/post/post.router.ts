import express, { Router } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";
const router: Router = express.Router();

// use auth middleware on this route

router.get("/",
  postController.getAllPostsHandler
);
router.post("/", auth(UserRole.USER), postController.createPostHandler);

export const postRouter: Router = router;
