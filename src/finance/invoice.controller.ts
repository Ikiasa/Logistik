import { Controller, Get, Param, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { Roles, UserRole } from '../common/auth/roles.decorator';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('finance/invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FINANCE, UserRole.SUPER_ADMIN, UserRole.AUDITOR)
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Get(':id/pdf')
    async getInvoicePDF(
        @Param('id') id: string,
        @Res() res: Response,
        @CurrentUser() user: any
    ) {
        const invoice = await this.invoiceService.getInvoiceById(user.tenantId, id);

        if (!invoice || !invoice.pdf_path) {
            throw new NotFoundException('Invoice or PDF not found');
        }

        if (!fs.existsSync(invoice.pdf_path)) {
            throw new NotFoundException('PDF file missing on server');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);

        const fileStream = fs.createReadStream(invoice.pdf_path);
        fileStream.pipe(res);
    }

    @Get()
    async listInvoices(@CurrentUser() user: any) {
        // Implement list logic in service or here
        return []; // Mocked for now
    }
}
