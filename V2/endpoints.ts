import apicache from 'apicache'
import { Request, Response } from 'express'
import { parseBook, query, response } from '../modules/helpers'
import { routes as V1, getAllTags, getAllAuthors } from '../V1/endpoints'

const legacyRoutes = V1.map(e => {
    const partial = {
        path: e.path,
        method: e.method
    }
    partial.path = `/v2${e.path}`
    return partial
})

const getNewBooks = async () => {
    return parseBook(await query('SELECT * FROM books WHERE DATE(CREATION_DATE) = CURRENT_DATE'))
}

const getBooksByAuthor = async (author: string) => {
    return parseBook(await query('SELECT * FROM books WHERE author LIKE ? ', [`%${author}%`]))
}

const getBooksByGenre = async (genre: string) => {
    return parseBook(await query('SELECT * FROM books WHERE genres LIKE ? ', [`%${genre}%`]))
}

const findAuthor = async (author: string) => {
    return (await query('SELECT DISTINCT author FROM books WHERE author LIKE ? ', [`%${author}%`])).map((e: any) => e.author)
}

const findGenre = async (genre: string) => {
    return (await getAllTags()).filter((e: any) => e.toLowerCase().indexOf(genre.toLowerCase()) != -1)
}

const getStats = async () => {
    const books = (await query('SELECT COUNT(*) AS CONTEO FROM books'))[0]['CONTEO']
    const authors = (await getAllAuthors()).length
    const genres = (await getAllTags()).length
    return {
        books, authors, genres, performance: apicache.getPerformance()
    }
}

export const routes = [
    ...legacyRoutes,
    {
        path: '/v2/today',
        method: async (req : Request, res : Response) => {
            res.json(response(200, req.params, await getNewBooks()))
        }
    },
    {
        path: '/v2/search/author/:author',
        method: async (req : Request, res : Response) => {
            res.json(response(200, req.params, await getBooksByAuthor(req.params.author)))
        }
    },
    {
        path: '/v2/search/genres/:genre',
        method: async (req : Request, res : Response) => {
            res.json(response(200, req.params, await getBooksByGenre(req.params.genre)))
        }
    },
    {
        path: '/v2/authors/:author',
        method: async (req : Request, res : Response) => {
            res.json(response(200, req.params, await findAuthor(req.params.author)))
        }
    },
    {
        path: '/v2/tags/:genre',
        method: async (req : Request, res : Response) => {
            res.json(response(200, req.params, await findGenre(req.params.genre)))
        }
    },
    {
        path: '/v2/stats',
        method: async (req : Request, res : Response) => {
            res.json(response(200, req.params, await getStats()))
        }
    }

]