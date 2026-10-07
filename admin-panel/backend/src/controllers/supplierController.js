const SupplierModel = require('../models/supplierModel');
const ProductModel = require('../models/productModel');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class SupplierController {
  
  static async getAll(req, res) {
    try {
      const { search, status } = req.query;
      const suppliers = await SupplierModel.getAll({ search, status });
      return res.status(200).json({
        success: true,
        count: suppliers.length,
        data: suppliers
      });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching suppliers.',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const supplierId = parseInt(id, 10);

      if (isNaN(supplierId) || supplierId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid supplier ID provided.'
        });
      }

      const supplier = await SupplierModel.getById(supplierId);

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: `Supplier with ID ${supplierId} was not found or has been deleted.`
        });
      }

      return res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      console.error('Error fetching supplier by ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving supplier.',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { name, contact_person, email, phone, address, city, country, status } = req.body;

      const errors = [];
      if (!name || typeof name !== 'string' || !name.trim()) {
        errors.push('Supplier Name is required.');
      }
      if (!contact_person || typeof contact_person !== 'string' || !contact_person.trim()) {
        errors.push('Contact Person is required.');
      }
      if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        errors.push('A valid email address is required.');
      }
      if (!phone || typeof phone !== 'string' || !phone.trim()) {
        errors.push('Phone number is required.');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors
        });
      }

      const insertId = await SupplierModel.create({
        name: name.trim(),
        contact_person: contact_person.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address ? address.trim() : null,
        city: city ? city.trim() : null,
        country: country ? country.trim() : 'India',
        status: status === 'Inactive' ? 'Inactive' : 'Active'
      });

      const newSupplier = await SupplierModel.getById(insertId);

      return res.status(201).json({
        success: true,
        message: 'Supplier created successfully.',
        data: newSupplier
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create supplier.',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const supplierId = parseInt(id, 10);

      if (isNaN(supplierId) || supplierId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid supplier ID.'
        });
      }

      const existing = await SupplierModel.getById(supplierId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Supplier with ID ${supplierId} not found.`
        });
      }

      const { name, contact_person, email, phone, address, city, country, status } = req.body;

      const errors = [];
      if (!name || !name.trim()) errors.push('Supplier Name is required.');
      if (!contact_person || !contact_person.trim()) errors.push('Contact Person is required.');
      if (!email || !EMAIL_REGEX.test(email.trim())) errors.push('A valid email address is required.');
      if (!phone || !phone.trim()) errors.push('Phone number is required.');

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors
        });
      }

      await SupplierModel.update(supplierId, {
        name: name.trim(),
        contact_person: contact_person.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address ? address.trim() : null,
        city: city ? city.trim() : null,
        country: country ? country.trim() : 'India',
        status: status === 'Inactive' ? 'Inactive' : 'Active'
      });

      const updatedSupplier = await SupplierModel.getById(supplierId);

      return res.status(200).json({
        success: true,
        message: 'Supplier updated successfully.',
        data: updatedSupplier
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update supplier.',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const supplierId = parseInt(id, 10);

      if (isNaN(supplierId) || supplierId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid supplier ID.'
        });
      }

      const supplier = await SupplierModel.getById(supplierId);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: `Supplier with ID ${supplierId} not found or already deleted.`
        });
      }

      const activeProductCount = await SupplierModel.getActiveProductCount(supplierId);

      await SupplierModel.softDelete(supplierId);

      return res.status(200).json({
        success: true,
        message: `Supplier "${supplier.name}" has been soft-deleted successfully.`,
        activeProductCount,
        note: activeProductCount > 0 
          ? `Supplier had ${activeProductCount} linked product(s). Data integrity is preserved.`
          : 'Supplier had no active products.'
      });
    } catch (error) {
      console.error('Error soft-deleting supplier:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete supplier.',
        error: error.message
      });
    }
  }

  static async getDeleted(req, res) {
    try {
      const deletedSuppliers = await SupplierModel.getDeleted();
      return res.status(200).json({
        success: true,
        count: deletedSuppliers.length,
        data: deletedSuppliers
      });
    } catch (error) {
      console.error('Error fetching deleted suppliers:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch trash suppliers.',
        error: error.message
      });
    }
  }

  static async restore(req, res) {
    try {
      const { id } = req.params;
      const supplierId = parseInt(id, 10);

      const restored = await SupplierModel.restore(supplierId);
      if (!restored) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found in trash or already active.'
        });
      }

      const supplier = await SupplierModel.getById(supplierId);

      return res.status(200).json({
        success: true,
        message: 'Supplier restored successfully.',
        data: supplier
      });
    } catch (error) {
      console.error('Error restoring supplier:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to restore supplier.',
        error: error.message
      });
    }
  }
}

module.exports = SupplierController;
