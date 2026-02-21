import { Module } from '@nestjs/common';
import { CostEngineService } from './cost-engine.service';
import { CostController } from './cost.controller';
import { ProfitabilityService } from './profitability.service';
import { ProfitabilityController } from './profitability.controller';
import { InvoiceService } from './invoice.service';
import { ShipmentService } from './shipment.service';
import { InvoiceController } from './invoice.controller';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../common/auth/auth.module';
import { RateMatrixService } from './rate-matrix.service';
import { RateMatrixController } from './rate-matrix.controller';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
    imports: [CommonModule, AuthModule, TrackingModule],
    controllers: [ProfitabilityController, CostController, InvoiceController, RateMatrixController],
    providers: [ProfitabilityService, CostEngineService, InvoiceService, ShipmentService, RateMatrixService],
    exports: [InvoiceService, ShipmentService],
})
export class FinanceModule { }
