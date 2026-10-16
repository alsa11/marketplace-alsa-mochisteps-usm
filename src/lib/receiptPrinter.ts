// Thermal Receipt Printer Utility for Mochi Steps POS
// Resolves blank print issue by generating a dedicated, isolated print container in document.body

export interface ReceiptData {
  orderNumber: string;
  receiptNumber?: string;
  createdAt: string;
  cashierName?: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    name: string;
    size: number;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: string;
  cashReceived?: number;
  cashChange?: number;
  notes?: string;
  paperWidth?: '58mm' | '80mm';
}

export function formatReceiptText(data: ReceiptData): string {
  const line = '--------------------------------';
  const doubleLine = '================================';

  const lines: string[] = [];
  lines.push('          MOCHI STEPS          ');
  lines.push('   Your Everyday Steps, Style   ');
  lines.push('    Workshop: Solo, Jawa Tengah ');
  lines.push('       WA CS: 0819456732451     ');
  lines.push(doubleLine);
  lines.push(`No. Struk : ${data.receiptNumber || data.orderNumber}`);
  lines.push(`Tanggal   : ${new Date(data.createdAt).toLocaleString('id-ID')}`);
  lines.push(`Kasir     : ${data.cashierName || 'Kasir Mochi Steps'}`);
  lines.push(`Pelanggan : ${data.customerName}`);
  if (data.customerPhone && data.customerPhone !== '-') {
    lines.push(`No. Telp  : ${data.customerPhone}`);
  }
  lines.push(line);

  data.items.forEach((item) => {
    lines.push(item.name);
    const qtyPrice = `Size ${item.size} x${item.quantity} @${item.price.toLocaleString('id-ID')}`;
    const itemTotal = `Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`;
    const spaceCount = Math.max(1, 32 - qtyPrice.length - itemTotal.length);
    lines.push(`${qtyPrice}${' '.repeat(spaceCount)}${itemTotal}`);
  });

  lines.push(line);
  lines.push(`Subtotal   : Rp ${data.subtotal.toLocaleString('id-ID')}`);
  if (data.discountAmount && data.discountAmount > 0) {
    lines.push(`Diskon     : -Rp ${data.discountAmount.toLocaleString('id-ID')}`);
  }
  lines.push(`TOTAL      : Rp ${data.totalAmount.toLocaleString('id-ID')}`);
  lines.push(`Metode     : ${data.paymentMethod}`);
  if (data.cashReceived && data.cashReceived > 0) {
    lines.push(`Bayar Tunai: Rp ${data.cashReceived.toLocaleString('id-ID')}`);
    lines.push(`Kembalian  : Rp ${(data.cashChange || 0).toLocaleString('id-ID')}`);
  }

  lines.push(doubleLine);
  lines.push('   ✨ Garansi Tukar Size 7 Hari ✨  ');
  lines.push(' Simpan struk ini sbg bukti sah ');
  lines.push('   Instagram: @mochisteps.id    ');
  lines.push('      Terima Kasih Banyak! 🌸   ');

  return lines.join('\n');
}

export function generateReceiptInnerHtml(data: ReceiptData, is58mm: boolean): string {
  const fontBase = is58mm ? '11px' : '12px';

  const itemsHtml = data.items
    .map(
      (item) => `
      <div style="margin-bottom: 5px; font-family: 'Courier New', Courier, monospace; color: #000000;">
        <div style="font-weight: bold; word-break: break-word; font-size: ${fontBase}; color: #000000;">${item.name}</div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 10px; color: #000000;">
          <span>Size ${item.size} x ${item.quantity} @ Rp ${item.price.toLocaleString('id-ID')}</span>
          <span style="font-weight: bold; color: #000000;">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
        </div>
      </div>`
    )
    .join('');

  const discountHtml =
    data.discountAmount && data.discountAmount > 0
      ? `<div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; color: #000000;">
          <span>Diskon Promosi:</span>
          <span>-Rp ${data.discountAmount.toLocaleString('id-ID')}</span>
        </div>`
      : '';

  const cashInfoHtml =
    data.cashReceived && data.cashReceived > 0
      ? `<div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px; color: #000000;">
          <span>Bayar Tunai:</span>
          <span>Rp ${data.cashReceived.toLocaleString('id-ID')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; color: #000000;">
          <span>Kembalian:</span>
          <span>Rp ${(data.cashChange || 0).toLocaleString('id-ID')}</span>
        </div>`
      : '';

  return `
    <div style="text-align: center; font-family: 'Courier New', Courier, monospace; line-height: 1.35; padding: 2px; color: #000000; background: #ffffff;">
      <div style="font-size: 15px; font-weight: 900; letter-spacing: 1px; color: #000000;">MOCHI STEPS</div>
      <div style="font-size: 10px; color: #000000;">Your Everyday Steps, Your Style</div>
      <div style="font-size: 9px; color: #000000;">Workshop: Solo, Jawa Tengah</div>
      <div style="font-size: 9px; color: #000000;">WA CS: 0819456732451</div>
      
      <div style="border-top: 1.5px solid #000000; margin: 6px 0;"></div>

      <div style="font-size: 10px; text-align: left; line-height: 1.4; color: #000000;">
        <div style="display: flex; justify-content: space-between;">
          <span>No. Struk:</span>
          <span style="font-weight: bold;">${data.receiptNumber || data.orderNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Tanggal:</span>
          <span>${new Date(data.createdAt).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Kasir:</span>
          <span>${data.cashierName || 'Kasir Mochi Steps'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Pelanggan:</span>
          <span style="font-weight: bold;">${data.customerName}</span>
        </div>
        ${
          data.customerPhone && data.customerPhone !== '-'
            ? `<div style="display: flex; justify-content: space-between;">
                <span>No Telp:</span>
                <span>${data.customerPhone}</span>
              </div>`
            : ''
        }
      </div>

      <div style="border-top: 1px dashed #000000; margin: 6px 0;"></div>

      <div style="text-align: left;">
        ${itemsHtml}
      </div>

      <div style="border-top: 1px dashed #000000; margin: 6px 0;"></div>

      <div style="text-align: left; font-size: 11px; line-height: 1.4; color: #000000;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>Rp ${data.subtotal.toLocaleString('id-ID')}</span>
        </div>
        ${discountHtml}
        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 13px; margin-top: 3px; border-top: 1.5px solid #000000; padding-top: 3px; color: #000000;">
          <span>TOTAL:</span>
          <span>Rp ${data.totalAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div style="border-top: 1px dashed #000000; margin: 6px 0;"></div>

      <div style="text-align: left; font-size: 10px; line-height: 1.4; color: #000000;">
        <div style="display: flex; justify-content: space-between;">
          <span>Metode Bayar:</span>
          <span style="font-weight: bold;">${data.paymentMethod}</span>
        </div>
        ${cashInfoHtml}
      </div>

      <div style="border-top: 1.5px solid #000000; margin: 6px 0;"></div>

      <div style="font-size: 9px; color: #000000; line-height: 1.4; margin-top: 4px;">
        <div style="font-weight: bold;">✨ Garansi Tukar Ukuran 7 Hari ✨</div>
        <div>Simpan struk fisik ini sebagai bukti sah</div>
        <div>Instagram: @mochisteps.id</div>
        <div style="font-weight: bold; margin-top: 4px;">Terima Kasih Telah Belanja! 🌸</div>
      </div>
    </div>
  `;
}

export function printThermalReceipt(data: ReceiptData): void {
  const is58mm = data.paperWidth !== '80mm';
  const receiptHtml = generateReceiptInnerHtml(data, is58mm);

  // 1. Always update #thermal-print-container in DOM as dedicated receipt container
  const containerId = 'thermal-print-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  container.className = is58mm ? 'paper-58mm' : 'paper-80mm';
  container.setAttribute('aria-hidden', 'true');
  container.innerHTML = receiptHtml;

  // 2. Add print indicator class on body
  document.body.classList.add('is-printing-thermal');

  // Clean up when print dialog closes
  const cleanup = () => {
    document.body.classList.remove('is-printing-thermal');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);

  // 3. Trigger native window.print() synchronously to preserve user activation inside iframe
  try {
    window.focus();
    window.print();
  } catch (err) {
    console.warn('Thermal print exception:', err);
  } finally {
    // Safety cleanup in case afterprint does not fire
    setTimeout(cleanup, 1200);
  }
}

