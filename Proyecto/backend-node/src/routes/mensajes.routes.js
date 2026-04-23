const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const { pool } = require('../config/db');

// Historial de mensajes con un amigo
router.get('/:amigoSub', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT m.id, m.emisor_sub, m.receptor_sub, m.contenido, m.fecha_creacion, m.leido,
             u.nombre_completo AS emisor_nombre
      FROM mensajes m
      JOIN usuarios u ON m.emisor_sub = u.cognito_sub
      WHERE (m.emisor_sub=? AND m.receptor_sub=?)
         OR (m.emisor_sub=? AND m.receptor_sub=?)
      ORDER BY m.fecha_creacion ASC
    `, [req.user.sub, req.params.amigoSub, req.params.amigoSub, req.user.sub]);

    // Marcar como leídos
    await pool.execute(
      'UPDATE mensajes SET leido=TRUE WHERE emisor_sub=? AND receptor_sub=? AND leido=FALSE',
      [req.params.amigoSub, req.user.sub]
    );

    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Enviar mensaje (HTTP fallback si no hay WebSocket)
router.post('/', auth, async (req, res) => {
  try {
    const { receptorSub, contenido } = req.body;
    if (!receptorSub || !contenido)
      return res.status(400).json({ error: 'receptorSub y contenido requeridos' });

    const [result] = await pool.execute(
      'INSERT INTO mensajes (emisor_sub, receptor_sub, contenido) VALUES (?,?,?)',
      [req.user.sub, receptorSub, contenido]
    );
    res.status(201).json({ id: result.insertId, contenido, emisor_sub: req.user.sub });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
