const router = require('express').Router();
const multer = require('multer');
const cognito = require('../services/cognito.service');
const rek = require('../services/rekognition.service');
const s3 = require('../services/s3.service');
const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const upload = multer({ storage:multer.memoryStorage() });

router.post('/registro', upload.single('foto'), async (req,res) => {
  try {
    const { nombreCompleto, email, dpi, password } = req.body;
    if (!nombreCompleto||!email||!dpi||!password||!req.file)
      return res.status(400).json({ error:'Todos los campos son obligatorios incluyendo foto' });
    const cog = await cognito.registrarUsuario({ email,password,nombreCompleto,dpi });
    const ext = (req.file.mimetype.split('/')[1]||'jpg').replace('jpeg','jpg');
    const foto = await s3.subirImagen(req.file.buffer, ext, 'perfil');
    try {
      await pool.execute(
        'INSERT INTO usuarios (cognito_sub,nombre_completo,email,password_hash,dpi,foto_perfil_key,foto_perfil_url) VALUES (?,?,?,MD5(?),?,?,?)',
        [cog.userSub,nombreCompleto,email,password,dpi,foto.key,foto.url]
      );
    } catch(e) { console.warn('DB:', e.message); }
    res.status(201).json({ mensaje:'Registrado. Confirma tu correo.', confirmacionRequerida:cog.confirmationRequired });
  } catch(e) {
    if (e.name==='UsernameExistsException') return res.status(409).json({ error:'Correo ya registrado' });
    res.status(500).json({ error:e.message });
  }
});

router.post('/confirmar', async (req,res) => {
  try { await cognito.confirmarCodigo(req.body); res.json({ mensaje:'Cuenta confirmada' }); }
  catch { res.status(400).json({ error:'Código inválido o expirado' }); }
});

router.post('/login', async (req,res) => {
  try {
    const { email, password } = req.body;
    const tokens = await cognito.loginUsuario({ email, password });
    let fotoPerfil = null;
    try {
      const [rows] = await pool.execute('SELECT foto_perfil_url FROM usuarios WHERE email=?',[email]);
      if (rows[0]) fotoPerfil = rows[0].foto_perfil_url;
    } catch {}
    res.json({ ...tokens, fotoPerfil });
  } catch(e) {
    if (e.name==='NotAuthorizedException') return res.status(401).json({ error:'Credenciales incorrectas' });
    res.status(500).json({ error:e.message });
  }
});

router.post('/login-facial', upload.single('foto'), async (req,res) => {
  try {
    const { email } = req.body;
    if (!email||!req.file) return res.status(400).json({ error:'Email y foto requeridos' });
    const [rows] = await pool.execute('SELECT foto_perfil_key,cognito_sub FROM usuarios WHERE email=?',[email]);
    if (!rows[0]) return res.status(404).json({ error:'Usuario no encontrado' });
    const r = await rek.compararRostros(req.file.buffer, rows[0].foto_perfil_key);
    if (!r.coincide) return res.status(401).json({ error:'Rostro no reconocido', similitud:r.similitud });
    const token = jwt.sign({ email, sub:rows[0].cognito_sub, loginMethod:'facial' }, process.env.JWT_SECRET, { expiresIn:'8h' });
    res.json({ mensaje:'Login facial exitoso', similitud:r.similitud, AccessToken:token });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

module.exports = router;
