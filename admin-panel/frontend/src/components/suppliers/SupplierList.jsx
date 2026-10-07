import React, { useState } from 'react';
import SupplierFormModal from './SupplierFormModal';
import SupplierViewModal from './SupplierViewModal';
import { supplierApi } from '../../services/api';

export default function SupplierList({
  suppliers = [],
  loading,
  onRefresh,
  showToast,
  onOpenAddModal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedSupplierForView, setSelectedSupplierForView] = useState(null);
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch =
      searchTerm === '' ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    setIsDeleting(true);
    try {
      const res = await supplierApi.delete(supplierToDelete.id);
      showToast(res.message || `Supplier "${supplierToDelete.name}" soft-deleted.`, 'success');
      setSupplierToDelete(null);
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to soft delete supplier.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Supplier Directory ({filteredSuppliers.length})</h5>
      </div>

      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search suppliers, contact, city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="col-md-3 text-end">
             <button className="btn btn-success" onClick={onOpenAddModal}>
               Add Supplier
             </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Contact Info</th>
                <th>Location</th>
                <th>Status</th>
                <th>Products Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Loading suppliers from database...</td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No suppliers found.</td>
                </tr>
              ) : (
                filteredSuppliers.map(supplier => (
                  <tr key={supplier.id}>
                    <td>#{supplier.id}</td>
                    <td>
                      <div className="fw-bold">{supplier.name}</div>
                      {supplier.address && (
                        <div className="text-muted small">{supplier.address}</div>
                      )}
                    </td>
                    <td>{supplier.contact_person}</td>
                    <td>
                      <div>{supplier.email}</div>
                      <div className="text-muted small">{supplier.phone}</div>
                    </td>
                    <td>{[supplier.city, supplier.country].filter(Boolean).join(', ') || 'N/A'}</td>
                    <td>
                      <span className={`badge ${supplier.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {supplier.product_count} {supplier.product_count === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setSelectedSupplierForView(supplier.id)}>View</button>
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setSelectedSupplierForEdit(supplier)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setSupplierToDelete(supplier)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupplierViewModal
        supplierId={selectedSupplierForView}
        isOpen={Boolean(selectedSupplierForView)}
        onClose={() => setSelectedSupplierForView(null)}
        onEdit={(s) => setSelectedSupplierForEdit(s)}
      />

      <SupplierFormModal
        supplier={selectedSupplierForEdit}
        isOpen={Boolean(selectedSupplierForEdit)}
        onClose={() => setSelectedSupplierForEdit(null)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          onRefresh();
        }}
      />

      {supplierToDelete && (
        <div className="modal-overlay" onClick={() => setSupplierToDelete(null)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">Confirm Soft Delete</h5>
            </div>
            <div className="card-body">
              <p>Are you sure you want to delete supplier <strong>"{supplierToDelete.name}"</strong>?</p>
              <div className="alert alert-warning small">
                <strong>Soft Delete Policy:</strong> The record will NOT be physically removed from MySQL database. Its is_deleted status will be set to 1.
                {supplierToDelete.product_count > 0 && (
                  <p className="mb-0 mt-2">Note: This supplier currently has <strong>{supplierToDelete.product_count} linked product(s)</strong>.</p>
                )}
              </div>
            </div>
            <div className="card-footer text-end">
              <button className="btn btn-secondary me-2" onClick={() => setSupplierToDelete(null)} disabled={isDeleting}>Cancel</button>
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
