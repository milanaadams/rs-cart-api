import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

import { ConfigModule } from '@nestjs/config';
import { PostgresModule } from 'nest-postgres';

import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PostgresModule.forRoot({
      host: process.env.PG_HOST,
      port: +process.env.PG_PORT,
      database: process.env.PG_DATABASE,
      user: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
    }),
    AuthModule,
    CartModule,
    OrderModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [],
})
export class AppModule {}
