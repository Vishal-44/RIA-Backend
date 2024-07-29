const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv")
const {connectDatabase} = require("./config/database.js")


dotenv.config({path : "./config/config.env"})

const app = express()
const port = process.env.PORT || 8080

console.log(process.env.PORT)
console.log(process.env.DB_URI)
connectDatabase();


app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(cors())

app.get("/" , (req, res)=>{return res.status(200).json({sucess: true})})

app.listen(port, ()=>{console.log(`server running at http:localhost/${port}`)})

