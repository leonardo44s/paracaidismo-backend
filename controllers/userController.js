const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")

const userController = {
  // Obtener todos los usuarios (solo admin)
  getAll: async (req, res) => {
    try {
      // Verificar si es admin
      if (req.user.rol !== "admin") {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción" })
      }

      const users = await userModel.findAll()
      res.json(users)
    } catch (error) {
      console.error("Error al obtener usuarios:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener usuario por ID (admin o el propio usuario)
  getById: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar permisos (solo admin o el propio usuario)
      if (req.user.rol !== "admin" && req.user.id !== Number.parseInt(id) || req.user.rol !== "instructor") {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción" })
      }

      const user = await userModel.findById(id)
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" })
      }

      res.json(user)
    } catch (error) {
      console.error("Error al obtener usuario:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Actualizar usuario (admin o el propio usuario)
  update: async (req, res) => {
    try {
      const { id } = req.params
      const { nombre, apellido, email, rol } = req.body

      // Verificar permisos (solo admin o el propio usuario)
      if (req.user.rol !== "admin" && req.user.id !== Number.parseInt(id)) {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción" })
      }

      // Solo admin puede cambiar roles
      if (req.user.rol !== "admin" && rol) {
        return res.status(403).json({ message: "No tienes permisos para cambiar el rol" })
      }

      // Verificar si el usuario existe
      const user = await userModel.findById(id)
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" })
      }

      const updated = await userModel.update(id, {
        nombre: nombre || user.nombre,
        apellido: apellido || user.apellido,
        email: email || user.email,
        rol: rol || user.rol,
      })

      if (updated) {
        res.json({ message: "Usuario actualizado exitosamente" })
      } else {
        res.status(400).json({ message: "No se pudo actualizar el usuario" })
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Cambiar contraseña (admin o el propio usuario)
  updatePassword: async (req, res) => {
    try {
      const { id } = req.params
      const { currentPassword, newPassword } = req.body

      // Verificar permisos (solo admin o el propio usuario)
      if (req.user.rol !== "admin" && req.user.id !== Number.parseInt(id)) {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción" })
      }

      // Verificar si el usuario existe
      const user = await userModel.findByIdWithPassword(id)
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" })
      }

      // Si no es admin, verificar la contraseña actual
      if (req.user.rol !== "admin") {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) {
          return res.status(400).json({ message: "La contraseña actual es incorrecta" })
        }
      }

      const updated = await userModel.updatePassword(id, newPassword)

      if (updated) {
        res.json({ message: "Contraseña actualizada exitosamente" })
      } else {
        res.status(400).json({ message: "No se pudo actualizar la contraseña" })
      }
    } catch (error) {
      console.error("Error al actualizar contraseña:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Eliminar usuario (solo admin)
  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si es admin
      if (req.user.rol !== "admin") {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción" })
      }

      // Verificar si el usuario existe
      const user = await userModel.findById(id)
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" })
      }

      const deleted = await userModel.delete(id)

      if (deleted) {
        res.json({ message: "Usuario eliminado exitosamente" })
      } else {
        res.status(400).json({ message: "No se pudo eliminar el usuario" })
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },
}

module.exports = userController
