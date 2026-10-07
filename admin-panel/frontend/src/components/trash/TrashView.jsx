import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Building2, Package, AlertCircle } from 'lucide-react';
import { supplierApi, productApi } from '../../services/api';

export default function TrashView({ showToast, onRestoreSuccess }) {
  const [activeSubTab, setActiveSubTab] = useState('suppliers');
  const [deletedSuppliers, setDeletedSuppliers] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    fetchTrash();
  }, [activeSubTab]);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'suppliers') {
        const res = await supplierApi.getTrash();
        setDeletedSuppliers(res.data || []);
      } else {
        const res = await productApi.getTrash();
        setDeletedProducts(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch trash records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreSupplier = async (id, name) => {
    setRestoringId(id);
    try {
      await supplierApi.restore(id);
      showToast(`Supplier "${name}" restored successfully.`, 'success');
      fetchTrash();
      onRestoreSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to restore supplier.', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  const handleRestoreProduct = async (id, name) => {
    setRestoringId(id);
    try {
      await productApi.restore(id);
      showToast(`Product "${name}" restored successfully.`, 'success');
      fetchTrash();
      onRestoreSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to restore product.', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <Trash2 size={20} color="#ef4444" />
          <h2>Recycle Bin / Soft-Deleted Records</h2>
        </div>

        <div className="panel-controls">
          <button
            className={`btn btn-sm ${activeSubTab === 'suppliers' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('suppliers')}
          >
            <Building2 size={14} />
            <span>Deleted Suppliers ({deletedSuppliers.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('products')}
          >
            <Package size={14} />
            <span>Deleted Products ({deletedProducts.length})</span>
          </button>
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '12px 24px', borderBottom: '1px solid #e2e8f0', fontSize: '0.84rem', color: '#475569' }}>
        <strong>Soft Delete Verification:</strong> These records were flagged with <code>is_deleted = 1</code> in MySQL instead of physical <code>DELETE</code> statements. You can click <strong>Restore</strong> at any time to return them to active state.
      </div>

      <div className="table-container">
        {activeSubTab === 'suppliers' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Location</th>
                <th>Linked Products</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading deleted suppliers...</td></tr>
              ) : deletedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <Building2 size={36} />
                      <h4>Recycle Bin is empty</h4>
                      <p>No soft-deleted suppliers found in MySQL.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                deletedSuppliers.map(s => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.contact_person}</td>
                    <td>{s.email}</td>
                    <td>{[s.city, s.country].filter(Boolean).join(', ') || 'N/A'}</td>
                    <td><span className="badge badge-count">{s.product_count} items</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRestoreSupplier(s.id, s.name)}
                        disabled={restoringId === s.id}
                      >
                        <RotateCcw size={14} />
                        <span>{restoringId === s.id ? 'Restoring...' : 'Restore'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Supplier</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading deleted products...</td></tr>
              ) : deletedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <Package size={36} />
                      <h4>Recycle Bin is empty</h4>
                      <p>No soft-deleted products found in MySQL.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                deletedProducts.map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td>{p.category}</td>
                    <td>₹{parseFloat(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>{p.supplier_name || `Supplier #${p.supplier_id}`}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRestoreProduct(p.id, p.name)}
                        disabled={restoringId === p.id}
                      >
                        <RotateCcw size={14} />
                        <span>{restoringId === p.id ? 'Restoring...' : 'Restore'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
