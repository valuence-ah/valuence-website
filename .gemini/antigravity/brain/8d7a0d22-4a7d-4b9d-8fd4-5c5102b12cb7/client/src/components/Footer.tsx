import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Linkedin, Mail, MapPin, Twitter, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { NavigationLink, GlobalSetting } from "@shared/schema";
import logoImage from "@assets/Valuence Ventures logo_1764573496190.png";

const DEFAULT_FOOTER_LINKS = [
  { href: "/focus", label: "Our Focus" },
  { href: "/team", label: "Our Team" },
  { href: "/portfolio", label: "Portfolio" },
];

const DEFAULT_SETTINGS = {
  footer_description: "Creating a cleaner and healthier future through the power of deeptech. We invest in visionary founders developing world-changing technologies.",
  footer_copyright: "Valuence Ventures LLC",
  footer_location: "",
  footer_cta_title: "Building the Future?",
  footer_cta_description: "We're looking for visionary founders developing world-changing technologies in cleantech and techbio.",
  social_linkedin: "https://www.linkedin.com/company/valuenceventures",
  social_twitter: "",
  contact_email: "connect@valuence.vc",
};

export function Footer() {
  const { data: settings = [] } = useQuery<GlobalSetting[]>({
    queryKey: ["/api/settings"],
  });

  const { data: navLinksData = [] } = useQuery<NavigationLink[]>({
    queryKey: ["/api/navigation"],
  });

  const getSetting = (key: string, defaultValue: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || defaultValue;
  };

  const footerLinks = navLinksData
    .filter(link => link.location === "footer")
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Use CMS footer links if available, otherwise use defaults
  // Deduplicate by href to prevent duplicate key warnings
  const rawLinks = footerLinks.length > 0
    ? footerLinks.map((link) => ({ href: link.url, label: link.label, id: String(link.id) }))
    : DEFAULT_FOOTER_LINKS.map((link, idx) => ({ ...link, id: `default-${idx}` }));
  
  const seenHrefs = new Set<string>();
  const quickLinks = rawLinks.filter((link) => {
    if (seenHrefs.has(link.href)) {
      return false;
    }
    seenHrefs.add(link.href);
    return true;
  });

  const footerDescription = getSetting("footer_description", DEFAULT_SETTINGS.footer_description);
  const footerCopyright = getSetting("footer_copyright", DEFAULT_SETTINGS.footer_copyright);
  const footerLocation = getSetting("footer_location", DEFAULT_SETTINGS.footer_location);
  const footerCtaTitle = getSetting("footer_cta_title", DEFAULT_SETTINGS.footer_cta_title);
  const footerCtaDescription = getSetting("footer_cta_description", DEFAULT_SETTINGS.footer_cta_description);
  const socialLinkedin = getSetting("social_linkedin", DEFAULT_SETTINGS.social_linkedin);
  const socialTwitter = getSetting("social_twitter", DEFAULT_SETTINGS.social_twitter);
  const contactEmail = getSetting("contact_email", DEFAULT_SETTINGS.contact_email);

  return (
    <footer className="bg-card border-t border-border" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2" data-testid="footer-about">
            <Link href="/" data-testid="link-footer-logo">
              <img
                src={logoImage}
                alt="Valuence Ventures"
                className="h-10 w-auto brightness-0 invert"
                data-testid="img-footer-logo"
              />
            </Link>
            <p
              className="mt-4 text-muted-foreground max-w-md leading-relaxed"
              data-testid="text-footer-description"
            >
              {footerDescription}
            </p>
            <div className="flex items-center gap-4 mt-6" data-testid="footer-social">
              {socialLinkedin && (
                <a
                  href={socialLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                  data-testid="link-footer-linkedin"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {socialTwitter && (
                <a
                  href={socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                  data-testid="link-footer-twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-muted-foreground hover:text-accent transition-colors"
                  data-testid="link-footer-email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div data-testid="footer-links">
            <h4 className="font-semibold text-foreground mb-4" data-testid="text-quick-links-title">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <Link href={link.href}>
                    <span
                      className="text-muted-foreground hover:text-accent transition-colors text-sm"
                      data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-testid="footer-cta">
            <h4 className="font-semibold text-foreground mb-4" data-testid="text-cta-title">
              {footerCtaTitle}
            </h4>

            <a href={`mailto:${contactEmail}`}>
              <Button className="w-full gap-2" data-testid="button-get-in-touch" type="button">
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border" data-testid="footer-bottom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground" data-testid="text-copyright">
              © {new Date().getFullYear()} {footerCopyright}. All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
}
