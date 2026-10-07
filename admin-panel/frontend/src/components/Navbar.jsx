import React from 'react';

export default function Navbar({ title, onRefresh, onAddSupplier, onAddProduct }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom mb-4 px-3 shadow-sm">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">{title}</span>
        <div className="d-flex">
          <button className="btn btn-outline-secondary me-2" onClick={onRefresh}>Refresh Data</button>
          {onAddSupplier && (
            <button className="btn btn-primary" onClick={onAddSupplier}>Add Supplier</button>
          )}
          {onAddProduct && (
            <button className="btn btn-primary" onClick={onAddProduct}>Add Product</button>
          )}
        </div>
      </div>
    </nav>
  );
}
