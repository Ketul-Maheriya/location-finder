const mongoose = require("mongoose")

const connectDB = async () =>{
    
    try{

        await mongoose.connect(process.env.MONGO_URI)
        console.log("connected")
    }catch(e){
        console.log(e.message)
    }
}

module.exports = connectDB