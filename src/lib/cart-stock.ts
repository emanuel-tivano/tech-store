export function getRemainingProductStock(stock: number, quantityInCart = 0) {
  return Math.max(stock - Math.max(quantityInCart, 0), 0);
}
