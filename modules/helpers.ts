import md5 from 'md5'
import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'

const mysql = require('mysql2/promise')

export const query = async (sql: string, params?: Array<any>) => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        })
        const data = (await connection.execute(sql, params))[0]
        connection.end()
        return data
    } catch (e: any) {
        throw `Database connection error`
    }
}

export const AuthAPIMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const { JWT_SECRET_KEY, API_ID } = process.env

    if (!JWT_SECRET_KEY || !API_ID) {
        throw 'Undefined environment variables JWT_SECRET_KEY or API_ID'
    }

    //Legacy authorization method
    if (req.headers.authorization == md5(process.env.API_TOKEN!)) {
        next()
        return
    }

    //New authorization method using JWT
    const token = req.headers.authorization?.replace('Bearer', '').trim() ?? ''
    jwt.verify(token, JWT_SECRET_KEY as string, (error: any, decoded: any) => {
        if (error || (decoded != null && (decoded as any)['api_id'] != API_ID)) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid token'
            })
        }
        next()
    })

    return
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
        if (partial.genres != null) {
            partial.genres = partial.genres.split('|')
        }
        return partial
    })
}