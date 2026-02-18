const pool = require("../config/db");

exports.list = async (req, res) => {
  const userId = req.user.id_usuario;

  const [rows] = await pool.execute(
    `SELECT lr.id_pelicula, lr.fecha_agregada,
            p.titulo, p.director, p.anio_estreno, p.url_contenido, p.poster, p.estado
     FROM lista_reproduccion lr
     JOIN peliculas p ON p.id_pelicula = lr.id_pelicula
     WHERE lr.id_usuario = ?
     ORDER BY lr.fecha_agregada DESC`, 
    [userId]
  );

  return res.json({ items: rows });
};

exports.add = async (req, res) => {
  const userId = req.user.id_usuario;
  const { id_pelicula } = req.body;
  if (!id_pelicula) return res.status(400).json({ message: "id_pelicula requerido" });

  const [movies] = await pool.execute(
    `SELECT estado FROM peliculas WHERE id_pelicula = ?`,
    [id_pelicula]
  );
  if (movies.length === 0) return res.status(404).json({ message: "Película no existe" });
  if (movies[0].estado !== "Disponible") {
    return res.status(400).json({ message: "Película no disponible" });
  }

  try {
    await pool.execute(
      `INSERT INTO lista_reproduccion (id_usuario, id_pelicula) VALUES (?, ?)`,
      [userId, id_pelicula]
    );
    return res.status(201).json({ message: "Película agregada a playlist" });
  } catch (err) {
    if (String(err.message).includes("unique_user_movie")) {
      return res.status(409).json({ message: "Ya está en tu playlist" });
    }
    return res.status(500).json({ message: "Error interno" });
  }
};

exports.remove = async (req, res) => {
  const userId = req.user.id_usuario;
  const id_pelicula = Number(req.params.id_pelicula);

  const [result] = await pool.execute(
    `DELETE FROM lista_reproduccion WHERE id_usuario = ? AND id_pelicula = ?`,
    [userId, id_pelicula]
  );

  if (result.affectedRows === 0) return res.status(404).json({ message: "No estaba en playlist" });
  return res.json({ message: "Eliminada de playlist" });
};
