import { Request, Response } from 'express';
import { postService } from './post.service';
const createPostHandler = async (req : Request, res : Response) => {
    try {
        const userId = req.user?.id;
        console.log(req.user)
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const result = await postService.createPost(req.body, userId as string);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllPostsHandler = async (req: Request, res: Response) => {
    try {
        const posts = await postService.getAllPosts();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const postController = {
    createPostHandler,
    getAllPostsHandler
}; 