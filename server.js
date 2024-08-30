import express from 'express'
import dotenv from 'dotenv'
import connectToDB from './db/db.js'


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

//middlerware
app.use(express.json())
app.use(cookieParser())

//Route middlewares
import authRoutes from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'
app.use("/api/auth", authRoutes)

app.get("/", (req, res)=>{
    res.send("Hello")
})

app.listen(PORT, ()=>{
    console.log(`App is running on port ${PORT}`)
    connectToDB()
})