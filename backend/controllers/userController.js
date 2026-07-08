const { prisma } = require("../config/database");
const bcrypt = require("bcrypt");

// GET ALL USERS

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
            feedbacks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// GET USER BY ID

exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        articles: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
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
      message: "Error",
      error: error.message,
    });
  }
};

// CREATE USER (ADMIN)

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existing = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hash,
        role: role || "VIEWER",
        department,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message: "User created",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },

      data: {
        name: req.body.name,
        email: req.body.email,
        department: req.body.department,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,
      },
    });

    return res.status(200).json({
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ASSIGN ROLE

exports.assignRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },

      data: {
        role,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "ASSIGN_ROLE",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,
        details: {
          role,
        },
      },
    });

    res.json({
      message: "Role updated",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DEACTIVATE USER
exports.deactivateUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },

      data: {
        isActive: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "DEACTIVATE",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,
      },
    });

    res.json({
      message: "User deactivated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ACTIVATE USER

exports.activateUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },

      data: {
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "ACTIVATE",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,
      },
    });

    res.json({
      message: "User activated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: {
        id: req.params.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "User",
        entityId: req.params.id,
        userId: req.user.id,
      },
    });

    res.json({
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// AUDIT LOGS
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
