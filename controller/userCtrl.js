const User = require('../model/userModel');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const { CLIENT_URL, ACTIVATION_SECRET_KEY, ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } = process.env;
const sendEmail = require('./sendMail');


const userCtrl = {
  register: async (req, res) => {
    try {
      const {name, email, password} = req.body
      const hashPassword = CryptoJS.AES.encrypt(req.body.password, ACTIVATION_SECRET_KEY).toString();
      const newUser = {
        name, email, password: hashPassword
    }
      const activationToken = createActivationToken(newUser);
      const url = `${CLIENT_URL}/user/activate/${activationToken}`;

      sendEmail(newUser.email, url, "Verify your email address")

      res.status(200).json({msg: 'Successfully registered, Plaese activate email to start.', activationToken})
    } catch (error) {
      res.status(500).json({msg: error.message})
    }
  },
  activateEmail: async (req, res) => {
    try {
      const { activation_token } = req.body;
      const user = jwt.verify(activation_token, ACTIVATION_SECRET_KEY);

      const { name, email, password } = user;
      const getEmail = await User.findOne({email});
      if(getEmail) return res.status(400).json({msg:"This email already exists."});

      const newUser = await new User({
        name, email, password
    }); 

    await newUser.save();
    res.json({msg: "Account has been activated!"})
    } catch (error) {
      res.status(500).json({msg: error.message})
    }
  },
  login: async (req, res) => {
    try {
      const { email } = req.body
      const logUser = await User.findOne({ email });
      if(!logUser) {
        return res.status(401).json({msg: 'no user with that email'})
      }
  
      const passcode = logUser.password
      var bytes  = CryptoJS.AES.decrypt(passcode, process.env.ACTIVATION_SECRET_KEY);
      var originalText = bytes.toString(CryptoJS.enc.Utf8);
  
      const { password } = req.body
      if(password !== originalText) {
        return res.status(401).json({msg: 'Incorrect password'})
      }
  
      const { _id: userId } = logUser
      const refresh_token = createRefreshToken({userId});

      res.cookie('refreshtoken', refresh_token, {
        httpOnly: true,
        path: '/api/user/refresh_token',
        maxAge: 7*24*60*60*1000 // 7 days
      })
  
      return res.json({msg: "Login success!", refresh_token})
  
    } catch (error) {
      res.status(500).json({msg: error.message})
    }
  },
  getAccessToken: async (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken
      console.log(rf_token);
      if(!rf_token) return res.status(400).json({msg: "Please login now"})

      jwt.verify(rf_token, process.env.REFRESH_SECRET_KEY, (err, user) => {
        if(err) return res.status(400).json({msg: "Please login now!"})
      
        const { userId } = user
        const access_token = createAccessToken({userId})
        res.json({access_token})
      }) 
    } catch (error) {
      res.status(500).json({msg: error.message})
    } 
  },
  forgetPassword: async (req, res) => {
    try {
      const {email} = req.body
      const user = await User.findOne({email});
      if(!user) return res.status(400).json({msg: "This email does not exist."});

      const access_token = createAccessToken({userId: user._id})
      const url = `${CLIENT_URL}/user/reset/${access_token}`

      sendEmail(email, url, "Reset your password");
      res.json({msg: "Re-send the password, please check your email."})
    } catch (error) {
      return res.status(500).json({msg: error.message})
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;
      const hashPassword = CryptoJS.AES.encrypt(req.body.password, ACTIVATION_SECRET_KEY).toString();

      const { userId } = req.user
      await User.findOneAndUpdate({userId}, {
        password: hashPassword
      });
    res.json({msg: "Password successfully changed!"})
    } catch (error) {
      return res.status(500).json({msg: error.message})
    }
  },
  getUserInfo: async (req, res) => {
    try {
      const { userId } = req.user
      const user = await User.findById(userId).select('-password')
      res.json(user)
    } catch (error) {
      return res.status(500).json({msg: error.message}) 
    }
  },
  getAllUsersInfo: async (req, res) => {
    try { 
      const users = await User.find().select('-password');
      res.json(users)
    } catch (error) {
      return res.status(500).json({msg: error.message}) 
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', {path: '/user/refresh_token'});
      return res.json({msg: "Logged out."})
    } catch (error) {
      return res.status(500).json({msg: error.message}) 
    }
  },
  updateUser: async (req, res) => {
    try {
      const {name, avatar, password} = req.body
      const { userId } = req.user
      const hashPassword = CryptoJS.AES.encrypt(req.body.password, ACTIVATION_SECRET_KEY).toString();

      await User.findOneAndUpdate({userId}, { name, avatar, password: hashPassword });
      res.json({msg: "Update Success!"})
    } catch (error) {
      return res.status(500).json({msg: error.message}) 
    }
  },
  updateUserRole: async (req, res) => {
    try {
      const {
        body: { role },
        params: { id }
      } = req

      await User.findOneAndUpdate({id}, {role})
      res.json({msg: "Update Success!"})
    } catch (error) {
      return res.status(500).json({msg: error.message}) 
    }
  },
  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id)
      res.json({msg: "Deleted Success!"})
    } catch (error) {
      return res.status(500).json({msg: error.message}) 
    }
  },
  googleLogin: async (rej, res) => {
    try {
      
    } catch (error) {
      res.status(500).json({msg: error.message})
    }
  },
  facebookLogin: async (rej, res) => {
    try {
      
    } catch (error) {
      res.status(500).json({msg: error.message})
    }
  }
};


const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_SECRET_KEY, {expiresIn: '5m'}) 
}

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_SECRET_KEY, {expiresIn: '15m'})
}

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET_KEY, {expiresIn: '7d'})
}

module.exports = userCtrl