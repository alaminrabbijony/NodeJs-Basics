const express = require('express');

const { createBook, getBook, getAllBooks, getBookWithAuthor, deleteBook } = require('../controllers/bookController');

const router = express.Router()

router.route('/').get(getAllBooks).post(createBook)
router.route('/:id').get(getBook).delete(deleteBook)
router.route('/:id/author').get(getBookWithAuthor)

module.exports = router