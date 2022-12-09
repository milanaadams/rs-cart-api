import { Injectable } from '@nestjs/common';

import { Order, IncomingOrder } from '../models';

import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';

@Injectable()
export class OrderService {
  constructor(@InjectClient() private readonly pg: Client) {};
  private orders: Record<string, Order> = {}

  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await this.pg.query(`SELECT * FROM orders WHERE user_id=$1`, [userId]);
    return orders.rows;
  }

  async create(data: IncomingOrder): Promise<Order> {
    console.log('Create order data: ', data);
    const {userId, cartId, payment, delivery, comments, total} = data;

    const newOrder = await this.pg.query(`INSERT INTO orders
      (user_id, cartId, payment, delivery, comments, status, total) VALUES 
      ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, cartId, payment, delivery, comments, 'in progress', total]);

    console.log('New order: ', newOrder);

    return newOrder.rows[0];
  }
}
