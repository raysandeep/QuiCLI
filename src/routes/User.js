const express = require("express");
const router = express.Router();
const userController = require("../controllers/User");
const auth = require('../middleware/auth');

// configure quiCLI
router.post("/v1/saveCreds", userController.saveCreds);
// use to get user api token before cloning any repo
router.get("/V1/getCreds", auth, userController.getCreds);

module.exports = router;