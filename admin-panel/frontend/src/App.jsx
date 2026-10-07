import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import SupplierList from './components/suppliers/SupplierList';
import ProductList from './components/products/ProductList';
import SupplierFormModal from './components/suppliers/SupplierFormModal';
import ProductFormModal from './components/products/ProductFormModal';
import Toast from './components/Toast';
import { supplierApi, productApi } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const handleDismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);

    try {
      const [suppRes, prodRes] = await Promise.all([
        supplierApi.getAll(),
        productApi.getAll()
      ]);

      setSuppliers(suppRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast(err.message || 'Failed to load data from backend server.', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getPageMeta = () => {
    switch (activeTab) {
      case 'suppliers':
        return { title: 'Supplier Management' };
      case 'products':
        return { title: 'Product Management' };
      default:
        return { title: 'Admin Panel Overview' };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="container-fluid p-0 d-flex">
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
      
      <div style={{ width: '250px' }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="flex-grow-1 bg-light">
        <Navbar
          title={meta.title}
          onRefresh={() => loadData(false)}
          onAddSupplier={activeTab === 'suppliers' ? () => setIsAddSupplierOpen(true) : null}
          onAddProduct={activeTab === 'products' ? () => setIsAddProductOpen(true) : null}
        />

        <main className="container-fluid px-4">
          {activeTab === 'suppliers' && (
            <SupplierList
              suppliers={suppliers}
              loading={loading}
              onRefresh={() => loadData(true)}
              showToast={showToast}
              onOpenAddModal={() => setIsAddSupplierOpen(true)}
            />
          )}

          {activeTab === 'products' && (
            <ProductList
              products={products}
              suppliers={suppliers}
              loading={loading}
              onRefresh={() => loadData(true)}
              showToast={showToast}
              onOpenAddModal={() => setIsAddProductOpen(true)}
            />
          )}
        </main>
      </div>

      <SupplierFormModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          loadData(true);
        }}
      />

      <ProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          loadData(true);
        }}
      />
    </div>
  );
}
