"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, User, Eye } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface QuizCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  creator: {
    username: string;
    avatarUrl: string | null;
  };
  playCount: number;
  viewCount: number;
  category: {
    name: string;
    slug: string;
  };
}

export function QuizCard({ quiz }: { quiz: QuizCardProps }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Link href={`/worldcup/${quiz.slug}`}>
        <Card className="overflow-hidden h-full hover:glow transition-all duration-300 cursor-pointer">
          {/* Cover Image */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={quiz.coverImageUrl}
              alt={quiz.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-60" />

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium glass-strong">
                {quiz.category.name}
              </span>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center glow-strong">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {quiz.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {quiz.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              {/* Creator */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                  {quiz.creator.avatarUrl ? (
                    <img
                      src={quiz.creator.avatarUrl}
                      alt={quiz.creator.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {quiz.creator.username}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  <span>{formatNumber(Number(quiz.playCount))}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(Number(quiz.viewCount))}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
