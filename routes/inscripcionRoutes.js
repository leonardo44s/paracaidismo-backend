const express = require("express")
const router = express.Router()
const inscripcionController = require("../controllers/inscripcionController")
const { verifyToken, checkRole } = require("../middleware/authMiddleware")

// Todas las rutas requieren autenticación
router.use(verifyToken)

// Rutas para usuarios autenticados
router.post("/", inscripcionController.inscribirEvento)
router.post("/curso", inscripcionController.inscribirCurso)
router.get("/mis-inscripciones", inscripcionController.getByUsuario)
router.delete("/:id", inscripcionController.cancelar)

// Rutas para instructores y admin
router.get("/evento/:evento_id", checkRole(["admin", "instructor"]), inscripcionController.getByEvento)
router.put("/:id/estado", checkRole(["admin", "instructor"]), inscripcionController.updateEstado)

module.exports = router
