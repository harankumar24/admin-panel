import React, { useState, useEffect } from 'react';
import { supplierApi } from '../../services/api';

export default function SupplierFormModal({ supplier, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '', contact_person: '', email: '', phone: '',
    address: '', city: '', country: 'India', status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (supplier) {
      setFormData(supplier);
    } else {
      setFormData({
        name: '', contact_person: '', email: '', phone: '',
        address: '', city: '', country: 'India', status: 'Active'
      });
    }
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (supplier) {
        await supplierApi.update(supplier.id, formData);
        onSuccess('Supplier updated successfully');
      } else {
        await supplierApi.create(formData);
        onSuccess('Supplier created successfully');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <h5 className="mb-0">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h5>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger p-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name:</label>
              <input className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Contact Person:</label>
              <input className="form-control" name="contact_person" value={formData.contact_person} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email:</label>
              <input className="form-control" type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone:</label>
              <input className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Address:</label>
              <input className="form-control" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="row mb-3">
              <div className="col">
                <label className="form-label">City:</label>
                <input className="form-control" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="col">
                <label className="form-label">Status:</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
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
