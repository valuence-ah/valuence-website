import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertNewsletterSignupSchema, 
  insertTeamMemberSchema, 
  insertPortfolioCompanySchema, 
  insertSiteContentSchema, 
  insertMediaUploadSchema,
  insertSitePageSchema,
  insertContentSectionSchema,
  insertNavigationLinkSchema,
  insertGlobalSettingSchema,
  SECTION_TYPES,
} from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { Resend } from "resend";
import fs from "fs/promises";
import path from "path";
import express from "express";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFICATION_EMAIL = "connect@valuence.vc";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup authentication
  await setupAuth(app);

  // Track page views
  app.use((req, res, next) => {
    // Only track GET requests for non-API and non-static routes
    if (req.method === 'GET' && 
        !req.path.startsWith('/api') && 
        !req.path.startsWith('/objects') && 
        !req.path.startsWith('/public-objects') &&
        !req.path.includes('.')) {
      storage.recordPageView(req.path, req.get('User-Agent')).catch(err => {
        console.error("Failed to record page view:", err);
      });
    }
    next();
  });

  // Handle old Wix URLs - return 410 Gone to tell search engines content is permanently removed
  const oldWixPatterns = [
    '/service-page',
    '/product-page',
    '/blank-page',
    '/blank',
    '/_functions',
    '/wix-',
    '/members',
  ];
  
  app.use((req, res, next) => {
    const path = req.path.toLowerCase();
    const isOldWixUrl = oldWixPatterns.some(pattern => path.startsWith(pattern));
    
    if (isOldWixUrl) {
      res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="robots" content="noindex, nofollow">
          <title>Page Removed - Valuence Ventures</title>
        </head>
        <body>
          <h1>This page has been removed</h1>
          <p>The content you're looking for is no longer available.</p>
          <p><a href="/">Visit our homepage</a></p>
        </body>
        </html>
      `);
      return;
    }
    next();
  });

  // Auth routes - this endpoint must be public to check auth status
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Return null if not authenticated
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        res.json(null);
        return;
      }
      const userId = req.user.id; // Corrected for local mock auth
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Get all team members (public)
  app.get("/api/team", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const members = category 
        ? await storage.getTeamMembersByCategory(category)
        : await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch team members" 
      });
    }
  });

  // Get single team member (admin)
  app.get("/api/team/:id", isAuthenticated, async (req, res) => {
    try {
      const member = await storage.getTeamMember(req.params.id);
      if (!member) {
        res.status(404).json({ success: false, message: "Team member not found" });
        return;
      }
      res.json(member);
    } catch (error) {
      console.error("Error fetching team member:", error);
      res.status(500).json({ success: false, message: "Failed to fetch team member" });
    }
  });

  // Create team member (admin)
  app.post("/api/team", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating team member:", error);
        res.status(500).json({ success: false, message: "Failed to create team member" });
      }
    }
  });

  // Update team member (admin)
  app.patch("/api/team/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.partial().parse(req.body);
      const member = await storage.updateTeamMember(req.params.id, validatedData);
      if (!member) {
        res.status(404).json({ success: false, message: "Team member not found" });
        return;
      }
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating team member:", error);
        res.status(500).json({ success: false, message: "Failed to update team member" });
      }
    }
  });

  // Delete team member (admin)
  app.delete("/api/team/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteTeamMember(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Team member not found" });
        return;
      }
      res.json({ success: true, message: "Team member deleted" });
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ success: false, message: "Failed to delete team member" });
    }
  });

  // Local file upload handler
  app.put("/api/uploads/:id", isAuthenticated, express.raw({ limit: "50mb", type: "*/*" }), async (req, res) => {
    try {
      const { id } = req.params;
      const uploadDir = path.join(process.cwd(), "uploads");
      
      // Ensure directory exists
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, id);
      await fs.writeFile(filePath, req.body);
      
      res.json({ success: true, path: `/api/uploads/${id}` });
    } catch (error) {
      console.error("Upload handler error:", error);
      res.status(500).json({ success: false, message: "Failed to save file" });
    }
  });

  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const media = await storage.getMediaUpload(id);
      const uploadDir = path.join(process.cwd(), "uploads");
      const filePath = path.join(uploadDir, id);
      
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ success: false, message: "File not found" });
      }

      if (media?.mimeType) {
        res.setHeader("Content-Type", media.mimeType);
      }
      res.sendFile(filePath);
    } catch (error) {
      console.error("Serve upload error:", error);
      res.status(500).json({ success: false, message: "Failed to serve file" });
    }
  });

  // Get all portfolio companies (public)
  app.get("/api/portfolio", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const companies = category 
        ? await storage.getPortfolioCompaniesByCategory(category)
        : await storage.getPortfolioCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching portfolio companies:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch portfolio companies" 
      });
    }
  });

  // Get single portfolio company (admin)
  app.get("/api/portfolio/:id", isAuthenticated, async (req, res) => {
    try {
      const company = await storage.getPortfolioCompany(req.params.id);
      if (!company) {
        res.status(404).json({ success: false, message: "Portfolio company not found" });
        return;
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching portfolio company:", error);
      res.status(500).json({ success: false, message: "Failed to fetch portfolio company" });
    }
  });

  // Create portfolio company (admin)
  app.post("/api/portfolio", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPortfolioCompanySchema.parse(req.body);
      const company = await storage.createPortfolioCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating portfolio company:", error);
        res.status(500).json({ success: false, message: "Failed to create portfolio company" });
      }
    }
  });

  // Update portfolio company (admin)
  app.patch("/api/portfolio/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPortfolioCompanySchema.partial().parse(req.body);
      const company = await storage.updatePortfolioCompany(req.params.id, validatedData);
      if (!company) {
        res.status(404).json({ success: false, message: "Portfolio company not found" });
        return;
      }
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating portfolio company:", error);
        res.status(500).json({ success: false, message: "Failed to update portfolio company" });
      }
    }
  });

  // Delete portfolio company (admin)
  app.delete("/api/portfolio/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deletePortfolioCompany(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Portfolio company not found" });
        return;
      }
      res.json({ success: true, message: "Portfolio company deleted" });
    } catch (error) {
      console.error("Error deleting portfolio company:", error);
      res.status(500).json({ success: false, message: "Failed to delete portfolio company" });
    }
  });

  // Contact form submission (public)
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      console.log(`New contact submission from ${submission.name} (${submission.email})`);
      
      // Send email notification
      try {
        if (resend) {
          await resend.emails.send({
            from: "Valuence Ventures <noreply@valuence.vc>",
            to: NOTIFICATION_EMAIL,
            subject: `New Contact Form Submission from ${submission.name}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${submission.name}</p>
              <p><strong>Email:</strong> ${submission.email}</p>
              <p><strong>Company:</strong> ${submission.company || "Not provided"}</p>
              <p><strong>Message:</strong></p>
              <p>${submission.message}</p>
              <hr />
              <p style="color: #666; font-size: 12px;">Submitted at ${new Date().toISOString()}</p>
            `,
          });
          console.log(`Email notification sent for contact submission from ${submission.email}`);
        } else {
          console.log("Resend API key missing, skipping email notification");
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
      
      res.status(201).json({ 
        success: true, 
        message: "Contact submission received",
        id: submission.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        console.error("Contact submission error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit contact form" 
        });
      }
    }
  });

  // Newsletter signup (public)
  app.post("/api/newsletter", async (req, res) => {
    try {
      const validatedData = insertNewsletterSignupSchema.parse(req.body);
      
      // Check if email already exists
      const existingSignup = await storage.getNewsletterSignupByEmail(validatedData.email);
      if (existingSignup) {
        res.status(409).json({ 
          success: false, 
          message: "Email already subscribed" 
        });
        return;
      }
      
      const signup = await storage.createNewsletterSignup(validatedData);
      
      console.log(`New newsletter signup: ${signup.email}`);
      
      res.status(201).json({ 
        success: true, 
        message: "Successfully subscribed to newsletter",
        id: signup.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        console.error("Newsletter signup error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to subscribe to newsletter" 
        });
      }
    }
  });

  // Get all contact submissions (admin)
  app.get("/api/contact", isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch contact submissions" 
      });
    }
  });

  // Get all newsletter signups (admin)
  app.get("/api/newsletter", isAuthenticated, async (req, res) => {
    try {
      const signups = await storage.getNewsletterSignups();
      res.json(signups);
    } catch (error) {
      console.error("Error fetching newsletter signups:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch newsletter signups" 
      });
    }
  });

  // Site Content routes
  app.get("/api/site-content", async (req, res) => {
    try {
      const section = req.query.section as string | undefined;
      const content = section 
        ? await storage.getSiteContentBySection(section)
        : await storage.getSiteContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching site content:", error);
      res.status(500).json({ success: false, message: "Failed to fetch site content" });
    }
  });

  app.post("/api/site-content", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSiteContentSchema.parse(req.body);
      const content = await storage.upsertSiteContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error saving site content:", error);
        res.status(500).json({ success: false, message: "Failed to save site content" });
      }
    }
  });

  app.put("/api/site-content/batch", isAuthenticated, async (req, res) => {
    try {
      const items = req.body.items as Array<{ id: string; section: string; key: string; value: string }>;
      if (!Array.isArray(items)) {
        res.status(400).json({ success: false, message: "Items must be an array" });
        return;
      }
      const results = [];
      for (const item of items) {
        const validatedData = insertSiteContentSchema.parse(item);
        const content = await storage.upsertSiteContent(validatedData);
        results.push(content);
      }
      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error saving site content batch:", error);
        res.status(500).json({ success: false, message: "Failed to save site content" });
      }
    }
  });

  // Media upload routes
  app.get("/api/media", isAuthenticated, async (req, res) => {
    try {
      const uploads = await storage.getMediaUploads();
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching media uploads:", error);
      res.status(500).json({ success: false, message: "Failed to fetch media uploads" });
    }
  });

  app.post("/api/media", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validatedData = insertMediaUploadSchema.parse({
        ...req.body,
        uploadedBy: userId,
      });
      const upload = await storage.createMediaUpload(validatedData);
      res.status(201).json(upload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating media upload:", error);
        res.status(500).json({ success: false, message: "Failed to create media upload" });
      }
    }
  });

  app.delete("/api/media/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteMediaUpload(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Media upload not found" });
        return;
      }
      res.json({ success: true, message: "Media upload deleted" });
    } catch (error) {
      console.error("Error deleting media upload:", error);
      res.status(500).json({ success: false, message: "Failed to delete media upload" });
    }
  });

  // Object storage upload URL endpoint
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ success: false, message: "Failed to get upload URL" });
    }
  });

  // Finalize upload - normalize URL and set ACL
  app.post("/api/objects/finalize", isAuthenticated, async (req, res) => {
    try {
      const { rawUrl } = req.body;
      if (!rawUrl) {
        res.status(400).json({ success: false, message: "rawUrl is required" });
        return;
      }
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
        rawUrl,
        { visibility: "public" }
      );
      res.json({ url: normalizedPath });
    } catch (error) {
      console.error("Error finalizing upload:", error);
      res.status(500).json({ success: false, message: "Failed to finalize upload" });
    }
  });

  // Serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.params.objectPath);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Serve public objects
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // CONTENT MANAGEMENT SYSTEM ROUTES
  // ============================================

  // Get section type registry (public - needed for rendering)
  app.get("/api/section-types", (req, res) => {
    res.json(SECTION_TYPES);
  });

  // Site Pages - Public access for page content
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getSitePages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ success: false, message: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:id", async (req, res) => {
    try {
      const page = await storage.getSitePage(req.params.id);
      if (!page) {
        res.status(404).json({ success: false, message: "Page not found" });
        return;
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ success: false, message: "Failed to fetch page" });
    }
  });

  app.get("/api/pages/slug/:slug", async (req, res) => {
    try {
      const page = await storage.getSitePageBySlug(req.params.slug);
      if (!page) {
        res.status(404).json({ success: false, message: "Page not found" });
        return;
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page by slug:", error);
      res.status(500).json({ success: false, message: "Failed to fetch page" });
    }
  });

  app.post("/api/pages", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSitePageSchema.parse(req.body);
      const page = await storage.upsertSitePage(validatedData);
      res.status(201).json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating page:", error);
        res.status(500).json({ success: false, message: "Failed to create page" });
      }
    }
  });

  app.put("/api/pages/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSitePageSchema.parse({ ...req.body, id: req.params.id });
      const page = await storage.upsertSitePage(validatedData);
      res.json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating page:", error);
        res.status(500).json({ success: false, message: "Failed to update page" });
      }
    }
  });

  app.delete("/api/pages/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteSitePage(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Page not found" });
        return;
      }
      res.json({ success: true, message: "Page deleted" });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ success: false, message: "Failed to delete page" });
    }
  });

  // Content Sections - Public access for page rendering
  app.get("/api/sections/:pageId", async (req, res) => {
    try {
      const sections = await storage.getContentSections(req.params.pageId);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ success: false, message: "Failed to fetch sections" });
    }
  });

  app.get("/api/section/:id", async (req, res) => {
    try {
      const section = await storage.getContentSection(req.params.id);
      if (!section) {
        res.status(404).json({ success: false, message: "Section not found" });
        return;
      }
      res.json(section);
    } catch (error) {
      console.error("Error fetching section:", error);
      res.status(500).json({ success: false, message: "Failed to fetch section" });
    }
  });

  app.post("/api/sections", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContentSectionSchema.parse(req.body);
      const section = await storage.createContentSection(validatedData);
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating section:", error);
        res.status(500).json({ success: false, message: "Failed to create section" });
      }
    }
  });

  app.patch("/api/sections/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContentSectionSchema.partial().parse(req.body);
      const section = await storage.updateContentSection(req.params.id, validatedData);
      if (!section) {
        res.status(404).json({ success: false, message: "Section not found" });
        return;
      }
      res.json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating section:", error);
        res.status(500).json({ success: false, message: "Failed to update section" });
      }
    }
  });

  app.delete("/api/sections/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteContentSection(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Section not found" });
        return;
      }
      res.json({ success: true, message: "Section deleted" });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ success: false, message: "Failed to delete section" });
    }
  });

  app.put("/api/sections/:pageId/reorder", isAuthenticated, async (req, res) => {
    try {
      const { sectionIds } = req.body;
      if (!Array.isArray(sectionIds)) {
        res.status(400).json({ success: false, message: "sectionIds must be an array" });
        return;
      }
      await storage.reorderContentSections(req.params.pageId, sectionIds);
      res.json({ success: true, message: "Sections reordered" });
    } catch (error) {
      console.error("Error reordering sections:", error);
      res.status(500).json({ success: false, message: "Failed to reorder sections" });
    }
  });

  // Navigation Links - Public access for rendering nav
  app.get("/api/navigation", async (req, res) => {
    try {
      const location = req.query.location as string | undefined;
      const links = await storage.getNavigationLinks(location);
      res.json(links);
    } catch (error) {
      console.error("Error fetching navigation:", error);
      res.status(500).json({ success: false, message: "Failed to fetch navigation" });
    }
  });

  app.get("/api/navigation/:id", isAuthenticated, async (req, res) => {
    try {
      const link = await storage.getNavigationLink(req.params.id);
      if (!link) {
        res.status(404).json({ success: false, message: "Navigation link not found" });
        return;
      }
      res.json(link);
    } catch (error) {
      console.error("Error fetching navigation link:", error);
      res.status(500).json({ success: false, message: "Failed to fetch navigation link" });
    }
  });

  app.post("/api/navigation", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNavigationLinkSchema.parse(req.body);
      const link = await storage.createNavigationLink(validatedData);
      res.status(201).json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating navigation link:", error);
        res.status(500).json({ success: false, message: "Failed to create navigation link" });
      }
    }
  });

  app.patch("/api/navigation/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNavigationLinkSchema.partial().parse(req.body);
      const link = await storage.updateNavigationLink(req.params.id, validatedData);
      if (!link) {
        res.status(404).json({ success: false, message: "Navigation link not found" });
        return;
      }
      res.json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating navigation link:", error);
        res.status(500).json({ success: false, message: "Failed to update navigation link" });
      }
    }
  });

  app.delete("/api/navigation/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteNavigationLink(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Navigation link not found" });
        return;
      }
      res.json({ success: true, message: "Navigation link deleted" });
    } catch (error) {
      console.error("Error deleting navigation link:", error);
      res.status(500).json({ success: false, message: "Failed to delete navigation link" });
    }
  });

  app.put("/api/navigation/:location/reorder", isAuthenticated, async (req, res) => {
    try {
      const { linkIds } = req.body;
      if (!Array.isArray(linkIds)) {
        res.status(400).json({ success: false, message: "linkIds must be an array" });
        return;
      }
      await storage.reorderNavigationLinks(req.params.location, linkIds);
      res.json({ success: true, message: "Navigation links reordered" });
    } catch (error) {
      console.error("Error reordering navigation links:", error);
      res.status(500).json({ success: false, message: "Failed to reorder navigation links" });
    }
  });

  // Global Settings - Public access for site-wide settings
  app.get("/api/settings", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const settings = await storage.getGlobalSettings(category);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:id", async (req, res) => {
    try {
      const setting = await storage.getGlobalSetting(req.params.id);
      if (!setting) {
        res.status(404).json({ success: false, message: "Setting not found" });
        return;
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ success: false, message: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertGlobalSettingSchema.parse(req.body);
      const setting = await storage.upsertGlobalSetting(validatedData);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating setting:", error);
        res.status(500).json({ success: false, message: "Failed to create setting" });
      }
    }
  });

  app.put("/api/settings/batch", isAuthenticated, async (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        res.status(400).json({ success: false, message: "items must be an array" });
        return;
      }
      const results = [];
      for (const item of items) {
        const validatedData = insertGlobalSettingSchema.parse(item);
        const setting = await storage.upsertGlobalSetting(validatedData);
        results.push(setting);
      }
      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error batch updating settings:", error);
        res.status(500).json({ success: false, message: "Failed to batch update settings" });
      }
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getPageStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching analytics stats:", error);
      res.status(500).json({ success: false, message: "Failed to fetch analytics stats" });
    }
  });

  app.get("/api/analytics/views", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const views = await storage.getPageViews(limit);
      res.json(views);
    } catch (error) {
      console.error("Error fetching analytics views:", error);
      res.status(500).json({ success: false, message: "Failed to fetch analytics views" });
    }
  });

  return httpServer;
}
