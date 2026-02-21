
import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { TasksService, TaskStatus } from './tasks.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';

@Controller('api/drivers/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    async getMyTasks(@CurrentUser() user: any) {
        return this.tasksService.getDriverTasks(user.id, user.tenantId);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: TaskStatus,
        @CurrentUser() user: any
    ) {
        return this.tasksService.updateTaskStatus(id, status, user.tenantId);
    }

    @Post(':id/assign')
    async assignMe(
        @Param('id') id: string,
        @CurrentUser() user: any
    ) {
        return this.tasksService.assignDriver(id, user.id, user.tenantId);
    }
}
