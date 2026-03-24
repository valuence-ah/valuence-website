import type { PortfolioCompany } from "@shared/schema";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function resolveLogoUrl(logoUrl: string | null | undefined): string | null {
  return logoUrl || null;
}

interface PortfolioCardProps {
  company: PortfolioCompany;
  index?: number;
  variant?: "compact" | "full";
}

export function PortfolioCard({ company, index = 0, variant = "compact" }: PortfolioCardProps) {
  const initials = company.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const featuredImage = company.featuredImageUrl || null;
  const logoImage = company.logoUrl || null;

  if (variant === "full") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="group"
        data-testid={`card-portfolio-full-${company.id}`}
      >
        <div className="flex items-center gap-8 bg-card rounded-lg border border-card-border p-6 md:p-8">
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div>
                <h3
                  className="text-xl font-semibold text-foreground"
                  data-testid={`text-company-name-${company.id}`}
                >
                  {company.name}
                </h3>
                {company.category && (
                  <Badge
                    variant="secondary"
                    className="mt-2 capitalize"
                    data-testid={`badge-category-${company.id}`}
                  >
                    {company.category}
                  </Badge>
                )}
              </div>
            </div>
            <p
              className="text-muted-foreground leading-relaxed mb-6"
              data-testid={`text-description-${company.id}`}
            >
              {company.description}
            </p>
            {company.websiteUrl && (
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
                data-testid={`link-website-${company.id}`}
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {logoImage && (
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-lg">
                <AvatarImage width={400} height={400}
                  src={logoImage}
                  alt={`${company.name} logo`}
                  className="object-contain bg-white p-2"
                  loading="lazy"
                />
                <AvatarFallback className="rounded-lg text-2xl">
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.a
      href={company.websiteUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group block"
      data-testid={`card-portfolio-${company.id}`}
    >
      <div className="relative overflow-visible rounded-lg bg-card border border-card-border hover-elevate active-elevate-2 transition-all duration-300">
        <div className="aspect-square overflow-hidden bg-white flex items-center justify-center p-6 rounded-t-lg">
          <Avatar className="w-full h-full rounded-none">
            <AvatarImage
              src={logoImage || ""}
              alt={company.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <AvatarFallback className="w-full h-full rounded-none text-3xl bg-muted">
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="p-4 border-t border-card-border">
          <h3
            className="font-semibold text-foreground group-hover:text-accent transition-colors"
            data-testid={`text-company-${company.id}`}
          >
            {company.name}
          </h3>
          <p
            className="text-sm text-muted-foreground mt-1 line-clamp-2"
            data-testid={`text-short-desc-${company.id}`}
          >
            {company.shortDescription}
          </p>
        </div>
      </div>
    </motion.a>
  );
}
