import { NextResponse, NextRequest } from "next/server";
import client from "@/libs/prismadb";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, userName, bio, email, userAuthId, profileImage } = body;

  if (!name || !userName || !email) {
    return NextResponse.json(
      { error: "Name, Username, and Email are required" },
      { status: 400 }
    );
  }

  try {
    const existingUser = await client.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    const createUser = await client.user.create({
      data: {
        name,
        userName,
        bio,
        email,
        userAuthId,
        profileImage,
      },
    });
    return NextResponse.json(createUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await client.user.findUnique({
      where: { userAuthId: userId },
      include: {
        posts: {
          include: {
            comments: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { ...userData } = user;

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { coverImage, userName } = body;

    const existingUser = await client.user.findFirst({
      where: { userName },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (existingUser.userAuthId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updatedUser = await client.user.update({
      where: {
        userName: userName,
      },
      data: {
        coverImage,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating cover image:", error);
    return NextResponse.json(
      { message: "Failed to update cover image" },
      { status: 500 }
    );
  }
}
