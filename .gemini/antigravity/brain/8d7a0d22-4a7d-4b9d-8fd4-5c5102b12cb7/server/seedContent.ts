import { db } from "./db";
import { sitePages, contentSections, navigationLinks, globalSettings } from "@shared/schema";
import { randomUUID } from "crypto";

const homePageContent = {
  hero: {
    title: "CREATING A CLEANER AND HEALTHIER FUTURE THROUGH THE POWER OF",
    highlight: "DEEPTECH",
    subtitle: "We invest in visionary founders developing world-changing technologies that accelerate planetary and human health.",
    backgroundVideo: "https://video.wixstatic.com/video/c837a6_66cfebd8c41849e2a4d7a85a6e4bbf86/1080p/mp4/file.mp4",
    button1Text: "Our Focus",
    button1Link: "/focus",
    button2Text: "View Portfolio",
    button2Link: "/portfolio",
  },
  focus_intro: {
    label: "Our Focus",
    title: "DEEPTECH ACCELERATING",
    highlight: "CLEANTECH & TECHBIO",
    description: "Deeptech is the unsung hero powering a greener future and accelerating medical breakthroughs that refine global healthcare.",
  },
  focus_cards: {
    cards: [
      { icon: "Leaf", title: "Cleantech", description: "Zero-emission processes and advanced materials that slash waste and cut carbon" },
      { icon: "Dna", title: "Techbio", description: "AI-first discovery engines and regenerative platforms for novel therapies" },
      { icon: "Globe", title: "Global Reach", description: "North America & Asia - Two ecosystems, one global sandbox" },
      { icon: "Rocket", title: "Pre-Seed to Series A", description: "Early-stage investments in world-changing technologies" },
    ],
  },
  team_intro: {
    title: "We have built, scaled & exited",
    highlight: "businesses.",
    points: [
      { icon: "Award", prefix: "Entrepreneurs", text: "with 5 successful exits" },
      { icon: "TrendingUp", prefix: "Operators", text: "who scaled cleantech & techbio businesses" },
      { icon: "Users", prefix: "Investors", text: "who actively support visionary founders" },
    ],
  },
};

const focusPageContent = {
  hero: {
    title: "Our",
    highlight: "Focus",
    subtitle: "Our thesis centers on deeptech innovations that create measurable impact for planetary and human health.",
  },
  thesis: {
    label: "Our Thesis",
    title: "Why Deeptech?",
    content: "Deeptech companies leverage scientific advances and engineering innovation to solve the world's most pressing challenges. We focus on founders who are building transformative solutions in cleantech and techbio.",
  },
};

const teamPageContent = {
  hero: {
    title: "Our",
    highlight: "Team",
    subtitle: "A team of entrepreneurs, operators, and investors united by a shared mission.",
  },
};

const portfolioPageContent = {
  hero: {
    title: "Our",
    highlight: "Portfolio",
    subtitle: "World-changing technologies accelerating planetary and human health.",
  },
};

const contactPageContent = {
  hero: {
    title: "Get in",
    highlight: "Touch",
    subtitle: "Whether you're a founder, investor, or potential partner, we'd love to hear from you.",
  },
  form: {
    title: "Contact Us",
    description: "Fill out the form below and we'll get back to you shortly.",
    submitButtonText: "Send Message",
  },
};

const navigationData = [
  { label: "Home", url: "/", location: "header", order: 0 },
  { label: "Focus", url: "/focus", location: "header", order: 1 },
  { label: "Team", url: "/team", location: "header", order: 2 },
  { label: "Portfolio", url: "/portfolio", location: "header", order: 3 },
  { label: "Our Focus", url: "/focus", location: "footer", order: 0 },
  { label: "Our Team", url: "/team", location: "footer", order: 1 },
  { label: "Portfolio", url: "/portfolio", location: "footer", order: 2 },
  { label: "Contact", url: "/contact", location: "footer", order: 3 },
];

const globalSettingsData = [
  { id: "site_name", key: "site_name", category: "branding", value: "Valuence VC" },
  { id: "site_tagline", key: "site_tagline", category: "branding", value: "Deeptech Accelerating Cleantech & Techbio" },
  { id: "footer_copyright", key: "footer_copyright", category: "footer", value: "Valuence VC" },
  { id: "footer_description", key: "footer_description", category: "footer", value: "Creating a cleaner and healthier future through the power of deeptech. We invest in visionary founders developing world-changing technologies." },
  { id: "footer_location", key: "footer_location", category: "footer", value: "North America & Asia" },
  { id: "footer_newsletter_text", key: "footer_newsletter_text", category: "footer", value: "Stay updated on our latest investments and insights." },
  { id: "contact_email", key: "contact_email", category: "footer", value: "info@valuence.vc" },
  { id: "social_linkedin", key: "social_linkedin", category: "social", value: "https://linkedin.com/company/valuencevc" },
  { id: "social_twitter", key: "social_twitter", category: "social", value: "" },
];

export async function seedContent() {
  console.log("Starting content seed...");

  try {
    // Seed pages
    const pages = [
      { id: "home", title: "Home", slug: "/", description: "Valuence VC - Deeptech Venture Capital", metaTitle: "Valuence VC - Deeptech Accelerating Cleantech & Techbio", metaDescription: "We invest in visionary founders developing world-changing technologies that accelerate planetary and human health." },
      { id: "focus", title: "Our Focus", slug: "/focus", description: "Our investment thesis", metaTitle: "Our Focus - Valuence VC", metaDescription: "Our thesis centers on deeptech innovations that create measurable impact for planetary and human health." },
      { id: "team", title: "Our Team", slug: "/team", description: "Meet our team", metaTitle: "Our Team - Valuence VC", metaDescription: "A team of entrepreneurs, operators, and investors united by a shared mission." },
      { id: "portfolio", title: "Portfolio", slug: "/portfolio", description: "Our portfolio companies", metaTitle: "Portfolio - Valuence VC", metaDescription: "World-changing technologies accelerating planetary and human health." },
      { id: "contact", title: "Contact", slug: "/contact", description: "Get in touch", metaTitle: "Contact - Valuence VC", metaDescription: "Whether you're a founder, investor, or potential partner, we'd love to hear from you." },
    ];

    for (const page of pages) {
      await db.insert(sitePages).values(page).onConflictDoNothing();
    }
    console.log("Pages seeded");

    // Seed Home page sections
    const homeSections = [
      { id: randomUUID(), pageId: "home", sectionType: "hero", title: "Hero Section", data: homePageContent.hero, order: 0 },
      { id: randomUUID(), pageId: "home", sectionType: "focus_intro", title: "Investment Focus", data: homePageContent.focus_intro, order: 1 },
      { id: randomUUID(), pageId: "home", sectionType: "focus_cards", title: "Focus Cards", data: homePageContent.focus_cards, order: 2 },
      { id: randomUUID(), pageId: "home", sectionType: "portfolio_grid", title: "Portfolio Highlights", data: { showFilters: false, layout: "featured" }, order: 3 },
      { id: randomUUID(), pageId: "home", sectionType: "team_intro", title: "Team Introduction", data: homePageContent.team_intro, order: 4 },
      { id: randomUUID(), pageId: "home", sectionType: "team_grid", title: "Team Grid", data: { showCategories: true }, order: 5 },
    ];

    for (const section of homeSections) {
      await db.insert(contentSections).values(section).onConflictDoNothing();
    }
    console.log("Home page sections seeded");

    // Seed Focus page sections
    const focusSections = [
      { id: randomUUID(), pageId: "focus", sectionType: "hero", title: "Hero Section", data: focusPageContent.hero, order: 0 },
      { id: randomUUID(), pageId: "focus", sectionType: "text_block", title: "Thesis Section", data: focusPageContent.thesis, order: 1 },
    ];

    for (const section of focusSections) {
      await db.insert(contentSections).values(section).onConflictDoNothing();
    }
    console.log("Focus page sections seeded");

    // Seed Team page sections
    const teamSections = [
      { id: randomUUID(), pageId: "team", sectionType: "hero", title: "Hero Section", data: teamPageContent.hero, order: 0 },
      { id: randomUUID(), pageId: "team", sectionType: "team_grid", title: "Team Grid", data: { showCategories: true }, order: 1 },
    ];

    for (const section of teamSections) {
      await db.insert(contentSections).values(section).onConflictDoNothing();
    }
    console.log("Team page sections seeded");

    // Seed Portfolio page sections
    const portfolioSections = [
      { id: randomUUID(), pageId: "portfolio", sectionType: "hero", title: "Hero Section", data: portfolioPageContent.hero, order: 0 },
      { id: randomUUID(), pageId: "portfolio", sectionType: "portfolio_grid", title: "Portfolio Grid", data: { showFilters: true, layout: "grid" }, order: 1 },
    ];

    for (const section of portfolioSections) {
      await db.insert(contentSections).values(section).onConflictDoNothing();
    }
    console.log("Portfolio page sections seeded");

    // Seed Contact page sections
    const contactSections = [
      { id: randomUUID(), pageId: "contact", sectionType: "hero", title: "Hero Section", data: contactPageContent.hero, order: 0 },
      { id: randomUUID(), pageId: "contact", sectionType: "contact_form", title: "Contact Form", data: contactPageContent.form, order: 1 },
    ];

    for (const section of contactSections) {
      await db.insert(contentSections).values(section).onConflictDoNothing();
    }
    console.log("Contact page sections seeded");

    // Seed navigation links
    for (const nav of navigationData) {
      await db.insert(navigationLinks).values({ ...nav, id: randomUUID() }).onConflictDoNothing();
    }
    console.log("Navigation links seeded");

    // Seed global settings
    for (const setting of globalSettingsData) {
      await db.insert(globalSettings).values(setting).onConflictDoNothing();
    }
    console.log("Global settings seeded");

    console.log("Content seed completed successfully!");
  } catch (error) {
    console.error("Error seeding content:", error);
    throw error;
  }
}

seedContent().then(() => {
  console.log("Seed finished");
  process.exit(0);
}).catch(err => {
  console.error("Seed failed", err);
  process.exit(1);
});
