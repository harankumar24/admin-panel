import React from 'react';
import { Users, Package, DollarSign, AlertTriangle } from 'lucide-react';

export default function StatsOverview({ suppliers = [], products = [] }) {
  const activeSuppliers = suppliers.filter(s => s.status === 'Active').length;
  const totalProducts = products.length;
  
  const totalValuation = products.reduce((acc, p) => {
    const price = parseFloat(p.price) || 0;
    const qty = parseInt(p.quantity, 10) || 0;
    return acc + (price * qty);
  }, 0);

  const lowStockCount = products.filter(p => (parseInt(p.quantity, 10) || 0) <= 5).length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon blue">
          <Users size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{suppliers.length}</div>
          <div className="stat-label">Active Suppliers ({activeSuppliers} active)</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon purple">
          <Package size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{totalProducts}</div>
          <div className="stat-label">Managed Products</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon green">
          <DollarSign size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">
            ₹{totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="stat-label">Total Inventory Value</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon amber">
          <AlertTriangle size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{lowStockCount}</div>
          <div className="stat-label">Low / Out of Stock Items</div>
        </div>
      </div>
    </div>
  );
}
