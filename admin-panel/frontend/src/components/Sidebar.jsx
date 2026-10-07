import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="sidebar p-3 d-flex flex-column h-100">
      <h3 className="mb-4">Admin Panel</h3>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item mb-2">
          <a
            href="#"
            className={`nav-link ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('suppliers'); }}
          >
            Suppliers
          </a>
        </li>
        <li className="nav-item">
          <a
            href="#"
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('products'); }}
          >
            Products
          </a>
        </li>
      </ul>
    </div>
  );
}
