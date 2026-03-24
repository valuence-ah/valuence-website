import Database from 'better-sqlite3';

const db = new Database('sqlite.db');

console.log("--- Media Uploads ---");
const media = db.prepare('SELECT * FROM media_uploads').all();
console.log(JSON.stringify(media, null, 2));

console.log("\n--- Team Members ---");
const team = db.prepare('SELECT id, name, image_url FROM team_members').all();
console.log(JSON.stringify(team, null, 2));

console.log("\n--- Portfolio Companies ---");
const portfolio = db.prepare('SELECT id, name, logo_url, featured_image_url FROM portfolio_companies').all();
console.log(JSON.stringify(portfolio, null, 2));
