import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create categories
  console.log("📁 Creating categories...");
  const categories = [
    { slug: "anime", name: "Anime", description: "Anime characters, shows, and manga", icon: "🎌" },
    { slug: "gaming", name: "Gaming", description: "Video games, characters, and gaming culture", icon: "🎮" },
    { slug: "movies", name: "Movies", description: "Films, franchises, and cinema", icon: "🎬" },
    { slug: "food", name: "Food", description: "Cuisine, dishes, and culinary delights", icon: "🍕" },
    { slug: "tech", name: "Technology", description: "Programming, gadgets, and innovation", icon: "💻" },
    { slug: "travel", name: "Travel", description: "Destinations, cities, and adventures", icon: "✈️" },
    { slug: "music", name: "Music", description: "Artists, bands, and songs", icon: "🎵" },
    { slug: "sports", name: "Sports", description: "Athletes, teams, and competitions", icon: "⚽" },
    { slug: "books", name: "Books", description: "Literature, authors, and stories", icon: "📚" },
    { slug: "other", name: "Other", description: "Everything else", icon: "🌟" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log(`✅ Created ${categories.length} categories`);

  // Create demo user
  console.log("👤 Creating demo user...");
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      username: "demo_user",
      passwordHash: await bcrypt.hash("password123", 12),
      bio: "Demo user for testing the platform",
      preferredLang: "en",
      nsfwAllowed: false,
    },
  });

  console.log(`✅ Created demo user: ${demoUser.username}`);

  // Create sample quizzes
  console.log("🎯 Creating sample quizzes...");

  const animeCategory = await prisma.category.findUnique({ where: { slug: "anime" } });
  const techCategory = await prisma.category.findUnique({ where: { slug: "tech" } });
  const foodCategory = await prisma.category.findUnique({ where: { slug: "food" } });
  const moviesCategory = await prisma.category.findUnique({ where: { slug: "movies" } });

  // Anime Quiz
  if (animeCategory) {
    const animeQuiz = await prisma.quiz.create({
      data: {
        slug: "best-anime-2024",
        title: "Best Anime Characters of 2024",
        description: "Vote for your favorite anime characters from the latest shows. Who will reign supreme in this epic battle?",
        coverImageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
        creatorId: demoUser.id,
        categoryId: animeCategory.id,
        language: "en",
        isNsfw: false,
        visibility: "PUBLIC",
        type: "WORLDCUP",
        status: "ACTIVE",
        playCount: 15420n,
        viewCount: 45230n,
        publishedAt: new Date(),
      },
    });

    // Add items to anime quiz
    const animeItems = [
      { name: "Luffy", description: "Captain of the Straw Hat Pirates", imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80" },
      { name: "Gojo Satoru", description: "The strongest jujutsu sorcerer", imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80" },
      { name: "Eren Yeager", description: "Attack Titan wielder", imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80" },
      { name: "Tanjiro", description: "Demon slayer with a kind heart", imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80" },
      { name: "Edward Elric", description: "The Fullmetal Alchemist", imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80" },
      { name: "Naruto", description: "The Seventh Hokage", imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80" },
      { name: "Light Yagami", description: "Genius with a Death Note", imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80" },
      { name: "Spike Spiegel", description: "Bounty hunter extraordinaire", imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80" },
    ];

    for (let i = 0; i < animeItems.length; i++) {
      await prisma.quizItem.create({
        data: {
          ...animeItems[i],
          quizId: animeQuiz.id,
          orderIndex: i,
        },
      });
    }

    console.log(`✅ Created anime quiz with ${animeItems.length} items`);
  }

  // Tech Quiz
  if (techCategory) {
    const techQuiz = await prisma.quiz.create({
      data: {
        slug: "programming-languages-battle",
        title: "Ultimate Programming Language Battle",
        description: "Which programming language deserves the crown? TypeScript, Python, Rust, or Go? Cast your vote!",
        coverImageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
        creatorId: demoUser.id,
        categoryId: techCategory.id,
        language: "en",
        isNsfw: false,
        visibility: "PUBLIC",
        type: "WORLDCUP",
        status: "ACTIVE",
        playCount: 8750n,
        viewCount: 23400n,
        publishedAt: new Date(),
      },
    });

    const techItems = [
      { name: "TypeScript", description: "Typed JavaScript for scale", imageUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80" },
      { name: "Python", description: "Simple and powerful", imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80" },
      { name: "Rust", description: "Memory safety without GC", imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80" },
      { name: "Go", description: "Simplicity meets concurrency", imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80" },
      { name: "JavaScript", description: "The language of the web", imageUrl: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&q=80" },
      { name: "Java", description: "Write once, run anywhere", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80" },
      { name: "C++", description: "Power and performance", imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80" },
      { name: "Kotlin", description: "Modern JVM language", imageUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&q=80" },
    ];

    for (let i = 0; i < techItems.length; i++) {
      await prisma.quizItem.create({
        data: {
          ...techItems[i],
          quizId: techQuiz.id,
          orderIndex: i,
        },
      });
    }

    console.log(`✅ Created tech quiz with ${techItems.length} items`);
  }

  // Food Quiz
  if (foodCategory) {
    const foodQuiz = await prisma.quiz.create({
      data: {
        slug: "ultimate-food-showdown",
        title: "Ultimate Food Tournament",
        description: "Pizza vs Burgers vs Sushi vs Tacos - choose your ultimate favorite dish!",
        coverImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        creatorId: demoUser.id,
        categoryId: foodCategory.id,
        language: "en",
        isNsfw: false,
        visibility: "PUBLIC",
        type: "WORLDCUP",
        status: "ACTIVE",
        playCount: 24100n,
        viewCount: 67800n,
        publishedAt: new Date(),
      },
    });

    const foodItems = [
      { name: "Pizza", description: "Italian classic perfection", imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" },
      { name: "Sushi", description: "Japanese artistry", imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&q=80" },
      { name: "Burger", description: "American icon", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
      { name: "Tacos", description: "Mexican delight", imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80" },
      { name: "Ramen", description: "Comfort in a bowl", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80" },
      { name: "Pasta", description: "Italian comfort food", imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80" },
      { name: "Fried Chicken", description: "Crispy perfection", imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80" },
      { name: "Pho", description: "Vietnamese soul food", imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80" },
    ];

    for (let i = 0; i < foodItems.length; i++) {
      await prisma.quizItem.create({
        data: {
          ...foodItems[i],
          quizId: foodQuiz.id,
          orderIndex: i,
        },
      });
    }

    console.log(`✅ Created food quiz with ${foodItems.length} items`);
  }

  // Movies Quiz
  if (moviesCategory) {
    const moviesQuiz = await prisma.quiz.create({
      data: {
        slug: "movie-franchises-battle",
        title: "Best Movie Franchises Ever",
        description: "From Marvel to Star Wars, Lord of the Rings to Harry Potter - which franchise wins?",
        coverImageUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80",
        creatorId: demoUser.id,
        categoryId: moviesCategory.id,
        language: "en",
        isNsfw: false,
        visibility: "PUBLIC",
        type: "WORLDCUP",
        status: "ACTIVE",
        playCount: 31250n,
        viewCount: 89400n,
        publishedAt: new Date(),
      },
    });

    const movieItems = [
      { name: "Marvel Cinematic Universe", description: "23+ interconnected films", imageUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&q=80" },
      { name: "Star Wars", description: "A galaxy far, far away", imageUrl: "https://images.unsplash.com/photo-1579566346927-c68383817a25?w=400&q=80" },
      { name: "Lord of the Rings", description: "Epic fantasy trilogy", imageUrl: "https://images.unsplash.com/photo-1608889825148-478625e7f3e7?w=400&q=80" },
      { name: "Harry Potter", description: "Wizarding world magic", imageUrl: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&q=80" },
      { name: "The Dark Knight", description: "Batman trilogy", imageUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80" },
      { name: "James Bond", description: "007 spy adventures", imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80" },
      { name: "Indiana Jones", description: "Archaeological adventures", imageUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=80" },
      { name: "Mission Impossible", description: "Impossible made possible", imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80" },
    ];

    for (let i = 0; i < movieItems.length; i++) {
      await prisma.quizItem.create({
        data: {
          ...movieItems[i],
          quizId: moviesQuiz.id,
          orderIndex: i,
        },
      });
    }

    console.log(`✅ Created movies quiz with ${movieItems.length} items`);
  }

  console.log("✅ Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
