import Database from 'better-sqlite3';
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const db = new Database('sqlite.db');
const SOURCE_ASSETS = 'C:\\Users\\sh225\\.antigravity\\scratch\\my-replit-website\\attached_assets';
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function run() {
  console.log("Starting final media migration...");

  const files = fs.readdirSync(SOURCE_ASSETS);
  const fileToLocalUrl = {};

  for (const filename of files) {
    const filePath = path.join(SOURCE_ASSETS, filename);
    if (fs.lstatSync(filePath).isDirectory()) continue;

    const id = randomUUID();
    const destPath = path.join(UPLOADS_DIR, id);
    
    // Copy file
    fs.copyFileSync(filePath, destPath);
    
    const url = `/api/uploads/${id}`;
    fileToLocalUrl[filename] = url;

    // Detect mime type
    let mimeType = 'application/octet-stream';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (filename.endsWith('.png')) mimeType = 'image/png';
    else if (filename.endsWith('.avif')) mimeType = 'image/avif';
    else if (filename.endsWith('.mp4')) mimeType = 'video/mp4';
    else if (filename.endsWith('.mov')) mimeType = 'video/quicktime';

    // Insert into media_uploads
    db.prepare('INSERT OR REPLACE INTO media_uploads (id, filename, original_name, mime_type, url, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, filename, filename, mimeType, url, Math.floor(Date.now() / 1000));
  }

  console.log(`Migrated ${Object.keys(fileToLocalUrl).length} assets.`);

  // Update Team Members
  const teamData = [
    { name: "Edwin Khoo", title: "General Partner", category: "gp", imageKey: "Edwin Khoo_1764576394956.jpg" },
    { name: "Noel", title: "General Partner", category: "gp", imageKey: "Noel_1764576394958.jpg" },
    { name: "Shen Lee", title: "General Partner", category: "gp", imageKey: "Shen Lee_1764576394959.jpg" },
    { name: "A.H.", title: "Investment Committee", category: "ic", imageKey: "AH_1764576369940.jpg" },
    { name: "G.C.", title: "Investment Committee", category: "ic", imageKey: "GC_1764576369941.jpg" },
    { name: "G.W.", title: "Investment Committee", category: "ic", imageKey: "GW_1764576369942.jpg" },
    { name: "L.P.", title: "Investment Committee", category: "ic", imageKey: "LP_1764576369943.jpg" },
    { name: "R.H.", title: "Investment Committee", category: "ic", imageKey: "RH_1764576369944.jpg" },
    { name: "W.T.", title: "Investment Committee", category: "ic", imageKey: "WT_1764576369946.jpg" },
  ];

  for (const t of teamData) {
    const url = fileToLocalUrl[t.imageKey];
    if (url) {
      db.prepare('INSERT OR REPLACE INTO team_members (id, name, title, category, image_url, bio, "order") VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(randomUUID(), t.name, t.title, t.category, url, "Bio coming soon...", 0);
    }
  }

  // Update Portfolio
  const portfolioData = [
    { name: "Krosslinker", category: "cleantech", logoKey: "Krosslinker logo_1764577851063.avif", featuredKey: "Krosslinker_1764577817625.avif", desc: "Advanced aerogel insulation materials for sustainable construction and cold chain logistics." },
    { name: "Nabaco", category: "cleantech", logoKey: "Nabaco logo_1764577851065.avif", featuredKey: "Nabaco_1764577817629.png", desc: "Revolutionary coatings that extend the shelf life of fresh produce, significantly reducing food waste." },
    { name: "Novel Farms", category: "techbio", logoKey: "Novel Farms logo_1764577851067.avif", featuredKey: "Novel Farms_1764577817627.avif", desc: "Scaling the production of structured cultivated meat using advanced scaffolding and cell-culture technologies." },
    { name: "MEDiC", category: "techbio", logoKey: "MEDiC logo_1764577851064.avif", featuredKey: "MEDiC_1764577817626.avif", desc: "AI-powered drug discovery platform focused on identifying novel targets for complex diseases." },
    { name: "Craft Health", category: "techbio", logoKey: "Craft Health logo_1764577851061.avif", featuredKey: "Craft Health_1764577817624.avif", desc: "3D printing platform for personalized nutrition and clinical trials." },
    { name: "Abalone Bio", category: "techbio", logoKey: "Abalone logo_1764577851059.avif", featuredKey: "Abalone Bio_1764577817622.avif", desc: "Functional antibody discovery for complex membrane protein targets." },
  ];

  for (const p of portfolioData) {
    const logoUrl = fileToLocalUrl[p.logoKey];
    const featuredUrl = fileToLocalUrl[p.featuredKey];
    if (logoUrl) {
      db.prepare('INSERT OR REPLACE INTO portfolio_companies (id, name, description, short_description, logo_url, featured_image_url, category, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(randomUUID(), p.name, p.desc, p.desc.substring(0, 100), logoUrl, featuredUrl, p.category, 0);
    }
  }

  // Update Sections
  const homeHero = db.prepare("SELECT id, data FROM content_sections WHERE page_id = 'home' AND section_type = 'hero'").get();
  if (homeHero) {
    const data = JSON.parse(homeHero.data);
    const videoUrl = fileToLocalUrl["VV_Looped_01_1764575959581.mp4"];
    if (videoUrl) data.backgroundVideo = videoUrl;
    db.prepare('UPDATE content_sections SET data = ? WHERE id = ?').run(JSON.stringify(data), homeHero.id);
  }

  const focusIntro = db.prepare("SELECT id, data FROM content_sections WHERE page_id = 'home' AND section_type = 'focus_intro'").get();
  if (focusIntro) {
    const data = JSON.parse(focusIntro.data);
    const imgUrl = fileToLocalUrl["AdobeStock_1660395436_Preview_1764576059383.jpeg"];
    if (imgUrl) data.image = imgUrl;
    db.prepare('UPDATE content_sections SET data = ? WHERE id = ?').run(JSON.stringify(data), focusIntro.id);
  }

  console.log("Migration and mapping completed!");
}

run().catch(console.error);
