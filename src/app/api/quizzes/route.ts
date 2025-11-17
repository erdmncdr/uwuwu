import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

// GET /api/quizzes - List quizzes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "popular"; // popular, latest
    const language = searchParams.get("language");
    const nsfw = searchParams.get("nsfw") === "true";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: "ACTIVE",
      visibility: "PUBLIC",
    };

    if (category && category !== "all") {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (language) {
      where.language = language;
    }

    if (!nsfw) {
      where.isNsfw = false;
    }

    // Build orderBy clause
    let orderBy: any = {};
    if (sort === "latest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "popular") {
      orderBy = { playCount: "desc" };
    } else if (sort === "trending") {
      orderBy = { viewCount: "desc" };
    }

    // Fetch quizzes
    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
              icon: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    return NextResponse.json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create a new quiz (protected)
const createQuizSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  coverImageUrl: z.string().url(),
  categoryId: z.number(),
  language: z.string().default("en"),
  isNsfw: z.boolean().default(false),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("PUBLIC"),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        imageUrl: z.string().url(),
      })
    )
    .min(4)
    .max(64),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = createQuizSchema.parse(body);

    // Generate unique slug
    let slug = slugify(validatedData.title);
    let slugExists = await prisma.quiz.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(validatedData.title)}-${counter}`;
      slugExists = await prisma.quiz.findUnique({ where: { slug } });
      counter++;
    }

    // Create quiz with items in a transaction
    const quiz = await prisma.$transaction(async (tx) => {
      // Create quiz
      const newQuiz = await tx.quiz.create({
        data: {
          slug,
          title: validatedData.title,
          description: validatedData.description,
          coverImageUrl: validatedData.coverImageUrl,
          creatorId: user.id,
          categoryId: validatedData.categoryId,
          language: validatedData.language,
          isNsfw: validatedData.isNsfw,
          visibility: validatedData.visibility,
          type: "WORLDCUP",
          status: "ACTIVE",
          publishedAt: new Date(),
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

      // Create quiz items
      await tx.quizItem.createMany({
        data: validatedData.items.map((item, index) => ({
          quizId: newQuiz.id,
          name: item.name,
          description: item.description || "",
          imageUrl: item.imageUrl,
          orderIndex: index,
        })),
      });

      // Create item stats for each item
      const items = await tx.quizItem.findMany({
        where: { quizId: newQuiz.id },
      });

      await tx.itemStats.createMany({
        data: items.map((item) => ({
          quizItemId: item.id,
        })),
      });

      return newQuiz;
    });

    return NextResponse.json(
      {
        quiz,
        message: "Quiz created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
