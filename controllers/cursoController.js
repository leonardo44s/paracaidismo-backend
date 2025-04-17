const db = require("../models/db")
const cursoModel = require("../models/cursoModel")
const fs = require("fs")
const path = require("path")

// Crear un nuevo curso
exports.createCurso = async (req, res) => {
  console.log("Iniciando creación de curso")
  console.log("Datos recibidos:", req.body)

  if (req.file) {
    console.log("Archivo recibido:", req.file)
  }

  try {
    const { titulo, descripcion, nivel, duracion, precio, instructor_id } = req.body

    // Validar que el instructor exista
    const [instructores] = await db.query('SELECT id FROM usuarios WHERE id = ? AND rol = "instructor"', [
      instructor_id,
    ])

    console.log("Instructor encontrado:", instructores)

    let instructor_id_to_use = null

    if (instructores.length === 0) {
      console.log("Instructor no encontrado, buscando instructor por defecto")
      // Si no existe el instructor, buscar uno por defecto
      const [defaultInstructor] = await db.query('SELECT id FROM usuarios WHERE rol = "instructor" LIMIT 1')

      if (defaultInstructor.length > 0) {
        instructor_id_to_use = defaultInstructor[0].id
        console.log("ID de instructor por defecto a utilizar:", instructor_id_to_use)
      } else {
        return res.status(400).json({ message: "No hay instructores disponibles en el sistema" })
      }
    } else {
      instructor_id_to_use = instructor_id
      console.log("ID de instructor a utilizar:", instructor_id_to_use)
    }

    // Procesar imagen si existe
    let imagenFilename = null
    if (req.file) {
      imagenFilename = req.file.filename
      console.log("Imagen guardada como:", imagenFilename)
    }

    // Crear el curso
    try {
      const result = await cursoModel.create({
        titulo,
        descripcion,
        nivel,
        duracion,
        precio: Number.parseFloat(precio),
        instructor_id: Number.parseInt(instructor_id_to_use),
        imagen: imagenFilename ? `/uploads/cursos/${imagenFilename}` : null,
      })

      res.status(201).json({
        message: "Curso creado exitosamente",
        id: result.insertId,
      })
    } catch (error) {
      console.log("ERROR EN inserción de curso:", error)
      console.log(
        "Detalles:",
        JSON.stringify({
          message: error.message,
          stack: error.stack,
          code: error.code,
        }),
      )

      // Si hay error y se subió una imagen, eliminarla
      if (imagenFilename) {
        const imagePath = path.join(__dirname, "../public/uploads/cursos", imagenFilename)
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      }

      res.status(400).json({ message: error.message })
    }
  } catch (error) {
    console.error("Error al crear curso:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Obtener todos los cursos
exports.getAllCursos = async (req, res) => {
  try {
    const cursos = await cursoModel.getAll()
    res.json(cursos)
  } catch (error) {
    console.error("Error al obtener cursos:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Obtener un curso por ID
exports.getCursoById = async (req, res) => {
  try {
    const { id } = req.params
    const curso = await cursoModel.getById(id)

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" })
    }

    res.json(curso)
  } catch (error) {
    console.error("Error al obtener curso:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Actualizar un curso
exports.updateCurso = async (req, res) => {
  try {
    const { id } = req.params
    const { titulo, descripcion, nivel, duracion, precio, instructor_id } = req.body

    // Validar que el curso exista
    const curso = await cursoModel.getById(id)
    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" })
    }

    // Validar que el instructor exista
    if (instructor_id) {
      const [instructores] = await db.query('SELECT id FROM usuarios WHERE id = ? AND rol = "instructor"', [
        instructor_id,
      ])
      if (instructores.length === 0) {
        return res.status(400).json({ message: "El instructor seleccionado no existe" })
      }
    }

    // Procesar imagen si existe
    let imagenFilename = curso.imagen
    if (req.file) {
      // Si hay una imagen anterior, eliminarla
      if (curso.imagen) {
        const oldImagePath = path.join(__dirname, "../public", curso.imagen)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }

      imagenFilename = `/uploads/cursos/${req.file.filename}`
    }

    // Actualizar el curso
    await cursoModel.update(id, {
      titulo,
      descripcion,
      nivel,
      duracion,
      precio: Number.parseFloat(precio),
      instructor_id: instructor_id ? Number.parseInt(instructor_id) : curso.instructor_id,
      imagen: imagenFilename,
    })

    res.json({ message: "Curso actualizado exitosamente" })
  } catch (error) {
    console.error("Error al actualizar curso:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Eliminar un curso
exports.deleteCurso = async (req, res) => {
  try {
    const { id } = req.params

    // Validar que el curso exista
    const curso = await cursoModel.getById(id)
    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" })
    }

    // Si el curso tiene una imagen, eliminarla
    if (curso.imagen) {
      const imagePath = path.join(__dirname, "../public", curso.imagen)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    // Eliminar el curso
    await cursoModel.delete(id)

    res.json({ message: "Curso eliminado exitosamente" })
  } catch (error) {
    console.error("Error al eliminar curso:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}
