const pool = require("../config/db");

exports.list = async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT id_pelicula, titulo, director, anio_estreno, url_contenido, poster, estado
     FROM peliculas ORDER BY id_pelicula DESC`
  );
  return res.json({ items: rows });
};
