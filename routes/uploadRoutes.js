const express = require("express")
const router = express.Router()
const uploadController = require("../controllers/uploadController")
const { verifyToken, checkRole } = require("../middleware/authMiddleware")

// Rutas protegidas (solo admin e instructores pueden subir imágenes)
router.post("/image", verifyToken, checkRole(["admin", "instructor"]), uploadController.uploadImage)
router.delete("/image/:filename", verifyToken, checkRole(["admin", "instructor"]), uploadController.deleteImage)

module.exports = router
