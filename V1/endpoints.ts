import type { Request, Response } from "express"
import { query, response, parseBook } from '../modules/helpers'

const getBooksByPage = async (page: number | string) => {
    return parseBook(await query('SELECT * FROM books WHERE pageID = ? ORDER BY creation_date DESC', [page]))
}

const getBookByID = async (id: number | string) => {
    return parseBook(await query('SELECT * FROM books WHERE id = ?', [id]))
}

export const getAllTags = async () => {
    return [... new Set((await query('SELECT DISTINCT genres FROM books'))
        .map((book: any) => book.genres.split('|')).flat())].sort()
}

export const getAllAuthors = async () => {
    return [... new Set((await query('SELECT DISTINCT author FROM books'))
        .map((book: any) => book.author))].sort()
}

const findBooks = async (params: string) => {
    const parsedParams = params.replace('+', ' ')
    const book = await query(
        'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR genres LIKE ?', [
        `%${parsedParams}%`,
        `%${parsedParams}%`,
        `%${parsedParams}%`
    ])

    return parseBook(book)
}

export const routes = [
    {
        path: '/',
        method: async (req : Request, res : Response) => {
            res.json(response(200, { page: 1 }, await getBooksByPage(1)))
        },
    },
    {
        path: '/page/:page',
        method: async (req : Request, res : Response) => {
            res.json(response(200, req.params, await getBooksByPage(req.params.page!)))
        }
    },
    {
        path: '/id/:id',
        method: async (req : Request, res : Response) => {
            res.json(response(200, req.params, await getBookByID(req.params.id!)))
        }
    },
    {
        path: '/tags/',
        method: async (req : Request, res : Response) => {
            res.json(response(200, req.params, await getAllTags()))
        }
    },
    {
        path: '/authors/',
        method: async (req : Request, res : Response) => {
            res.json(response(200, req.params, await getAllAuthors()))
        }
    },
    {
        path: '/search/:query',
        method: async (req : Request, res : Response) => {
            res.json(response(
                200,
                {search: req.params.query!.replace('+', ' ')},
                await findBooks(req.params.query!)
            ))
        }
    }
]