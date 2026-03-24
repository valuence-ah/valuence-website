import { motion } from "framer-motion";
import { ArrowRight, Leaf, FlaskConical, Globe, Zap, Microscope, Recycle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { usePageContent } from "@/hooks/usePageContent";
import { SEO } from "@/components/SEO";

const deeptechImage = "/api/uploads/80818550-8002-43b7-8708-9cd6e4639616";
const cleantechImage = "/api/uploads/d5517744-a58f-4082-b3a1-0e5b1bde75cf";
const techbioImage = "/api/uploads/b5f57e6c-7f0b-4ec8-a882-f0b950d41fbb";
const globalImage = "/api/uploads/300dd304-dd92-4338-9d07-7a04d650a1d7";

const HERO_DEFAULTS = {
  title: "Our",
  highlight: "Focus",
  subtitle: "Our thesis centers on deeptech innovations that create measurable impact for planetary and human health.",
};

const THESIS_DEFAULTS = {
  label: "Our Thesis",
  title: "DEEPTECH",
  content: "Deeptech companies leverage scientific advances and engineering innovation to solve the world's most pressing challenges. We focus on founders who are building transformative solutions in cleantech and techbio.",
};

export default function Focus() {
  const { getSectionData } = usePageContent("focus");
  
  const heroData = getSectionData<Record<string, string>>("hero") || {};
  const thesisData = getSectionData<Record<string, string>>("text_block") || {};
  
  const hero = {
    title: heroData.title || HERO_DEFAULTS.title,
    highlight: heroData.highlight || HERO_DEFAULTS.highlight,
    subtitle: heroData.subtitle || HERO_DEFAULTS.subtitle,
  };
  
  const thesis = {
    label: thesisData.label || THESIS_DEFAULTS.label,
    title: thesisData.title || THESIS_DEFAULTS.title,
    content: thesisData.content || THESIS_DEFAULTS.content,
  };

  return (
    <>
      <SEO
        title="Our Focus"
        description="Valuence Ventures focuses on deeptech investments in cleantech and techbio. We empower innovations that revolutionize industries across North America and Asia."
        keywords="deeptech investment, cleantech, techbio, climate technology, biotechnology, venture capital focus"
      />
      <div className="min-h-screen pt-20" data-testid="page-focus">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-background" data-testid="section-focus-hero">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight"
              data-testid="text-focus-hero-title"
            >
              {hero.title} <span className="text-gradient">{hero.highlight}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mt-6 leading-relaxed" data-testid="text-focus-hero-description">
              {hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Focus Statement / Thesis Section */}
      <section className="py-20 bg-card" data-testid="section-deeptech">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {thesis.label && (
                <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-4 block" data-testid="text-thesis-label">
                  {thesis.label}
                </span>
              )}
              <h2
                className="text-3xl md:text-4xl font-bold text-foreground leading-tight"
                data-testid="text-deeptech-title"
              >
                {thesis.title || "DEEPTECH ACCELERATING"}
                {!thesis.title && <span className="text-gradient block">CLEANTECH & TECHBIO</span>}
              </h2>
              <p className="text-lg text-muted-foreground mt-6 leading-relaxed" data-testid="text-deeptech-description">
                {thesis.content || "Deeptech is the unsung hero powering a greener future and accelerating medical breakthroughs that refine global healthcare. We invest in foundational technologies that create lasting impact."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="aspect-[4/3] rounded-lg overflow-hidden"
            >
              <img width={800} height={600}
                src={deeptechImage}
                alt="Deeptech innovation"
                className="w-full h-full object-cover"
                data-testid="img-deeptech-section"
               loading="lazy" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cleantech Section */}
      <section className="py-20 bg-background" data-testid="section-cleantech">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 aspect-[4/3] rounded-lg overflow-hidden"
            >
              <img width={800} height={600}
                src={cleantechImage}
                alt="Cleantech innovation"
                className="w-full h-full object-cover"
                data-testid="img-cleantech-section"
               loading="lazy" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-3 mb-4">
                <Leaf className="w-8 h-8 text-accent" />
                <span className="text-accent text-sm font-semibold uppercase tracking-widest" data-testid="text-cleantech-label">
                  Cleantech
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold text-foreground leading-tight"
                data-testid="text-cleantech-title"
              >
                CLEANTECH
              </h2>
              <p className="text-lg text-muted-foreground mt-6 leading-relaxed" data-testid="text-cleantech-description">
                We back breakthrough deeptech enablers from zero-emission processes
                to advanced materials that slash waste, cut carbon, and restore
                ecological balance.
              </p>
              
              <div className="mt-8 space-y-4">
                {[
                  { icon: Recycle, text: "Advanced materials & Enabling technologies", id: "advanced-materials" },
                  { icon: Leaf, text: "Bio-manufacturing & Food/Ag", id: "bio-manufacturing" },
                  { icon: Zap, text: "Clean energy & Critical resources", id: "clean-energy" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-4" data-testid={`cleantech-point-${item.id}`}>
                    <item.icon className="w-5 h-5 text-accent" />
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Techbio Section */}
      <section className="py-20 bg-card" data-testid="section-techbio">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <FlaskConical className="w-8 h-8 text-accent" />
                <span className="text-accent text-sm font-semibold uppercase tracking-widest" data-testid="text-techbio-label">
                  Techbio
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold text-foreground leading-tight"
                data-testid="text-techbio-title"
              >
                TECHBIO
              </h2>
              <p className="text-lg text-muted-foreground mt-6 leading-relaxed" data-testid="text-techbio-description">
                We fund the next medical wave: AI-first discovery engines, advanced
                bio-instrumentation, and regenerative platforms that speed novel
                therapies from lab to patient.
              </p>
              
              <div className="mt-8 space-y-4">
                {[
                  { icon: Microscope, text: "AI-powered drug discovery", id: "ai-discovery" },
                  { icon: FlaskConical, text: "Advanced bio-instrumentation", id: "bio-instrumentation" },
                  { icon: Activity, text: "Regenerative medicine platforms", id: "regenerative" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-4" data-testid={`techbio-point-${item.id}`}>
                    <item.icon className="w-5 h-5 text-accent" />
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="aspect-[4/3] rounded-lg overflow-hidden"
            >
              <img width={800} height={600}
                src={techbioImage}
                alt="Techbio innovation"
                className="w-full h-full object-cover"
                data-testid="img-techbio-section"
               loading="lazy" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Geography Section */}
      <section className="py-20 bg-background" data-testid="section-geography">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 aspect-[4/3] rounded-lg overflow-hidden"
            >
              <img width={800} height={600}
                src={globalImage}
                alt="Global reach - North America and Asia"
                className="w-full h-full object-cover"
                data-testid="img-geography-section"
               loading="lazy" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-8 h-8 text-accent" />
                <span className="text-accent text-sm font-semibold uppercase tracking-widest" data-testid="text-geography-label">
                  Global Reach
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold text-foreground leading-tight"
                data-testid="text-geography-title"
              >
                NORTH AMERICA & ASIA
              </h2>
              <p className="text-muted-foreground mt-6 text-[18px]" data-testid="text-geography-tagline">
                Two ecosystems, one global sandbox.
              </p>
              <p className="text-lg text-muted-foreground mt-4 leading-relaxed" data-testid="text-geography-description">
                We leverage our deep networks across North America and Asia to help
                portfolio companies access global markets, manufacturing partners,
                and strategic relationships.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

