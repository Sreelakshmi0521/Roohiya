const PDFDocument=require("pdfkit")
const fs=require("fs")
const path=require("path")
const Order=require("../../models/orderModel")
const getUserId = (req) => req.session.user?._id || req.session.user?.id;


exports.generateInvoice = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = getUserId(req);

        const order = await Order.findOne({ _id: orderId, userId })
            .populate('products.variantId')
            .populate('userId', 'name email');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4'
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(25).fillColor('#2c3e50').text('Roohiya', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#7f8c8d').text('elegant, affordable, and comfortable earrings for everyday wear.', { align: 'center' });
        
        doc.moveDown(2);
        doc.fontSize(20).fillColor('#e74c3c').text('TAX INVOICE', { align: 'center' });
        
        doc.moveDown(2);

        // Invoice details
        const invoiceTop = 150;
        
        // Left column - Invoice details
        doc.fontSize(10).fillColor('#2c3e50');
        doc.text('Invoice Number:', 50, invoiceTop);
        doc.font('Helvetica-Bold').text(order.orderId, 150, invoiceTop);
        doc.font('Helvetica');
        
        doc.text('Invoice Date:', 50, invoiceTop + 20);
        doc.text(new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }), 150, invoiceTop + 20);
        
        doc.text('Order Date:', 50, invoiceTop + 40);
        doc.text(new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }), 150, invoiceTop + 40);

        // Right column - Customer details
        doc.text('Bill To:', 350, invoiceTop);
        doc.font('Helvetica-Bold').text(order.shippingAddress.name, 350, invoiceTop + 15);
        doc.font('Helvetica');
        doc.text(order.shippingAddress.phone, 350, invoiceTop + 30);
        doc.text(order.shippingAddress.houseName, 350, invoiceTop + 45);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, 350, invoiceTop + 60);
        doc.text(`Pincode: ${order.shippingAddress.pincode}`, 350, invoiceTop + 75);

        // Draw line
        doc.moveDown(8);
        const lineY = doc.y;
        doc.strokeColor('#bdc3c7').lineWidth(1)
            .moveTo(50, lineY)
            .lineTo(550, lineY)
            .stroke();

        doc.moveDown(2);

        // Table header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold').fontSize(11);
        
        // Draw table header background
        doc.fillColor('#f8f9fa').rect(50, tableTop, 500, 25).fill();
        
        doc.fillColor('#2c3e50');
        doc.text('Item Description', 55, tableTop + 8);
        doc.text('Color', 250, tableTop + 8);
        doc.text('Qty', 330, tableTop + 8);
        doc.text('Price', 380, tableTop + 8);
        doc.text('Amount', 460, tableTop + 8);

        doc.font('Helvetica').fontSize(10).fillColor('#2c3e50');

        // Table rows
        let y = tableTop + 35;
        let totalAmount = 0;

        order.products.forEach((product, index) => {
            const itemTotal = product.price * product.quantity;
            totalAmount += itemTotal;

            // Alternate row background
            if (index % 2 === 0) {
                doc.fillColor('#f8f9fa').rect(50, y - 10, 500, 25).fill();
            }

            doc.fillColor('#2c3e50');
            doc.text(product.name, 55, y);
            doc.text(product.color || '-', 250, y);
            doc.text(product.quantity.toString(), 330, y);
            doc.text(`₹${product.price.toFixed(2)}`, 380, y);
            doc.text(`₹${itemTotal.toFixed(2)}`, 460, y);

            y += 25;
        });

        // Draw bottom line
        doc.strokeColor('#bdc3c7').lineWidth(1)
            .moveTo(50, y + 5)
            .lineTo(550, y + 5)
            .stroke();

        y += 25;

        // Calculate totals
        const tax = totalAmount * 0.05;
        const shipping = totalAmount > 599 ? 0 : 50;
        const discount = order.discount || 0;
        const grandTotal = totalAmount + tax + shipping - discount;

        // Summary section
        const summaryX = 350;
        
        doc.text('Subtotal:', summaryX, y);
        doc.text(`₹${totalAmount.toFixed(2)}`, 480, y, { align: 'right' });
        
        if (discount > 0) {
            y += 20;
            doc.fillColor('#27ae60').text('Discount:', summaryX, y);
            doc.text(`-₹${discount.toFixed(2)}`, 480, y, { align: 'right' });
            doc.fillColor('#2c3e50');
        }
        
        y += 20;
        doc.text('Shipping:', summaryX, y);
        doc.text(shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`, 480, y, { align: 'right' });
        
        y += 20;
        doc.text('Tax (5%):', summaryX, y);
        doc.text(`₹${tax.toFixed(2)}`, 480, y, { align: 'right' });
        
        y += 25;
        doc.strokeColor('#2c3e50').lineWidth(0.5)
            .moveTo(summaryX, y)
            .lineTo(550, y)
            .stroke();
        
        y += 15;
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#e74c3c');
        doc.text('Grand Total:', summaryX, y);
        doc.text(`₹${grandTotal.toFixed(2)}`, 480, y, { align: 'right' });

        // Footer
        doc.moveDown(8);
        doc.font('Helvetica').fontSize(9).fillColor('#7f8c8d');
        
        const footerY = doc.page.height - 100;
        
        doc.text('Thank you for your purchase!', 50, footerY, { align: 'center', width: 500 });
        doc.text('For any queries, contact us at:roohiya@gmail.com | +91 9876543210', 
            50, footerY + 15, { align: 'center', width: 500 });
        
        doc.text('This is a computer-generated invoice. No signature required.', 
            50, footerY + 35, { align: 'center', width: 500 });

        doc.end();

    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Error generating invoice');
    }
};