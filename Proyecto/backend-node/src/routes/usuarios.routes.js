const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const { pool } = require('../config/db');

// Listar usuarios que NO son amigos (para agregar)
router.get('/', auth, async (req, res) => {
  try {
    const sub = req.user.sub;
    const [rows] = await pool.execute(`
      SELECT cognito_sub, nombre_completo, email, foto_perfil_url
      FROM usuarios
      WHERE cognito_sub != ?
      AND cognito_sub NOT IN (
        SELECT CASE WHEN usuario_a_sub=? THEN usuario_b_sub ELSE usuario_a_sub END
        FROM amistades WHERE usuario_a_sub=? OR usuario_b_sub=?
      )
      AND cognito_sub NOT IN (
        SELECT receptor_sub FROM solicitudes_amistad WHERE solicitante_sub=? AND estado='pendiente'
      )
    `, [sub, sub, sub, sub, sub]);
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Enviar solicitud de amistad
router.post('/solicitud', auth, async (req, res) => {
  try {
    const { receptorSub } = req.body;
    if (!receptorSub) return res.status(400).json({ error: 'receptorSub requerido' });
    await pool.execute(
      'INSERT INTO solicitudes_amistad (solicitante_sub, receptor_sub) VALUES (?,?)',
      [req.user.sub, receptorSub]
    );
    res.status(201).json({ mensaje: 'Solicitud enviada' });
  } catch(e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Solicitud ya existe' });
    res.status(500).json({ error: e.message });
  }
});

// Ver solicitudes recibidas pendientes
router.get('/solicitudes', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.id, s.solicitante_sub, s.fecha_creacion,
             u.nombre_completo, u.foto_perfil_url
      FROM solicitudes_amistad s
      JOIN usuarios u ON s.solicitante_sub = u.cognito_sub
      WHERE s.receptor_sub=? AND s.estado='pendiente'
    `, [req.user.sub]);
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Aceptar o rechazar solicitud
router.put('/solicitud/:id', auth, async (req, res) => {
  try {
    const { accion } = req.body; // 'aceptar' o 'rechazar'
    if (!['aceptar','rechazar'].includes(accion))
      return res.status(400).json({ error: 'accion debe ser aceptar o rechazar' });

    const estado = accion === 'aceptar' ? 'aceptada' : 'rechazada';
    const [rows] = await pool.execute(
      'SELECT * FROM solicitudes_amistad WHERE id=? AND receptor_sub=?',
      [req.params.id, req.user.sub]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Solicitud no encontrada' });

    await pool.execute(
      'UPDATE solicitudes_amistad SET estado=? WHERE id=?',
      [estado, req.params.id]
    );

    if (accion === 'aceptar') {
      await pool.execute(
        'INSERT IGNORE INTO amistades (usuario_a_sub, usuario_b_sub) VALUES (?,?)',
        [rows[0].solicitante_sub, req.user.sub]
      );
    }

    res.json({ mensaje: `Solicitud ${estado}` });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Listar amigos (para el chat)
router.get('/amigos', auth, async (req, res) => {
  try {
    const sub = req.user.sub;
    const [rows] = await pool.execute(`
      SELECT u.cognito_sub, u.nombre_completo, u.foto_perfil_url
      FROM amistades a
      JOIN usuarios u ON u.cognito_sub = CASE
        WHEN a.usuario_a_sub=? THEN a.usuario_b_sub
        ELSE a.usuario_a_sub END
      WHERE a.usuario_a_sub=? OR a.usuario_b_sub=?
    `, [sub, sub, sub]);
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
