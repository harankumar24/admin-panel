const { pool } = require('../config/db');

class SupplierModel {
  
  static async getAll({ search = '', status = '' } = {}) {
    let query = `
      SELECT 
        s.id,
        s.name,
        s.contact_person,
        s.email,
        s.phone,
        s.address,
        s.city,
        s.country,
        s.status,
        s.created_at,
        s.updated_at,
        COUNT(p.id) AS product_count
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id AND p.is_deleted = 0
      WHERE s.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (s.name LIKE ? OR s.contact_person LIKE ? OR s.email LIKE ? OR s.city LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    query += ` GROUP BY s.id ORDER BY s.id DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async getById(id) {
    const supplierQuery = `
      SELECT 
        s.id,
        s.name,
        s.contact_person,
        s.email,
        s.phone,
        s.address,
        s.city,
        s.country,
        s.status,
        s.created_at,
        s.updated_at
      FROM suppliers s
      WHERE s.id = ? AND s.is_deleted = 0
    `;
    const [supplierRows] = await pool.query(supplierQuery, [id]);

    if (supplierRows.length === 0) {
      return null;
    }

    const supplier = supplierRows[0];

    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.category,
        p.price,
        p.quantity,
        p.status,
        p.description,
        p.created_at
      FROM products p
      WHERE p.supplier_id = ? AND p.is_deleted = 0
      ORDER BY p.id DESC
    `;
    const [productRows] = await pool.query(productsQuery, [id]);

    return {
      ...supplier,
      product_count: productRows.length,
      products: productRows
    };
  }

  static async create({ name, contact_person, email, phone, address, city, country = 'India', status = 'Active' }) {
    const query = `
      INSERT INTO suppliers (name, contact_person, email, phone, address, city, country, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;
    const [result] = await pool.query(query, [
      name,
      contact_person,
      email,
      phone,
      address || null,
      city || null,
      country || 'India',
      status || 'Active'
    ]);
    return result.insertId;
  }

  static async update(id, { name, contact_person, email, phone, address, city, country, status }) {
    const query = `
      UPDATE suppliers
      SET 
        name = ?,
        contact_person = ?,
        email = ?,
        phone = ?,
        address = ?,
        city = ?,
        country = ?,
        status = ?
      WHERE id = ? AND is_deleted = 0
    `;
    const [result] = await pool.query(query, [
      name,
      contact_person,
      email,
      phone,
      address || null,
      city || null,
      country || 'India',
      status || 'Active',
      id
    ]);
    return result.affectedRows > 0;
  }

  static async softDelete(id) {
    const query = `
      UPDATE suppliers
      SET is_deleted = 1
      WHERE id = ? AND is_deleted = 0
    `;
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }

  static async getActiveProductCount(id) {
    const query = `
      SELECT COUNT(*) AS count
      FROM products
      WHERE supplier_id = ? AND is_deleted = 0
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0].count;
  }

  static async getDeleted() {
    const query = `
      SELECT s.*, COUNT(p.id) AS product_count
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id AND p.is_deleted = 0
      WHERE s.is_deleted = 1
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async restore(id) {
    const query = `
      UPDATE suppliers
      SET is_deleted = 0
      WHERE id = ? AND is_deleted = 1
    `;
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = SupplierModel;
