"use client";

import Link from "next/link";
import { Github, Twitter, Heart } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";

export function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg gradient-text">{t("footer.about.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("footer.about.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t("footer.quickLinks.title")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  {t("footer.quickLinks.discover")}
                </Link>
              </li>
              <li>
                <Link href="/create-game" className="hover:text-primary transition-colors">
                  {t("footer.quickLinks.create")}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors">
                  {t("footer.quickLinks.categories")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t("footer.community.title")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {t("footer.community.about")}
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-primary transition-colors">
                  {t("footer.community.guidelines")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  {t("footer.community.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  {t("footer.community.terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t("footer.social.title")}</h4>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{t("footer.bottom.copyright", { year: currentYear })}</p>
          <p className="flex items-center gap-1">
            {t("footer.bottom.madeWith")} <Heart className="w-4 h-4 text-destructive fill-destructive" /> {t("footer.bottom.forQuizLovers")}
          </p>
        </div>
      </div>
    </footer>
  );
}
