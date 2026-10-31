import { groceryQuantity } from '../src/lib/grocery-quantity';

it.each([
    ['Tomato', 150, 'g', 'About 1 medium tomato'],
    ['Tomatoes', 300, 'g', 'About 2 medium tomatoes'],
    ['tomatores', 300, 'g', 'About 2 medium tomatoes'],
    ['  Organic TOMATOS, finely diced (raw)  ', 300, ' G ', 'About 2 medium tomatoes'],
    ['onions', 0.3, 'kg', 'About 2 medium onions'],
    ['Red onion', 151, 'grams', 'About 2 medium red onions'],
    ['Yellow onions', 150, 'gm', 'About 1 medium yellow onion'],
    ['White onion', 150, 'gms', 'About 1 medium white onion'],
    ['Red bell peppers', 300, 'gram', 'About 2 medium red bell peppers'],
    ['Green pepper', 150, 'g', 'About 1 medium green bell pepper'],
    ['Yellow capsicum', 150, 'g', 'About 1 medium yellow bell pepper'],
    ['Orange bell pepper', 150, 'g', 'About 1 medium orange bell pepper'],
    ['Fresh carrots, grated', 160, 'g', 'About 2 medium carrots'],
    ['Potatoes', 1, 'lb', 'About 4 medium potatoes'],
    ['Sweet potato', 130, 'g', 'About 1 medium sweet potato'],
    ['Cucumbers', 10, 'oz', 'About 1 medium cucumber'],
    ['Courgettes', 400, 'g', 'About 2 medium zucchini'],
    ['Avocado', 300, 'g', 'About 2 medium avocados'],
    ['Banana', 130, 'g', 'About 1 medium banana'],
    ['Apple', 480, 'g', 'About 2 large apples'],
    ['Lemon', 60, 'g', 'About 1 medium lemon'],
    ['Lime', 70, 'g', 'About 1 medium lime'],
    ['Orange', 150, 'g', 'About 1 medium orange'],
    ['Pear', 170, 'g', 'About 1 medium pear'],
    ['Peaches', 300, 'g', 'About 2 medium peaches'],
    ['Nectarine', 140, 'g', 'About 1 medium nectarine'],
    ['Plums', 150, 'g', 'About 2 medium plums'],
    ['Kiwifruit', 75, 'g', 'About 1 medium kiwi'],
    ['Tangerines', 110, 'g', 'About 1 medium tangerine'],
    ['Grapefruit', 310, 'g', 'About 1 medium grapefruit'],
    ['Cauliflower', 600, 'g', 'About 1 medium cauliflower head'],
    ['Green cabbage', 1000, 'g', 'About 1 medium green cabbage head'],
    ['Iceberg lettuce', 530, 'g', 'About 1 medium iceberg lettuce head'],
    ['Button mushrooms', 34, 'g', 'About 2 medium mushrooms'],
    ['Celery', 110, 'g', 'About 2 medium celery stalks'],
    ['Asparagus', 38, 'g', 'About 2 asparagus spears'],
    ['Garlic, minced', 6, 'g', 'About 2 garlic cloves'],
    ['Egg', 100, 'g', 'About 2 large eggs'],
    ['Large eggs', 100, 'g', 'About 2 large eggs'],
    ['Tomato', 0.00000001, 'g', 'About 1 medium tomato'],
    ['Tomato', Number.MIN_VALUE, 'g', 'About 1 medium tomato'],
] as const)('converts %s (%s %s) into a shopping estimate', (name, quantity, unit, label) => {
    const item = Object.freeze({ name, quantity, unit });
    expect(groceryQuantity(item)).toEqual({ label, original: `${quantity} ${unit}`, estimated: true });
});

it.each(['g', 'gram', 'grams', 'gm', 'gms', 'G', ' g. '])('accepts the mass alias %s', unit => {
    expect(groceryQuantity({ name: 'Tomato', quantity: 300, unit }).label).toBe('About 2 medium tomatoes');
});

it.each([
    ['kg', 0.3], ['kilogram', 0.3], ['kilograms', 0.3],
    ['oz', 1], ['ounce', 1], ['ounces', 1],
    ['lb', 0.1], ['lbs', 0.1], ['pound', 0.1], ['pounds', 0.1],
] as const)('supports %s without altering source values', (unit, quantity) => {
    expect(groceryQuantity({ name: 'Tomato', quantity, unit }).original).toBe(`${quantity} ${unit}`);
    expect(groceryQuantity({ name: 'Tomato', quantity, unit }).estimated).toBe(true);
});

it.each([
    ['Tomatoes', 1, 'count', '1 tomato', false],
    ['Onions', 2, 'each', '2 onions', false],
    ['Egg', 12, 'count', '12 eggs', false],
    ['Egg', 1, 'dozen', '12 eggs', false],
    ['Egg', 0.5, 'dz', '6 eggs', false],
    ['Onion', 0.25, 'count', 'About 1 onion', true],
    ['Tomato', 1.1, 'pcs', 'About 2 tomatoes', true],
    ['Garlic', 2, 'cloves', '2 garlic cloves', false],
    ['Garlic cloves', 2, 'count', '2 garlic cloves', false],
    ['Celery', 2, 'stalks', '2 celery stalks', false],
    ['Asparagus', 1, 'spear', '1 asparagus spear', false],
] as const)('formats known counts: %s %s %s', (name, quantity, unit, label, estimated) => {
    expect(groceryQuantity({ name, quantity, unit })).toEqual({ label, original: `${quantity} ${unit}`, estimated });
});

it.each([
    ['Canned tomatoes', 'g'], ['Tomato paste', 'g'], ['Sun-dried tomatoes', 'g'],
    ['Roasted tomatoes', 'g'], ['Tomato sauce', 'g'], ['Tomato juice', 'ml'],
    ['Onion powder', 'g'], ['Frozen onions', 'g'], ['Pickled onion', 'g'],
    ['Egg whites', 'g'], ['Egg yolks', 'g'], ['Liquid eggs', 'g'],
    ['Garlic powder', 'g'], ['Garlic salt', 'g'], ['Garlic paste', 'g'],
    ['Garlic', 'count'], ['Garlic', 'bulbs'], ['Celery', 'count'], ['Asparagus', 'bunch'],
    ['Tomato', 'ml'], ['Onion', 'cup'], ['Onion', 'tbsp'], ['Tomato', ''],
    ['Tomato', 'unknown'], ['Tomato', 'fl oz'], ['Lemon juice', 'g'],
    ['Chopped tomatoes', 'pieces'], ['Sliced onion', 'count'],
    ['Cherry tomatoes', 'g'], ['Roma tomatoes', 'g'], ['Small tomato', 'g'],
    ['Large onion', 'g'], ['Spring onions', 'g'], ['Green onions', 'g'],
    ['Onion rings', 'g'], ['Baby carrots', 'g'], ['Tomato and onion', 'g'],
    ['Chicken breast', 'g'], ['Olive oil', 'ml'], ['Flour', 'g'], ['Rice', 'g'],
    ['Portobello mushrooms', 'g'], ['Red cabbage', 'g'], ['Mystery fruit', 'count'],
] as const)('preserves unsupported or ambiguous food/unit combinations: %s / %s', (name, unit) => {
    expect(groceryQuantity({ name, quantity: 100, unit })).toEqual({ label: `100${unit ? ` ${unit}` : ''}`, estimated: false });
});

it.each([0, -1, Infinity, NaN, Number.MAX_VALUE])('does not invent shopping counts for invalid or unrepresentable quantities: %s', quantity => {
    expect(groceryQuantity({ name: 'Tomato', quantity, unit: 'kg' })).toEqual({ label: `${quantity} kg`, estimated: false });
});

it('avoids an extra item from floating point error while rounding real fractions up', () => {
    expect(groceryQuantity({ name: 'Tomato', quantity: 0.1 + 0.2, unit: 'kg' }).label).toBe('About 2 medium tomatoes');
    expect(groceryQuantity({ name: 'Tomato', quantity: 300.01, unit: 'g' }).label).toBe('About 3 medium tomatoes');
});

it('preserves small quantities for ingredients that cannot be converted', () => {
    expect(groceryQuantity({ name: 'Salt', quantity: 0.000001, unit: 'g' }).label).toBe('0.000001 g');
});
