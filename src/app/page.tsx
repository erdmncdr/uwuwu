"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Sparkles } from "lucide-react";
import { QuizCard } from "@/components/quiz/quiz-card";
import { QuizCardSkeleton } from "@/components/quiz/quiz-card-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

// Mock data for demonstration
const MOCK_QUIZZES = [
  {
    id: "1",
    slug: "anime-characters-2024",
    title: "Best Anime Characters of 2024",
    description: "Vote for your favorite anime characters from the latest shows. Who will reign supreme?",
    coverImageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
    creator: {
      username: "animefan_22",
      avatarUrl: null,
    },
    playCount: 15420,
    viewCount: 45230,
    category: {
      name: "Anime",
      slug: "anime",
    },
  },
  {
    id: "2",
    slug: "programming-languages",
    title: "Ultimate Programming Language Battle",
    description: "Which programming language deserves the crown? TypeScript, Python, Rust, or Go?",
    coverImageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
    creator: {
      username: "dev_master",
      avatarUrl: null,
    },
    playCount: 8750,
    viewCount: 23400,
    category: {
      name: "Technology",
      slug: "tech",
    },
  },
  {
    id: "3",
    slug: "food-showdown",
    title: "Ultimate Food Tournament",
    description: "Pizza vs Burgers vs Sushi vs Tacos - choose your ultimate favorite!",
    coverImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    creator: {
      username: "foodie_heaven",
      avatarUrl: null,
    },
    playCount: 24100,
    viewCount: 67800,
    category: {
      name: "Food",
      slug: "food",
    },
  },
  {
    id: "4",
    slug: "movie-franchises",
    title: "Best Movie Franchises Ever",
    description: "From Marvel to Star Wars, Lord of the Rings to Harry Potter - which franchise wins?",
    coverImageUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80",
    creator: {
      username: "cinema_buff",
      avatarUrl: null,
    },
    playCount: 31250,
    viewCount: 89400,
    category: {
      name: "Movies",
      slug: "movies",
    },
  },
  {
    id: "5",
    slug: "video-game-heroes",
    title: "Legendary Video Game Heroes",
    description: "Mario, Link, Master Chief, Kratos - who's the greatest gaming hero of all time?",
    coverImageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
    creator: {
      username: "gamer_pro",
      avatarUrl: null,
    },
    playCount: 18900,
    viewCount: 52300,
    category: {
      name: "Gaming",
      slug: "gaming",
    },
  },
  {
    id: "6",
    slug: "travel-destinations",
    title: "Dream Travel Destinations",
    description: "Paris, Tokyo, New York, Bali - which destination would you choose for your dream vacation?",
    coverImageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    creator: {
      username: "wanderlust",
      avatarUrl: null,
    },
    playCount: 12340,
    viewCount: 38900,
    category: {
      name: "Travel",
      slug: "travel",
    },
  },
];

export default function Home() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const CATEGORIES = [
    { name: t("home.categories.all"), slug: "all" },
    { name: "Anime", slug: "anime" },
    { name: "Gaming", slug: "gaming" },
    { name: "Movies", slug: "movies" },
    { name: "Food", slug: "food" },
    { name: "Technology", slug: "tech" },
    { name: "Travel", slug: "travel" },
  ];

  // Fetch quizzes from API
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          sort: sortBy,
          limit: "12",
        });

        if (selectedCategory && selectedCategory !== "all") {
          params.append("category", selectedCategory);
        }

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await fetch(`/api/quizzes?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }

        const data = await response.json();
        setQuizzes(data.quizzes || []);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes. Please try again later.");
        // Fallback to mock data on error
        setQuizzes(MOCK_QUIZZES);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [selectedCategory, sortBy, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>{t("home.hero.badge")}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          <span className="gradient-text">{t("home.hero.title")}</span>
          <br />
          <span className="text-foreground">{t("home.hero.subtitle")}</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("home.hero.description")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button variant="gradient" size="lg" asChild>
            <a href="/create-game">{t("home.hero.createBtn")}</a>
          </Button>
          <Button variant="outline" size="lg">
            <Filter className="w-4 h-4 mr-2" />
            {t("home.hero.browseBtn")}
          </Button>
        </div>
      </section>

      {/* Filters Section */}
      <section className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("home.search.placeholder")}
            className="pl-12 h-14 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category.slug}
              onClick={() => setSelectedCategory(category.slug)}
              className={cn(
                "px-6 py-2.5 rounded-xl font-medium transition-all duration-300",
                selectedCategory === category.slug
                  ? "bg-primary text-primary-foreground glow"
                  : "glass hover:bg-muted/50"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground">{t("home.sort.label")}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("popular")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                sortBy === "popular"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("home.sort.popular")}
            </button>
            <button
              onClick={() => setSortBy("latest")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                sortBy === "latest"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("home.sort.latest")}
            </button>
          </div>
        </div>
      </section>

      {/* Quizzes Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {quizzes.length === 1
              ? t("home.results.found", { count: quizzes.length })
              : t("home.results.found_other", { count: quizzes.length })
            }
          </h2>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <QuizCardSkeleton key={i} />
            ))}
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">{t("home.results.noResults")}</h3>
            <p className="text-muted-foreground">
              {t("home.results.tryAdjusting")}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
