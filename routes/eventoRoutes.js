const express = require("express")
const router = express.Router()
const eventoController = require("../controllers/eventoController")
const { verifyToken, checkRole } = require("../middleware/authMiddleware")

// Rutas públicas (accesibles sin autenticación)
router.get("/", eventoController.getAll)
router.get("/:id", eventoController.getById)

// Rutas protegidas (requieren autenticación)
// Solo instructores y admin pueden crear, actualizar y eliminar eventos
router.post("/", verifyToken, checkRole(["admin", "instructor"]), eventoController.create)
router.put("/:id", verifyToken, checkRole(["admin", "instructor"]), eventoController.update)
router.delete("/:id", verifyToken, checkRole(["admin", "instructor"]), eventoController.delete)

// Obtener eventos por instructor
router.get("/instructor/:instructorId", verifyToken, eventoController.getByInstructor)

module.exports = router
