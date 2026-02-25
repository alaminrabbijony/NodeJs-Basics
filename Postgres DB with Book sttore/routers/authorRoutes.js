const express = require('express');
const { getAllAuthors, getAuthor, createAuthor, getAllBooksOfAnAuthor, deleteAuthor } = require('../controllers/authorController');


const router = express.Router()

router.route('/').get(getAllAuthors).post(createAuthor)
router.route('/:id').get(getAuthor).delete(deleteAuthor)
router.route('/:id/books').get(getAllBooksOfAnAuthor)



module.exports = router