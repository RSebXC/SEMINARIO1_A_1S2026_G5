const router = require("express").Router();
const { authRequired } = require("../middleware/auth");
const ctrl = require("../controllers/playlist.controller");

router.get("/playlist", authRequired, ctrl.list);
router.post("/playlist", authRequired, ctrl.add);
router.delete("/playlist/:id_pelicula", authRequired, ctrl.remove);

module.exports = router;
