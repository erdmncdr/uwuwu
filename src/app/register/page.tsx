"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useI18n } from "@/components/providers/i18n-provider";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.errors.passwordsDontMatch"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("auth.errors.genericError"));
        return;
      }

      // Redirect to home after successful registration
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(t("auth.errors.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glow">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-strong">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">{t("auth.register.title")}</CardTitle>
            <CardDescription className="text-base">
              {t("auth.register.description")}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.register.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.register.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t("auth.register.username")}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t("auth.register.usernamePlaceholder")}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  autoComplete="username"
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_-]+"
                  title="Username can only contain letters, numbers, underscores, and hyphens"
                />
                <p className="text-xs text-muted-foreground">
                  {t("auth.register.usernameHint")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.register.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.register.passwordPlaceholder")}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  {t("auth.register.passwordHint")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.register.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("auth.register.confirmPasswordPlaceholder")}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="text-xs text-muted-foreground">
                {t("auth.register.terms")}{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  {t("auth.register.termsLink")}
                </Link>{" "}
                {t("auth.register.and")}{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  {t("auth.register.privacyLink")}
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("auth.register.submittingBtn")}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t("auth.register.submitBtn")}
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                {t("auth.register.hasAccount")}{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  {t("auth.register.loginLink")}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
