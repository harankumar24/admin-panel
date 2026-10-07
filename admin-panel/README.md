# Admin Panel — Supplier & Product Management Module

Full-Stack Application built with **Node.js, Express.js, React.js, and MySQL (MariaDB)** demonstrating REST API architecture, One-to-Many relational database modeling, Soft Delete design patterns, and clean separation of concerns.

---

## 📌 Architecture Overview

```
┌──────────────────────────────────────────────┐
│             React Frontend (Vite)            │
│         http://localhost:5173                │
│  - Dashboard & Analytics Overview            │
│  - Suppliers Module (Add, Edit, View, Delete)│
│  - Products Module (Add, Edit, View, Delete) │
│  - Recycle Bin / Soft-Delete Audit           │
└───────────────────────▲──────────────────────┘
                        │ HTTP / REST (Axios)
┌───────────────────────▼──────────────────────┐
│           Express.js REST API Layer          │
│         http://localhost:5000                │
│  - Controllers & Input Validation            │
│  - Supplier & Product Routes                 │
│  - Connection Pooling (mysql2/promise)       │
└───────────────────────▲──────────────────────┘
                        │ SQL Queries / Foreign Keys
┌───────────────────────▼──────────────────────┐
│             MySQL / MariaDB Database         │
│               Port: 3306                     │
│  - suppliers (Master Table)                  │
│  - products (Child Table, FK: supplier_id)   │
└──────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Relational Design

### 1. Suppliers Table (`suppliers`)
| Column | Type | Constraints / Details |
|---|---|---|
| `id` | `INT` | Primary Key, Auto Increment |
| `name` | `VARCHAR(255)` | NOT NULL — Company / Supplier Name |
| `contact_person` | `VARCHAR(255)` | NOT NULL — Primary point of contact |
| `email` | `VARCHAR(255)` | NOT NULL — Contact Email |
| `phone` | `VARCHAR(50)` | NOT NULL — Contact Phone |
| `address` | `VARCHAR(255)` | NULL |
| `city` | `VARCHAR(100)` | NULL |
| `country` | `VARCHAR(100)` | DEFAULT 'India' |
| `status` | `ENUM` | 'Active', 'Inactive' |
| `is_deleted` | `TINYINT(1)` | DEFAULT 0 (**Soft Delete Flag**) |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMP` | ON UPDATE CURRENT_TIMESTAMP |

### 2. Products Table (`products`)
| Column | Type | Constraints / Details |
|---|---|---|
| `id` | `INT` | Primary Key, Auto Increment |
| `supplier_id` | `INT` | NOT NULL, **Foreign Key** referencing `suppliers(id)` |
| `name` | `VARCHAR(255)` | NOT NULL — Product Name |
| `sku` | `VARCHAR(100)` | NOT NULL — Unique Stock Keeping Unit |
| `category` | `VARCHAR(100)` | NOT NULL — Category classification |
| `price` | `DECIMAL(10,2)`| NOT NULL — Unit Amount |
| `quantity` | `INT` | NOT NULL, DEFAULT 0 |
| `description` | `TEXT` | NULL |
| `status` | `ENUM` | 'In Stock', 'Low Stock', 'Out of Stock' |
| `is_deleted` | `TINYINT(1)` | DEFAULT 0 (**Soft Delete Flag**) |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMP` | ON UPDATE CURRENT_TIMESTAMP |

---

## 🔑 Core Requirements & Technical Highlights

### 1. One-to-Many Relationship & Supplier View (Requirement 4.3)
- **Concept:** One Supplier supplies Many Products. Each Product belongs strictly to one Supplier.
- **Supplier View API (`GET /api/suppliers/:id`):**
  When a supplier is retrieved, the API does not simply return supplier profile fields. It performs an aggregated query / join to return:
  1. `product_count`: Computed total count of active (`is_deleted = 0`) products associated with that supplier.
  2. `products`: Full list of linked products with their SKU, category, price, and current stock level.
- **Frontend Display:** Rendered prominently with a highlighted relationship card and an associated products sub-table.

### 2. Soft Delete Pattern (Requirements 4.1, 5.2, 7)
- **Rule:** Never physically execute `DELETE FROM suppliers` or `DELETE FROM products`.
- **Implementation:**
  - Both tables feature an `is_deleted TINYINT(1) DEFAULT 0` column with dedicated B-Tree index (`idx_supplier_deleted`, `idx_product_deleted`).
  - When the delete endpoint is called (`DELETE /api/suppliers/:id` or `DELETE /api/products/:id`), the backend runs:
    ```sql
    UPDATE suppliers SET is_deleted = 1 WHERE id = ?;
    ```
  - Standard retrieval queries filter `WHERE is_deleted = 0`.
  - **Recycle Bin Feature:** Soft-deleted records are accessible in the UI's Recycle Bin tab where they can be audited and restored (`POST /api/suppliers/:id/restore`) with zero data loss.

### 3. Synchronization Discussion: What happens when a Supplier is soft-deleted?
In enterprise applications, handling dependent child records when a master record is soft-deleted can follow several strategies:
1. **Restricted Deletion (Current Protection):** Before soft-deleting a supplier, the system inspects active product count. If products exist, the UI notifies the administrator of the dependent items.
2. **Cascading Soft Delete:** Automatically flag linked products as inactive or soft-deleted.
3. **Graceful Degeneration:** Products retain historical supplier association, but the supplier is flagged as `(Archived)` in reports, and new orders/stock changes for that supplier are blocked.
The current implementation enforces referential integrity while keeping historical transactions transparent.

### 4. Live Supplier Dropdown (Requirement 5.1)
- The React "Add / Edit Product" form dynamically queries `GET /api/suppliers?status=Active` on mount/open.
- The dropdown displays all active vendors, ensuring products cannot be assigned to nonexistent or deleted suppliers.

---

## 📡 REST API Reference

### Supplier Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/suppliers` | List all active suppliers (includes `product_count`) |
| `GET` | `/api/suppliers/:id` | View supplier details with `product_count` and linked products |
| `POST` | `/api/suppliers` | Create new supplier |
| `PUT` | `/api/suppliers/:id` | Update existing supplier |
| `DELETE` | `/api/suppliers/:id` | **Soft-delete** supplier (`is_deleted = 1`) |
| `GET` | `/api/suppliers/trash` | View all soft-deleted suppliers |
| `POST` | `/api/suppliers/:id/restore` | Restore soft-deleted supplier (`is_deleted = 0`) |

### Product Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all active products joined with `supplier_name` |
| `GET` | `/api/products/:id` | View product details joined with supplier details |
| `POST` | `/api/products` | Create new product linked to `supplier_id` |
| `PUT` | `/api/products/:id` | Update product details (allows reassigning `supplier_id`) |
| `DELETE` | `/api/products/:id` | **Soft-delete** product (`is_deleted = 1`) |
| `GET` | `/api/products/trash` | View all soft-deleted products |
| `POST` | `/api/products/:id/restore` | Restore soft-deleted product (`is_deleted = 0`) |

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- MySQL or MariaDB running on port 3306

### 1. Database Setup
Ensure database `admin_panel_db` is created:
```sql
CREATE DATABASE IF NOT EXISTS admin_panel_db;
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds realistic initial suppliers and products
npm start        # Starts Express server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite React application on http://localhost:5173
```
