const pool = require("../config/db");

exports.createFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { file_name, file_type, file_url } = req.body;

    if (!file_name || !file_type || !file_url) {
      return res.status(422).json({ detail: "Los campos file_name, file_type y file_url son requeridos" });
    }

    const [result] = await pool.execute(
      "INSERT INTO files (user_id, file_name, file_type, file_url) VALUES (?, ?, ?, ?)",
      [userId, file_name, file_type, file_url]
    );

    const [inserted] = await pool.execute(
      "SELECT id, user_id, file_name, file_type, file_url, uploaded_at FROM files WHERE id = ?",
      [result.insertId]
    );

    const file = inserted[0];
    return res.status(201).json({
      ...file,
      uploaded_at: file.uploaded_at.toISOString()
    });
  } catch (error) {
    console.error("Error en createFile:", error);
    return res.status(500).json({ detail: "Error interno del servidor" });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      "SELECT id, user_id, file_name, file_type, file_url, uploaded_at FROM files WHERE user_id = ?",
      [userId]
    );

    const files = rows.map(f => ({
      ...f,
      uploaded_at: f.uploaded_at.toISOString()
    }));
    return res.json(files);
  } catch (error) {
    console.error("Error en getFiles:", error);
    return res.status(500).json({ detail: "Error interno del servidor" });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = req.params.id;

    const [rows] = await pool.execute(
      "SELECT id, user_id, file_name, file_type, file_url, uploaded_at FROM files WHERE id = ? AND user_id = ?",
      [fileId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ detail: "Archivo no encontrado" });
    }

    const file = rows[0];
    return res.json({
      ...file,
      uploaded_at: file.uploaded_at.toISOString()
    });
  } catch (error) {
    console.error("Error en getFileById:", error);
    return res.status(500).json({ detail: "Error interno del servidor" });
  }
};
