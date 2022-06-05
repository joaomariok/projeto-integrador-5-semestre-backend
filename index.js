// Imports
// const express = require("express");
// const cors = require("cors");
// const mysql = require('mysql')
const { router } = require('./routes')
const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const app = express()

app.use(cors())

const PORT = process.env.PORT || 5000

app.use(router)

var pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB
})

pool.getConnection((err, connection) => {})

app.listen(PORT, () => {
  console.log(`Projeto integrador funcionando e ouvindo na porta ${PORT}`)
})

app.get('/', () => {
  return { res: 'status 200 ' }
})
