const router = require("express").Router();

const controller = require("../controllers/articleController");

const auth = require("../middleware/authMiddleware");

const role = require("../middleware/roleMiddleware");

// get all articles
router.get("/", auth, controller.getAll);
// get single article
router.get("/:slug", controller.getById);
// create
router.post("/", auth, role(["EDITOR", "ADMIN"]), controller.create);
// update
router.put("/:id", auth, role(["EDITOR", "ADMIN"]), controller.update);
// publish
router.put("/publish/:id", auth, role(["ADMIN"]), controller.publish);
// delete
router.delete("/:id", auth, role(["ADMIN"]), controller.delete);

module.exports = router;
