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
        const searchString = req.query.search as string | undefined;
        const tag = req.query.tag ? (req.query.tag as string).split(',') : [];
        const IsFeatured = req.query.IsFeatured as string | undefined;
        const filters: { search?: string; tag?: string[]; IsFeatured?: string } = {};
        if (searchString) filters.search = searchString;
        if (tag.length > 0) filters.tag = tag;
        if (IsFeatured) filters.IsFeatured = IsFeatured;
        const result = await postService.getAllPosts(filters);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const postController = {
    createPostHandler,
    getAllPostsHandler
}; 