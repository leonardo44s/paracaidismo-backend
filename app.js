const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

// Importar rutas
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const eventoRoutes = require("./routes/eventoRoutes")
const inscripcionRoutes = require("./routes/inscripcionRoutes")
const resenaRoutes = require("./routes/resenaRoutes")
const cursoRoutes = require("./routes/cursoRoutes")
const contactoRoutes = require("./routes/contactoRoutes")
const infoRoutes = require("./routes/infoRoutes")
const uploadRoutes = require("./routes/uploadRoutes")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware

app.use(cors());
app.use(express.json())
app.use(morgan("dev"))

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, "public/uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("Directorio de uploads creado:", uploadsDir)
}

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")))
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")))

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/eventos", eventoRoutes)
app.use("/api/inscripciones", inscripcionRoutes)
app.use("/api/resenas", resenaRoutes)
app.use("/api/cursos", cursoRoutes)
app.use("/api/contacto", contactoRoutes)
app.use("/api/info", infoRoutes)
app.use("/api/upload", uploadRoutes)

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API de Paracaidismo funcionando correctamente" })
})

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Error interno del servidor" })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})

module.exports = app
