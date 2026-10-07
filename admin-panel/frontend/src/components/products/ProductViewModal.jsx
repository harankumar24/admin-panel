import React, { useState, useEffect } from 'react';
import { productApi } from '../../services/api';

export default function ProductViewModal({ productId, isOpen, onClose, onEdit }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && productId) {
      loadProduct();
    } else {
      setProduct(null);
      setError(null);
    }
  }, [isOpen, productId]);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.getById(productId);
      setProduct(res.data);
    } catch (err) {
      setError(err.message || 'Error loading product details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Product Details</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        
        <div className="card-body">
          {loading && <p>Loading...</p>}
          {error && <p className="text-danger">{error}</p>}
          
          {product && (
            <div>
              <p><strong>Name:</strong> {product.name}</p>
              <p><strong>SKU:</strong> {product.sku}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Price:</strong> ₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p><strong>Stock:</strong> {product.quantity} units</p>
              <p>
                <strong>Status: </strong>
                <span className={`badge ${
                  product.status === 'In Stock' ? 'bg-success' :
                  product.status === 'Low Stock' ? 'bg-warning text-dark' : 'bg-danger'
                }`}>
                  {product.status}
                </span>
              </p>
              <p><strong>Supplier:</strong> {product.supplier_name} (ID: {product.supplier_id})</p>
              <p><strong>Description:</strong> {product.description}</p>
            </div>
          )}
        </div>
        <div className="card-footer text-end">
          <button className="btn btn-secondary me-2" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(product); }}>Edit</button>
        </div>
      </div>
    </div>
  );
}
