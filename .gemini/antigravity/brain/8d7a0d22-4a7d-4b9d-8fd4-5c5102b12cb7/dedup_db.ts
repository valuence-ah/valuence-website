import Database from 'better-sqlite3';

const db = new Database('sqlite.db');

// Team Members Deduplication (keep latest by uploaded_at if possible, or just arbitrary one)
// We didn't add uploaded_at to team_members. Let's just group by name and keep MAX(id)
const teamRes = db.prepare(`
  DELETE FROM team_members 
  WHERE id NOT IN (
    SELECT MAX(id) FROM team_members GROUP BY name
  )
`).run();
console.log("Deleted duplicate team members:", teamRes.changes);

const portRes = db.prepare(`
  DELETE FROM portfolio_companies 
  WHERE id NOT IN (
    SELECT MAX(id) FROM portfolio_companies GROUP BY name
  )
`).run();
console.log("Deleted duplicate portfolio companies:", portRes.changes);

const allTeams = db.prepare("SELECT name, image_url FROM team_members").all();
console.log("Remaining team members:", allTeams.length);

const allPorts = db.prepare("SELECT name, logo_url FROM portfolio_companies").all();
console.log("Remaining portfolio companies:", allPorts.length);
