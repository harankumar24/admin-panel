const { pool, initDB } = require('../config/db');

async function seed() {
  try {
    await initDB();
    console.log('Seeding initial data...');

    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE products');
    await pool.query('TRUNCATE TABLE suppliers');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    const suppliers = [
      {
        name: 'ABC Electronics',
        contact_person: 'John Smith',
        email: 'john@abcelectronics.com',
        phone: '+91 98765 43210',
        address: 'MG Road, Phase 1',
        city: 'Bangalore',
        country: 'India',
        status: 'Active'
      },
      {
        name: 'XYZ Components Ltd',
        contact_person: 'Priya Sharma',
        email: 'priya@xyzcomponents.in',
        phone: '+91 98111 22334',
        address: 'Nehru Place',
        city: 'New Delhi',
        country: 'India',
        status: 'Active'
      },
      {
        name: 'Global Packaging',
        contact_person: 'Rajesh Verma',
        email: 'sales@globalpackaging.in',
        phone: '+91 99220 33445',
        address: 'Andheri East',
        city: 'Mumbai',
        country: 'India',
        status: 'Active'
      },
      {
        name: 'Chennai Hardware Corp',
        contact_person: 'Ramesh Kumar',
        email: 'ramesh@chennaihardware.com',
        phone: '+91 94440 55667',
        address: 'OMR Road',
        city: 'Chennai',
        country: 'India',
        status: 'Active'
      }
    ];

    const supplierIds = [];
    for (const s of suppliers) {
      const [res] = await pool.query(
        `INSERT INTO suppliers (name, contact_person, email, phone, address, city, country, status, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [s.name, s.contact_person, s.email, s.phone, s.address, s.city, s.country, s.status]
      );
      supplierIds.push(res.insertId);
    }
    console.log(` Inserted ${supplierIds.length} suppliers.`);

    const products = [
      {
        supplier_id: supplierIds[0],
        name: '4K Display Panel',
        sku: 'ABC-DSP-01',
        category: 'Electronics',
        price: 18500.00,
        quantity: 45,
        description: '32-inch IPS UHD replacement panel',
        status: 'In Stock'
      },
      {
        supplier_id: supplierIds[0],
        name: 'HDMI Cable (5m)',
        sku: 'ABC-CAB-02',
        category: 'Accessories',
        price: 1250.00,
        quantity: 120,
        description: 'Standard HDMI cable',
        status: 'In Stock'
      },
      {
        supplier_id: supplierIds[0],
        name: 'USB-C Dock',
        sku: 'ABC-DCK-03',
        category: 'Electronics',
        price: 9500.00,
        quantity: 12,
        description: 'Multi-port dock',
        status: 'In Stock'
      },
      {
        supplier_id: supplierIds[1],
        name: 'Microcontroller Board',
        sku: 'XYZ-MCU-10',
        category: 'Semiconductors',
        price: 420.00,
        quantity: 500,
        description: 'Standard 32-bit MCU',
        status: 'In Stock'
      },
      {
        supplier_id: supplierIds[1],
        name: 'Resistor Kit',
        sku: 'XYZ-RES-11',
        category: 'Components',
        price: 850.00,
        quantity: 80,
        description: 'Assorted resistors',
        status: 'In Stock'
      },
      {
        supplier_id: supplierIds[1],
        name: 'Thermal Paste',
        sku: 'XYZ-THM-12',
        category: 'Thermal',
        price: 310.00,
        quantity: 4,
        description: 'Standard thermal paste',
        status: 'Low Stock'
      },
      {
        supplier_id: supplierIds[2],
        name: 'Bubble Wrap (100m)',
        sku: 'GLB-BBL-20',
        category: 'Packaging',
        price: 650.00,
        quantity: 200,
        description: 'Standard bubble wrap',
        status: 'In Stock'
      },
      {
        supplier_id: supplierIds[2],
        name: 'Cardboard Boxes (Medium)',
        sku: 'GLB-BOX-21',
        category: 'Packaging',
        price: 1400.00,
        quantity: 0,
        description: 'Standard shipping boxes',
        status: 'Out of Stock'
      },
      {
        supplier_id: supplierIds[3],
        name: '16GB RAM',
        sku: 'CHN-RAM-30',
        category: 'Semiconductors',
        price: 4800.00,
        quantity: 65,
        description: 'Standard memory module',
        status: 'In Stock'
      }
    ];

    for (const p of products) {
      await pool.query(
        `INSERT INTO products (supplier_id, name, sku, category, price, quantity, description, status, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [p.supplier_id, p.name, p.sku, p.category, p.price, p.quantity, p.description, p.status]
      );
    }
    console.log(` Inserted ${products.length} products.`);

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(' Seeding failed:', error);
    process.exit(1);
  }
}

seed();
