import { motion } from "framer-motion";
import { TeamCard } from "@/components/TeamCard";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageContent } from "@/hooks/usePageContent";
import { SEO } from "@/components/SEO";

const HERO_DEFAULTS = {
  title: "Our",
  highlight: "Team",
  subtitle: "A team of entrepreneurs, operators, and investors united by a shared mission.",
};

export default function Team() {
  const { getSectionData } = usePageContent("team");
  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const heroData = getSectionData<Record<string, string>>("hero") || {};
  
  const hero = {
    title: heroData.title || HERO_DEFAULTS.title,
    highlight: heroData.highlight || HERO_DEFAULTS.highlight,
    subtitle: heroData.subtitle || HERO_DEFAULTS.subtitle,
  };

  const generalPartners = teamMembers.filter(m => m.category === "gp");
  const investmentCommittee = teamMembers.filter(m => m.category === "ic");
  const apacAdvisors = teamMembers.filter(m => m.category === "apac");

  return (
    <>
      <SEO
        title="Our Team"
        description="Meet the Valuence Ventures team - entrepreneurs, operators, and investors united by a shared mission to accelerate planetary and human health through deeptech."
        keywords="venture capital team, general partners, investment committee, deeptech investors, cleantech experts"
      />
      <div className="min-h-screen pt-20" data-testid="page-team">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-background" data-testid="section-team-hero">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight"
              data-testid="text-team-hero-title"
            >
              {hero.title} <span className="text-gradient">{hero.highlight}</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mt-6 leading-relaxed " data-testid="text-team-intro">
              {hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* General Partners Section */}
      <section className="py-20 bg-card" data-testid="section-general-partners">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-widest" data-testid="text-gp-label">
              Leadership
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mt-2"
              data-testid="text-gp-title"
            >
              General Partners
            </h2>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {generalPartners.map((member, index) => (
                <TeamCard key={member.id} member={member} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Investment Committee Section */}
      <section className="py-20 bg-background" data-testid="section-investment-committee">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-widest" data-testid="text-ic-label">
              Strategic Guidance
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mt-2"
              data-testid="text-ic-title"
            >
              Investment Committee
            </h2>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {investmentCommittee.map((member, index) => (
                <TeamCard key={member.id} member={member} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* APAC Advisors Section */}
      <section className="py-20 bg-card" data-testid="section-apac-advisors">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-widest" data-testid="text-apac-label">
              Regional Expertise
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mt-2"
              data-testid="text-apac-title"
            >
              APAC / Special Advisors
            </h2>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {apacAdvisors.map((member, index) => (
                <TeamCard key={member.id} member={member} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
    </>
  );
}
