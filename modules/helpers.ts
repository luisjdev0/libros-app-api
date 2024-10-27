import md5 from 'md5'
import { Request, Response, NextFunction } from "express"

const mysql = require('mysql2/promise')

export const query = async (sql: string, params?: Array<any>) => {
    try{
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        })
        const data = (await connection.execute(sql, params))[0]
        connection.end()
        return data
    }catch (e : any){
        throw `Error de DB: (${e.message}})`
    }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization == md5(process.env.API_TOKEN!)) {
        next()
    } else {
        const message = req.headers.authorization == null ? "Authorization header not valid" : "API token not valid"
        res.status(403).json({
            status: 403,
            params: req.body.params,
            result: [
                message
            ]
        })
    }
}

export const response = (status: number, params: any, result: any) => {
    return {
        status,
        params,
        result
    }
}

export const parseBook = (books: Array<any>) => {
    return books.map((book: any) => {
        const partial = book
        if (partial.genres != null){
            partial.genres = partial.genres.split('|')
        }
        return partial
    })
}