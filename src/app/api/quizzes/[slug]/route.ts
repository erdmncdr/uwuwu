import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/quizzes/[slug] - Get quiz details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
          },
        },
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
            icon: true,
            description: true,
          },
        },
        items: {
          orderBy: { orderIndex: "asc" },
          include: {
            stats: true,
          },
        },
        _count: {
          select: {
            gameSessions: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { viewCount: { increment: 1n } },
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[slug] - Update quiz (protected, owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();

    // Find quiz and check ownership
    const existingQuiz = await prisma.quiz.findUnique({
      where: { slug },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (existingQuiz.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to update this quiz" },
        { status: 403 }
      );
    }

    // Update quiz
    const updatedQuiz = await prisma.quiz.update({
      where: { slug },
      data: {
        title: body.title,
        description: body.description,
        coverImageUrl: body.coverImageUrl,
        categoryId: body.categoryId,
        language: body.language,
        isNsfw: body.isNsfw,
        visibility: body.visibility,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      quiz: updatedQuiz,
      message: "Quiz updated successfully",
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[slug] - Delete quiz (protected, owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Find quiz and check ownership
    const quiz = await prisma.quiz.findUnique({
      where: { slug },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (quiz.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to delete this quiz" },
        { status: 403 }
      );
    }

    // Delete quiz (cascade will handle related data)
    await prisma.quiz.delete({
      where: { slug },
    });

    return NextResponse.json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
