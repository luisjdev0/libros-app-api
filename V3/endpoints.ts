import mongoose from 'mongoose'
import type { Request, Response } from 'express'
import { parseBookV3, response } from '../modules/helpers'
import { Book } from '../modules/book'

const createConnection = async () => {
    const { MONGODB_CONNECTION_STRING } = process.env
    console.log(MONGODB_CONNECTION_STRING)
    const db = await mongoose.connect(MONGODB_CONNECTION_STRING!, {
        dbName: 'books-spanish',
    })
    return db.model('Book', Book.bookSchema)
}

const getAllTags = async () => {
    const db = await createConnection()
    return await db.distinct('genres').exec()
}

const getAllAuthors = async () => {
    const db = await createConnection()
    return await db.distinct('author').exec()
}

const getBooksByPage = async (page: number | string) => {
    const db = await createConnection()
    return parseBookV3(await db.find({ pageID: page }).exec())
}

const getBookByID = async (id: string) => {
    const db = await createConnection()
    const book = await db.findOne({ id }).exec()
    return parseBookV3(book)
}

const findBooks = async (params: string) => {
    const db = await createConnection()
    const parsedParams = params.replace('+', ' ')
    return parseBookV3(
        await db.find({
            $or: [
                { title: { $regex: parsedParams, $options: 'i' } },
                { author: { $regex: parsedParams, $options: 'i' } },
                { genres: { $regex: parsedParams, $options: 'i' } },
                { summary: { $regex: parsedParams, $options: 'i' } },
            ]
        })
    )
}

const getNewBooks = async () => {
    const db = await createConnection()
    const data = await db.find({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)), $lt: new Date(new Date().setHours(23, 59, 59, 999)) }
    })
    return parseBookV3(data)
}

const getBooksByAuthor = async (author: string) => {
    const db = await createConnection()
    return parseBookV3(await db.find({
        author: { $elemMatch: { $regex: author } }
    }))
}

const getBooksByGenre = async (genre: string) => {
    const db = await createConnection()
    return parseBookV3(await db.find({
        genres: { $elemMatch: { $regex: genre } }
    }))
}

const findAuthor = async (author: string) => {
    return (await getAllAuthors()).filter((e: any) => e.toLowerCase().indexOf(author.toLowerCase()) != -1)
}

const findGenre = async (genre: string) => {
    return (await getAllTags()).filter((e: any) => e.toLowerCase().indexOf(genre.toLowerCase()) != -1)
}

const getStats = async () => {
    const db = await createConnection()
    const books = (await db.find()).length
    const authors = (await getAllAuthors()).length
    const genres = (await getAllTags()).length
    return {
        books, authors, genres
    }
}

export const routes = [
    {
        path: '/v3/',
        method: async (req: Request, res: Response) => {
            res.json(response(200, { page: 1 }, await getBooksByPage(1)))
        },
    },
    {
        path: '/v3/page/:page',
        method: async (req: Request, res: Response) => {
            res.json(response(200, req.params, await getBooksByPage(req.params.page!)))
        }
    },
    {
        path: '/v3/id/:id',
        method: async (req: Request, res: Response) => {
            res.json(response(200, req.params, await getBookByID(req.params.id!)))
        }
    },
    {
        path: '/v3/tags/',
        method: async (req: Request, res: Response) => {
            res.json(response(200, req.params, await getAllTags()))
        }
    },
    {
        path: '/v3/authors/',
        method: async (req: Request, res: Response) => {
            res.json(response(200, req.params, await getAllAuthors()))
        }
    },
    {
        path: '/v3/search/:query',
        method: async (req: Request, res: Response) => {
            res.json(response(
                200,
                { search: req.params.query!.replace('+', ' ') },
                await findBooks(req.params.query!)
            ))
        }
    },
    {
        path: '/v3/today',
        method: async (req: Request, res: Response) => {
            res.json(response(200, req.params, await getNewBooks()))
        }
    },
    {
        path: '/v3/search/author/:author',
        method: async (req: Request, res: Response) => {
            res.json(response(200, req.params, await getBooksByAuthor(req.params.author!)))
        }
    },
    {
        path: '/v3/search/genres/:genre',
        method: async (req: Request, res: Response) => {
            res.json(response(200, req.params, await getBooksByGenre(req.params.genre!)))
        }
    },
    {
        path: '/v3/authors/:author',
        method: async (req: Request, res: Response) => {
            res.json(response(200, req.params, await findAuthor(req.params.author!)))
        }
    },
    {
        path: '/v3/tags/:genre',
        method: async (req: Request, res: Response) => {
            res.json(response(200, req.params, await findGenre(req.params.genre!)))
        }
    },
    {
        path: '/v3/stats',
        method: async (req: Request, res: Response) => {
            res.json(response(200, req.params, await getStats()))
        }
    }

]