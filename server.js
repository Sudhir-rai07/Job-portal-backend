import express from 'express'
import dotenv from 'dotenv'
import { v2 as Cloudinary } from 'cloudinary'
import cookieParser from 'cookie-parser'
import connectToDB from './db/db.js'


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Cloudinary Config
Cloudinary.config({
    cloud_name: process.env.COLUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

//middlerware
app.use(express.json({limit: "5mb"}))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

//Route middlewares
import authRoutes from './routes/auth.routes.js'
import jobRoutes from './routes/job.routes.js'
app.use("/api/auth", authRoutes)
app.use("/api/job", jobRoutes)

app.get("/", (req, res)=>{
    res.send("Hello")
})

app.get("/*", (req, res)=>{
    res.send("No no, not a right url")
})

app.listen(PORT, ()=>{
    console.log(`App is running on port ${PORT}`)
    connectToDB()
})