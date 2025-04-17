const resenaModel = require("../models/resenaModel")

const resenaController = {
  // Crear nueva reseña
  create: async (req, res) => {
    try {
      const { titulo, contenido, calificacion, curso_id } = req.body
      const usuario_id = req.user.id

      console.log("Creando reseña:", { titulo, contenido, calificacion, curso_id, usuario_id })

      // Validaciones básicas
      if (!titulo || !contenido || !calificacion) {
        return res.status(400).json({ message: "Todos los campos son requeridos" })
      }

      // Validar calificación (1-5)
      if (calificacion < 1 || calificacion > 5) {
        return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" })
      }

      const resenaId = await resenaModel.create({
        usuario_id,
        curso_id: curso_id || null,
        titulo,
        contenido,
        calificacion: Number.parseInt(calificacion),
      })

      res.status(201).json({
        message: "Reseña enviada exitosamente. Será revisada por un administrador.",
        resenaId,
      })
    } catch (error) {
      console.error("Error al crear reseña:", error)
      res.status(500).json({ message: "Error en el servidor: " + error.message })
    }
  },

  // Obtener todas las reseñas aprobadas
  getAll: async (req, res) => {
    try {
      const resenas = await resenaModel.findAll()
      res.json(resenas)
    } catch (error) {
      console.error("Error al obtener reseñas:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener reseñas por curso
  getByCurso: async (req, res) => {
    try {
      const { cursoId } = req.params
      const resenas = await resenaModel.findByCurso(cursoId)
      res.json(resenas)
    } catch (error) {
      console.error("Error al obtener reseñas del curso:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener reseñas por usuario
  getByUsuario: async (req, res) => {
    try {
      const { usuarioId } = req.params
      const resenas = await resenaModel.findByUsuario(usuarioId)
      res.json(resenas)
    } catch (error) {
      console.error("Error al obtener reseñas del usuario:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener cursos disponibles para reseñar
  getCursosDisponibles: async (req, res) => {
    try {
      const usuario_id = req.user.id
      const cursos = await resenaModel.getCursosDisponibles(usuario_id)
      res.json(cursos)
    } catch (error) {
      console.error("Error al obtener cursos disponibles:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener reseñas pendientes (solo admin)
  getPendientes: async (req, res) => {
    try {
      // Verificar si el usuario es admin
      if (req.user.rol !== "admin") {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción" })
      }

      const resenas = await resenaModel.findPendientes()
      console.log("Reseñas pendientes encontradas:", resenas.length)
      res.json(resenas)
    } catch (error) {
      console.error("Error al obtener reseñas pendientes:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener reseñas del usuario actual
  getMisResenas: async (req, res) => {
    try {
      const usuario_id = req.user.id
      console.log("Obteniendo reseñas para usuario ID:", usuario_id)

      // Verificar que el usuario existe
      if (!usuario_id) {
        return res.status(400).json({ message: "ID de usuario no válido" })
      }

      const resenas = await resenaModel.findByUsuario(usuario_id)
      console.log("Reseñas encontradas:", resenas.length)
      res.json(resenas)
    } catch (error) {
      console.error("Error al obtener mis reseñas:", error)
      res.status(500).json({ message: "Error en el servidor: " + error.message })
    }
  },

  // Aprobar reseña (solo admin)
  aprobar: async (req, res) => {
    try {
      // Verificar si el usuario es admin
      if (req.user.rol !== "admin") {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción" })
      }

      const { id } = req.params

      const resena = await resenaModel.findById(id)
      if (!resena) {
        return res.status(404).json({ message: "Reseña no encontrada" })
      }

      const aprobada = await resenaModel.aprobar(id)
      if (aprobada) {
        res.json({ message: "Reseña aprobada exitosamente" })
      } else {
        res.status(400).json({ message: "No se pudo aprobar la reseña" })
      }
    } catch (error) {
      console.error("Error al aprobar reseña:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Rechazar reseña (solo admin)
  rechazar: async (req, res) => {
    try {
      // Verificar si el usuario es admin
      if (req.user.rol !== "admin") {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción" })
      }

      const { id } = req.params
      const { motivo } = req.body

      if (!motivo) {
        return res.status(400).json({ message: "El motivo de rechazo es requerido" })
      }

      const resena = await resenaModel.findById(id)
      if (!resena) {
        return res.status(404).json({ message: "Reseña no encontrada" })
      }

      const rechazada = await resenaModel.rechazar(id, motivo)
      if (rechazada) {
        res.json({ message: "Reseña rechazada exitosamente" })
      } else {
        res.status(400).json({ message: "No se pudo rechazar la reseña" })
      }
    } catch (error) {
      console.error("Error al rechazar reseña:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Eliminar reseña (admin o propietario)
  delete: async (req, res) => {
    try {
      const { id } = req.params

      const resena = await resenaModel.findById(id)
      if (!resena) {
        return res.status(404).json({ message: "Reseña no encontrada" })
      }

      // Verificar permisos (solo admin o propietario)
      if (req.user.rol !== "admin" && resena.usuario_id !== req.user.id) {
        return res.status(403).json({ message: "No tienes permisos para eliminar esta reseña" })
      }

      const deleted = await resenaModel.delete(id)
      if (deleted) {
        res.json({ message: "Reseña eliminada exitosamente" })
      } else {
        res.status(400).json({ message: "No se pudo eliminar la reseña" })
      }
    } catch (error) {
      console.error("Error al eliminar reseña:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },
}

module.exports = resenaController
