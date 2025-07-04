import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

import type { Request, Response } from 'express'
import { createServer } from 'http'
import { AuthAPIMiddleware } from './modules/helpers'

import { routes as V1 } from './V1/endpoints'
import { routes as V2 } from './V2/endpoints'
import { routes as V3 } from './V3/endpoints'

const cors = require('cors')

const app = express()
const server = createServer(app)

app.use(cors({ methods: ['GET'] }))
app.use(express.json())
app.use(AuthAPIMiddleware)

const routes = [...V1, ...V2, ...V3]

routes.forEach(e => {
    app.get(e.path, async (req: Request, res: Response) => {
        try {
            await e.method(req, res)
        } catch (e) {
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: e
            })
        }
    })
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