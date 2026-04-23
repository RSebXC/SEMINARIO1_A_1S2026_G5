const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const { enviarMensajeLex } = require('../services/lex.service');
router.post('/mensaje', auth, async (req,res) => {
  try {
    const { mensaje, sessionId }=req.body;
    if (!mensaje) return res.status(400).json({ error:'Mensaje requerido' });
    res.json(await enviarMensajeLex(mensaje,sessionId));
  } catch(e) { res.status(500).json({ error:e.message }); }
});
module.exports = router;
