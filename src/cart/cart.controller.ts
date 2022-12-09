import { Controller, Get, Delete, Put, Body, Req, Post, UseGuards, HttpStatus } from '@nestjs/common';

// import { BasicAuthGuard, JwtAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest } from '../shared';

import { CartService } from './services';
import { orderStatus } from '../order';

const MOCKED_USER_ID = '594b7bf3-c3f3-472e-a4b6-f0b577ac0e0f';
const MOCKED_USER_ID2 = '11178a6d-83f6-42b5-939e-1b713a5b61fd';

@Controller('profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) { }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart() {
    console.log("Getting user cart");
    const cart = await this.cartService.findOrCreateByUserId(MOCKED_USER_ID);

    console.log("Getting user cart");

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { ...cart },
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() body) { // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(MOCKED_USER_ID, body);

    console.log("Update user cart req:", req, body);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        ...cart
      }
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Delete()
  async clearUserCart(@Req() req: AppRequest) {
    console.log("Delete req", req);
    await this.cartService.removeByUserId(MOCKED_USER_ID);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() body) {
    const userId = MOCKED_USER_ID;
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      const statusCode = HttpStatus.BAD_REQUEST;
      req.statusCode = statusCode

      return {
        statusCode,
        message: 'Cart is empty',
      }
    }

    const { id: cartId } = cart;
    const { payment, delivery, comments } = body;
    const order = this.orderService.create({
      userId,
      cartId,
      total: 100,
      payment,
      delivery,
      comments,
      status: orderStatus.progress,
    });
    this.cartService.removeByUserId(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { order }
    }
  }
}
