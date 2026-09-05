/**
 * Professional Flipkart-Style Tax Invoice Generator for NIVASHOP Orders
 */

export interface InvoiceItem {
  id?: string;
  name: string;
  category?: string;
  fileName?: string;
  productCode?: string;
  hsnCode?: string;
  technology?: string;
  material?: string;
  color?: string;
  layerHeight?: string;
  infill?: number | string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DynamicInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  requestId?: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'cod' | string;
  paymentTxnId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  billingAddress: string;
  shippingAddress: string;
  shippingPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  shippingFee: number;
  grandTotal: number;
  companyDetails?: {
    name?: string;
    logoUrl?: string;
    addressLine1?: string;
    addressLine2?: string;
    address?: string;
    gstin?: string;
    pan?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
}

function numberToWordsINR(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const val = Math.floor(num);
  if (val === 0) return 'Zero Rupees Only';

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  };

  let str = '';
  const crore = Math.floor(val / 10000000);
  const lakh = Math.floor((val % 10000000) / 100000);
  const thousand = Math.floor((val % 100000) / 1000);
  const hundred = Math.floor((val % 1000) / 100);
  const rest = val % 100;

  if (crore) str += inWords(crore) + 'Crore ';
  if (lakh) str += inWords(lakh) + 'Lakh ';
  if (thousand) str += inWords(thousand) + 'Thousand ';
  if (hundred) str += inWords(hundred) + 'Hundred ';
  if (rest) str += inWords(rest);

  return 'Rupees ' + str.trim() + ' Only';
}

export function generateInvoiceHTML(data: DynamicInvoiceData): string {
  const company = {
    name: 'NIVASHOP',
    logoUrl: typeof window !== 'undefined' ? `${window.location.origin}/logobgg.png` : '/logobgg.png',
    addressLine1: 'Indrapuri',
    addressLine2: 'Bhopal, Madhya Pradesh - 462022',
    gstin: '27AAAAA0000A1Z5',
    email: 'nivashop.in@gmail.com',
    phone: '+91 9131450933',
    website: 'www.nivashop.in',
    ...data.companyDetails,
  };

  const isPaid = (data.paymentStatus || '').toLowerCase() === 'paid';
  const itemsSubtotal = data.items.reduce((acc, item) => acc + (Number(item.totalPrice) || (Number(item.unitPrice) * Number(item.quantity))), 0);
  const formattedSubtotal = itemsSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedGrandTotal = data.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amountInWords = numberToWordsINR(data.grandTotal);

  // Check if billing and shipping addresses are identical
  const cleanBill = (data.billingAddress || '').trim().toLowerCase();
  const cleanShip = (data.shippingAddress || '').trim().toLowerCase();
  const isSameAddress = !data.shippingAddress || cleanBill === cleanShip || cleanShip.includes(cleanBill) || cleanBill.includes(cleanShip);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tax Invoice - ${data.orderNumber.replace('NEVA-', 'NIVA-')} | NIVASHOP</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: "Inter", Arial, sans-serif;
      background: #f4f5f8;
      color: #111827;
      padding: 30px 15px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .invoice {
      width: 100%;
      max-width: 900px;
      margin: auto;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
    }

    /* =========================
       CLEAN BALANCED HEADER
    ========================== */

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 30px;
      padding: 32px 40px 24px;
      border-bottom: 2px solid #e2e8f0;
      background: #ffffff;
    }

    .brand-left-container {
      display: flex;
      align-items: center;
      gap: 22px;
    }

    .brand-logo-img {
      height: 56px;
      width: auto;
      object-fit: contain;
    }

    .company-details {
      font-size: 11px;
      line-height: 1.55;
      color: #4b5563;
      border-left: 2px solid #f1f5f9;
      padding-left: 20px;
    }

    .company-address-line {
      white-space: nowrap;
    }

    .company-address-line.gst-line {
      font-weight: 700;
      color: #374151;
      margin-top: 1px;
    }

    .invoice-heading {
      text-align: right;
      min-width: 220px;
    }

    .invoice-heading h1 {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #0f172a;
    }

    .invoice-heading .receipt {
      font-size: 11px;
      letter-spacing: 5px;
      color: #64748b;
      font-weight: 800;
      margin-top: 2px;
    }

    /* =========================
       ORDER METADATA SUMMARY BAR
    ========================== */

    .order-summary-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 18px 40px;
    }

    .meta-box label {
      display: block;
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      margin-bottom: 3px;
    }

    .meta-box value {
      display: block;
      font-size: 13px;
      font-weight: 800;
      color: #111827;
      font-family: inherit;
    }

    .meta-box subval {
      display: block;
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }

    .payment-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 4px;
      padding: 3px 9px;
      border-radius: 20px;
      background: ${isPaid ? '#ecfdf5' : '#fffbeb'};
      border: 1px solid ${isPaid ? '#bbf7d0' : '#fef3c7'};
      color: ${isPaid ? '#15803d' : '#b45309'};
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .payment-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${isPaid ? '#22c55e' : '#f59e0b'};
    }

    /* =========================
       CUSTOMER ADDRESS SECTION
    ========================== */

    .customer-section {
      padding: 24px 40px;
    }

    .customer-section.grid-two {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    .customer-box {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 18px 22px;
      background: #fafafa;
    }

    .box-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .box-label {
      font-size: 10px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .same-addr-badge {
      font-size: 10px;
      font-weight: 700;
      color: #16a34a;
      background: #dcfce7;
      border: 1px solid #bbf7d0;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .customer-name {
      font-size: 15px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 8px;
    }

    .customer-info {
      font-size: 11px;
      line-height: 1.6;
      color: #4b5563;
    }

    .customer-info.flex-info {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 20px;
      align-items: start;
    }

    /* =========================
       ITEMS TABLE
    ========================== */

    .items-section {
      padding: 0 40px;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }

    thead {
      background: #f1f5f9;
      color: #334155;
      border-bottom: 2px solid #cbd5e1;
    }

    th {
      padding: 12px 14px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
    }

    th:first-child {
      width: 5%;
      text-align: center;
      border-top-left-radius: 11px;
    }

    th:nth-child(2) {
      width: 32%;
    }

    th:nth-child(3) {
      width: 12%;
    }

    th:nth-child(4) {
      width: 25%;
    }

    th:nth-child(5) {
      width: 8%;
      text-align: center;
    }

    th:nth-child(6),
    th:nth-child(7) {
      width: 9%;
      text-align: right;
    }

    th:last-child {
      border-top-right-radius: 11px;
    }

    td {
      padding: 14px 14px;
      font-size: 11px;
      border-bottom: 1px solid #edf0f3;
      vertical-align: middle;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .number {
      text-align: center;
      font-weight: 700;
      color: #64748b;
    }

    .product-name {
      font-size: 12px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 4px;
    }

    .file-code {
      display: inline-block;
      padding: 2px 6px;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      background: #f8fafc;
      color: #475569;
      font-family: monospace;
      font-size: 9px;
      margin-top: 2px;
    }

    .specifications {
      font-size: 10px;
      line-height: 1.6;
      color: #64748b;
    }

    .specifications span {
      display: block;
    }

    .qty {
      text-align: center;
      font-weight: 700;
    }

    .price,
    .amount {
      text-align: right;
      white-space: nowrap;
    }

    .amount {
      font-weight: 800;
      color: #111827;
    }

    /* =========================
       CLEAN TOTALS
    ========================== */

    .bottom-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 30px;
      padding: 28px 40px;
    }

    .thank-you {
      flex: 1;
    }

    .thank-you-title {
      color: #0f172a;
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 4px;
    }

    .amount-words {
      font-size: 11px;
      font-weight: 700;
      color: #374151;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 8px;
      margin-top: 6px;
      display: inline-block;
    }

    .totals {
      width: 300px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #475569;
      padding: 3px 6px;
      font-weight: 600;
    }

    .grand-total {
      margin-top: 6px;
      padding: 12px 16px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      color: #0f172a;
      font-size: 16px;
      font-weight: 900;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    /* =========================
       FOOTER & AUTHORIZED SIGNATORY
    ========================== */

    .footer {
      margin: 0 40px 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 30px;
    }

    .footer-section {
      flex: 1;
    }

    .footer-title {
      color: #475569;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      margin-bottom: 6px;
    }

    .footer-text {
      font-size: 9px;
      color: #94a3b8;
      line-height: 1.6;
    }

    .signatory-box {
      text-align: right;
      min-width: 220px;
    }

    .signatory-stamp {
      display: inline-block;
      border: 1.5px dashed #6d28d9;
      padding: 6px 14px;
      border-radius: 8px;
      background: #f5f3ff;
      color: #6d28d9;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .website {
      color: #6d28d9;
      font-weight: 700;
      display: block;
      font-size: 10px;
    }

    /* =========================
       PRINT BUTTON
    ========================== */

    .print-container {
      text-align: center;
      margin-top: 25px;
      margin-bottom: 30px;
    }

    .print-btn {
      border: none;
      background: #6d28d9;
      color: white;
      padding: 12px 30px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(109, 40, 217, 0.35);
      transition: all 0.2s ease;
    }

    .print-btn:hover {
      background: #5b21b6;
      transform: translateY(-1px);
    }

    /* =========================
       RESPONSIVE & PRINT MEDIA
    ========================== */

    @media (max-width: 700px) {
      body {
        padding: 10px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        padding: 25px 20px;
      }

      .brand-left-container {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .company-details {
        border-left: none;
        padding-left: 0;
      }

      .order-summary-bar {
        grid-template-columns: 1fr 1fr;
        padding: 15px 20px;
      }

      .invoice-heading {
        text-align: left;
      }

      .customer-section.grid-two {
        grid-template-columns: 1fr;
      }

      .customer-info.flex-info {
        grid-template-columns: 1fr;
      }

      .customer-section {
        padding: 20px;
      }

      .items-section {
        padding: 0 20px;
        overflow-x: auto;
      }

      .bottom-section {
        flex-direction: column;
        padding: 20px;
      }

      .totals {
        width: 100%;
      }

      .footer {
        margin: 0 20px 25px;
        flex-direction: column;
        align-items: flex-start;
      }

      .signatory-box {
        text-align: left;
        margin-top: 15px;
      }
    }

    @media print {
      @page {
        size: A4;
        margin: 10mm;
      }

      body {
        padding: 0;
        background: white;
      }

      .invoice {
        max-width: none;
        width: 100%;
        border: none;
        border-radius: 0;
        box-shadow: none;
      }

      .print-container {
        display: none;
      }
    }
  </style>
</head>

<body>

  <div class="invoice">

    <!-- ================= CLEAN BALANCED HEADER ================= -->
    <header class="header">
      <div class="brand-left-container">
        ${company.logoUrl ? `<img src="${company.logoUrl}" alt="NIVASHOP Logo" class="brand-logo-img" />` : ''}

        <div class="company-details">
          <div class="company-address-line">${company.addressLine1 || 'Indrapuri'}</div>
          <div class="company-address-line">${company.addressLine2 || 'Bhopal, Madhya Pradesh - 462022'}</div>
          <div class="company-address-line gst-line">GSTIN: ${company.gstin}</div>
          <div class="company-address-line">${company.email} &bull; ${company.phone}</div>
        </div>
      </div>

      <div class="invoice-heading">
        <h1>TAX INVOICE</h1>
        <div class="receipt">/ BILL OF SUPPLY</div>
      </div>
    </header>

    <!-- ================= ORDER METADATA SUMMARY BAR ================= -->
    <section class="order-summary-bar">
      <div class="meta-box">
        <label>Order ID</label>
        <value>${data.orderNumber.replace('NEVA-', 'NIVA-')}</value>
        ${data.razorpayOrderId ? `<subval>RZP Order ID: <strong>${data.razorpayOrderId}</strong></subval>` : (data.requestId ? `<subval>Request: <strong>${data.requestId}</strong></subval>` : '')}
      </div>

      <div class="meta-box">
        <label>Invoice Number</label>
        <value>${data.invoiceNumber}</value>
        <subval>Date: <strong>${data.invoiceDate}</strong></subval>
      </div>

      <div class="meta-box">
        <label>Payment Details</label>
        <value>${data.paymentMethod}</value>
        <subval>${data.razorpayPaymentId ? 'Payment ID: <strong>' + data.razorpayPaymentId + '</strong>' : (data.paymentTxnId ? 'Txn ID: ' + data.paymentTxnId : 'Verified Online')}</subval>
      </div>

      <div class="meta-box">
        <label>Payment Status</label>
        <div>
          <span class="payment-status">
            <span class="payment-dot"></span>
            ${data.paymentStatus.toUpperCase()}
          </span>
        </div>
      </div>
    </section>

    <!-- ================= OPTIMIZED CUSTOMER & ADDRESS SECTION ================= -->
    ${isSameAddress ? `
    <section class="customer-section">
      <div class="customer-box">
        <div class="box-header-row">
          <div class="box-label">Billed To & Shipped To</div>
          <span class="same-addr-badge">✓ Primary Delivery Location</span>
        </div>
        <div class="customer-name">${data.customerName}</div>
        <div class="customer-info flex-info">
          <div>
            <strong style="color: #111827;">Delivery Address:</strong><br>
            ${data.billingAddress.replace(/\n/g, '<br>')}
          </div>
          <div>
            <strong style="color: #111827;">Contact Info:</strong><br>
            Email: ${data.customerEmail}<br>
            Phone: ${data.customerPhone}
          </div>
        </div>
      </div>
    </section>
    ` : `
    <section class="customer-section grid-two">
      <div class="customer-box">
        <div class="box-label">Bill To (Buyer)</div>
        <div class="customer-name">${data.customerName}</div>
        <div class="customer-info">
          ${data.billingAddress.replace(/\n/g, '<br>')}<br><br>
          Email: ${data.customerEmail}<br>
          Phone: ${data.customerPhone}
        </div>
      </div>

      <div class="customer-box">
        <div class="box-label">Ship To (Destination)</div>
        <div class="customer-name">${data.customerName}</div>
        <div class="customer-info">
          ${data.shippingAddress.replace(/\n/g, '<br>')}<br><br>
          Phone: ${data.shippingPhone || data.customerPhone}
        </div>
      </div>
    </section>
    `}

    <!-- ================= ITEMS TABLE ================= -->
    <section class="items-section">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item & Product Details</th>
            <th>HSN / Code</th>
            <th>Specifications</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item, idx) => `
            <tr>
              <td class="number">${idx + 1}</td>
              <td>
                <div class="product-name">${item.name}</div>
                ${item.fileName ? `<div class="file-code">📄 ${item.fileName}</div>` : ''}
              </td>
              <td>
                <span class="file-code">${item.hsnCode || item.productCode || (item.id ? item.id.slice(0, 8) : `39269099`)}</span>
              </td>
              <td>
                <div class="specifications">
                  <span><strong>Category:</strong> ${item.category || ((item.name || '').toLowerCase().includes('iot') ? 'Smart IoT Electronics' : '3D Printed Articles')}</span>
                  ${item.technology ? `<span><strong>Tech:</strong> ${item.technology}</span>` : ''}
                  ${item.material ? `<span><strong>Material:</strong> ${item.material}</span>` : ''}
                  ${item.color ? `<span><strong>Color:</strong> ${item.color}</span>` : ''}
                  ${item.layerHeight ? `<span><strong>Height:</strong> ${item.layerHeight}</span>` : ''}
                  ${item.infill ? `<span><strong>Infill:</strong> ${item.infill}%</span>` : ''}
                </div>
              </td>
              <td class="qty">${item.quantity}</td>
              <td class="price">₹${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td class="amount">₹${item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>

    <!-- ================= CLEAN TOTALS ================= -->
    <section class="bottom-section">
      <div class="thank-you">
        <div class="thank-you-title">Thank you for choosing NIVASHOP!</div>
        <p style="font-size: 10px; color: #94a3b8;">
          We appreciate your business. Prices are inclusive of applicable taxes.
        </p>
        <div class="amount-words">
          Amount in Words: <strong>${amountInWords}</strong>
        </div>
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Items Subtotal:</span>
          <span>₹${formattedSubtotal}</span>
        </div>
        <div class="total-row">
          <span>Delivery Charge:</span>
          <span>${data.shippingFee > 0 ? `₹${data.shippingFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '<strong style="color: #059669; font-weight: 800;">FREE</strong>'}</span>
        </div>
        <div class="grand-total">
          <span>GRAND TOTAL</span>
          <span>₹${formattedGrandTotal}</span>
        </div>
      </div>
    </section>

    <!-- ================= FOOTER & AUTHORIZED SIGNATORY ================= -->
    <footer class="footer">
      <div class="footer-section">
        <div class="footer-title">Terms & Conditions</div>
        <div class="footer-text">
          • Goods once sold will not be taken back.<br>
          • Warranty applies only to manufacturing defects.<br>
          • This is a computer-generated tax invoice.
        </div>
      </div>

      <div class="signatory-box">

        <div class="footer-text">
          <strong>${company.name}</strong><br>
          <span class="website">${company.website}</span>
        </div>
      </div>
    </footer>
  </div>

  <div class="print-container">
    <button class="print-btn" onclick="window.print()">Save PDF</button>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;
}

export function openAndPrintInvoice(data: DynamicInvoiceData) {
  const htmlContent = generateInvoiceHTML(data);
  const printWindow = window.open('', '_blank', 'width=950,height=850');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
