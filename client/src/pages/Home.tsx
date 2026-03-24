import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Leaf,
  FlaskConical,
  Globe,
  Users,
  TrendingUp,
  Award,
  Dna,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamCard } from "@/components/TeamCard";
import { PortfolioCard, resolveLogoUrl } from "@/components/PortfolioCard";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember, PortfolioCompany } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageContent } from "@/hooks/usePageContent";
import { SEO, StructuredData } from "@/components/SEO";
import deeptechMeshImage from "/media__1773421564429.jpg";
import heroVideo from "@assets/VV_Looped_01_1764575959581.mp4";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const iconMap: Record<string, LucideIcon> = {
  Leaf,
  FlaskConical,
  Globe,
  Users,
  TrendingUp,
  Award,
  Dna,
  Rocket,
};

function getIcon(iconName: string | undefined): LucideIcon {
  if (!iconName) return Leaf;
  return iconMap[iconName] || Leaf;
}

const HERO_DEFAULTS = {
  title: "CREATING A CLEANER AND HEALTHIER FUTURE THROUGH THE POWER OF",
  highlight: "DEEPTECH",
  subtitle:
    "We invest in visionary founders developing world-changing technologies that accelerate planetary and human health.",
  button1Text: "Our Focus",
  button1Link: "/focus",
  button2Text: "View Portfolio",
  button2Link: "/portfolio",
};

const FOCUS_INTRO_DEFAULTS = {
  label: "Our Focus",
  title: "DEEPTECH ACCELERATING",
  highlight: "CLEANTECH & TECHBIO",
  description:
    "Deeptech is the unsung hero powering a greener future and accelerating medical breakthroughs that refine global healthcare.",
};

const TEAM_INTRO_DEFAULTS = {
  title: "WE HAVE BUILT, SCALED & EXITED BUSINESSES.",
  highlight: "",
};

const DEFAULT_FOCUS_CARDS = [
  {
    icon: "Leaf",
    title: "Cleantech",
    description:
      "Zero-emission processes and advanced materials that slash waste and cut carbon",
  },
  {
    icon: "Dna",
    title: "Techbio",
    description:
      "AI-first discovery engines and regenerative platforms for novel therapies",
  },
  {
    icon: "Globe",
    title: "Global Reach",
    description: "North America & Asia - Two ecosystems, one global sandbox",
  },
  {
    icon: "Rocket",
    title: "Pre-Seed to Series A",
    description: "Early-stage investments in world-changing technologies",
  },
];

const DEFAULT_TEAM_POINTS = [
  { icon: "Award", prefix: "Entrepreneurs", text: "with 5 successful exits" },
  {
    icon: "TrendingUp",
    prefix: "Operators",
    text: "who scaled cleantech & techbio businesses",
  },
  {
    icon: "Users",
    prefix: "Investors",
    text: "who actively support visionary founders",
  },
];

export default function Home() {
  const {
    getSectionData,
    isLoading: isLoadingContent,
    isError,
  } = usePageContent("home");

  const heroData = getSectionData<Record<string, string>>("hero") || {};
  const focusIntroData =
    getSectionData<Record<string, string>>("focus_intro") || {};
  const focusCardsData = getSectionData<{
    cards?: Array<{ icon: string; title: string; description: string }>;
  }>("focus_cards");
  const teamIntroData =
    getSectionData<{
      title?: string;
      highlight?: string;
      points?: Array<{ icon: string; prefix: string; text: string }>;
    }>("team_intro") || {};

  const { data: teamMembers = [], isLoading: isLoadingTeam } = useQuery<
    TeamMember[]
  >({
    queryKey: ["/api/team"],
  });

  const { data: portfolioCompanies = [], isLoading: isLoadingPortfolio } =
    useQuery<PortfolioCompany[]>({
      queryKey: ["/api/portfolio"],
    });

  const generalPartners = teamMembers.filter((m) => m.category === "gp");
  const investmentCommittee = teamMembers.filter((m) => m.category === "ic");
  const apacAdvisors = teamMembers.filter((m) => m.category === "apac");

  const hero = {
    title: heroData.title || HERO_DEFAULTS.title,
    highlight: heroData.highlight || HERO_DEFAULTS.highlight,
    subtitle: heroData.subtitle || HERO_DEFAULTS.subtitle,
    button1Text: heroData.button1Text || HERO_DEFAULTS.button1Text,
    button1Link: heroData.button1Link || HERO_DEFAULTS.button1Link,
    button2Text: heroData.button2Text || HERO_DEFAULTS.button2Text,
    button2Link: heroData.button2Link || HERO_DEFAULTS.button2Link,
  };

  const focusIntro = {
    label: focusIntroData.label || FOCUS_INTRO_DEFAULTS.label,
    title: focusIntroData.title || FOCUS_INTRO_DEFAULTS.title,
    highlight: focusIntroData.highlight || FOCUS_INTRO_DEFAULTS.highlight,
    description: focusIntroData.description || FOCUS_INTRO_DEFAULTS.description,
  };

  const teamIntro = {
    title: teamIntroData.title || TEAM_INTRO_DEFAULTS.title,
    highlight: teamIntroData.highlight || TEAM_INTRO_DEFAULTS.highlight,
  };

  const focusCards =
    focusCardsData?.cards && focusCardsData.cards.length > 0
      ? focusCardsData.cards
      : DEFAULT_FOCUS_CARDS;
  const teamPoints =
    teamIntroData?.points && teamIntroData.points.length > 0
      ? teamIntroData.points
      : DEFAULT_TEAM_POINTS;

  useEffect(() => {
    if (portfolioCompanies.length > 0) {
      const preloadedUrls = new Set<string>();
      portfolioCompanies.forEach((company) => {
        const resolvedUrl = resolveLogoUrl(company.logoUrl);
        if (resolvedUrl && !preloadedUrls.has(resolvedUrl)) {
          preloadedUrls.add(resolvedUrl);
          const img = new Image();
          img.src = resolvedUrl;
        }
      });
    }
  }, [portfolioCompanies]);

  return (
    <>
      <SEO
        title="Home"
        description="Valuence Ventures - Creating a cleaner and healthier future through the power of deeptech. We invest in visionary founders developing world-changing technologies in cleantech and techbio."
        keywords="venture capital, deeptech, cleantech, techbio, investment, startups, Valuence Ventures"
      />
      <StructuredData />
      <div className="min-h-screen" data-testid="page-home">
        {/* Hero Section */}
        <section
          className="relative h-screen flex items-center justify-center overflow-hidden"
          data-testid="section-hero"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="video-hero-background"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 hero-gradient-full" />

          <div className="relative z-10 px-6 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <h1
                className="font-bold text-white leading-tight tracking-tight mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                data-testid="text-hero-title"
              >
                {hero.title}{" "}
                <span className="text-gradient">{hero.highlight}</span>
              </h1>
              <p
                className="text-lg md:text-xl text-white/80 max-w-2xl mb-10"
                data-testid="text-hero-subtitle"
              >
                {hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={hero.button1Link}>
                  <Button
                    size="lg"
                    className="gap-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white w-full sm:w-44 justify-center"
                    data-testid="button-hero-focus"
                  >
                    {hero.button1Text}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={hero.button2Link}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 backdrop-blur-md border-white/30 text-white hover:bg-white/10 w-full sm:w-44 justify-center"
                    data-testid="button-hero-portfolio"
                  >
                    {hero.button2Text}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            data-testid="scroll-indicator"
          >
            <ChevronDown className="w-8 h-8 text-white/60 animate-bounce" />
          </motion.div>
        </section>

        {/* Our Focus Section */}
        <section
          className="py-24 md:py-32 bg-background"
          data-testid="section-our-focus"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span
                  className="text-accent text-sm font-semibold uppercase tracking-widest"
                  data-testid="text-focus-label"
                >
                  {focusIntro.label}
                </span>
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 leading-tight"
                  data-testid="text-focus-title"
                >
                  {focusIntro.title} <br />
                  <span className="text-gradient">{focusIntro.highlight}</span>
                </h2>
                <p
                  className="hidden md:block text-lg text-muted-foreground mt-6 leading-relaxed"
                  data-testid="text-focus-description"
                >
                  {focusIntro.description}
                </p>
                <Link href="/focus">
                  <Button
                    className="mt-8 gap-2"
                    data-testid="button-section-focus"
                  >
                    Our Focus
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden">
                  <img
                    src="/objects/uploads/5b5e42b5-2f58-4655-b9ea-5fb397180412"
                    alt="Deeptech innovation"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={600}
                    height={450}
                    data-testid="img-focus-section"
                  />
                </div>
              </motion.div>
            </div>

            {/* Focus Areas Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
              {focusCards.map((card, index) => {
                const IconComponent = getIcon(card.icon);
                const cardId = (card.title || `card-${index}`)
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                return (
                  <motion.div
                    key={cardId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-card rounded-lg border border-card-border p-6 hover-elevate"
                    data-testid={`card-focus-${cardId}`}
                  >
                    <IconComponent className="w-10 h-10 text-accent mb-4" />
                    <h3
                      className="font-semibold text-foreground text-lg"
                      data-testid={`text-focus-card-title-${cardId}`}
                    >
                      {card.title || "Feature"}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground mt-2"
                      data-testid={`text-focus-card-desc-${cardId}`}
                    >
                      {card.description || ""}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section
          className="py-24 md:py-32 bg-card"
          data-testid="section-team-preview"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span
                  className="text-accent text-sm font-semibold uppercase tracking-widest"
                  data-testid="text-team-label"
                >
                  Team
                </span>
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 leading-tight"
                  data-testid="text-team-title"
                >
                  {teamIntro.title}
                  {teamIntro.highlight && (
                    <span className="text-gradient">
                      {" "}
                      {teamIntro.highlight}
                    </span>
                  )}
                </h2>
                <div className="mt-8 space-y-4">
                  {teamPoints.map((point, index) => {
                    const IconComponent = getIcon(point.icon);
                    const pointId = (
                      point.prefix || `point-${index}`
                    ).toLowerCase();
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4"
                        data-testid={`team-point-${pointId}`}
                      >
                        <IconComponent className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                        <p className="text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {point.prefix || ""}
                          </span>{" "}
                          {point.text || ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <Link href="/team">
                  <Button
                    className="mt-8 gap-2"
                    data-testid="button-section-team"
                  >
                    Our Team
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>

              <div className="hidden md:block space-y-8">
                {isLoadingTeam ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-48 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* General Partners */}
                    <div data-testid="team-group-gp">
                      <h3
                        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4"
                        data-testid="text-gp-label"
                      >
                        General Partners
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {generalPartners.map((member, index) => (
                          <TeamCard
                            key={member.id}
                            member={member}
                            index={index}
                            showBio={false}
                            showTitle={false}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Investment Committee */}
                    <div data-testid="team-group-ic">
                      <h3
                        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4"
                        data-testid="text-ic-label"
                      >
                        Investment Committee
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {investmentCommittee.map((member, index) => (
                          <TeamCard
                            key={member.id}
                            member={member}
                            index={index}
                            showBio={false}
                            showTitle={false}
                          />
                        ))}
                      </div>
                    </div>

                    {/* APAC Advisors */}
                    <div data-testid="team-group-apac">
                      <h3
                        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4"
                        data-testid="text-apac-label"
                      >
                        APAC / Special Advisors
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {apacAdvisors.map((member, index) => (
                          <TeamCard
                            key={member.id}
                            member={member}
                            index={index}
                            showBio={false}
                            showTitle={false}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section
          className="py-24 md:py-32 bg-background"
          data-testid="section-portfolio-preview"
        >
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span
                className="text-accent text-sm font-semibold uppercase tracking-widest"
                data-testid="text-portfolio-label"
              >
                Portfolio
              </span>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4"
                data-testid="text-portfolio-title"
              >
                Investing in the Future
              </h2>
              <p
                className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto"
                data-testid="text-portfolio-description"
              >
                World-changing technologies accelerating planetary and human
                health.
              </p>
            </motion.div>

            {isLoadingPortfolio ? (
              <div className="flex gap-4 justify-center">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton
                    key={i}
                    className="w-48 h-48 flex-shrink-0 rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div>
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {portfolioCompanies.map((company, index) => (
                      <CarouselItem
                        key={company.id}
                        className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/6"
                      >
                        <PortfolioCard company={company} index={index} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center gap-4 mt-8">
                    <CarouselPrevious
                      className="static translate-x-0 translate-y-0"
                      data-testid="button-carousel-prev"
                    />
                    <CarouselNext
                      className="static translate-x-0 translate-y-0"
                      data-testid="button-carousel-next"
                    />
                  </div>
                </Carousel>
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/portfolio">
                <Button
                  variant="outline"
                  className="gap-2"
                  data-testid="button-view-full-portfolio"
                >
                  View Full Portfolio
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
