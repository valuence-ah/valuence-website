import Database from 'better-sqlite3';
import { randomUUID } from "crypto";

const db = new Database('sqlite.db');

async function run() {
  console.log("Starting site data reconstruction...");

  // 1. Get all media uploads to map filenames to local URLs
  const media = db.prepare('SELECT * FROM media_uploads').all();
  const fileToUrl = {};
  media.forEach(m => {
    fileToUrl[m.original_name] = m.url;
  });

  // 2. Define Team Members based on TeamCard.tsx
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
    const url = fileToUrl[t.imageKey] || t.imageKey;
    db.prepare('INSERT OR REPLACE INTO team_members (id, name, title, category, image_url, bio, "order") VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(randomUUID(), t.name, t.title, t.category, url, "Bio coming soon...", 0);
  }
  console.log("Team members populated");

  // 3. Define Portfolio Companies based on PortfolioCard.tsx
  const portfolioData = [
    { name: "Krosslinker", category: "cleantech", logoKey: "Krosslinker logo_1764577851063.avif", featuredKey: "Krosslinker_1764577817625.avif", desc: "Advanced aerogel insulation materials for sustainable construction and cold chain logistics." },
    { name: "Nabaco", category: "cleantech", logoKey: "Nabaco logo_1764577851065.avif", featuredKey: "Nabaco_1764577817629.png", desc: "Revolutionary coatings that extend the shelf life of fresh produce, significantly reducing food waste." },
    { name: "Novel Farms", category: "techbio", logoKey: "Novel Farms logo_1764577851067.avif", featuredKey: "Novel Farms_1764577817627.avif", desc: "Scaling the production of structured cultivated meat using advanced scaffolding and cell-culture technologies." },
    { name: "MEDiC", category: "techbio", logoKey: "MEDiC logo_1764577851064.avif", featuredKey: "MEDiC_1764577817626.avif", desc: "AI-powered drug discovery platform focused on identifying novel targets for complex diseases." },
    { name: "Craft Health", category: "techbio", logoKey: "Craft Health logo_1764577851061.avif", featuredKey: "Craft Health_1764577817624.avif", desc: "3D printing platform for personalized nutrition and clinical trials." },
    { name: "Abalone Bio", category: "techbio", logoKey: "Abalone logo_1764577851059.avif", featuredKey: "Abalone Bio_1764577817622.avif", desc: "Functional antibody discovery for complex membrane protein targets." },
  ];

  for (const p of portfolioData) {
    const logoUrl = fileToUrl[p.logoKey] || p.logoKey;
    const featuredUrl = fileToUrl[p.featuredKey] || p.featuredKey;
    db.prepare('INSERT OR REPLACE INTO portfolio_companies (id, name, description, short_description, logo_url, featured_image_url, category, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(randomUUID(), p.name, p.desc, p.desc.substring(0, 100), logoUrl, featuredUrl, p.category, 0);
  }
  console.log("Portfolio companies populated");

  // 4. Update the Home Page Hero Video
  const heroVideoUrl = fileToUrl["VV_Looped_01_1764575959581.mp4"];
  if (heroVideoUrl) {
    const homeHero = db.prepare('SELECT id, data FROM content_sections WHERE page_id = "home" AND section_type = "hero"').get();
    if (homeHero) {
      const data = JSON.parse(homeHero.data);
      data.backgroundVideo = heroVideoUrl;
      db.prepare('UPDATE content_sections SET data = ? WHERE id = ?').run(JSON.stringify(data), homeHero.id);
      console.log("Home hero video updated");
    }
  }

  // 5. Update the Focus Section Image
  const focusImgUrl = fileToUrl["deeptech_technology__3d09ec57.jpg"] || fileToUrl["AdobeStock_1658479678_Preview_1764576201824.jpeg"];
  if (focusImgUrl) {
    const focusIntro = db.prepare('SELECT id, data FROM content_sections WHERE page_id = "home" AND section_type = "focus_intro"').get();
    if (focusIntro) {
      const data = JSON.parse(focusIntro.data);
      data.image = focusImgUrl;
      db.prepare('UPDATE content_sections SET data = ? WHERE id = ?').run(JSON.stringify(data), focusIntro.id);
      console.log("Focus intro image updated");
    }
  }
}

run().then(() => {
  console.log("Reconstruction finished");
  process.exit(0);
}).catch(err => {
  console.error("Reconstruction failed", err);
  process.exit(1);
});
