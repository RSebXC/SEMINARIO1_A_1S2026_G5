const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { authRequired } = require("../middleware/auth");
const ctrl = require("../controllers/profile.controller");

router.get("/profile", authRequired, ctrl.me);
router.put("/profile", authRequired, upload.single("foto_perfil"), ctrl.update);

module.exports = router;
