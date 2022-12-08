export type Product = {
  id: string,
  title: string,
  description: string,
  price: number,
  image: string
};


export type CartItem = {
  product_id: string,
  cart_id: string,
  count: number,
}

export type Cart = {
  id: string,
  items: CartItem[],
}
