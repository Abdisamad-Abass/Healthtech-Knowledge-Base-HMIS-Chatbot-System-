const { prisma } = require("../config/database");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

// ===============================
// REGISTER USER
// ===============================

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name email and password required",
      });
    }

    const existing = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,

        email,

        password_hash: hashedPassword,

        role: role || "VIEWER",
      },

      select: {
        id: true,

        name: true,

        email: true,

        role: true,
      },
    });

    // audit log

    await prisma.auditLog.create({
      data: {
        action: "REGISTER",

        entity: "User",

        entityId: user.id,

        userId: user.id,

        details: {
          email: user.email,
        },
      },
    });

    res.status(201).json({
      message: "User created",

      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Registration failed",

      error: error.message,
    });
  }
};

// ===============================
// LOGIN
// ===============================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      await prisma.auditLog.create({
        data: {
          action: "FAILED_LOGIN",

          entity: "User",

          entityId: user.id,

          userId: user.id,

          details: {
            email,
          },
        },
      });

      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // create token

    const token = jwt.sign(
      {
        id: user.id,

        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "8h",
      },
    );

    // audit successful login

    await prisma.auditLog.create({
      data: {
        action: "LOGIN",

        entity: "User",

        entityId: user.id,

        userId: user.id,

        details: {
          email: user.email,
        },
      },
    });

    res.json({
      token,

      user: {
        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Login failed",

      error: error.message,
    });
  }
};

// ===============================
// CURRENT USER
// ===============================

exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },

      select: {
        id: true,

        name: true,

        email: true,

        role: true,

        createdAt: true,

        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get user",

      error: error.message,
    });
  }
};

// ===============================
// LOGOUT
// ===============================

exports.logout = async (req, res) => {
  try {
    await prisma.auditLog.create({
      data: {
        action: "LOGOUT",

        entity: "User",

        entityId: req.user.id,

        userId: req.user.id,
      },
    });

    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Logout failed",

      error: error.message,
    });
  }
};
