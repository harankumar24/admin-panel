const { pool } = require('../config/db');

class ProductModel {
  
  static async getAll({ search = '', category = '', supplierId = '', status = '' } = {}) {
    let query = `
      SELECT 
        p.id,
        p.supplier_id,
        p.name,
        p.sku,
        p.category,
        p.price,
        p.quantity,
        p.description,
        p.status,
        p.created_at,
        p.updated_at,
        s.name AS supplier_name,
        s.email AS supplier_email,
        s.is_deleted AS supplier_is_deleted
      FROM products p
      INNER JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR s.name LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category) {
      query += ` AND p.category = ?`;
      params.push(category);
    }

    if (supplierId) {
      query += ` AND p.supplier_id = ?`;
      params.push(supplierId);
    }

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY p.id DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async getById(id) {
    const query = `
      SELECT 
        p.id,
        p.supplier_id,
        p.name,
        p.sku,
        p.category,
        p.price,
        p.quantity,
        p.description,
        p.status,
        p.created_at,
        p.updated_at,
        s.name AS supplier_name,
        s.email AS supplier_email,
        s.phone AS supplier_phone,
        s.contact_person AS supplier_contact_person,
        s.is_deleted AS supplier_is_deleted
      FROM products p
      INNER JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ? AND p.is_deleted = 0
    `;
    const [rows] = await pool.query(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async skuExists(sku, excludeId = null) {
    let query = `SELECT id FROM products WHERE sku = ? AND is_deleted = 0`;
    const params = [sku];
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return rows.length > 0;
  }

  static async create({ supplier_id, name, sku, category, price, quantity, description, status = 'In Stock' }) {
    const query = `
      INSERT INTO products (supplier_id, name, sku, category, price, quantity, description, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;
    const [result] = await pool.query(query, [
      supplier_id,
      name,
      sku,
      category,
      price,
      quantity || 0,
      description || null,
      status || 'In Stock'
    ]);
    return result.insertId;
  }

  static async update(id, { supplier_id, name, sku, category, price, quantity, description, status }) {
    const query = `
      UPDATE products
      SET 
        supplier_id = ?,
        name = ?,
        sku = ?,
        category = ?,
        price = ?,
        quantity = ?,
        description = ?,
        status = ?
      WHERE id = ? AND is_deleted = 0
    `;
    const [result] = await pool.query(query, [
      supplier_id,
      name,
      sku,
      category,
      price,
      quantity,
      description || null,
      status,
      id
    ]);
    return result.affectedRows > 0;
  }

  static async softDelete(id) {
    const query = `
      UPDATE products
      SET is_deleted = 1
      WHERE id = ? AND is_deleted = 0
    `;
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }

  static async getDeleted() {
    const query = `
      SELECT 
        p.*,
        s.name AS supplier_name
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_deleted = 1
      ORDER BY p.updated_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async restore(id) {
    const query = `
      UPDATE products
      SET is_deleted = 0
      WHERE id = ? AND is_deleted = 1
    `;
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ProductModel;
