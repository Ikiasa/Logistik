import { Controller, Post, Get, Body, Res, HttpStatus, UseGuards, UseInterceptors } from "@nestjs/common";
import { Response } from "express";
import { OrdersServiceV2 } from "./orders.service.v2";
import { CreateOrderDtoV2 } from "./dto/create-order.v2.dto";
import { AuthGuard } from "@nestjs/passport";
import { TenantInterceptor } from "../common/interceptors/tenant.interceptor";

@Controller("v2/orders")
@UseGuards(AuthGuard('jwt-mock'))
@UseInterceptors(TenantInterceptor)
export class OrdersControllerV2 {
  constructor(private readonly ordersService: OrdersServiceV2) { }

  @Get()
  async findAll(@Res() res: Response) {
    try {
      const orders = await this.ordersService.findAll();
      return res.status(HttpStatus.OK).json(orders);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: error.message,
      });
    }
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDtoV2, @Res() res: Response) {
    // Idempotency Check would typically be a guard or middleware
    // e.g. @UseGuards(IdempotencyGuard)

    try {
      const order = await this.ordersService.create_v2(createOrderDto);

      return res.status(HttpStatus.CREATED).json({
        status: "success",
        data: order,
      });
    } catch (error) {
      // Error handling middleware usually catches this, but for explicit demo:
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

// Separate Controller for V1 to show deprecation
import { DeprecationInterceptor } from "../common/interceptors/deprecation.interceptor";

@Controller("v1/orders")
@UseInterceptors(DeprecationInterceptor)
export class OrdersControllerV1 {
  constructor(private readonly ordersService: OrdersServiceV2) { }

  @Post()
  async create(@Body() legacyBody: any, @Res() res: Response) {
    // Enforce Deprecation Header
    res.setHeader(
      "Warning",
      '299 - "Free-text address is deprecated. Switch to /v2 structure by 2026-12-31."',
    );

    // Call internal v1 logic or adapter to v2
    return res
      .status(HttpStatus.CREATED)
      .json({ status: "success", warning: "Check Headers" });
  }
}
