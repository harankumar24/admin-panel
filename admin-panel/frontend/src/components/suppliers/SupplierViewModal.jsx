import React, { useState, useEffect } from 'react';
import { supplierApi } from '../../services/api';

export default function SupplierViewModal({ supplierId, isOpen, onClose, onEdit }) {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && supplierId) {
      loadSupplier();
    } else {
      setSupplier(null);
      setError(null);
    }
  }, [isOpen, supplierId]);

  const loadSupplier = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await supplierApi.getById(supplierId);
      setSupplier(res.data);
    } catch (err) {
      setError(err.message || 'Error loading supplier details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" style={{ width: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Supplier Details</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        
        <div className="card-body">
          {loading && <p>Loading...</p>}
          {error && <p className="text-danger">{error}</p>}
          
          {supplier && (
            <div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-1"><strong>Name:</strong> {supplier.name}</p>
                  <p className="mb-1"><strong>Contact:</strong> {supplier.contact_person}</p>
                  <p className="mb-1"><strong>Email:</strong> {supplier.email}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Status: </strong>
                    <span className={`badge ${supplier.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                      {supplier.status}
                    </span>
                  </p>
                  <p className="mb-1"><strong>Phone:</strong> {supplier.phone}</p>
                  <p className="mb-1"><strong>Location:</strong> {supplier.city}, {supplier.country}</p>
                </div>
              </div>
              <p><strong>Address:</strong> {supplier.address}</p>

              <h6 className="mt-4 border-bottom pb-2">Related Products ({supplier.product_count || 0})</h6>
              {supplier.products && supplier.products.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mt-2">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplier.products.map(prod => (
                        <tr key={prod.id}>
                          <td>#{prod.id}</td>
                          <td>{prod.name}</td>
                          <td><code>{prod.sku}</code></td>
                          <td>₹{prod.price}</td>
                          <td>
                            <span className={`badge ${
                              prod.status === 'In Stock' ? 'bg-success' :
                              prod.status === 'Low Stock' ? 'bg-warning text-dark' : 'bg-danger'
                            }`}>
                              {prod.quantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No products for this supplier.</p>
              )}
            </div>
          )}
        </div>
        <div className="card-footer text-end">
          <button className="btn btn-secondary me-2" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(supplier); }}>Edit</button>
        </div>
      </div>
    </div>
  );
}
