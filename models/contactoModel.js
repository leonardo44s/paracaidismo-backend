const pool = require("./db")

const contactoModel = {
  // Crear un nuevo mensaje de contacto
  create: async (contactoData) => {
    const { nombre, email, telefono, mensaje, leido } = contactoData

    const [result] = await pool.query(
      "INSERT INTO contactos (nombre, email, telefono, mensaje, leido) VALUES (?, ?, ?, ?, ?)",
      [nombre, email, telefono, mensaje, leido || 0],
    )

    return result.insertId
  },

  // Obtener todos los mensajes de contacto
  findAll: async () => {
    const [rows] = await pool.query("SELECT * FROM contactos ORDER BY fecha_creacion DESC")
    return rows
  },

  // Obtener mensajes no leídos
  findNoLeidos: async () => {
    const [rows] = await pool.query("SELECT * FROM contactos WHERE leido = 0 ORDER BY fecha_creacion DESC")
    return rows
  },

  // Obtener mensaje por ID
  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM contactos WHERE id = ?", [id])
    return rows[0]
  },

  // Marcar mensaje como leído
  marcarLeido: async (id) => {
    const [result] = await pool.query("UPDATE contactos SET leido = 1 WHERE id = ?", [id])
    return result.affectedRows > 0
  },

  // Eliminar mensaje
  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM contactos WHERE id = ?", [id])
    return result.affectedRows > 0
  },
}

module.exports = contactoModel
