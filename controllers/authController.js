const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authController = {
  // Registro de usuario
  register: async (req, res) => {
    try {
      const { nombre, apellido, email, password, rol } = req.body;

      // Validar datos
      if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }

      // Verificar si el usuario ya existe
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado" });
      }

      // Crear nuevo usuario
      const userId = await userModel.create({
        nombre,
        apellido,
        email,
        password,
        rol: rol || "usuario", // Por defecto, rol de usuario normal
      });

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        userId,
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  // Login de usuario
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validar datos
      if (!email || !password) {
        return res.status(400).json({ message: "El email y la contraseña son obligatorios" });
      }

      console.log("Intentando login con:", email);

      // Buscar usuario por email
      const user = await userModel.findByEmail(email);
      if (!user) {
        console.log("Usuario no encontrado");
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      console.log("Usuario encontrado:", user.email, user.rol);

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log("Contraseña válida:", isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          rol: user.rol,
        },
        process.env.JWT_SECRET || "secretkey", // Usa una variable de entorno para el secreto del JWT
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login exitoso",
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      // Buscar usuario por ID
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },
};

module.exports = authController;