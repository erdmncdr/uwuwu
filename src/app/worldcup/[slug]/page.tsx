"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Trophy, User, Eye, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

interface QuizItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
}

interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  playCount: number;
  viewCount: number;
  creator: {
    username: string;
    avatarUrl: string | null;
  };
  category: {
    name: string;
    icon: string | null;
  };
  items: QuizItem[];
}

interface Match {
  roundNumber: number;
  matchIndex: number;
  itemA: QuizItem;
  itemB: QuizItem;
}

export default function WorldcupPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [remainingItems, setRemainingItems] = useState<QuizItem[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(0);
  const [matchesInRound, setMatchesInRound] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [winner, setWinner] = useState<QuizItem | null>(null);
  const [gameLoading, setGameLoading] = useState(false);

  // Fetch quiz details
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { slug } = await params;
        const response = await fetch(`/api/quizzes/${slug}`);

        if (!response.ok) {
          throw new Error("Quiz not found");
        }

        const data = await response.json();
        setQuiz(data.quiz);
      } catch (err: any) {
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [params]);

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Start a new game session
  const startGame = async () => {
    if (!quiz) return;

    setGameLoading(true);
    try {
      // Create game session
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          quizId: quiz.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start game");
      }

      const data = await response.json();
      setSessionId(data.sessionId);

      // Initialize game
      const shuffled = shuffleArray([...quiz.items]);
      setRemainingItems(shuffled);

      // Calculate tournament structure
      const itemCount = shuffled.length;
      const rounds = Math.ceil(Math.log2(itemCount));
      setTotalRounds(rounds);

      // Create first match
      if (shuffled.length >= 2) {
        const matchesToday = Math.floor(shuffled.length / 2);
        setMatchesInRound(matchesToday);
        setCurrentMatchIndex(0);
        setCurrentRound(1);
        setCurrentMatch({
          roundNumber: 1,
          matchIndex: 0,
          itemA: shuffled[0],
          itemB: shuffled[1],
        });
      }

      setGameStarted(true);
    } catch (err: any) {
      setError(err.message || "Failed to start game");
    } finally {
      setGameLoading(false);
    }
  };

  // Handle item selection
  const selectItem = async (chosenItem: QuizItem) => {
    if (!currentMatch || !sessionId) return;

    setGameLoading(true);

    try {
      // Submit match result to API
      await fetch(`/api/sessions/${sessionId}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          roundNumber: currentMatch.roundNumber,
          matchIndex: currentMatch.matchIndex,
          itemAId: currentMatch.itemA.id,
          itemBId: currentMatch.itemB.id,
          chosenItemId: chosenItem.id,
        }),
      });

      // Update local state
      const winners = remainingItems.filter((item, index) => {
        if (index < (currentMatchIndex + 1) * 2) {
          // Already processed matches
          if (index === currentMatchIndex * 2) return item.id === chosenItem.id;
          if (index === currentMatchIndex * 2 + 1) return item.id === chosenItem.id;
          return false;
        }
        return true;
      });

      // Check if round is complete
      const nextMatchIndex = currentMatchIndex + 1;
      const matchesThisRound = Math.floor(remainingItems.length / 2);

      if (nextMatchIndex < matchesThisRound) {
        // More matches in this round
        const nextItemAIndex = nextMatchIndex * 2;
        const nextItemBIndex = nextItemAIndex + 1;

        setCurrentMatchIndex(nextMatchIndex);
        setCurrentMatch({
          roundNumber: currentRound,
          matchIndex: nextMatchIndex,
          itemA: remainingItems[nextItemAIndex],
          itemB: remainingItems[nextItemBIndex],
        });
      } else {
        // Round complete, prepare next round
        const winnersForNextRound: QuizItem[] = [];

        // Collect winners from this round
        for (let i = 0; i <= currentMatchIndex; i++) {
          if (i === currentMatchIndex) {
            winnersForNextRound.push(chosenItem);
          } else {
            // This is a simplification - in production, you'd track all winners
            winnersForNextRound.push(remainingItems[i * 2]);
          }
        }

        // Check if game is over
        if (winnersForNextRound.length === 1) {
          setWinner(chosenItem);
          setCurrentMatch(null);

          // Update session with winner
          await fetch(`/api/sessions/${sessionId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              status: "COMPLETED",
              finalWinnerId: chosenItem.id,
            }),
          });
        } else {
          // Start next round
          setRemainingItems(winnersForNextRound);
          setCurrentRound(currentRound + 1);
          setCurrentMatchIndex(0);
          setMatchesInRound(Math.floor(winnersForNextRound.length / 2));

          if (winnersForNextRound.length >= 2) {
            setCurrentMatch({
              roundNumber: currentRound + 1,
              matchIndex: 0,
              itemA: winnersForNextRound[0],
              itemB: winnersForNextRound[1],
            });
          }
        }
      }
    } catch (err) {
      console.error("Error selecting item:", err);
    } finally {
      setGameLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Quiz Not Found</h1>
          <p className="text-muted-foreground">{error || "The quiz you're looking for doesn't exist"}</p>
          <Link href="/">
            <Button variant="gradient">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {!gameStarted ? (
        // Quiz Info Screen
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden">
            <div className="aspect-video">
              <img
                src={quiz.coverImageUrl}
                alt={quiz.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full glass text-sm font-medium">
                  {quiz.category.icon} {quiz.category.name}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                {quiz.title}
              </h1>
            </div>
          </div>

          {/* Content */}
          <Card className="glass p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">About This Tournament</h2>
              <p className="text-muted-foreground leading-relaxed">
                {quiz.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  {quiz.creator.avatarUrl ? (
                    <img
                      src={quiz.creator.avatarUrl}
                      alt={quiz.creator.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Created by</div>
                  <div className="font-medium">{quiz.creator.username}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Total Plays</div>
                <div className="font-medium flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  {formatNumber(quiz.playCount)}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Views</div>
                <div className="font-medium flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(quiz.viewCount)}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Items</div>
                <div className="font-medium">{quiz.items.length} contestants</div>
              </div>
            </div>

            {/* Start Button */}
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={startGame}
              disabled={gameLoading || quiz.items.length < 2}
            >
              {gameLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Tournament
                </>
              )}
            </Button>
          </Card>

          {/* Item Preview */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contestants</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {quiz.items.map((item) => (
                <div
                  key={item.id}
                  className="glass rounded-xl overflow-hidden group hover:glow transition-all cursor-pointer"
                >
                  <div className="aspect-square">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : winner ? (
        // Winner Screen
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto glow-strong"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Champion!
            </h1>
            <p className="text-xl text-muted-foreground">
              {winner.name} wins the tournament!
            </p>
          </div>

          <Card className="glass overflow-hidden">
            <div className="aspect-square md:aspect-video">
              <img
                src={winner.imageUrl}
                alt={winner.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-bold">{winner.name}</h2>
              {winner.description && (
                <p className="text-muted-foreground">{winner.description}</p>
              )}
            </div>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Play Again
            </Button>
            <Link href="/">
              <Button variant="gradient">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        // Match Screen
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Progress */}
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              Round {currentRound} of {totalRounds}
            </div>
            <div className="text-lg font-semibold">
              Match {currentMatchIndex + 1} of {matchesInRound}
            </div>
            <div className="max-w-md mx-auto h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentMatchIndex + 1) / matchesInRound) * 100}%`,
                }}
                className="h-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </div>

          {/* VS Match */}
          {currentMatch && (
            <div className="grid md:grid-cols-2 gap-8">
              <AnimatePresence mode="wait">
                {[currentMatch.itemA, currentMatch.itemB].map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectItem(item)}
                    disabled={gameLoading}
                    className="group"
                  >
                    <Card className="glass overflow-hidden h-full hover:glow transition-all">
                      <div className="aspect-square relative">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                      </div>
                      <div className="p-6 space-y-2">
                        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Card>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* VS Indicator */}
          <div className="flex justify-center -mt-4 -mb-4 relative z-10">
            <div className="w-16 h-16 rounded-full glass-strong border-4 border-background flex items-center justify-center font-bold text-xl">
              VS
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
