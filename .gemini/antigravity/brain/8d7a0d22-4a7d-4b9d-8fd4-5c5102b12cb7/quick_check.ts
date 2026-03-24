import Database from 'better-sqlite3';
const db = new Database('sqlite.db');
const uploads = db.prepare('SELECT original_name, url, mime_type FROM media_uploads').all();
console.log(JSON.stringify(uploads, null, 2));
