import React, { useState } from 'react';
import ProductFormModal from './ProductFormModal';
import ProductViewModal from './ProductViewModal';
import { productApi } from '../../services/api';

export default function ProductList({
  products = [],
  suppliers = [],
  loading,
  onRefresh,
  showToast,
  onOpenAddModal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');

  const [selectedProductForView, setSelectedProductForView] = useState(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.supplier_name && p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === '' || p.category === categoryFilter;
    const matchesSupplier = supplierFilter === '' || String(p.supplier_id) === String(supplierFilter);

    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const res = await productApi.delete(productToDelete.id);
      showToast(res.message || `Product "${productToDelete.name}" soft-deleted.`, 'success');
      setProductToDelete(null);
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to soft delete product.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Product Catalog ({filteredProducts.length})</h5>
      </div>

      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Search products, SKU, supplier..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={supplierFilter}
              onChange={e => setSupplierFilter(e.target.value)}
            >
              <option value="">All Suppliers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2 text-end">
            <button className="btn btn-success" onClick={onOpenAddModal}>
              Add Product
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Stock</th>
                <th>Supplier (Joined)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">Loading products from database...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>
                      <div className="fw-bold">{product.name}</div>
                      {product.description && (
                        <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td><code>{product.sku}</code></td>
                    <td>{product.category}</td>
                    <td className="fw-bold">₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>{product.quantity} units</td>
                    <td><span className="badge bg-light text-dark border">{product.supplier_name || `Supplier #${product.supplier_id}`}</span></td>
                    <td>
                      <span className={`badge ${
                        product.status === 'In Stock' ? 'bg-success' :
                        product.status === 'Low Stock' ? 'bg-warning text-dark' : 'bg-danger'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setSelectedProductForView(product.id)}>View</button>
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setSelectedProductForEdit(product)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setProductToDelete(product)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductViewModal
        productId={selectedProductForView}
        isOpen={Boolean(selectedProductForView)}
        onClose={() => setSelectedProductForView(null)}
        onEdit={(p) => setSelectedProductForEdit(p)}
      />

      <ProductFormModal
        product={selectedProductForEdit}
        isOpen={Boolean(selectedProductForEdit)}
        onClose={() => setSelectedProductForEdit(null)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          onRefresh();
        }}
      />

      {productToDelete && (
        <div className="modal-overlay" onClick={() => setProductToDelete(null)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">Confirm Soft Delete</h5>
            </div>
            <div className="card-body">
              <p>Are you sure you want to soft-delete product <strong>"{productToDelete.name}"</strong> (SKU: {productToDelete.sku})?</p>
              <div className="alert alert-warning small">
                <strong>Soft Delete Policy:</strong> The record is flagged with is_deleted = 1 in MySQL and will remain safely in the database for auditing and restoration.
              </div>
            </div>
            <div className="card-footer text-end">
              <button className="btn btn-secondary me-2" onClick={() => setProductToDelete(null)} disabled={isDeleting}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Confirm Soft Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
