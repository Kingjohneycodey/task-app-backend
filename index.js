const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');  
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const path = require('path'); 


const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const adminRoutes = require('./routes/admin.route');


dotenv.config(); // Load environment variables from .env file

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected to database")
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  })

  app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Qollective Api',
      version: '1.0.0',
      description: 'Qollective website',
    },
  },
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Welcome to the qollective api, check the docs 👉👉👉 !');
});

// Routes
app.use('/api', authRoutes); 
app.use('/api/user', userRoutes);
app.use('/api', adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
