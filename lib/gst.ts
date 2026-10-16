export type GstBands = {
  gstThreshold: number;
  gstLowRate: number;
  gstHighRate: number;
};

/** Percent GST for a unit price in integer rupees. At or under the threshold uses the low rate. */
export function gstRateForPrice(priceRupees: number, bands: GstBands): number {
  return priceRupees <= bands.gstThreshold ? bands.gstLowRate : bands.gstHighRate;
}

/** GST in integer rupees for one unit (rounded to the nearest rupee). */
export function gstAmount(priceRupees: number, bands: GstBands): number {
  const rate = gstRateForPrice(priceRupees, bands);
  return Math.round((priceRupees * rate) / 100);
}
