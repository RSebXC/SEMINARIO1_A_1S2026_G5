const pool = require("../config/db");

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      "SELECT id, user_id, title, description_ AS description, is_completed, created_at, updated_at FROM tasks WHERE user_id = ?",
      [userId]
    );
    const tasks = rows.map(task => ({
      ...task,
      is_completed: Boolean(task.is_completed),
      created_at: task.created_at.toISOString(),
      updated_at: task.updated_at.toISOString()
    }));
    return res.json(tasks);
  } catch (error) {
    console.error("Error en getTasks:", error);
    return res.status(500).json({ detail: "Error interno del servidor" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description } = req.body;

    if (!title) {
      return res.status(422).json({ detail: "El campo title es requerido" });
    }

    const [result] = await pool.execute(
      "INSERT INTO tasks (user_id, title, description_) VALUES (?, ?, ?)",
      [userId, title, description || null]
    );

    const [inserted] = await pool.execute(
      "SELECT id, user_id, title, description_ AS description, is_completed, created_at, updated_at FROM tasks WHERE id = ?",
      [result.insertId]
    );

    const task = inserted[0];
    return res.status(201).json({
      ...task,
      is_completed: Boolean(task.is_completed),
      created_at: task.created_at.toISOString(),
      updated_at: task.updated_at.toISOString()
    });
  } catch (error) {
    console.error("Error en createTask:", error);
    return res.status(500).json({ detail: "Error interno del servidor" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description } = req.body;

    const [existing] = await pool.execute("SELECT id FROM tasks WHERE id = ? AND user_id = ?", [taskId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ detail: "Tarea no encontrada" });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
    }
    if (description !== undefined) {
      updates.push("description_ = ?");
      values.push(description);
    }

    if (updates.length > 0) {
      values.push(taskId, userId);
      await pool.execute(
        `UPDATE tasks SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
        values
      );
    }

    const [updated] = await pool.execute(
      "SELECT id, user_id, title, description_ AS description, is_completed, created_at, updated_at FROM tasks WHERE id = ?",
      [taskId]
    );

    const task = updated[0];
    return res.json({
      ...task,
      is_completed: Boolean(task.is_completed),
      created_at: task.created_at.toISOString(),
      updated_at: task.updated_at.toISOString()
    });
  } catch (error) {
    console.error("Error en updateTask:", error);
    return res.status(500).json({ detail: "Error interno del servidor" });
  }
};

exports.toggleTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { is_completed } = req.body;

    if (is_completed === undefined) {
      return res.status(422).json({ detail: "El campo is_completed es requerido" });
    }

    const [existing] = await pool.execute("SELECT id FROM tasks WHERE id = ? AND user_id = ?", [taskId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ detail: "Tarea no encontrada" });
    }

    await pool.execute(
      "UPDATE tasks SET is_completed = ? WHERE id = ? AND user_id = ?",
      [is_completed ? 1 : 0, taskId, userId]
    );

    const [updated] = await pool.execute(
      "SELECT id, user_id, title, description_ AS description, is_completed, created_at, updated_at FROM tasks WHERE id = ?",
      [taskId]
    );

    const task = updated[0];
    return res.json({
      ...task,
      is_completed: Boolean(task.is_completed),
      created_at: task.created_at.toISOString(),
      updated_at: task.updated_at.toISOString()
    });
  } catch (error) {
    console.error("Error en toggleTask:", error);
    return res.status(500).json({ detail: "Error interno del servidor" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const [existing] = await pool.execute("SELECT id FROM tasks WHERE id = ? AND user_id = ?", [taskId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ detail: "Tarea no encontrada" });
    }

    await pool.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", [taskId, userId]);
    return res.status(200).json({ message: "Tarea eliminada exitosamente" });
  } catch (error) {
    console.error("Error en deleteTask:", error);
    return res.status(500).json({ detail: "Error interno del servidor" });
  }
};
