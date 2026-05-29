import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db";
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

const schemaPath = path.join(__dirname, "../infrastructure/initSchema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");

db.exec(schema);
console.log("[MemoryHub] SQLite schema initialized at", dbPath);
db.close();
