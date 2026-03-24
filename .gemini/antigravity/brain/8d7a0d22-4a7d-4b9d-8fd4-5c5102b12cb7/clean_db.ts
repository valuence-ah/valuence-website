import Database from 'better-sqlite3';

const db = new Database('sqlite.db');

const teamRes = db.prepare("DELETE FROM team_members WHERE image_url NOT LIKE '/api/uploads/%' OR image_url IS NULL").run();
console.log("Deleted old team members:", teamRes.changes);

const portRes = db.prepare("DELETE FROM portfolio_companies WHERE logo_url NOT LIKE '/api/uploads/%' OR logo_url IS NULL").run();
console.log("Deleted old portfolio companies:", portRes.changes);

const allTeams = db.prepare("SELECT name, image_url FROM team_members").all();
console.log("Remaining team members:");
console.log(JSON.stringify(allTeams, null, 2));

const allPorts = db.prepare("SELECT name, logo_url FROM portfolio_companies").all();
console.log("Remaining portfolio companies:");
console.log(JSON.stringify(allPorts, null, 2));
