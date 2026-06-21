const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET all notes for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await db.query(
      "SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch notes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create note
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, color } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Note title is required" });
    }

    const { rows } = await db.query(
      "INSERT INTO notes (user_id, title, content, is_favorite, color) VALUES ($1, $2, $3, 0, $4) RETURNING *",
      [userId, title, content || "", color || "#6366f1"]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update note
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content, is_favorite, color } = req.body;

    // Check if note exists and belongs to user
    const checkRes = await db.query(
      "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );
    const note = checkRes.rows[0];
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const updatedTitle = title !== undefined ? title : note.title;
    const updatedContent = content !== undefined ? content : note.content;
    const updatedFavorite = is_favorite !== undefined ? (is_favorite ? 1 : 0) : note.is_favorite;
    const updatedColor = color !== undefined ? color : note.color;

    const { rows } = await db.query(
      "UPDATE notes SET title = $1, content = $2, is_favorite = $3, color = $4, updated_at = NOW() WHERE id = $5 AND user_id = $6 RETURNING *",
      [updatedTitle, updatedContent, updatedFavorite, updatedColor, noteId, userId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Update note error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE note
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    // Check if note exists and belongs to user
    const checkRes = await db.query(
      "SELECT id FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    await db.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [noteId, userId]);
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
