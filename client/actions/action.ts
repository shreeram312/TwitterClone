"use server";
import client from "@/libs/prismadb";
export default async function FetchPosts(id: string | "") {
  if (!id) {
    return null;
  }
  const user = await client.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    return null;
  }
  const res = await client.post.findMany({
    where: {
      userId: user.id,
    },

    include: {
      user: {
        select: {
          id: true,
          userName: true,
          name: true,
          profileImage: true,
          createdAt: true,
          posts: true,
        },
      },
      comments: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return res;
}

export async function FetchParticularPost(id: string) {
  if (!id) {
    return null;
  }

  const fetchpost = await client.post.findFirst({
    where: {
      id: id,
    },
    include: {
      user: {
        select: {
          id: true,
          createdAt: true,
          name: true,
          profileImage: true,
          userName: true,
          posts: true,
        },
      },
      comments: {
        select: {
          id: true,
          userId: true,
          postId: true,
          body: true,
        },
      },
    },
  });

  return fetchpost;
}

export async function AddComment(body: string, userId: string, postId: string) {
  if (!body || !userId || !postId) return null;

  const comment = await client.comment.create({
    data: {
      body: body,
      userId: userId,
      postId: postId,
    },
  });

  return comment;
}

export async function FetchComments(postId: string) {
  if (!postId) {
    return null;
  }

  const res = await client.comment.findMany({
    where: {
      postId: postId,
    },
    include: {
      user: {
        select: {
          id: true,
          userName: true,
          profileImage: true,
        },
      },

      post: {
        select: {
          id: true,
          bodyContent: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return res;
}

export async function ToggleLikePost(postId: string, userId: string) {
  const post = await client.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      likedIds: true,
    },
  });

  if (post) {
    if (post.likedIds.includes(userId)) {
      const res = await client.post.update({
        where: { id: postId },
        data: {
          likedIds: {
            set: post.likedIds.filter((id) => id !== userId),
          },
        },
      });
      return res;
    } else {
      const res = await client.post.update({
        where: { id: postId },
        data: {
          likedIds: {
            push: userId,
          },
        },
      });
      return res;
    }
  }

  return { message: "Post not found" };
}

export async function GetAllUsers(id: string) {
  console.log("Fetching users, excluding ID:", id);

  const user = await client.user.findFirst({
    where: {
      id: id,
    },
  });

  if (!user) {
    console.log("User not found with the provided ID:", id);
    return [];
  }

  console.log("Current user to exclude:", user.id);

  const filtered = await client.user.findMany({
    where: {
      id: {
        not: user.id,
      },
    },

    include: {
      posts: true,
      comments: true,
    },
  });

  console.log("Users fetched, excluding the current user:", filtered);

  return filtered;
}
export async function FollowingUser(fromUserId: string, toUserId: string) {
  console.log("Following user:", toUserId, "from user:", fromUserId);

  if (fromUserId === toUserId) {
    return;
  }

  const user = await client?.user.findUnique({
    where: {
      id: fromUserId,
    },
    select: {
      followingIds: true,
      followersIds: true,
    },
  });

  if (user?.followingIds.includes(toUserId)) {
    const updatedUser = await client.user.update({
      where: {
        id: fromUserId,
      },
      data: {
        followingIds: {
          set: user.followingIds.filter((id) => id !== toUserId),
        },
      },
    });

    await client.user.update({
      where: {
        id: toUserId,
      },
      data: {
        followersIds: {
          set: user.followersIds.filter((id) => id !== fromUserId),
        },
      },
    });

    return updatedUser;
  } else {
    const updatedUser = await client.user.update({
      where: {
        id: fromUserId,
      },
      data: {
        followingIds: {
          set: user
            ? Array.from(new Set([...user.followingIds, toUserId]))
            : [],
        },
      },
    });

    await client.user.update({
      where: {
        id: toUserId,
      },
      data: {
        followersIds: {
          set: user
            ? Array.from(new Set([...user.followersIds, fromUserId]))
            : [],
        },
      },
    });

    return updatedUser;
  }
}
