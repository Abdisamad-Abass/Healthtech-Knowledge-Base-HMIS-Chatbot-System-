const { prisma } = require("../config/database");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

// REGISTER USER
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
        action: "USER_REGISTERED",
        entity: "User",
        entityId: user.id,
        userId: user.id,
        details: {
          registeredUser: {
            name: user.name,
            email: user.email,
            role: user.role,
          },
          registrationMethod: "SELF_REGISTERED",
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

// LOGIN

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const MAX_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);

    const LOCK_TIME =
      Number(process.env.ACCOUNT_LOCK_MINUTES || 15) * 60 * 1000;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }
    // find user by email
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

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

      return res.status(429).json({
        message: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`,
        lockedUntil: user.lockedUntil,
        remainingMinutes,
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      const attempts = user.failedLoginAttempts + 1;

      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          failedLoginAttempts: attempts,
          lastFailedLogin: new Date(),
          lockedUntil:
            attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_TIME) : null,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "USER_LOGIN_FAILED",
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
    // Reset failed attempts
    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastFailedLogin: null,
      },
    });

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
        action: "USER_LOGIN",
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

// CURRENT USER

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

// LOGOUT

exports.logout = async (req, res) => {
  try {
    //audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_LOGOUT",

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
