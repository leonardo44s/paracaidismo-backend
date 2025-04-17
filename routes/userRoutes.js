const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const { verifyToken, checkRole } = require("../middleware/authMiddleware")

// Todas las rutas requieren autenticación
router.use(verifyToken)

// Rutas para admin
router.get("/", checkRole(["admin"]), userController.getAll)
router.delete("/:id", checkRole(["admin"]), userController.delete)

// Rutas para el propio usuario o admin
router.get("/:id", userController.getById)
router.put("/:id", userController.update)
router.put("/:id/password", userController.updatePassword)

module.exports = router
