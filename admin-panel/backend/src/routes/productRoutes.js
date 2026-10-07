const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

router.get('/trash', ProductController.getDeleted);

router.get('/', ProductController.getAll);

router.get('/:id', ProductController.getById);

router.post('/', ProductController.create);

router.put('/:id', ProductController.update);

router.delete('/:id', ProductController.delete);

router.post('/:id/restore', ProductController.restore);

module.exports = router;
