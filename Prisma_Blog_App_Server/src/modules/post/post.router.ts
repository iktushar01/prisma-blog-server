import express, { Router } from 'express';
import { postController } from './post.controller';

const router = express.Router();

router.post('/', postController.createPostHandler);

export const postRouter :Router= router;