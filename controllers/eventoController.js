const eventoModel = require("../models/eventoModel")

const eventoController = {
  // Crear nuevo evento
  create: async (req, res) => {
    try {
      const { titulo, descripcion, fecha, hora, lugar, capacidad, instructor_id } = req.body

      // Validaciones básicas
      if (!titulo || !fecha || !hora || !lugar || !capacidad) {
        return res.status(400).json({ message: "Todos los campos son requeridos" })
      }

      const eventoId = await eventoModel.create({
        titulo,
        descripcion,
        fecha,
        hora,
        lugar,
        capacidad,
        instructor_id,
      })

      res.status(201).json({
        message: "Evento creado exitosamente",
        eventoId,
      })
    } catch (error) {
      console.error("Error al crear evento:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener todos los eventos
  getAll: async (req, res) => {
    try {
      const eventos = await eventoModel.findAll()
      res.json(eventos)
    } catch (error) {
      console.error("Error al obtener eventos:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener evento por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params

      const evento = await eventoModel.findById(id)
      if (!evento) {
        return res.status(404).json({ message: "Evento no encontrado" })
      }

      res.json(evento)
    } catch (error) {
      console.error("Error al obtener evento:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener eventos por instructor
  getByInstructor: async (req, res) => {
    try {
      const { instructorId } = req.params

      const eventos = await eventoModel.findByInstructor(instructorId)
      res.json(eventos)
    } catch (error) {
      console.error("Error al obtener eventos del instructor:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Actualizar evento
  update: async (req, res) => {
    try {
      const { id } = req.params
      const { titulo, descripcion, fecha, hora, lugar, capacidad, instructor_id } = req.body

      // Validaciones básicas
      if (!titulo || !fecha || !hora || !lugar || !capacidad) {
        return res.status(400).json({ message: "Todos los campos son requeridos" })
      }

      // Verificar si el evento existe
      const evento = await eventoModel.findById(id)
      if (!evento) {
        return res.status(404).json({ message: "Evento no encontrado" })
      }

      const updated = await eventoModel.update(id, {
        titulo,
        descripcion,
        fecha,
        hora,
        lugar,
        capacidad,
        instructor_id,
      })

      if (updated) {
        res.json({ message: "Evento actualizado exitosamente" })
      } else {
        res.status(400).json({ message: "No se pudo actualizar el evento" })
      }
    } catch (error) {
      console.error("Error al actualizar evento:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Eliminar evento
  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el evento existe
      const evento = await eventoModel.findById(id)
      if (!evento) {
        return res.status(404).json({ message: "Evento no encontrado" })
      }

      const deleted = await eventoModel.delete(id)

      if (deleted) {
        res.json({ message: "Evento eliminado exitosamente" })
      } else {
        res.status(400).json({ message: "No se pudo eliminar el evento" })
      }
    } catch (error) {
      console.error("Error al eliminar evento:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },
}

module.exports = eventoController
