import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    ISSUED = 'ISSUED',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE'
}

@Injectable()
export class InvoiceService {
    private readonly logger = new Logger(InvoiceService.name);
    private readonly STORAGE_PATH = path.join(process.cwd(), 'storage', 'invoices');

    constructor(private db: DatabaseService) {
        // Ensure storage directory exists
        if (!fs.existsSync(this.STORAGE_PATH)) {
            fs.mkdirSync(this.STORAGE_PATH, { recursive: true });
        }
    }

    async createInvoiceForShipment(tenantId: string, shipmentId: string) {
        this.logger.log(`Generating invoice for shipment: ${shipmentId}`);

        // 1. Get shipment and order details
        const shipmentRes = await this.db.query(
            `SELECT s.*, o.total_amount, o.total_currency 
             FROM shipments s
             JOIN orders o ON s.order_id = o.id
             WHERE s.id = $1 AND s.tenant_id = $2`,
            [shipmentId, tenantId]
        );

        if (shipmentRes.length === 0) {
            throw new NotFoundException(`Shipment ${shipmentId} not found`);
        }

        const shipment = shipmentRes[0];

        // 2. Generate unique invoice number
        const invoiceNoRes = await this.db.query(
            `SELECT generate_invoice_number($1) as inv_no`,
            [tenantId]
        );
        const invoiceNumber = invoiceNoRes[0].inv_no;

        // 3. Create invoice record
        const invoiceRes = await this.db.query(
            `INSERT INTO invoices (
                tenant_id, shipment_id, invoice_number, 
                total_amount, total_currency, status, due_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                tenantId, shipmentId, invoiceNumber,
                shipment.total_amount, shipment.total_currency,
                InvoiceStatus.ISSUED, // Auto issue when generated from completed shipment
                new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days due date
            ]
        );

        const invoice = invoiceRes[0];

        // 4. Generate PDF asynchronously
        await this.generatePDF(invoice, shipment);

        return invoice;
    }

    private async generatePDF(invoice: any, shipment: any) {
        const filePath = path.join(this.STORAGE_PATH, `${invoice.invoice_number}.pdf`);
        const doc = new PDFDocument({ margin: 50 });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fillColor('#444444')
            .fontSize(20)
            .text('LOGISTIK_ERP', 50, 50)
            .fontSize(10)
            .text('Premium Logistics Solutions', 50, 75)
            .text(`Date: ${new Date().toLocaleDateString()}`, 200, 50, { align: 'right' })
            .text(`Invoice No: ${invoice.invoice_number}`, 200, 65, { align: 'right' })
            .moveDown();

        // Line
        doc.strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, 100)
            .lineTo(550, 100)
            .stroke();

        // Customer Info (Mocked from order data usually)
        doc.fontSize(12)
            .text('Bill To:', 50, 130)
            .fontSize(10)
            .text(`Shipment ID: ${shipment.id}`, 50, 150)
            .text(`Order ID: ${shipment.order_id}`, 50, 165)
            .moveDown();

        // Table Header
        const tableTop = 220;
        doc.font('Helvetica-Bold')
            .text('Description', 50, tableTop)
            .text('Amount', 400, tableTop, { align: 'right' });

        doc.strokeColor('#eeeeee')
            .moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();

        // Line Item
        doc.font('Helvetica')
            .text('Logistic Logistics & Delivery Services', 50, tableTop + 30)
            .text(`${invoice.total_currency} ${Number(invoice.total_amount).toLocaleString()}`, 400, tableTop + 30, { align: 'right' });

        // Total
        doc.strokeColor('#aaaaaa')
            .moveTo(50, tableTop + 60)
            .lineTo(550, tableTop + 60)
            .stroke();

        doc.font('Helvetica-Bold')
            .text('TOTAL', 50, tableTop + 75)
            .text(`${invoice.total_currency} ${Number(invoice.total_amount).toLocaleString()}`, 400, tableTop + 75, { align: 'right' });

        // Footer
        doc.fontSize(8)
            .fillColor('#888888')
            .text('Thank you for choosing Logistik ERP. Payment is due within 14 days.', 50, 700, { align: 'center', width: 500 });

        doc.end();

        return new Promise((resolve) => {
            stream.on('finish', async () => {
                // Update pdf_path in database
                await this.db.query(
                    `UPDATE invoices SET pdf_path = $1 WHERE id = $2`,
                    [filePath, invoice.id]
                );
                resolve(filePath);
            });
        });
    }

    async getInvoiceById(tenantId: string, invoiceId: string) {
        const result = await this.db.query(
            `SELECT * FROM invoices WHERE id = $1 AND tenant_id = $2`,
            [invoiceId, tenantId]
        );
        return result[0];
    }
}
