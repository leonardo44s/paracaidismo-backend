const express = require("express")
const router = express.Router()
const resenaController = require("../controllers/resenaController")
const { verifyToken, checkRole } = require("../middleware/authMiddleware")

// Rutas públicas
router.get("/", resenaController.getAll) // Obtener todas las reseñas aprobadas
router.get("/curso/:cursoId", resenaController.getByCurso) // Obtener reseñas por curso

// Rutas para usuarios autenticados
router.post("/", verifyToken, resenaController.create)
router.get("/mis-resenas", verifyToken, resenaController.getMisResenas)
router.get("/cursos-disponibles", verifyToken, resenaController.getCursosDisponibles)
router.delete("/:id", verifyToken, resenaController.delete)

// Rutas para administradores
router.get("/pendientes", verifyToken, checkRole(["admin"]), resenaController.getPendientes)
router.get("/admin", verifyToken, checkRole(["admin"]), resenaController.getAll)
router.put("/:id/aprobar", verifyToken, checkRole(["admin"]), resenaController.aprobar)
router.put("/:id/rechazar", verifyToken, checkRole(["admin"]), resenaController.rechazar)

module.exports = router
