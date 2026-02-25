const { sql, eq } = require("drizzle-orm");
const { db } = require("../db/index");
const { bookTable, authorTable } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.createBook = catchAsync(async (req, res, next) => {
  const { title, description, authorId } = req.body;
  if (!title || !description || !authorId) {
    return next(new AppError("Invalid inputs", 400));
  }

  const [book] = await db
    .insert(bookTable)
    .values({ title, description, authorId })
    .returning({
      id: bookTable.id,
    });

  // .returning() => tells the db to send the insrted row from db so that we can view it
  // returns an array

  res.status(201).json({
    status: "success",
    data: book, // or, {book}
  });
});

exports.getAllBooks = catchAsync(async (req, res) => {
  const search = req.query.search;

  if (search) {
    const books = await db
      .select()
      .from(bookTable)
      .where(
        sql`to_tsvector('english', ${bookTable.title}) @@ plainto_tsquery('english', ${search})`,
      );

    return res.status(200).json({
      status: "success",
      results: books.length,
      data: books,
    });
  }

  const books = await db.select().from(bookTable);

  res.status(200).json({
    status: "success",
    results: books.length,
    data: books,
  });
});
exports.getBook = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Invalid id", 400));
  }

  const [book] = await db.select().from(bookTable).where(eq(bookTable.id, id));

  res.status(200).json({
    status: "success",
    data: book,
  });
});

exports.getBookWithAuthor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Invalid id", 400));
  }
  const [book] = await db.select()
  .from(bookTable)
  .where(eq(bookTable.id, id))
  .leftJoin(authorTable, eq(bookTable.authorId, authorTable.id))

  res.status(200).json({
    status: "success",
    data: book,
  });
});

exports.updateBook = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
  });
});

exports.deleteBook = catchAsync(async (req, res, next) => {

  const { id } = req.params;
  if (!id) {
    return next(new AppError("Invalid id", 400));
  }
 await db.delete(bookTable).where(eq(bookTable.id, id))
  res.status(204).json({
    status: "success",
  });
});
