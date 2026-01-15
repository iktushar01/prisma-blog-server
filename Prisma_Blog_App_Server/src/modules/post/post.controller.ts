import { Request, Response } from 'express';
import { postService } from './post.service';
const createPostHandler = async (req : Request, res : Response) => {
    try {
        console.log(req.user)
        const result = await postService.createPost(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const postController = {
    createPostHandler
}; 