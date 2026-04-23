const router  = require('express').Router();
const multer  = require('multer');
const auth    = require('../middlewares/auth.middleware');
const cognito = require('../services/cognito.service');
const s3      = require('../services/s3.service');
const { pool } = require('../config/db');
const upload  = multer({ storage: multer.memoryStorage() });

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT nombre_completo, email, dpi, foto_perfil_url FROM usuarios WHERE cognito_sub=?',
      [req.user.sub]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/', auth, upload.single('foto'), async (req, res) => {
  try {
    const { nombreCompleto, dpi, password } = req.body;
    if (!password) return res.status(400).json({ error: 'Contraseña requerida' });

    // Verificar contraseña contra RDS con MD5 (no depende de Cognito)
    const [rows] = await pool.execute(
      'SELECT id FROM usuarios WHERE cognito_sub=? AND password_hash=MD5(?)',
      [req.user.sub, password]
    );
    if (!rows[0]) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // Actualizar en Cognito (opcional, no bloquea si falla)
    try {
      await cognito.actualizarPerfil({ accessToken: req.user.accessToken, nombreCompleto, dpi });
    } catch(e) { console.warn('Cognito update:', e.message); }

    // Subir nueva foto si viene
    let fotoUrl = null, fotoKey = null;
    if (req.file) {
      const ext = (req.file.mimetype.split('/')[1] || 'jpg').replace('jpeg','jpg');
      const r = await s3.subirImagen(req.file.buffer, ext, 'perfil');
      fotoUrl = r.url; fotoKey = r.key;
    }

    // Actualizar en RDS
    const upd = [], prm = [];
    if (nombreCompleto) { upd.push('nombre_completo=?'); prm.push(nombreCompleto); }
    if (dpi)            { upd.push('dpi=?');             prm.push(dpi); }
    if (fotoUrl)        { upd.push('foto_perfil_url=?', 'foto_perfil_key=?'); prm.push(fotoUrl, fotoKey); }
    if (upd.length) {
      prm.push(req.user.sub);
      await pool.execute(`UPDATE usuarios SET ${upd.join(',')} WHERE cognito_sub=?`, prm);
    }

    res.json({ mensaje: 'Perfil actualizado', fotoPerfil: fotoUrl });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
