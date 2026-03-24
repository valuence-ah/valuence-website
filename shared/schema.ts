import { sql } from 'drizzle-orm';
import { pgTable, text, integer, index, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: integer("created_at").default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
  updatedAt: integer("updated_at").default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Team Members
export const teamMembers = pgTable("team_members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title"),
  category: text("category").notNull(), // "gp" | "ic" | "apac"
  imageUrl: text("image_url"),
  bio: text("bio"),
  linkedinUrl: text("linkedin_url"),
  order: integer("order").default(0),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true });
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Portfolio Companies
export const portfolioCompanies = pgTable("portfolio_companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  logoUrl: text("logo_url"),
  featuredImageUrl: text("featured_image_url"),
  websiteUrl: text("website_url"),
  category: text("category"), // "cleantech" | "techbio"
  order: integer("order").default(0),
});

export const insertPortfolioCompanySchema = createInsertSchema(portfolioCompanies).omit({ id: true });
export type InsertPortfolioCompany = z.infer<typeof insertPortfolioCompanySchema>;
export type PortfolioCompany = typeof portfolioCompanies.$inferSelect;

// Contact Form Submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  submittedAt: integer("submitted_at").default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, submittedAt: true });
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Newsletter Signups
export const newsletterSignups = pgTable("newsletter_signups", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: integer("subscribed_at").default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
});

export const insertNewsletterSignupSchema = createInsertSchema(newsletterSignups).omit({ id: true, subscribedAt: true });
export type InsertNewsletterSignup = z.infer<typeof insertNewsletterSignupSchema>;
export type NewsletterSignup = typeof newsletterSignups.$inferSelect;

// Site Content - Editable text content for all pages
export const siteContent = pgTable("site_content", {
  id: text("id").primaryKey(),
  section: text("section").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at").default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
});

export const insertSiteContentSchema = createInsertSchema(siteContent);
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type SiteContent = typeof siteContent.$inferSelect;

// Media Uploads - Track uploaded files
export const mediaUploads = pgTable("media_uploads", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  url: text("url").notNull(),
  uploadedAt: integer("uploaded_at").default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
  uploadedBy: text("uploaded_by"),
});

export const insertMediaUploadSchema = createInsertSchema(mediaUploads).omit({ id: true, uploadedAt: true });
export type InsertMediaUpload = z.infer<typeof insertMediaUploadSchema>;
export type MediaUpload = typeof mediaUploads.$inferSelect;

// Site Pages - Each page on the website
export const sitePages = pgTable("site_pages", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  status: text("status").default("published"),
  updatedAt: integer("updated_at").default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
});

export const insertSitePageSchema = createInsertSchema(sitePages);
export type InsertSitePage = z.infer<typeof insertSitePageSchema>;
export type SitePage = typeof sitePages.$inferSelect;

// Content Sections - Reorderable sections within pages
export const contentSections = pgTable("content_sections", {
  id: text("id").primaryKey(),
  pageId: text("page_id").notNull(),
  sectionType: text("section_type").notNull(),
  title: text("title"),
  data: jsonb("data").default({}),
  order: integer("order").default(0),
  status: text("status").default("visible"),
  updatedAt: integer("updated_at").default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
});

export const insertContentSectionSchema = createInsertSchema(contentSections).omit({ id: true, updatedAt: true });
export type InsertContentSection = z.infer<typeof insertContentSectionSchema>;
export type ContentSection = typeof contentSections.$inferSelect;

// Navigation Links - Header and footer navigation items
export const navigationLinks = pgTable("navigation_links", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  location: text("location").notNull(),
  order: integer("order").default(0),
  isExternal: text("is_external").default("false"),
  updatedAt: integer("updated_at").default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
});

export const insertNavigationLinkSchema = createInsertSchema(navigationLinks).omit({ id: true, updatedAt: true });
export type InsertNavigationLink = z.infer<typeof insertNavigationLinkSchema>;
export type NavigationLink = typeof navigationLinks.$inferSelect;

// Global Settings - Site-wide settings like logo, colors, social links
export const globalSettings = pgTable("global_settings", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  key: text("key").notNull(),
  value: text("value"),
  mediaUrl: text("media_url"),
  updatedAt: integer("updated_at").default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
});

export const insertGlobalSettingSchema = createInsertSchema(globalSettings);
export type InsertGlobalSetting = z.infer<typeof insertGlobalSettingSchema>;
export type GlobalSetting = typeof globalSettings.$inferSelect;

// Analytics - Track page views
export const pageViews = pgTable("page_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  path: text("path").notNull(),
  userAgent: text("user_agent"),
  timestamp: integer("timestamp").notNull().default(sql`EXTRACT(EPOCH FROM NOW())::INTEGER`),
});

export type PageView = typeof pageViews.$inferSelect;

// Section Type Registry
export const SECTION_TYPES = {
  hero: {
    name: "Hero Section",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "highlight", label: "Highlight Word", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "backgroundImage", label: "Background Image", type: "media" },
      { key: "backgroundVideo", label: "Background Video URL", type: "url" },
      { key: "button1Text", label: "Button 1 Text", type: "text" },
      { key: "button1Link", label: "Button 1 Link", type: "text" },
      { key: "button2Text", label: "Button 2 Text", type: "text" },
      { key: "button2Link", label: "Button 2 Link", type: "text" },
    ],
  },
  focus_intro: {
    name: "Focus Introduction",
    fields: [
      { key: "label", label: "Section Label", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "highlight", label: "Highlight Text", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image", type: "media" },
    ],
  },
  focus_cards: {
    name: "Focus Cards",
    fields: [
      { key: "cards", label: "Cards", type: "array", itemFields: [
        { key: "icon", label: "Icon Name", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
      ]},
    ],
  },
  team_intro: {
    name: "Team Introduction",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "highlight", label: "Highlight Text", type: "text" },
      { key: "points", label: "Key Points", type: "array", itemFields: [
        { key: "icon", label: "Icon Name", type: "text" },
        { key: "prefix", label: "Bold Prefix", type: "text" },
        { key: "text", label: "Description", type: "text" },
      ]},
    ],
  },
  team_grid: {
    name: "Team Grid",
    fields: [
      { key: "showCategories", label: "Show Category Tabs", type: "boolean" },
      { key: "categories", label: "Category Labels", type: "json" },
    ],
  },
  portfolio_grid: {
    name: "Portfolio Grid",
    fields: [
      { key: "showFilters", label: "Show Category Filters", type: "boolean" },
      { key: "layout", label: "Layout Style", type: "select", options: ["grid", "list", "featured"] },
    ],
  },
  contact_form: {
    name: "Contact Form",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "submitButtonText", label: "Submit Button Text", type: "text" },
    ],
  },
  text_block: {
    name: "Text Block",
    fields: [
      { key: "label", label: "Section Label", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "content", label: "Content", type: "richtext" },
    ],
  },
  image_text: {
    name: "Image with Text",
    fields: [
      { key: "image", label: "Image", type: "media" },
      { key: "imagePosition", label: "Image Position", type: "select", options: ["left", "right"] },
      { key: "title", label: "Title", type: "text" },
      { key: "content", label: "Content", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "text" },
    ],
  },
  cta_banner: {
    name: "Call to Action Banner",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "text" },
      { key: "backgroundImage", label: "Background Image", type: "media" },
    ],
  },
} as const;

export type SectionType = keyof typeof SECTION_TYPES;
