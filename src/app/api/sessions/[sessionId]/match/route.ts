import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// POST /api/sessions/[sessionId]/match - Submit a match result
const matchSchema = z.object({
  roundNumber: z.number().int().min(1),
  matchIndex: z.number().int().min(0),
  itemAId: z.string().uuid(),
  itemBId: z.string().uuid(),
  chosenItemId: z.string().uuid(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const validatedData = matchSchema.parse(body);

    // Verify session exists
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Session is not active" },
        { status: 400 }
      );
    }

    // Validate chosen item is one of the match items
    if (
      validatedData.chosenItemId !== validatedData.itemAId &&
      validatedData.chosenItemId !== validatedData.itemBId
    ) {
      return NextResponse.json(
        { error: "Chosen item must be one of the match items" },
        { status: 400 }
      );
    }

    // Create match record
    await prisma.match.create({
      data: {
        sessionId,
        roundNumber: validatedData.roundNumber,
        matchIndex: validatedData.matchIndex,
        itemAId: validatedData.itemAId,
        itemBId: validatedData.itemBId,
        chosenItemId: validatedData.chosenItemId,
        respondedAt: new Date(),
      },
    });

    // Update item stats
    const winnerId = validatedData.chosenItemId;
    const loserId =
      validatedData.chosenItemId === validatedData.itemAId
        ? validatedData.itemBId
        : validatedData.itemAId;

    // Update winner stats
    await prisma.itemStats.updateMany({
      where: { quizItemId: winnerId },
      data: {
        winCount: { increment: 1n },
        matchCount: { increment: 1n },
      },
    });

    // Update loser stats
    await prisma.itemStats.updateMany({
      where: { quizItemId: loserId },
      data: {
        lossCount: { increment: 1n },
        matchCount: { increment: 1n },
      },
    });

    return NextResponse.json({
      message: "Match recorded successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error recording match:", error);
    return NextResponse.json(
      { error: "Failed to record match" },
      { status: 500 }
    );
  }
}
