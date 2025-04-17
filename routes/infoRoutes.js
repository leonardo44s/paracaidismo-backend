const express = require("express")
const router = express.Router()
const infoController = require("../controllers/infoController")
const { verifyToken, checkRole } = require("../middleware/authMiddleware")

// Rutas públicas
router.get("/:seccion", infoController.getInfo)
router.get("/", infoController.getAllSections)

// Rutas para administradores
router.put("/:seccion", verifyToken, checkRole(["admin"]), infoController.updateInfo)

module.exports = router
