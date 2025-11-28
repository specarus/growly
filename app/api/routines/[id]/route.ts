import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/habit-actions";

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message.includes("Routine")) return 400;
  return 500;
};

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params;
  try {
    const userId = await requireUserId();
    const deleted = await prisma.routine.deleteMany({
      where: {
        id,
        userId,
      },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    revalidatePath("/dashboard/habits/routines");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to delete routine. Try again later." },
      { status: 500 }
    );
  }
}
