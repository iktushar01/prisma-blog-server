import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";


const createPost = async (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>, userID: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userID,
        },
    });
    return result;
}

export const postService = {
    createPost
};