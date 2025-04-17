const express = require("express")
const router = express.Router()
const contactoController = require("../controllers/contactoController")
const { verifyToken, checkRole } = require("../middleware/authMiddleware")

// Rutas públicas
router.post("/", contactoController.create)

// Rutas para administradores
router.get("/", verifyToken, checkRole(["admin"]), contactoController.getAll)
router.get("/no-leidos", verifyToken, checkRole(["admin"]), contactoController.getNoLeidos)
router.get("/:id", verifyToken, checkRole(["admin"]), contactoController.getById)
router.put("/:id/leido", verifyToken, checkRole(["admin"]), contactoController.marcarLeido)
router.delete("/:id", verifyToken, checkRole(["admin"]), contactoController.delete)

module.exports = router
