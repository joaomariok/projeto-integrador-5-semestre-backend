// Imports
const { router } = require('./routes')
const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(router)
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

var pool = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
  port: PORT
})


app.listen(PORT, () => {
  console.log(`Projeto integrador funcionando e ouvindo na porta ${PORT}`)
})