const express = require("express");
const router = express.Router();
const repoController = require("../controllers/Repo");
const auth = require('../middleware/auth');

// clone a repo from github
router.post("/v1/cloneRepo",auth, repoController.cloneRepo);
// port verification
router.post("/V1/verifyPort",auth,  repoController.verifyPort);
// get all services
router.get("/V1/getServices",auth, repoController.getServices);
// remove a service
router.post("/V1/removeService",auth, repoController.removeService);
//  pipe docker output
router.get("/V1/pipeDocker",auth, repoController.pipeDockerOut);
// deploy
// router.get("/V1/deploy",auth, repoController.deploy);
// cicd
router.post('/V1/cicd',auth, repoController.cicd);
// cloudflare
// router.post('/V1/configureCloudflare', auth, repoController.configureCloudflare);

module.exports = router;