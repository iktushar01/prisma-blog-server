import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt">,
  userID: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userID,
    },
  });
  return result;
};

const getAllPosts = async (payload: { search?: string }) => {
  const allPost = await prisma.post.findMany({
    where: payload.search
      ? {
          OR: [
            {
              title: {
                contains: payload.search,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: payload.search,
                mode: "insensitive",
              },
            },
            {
              tags: {
                has : payload.search as string,
              }
            }
          ],
        }
      : {}, // no search → get all posts
  });

  return allPost;
};

export const postService = {
  createPost,
  getAllPosts,
};
