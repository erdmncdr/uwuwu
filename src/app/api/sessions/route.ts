import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// POST /api/sessions - Create a new game session
const createSessionSchema = z.object({
  quizId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSessionSchema.parse(body);

    // Get current user (optional - allows anonymous play)
    const user = await getCurrentUser();

    // Get client info
    const ipAddress = request.headers.get("x-forwarded-for") ||
                     request.headers.get("x-real-ip") ||
                     "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: validatedData.quizId },
      include: {
        items: true,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Calculate total rounds
    const itemCount = quiz.items.length;
    const totalRounds = Math.ceil(Math.log2(itemCount));

    // Create game session
    const session = await prisma.gameSession.create({
      data: {
        quizId: validatedData.quizId,
        userId: user?.id,
        status: "IN_PROGRESS",
        totalRounds,
        ipAddress,
        userAgent,
      },
    });

    // Increment play count
    await prisma.quiz.update({
      where: { id: validatedData.quizId },
      data: {
        playCount: {
          increment: 1n,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      totalRounds,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
