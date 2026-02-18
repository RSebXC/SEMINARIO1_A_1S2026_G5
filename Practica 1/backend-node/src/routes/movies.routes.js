const router = require("express").Router();
const ctrl = require("../controllers/movies.controller");

router.get("/movies", ctrl.list);

module.exports = router;
