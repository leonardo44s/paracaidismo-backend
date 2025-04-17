const infoModel = require("../models/infoModel")

const infoController = {
  // Obtener información de una sección
  getInfo: async (req, res) => {
    try {
      const { seccion } = req.params
      const info = await infoModel.getInfo(seccion)

      if (!info) {
        return res.status(404).json({ message: "Información no encontrada" })
      }

      res.json(info)
    } catch (error) {
      console.error("Error al obtener información:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener todas las secciones
  getAllSections: async (req, res) => {
    try {
      const secciones = await infoModel.getAllSections()
      res.json(secciones)
    } catch (error) {
      console.error("Error al obtener secciones:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Actualizar información (solo admin)
  updateInfo: async (req, res) => {
    try {
      const { seccion } = req.params
      const { contenido } = req.body

      if (!contenido) {
        return res.status(400).json({ message: "El contenido es requerido" })
      }

      const updated = await infoModel.updateInfo(seccion, contenido)
      if (updated) {
        res.json({ message: "Información actualizada exitosamente" })
      } else {
        res.status(400).json({ message: "No se pudo actualizar la información" })
      }
    } catch (error) {
      console.error("Error al actualizar información:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },
}

module.exports = infoController
