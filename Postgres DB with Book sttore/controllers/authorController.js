const { eq } = require("drizzle-orm");
const { authorTable, bookTable } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { db } = require("../db/index");

exports.createAuthor = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return next(new AppError("Invalid inputs", 400));
  }
  const [author] = await db
    .insert(authorTable)
    .values({ name, email })
    .returning();

  // .returning() => tells the db to send the inserted row from db so that we can view it
  // returns an array
  console.log(author);

  res.status(201).json({
    status: "success",
    data: author, // or, {book}
  });
});

exports.getAllAuthors = catchAsync(async (req, res) => {
  const authors = await db.select().from(authorTable);
  res.status(200).json({
    status: "success",
    results: authors.length,
    data: authors,
  });
});
exports.getAuthor = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Invalid id", 400));
  }

  const [author] = await db
    .select()
    .from(authorTable)
    .where((table) => eq(table.id, id));
  res.status(200).json({
    status: "success",
    data: author,
  });
});

exports.getAllBooksOfAnAuthor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Invalid id", 400));
  }
  const books = await db
    .select()
    .from(bookTable)
    .where(eq(bookTable.authorId, id));

    res.status(200).json({
      status: "success",
      results: books.length,
      data: books,
    });
});

exports.deleteAuthor = catchAsync(async (req, res, next) => {

  const { id } = req.params;
  if (!id) {
    return next(new AppError("Invalid id", 400));
  }
 await db.delete(authorTable).where(eq(authorTable.id, id))
  res.status(204).json({
    status: "success",
  });
});
