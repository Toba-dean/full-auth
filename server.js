require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const PORT = process.env.PORT || 5000;

const connectDB = require('./db/connect');
const userRouter = require('./routes/userRoute');
const uploadRouter = require('./routes/uploadRoute');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
}));


app.use('/api/user', userRouter);
app.use('/api/upload-avatar', uploadRouter);


const start = async () => { 
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server is listening at: ${PORT}`);
    }) 
  } catch (error) { 
    console.log(error.message); 
  }
}   
 
start()
