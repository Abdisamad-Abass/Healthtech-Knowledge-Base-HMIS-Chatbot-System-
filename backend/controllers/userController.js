const { prisma } = require("../config/database");
const bcrypt = require("bcrypt");

// GET ALL USERS

exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      department,
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));

    const where = {};

    // Search
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Role filter
    if (role) {
      where.role = role.toUpperCase();
    }

    // Department filter
    if (department) {
      where.department = {
        contains: department,
        mode: "insensitive",
      };
    }

    // Active / Inactive filter
    if (status === "active") {
      where.isActive = true;
    }

    if (status === "inactive") {
      where.isActive = false;
    }

    const total = await prisma.user.count({
      where,
    });

    const users = await prisma.user.findMany({
      where,

      skip: (pageNumber - 1) * limitNumber,

      take: limitNumber,

      orderBy: {
        [sortBy]: order === "asc" ? "asc" : "desc",
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

        _count: {
          select: {
            articles: true,
            feedbacks: true,
          },
        },
      },
    });

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      editorUsers,
      viewerUsers,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          isActive: true,
        },
      }),

      prisma.user.count({
        where: {
          isActive: false,
        },
      }),

      prisma.user.count({
        where: {
          role: "ADMIN",
        },
      }),

      prisma.user.count({
        where: {
          role: "EDITOR",
        },
      }),

      prisma.user.count({
        where: {
          role: "VIEWER",
        },
      }),
    ]);

    return res.json({
      users,

      statistics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        editorUsers,
        viewerUsers,
      },

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        hasNext: pageNumber < Math.ceil(total / limitNumber),
        hasPrevious: pageNumber > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
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
    //audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_CREATED",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,
        details: {
          createdUser: {
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
          },
        },
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
    const { name, email, role, department, password, isActive } = req.body;
    const oldUser = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });
    const data = {};

    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (department !== undefined) data.department = department;
    if (isActive !== undefined) {
      data.isActive = isActive;
    }

    if (password) {
      data.password_hash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data,
    });

    const updatedBy = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
    });
    // audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_UPDATED",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,

        details: {
          before: {
            name: oldUser.name,
            email: oldUser.email,
            role: oldUser.role,
            department: oldUser.department,
            isActive: oldUser.isActive,
          },
          after: {
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            isActive: user.isActive,
          },
          updatedBy,
        },
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

    const oldUser = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });
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
        action: "USER_ROLE_CHANGED",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,
        details: {
          oldRole: oldUser.role,
          newRole: role,
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
    //audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_DEACTIVATED",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,
        details: {
          isActive: false,
        },
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
    //audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_ACTIVATED",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,
        details: {
          isActive: true,
        },
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
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const deletedBy = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
    });
    await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        isActive: false,
      },
    });
    //audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_DELETED",
        entity: "User",
        entityId: user.id,
        userId: req.user.id,
        details: {
          deletedUser: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
          },
          deletedBy,
        },
      },
    });

    return res.status(200).json({
      message: "User deleted successfully.",
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
    const {
      page = 1,
      limit = 20,
      action,
      entity,
      userId,
      startDate,
      endDate,
      search,
    } = req.query;

    const where = {};

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        {
          action: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          entity: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        // Search exact query inside details.query
        {
          details: {
            path: ["query"],
            string_contains: search,
            mode: "insensitive",
          },
        },

        // Search exact chatbot question inside details.question
        {
          details: {
            path: ["question"],
            string_contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,

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

      skip: (Number(page) - 1) * Number(limit),

      take: Number(limit),

      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.auditLog.count({
      where,
    });

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      logs,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAuditLogSummary = async (req, res) => {
  try {
    const [
      totalLogs,
      created,
      updated,
      deleted,
      activated,
      deactivated,
      roleChanged,

      searches,
      noResultSearches,
      autocompleteSearches,
      chatbotQuestions,
      clearedSearchHistory,
    ] = await Promise.all([
      prisma.auditLog.count(),

      prisma.auditLog.count({
        where: {
          action: "USER_CREATED",
        },
      }),

      prisma.auditLog.count({
        where: {
          action: "USER_UPDATED",
        },
      }),

      prisma.auditLog.count({
        where: {
          action: "USER_DELETED",
        },
      }),

      prisma.auditLog.count({
        where: {
          action: "USER_ACTIVATED",
        },
      }),

      prisma.auditLog.count({
        where: {
          action: "USER_DEACTIVATED",
        },
      }),

      prisma.auditLog.count({
        where: {
          action: "USER_ROLE_CHANGED",
        },
      }),

      prisma.auditLog.count({
        where: {
          action: "SEARCH_PERFORMED",
        },
      }),

      prisma.auditLog.count({
        where: {
          action: "SEARCH_NO_RESULTS",
        },
      }),

      prisma.auditLog.count({
        where: {
          action: "SEARCH_AUTOCOMPLETE",
        },
      }),

      prisma.auditLog.count({
        where: {
          action: "CHATBOT",
        },
      }),

      prisma.auditLog.count({
        where: {
          action: "SEARCH_HISTORY_CLEARED",
        },
      }),
    ]);

    return res.json({
      totalLogs,

      created,
      updated,
      deleted,
      activated,
      deactivated,
      roleChanged,

      searches,
      noResultSearches,
      autocompleteSearches,
      chatbotQuestions,
      clearedSearchHistory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch audit log summary",
      error: error.message,
    });
  }
};

exports.getDepartments = async (req, res) => {
  const departments = await prisma.user.findMany({
    where: {
      department: {
        not: null,
      },
    },

    distinct: ["department"],

    select: {
      department: true,
    },
  });

  res.json(departments.map((d) => d.department));
};
