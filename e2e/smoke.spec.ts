import { expect, test, type Page } from '@playwright/test';

async function openFirstPurchasableProduct(page: Page) {
  const productLinks = page.locator('a[href^="/products/"]');
  const productCount = await productLinks.count();

  for (let index = 0; index < productCount; index += 1) {
    await productLinks.nth(index).click();

    const addToCartButton = page.getByTestId('pdp-add-to-cart');

    if (await addToCartButton.isEnabled()) {
      return;
    }

    await page.goBack();
  }

  throw new Error('No se encontró un producto con stock disponible para el smoke E2E.');
}

test('recorre home, PDP, carrito y checkout', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('main')).toBeVisible();

  const productLinks = page.locator('a[href^="/products/"]');
  await expect(productLinks.first()).toBeVisible();

  await openFirstPurchasableProduct(page);

  await expect(page).toHaveURL(/\/products\/.+/);

  const productTitle = (await page.getByRole('heading', { level: 1 }).textContent())?.trim();
  expect(productTitle).toBeTruthy();

  const addToCartButton = page.getByTestId('pdp-add-to-cart');
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();

  const cartLink = page.locator('a[href="/cart"]');
  await expect(cartLink).toHaveAttribute('aria-label', /ir al carrito con [1-9]\d* productos/i);
  await cartLink.click();

  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('cart-line-item').first()).toContainText(productTitle ?? '');

  await page.locator('a[href="/checkout"]').click();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /contacto, envío y pago/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /confirmar pedido/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /revisá el pedido/i })).toBeVisible();
});
