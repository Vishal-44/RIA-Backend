const mongoose = require("mongoose")

exports.connectDatabase = async ()=>{
    try{
        await mongoose.connect(process.env.DB_URI)
        console.log("Database connected successfully.")
    }
    catch(e) {
        console.log("connection failed due to:" + e);
    }
}