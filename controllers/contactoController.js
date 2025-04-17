const contactoModel = require("../models/contactoModel")

const contactoController = {
  // Crear nuevo mensaje de contacto (público)
  create: async (req, res) => {
    try {
      const { nombre, email, telefono, mensaje } = req.body

      // Validaciones básicas
      if (!nombre || !email || !mensaje) {
        return res.status(400).json({ message: "Nombre, email y mensaje son requeridos" })
      }

      const contactoId = await contactoModel.create({
        nombre,
        email,
        telefono,
        mensaje,
        leido: 0,
      })

      res.status(201).json({
        message: "Mensaje enviado exitosamente",
        contactoId,
      })
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener todos los mensajes (solo admin)
  getAll: async (req, res) => {
    try {
      const mensajes = await contactoModel.findAll()
      res.json(mensajes)
    } catch (error) {
      console.error("Error al obtener mensajes:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener mensajes no leídos (solo admin)
  getNoLeidos: async (req, res) => {
    try {
      const mensajes = await contactoModel.findNoLeidos()
      res.json(mensajes)
    } catch (error) {
      console.error("Error al obtener mensajes no leídos:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener mensaje por ID (solo admin)
  getById: async (req, res) => {
    try {
      const { id } = req.params
      const mensaje = await contactoModel.findById(id)

      if (!mensaje) {
        return res.status(404).json({ message: "Mensaje no encontrado" })
      }

      res.json(mensaje)
    } catch (error) {
      console.error("Error al obtener mensaje:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Marcar mensaje como leído (solo admin)
  marcarLeido: async (req, res) => {
    try {
      const { id } = req.params

      const mensaje = await contactoModel.findById(id)
      if (!mensaje) {
        return res.status(404).json({ message: "Mensaje no encontrado" })
      }

      const updated = await contactoModel.marcarLeido(id)
      if (updated) {
        res.json({ message: "Mensaje marcado como leído" })
      } else {
        res.status(400).json({ message: "No se pudo actualizar el mensaje" })
      }
    } catch (error) {
      console.error("Error al marcar mensaje como leído:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Eliminar mensaje (solo admin)
  delete: async (req, res) => {
    try {
      const { id } = req.params

      const mensaje = await contactoModel.findById(id)
      if (!mensaje) {
        return res.status(404).json({ message: "Mensaje no encontrado" })
      }

      const deleted = await contactoModel.delete(id)
      if (deleted) {
        res.json({ message: "Mensaje eliminado exitosamente" })
      } else {
        res.status(400).json({ message: "No se pudo eliminar el mensaje" })
      }
    } catch (error) {
      console.error("Error al eliminar mensaje:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },
}

module.exports = contactoController
