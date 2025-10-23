const pdf = require('html-pdf');
const util = require('util');

const generateInvoiceHtml = (order, user) => {
    const itemsTable = order.orderItems.map(item => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.qty}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${(item.qty * item.price).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #333;">INVOICE</h1>
                <p style="font-size: 14px; color: #555;">Invoice #: ${order._id}</p>
                <p style="font-size: 14px; color: #555;">Date: ${new Date(order.paidAt).toLocaleDateString()}</p>
                <h2 style="font-size: 24px; color: #007BFF; margin-top: 20px;">Mobile Mania</h2>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div style="width: 48%;">
                    <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Billed To:</h2>
                    <p style="font-size: 14px; line-height: 1.5;">${user.firstName} ${user.lastName || ''}</p>
                    <p style="font-size: 14px; line-height: 1.5;">${user.email}</p>
                </div>
                <div style="width: 48%;">
                    <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Shipped To:</h2>
                    <p style="font-size: 14px; line-height: 1.5;">${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
                    <p style="font-size: 14px; line-height: 1.5;">${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>
                </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Quantity</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Unit Price</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsTable}
                </tbody>
            </table>
            <div style="text-align: right; font-size: 16px;">
                <p style="font-weight: bold; padding: 5px;">Subtotal: ₹${(order.totalPrice * 0.9).toFixed(2)}</p>
                <p style="font-weight: bold; padding: 5px;">Taxes: ₹${(order.totalPrice * 0.1).toFixed(2)}</p>
                <p style="font-weight: bold; padding: 5px; border-top: 1px solid #ddd;">Grand Total: ₹${order.totalPrice.toFixed(2)}</p>
            </div>
        </div>
    `;
};

const createInvoicePdf = async (order, user) => {
    try {
        const html = generateInvoiceHtml(order, user);
        const options = {
            format: 'A4',
        };
        const pdfInstance = pdf.create(html, options);

        const buffer = await util.promisify(pdfInstance.toBuffer.bind(pdfInstance))();

        if (buffer && buffer.length > 0) {
            return buffer;
        } else {
            throw new Error("PDF generation resulted in an empty buffer.");
        }

    } catch (error) {
        console.error('ERROR in createInvoicePdf:', error.message);
        return null;
    }
};

module.exports = { createInvoicePdf };