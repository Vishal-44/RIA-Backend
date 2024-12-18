const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const servicesRoutes = require('./Routes/servicesRoutes.js')
const app = express()

// DOTENV Config
dotenv.config({path : './config/.env'})

// CORS Config
const corsOption = {
    origin : process.env.CORS_URL || 'http://localhost:5173',
    credentials: true,
};

// MiddleWare
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors(corsOption))

// Routes
app.use('/r', servicesRoutes)

// Default Routes
app.get('/', (req, res) => {return res.status(200).json({success : true, message : 'OK'})})

const port = process.env.PORT 
app.listen(port, ()=>{console.log(`listening to port = ${port}`)})



