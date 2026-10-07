const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplierController');

router.get('/trash', SupplierController.getDeleted);

router.get('/', SupplierController.getAll);

router.get('/:id', SupplierController.getById);

router.post('/', SupplierController.create);

router.put('/:id', SupplierController.update);

router.delete('/:id', SupplierController.delete);

router.post('/:id/restore', SupplierController.restore);

module.exports = router;
