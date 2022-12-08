import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';

import { v4 } from 'uuid';

import { Cart, CartItem } from '../models';

@Injectable()
export class CartService {
  constructor(@InjectClient() private readonly pg: Client) {};

  async findByUserId(userId: string): Promise<Cart> {
    const carts = await this.pg.query(`SELECT * FROM carts WHERE user_id=$1`, [userId]);

    if (!carts.rows?.[0]?.id) {
      return null;
    }

    const cartId = carts.rows[0].id;

    console.log('User cart id: ', cartId)

    const cartItems = await this.pg.query(`SELECT * FROM cart_items WHERE cart_id=$1`, [cartId]);

    const userCart: Cart = {
      id: cartId,
      items: cartItems.rows
    }

    console.log('User cart data: ', userCart);

    return userCart;
  }

  async createByUserId(userId: string): Promise<Cart> {
    const date = new Date();
    const createdAtDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const id = v4();
    const userCart = await this.pg.query(`INSERT INTO carts
      (id, user_id, created_at, updated_at) VALUES 
      ($1, $2, $3, $4) RETURNING *`,
      [id, userId, createdAtDate, createdAtDate]);

    const newCart = {
      id: userCart.rows[0].id,
      items: []
    }

    return newCart;
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    console.log("User cart: ", userCart);

    if (userCart) {
      return userCart;
    }

    const newCart = await this.createByUserId(userId);

    console.log("New user cart: ", newCart);

    return newCart;
  }

  async updateByUserId(userId: string, { product_id, cart_id, count }: CartItem): Promise<Cart> {

    const { id } = await this.findOrCreateByUserId(userId);

    const existingProduct = await this.pg.query(`SELECT * FROM cart_items WHERE cart_id=$1 AND product_id=$2`, [cart_id, product_id]);

    if(count < 1 && existingProduct.rows?.[0]) {
      await this.pg.query(`DELETE FROM cart_items WHERE product_id=$1`, [product_id]);
    } else if (!existingProduct.rows?.[0]  && count > 0) {
      await this.pg.query(
        `INSERT INTO cart_items
        (cart_id, product_id, count) VALUES
        ($1, $2, $3)`,
        [cart_id, product_id, count]
      );
    } else {
      await this.pg.query(
        `UPDATE cart_items SET count = $1 WHERE cart_id = $2 AND product_id=$3`,
        [count, cart_id, product_id]
      );
    }

    const updatedCart = await this.findByUserId(userId);

    return updatedCart;
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.pg.query(`DELETE FROM carts WHERE user_id=$1`, [userId]);
  }

}
