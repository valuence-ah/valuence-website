import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { SEO } from "@/components/SEO";

const HERO_DEFAULTS = {
  title: "Get in",
  highlight: "Touch",
  subtitle: "",
};

export default function Contact() {
  const { getSectionData } = usePageContent("contact");
  
  const heroData = getSectionData<Record<string, string>>("hero") || {};
  
  const hero = {
    title: heroData.title || HERO_DEFAULTS.title,
    highlight: heroData.highlight || HERO_DEFAULTS.highlight,
    subtitle: heroData.subtitle || HERO_DEFAULTS.subtitle,
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with Valuence Ventures. We're actively seeking visionary founders building breakthrough technologies in cleantech and techbio."
        keywords="contact venture capital, pitch to VC, cleantech funding, techbio investment, startup funding"
      />
      <div className="min-h-screen pt-20" data-testid="page-contact">
      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-background" data-testid="section-contact-hero">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight"
              data-testid="text-contact-hero-title"
            >
              {hero.title} <span className="text-gradient">{hero.highlight}</span>
            </h1>
            {hero.subtitle && (
              <p
                className="text-xl md:text-2xl text-muted-foreground mt-6 leading-relaxed"
                data-testid="text-contact-hero-description"
              >
                {hero.subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-background" data-testid="section-contact-info">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8 text-center max-w-2xl"
            >
              <div>
                <h2
                  className="text-3xl font-bold text-foreground mb-6"
                  data-testid="text-contact-info-title"
                >
                  Get in Touch
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-contact-info-description">
                  Whether you're a founder building breakthrough technology, a
                  venture investor, or a strategic partner, we'd love to hear from you.
                </p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-4" data-testid="contact-info-email">
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">Email</h3>
                    <a
                      href="mailto:connect@valuence.vc"
                      className="text-2xl md:text-3xl font-bold text-foreground hover:text-accent transition-colors"
                      data-testid="link-email-contact"
                    >
                      connect@valuence.vc
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
