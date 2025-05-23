const express = require("express");
const { register,login ,userDetails,followUser} = require("./controllers/user-controller");


const router = express.Router();

router.post("/api/register", register);
router.post("/api/login", login);
router.get("/api/user/:id", userDetails);
router.get("/api/demo/:id", followUser);



module.exports = router;
