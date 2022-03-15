const User = require('../model/userModel');


const authAdmin = async (req, res, next) => {
  try {
    const { userId } = req.user
    const user = await User.findOne({userId})

    if(user.role !== 1) {
      return res.status(500).json({msg: "Admin resources access denied."})
    }
    next();
  } catch (error) {
    return res.status(500).json({msg: error.message})
  }
}


module.exports = authAdmin