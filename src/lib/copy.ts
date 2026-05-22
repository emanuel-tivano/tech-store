export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function formatProductCount(count: number) {
  return `${count} ${pluralize(count, 'producto')}`;
}

export function formatProductAvailability(count: number) {
  return `${formatProductCount(count)} ${pluralize(count, 'disponible')}`;
}

export function formatUnitAvailability(count: number) {
  return `${count} ${pluralize(count, 'unidad')} ${pluralize(count, 'disponible')}`;
}

export function formatCheckoutReviewSummary(itemCount: number, totalUnits: number) {
  return `${formatProductCount(itemCount)} y ${totalUnits} ${pluralize(totalUnits, 'unidad')} para registrar.`;
}
