const path = require("path")
const fs = require("fs")
const multer = require("multer")
const { v4: uuidv4 } = require("uuid")

// Configurar almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public/uploads")

    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueFilename = `${uuidv4()}-${file.originalname.replace(/\s+/g, "-")}`
    cb(null, uniqueFilename)
  },
})

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF)"), false)
  }
}

// Configurar multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

const uploadController = {
  // Subir imagen
  uploadImage: (req, res) => {
    // El middleware de multer ya procesó el archivo
    const uploadMiddleware = upload.single("image")

    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "El archivo es demasiado grande. Máximo 5MB." })
        }
        return res.status(400).json({ message: err.message })
      }

      if (!req.file) {
        return res.status(400).json({ message: "No se ha proporcionado ninguna imagen" })
      }

      // Construir URL para acceder a la imagen
      const baseUrl = `${req.protocol}://${req.get("host")}`
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`

      res.json({
        message: "Imagen subida con éxito",
        imageUrl,
      })
    })
  },

  // Eliminar imagen
  deleteImage: (req, res) => {
    const { filename } = req.params

    if (!filename) {
      return res.status(400).json({ message: "Nombre de archivo no proporcionado" })
    }

    const filePath = path.join(__dirname, "../public/uploads", filename)

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Archivo no encontrado" })
    }

    // Eliminar archivo
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error al eliminar archivo:", err)
        return res.status(500).json({ message: "Error al eliminar la imagen" })
      }

      res.json({ message: "Imagen eliminada con éxito" })
    })
  },
}

module.exports = uploadController
