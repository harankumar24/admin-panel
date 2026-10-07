const ProductModel = require('../models/productModel');
const SupplierModel = require('../models/supplierModel');

class ProductController {
  
  static async getAll(req, res) {
    try {
      const { search, category, supplierId, status } = req.query;
      const products = await ProductModel.getAll({ search, category, supplierId, status });

      return res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching products.',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const productId = parseInt(id, 10);

      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID.'
        });
      }

      const product = await ProductModel.getById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found or has been deleted.`
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching product.',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { supplier_id, name, sku, category, price, quantity, description, status } = req.body;

      const errors = [];
      if (!supplier_id) {
        errors.push('A valid Supplier is required.');
      }
      if (!name || typeof name !== 'string' || !name.trim()) {
        errors.push('Product Name is required.');
      }
      if (!sku || typeof sku !== 'string' || !sku.trim()) {
        errors.push('Product SKU / Code is required.');
      }
      if (!category || typeof category !== 'string' || !category.trim()) {
        errors.push('Product Category is required.');
      }
      if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        errors.push('Price must be a non-negative number.');
      }
      if (quantity !== undefined && (isNaN(parseInt(quantity, 10)) || parseInt(quantity, 10) < 0)) {
        errors.push('Quantity must be an integer >= 0.');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors
        });
      }

      const supplier = await SupplierModel.getById(parseInt(supplier_id, 10));
      if (!supplier) {
        return res.status(400).json({
          success: false,
          message: 'The selected supplier does not exist or has been soft-deleted.'
        });
      }

      const skuExists = await ProductModel.skuExists(sku.trim());
      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: `SKU "${sku.trim()}" is already assigned to another active product.`
        });
      }

      const parsedQty = parseInt(quantity, 10) || 0;
      let calculatedStatus = status || 'In Stock';
      if (!status) {
        if (parsedQty === 0) calculatedStatus = 'Out of Stock';
        else if (parsedQty <= 5) calculatedStatus = 'Low Stock';
      }

      const insertId = await ProductModel.create({
        supplier_id: parseInt(supplier_id, 10),
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category: category.trim(),
        price: parseFloat(price),
        quantity: parsedQty,
        description: description ? description.trim() : null,
        status: calculatedStatus
      });

      const newProduct = await ProductModel.getById(insertId);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: newProduct
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create product.',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const productId = parseInt(id, 10);

      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID.'
        });
      }

      const existing = await ProductModel.getById(productId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found.`
        });
      }

      const { supplier_id, name, sku, category, price, quantity, description, status } = req.body;

      const errors = [];
      if (!supplier_id) errors.push('Supplier is required.');
      if (!name || !name.trim()) errors.push('Product Name is required.');
      if (!sku || !sku.trim()) errors.push('Product SKU is required.');
      if (!category || !category.trim()) errors.push('Category is required.');
      if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        errors.push('Price must be a non-negative number.');
      }
      if (quantity === undefined || isNaN(parseInt(quantity, 10)) || parseInt(quantity, 10) < 0) {
        errors.push('Quantity must be an integer >= 0.');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors
        });
      }

      const supplier = await SupplierModel.getById(parseInt(supplier_id, 10));
      if (!supplier) {
        return res.status(400).json({
          success: false,
          message: 'The selected supplier does not exist or is inactive.'
        });
      }

      const skuExists = await ProductModel.skuExists(sku.trim(), productId);
      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: `SKU "${sku.trim()}" is already assigned to another product.`
        });
      }

      const parsedQty = parseInt(quantity, 10);
      let calculatedStatus = status;
      if (!status) {
        if (parsedQty === 0) calculatedStatus = 'Out of Stock';
        else if (parsedQty <= 5) calculatedStatus = 'Low Stock';
        else calculatedStatus = 'In Stock';
      }

      await ProductModel.update(productId, {
        supplier_id: parseInt(supplier_id, 10),
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category: category.trim(),
        price: parseFloat(price),
        quantity: parsedQty,
        description: description ? description.trim() : null,
        status: calculatedStatus
      });

      const updatedProduct = await ProductModel.getById(productId);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update product.',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const productId = parseInt(id, 10);

      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID.'
        });
      }

      const product = await ProductModel.getById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found or already deleted.`
        });
      }

      await ProductModel.softDelete(productId);

      return res.status(200).json({
        success: true,
        message: `Product "${product.name}" (SKU: ${product.sku}) has been soft-deleted successfully.`
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product.',
        error: error.message
      });
    }
  }

  static async getDeleted(req, res) {
    try {
      const deletedProducts = await ProductModel.getDeleted();
      return res.status(200).json({
        success: true,
        count: deletedProducts.length,
        data: deletedProducts
      });
    } catch (error) {
      console.error('Error fetching trash products:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve deleted products.',
        error: error.message
      });
    }
  }

  static async restore(req, res) {
    try {
      const { id } = req.params;
      const productId = parseInt(id, 10);

      const restored = await ProductModel.restore(productId);
      if (!restored) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in trash or already active.'
        });
      }

      const product = await ProductModel.getById(productId);

      return res.status(200).json({
        success: true,
        message: 'Product restored successfully.',
        data: product
      });
    } catch (error) {
      console.error('Error restoring product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to restore product.',
        error: error.message
      });
    }
  }
}

module.exports = ProductController;
