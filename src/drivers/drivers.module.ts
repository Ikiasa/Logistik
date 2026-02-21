
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { FinanceModule } from '../finance/finance.module';

@Module({
    imports: [FinanceModule],
    providers: [TasksService],
    controllers: [TasksController],
    exports: [TasksService]
})
export class DriversModule { }
