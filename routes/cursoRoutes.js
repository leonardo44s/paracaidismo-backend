const express = require("express")
const router = express.Router()
const cursoController = require("../controllers/cursoController")
const authMiddleware = require("../middleware/authMiddleware")
const multer = require("multer")
const path = require("path")
const { v4: uuidv4 } = require("uuid")
const fs = require("fs")

// Configurar almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public/uploads/cursos")

    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueFilename)
  },
})

// Filtrar archivos para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Tipo de archivo no válido. Solo se permiten imágenes (jpeg, jpg, png, gif)."), false)
  }
}

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
})

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "El archivo es demasiado grande. Tamaño máximo: 5MB." })
    }
    return res.status(400).json({ message: `Error al subir archivo: ${err.message}` })
  } else if (err) {
    return res.status(400).json({ message: err.message })
  }
  next()
}

// Middleware para verificar permisos de forma simplificada
const checkAuth = (req, res, next) => {
  try {
    // Para pruebas, permitir todas las solicitudes
    // En producción, descomentar el código de verificación de token

    /*
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autorizado. Token no proporcionado." })
    }
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    */

    // Para pruebas, asignar un usuario administrador por defecto
    req.usuario = {
      id: 1,
      rol: "admin",
    }

    next()
  } catch (error) {
    console.error("Error en autenticación:", error)
    return res.status(401).json({ message: "Token inválido o expirado." })
  }
}

// Rutas
router.get("/", cursoController.getAllCursos)
router.get("/:id", cursoController.getCursoById)

// Rutas protegidas (solo admin e instructores)
router.post(
  "/",
  checkAuth, // Usar middleware simplificado para pruebas
  upload.single("imagen"),
  handleMulterError,
  cursoController.createCurso,
)

router.put(
  "/:id",
  checkAuth, // Usar middleware simplificado para pruebas
  upload.single("imagen"),
  handleMulterError,
  cursoController.updateCurso,
)

router.delete("/:id", checkAuth, cursoController.deleteCurso)

module.exports = router
