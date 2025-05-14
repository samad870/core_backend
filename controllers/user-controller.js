const User = require("../models/user-model");

exports.signIn = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res
        .status(400)
        .json({ message: "userName email and password are required" });
    }
    const userExist = await find(email);
    if(userExist){
        return res
        .status(400)
        .json({ message: "You Already Have An Account" });
    }
    res.status(200).json(req.body);
  } catch (error) {
    res.status(400).json({ message: "error in signIn", error: error.message });
  }
};

// exports.signin = async (req, res) => {

//         const { username, email, password } = req.body;
//         console.log(req.body)

//     catch(error){
//     res.status(400).json({ message: "error in signIn", error: error.message });
//     }
// };
