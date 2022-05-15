process.env.NODE_ENV = "test"

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let isbn;

beforeEach(async () => {
    let result = await db.query(`
    INSERT INTO
        books (isbn, amazon_url,author,language,pages,publisher,title,year)
        VALUES(
            '12341234',
            'https://www.google.com',
            'test',
            'test',
            1,
            'test',
            'test',
            2000)
            RETURNING isbn,
            amazon_url,
            author,
            language,
            pages,
            publisher,
            title,
            year
        `);

    isbn = result.rows[0].isbn
});


afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });

afterAll(async function () {
    await db.end()
  });

describe("GET /books", function () {
    test("Gets all books", async function () {
        const response = await request(app).get(`/books`);
        const books = response.body.books;
        expect(books).toHaveLength(1);
    });
  });

describe("GET /books/:isbn", function () {
    test("Gets a book", async function () {
        const response = await request(app)
            .get(`/books/${isbn}`)
        expect(response.body.book.isbn).toBe(isbn);
    });
});


describe("POST /books", function () {
    test("Creates a new book", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                isbn: '12345678',
                amazon_url: "https://www.google.com",
                author: "test",
                language: "test",
                pages: 1,
                publisher: "test",
                title: "Test",
                year: 2022
            });
        expect(response.statusCode).toBe(201);
    });

    test("Error - invalid year", async function () {
        const response = await request(app)
            .post(`/books/${isbn}`)
            .send({
                isbn: '12345678',
                amazon_url: "https://www.springboard.com",
                author: "updated",
                language: "updated",
                pages: 2,
                publisher: "updated",
                title: "updated",
                year: "2021"
            });
        expect(response.statusCode).toBe(404);
    });
});


describe("PUT /books/:isbn", function () {
    test("Updates a book", async function () {
        const response = await request(app)
            .put(`/books/${isbn}`)
            .send({
                amazon_url: "https://www.springboard.com",
                author: "updated",
                language: "updated",
                pages: 2,
                publisher: "updated",
                title: "updated",
                year: 2021
            });
        expect(response.body.book.author).toBe("updated");
    });

    test("Error - invalid year", async function () {
        const response = await request(app)
            .put(`/books/${isbn}`)
            .send({
                amazon_url: "https://www.springboard.com",
                author: "updated",
                language: "updated",
                pages: 2,
                publisher: "updated",
                title: "updated",
                year: "2021"
            });
        expect(response.statusCode).toBe(400);
    });
});


describe("DELETE /books/:isbn", function () {
    test("Deletes a book", async function () {
    const response = await request(app)
        .delete(`/books/${isbn}`)
    expect(response.body).toEqual({message: "Book deleted"});
    });
});
