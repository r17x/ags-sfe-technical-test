import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

faker.seed(42);

const categories = ['home', 'kitchen', 'apparel', 'outdoors', 'office', 'electronics'];

/**
 * Seeds a list of products.
 * @param count - The number of products to generate.
 * @returns An array of product objects.
 */
function generateProducts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: faker.commerce.productName(),
    price: Number(faker.commerce.price({ min: 5, max: 200, dec: 2 })),
    category: faker.helpers.arrayElement(categories),
    rating: Number(faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 })),
    image: `https://prd.place/400?id=${faker.number.int({ min: 1, max: 45 })}`,
  }));
}

/**
 * MSW (Mock Service Worker) request handlers.
 */
export const handlers = [
  http.get('/api/products', async () => {
    const data = generateProducts(2000);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return HttpResponse.json(data);
  }),
];
