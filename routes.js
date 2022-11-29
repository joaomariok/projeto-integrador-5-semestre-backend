const { Router } = require("express");
const md5 = require("md5");
const { sign } = require("jsonwebtoken");

const { ensureAuthenticated } = require("./middleware/ensureAuthenticated");
const { isDatabaseConnected, createDummyData } = require('./database/connection');
const env = require("./database/env");

// Import models
const database = require('./database');
const Paciente = require('./models/paciente');
const Atendimento = require('./models/atendimento');
const Prontuario = require('./models/prontuario');
const Usuario = require("./models/usuario");

const router = Router();

// ==== Database routes ====

router.get("/tables", async (req, res) => {
  return res.status(403).json();

  if (!isDatabaseConnected()) return res.status(502).json();

  console.log("GET /tables");

  const sqlQuery = "SHOW TABLES";
  const [result, temp] = await database.query(sqlQuery);

  res.json(result);
});

router.get("/is-database-connected", async (req, res) => {
  console.log("GET /is-database-connected");
  console.log("DEBUG MODE: " + env.DEBUG);

  res.json(await isDatabaseConnected());
});

router.post("/create-dummy-data", ensureAuthenticated, async (req, res) => {
  if (!isDatabaseConnected()) return res.status(502).json();

  console.log("POST /create-dummy-data");

  await createDummyData();

  return res.status(200).json();
});

router.post("/new-record", ensureAuthenticated, async (req, res) => {
  if (!isDatabaseConnected()) return res.status(502).json();

  console.log("POST /new-record");

  const {
    multiplicidade,
    entrada,
    saida,
    idade,
    genero,
    covid,
    gravidade,
    sintoma,
    comorbidade,
    obito,
    unidade
  } = req.body;

  console.log(req.body);

  const paciente = await Paciente.create({
    idade: idade,
    genero: genero,
    multiplicidade: multiplicidade
  });

  const prontuario = await Prontuario.create({
    paciente_id: paciente.id,
    sintomas: sintoma,
    veioAObito: obito,
    transferencia: unidade,
    gravidade: gravidade,
    vacinadoCovid: covid,
    possuiComorbidades: comorbidade
  });

  const atendimento = await Atendimento.create({
    horaEntrada: entrada,
    horaSaida: saida,
    paciente_id: paciente.id,
    prontuario_id: prontuario.id
  });

  res.status(200).json();
});

router.get("/permanence", async (req, res) => {
  if (!isDatabaseConnected()) return res.status(502).json();

  console.log("GET /permanence");

  // const query = "SELECT TIMESTAMPDIFF(MINUTE, horaEntrada, horaSaida) AS permanencia FROM atendimentos AS atendimento"
  // const [ data, temp ] = await database.query(query);

  const dataEntrada = await Atendimento.findAll({
    attributes: [
      [
        database.col('horaEntrada'),
        'permanencia'
      ]
    ]
  });

  const dataSaida = await Atendimento.findAll({
    attributes: [
      [
        database.col('horaSaida'),
        'permanencia'
      ]
    ]
  });

  const dataEntradaMs = dataEntrada.map(d => Date.parse(d.dataValues.permanencia));
  const dataSaidaMs = dataSaida.map(d => Date.parse(d.dataValues.permanencia));
  const timeDiff = []

  for (let i = 0; i < dataEntradaMs.length; i++) {
    timeDiff.push({ permanencia: (dataSaidaMs[i] - dataEntradaMs[i]) / (1000 * 60) });
  }

  console.log(timeDiff);
  res.status(200).json(timeDiff);

  // const data = await Atendimento.findAll({
  //   attributes: [
  //     [
  //       database.fn(
  //         'DATEDIFF',
  //         database.literal('MINUTE'),
  //         database.col('horaEntrada'),
  //         database.col('horaSaida'),
  //       ),
  //       'permanencia'
  //     ]
  //   ]
  // });

  // res.status(200).json(data);
});

router.get("/severity-and-permanence", async (req, res) => {
  if (!isDatabaseConnected()) return res.status(502).json();

  console.log("GET /severity-and-permanence");

  // == QUERY: ==
  // SELECT TIMESTAMPDIFF(MINUTE, atendimentos.horaEntrada, atendimentos.horaSaida) AS permanencia,
  //        prontuarios.gravidade AS gravidade
  // FROM atendimentos
  // INNER JOIN prontuarios
  // ON atendimentos.prontuario_id = prontuarios.id

  // const query = "SELECT TIMESTAMPDIFF(MINUTE, atendimentos.horaEntrada, atendimentos.horaSaida) AS permanencia, prontuarios.gravidade AS gravidade FROM atendimentos INNER JOIN prontuarios ON atendimentos.prontuario_id = prontuarios.id"
  const query = "SELECT * FROM atendimentos INNER JOIN prontuarios ON atendimentos.prontuario_id = prontuarios.id"
  const [data, temp] = await database.query(query);

  const dataEntradaMs = data.map(d => Date.parse(d.horaEntrada));
  const dataSaidaMs = data.map(d => Date.parse(d.horaSaida));
  const dataGravidade = data.map(d => d.gravidade);
  const returnData = []

  for (let i = 0; i < dataEntradaMs.length; i++) {
    returnData.push({
      permanencia: (dataSaidaMs[i] - dataEntradaMs[i]) / (1000 * 60),
      gravidade: dataGravidade[i]
    });
  }
  console.log(returnData);

  res.status(200).json(returnData);
});

// ==== Login routes ====

router.post("/signup", async (req, res) => {
  console.log("POST /signup");

  const { user, password, rootPassword } = req.body;

  // Check empty fields
  if (!user || !password || !rootPassword) {
    return res.status(400).json();
  }

  // Check root password
  if (md5(rootPassword) != md5(env.ROOT_PASSWORD)) return res.status(401).json();

  // Check in database
  const userInDatabase = await Usuario.findOne({
    where: {
      username: user,
    }
  });

  // Check if user exists in database
  if (Boolean(userInDatabase)) return res.status(401).json()

  // Create new user
  const newUser = await Usuario.create({
    username: user,
    password: md5(password),
  });

  // Response with token
  const token = sign(
    {
      id: newUser.id,
      user: newUser.username,
    },
    env.JWT_SECRET,
    {
      subject: newUser.username,
      expiresIn: "1d"
    }
  );

  const response = {
    token: token,
    user: user,
  };

  res.status(200).json(response);
});

router.post("/login", async (req, res) => {
  console.log("POST /login");

  const { user, password } = req.body;

  // Check empty fields
  if (!user || !password) return res.status(400).json();

  // Check in database
  const userInDatabase = await Usuario.findOne({
    where: {
      username: user,
    }
  });

  // Check if user exists in database
  if (!Boolean(userInDatabase)) return res.status(404).json();

  // Check if passwords match
  if (md5(password) != userInDatabase.password) return res.status(401).json();

  // Response with token
  const token = sign(
    {
      id: userInDatabase.id,
      user: userInDatabase.username,
    },
    env.JWT_SECRET,
    {
      subject: userInDatabase.username,
      expiresIn: userInDatabase != env.ROOT_USERNAME ? "1d" : "10m",
    }
  );

  const response = {
    token: token,
    user: user,
  }

  res.status(200).json(response);
});

module.exports = { router }