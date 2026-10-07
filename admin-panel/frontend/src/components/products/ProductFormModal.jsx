import React, { useState, useEffect } from 'react';
import { productApi, supplierApi } from '../../services/api';

export default function ProductFormModal({ product, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    supplier_id: '', name: '', sku: '', category: '',
    price: '', quantity: 0, description: '', status: 'In Stock'
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
      if (product) {
        setFormData(product);
      } else {
        setFormData({
          supplier_id: '', name: '', sku: '', category: '',
          price: '', quantity: 0, description: '', status: 'In Stock'
        });
      }
    }
  }, [product, isOpen]);

  const loadSuppliers = async () => {
    try {
      const res = await supplierApi.getAll();
      setSuppliers(res.data.filter(s => s.status === 'Active'));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (product) {
        await productApi.update(product.id, formData);
        onSuccess('Product updated successfully');
      } else {
        await productApi.create(formData);
        onSuccess('Product created successfully');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <h5 className="mb-0">{product ? 'Edit Product' : 'Add Product'}</h5>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger p-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Supplier:</label>
              <select className="form-select" name="supplier_id" value={formData.supplier_id} onChange={handleChange} required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Product Name:</label>
              <input className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="row mb-3">
              <div className="col">
                <label className="form-label">SKU:</label>
                <input className="form-control" name="sku" value={formData.sku} onChange={handleChange} required />
              </div>
              <div className="col">
                <label className="form-label">Category:</label>
                <input className="form-control" name="category" value={formData.category} onChange={handleChange} required />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col">
                <label className="form-label">Price:</label>
                <input className="form-control" type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
              </div>
              <div className="col">
                <label className="form-label">Quantity:</label>
                <input className="form-control" type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Status:</label>
              <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Description:</label>
              <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="2"></textarea>
            </div>
            <div className="text-end">
              <button type="button" className="btn btn-secondary me-2" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
