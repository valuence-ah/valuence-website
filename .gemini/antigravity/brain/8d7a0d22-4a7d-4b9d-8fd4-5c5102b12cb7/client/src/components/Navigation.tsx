import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { NavigationLink } from "@shared/schema";
import logoImage from "@assets/Valuence Ventures logo_1764573496190.png";

const DEFAULT_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/focus", label: "Focus" },
  { href: "/team", label: "Team" },
  { href: "/portfolio", label: "Portfolio" },
];

export function Navigation() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: navLinksData = [] } = useQuery<NavigationLink[]>({
    queryKey: ["/api/navigation"],
  });

  const headerLinks = navLinksData
    .filter(link => link.location === "header" && link.isActive)
    .sort((a, b) => a.order - b.order);

  const navLinks = headerLinks.length > 0 
    ? headerLinks.map(link => ({ href: link.url, label: link.label }))
    : DEFAULT_NAV_LINKS;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-md"
            : "bg-transparent"
        }`}
        data-testid="navigation-header"
      >
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center justify-between h-20" data-testid="navigation-nav">
            <Link href="/" data-testid="link-home-logo">
              <img
                src={logoImage}
                alt="Valuence Ventures"
                className="h-10 w-auto brightness-0 invert"
                data-testid="img-logo"
              />
            </Link>

            <div className="hidden md:flex items-center gap-8" data-testid="nav-desktop-links">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  <span
                    className={`text-sm font-medium transition-colors hover:text-accent ${
                      location === link.href
                        ? "text-accent"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}

            </div>

            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background pt-20 md:hidden"
            data-testid="mobile-menu"
          >
            <div className="flex flex-col items-center gap-6 pt-12" data-testid="mobile-menu-links">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`text-xl font-medium transition-colors ${
                      location === link.href
                        ? "text-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`link-mobile-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
