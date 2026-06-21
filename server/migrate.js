const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "./.env") });

const DB_PATH = path.join(__dirname, "goodnotes.db");

// Verify SQLite file exists
if (!fs.existsSync(DB_PATH)) {
  console.error("❌ SQLite database file 'goodnotes.db' not found in server directory!");
  process.exit(1);
}

// Verify connection string
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is missing!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

// Helper to query all records from a table in SQLite
function getAllFromSqlite(sqliteDb, query) {
  const stmt = sqliteDb.prepare(query);
  const rows = [];
  while (stmt.step()) {
    const columns = stmt.getColumnNames();
    const values = stmt.get();
    const row = {};
    columns.forEach((col, i) => {
      row[col] = values[i];
    });
    rows.push(row);
  }
  stmt.free();
  return rows;
}

async function migrate() {
  console.log("🚀 Starting database migration from SQLite to PostgreSQL...");

  let sqliteDb;
  try {
    const SQL = await initSqlJs();
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqliteDb = new SQL.Database(fileBuffer);
    console.log("✅ SQLite database loaded successfully.");
  } catch (err) {
    console.error("❌ Failed to load SQLite database:", err.message);
    process.exit(1);
  }

  // Connect to PG
  const client = await pool.connect();
  try {
    console.log("🔌 Connected to PostgreSQL database.");

    // Step 1: Create target tables if they do not exist
    console.log("🛠️ Creating tables in PostgreSQL if not present...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        full_name  VARCHAR(255) NOT NULL,
        email      VARCHAR(255) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title       VARCHAR(255) NOT NULL,
        completed   INTEGER DEFAULT 0,
        due_bucket  VARCHAR(50) DEFAULT 'today',
        duration    VARCHAR(50),
        tag         VARCHAR(50),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title       VARCHAR(255) NOT NULL,
        content     TEXT,
        is_favorite INTEGER DEFAULT 0,
        color       VARCHAR(50) DEFAULT '#6366f1',
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Step 2: Read from SQLite and insert to Postgres

    // Migrate Users
    console.log("👥 Migrating users...");
    const sqliteUsers = getAllFromSqlite(sqliteDb, "SELECT * FROM users");
    console.log(`Found ${sqliteUsers.length} users in SQLite.`);

    for (const u of sqliteUsers) {
      await client.query(
        `INSERT INTO users (id, full_name, email, password, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.full_name, u.email, u.password, u.created_at ? new Date(u.created_at) : new Date()]
      );
    }
    console.log("✅ Users migrated.");

    // Migrate Tasks
    console.log("📝 Migrating tasks...");
    const sqliteTasks = getAllFromSqlite(sqliteDb, "SELECT * FROM tasks");
    console.log(`Found ${sqliteTasks.length} tasks in SQLite.`);

    for (const t of sqliteTasks) {
      // Check if user exists in PG
      const userCheck = await client.query("SELECT id FROM users WHERE id = $1", [t.user_id]);
      if (userCheck.rows.length === 0) {
        console.warn(`⚠️ Skipping task ID ${t.id} because user ID ${t.user_id} does not exist in Postgres.`);
        continue;
      }
      
      await client.query(
        `INSERT INTO tasks (id, user_id, title, completed, due_bucket, duration, tag, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [t.id, t.user_id, t.title, t.completed, t.due_bucket, t.duration, t.tag, t.created_at ? new Date(t.created_at) : new Date()]
      );
    }
    console.log("✅ Tasks migrated.");

    // Migrate Notes
    console.log("📓 Migrating notes...");
    const sqliteNotes = getAllFromSqlite(sqliteDb, "SELECT * FROM notes");
    console.log(`Found ${sqliteNotes.length} notes in SQLite.`);

    for (const n of sqliteNotes) {
      // Check if user exists in PG
      const userCheck = await client.query("SELECT id FROM users WHERE id = $1", [n.user_id]);
      if (userCheck.rows.length === 0) {
        console.warn(`⚠️ Skipping note ID ${n.id} because user ID ${n.user_id} does not exist in Postgres.`);
        continue;
      }

      await client.query(
        `INSERT INTO notes (id, user_id, title, content, is_favorite, color, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [n.id, n.user_id, n.title, n.content, n.is_favorite, n.color, n.created_at ? new Date(n.created_at) : new Date(), n.updated_at ? new Date(n.updated_at) : new Date()]
      );
    }
    console.log("✅ Notes migrated.");

    // Step 3: Reset PG Sequences
    console.log("🔄 Resetting Postgres auto-increment sequences...");
    await client.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false)`);
    await client.query(`SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 0) + 1, false)`);
    await client.query(`SELECT setval('notes_id_seq', COALESCE((SELECT MAX(id) FROM notes), 0) + 1, false)`);
    console.log("✅ Sequences reset successfully.");

    console.log("\n🎉 Database migration finished successfully!");

  } catch (err) {
    console.error("❌ Migration error occurred:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
