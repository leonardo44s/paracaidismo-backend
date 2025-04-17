const pool = require("./db");
const bcrypt = require("bcrypt");

const userModel = {
  // Crear un nuevo usuario
  create: async (userData) => {
    try {
      const { nombre, apellido, email, password, rol } = userData;

      // Validar datos
      if (!nombre || !apellido || !email || !password) {
        throw new Error("Todos los campos son obligatorios");
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        "INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)",
        [nombre, apellido, email, hashedPassword, rol || "usuario"]
      );

      return result.insertId;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  },

  // Buscar usuario por email
  findByEmail: async (email) => {
    try {
      if (!email) {
        throw new Error("El email es obligatorio");
      }

      const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
      return rows[0];
    } catch (error) {
      console.error("Error al buscar usuario por email:", error);
      throw error;
    }
  },

  // Buscar usuario por ID
  findById: async (id) => {
    try {
      if (!id) {
        throw new Error("El ID es obligatorio");
      }

      const [rows] = await pool.query(
        "SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id = ?",
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error al buscar usuario por ID:", error);
      throw error;
    }
  },

  // Listar todos los usuarios
  findAll: async () => {
    try {
      const [rows] = await pool.query("SELECT id, nombre, apellido, email, rol FROM usuarios");
      return rows;
    } catch (error) {
      console.error("Error al listar usuarios:", error);
      throw error;
    }
  },

  // Actualizar usuario
  update: async (id, userData) => {
    try {
      const { nombre, apellido, email, rol } = userData;

      if (!id || !nombre || !apellido || !email) {
        throw new Error("Todos los campos son obligatorios");
      }

      const [result] = await pool.query(
        "UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, rol = ? WHERE id = ?",
        [nombre, apellido, email, rol, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  },

  // Actualizar contraseña
  updatePassword: async (id, password) => {
    try {
      if (!id || !password) {
        throw new Error("El ID y la contraseña son obligatorios");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        "UPDATE usuarios SET password = ? WHERE id = ?",
        [hashedPassword, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      throw error;
    }
  },

  // Comparar contraseña
  comparePassword: async (password, hashedPassword) => {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error("Error al comparar contraseñas:", error);
      throw error;
    }
  },

  // Eliminar usuario
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error("El ID es obligatorio");
      }

      const [result] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  },
};

module.exports = userModel;