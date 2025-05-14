const express = require("express");
const {signIn} = require("./controllers/user-controller")
const router = express.Router();




router.post("/api/signin",signIn);


module.exports = router;
