document.addEventListener('DOMContentLoaded', () => {
  // Fetch data from backend
  const fetchData = async (endpoint) => {
    const response = await fetch(`http://localhost:3000/${endpoint}`);
    return response.json();
  };

  // Populate dropdowns
  const updateDropdowns = async () => {
    const customers = await fetchData('customers');
    const products = await fetchData('products');
    const customerSelect = document.getElementById('recordCustomer');
    const productSelect = document.getElementById('recordProduct');

    customerSelect.innerHTML = '<option value="">Select Customer</option>';
    productSelect.innerHTML = '<option value="">Select Product</option>';

    customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.phone;
      option.textContent = `${customer.name} (${customer.phone})`;
      customerSelect.appendChild(option);
    });

    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.name;
      option.textContent = `${product.name} (₹${product.rate})`;
      productSelect.appendChild(option);
    });
  };

  // Display records
  const displayRecords = async () => {
    const records = await fetchData('records');
    const products = await fetchData('products');
    const tableBody = document.getElementById('recordsTable');
    tableBody.innerHTML = '';
    let totalSum = 0;

    records.forEach((record, index) => {
      const product = products.find(p => p.name === record.product);
      const total = (record.quantity * (product ? product.rate : 0)).toFixed(2);
      totalSum += parseFloat(total);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.date}</td>
        <td>${record.customer}</td>
        <td>${record.product}</td>
        <td>${record.quantity}</td>
        <td>₹${total}</td>
        <td><button class="bg-red-500 text-white p-2 rounded hover:bg-red-600" onclick="deleteRecord('${record._id}')">Delete</button></td>
      `;
      tableBody.appendChild(row);
    });

    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `<td colspan="4" class="text-right font-bold">Total:</td><td>₹${totalSum.toFixed(2)}</td><td></td>`;
    tableBody.appendChild(totalRow);
  };

  // Add customer
  document.getElementById('customerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    await fetch('http://localhost:3000/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    });
    updateDropdowns();
    e.target.reset();
  });

  // Add product
  document.getElementById('productForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('productName').value;
    const rate = parseFloat(document.getElementById('productRate').value);
    await fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rate })
    });
    updateDropdowns();
    e.target.reset();
  });

  // Add record
  document.getElementById('recordForm').addEventListener('submit', async e => {
    e.preventDefault();
    const customer = document.getElementById('recordCustomer').value;
    const product = document.getElementById('recordProduct').value;
    const quantity = parseFloat(document.getElementById('recordQuantity').value);
    const date = document.getElementById('recordDate').value || new Date().toISOString().split('T')[0];
    await fetch('http://localhost:3000/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, product, quantity, date })
    });
    displayRecords();
    e.target.reset();
  });

  // Delete record
  window.deleteRecord = async id => {
    await fetch(`http://localhost:3000/records/${id}`, { method: 'DELETE' });
    displayRecords();
  };

  // Generate and send receipt
  document.getElementById('generateReceipt').addEventListener('click', async () => {
    const template = document.getElementById('receiptTemplate').value;
    const customerPhone = document.getElementById('recordCustomer').value;
    const customers = await fetchData('customers');
    const customer = customers.find(c => c.phone === customerPhone);
    const productName = document.getElementById('recordProduct').value;
    const products = await fetchData('products');
    const product = products.find(p => p.name === productName);
    const quantity = parseFloat(document.getElementById('recordQuantity').value) || 0;
    const date = document.getElementById('recordDate').value || new Date().toISOString().split('T')[0];
    const total = (quantity * (product ? product.rate : 0)).toFixed(2);

    const receipt = template
      .replace('{customer}', customer ? customer.name : '')
      .replace('{date}', date)
      .replace('{product}', productName)
      .replace('{quantity}', quantity)
      .replace('{total}', total);

    await fetch('http://localhost:3000/send-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerPhone, customerName: customer ? customer.name : '', receipt })
    });

    alert('Receipt sent to WhatsApp and Gmail!');
  });

  // Initialize
  updateDropdowns();
  displayRecords();
});# website-one-
