const { Router } = require("express");
const filesController = require("../controllers/files.controller");
const { authRequired } = require("../middleware/auth");

const router = Router();

router.use("/files", authRequired);

router.post("/files", filesController.createFile);
router.get("/files", filesController.getFiles);
router.get("/files/:id", filesController.getFileById);

module.exports = router;
