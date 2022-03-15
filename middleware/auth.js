const jwt = require('jsonwebtoken')


const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({msg:'No token provided'})
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err, user) => {
      if(err) return res.status(400).json({msg: "Invalid Authentication."})

      req.user = user
      next()
    })
  } catch (err) {
      return res.status(500).json({msg: err.message})
  }
}

module.exports = auth;