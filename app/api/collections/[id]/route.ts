import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requireUserId = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
};

export async function DELETE(
  request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const collectionId = params?.id;
    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }

    const userId = await requireUserId();

    const deleted = await prisma.collection.deleteMany({
      where: { id: collectionId, userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted: deleted.count });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Unable to delete collection" },
      { status: 400 }
    );
  }
}
