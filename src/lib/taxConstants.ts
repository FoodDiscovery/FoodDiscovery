/** Sales tax rate (9.75%). Change here to adjust tax everywhere (checkout, order detail, order history cards). */
export const SALES_TAX_RATE = 0.0975;

/** Total price including tax from a subtotal (e.g. order total_amount). */
export function totalWithTax(subtotal: number): number {
  return subtotal * (1 + SALES_TAX_RATE);
}
