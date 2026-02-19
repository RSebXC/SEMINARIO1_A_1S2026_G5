const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const auth = require("../controllers/auth.controller");

router.post("/register", upload.single("foto_perfil"), auth.register);
router.post("/login", auth.login);

module.exports = router;
