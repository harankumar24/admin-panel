
const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('🚀 RUNNING TASK ASSIGNMENT VERIFICATION SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(` [PASS] ${title}`);
      if (detail) console.log(`        ↳ ${detail}`);
    } else {
      console.error(`❌ [FAIL] ${title}`);
      if (detail) console.error(`        ↳ ${detail}`);
    }
  }

  try {

    const health = await request('GET', '/health');
    assert('API Server is Healthy', health.status === 200, `Status: ${health.body.status}`);

    const suppliersRes = await request('GET', '/suppliers');
    assert(
      'Module 1: List Suppliers (GET /api/suppliers)',
      suppliersRes.status === 200 && Array.isArray(suppliersRes.body.data) && suppliersRes.body.data.length > 0,
      `Found ${suppliersRes.body.count} active suppliers`
    );

    const firstSupplierId = suppliersRes.body.data[0].id;
    const viewSupplier = await request('GET', `/suppliers/${firstSupplierId}`);
    assert(
      'Requirement 4.3: Supplier View computes product_count',
      viewSupplier.status === 200 && typeof viewSupplier.body.data.product_count === 'number',
      `Supplier #${firstSupplierId} has product_count = ${viewSupplier.body.data.product_count}`
    );
    assert(
      'Requirement 4.3 (Bonus): Supplier View returns related products list',
      Array.isArray(viewSupplier.body.data.products),
      `Returned ${viewSupplier.body.data.products.length} linked products`
    );

    const newSupp = await request('POST', '/suppliers', {
      name: 'Test Verification Supplier Ltd',
      contact_person: 'Amit Kumar',
      email: 'amit.kumar@testsupplier.com',
      phone: '+91 99999 88888',
      city: 'Pune',
      status: 'Active'
    });
    assert(
      'Module 1: Add Supplier (POST /api/suppliers)',
      newSupp.status === 201 && newSupp.body.data?.id,
      `Created Supplier ID #${newSupp.body.data?.id}`
    );
    const testSupplierId = newSupp.body.data.id;

    const updateSupp = await request('PUT', `/suppliers/${testSupplierId}`, {
      name: 'Test Verification Supplier Ltd (Updated)',
      contact_person: 'Amit Kumar',
      email: 'amit.kumar@testsupplier.com',
      phone: '+91 99999 77777',
      city: 'Pune',
      status: 'Active'
    });
    assert(
      'Module 1: Edit Supplier (PUT /api/suppliers/:id)',
      updateSupp.status === 200 && updateSupp.body.data.name.includes('(Updated)'),
      `Updated name: ${updateSupp.body.data.name}`
    );

    const newProd = await request('POST', '/products', {
      supplier_id: testSupplierId,
      name: 'Industrial Sensor Pro',
      sku: `TST-SN-${Date.now()}`,
      category: 'Electronics',
      price: 2499.50,
      quantity: 50,
      description: 'Precision temperature and humidity sensor'
    });
    assert(
      'Module 2: Add Product with Supplier link (POST /api/products)',
      newProd.status === 201 && newProd.body.data?.id,
      `Created Product ID #${newProd.body.data?.id} linked to Supplier #${testSupplierId}`
    );
    const testProductId = newProd.body.data.id;

    const suppAfterProd = await request('GET', `/suppliers/${testSupplierId}`);
    assert(
      'Relationship Validation: Supplier View product_count incremented to 1',
      suppAfterProd.body.data.product_count === 1,
      `Supplier #${testSupplierId} count is now ${suppAfterProd.body.data.product_count}`
    );

    const updateProd = await request('PUT', `/products/${testProductId}`, {
      supplier_id: firstSupplierId, // Change supplier!
      name: 'Industrial Sensor Pro (Reassigned)',
      sku: newProd.body.data.sku,
      category: 'Electronics',
      price: 2299.00,
      quantity: 45,
      description: 'Reassigned supplier test',
      status: 'In Stock'
    });
    assert(
      'Module 2: Edit Product & Change Supplier (PUT /api/products/:id)',
      updateProd.status === 200 && updateProd.body.data.supplier_id === firstSupplierId,
      `Reassigned from Supplier #${testSupplierId} to Supplier #${firstSupplierId}`
    );

    const delProd = await request('DELETE', `/products/${testProductId}`);
    assert(
      'Module 2: Soft Delete Product (DELETE /api/products/:id)',
      delProd.status === 200 && delProd.body.success === true,
      delProd.body.message
    );

    const delSupp = await request('DELETE', `/suppliers/${testSupplierId}`);
    assert(
      'Module 1: Soft Delete Supplier (DELETE /api/suppliers/:id)',
      delSupp.status === 200 && delSupp.body.success === true,
      delSupp.body.message
    );

    const restoreSupp = await request('POST', `/suppliers/${testSupplierId}/restore`);
    assert(
      'Recycle Bin: Restore soft-deleted supplier (POST /api/suppliers/:id/restore)',
      restoreSupp.status === 200 && restoreSupp.body.success === true,
      `Restored Supplier #${testSupplierId}`
    );

    console.log('\n===============================================================');
    console.log(`TEST SUITE RESULT: ${passed} / ${total} CHECKS PASSED`);
    console.log('===============================================================\n');

  } catch (err) {
    console.error('Test suite failed with exception:', err);
  }
}

runTests();
