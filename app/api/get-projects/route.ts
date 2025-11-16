import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const userId = req.headers.get("userId");

  const session = await auth();

  if (userId !== session?.user?.id) {
    return NextResponse.json({
      message: "Not authenticated",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return NextResponse.json({
      message: "User not found",
    });
  }

  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (projects.length === 0) {
    return NextResponse.json({
      message: "Projects not found",
    });
  }

  return NextResponse.json({
    message: "Proejct Found",
    projects,
  });
}
