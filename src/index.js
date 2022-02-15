const express = require("express");
const cors = require("cors");
//const movies = require("./data/movies.json");
//const users = require("./data/users.json");
const Database = require("better-sqlite3");
const db = new Database("./src/db/movies.db", { verbose: console.log });
const dbUsers = new Database("./src/db/users.db", { verbose: console.log });

// create and config server
const app = express();

//configar el servidor
app.use(cors());
app.use(express.json());

// init express aplication
const serverPort = 4000;
app.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

//configuración ejs plantilla
app.set("view engine", "ejs");

app.get("/movies", (req, res) => {
  console.log("petición a la ruta Get / movies");
  const queryGender = req.query.gender;
  const querySort = req.query.sort;

  if (!queryGender || !querySort) {
    const query = db.prepare(`SELECT * FROM movies ORDER BY title ${querySort}`);
    const movies = query.all();
    const response = {
      success: true,
      movies: movies,

    };
    res.json(response);

  } else {
    const query = db.prepare(`SELECT * FROM movies WHERE gender = ? ORDER BY title ${querySort}`);
    const movies = query.all(queryGender);
    const response = {
      success: true,
      movies: movies,

    };
    res.json(response);
  }
});

//petición post body params
app.post("/login", (req, res) => {
  console.log("petición a la ruta Post / login");
  const email = req.body.email;
  const pass = req.body.password;
  const query = dbUsers.prepare(
    "SELECT * FROM users WHERE password = ? and email= ?"
  );
  const usersDatabase = query.get(pass, email);
  if (usersDatabase !== undefined) {
    res.json({
      success: true,
      userId: "id_de_la_usuaria_encontrada",
    });
  } else {
    res.json({
      success: false,
      error: "Usuario no encontrado",
    });
  }
});

app.post("/signUp", (req, res) => {
  console.log("petición a la ruta Post / sign-up");
  const email = req.body.email;
  const pass = req.body.password;
  const foundUsers = dbUsers.prepare("SELECT * FROM users WHERE email = ?");
  const usersDatabase = foundUsers.get(email);

  if (usersDatabase === undefined) {
    const query = dbUsers.prepare(
      "INSERT INTO users (email,password) VALUES (?,?)"
    );
    const userInsert = query.run(email, pass);
    res.json({
      success: false,
      userId: userInsert.lastInsertRowid,
    });
  } else {
    res.json({
      success: true,
      message: "Error",
    });
  }
});

app.post("./profile", (req, res) => {
  console.log("petición a la ruta Post / profile");
  console.log(req.body);
  const email = req.body.email;
  const name = req.body.name;
  const id = req.header.id;
  const foundUsers = dbUsers.prepare(
    "UPDATE users SET email =?, name = ? WHERE id = ?"
  );
  const userUpdate = query.run(email, id, name);
  if (userUpdate.changes !== 0) {
    res.json({
      error: false,
      message: "modificado con exito",
    });
  } else {
    res.json({
      error: true,
      message: "ha ocurrido un error",
    });
  }
});

//create static server
const staticServerPathWeb = "./src/public"; // En esta carpeta ponemos los ficheros estáticos
app.use(express.static(staticServerPathWeb));

//create static server for images
const staticServerPathImages = "./src/public-movies-images"; // En esta carpeta ponemos los ficheros estáticos
app.use(express.static(staticServerPathImages));

//create static server for css
const staticServerPathStyles = "./src/public-movies-css"; // En esta carpeta ponemos los ficheros estáticos
app.use(express.static(staticServerPathStyles));

//URL params
app.get("/movie/:movieId", (req, res) => {
  const paramMovieId = req.params.movieId;
  console.log(paramMovieId);
  const query = db.prepare("SELECT * FROM movies WHERE id = ?");
  const moviesDataId = query.get(paramMovieId);
  res.render("movie", moviesDataId);
});
