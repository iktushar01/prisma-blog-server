import { Post, PostStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt">,
  userID: string
) => {
  return prisma.post.create({
    data: {
      ...data,
      authorId: userID,
    },
  });
};

const getAllPosts = async (payload: {
  search?: string;
  tag?: string[];
  IsFeatured?: boolean;
  status?: PostStatus;
  authorId?: string;
}) => {
  const andConditions: any[] = [];

  if (payload.search) {
    andConditions.push({
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
            has: payload.search,
          },
        },
      ],
    });
  }

  if (payload.tag && payload.tag.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: payload.tag,
      },
    });
  }


 if (payload.IsFeatured !== undefined) {
    andConditions.push({
      IsFeatured: payload.IsFeatured,
    });
  }
  
  if (payload.status) {
    andConditions.push({
      status: payload.status,
    });
  }

  if (payload.authorId) {
    andConditions.push({
      authorId: payload.authorId,
    });
  }

  const allPost = await prisma.post.findMany({
    where: andConditions.length > 0 ? { AND: andConditions } : {},
  });

  return allPost;
};

export const postService = {
  createPost,
  getAllPosts,
};
