import { Request, Response } from 'express';
import { postService } from './post.service';
import { PostStatus } from '../../../generated/prisma/enums';
import paginationSortingHelper from '../../helpers/paginationSortinghelper';
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
        const status = req.query.status as PostStatus | undefined;
        const authorId = req.query.authorId as string | undefined;
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;
        const option = paginationSortingHelper(req.query)

        const filters: { search?: string; tag?: string[]; IsFeatured?: boolean; status?: PostStatus } = {};
        if (searchString) filters.search = searchString;
        if (tag.length > 0) filters.tag = tag;
        if (IsFeatured !== undefined) filters.IsFeatured = IsFeatured === 'true';
        if (status) filters.status = status;
        if (authorId) {
            // Assuming you want to filter by authorId as well
            (filters as any).authorId = authorId;
        }
        if (page && limit) {
            (filters as any).page = page;
            (filters as any).limit = limit;
        }
        if (skip) {
            (filters as any).skip = skip;
        }
        if (sortBy) {
            (filters as any).sortBy = sortBy;
        }
        if (sortOrder) {
            (filters as any).sortOrder = sortOrder;
        }
        
        


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