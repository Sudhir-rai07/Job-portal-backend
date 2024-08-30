import mongoose from "mongoose";

const connectToDB = async () =>{
    try {
        const db_connection =await mongoose.connect(process.env.MONGO_URI+"JobPortal")
    console.log("Database Connected")
    } catch (error) {
        console.log("DB connection error ", error)
        process.exit(1)
    }
}

export default connectToDB