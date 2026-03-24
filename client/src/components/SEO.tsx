import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

const SITE_NAME = "Valuence Ventures";
const DEFAULT_OG_IMAGE = "/og-image.png";

export function SEO({
  title,
  description,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  canonical,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;

  useEffect(() => {
    document.title = fullTitle;

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    updateMetaTag("description", description);
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    updateMetaTag("og:title", fullTitle, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", ogType, true);
    updateMetaTag("og:image", ogImage, true);
    updateMetaTag("og:site_name", SITE_NAME, true);

    updateMetaTag("twitter:card", "summary_large_image", true);
    updateMetaTag("twitter:title", fullTitle, true);
    updateMetaTag("twitter:description", description, true);
    updateMetaTag("twitter:image", ogImage, true);

    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (!linkElement) {
        linkElement = document.createElement("link");
        linkElement.setAttribute("rel", "canonical");
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute("href", canonical);
    }

    return () => {
      document.title = `${SITE_NAME} | Deeptech VC`;
    };
  }, [fullTitle, description, keywords, ogImage, ogType, canonical]);

  return null;
}

export function StructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Valuence Ventures LLC",
    description: "Deeptech venture capital firm focused on cleantech and techbio investments, accelerating planetary and human health.",
    url: typeof window !== "undefined" ? window.location.origin : "",
    foundingDate: "2024",
    industry: "Venture Capital",
    areaServed: ["North America", "Asia"],
    knowsAbout: [
      "Cleantech",
      "Techbio",
      "Deeptech",
      "Venture Capital",
      "Early Stage Investing",
      "Climate Technology",
      "Biotechnology"
    ],
    slogan: "Creating a cleaner and healthier future through the power of deeptech",
  };

  useEffect(() => {
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(organizationData);

    return () => {
      script?.remove();
    };
  }, []);

  return null;
}
