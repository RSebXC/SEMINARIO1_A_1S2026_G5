const { Router } = require("express");
const tasksController = require("../controllers/tasks.controller");
const { authRequired } = require("../middleware/auth");

const router = Router();

// Todas las rutas de tareas requieren autenticación JWT
router.use("/tasks", authRequired);

router.get("/tasks", tasksController.getTasks);
router.post("/tasks", tasksController.createTask);
router.put("/tasks/:id", tasksController.updateTask);
router.patch("/tasks/:id", tasksController.toggleTask);
router.delete("/tasks/:id", tasksController.deleteTask);

module.exports = router;
