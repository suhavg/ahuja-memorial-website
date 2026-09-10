import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export type Memory = {
  id: number;
  name: string;
  relationship: string | null;
  message: string;
  created_at: string;
  photos: string[];
};

let db: Database.Database | null = null;

export function getDb() {
  if (db) return db;

  const dataDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  db = new Database(path.join(dataDir, 'memorial.db'));
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      relationship TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS memory_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memory_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
    );
  `);

  return db;
}

export function getMemories(): Memory[] {
  const database = getDb();
  const memories = database
    .prepare('SELECT * FROM memories ORDER BY datetime(created_at) DESC, id DESC')
    .all() as Omit<Memory, 'photos'>[];

  const photoStmt = database.prepare(
    'SELECT image_url FROM memory_photos WHERE memory_id = ? ORDER BY sort_order ASC, id ASC'
  );

  return memories.map((memory) => ({
    ...memory,
    photos: (photoStmt.all(memory.id) as { image_url: string }[]).map((p) => p.image_url),
  }));
}

export function addMemory(input: {
  name: string;
  relationship?: string;
  message: string;
  photos?: string[];
}) {
  const database = getDb();
  const insertMemory = database.prepare(`
    INSERT INTO memories (name, relationship, message)
    VALUES (?, ?, ?)
  `);

  const insertPhoto = database.prepare(`
    INSERT INTO memory_photos (memory_id, image_url, sort_order)
    VALUES (?, ?, ?)
  `);

  const transaction = database.transaction(() => {
    const result = insertMemory.run(
      input.name.trim(),
      input.relationship?.trim() || null,
      input.message.trim()
    );

    const memoryId = Number(result.lastInsertRowid);
    (input.photos || []).forEach((photo, index) => {
      insertPhoto.run(memoryId, photo, index);
    });

    return memoryId;
  });

  return transaction();
}

export function getPhotoUrlsForMemory(id: number): string[] {
  const database = getDb();
  return (
    database
      .prepare('SELECT image_url FROM memory_photos WHERE memory_id = ?')
      .all(id) as { image_url: string }[]
  ).map((row) => row.image_url);
}

export function deleteMemory(id: number) {
  const database = getDb();
  database.prepare('DELETE FROM memories WHERE id = ?').run(id);
}
