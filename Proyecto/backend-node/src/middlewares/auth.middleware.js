const jwt = require('jsonwebtoken');
module.exports = function(req,res,next) {
  const h = req.headers['authorization']||'';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error:'Token requerido' });
  try {
    const d = jwt.decode(h.split(' ')[1]);
    if (!d) return res.status(401).json({ error:'Token inválido' });
    if (d.exp && d.exp < Math.floor(Date.now()/1000)) return res.status(401).json({ error:'Token expirado' });
    req.user = { sub:d.sub, email:d.email, nombre:d.name, accessToken:h.split(' ')[1] };
    next();
  } catch { res.status(401).json({ error:'Token inválido' }); }
};
