const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET all tasks for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await db.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at ASC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch tasks error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, due_bucket, duration, tag } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const { rows } = await db.query(
      "INSERT INTO tasks (user_id, title, completed, due_bucket, duration, tag) VALUES ($1, $2, 0, $3, $4, $5) RETURNING *",
      [userId, title, due_bucket || "today", duration || "", tag || ""]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update task
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, completed, due_bucket, duration, tag } = req.body;

    // Check if task exists and belongs to user
    const checkRes = await db.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, userId]
    );
    const task = checkRes.rows[0];
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTitle = title !== undefined ? title : task.title;
    const updatedCompleted = completed !== undefined ? (completed ? 1 : 0) : task.completed;
    const updatedBucket = due_bucket !== undefined ? due_bucket : task.due_bucket;
    const updatedDuration = duration !== undefined ? duration : task.duration;
    const updatedTag = tag !== undefined ? tag : task.tag;

    const { rows } = await db.query(
      "UPDATE tasks SET title = $1, completed = $2, due_bucket = $3, duration = $4, tag = $5 WHERE id = $6 AND user_id = $7 RETURNING *",
      [updatedTitle, updatedCompleted, updatedBucket, updatedDuration, updatedTag, taskId, userId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    // Check if task exists and belongs to user
    const checkRes = await db.query(
      "SELECT id FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, userId]
    );
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    await db.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [taskId, userId]);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
