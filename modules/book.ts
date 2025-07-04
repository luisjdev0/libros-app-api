import mongoose from 'mongoose'
import { v4 } from 'uuid'

export class Book {
    id: string
    pageID: string
    imageURL: string
    title: string
    author: string
    genres: string
    summary: string
    epub: string
    pdf: string

    constructor(
        id: string | undefined,
        pageID: string,
        imageURL: string,
        title: string,
        author: string,
        genres: string,
        summary: string,
        epub: string,
        pdf: string
    ) {
        this.id = id ?? v4()
        this.pageID = pageID
        this.imageURL = imageURL
        this.title = title
        this.author = author
        this.genres = genres
        this.summary = summary
        this.epub = epub
        this.pdf = pdf
    }

    toObject = () => {
        return {
            id: this.id,
            pageID: this.pageID,
            imageURL: this.imageURL,
            title: this.title,
            author: this.author,
            genres: this.genres,
            summary: this.summary,
            epub: this.epub,
            pdf: this.pdf
        }
    }

    toJSON = () => JSON.stringify(this.toObject())

    static fromJSON = (json: string) => {
        const data = JSON.parse(json)
        return new Book(
            data.id,
            data.pageID,
            data.imageURL,
            data.title,
            data.author,
            data.genres,
            data.summary,
            data.epub,
            data.pdf
        )
    }

    static fromObject = (obj: any) => {
        return new Book(
            obj.id,
            obj.pageID,
            obj.imageURL,
            obj.title,
            obj.author,
            obj.genres,
            obj.summary,
            obj.epub,
            obj.pdf
        )
    }

    static bookSchema = new mongoose.Schema({
        id: { type: String, default: v4 },
        createdAt: { type: Date, default: Date.now },
        pageID: String,
        imageURL: String,
        title: String,
        author: Array<String>,
        genres: Array<String>,
        summary: String,
        epub: String,
        pdf: String
    })
}