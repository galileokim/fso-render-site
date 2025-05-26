const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')


app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
morgan.token('data', (request, response) => JSON.stringify(request.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :data"));
  
    
let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request,response) => {
    response.send(`Phonebook has info for ${persons.length} people` + "<br>" + `${new Date}`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)

    if (person) {
        response.json(person)
    }
    else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)
 
    response.status(204).end()
})

const generateId = () => {
   return (Math.floor(Math.random() * 1000))
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.number === "" || body.name === "") {
        return response.status(400).json({
            error: 'please enter a name and a number'
        })
    }

    if (persons.some((n) => n.name === body.name)) {
        return response.status(400).json({
            error: 'name already exists'
        })
    }

    const id = generateId()
    const person = request.body
    person.id = String(id)

    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})