"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
  Upload,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuizItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

const STEPS = [
  { id: 1, name: "Basic Info", description: "Title, category, and description" },
  { id: 2, name: "Add Items", description: "Add items to your tournament" },
  { id: 3, name: "Preview", description: "Review and publish" },
];

export default function CreateGamePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");

  // Form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [language, setLanguage] = useState("en");
  const [isNsfw, setIsNsfw] = useState(false);
  const [visibility, setVisibility] = useState<"PUBLIC" | "UNLISTED" | "PRIVATE">("PUBLIC");
  const [items, setItems] = useState<QuizItem[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const addItem = () => {
    const newItem: QuizItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
      imageUrl: "",
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuizItem, value: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const bulkAddItems = (text: string) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newItems: QuizItem[] = lines.map((line) => ({
      id: Date.now().toString() + Math.random(),
      name: line,
      description: "",
      imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
    }));

    setItems([...items, ...newItems]);
  };

  const validateStep = (step: number): boolean => {
    setError("");

    if (step === 1) {
      if (!title.trim()) {
        setError("Title is required");
        return false;
      }
      if (title.trim().length < 3) {
        setError("Title must be at least 3 characters");
        return false;
      }
      if (!description.trim()) {
        setError("Description is required");
        return false;
      }
      if (description.trim().length < 10) {
        setError("Description must be at least 10 characters");
        return false;
      }
      if (!coverImageUrl.trim()) {
        setError("Cover image URL is required");
        return false;
      }
      if (!categoryId) {
        setError("Please select a category");
        return false;
      }
    }

    if (step === 2) {
      if (items.length < 4) {
        setError("You need at least 4 items for a tournament");
        return false;
      }
      if (items.length > 64) {
        setError("Maximum 64 items allowed");
        return false;
      }
      const emptyItems = items.filter((item) => !item.name.trim() || !item.imageUrl.trim());
      if (emptyItems.length > 0) {
        setError("All items must have a name and image URL");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          coverImageUrl,
          categoryId,
          language,
          isNsfw,
          visibility,
          items: items.map(({ id, ...item }) => item),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create quiz");
      }

      const data = await response.json();
      router.push(`/worldcup/${data.quiz.slug}`);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Create Your Tournament</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Build Your Quiz
          </h1>
          <p className="text-muted-foreground text-lg">
            Create a worldcup-style tournament in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                    currentStep > step.id
                      ? "bg-primary text-white glow"
                      : currentStep === step.id
                      ? "bg-primary text-white glow-strong"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">{step.name}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-1 flex-1 mx-4 rounded transition-all",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive"
          >
            {error}
          </motion.div>
        )}

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Tell us about your tournament
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Best Anime Characters 2024"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground">
                      {title.length}/100 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      className="flex min-h-[120px] w-full rounded-xl border border-input bg-card/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                      placeholder="Describe your tournament..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {description.length}/1000 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image URL *</Label>
                    <Input
                      id="coverImage"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                    />
                    {coverImageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-border">
                        <img
                          src={coverImageUrl}
                          alt="Cover preview"
                          className="w-full aspect-video object-cover"
                          onError={() => setCoverImageUrl("")}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setCategoryId(category.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-left",
                            categoryId === category.id
                              ? "border-primary bg-primary/10 glow"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="text-2xl mb-2">{category.icon}</div>
                          <div className="font-medium">{category.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        className="flex h-11 w-full rounded-xl border border-input bg-card/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="tr">Türkçe</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="visibility">Visibility</Label>
                      <select
                        id="visibility"
                        className="flex h-11 w-full rounded-xl border border-input bg-card/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        value={visibility}
                        onChange={(e) =>
                          setVisibility(e.target.value as any)
                        }
                      >
                        <option value="PUBLIC">Public</option>
                        <option value="UNLISTED">Unlisted</option>
                        <option value="PRIVATE">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="nsfw"
                      checked={isNsfw}
                      onChange={(e) => setIsNsfw(e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <Label htmlFor="nsfw" className="cursor-pointer">
                      Mark as NSFW (18+)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Add Items */}
            {currentStep === 2 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Add Tournament Items</CardTitle>
                  <CardDescription>
                    Add at least 4 items (maximum 64)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bulk Add */}
                  <div className="space-y-2">
                    <Label>Bulk Add (one per line)</Label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-xl border border-input bg-card/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                      placeholder="Paste item names, one per line..."
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          bulkAddItems(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Default images will be added. You can customize them below.
                    </p>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="glass-strong p-4 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            Item {index + 1}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Name *</Label>
                            <Input
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) =>
                                updateItem(item.id, "name", e.target.value)
                              }
                              maxLength={100}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label>Image URL *</Label>
                            <Input
                              type="url"
                              placeholder="https://..."
                              value={item.imageUrl}
                              onChange={(e) =>
                                updateItem(item.id, "imageUrl", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label>Description (optional)</Label>
                          <Input
                            placeholder="Short description"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(item.id, "description", e.target.value)
                            }
                            maxLength={500}
                          />
                        </div>

                        {item.imageUrl && (
                          <div className="rounded-lg overflow-hidden border border-border">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-32 object-cover"
                              onError={() =>
                                updateItem(item.id, "imageUrl", "")
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addItem}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>

                  <div className="text-sm text-muted-foreground text-center">
                    {items.length} / 64 items
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Preview */}
            {currentStep === 3 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Preview & Publish</CardTitle>
                  <CardDescription>
                    Review your tournament before publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Preview Card */}
                  <div className="glass-strong rounded-2xl overflow-hidden">
                    {coverImageUrl && (
                      <div className="relative aspect-video">
                        <img
                          src={coverImageUrl}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                            {title}
                          </h3>
                        </div>
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      <p className="text-muted-foreground">{description}</p>

                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                          {categories.find((c) => c.id === categoryId)?.name}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-muted text-sm">
                          {items.length} items
                        </span>
                        <span className="px-3 py-1 rounded-full bg-muted text-sm">
                          {visibility}
                        </span>
                        {isNsfw && (
                          <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm">
                            NSFW
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {items.slice(0, 8).map((item) => (
                          <div
                            key={item.id}
                            className="aspect-square rounded-lg overflow-hidden border border-border"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {items.length > 8 && (
                          <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
                            +{items.length - 8}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Ready to publish? Click the button below to create your
                    tournament!
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button variant="gradient" onClick={nextStep} disabled={loading}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="gradient"
              onClick={handleSubmit}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Publish Tournament
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
