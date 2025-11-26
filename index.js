require("dotenv").config();
const Person = require("./models/person");
const express = require("express");
const app = express();
app.use(express.static('dist'))
var morgan = require("morgan");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
morgan.token("data", (request, response) => JSON.stringify(request.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data"),
);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", async (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", async (request, response) => {
  const persons = await Person.find({});
  response.send(
    `Phonebook has info for ${persons.length} people` +
      "<br>" +
      `${new Date()}`,
  );
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", async (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
  //    const persons = await Person.find({})
  //    const id = request.params.id
  //    persons = persons.filter(p => p.id !== id)

  //    response.status(204).end()
});

app.post("/api/persons", async (request, response) => {
  const body = request.body;

  if (body.number === "" || body.name === "") {
    return response.status(400).json({
      error: "please enter a name and a number",
    });
  }

  const persons = await Person.find({});

  if (persons.some((n) => n.name === body.name)) {
    return response.status(400).json({
      error: "name already exists",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    important: body.important || false,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  }).catch(error => next(error))
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === 'Validation Error') {
        return response.status(400).json({ error: error.message })
    }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

