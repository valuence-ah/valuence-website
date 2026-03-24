import { 
  users,
  teamMembers,
  portfolioCompanies,
  contactSubmissions,
  newsletterSignups,
  siteContent,
  mediaUploads,
  sitePages,
  contentSections,
  navigationLinks,
  globalSettings,
  pageViews,
  type User, 
  type UpsertUser,
  type TeamMember,
  type InsertTeamMember,
  type PortfolioCompany,
  type InsertPortfolioCompany,
  type ContactSubmission,
  type InsertContactSubmission,
  type NewsletterSignup,
  type InsertNewsletterSignup,
  type SiteContent,
  type InsertSiteContent,
  type MediaUpload,
  type InsertMediaUpload,
  type SitePage,
  type InsertSitePage,
  type ContentSection,
  type InsertContentSection,
  type NavigationLink,
  type InsertNavigationLink,
  type GlobalSetting,
  type InsertGlobalSetting,
  type PageView,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Team members
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMembersByCategory(category: string): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;
  
  // Portfolio companies
  getPortfolioCompanies(): Promise<PortfolioCompany[]>;
  getPortfolioCompaniesByCategory(category: string): Promise<PortfolioCompany[]>;
  getPortfolioCompany(id: string): Promise<PortfolioCompany | undefined>;
  createPortfolioCompany(company: InsertPortfolioCompany): Promise<PortfolioCompany>;
  updatePortfolioCompany(id: string, company: Partial<InsertPortfolioCompany>): Promise<PortfolioCompany | undefined>;
  deletePortfolioCompany(id: string): Promise<boolean>;
  
  // Contact submissions
  getContactSubmissions(): Promise<ContactSubmission[]>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Newsletter signups
  getNewsletterSignups(): Promise<NewsletterSignup[]>;
  getNewsletterSignupByEmail(email: string): Promise<NewsletterSignup | undefined>;
  createNewsletterSignup(signup: InsertNewsletterSignup): Promise<NewsletterSignup>;
  
  // Site content
  getSiteContent(): Promise<SiteContent[]>;
  getSiteContentBySection(section: string): Promise<SiteContent[]>;
  getSiteContentByKey(section: string, key: string): Promise<SiteContent | undefined>;
  upsertSiteContent(content: InsertSiteContent): Promise<SiteContent>;
  
  // Media uploads
  getMediaUploads(): Promise<MediaUpload[]>;
  getMediaUpload(id: string): Promise<MediaUpload | undefined>;
  createMediaUpload(upload: InsertMediaUpload): Promise<MediaUpload>;
  deleteMediaUpload(id: string): Promise<boolean>;
  
  // Site pages
  getSitePages(): Promise<SitePage[]>;
  getSitePage(id: string): Promise<SitePage | undefined>;
  getSitePageBySlug(slug: string): Promise<SitePage | undefined>;
  upsertSitePage(page: InsertSitePage): Promise<SitePage>;
  deleteSitePage(id: string): Promise<boolean>;
  
  // Content sections
  getContentSections(pageId: string): Promise<ContentSection[]>;
  getContentSection(id: string): Promise<ContentSection | undefined>;
  createContentSection(section: InsertContentSection): Promise<ContentSection>;
  updateContentSection(id: string, section: Partial<InsertContentSection>): Promise<ContentSection | undefined>;
  deleteContentSection(id: string): Promise<boolean>;
  reorderContentSections(pageId: string, sectionIds: string[]): Promise<void>;
  
  // Navigation links
  getNavigationLinks(location?: string): Promise<NavigationLink[]>;
  getNavigationLink(id: string): Promise<NavigationLink | undefined>;
  createNavigationLink(link: InsertNavigationLink): Promise<NavigationLink>;
  updateNavigationLink(id: string, link: Partial<InsertNavigationLink>): Promise<NavigationLink | undefined>;
  deleteNavigationLink(id: string): Promise<boolean>;
  reorderNavigationLinks(location: string, linkIds: string[]): Promise<void>;
  
  // Global settings
  getGlobalSettings(category?: string): Promise<GlobalSetting[]>;
  getGlobalSetting(id: string): Promise<GlobalSetting | undefined>;
  upsertGlobalSetting(setting: InsertGlobalSetting): Promise<GlobalSetting>;

  // Analytics
  recordPageView(path: string, userAgent?: string): Promise<void>;
  getPageViews(limit?: number): Promise<PageView[]>;
  getPageStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const [existing] = await db.select().from(users).where(eq(users.id, id));
    
    if (existing) {
      const [updated] = await db.update(users)
        .set({ ...userData, updatedAt: Math.floor(Date.now() / 1000) })
        .where(eq(users.id, id))
        .returning();
      return updated;
    } else {
      const [inserted] = await db.insert(users)
        .values({ ...userData, id })
        .returning();
      return inserted;
    }
  }

  // Team members
  async getTeamMembers(): Promise<TeamMember[]> {
    const members = await db.select().from(teamMembers);
    return members.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getTeamMembersByCategory(category: string): Promise<TeamMember[]> {
    const members = await db.select().from(teamMembers).where(eq(teamMembers.category, category));
    return members.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const [newMember] = await db.insert(teamMembers).values({ ...member, id }).returning();
    return newMember;
  }

  async updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [updated] = await db.update(teamMembers)
      .set(member)
      .where(eq(teamMembers.id, id))
      .returning();
    return updated;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const [deleted] = await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning();
    return !!deleted;
  }

  // Portfolio companies
  async getPortfolioCompanies(): Promise<PortfolioCompany[]> {
    const companies = await db.select().from(portfolioCompanies);
    return companies.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getPortfolioCompaniesByCategory(category: string): Promise<PortfolioCompany[]> {
    const companies = await db.select().from(portfolioCompanies).where(eq(portfolioCompanies.category, category));
    return companies.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getPortfolioCompany(id: string): Promise<PortfolioCompany | undefined> {
    const [company] = await db.select().from(portfolioCompanies).where(eq(portfolioCompanies.id, id));
    return company;
  }

  async createPortfolioCompany(company: InsertPortfolioCompany): Promise<PortfolioCompany> {
    const id = randomUUID();
    const [newCompany] = await db.insert(portfolioCompanies).values({ ...company, id }).returning();
    return newCompany;
  }

  async updatePortfolioCompany(id: string, company: Partial<InsertPortfolioCompany>): Promise<PortfolioCompany | undefined> {
    const [updated] = await db.update(portfolioCompanies)
      .set(company)
      .where(eq(portfolioCompanies.id, id))
      .returning();
    return updated;
  }

  async deletePortfolioCompany(id: string): Promise<boolean> {
    const [deleted] = await db.delete(portfolioCompanies).where(eq(portfolioCompanies.id, id)).returning();
    return !!deleted;
  }

  // Contact submissions
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions);
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const [newSubmission] = await db.insert(contactSubmissions).values({ ...submission, id }).returning();
    return newSubmission;
  }

  // Newsletter signups
  async getNewsletterSignups(): Promise<NewsletterSignup[]> {
    return await db.select().from(newsletterSignups);
  }

  async getNewsletterSignupByEmail(email: string): Promise<NewsletterSignup | undefined> {
    const [signup] = await db.select().from(newsletterSignups).where(eq(newsletterSignups.email, email));
    return signup;
  }

  async createNewsletterSignup(signup: InsertNewsletterSignup): Promise<NewsletterSignup> {
    const id = randomUUID();
    const [newSignup] = await db.insert(newsletterSignups).values({ ...signup, id }).returning();
    return newSignup;
  }

  // Site content
  async getSiteContent(): Promise<SiteContent[]> {
    return await db.select().from(siteContent);
  }

  async getSiteContentBySection(section: string): Promise<SiteContent[]> {
    return await db.select().from(siteContent).where(eq(siteContent.section, section));
  }

  async getSiteContentByKey(section: string, key: string): Promise<SiteContent | undefined> {
    const [content] = await db.select().from(siteContent)
      .where(and(eq(siteContent.section, section), eq(siteContent.key, key)));
    return content;
  }

  async upsertSiteContent(content: InsertSiteContent): Promise<SiteContent> {
    const [existing] = await db.select().from(siteContent).where(eq(siteContent.id, content.id));
    if (existing) {
      const [updated] = await db.update(siteContent)
        .set({ value: content.value, updatedAt: Math.floor(Date.now() / 1000) })
        .where(eq(siteContent.id, content.id))
        .returning();
      return updated;
    } else {
      const [inserted] = await db.insert(siteContent).values(content).returning();
      return inserted;
    }
  }

  // Media uploads
  async getMediaUploads(): Promise<MediaUpload[]> {
    return await db.select().from(mediaUploads);
  }

  async getMediaUpload(id: string): Promise<MediaUpload | undefined> {
    const [upload] = await db.select().from(mediaUploads).where(eq(mediaUploads.id, id));
    return upload;
  }

  async createMediaUpload(upload: InsertMediaUpload): Promise<MediaUpload> {
    const id = randomUUID();
    const [newUpload] = await db.insert(mediaUploads).values({ ...upload, id }).returning();
    return newUpload;
  }

  async deleteMediaUpload(id: string): Promise<boolean> {
    const [deleted] = await db.delete(mediaUploads).where(eq(mediaUploads.id, id)).returning();
    return !!deleted;
  }

  // Site pages
  async getSitePages(): Promise<SitePage[]> {
    return await db.select().from(sitePages);
  }

  async getSitePage(id: string): Promise<SitePage | undefined> {
    const [page] = await db.select().from(sitePages).where(eq(sitePages.id, id));
    return page;
  }

  async getSitePageBySlug(slug: string): Promise<SitePage | undefined> {
    const [page] = await db.select().from(sitePages).where(eq(sitePages.slug, slug));
    return page;
  }

  async upsertSitePage(page: InsertSitePage): Promise<SitePage> {
    const [existing] = await db.select().from(sitePages).where(eq(sitePages.id, page.id));
    if (existing) {
      const [updated] = await db.update(sitePages)
        .set({ ...page, updatedAt: Math.floor(Date.now() / 1000) })
        .where(eq(sitePages.id, page.id))
        .returning();
      return updated;
    } else {
      const [inserted] = await db.insert(sitePages).values(page).returning();
      return inserted;
    }
  }

  async deleteSitePage(id: string): Promise<boolean> {
    const [deleted] = await db.delete(sitePages).where(eq(sitePages.id, id)).returning();
    return !!deleted;
  }

  // Content sections
  async getContentSections(pageId: string): Promise<ContentSection[]> {
    const sections = await db.select().from(contentSections)
      .where(eq(contentSections.pageId, pageId))
      .orderBy(asc(contentSections.order));
    return sections;
  }

  async getContentSection(id: string): Promise<ContentSection | undefined> {
    const [section] = await db.select().from(contentSections).where(eq(contentSections.id, id));
    return section;
  }

  async createContentSection(section: InsertContentSection): Promise<ContentSection> {
    const id = randomUUID();
    const [newSection] = await db.insert(contentSections).values({ ...section, id }).returning();
    return newSection;
  }

  async updateContentSection(id: string, section: Partial<InsertContentSection>): Promise<ContentSection | undefined> {
    const [updated] = await db.update(contentSections)
      .set({ ...section, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(contentSections.id, id))
      .returning();
    return updated;
  }

  async deleteContentSection(id: string): Promise<boolean> {
    const [deleted] = await db.delete(contentSections).where(eq(contentSections.id, id)).returning();
    return !!deleted;
  }

  async reorderContentSections(pageId: string, sectionIds: string[]): Promise<void> {
    for (let i = 0; i < sectionIds.length; i++) {
      await db.update(contentSections)
        .set({ order: i, updatedAt: Math.floor(Date.now() / 1000) })
        .where(and(eq(contentSections.id, sectionIds[i]), eq(contentSections.pageId, pageId)));
    }
  }

  // Navigation links
  async getNavigationLinks(location?: string): Promise<NavigationLink[]> {
    if (location) {
      return await db.select().from(navigationLinks)
        .where(eq(navigationLinks.location, location))
        .orderBy(asc(navigationLinks.order));
    }
    return await db.select().from(navigationLinks).orderBy(asc(navigationLinks.order));
  }

  async getNavigationLink(id: string): Promise<NavigationLink | undefined> {
    const [link] = await db.select().from(navigationLinks).where(eq(navigationLinks.id, id));
    return link;
  }

  async createNavigationLink(link: InsertNavigationLink): Promise<NavigationLink> {
    const id = randomUUID();
    const [newLink] = await db.insert(navigationLinks).values({ ...link, id }).returning();
    return newLink;
  }

  async updateNavigationLink(id: string, link: Partial<InsertNavigationLink>): Promise<NavigationLink | undefined> {
    const [updated] = await db.update(navigationLinks)
      .set({ ...link, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(navigationLinks.id, id))
      .returning();
    return updated;
  }

  async deleteNavigationLink(id: string): Promise<boolean> {
    const [deleted] = await db.delete(navigationLinks).where(eq(navigationLinks.id, id)).returning();
    return !!deleted;
  }

  async reorderNavigationLinks(location: string, linkIds: string[]): Promise<void> {
    for (let i = 0; i < linkIds.length; i++) {
      await db.update(navigationLinks)
        .set({ order: i, updatedAt: Math.floor(Date.now() / 1000) })
        .where(and(eq(navigationLinks.id, linkIds[i]), eq(navigationLinks.location, location)));
    }
  }

  // Global settings
  async getGlobalSettings(category?: string): Promise<GlobalSetting[]> {
    if (category) {
      return await db.select().from(globalSettings).where(eq(globalSettings.category, category));
    }
    return await db.select().from(globalSettings);
  }

  async getGlobalSetting(id: string): Promise<GlobalSetting | undefined> {
    const [setting] = await db.select().from(globalSettings).where(eq(globalSettings.id, id));
    return setting;
  }

  async upsertGlobalSetting(setting: InsertGlobalSetting): Promise<GlobalSetting> {
    const [existing] = await db.select().from(globalSettings).where(eq(globalSettings.id, setting.id));
    if (existing) {
      const [updated] = await db.update(globalSettings)
        .set({ ...setting, updatedAt: Math.floor(Date.now() / 1000) })
        .where(eq(globalSettings.id, setting.id))
        .returning();
      return updated;
    } else {
      const [inserted] = await db.insert(globalSettings).values(setting).returning();
      return inserted;
    }
  }

  // Analytics
  async recordPageView(path: string, userAgent?: string): Promise<void> {
    await db.insert(pageViews).values({
      path,
      userAgent,
      timestamp: Math.floor(Date.now() / 1000),
    });
  }

  async getPageViews(limit: number = 100): Promise<PageView[]> {
    return await db.select().from(pageViews).orderBy(asc(pageViews.timestamp)).limit(limit);
  }

  async getPageStats(): Promise<any> {
    const views = await db.select().from(pageViews);
    const totalViews = views.length;
    const paths: Record<string, number> = {};
    views.forEach(v => {
      paths[v.path] = (paths[v.path] || 0) + 1;
    });
    return {
      totalViews,
      topPaths: Object.entries(paths).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }
}

export const storage = new DatabaseStorage();
