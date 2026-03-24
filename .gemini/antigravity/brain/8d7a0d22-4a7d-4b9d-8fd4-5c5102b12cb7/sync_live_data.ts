import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import liveTeam from './live_team.json' with { type: 'json' };
import livePortfolio from './live_portfolio.json' with { type: 'json' };

const db = new Database('sqlite.db');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function downloadImage(url: string, id: string, name: string) {
    const res = await fetch(url);
    if (!res.ok) {
        console.log(`Failed to fetch ${url}`);
        return null;
    }
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(path.join(UPLOADS_DIR, id), Buffer.from(buffer));
    
    // insert into media
    let mimeType = 'image/png';
    db.prepare('INSERT OR IGNORE INTO media_uploads (id, filename, original_name, mime_type, url, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, name, name, mimeType, `/api/uploads/${id}`, Math.floor(Date.now() / 1000));
    
    return `/api/uploads/${id}`;
}

async function run() {
    console.log("Emptying old tables...");
    db.prepare("DELETE FROM team_members").run();
    db.prepare("DELETE FROM portfolio_companies").run();

    // Map existing assets for standard names
    const media = db.prepare("SELECT filename, url FROM media_uploads").all();
    const mediaMap: Record<string, string> = {};
    for (const m of media) {
        mediaMap[m.filename] = m.url;
    }

    console.log("Syncing Team...");
    for (const t of liveTeam) {
        let finalUrl = t.imageUrl;
        // If it's a specific shorthand 
        if (t.imageUrl === 'AH') finalUrl = mediaMap['AH_1764576369940.jpg'];
        if (t.imageUrl === 'GC') finalUrl = mediaMap['GC_1764576369941.jpg'];
        if (t.imageUrl === 'LP') finalUrl = mediaMap['LP_1764576369943.jpg'];
        if (t.imageUrl === 'GW') finalUrl = mediaMap['GW_1764576369942.jpg'];
        if (t.imageUrl === 'RH') finalUrl = mediaMap['RH_1764576369944.jpg'];
        if (t.imageUrl === 'WT') finalUrl = mediaMap['WT_1764576369946.jpg'];
        
        // If it's an absolute path from live site
        if (t.imageUrl && t.imageUrl.startsWith('/objects/uploads/')) {
            const uuid = t.imageUrl.split('/').pop();
            finalUrl = await downloadImage(`https://www.valuence.vc${t.imageUrl}`, uuid, `${t.name}.img`);
        }

        db.prepare('INSERT INTO team_members (id, name, title, category, image_url, bio, linkedin_url, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
            .run(t.id, t.name, t.title, t.category, finalUrl, t.bio, t.linkedinUrl, t.order);
    }

    console.log("Syncing Portfolio...");
    for (const p of livePortfolio) {
        let finalLogo = p.logoUrl;
        let finalFeat = p.featuredImageUrl;

        if (p.logoUrl === 'ABALONE_LOGO') finalLogo = mediaMap['Abalone logo_1764577851059.avif'];
        if (p.logoUrl === 'CRAFT_HEALTH_LOGO') finalLogo = mediaMap['Craft Health logo_1764577851061.avif'];
        if (p.logoUrl === 'KROSSLINKER_LOGO') finalLogo = mediaMap['Krosslinker logo_1764577851063.avif'];
        if (p.logoUrl === 'MEDIC_LOGO') finalLogo = mediaMap['MEDiC logo_1764577851064.avif'];
        if (p.logoUrl === 'NABACO_LOGO') finalLogo = mediaMap['Nabaco logo_1764577851065.avif'];
        if (p.logoUrl === 'NOVEL_FARMS_LOGO') finalLogo = mediaMap['Novel Farms logo_1764577851067.avif'];

        if (p.featuredImageUrl === 'ABALONE') finalFeat = mediaMap['Abalone Bio_1764577817622.avif'];
        if (p.featuredImageUrl === 'CRAFT_HEALTH') finalFeat = mediaMap['Craft Health_1764577817624.avif'];
        if (p.featuredImageUrl === 'KROSSLINKER') finalFeat = mediaMap['Krosslinker_1764577817625.avif'];
        if (p.featuredImageUrl === 'MEDIC') finalFeat = mediaMap['MEDiC_1764577817626.avif'];
        if (p.featuredImageUrl === 'NABACO') finalFeat = mediaMap['Nabaco_1764577817629.png'];
        if (p.featuredImageUrl === 'NOVEL_FARMS') finalFeat = mediaMap['Novel Farms_1764577817627.avif'];

        if (p.logoUrl && p.logoUrl.startsWith('/objects/uploads/')) {
            const uuid = p.logoUrl.split('/').pop();
            finalLogo = await downloadImage(`https://www.valuence.vc${p.logoUrl}`, uuid, `${p.name} logo`);
        }
        if (p.featuredImageUrl && p.featuredImageUrl.startsWith('/objects/uploads/')) {
            const uuid = p.featuredImageUrl.split('/').pop();
            finalFeat = await downloadImage(`https://www.valuence.vc${p.featuredImageUrl}`, uuid, `${p.name} featured`);
        }

        db.prepare('INSERT INTO portfolio_companies (id, name, description, short_description, logo_url, featured_image_url, website_url, category, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .run(p.id, p.name, p.description, p.shortDescription, finalLogo, finalFeat, p.websiteUrl, p.category, p.order);
    }
    
    // Focus Images
    console.log("Focus Images Map:");
    console.log("Deeptech:", mediaMap['AdobeStock_1660395436_Preview_1764576059383.jpeg']);
    console.log("Cleantech:", mediaMap['AdobeStock_1816369392_Preview_1764576284154.jpeg']); // assuming 
    console.log("Techbio:", mediaMap['AdobeStock_960429573_Preview_1764576181370.jpeg']); // assuming
    console.log("Global:", mediaMap['AdobeStock_1658479678_Preview_1764576201824.jpeg']); // assuming
    
    console.log("Done.");
}

run().catch(console.error);
