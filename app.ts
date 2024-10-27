import express from 'express'
import apicache from 'apicache'
import dotenv from 'dotenv'
dotenv.config()

import { Request, Response } from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import { auth } from './modules/helpers'

import { routes as V1 } from './V1/endpoints'
import { routes as V2 } from './V2/endpoints'


const cors = require('cors')

const app = express()
const server = createServer(app)
const cache = apicache.middleware

app.use(cors({ methods: ['GET'] }))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cache('3 hours'))
app.use(auth)
const routes = [...V1, ...V2]

routes.forEach(e => {
    app.get(e.path, (req: Request, res: Response) => e.method(req, res))
})

app.all('*', (req: Request, res: Response) => {
    res.status(404).json({
        status: 404,
        message: 'Not found'
    })
})

server.listen(process.env.PORT, () => {
    console.log(`Servidor levantado en http://${process.env.HOST}:${process.env.PORT}`)
})