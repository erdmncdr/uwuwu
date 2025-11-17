import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/sessions/[sessionId] - Get session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        finalWinner: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        matches: {
          orderBy: [{ roundNumber: "asc" }, { matchIndex: "asc" }],
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[sessionId] - Update session
const updateSessionSchema = z.object({
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ABORTED"]),
  finalWinnerId: z.string().uuid().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const validatedData = updateSessionSchema.parse(body);

    // Verify session exists
    const existingSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Update session
    const updateData: any = {
      status: validatedData.status,
    };

    if (validatedData.status === "COMPLETED") {
      updateData.finishedAt = new Date();

      if (validatedData.finalWinnerId) {
        updateData.finalWinnerId = validatedData.finalWinnerId;

        // Update final winner stats
        await prisma.itemStats.updateMany({
          where: { quizItemId: validatedData.finalWinnerId },
          data: {
            finalWins: { increment: 1n },
          },
        });
      }
    } else if (validatedData.status === "ABORTED") {
      updateData.finishedAt = new Date();
    }

    const session = await prisma.gameSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json({
      session,
      message: "Session updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
