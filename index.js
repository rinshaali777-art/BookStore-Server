require('dotenv').config()
const express = require('express')
const cors = require('cors')
const router = require('./Routes/routes')
require('./config/db')
// create server using express package
const server = express()

// enable cors in server
server.use(cors())
// parse json to json content
server.use(express.json())
// use toutes in server
server.use(router)

server.use('/uploads',express.static('./uploads'))

// file from .env file
const PORT = process.env.PORT

// start server to listen client request to that port
server.listen(PORT,()=>{
    console.log('server running and waiting for client request');
    
})

//handling global errors in server using application middleware
server.use((err,req,res,next)=>{
    res.status(500).json(err.message)
}) 

// resolve api(get request to http://localhost:3000/) using express
server.get('/',(req,res)=>{

    res.status(200).send(`<h1>server running and waiting for client request</h1>`)
     
})

server.post('/',(req,res)=>{

    res.status(200).send("Post Request")

})