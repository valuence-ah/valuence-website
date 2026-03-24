import { motion } from "framer-motion";
import { ArrowRight, Filter, Leaf, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PortfolioCard } from "@/components/PortfolioCard";
import { useQuery } from "@tanstack/react-query";
import type { PortfolioCompany } from "@shared/schema";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageContent } from "@/hooks/usePageContent";
import { SEO } from "@/components/SEO";

const HERO_DEFAULTS = {
  title: "Our",
  highlight: "Portfolio",
  subtitle: "World-changing technologies accelerating planetary and human health.",
};

type CategoryFilter = "all" | "cleantech" | "techbio";

export default function Portfolio() {
  const { getSectionData } = usePageContent("portfolio");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");

  const heroData = getSectionData<Record<string, string>>("hero") || {};
  
  const hero = {
    title: heroData.title || HERO_DEFAULTS.title,
    highlight: heroData.highlight || HERO_DEFAULTS.highlight,
    subtitle: heroData.subtitle || HERO_DEFAULTS.subtitle,
  };

  const { data: portfolioCompanies = [], isLoading } = useQuery<PortfolioCompany[]>({
    queryKey: ["/api/portfolio"],
  });

  const filteredCompanies = activeFilter === "all"
    ? portfolioCompanies
    : portfolioCompanies.filter(c => c.category === activeFilter);

  return (
    <>
      <SEO
        title="Our Portfolio"
        description="Explore Valuence Ventures portfolio of world-changing technologies in cleantech and techbio, accelerating planetary and human health."
        keywords="venture capital portfolio, cleantech startups, techbio companies, deeptech investments, climate tech"
      />
      <div className="min-h-screen pt-20" data-testid="page-portfolio">
      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-background" data-testid="section-portfolio-hero">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight"
              data-testid="text-portfolio-hero-title"
            >
              {hero.title} <span className="text-gradient">{hero.highlight}</span>
            </h1>
            <p
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground mt-6 leading-relaxed "
              data-testid="text-portfolio-hero-description"
            >
              {hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section
        className="py-8 bg-card border-y border-border sticky top-20 z-50"
        data-testid="section-portfolio-filter"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by:
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveFilter("all")}
                data-testid="button-filter-all"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={activeFilter === "cleantech" ? "default" : "outline"}
                onClick={() => setActiveFilter("cleantech")}
                className="gap-2"
                data-testid="button-filter-cleantech"
              >
                <Leaf className="w-4 h-4" />
                Cleantech
              </Button>
              <Button
                size="sm"
                variant={activeFilter === "techbio" ? "default" : "outline"}
                onClick={() => setActiveFilter("techbio")}
                className="gap-2"
                data-testid="button-filter-techbio"
              >
                <FlaskConical className="w-4 h-4" />
                Techbio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20 bg-background" data-testid="section-portfolio-grid">
        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="space-y-12">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCompanies.map((company, index) => (
                <PortfolioCard
                  key={company.id}
                  company={company}
                  index={index}
                  variant="full"
                />
              ))}
            </div>
          )}

          {!isLoading && filteredCompanies.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
              data-testid="empty-state-portfolio"
            >
              <p className="text-muted-foreground text-lg" data-testid="text-empty-message">
                No companies found in this category.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setActiveFilter("all")}
                data-testid="button-view-all-fallback"
              >
                View All Companies
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
    </>
  );
}
