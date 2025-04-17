const pool = require("./db")

const infoModel = {
  // Obtener información de la página
  getInfo: async (seccion) => {
    const [rows] = await pool.query("SELECT * FROM info_pagina WHERE seccion = ?", [seccion])
    return rows[0]
  },

  // Actualizar información de la página
  updateInfo: async (seccion, contenido) => {
    // Verificar si ya existe la sección
    const [existingRows] = await pool.query("SELECT * FROM info_pagina WHERE seccion = ?", [seccion])

    if (existingRows.length > 0) {
      // Actualizar si existe
      const [result] = await pool.query("UPDATE info_pagina SET contenido = ? WHERE seccion = ?", [contenido, seccion])
      return result.affectedRows > 0
    } else {
      // Crear si no existe
      const [result] = await pool.query("INSERT INTO info_pagina (seccion, contenido) VALUES (?, ?)", [
        seccion,
        contenido,
      ])
      return result.insertId
    }
  },

  // Obtener todas las secciones
  getAllSections: async () => {
    const [rows] = await pool.query("SELECT * FROM info_pagina")
    return rows
  },
}

module.exports = infoModel
