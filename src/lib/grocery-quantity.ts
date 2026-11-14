import { formatQuantity, type GroceryItem } from './pantry';

type ItemRule = {
    singular: string;
    plural: string;
    grams: number;
    size?: 'medium' | 'large';
    aliases: string[];
    // A count of celery or garlic may mean a bunch/bulb, not a stalk/clove.
    countUnits?: string[];
};

function whole(singular: string, plural: string, grams: number, aliases: string[] = [], size: ItemRule['size'] = 'medium'): ItemRule {
    return { singular, plural, grams, size, aliases: [singular, plural, ...aliases] };
}

// Practical rounded edible weights, used only for approximate shopping counts.
// Sources and limitations: docs/grocery-quantities.md. Match complete ingredient
// names, never substrings: tomato paste and onion powder are different foods.
const rules: ItemRule[] = [
    whole('tomato', 'tomatoes', 150, ['tomatos', 'tomatores']),
    whole('onion', 'onions', 150),
    whole('red onion', 'red onions', 150),
    whole('yellow onion', 'yellow onions', 150),
    whole('white onion', 'white onions', 150),
    whole('bell pepper', 'bell peppers', 150, ['capsicum', 'capsicums']),
    ...['red', 'green', 'yellow', 'orange'].map(color => whole(`${color} bell pepper`, `${color} bell peppers`, 150,
        [`${color} pepper`, `${color} peppers`, `${color} capsicum`, `${color} capsicums`])),
    whole('carrot', 'carrots', 80),
    whole('potato', 'potatoes', 150, ['potatos']),
    whole('sweet potato', 'sweet potatoes', 130),
    whole('cucumber', 'cucumbers', 300),
    whole('zucchini', 'zucchini', 200, ['zucchinis', 'courgette', 'courgettes', 'summer squash']),
    whole('avocado', 'avocados', 150),
    whole('banana', 'bananas', 130),
    whole('apple', 'apples', 240, [], 'large'),
    whole('lemon', 'lemons', 60),
    whole('lime', 'limes', 70),
    whole('orange', 'oranges', 150),
    whole('pear', 'pears', 170),
    whole('peach', 'peaches', 150),
    whole('nectarine', 'nectarines', 140),
    whole('plum', 'plums', 75),
    whole('kiwi', 'kiwis', 75, ['kiwifruit', 'kiwifruits']),
    whole('tangerine', 'tangerines', 110),
    whole('grapefruit', 'grapefruits', 310),
    whole('cauliflower head', 'cauliflower heads', 600, ['cauliflower', 'cauliflowers']),
    whole('green cabbage head', 'green cabbage heads', 1000, ['green cabbage', 'green cabbages']),
    whole('iceberg lettuce head', 'iceberg lettuce heads', 530, ['iceberg lettuce']),
    whole('mushroom', 'mushrooms', 17, ['button mushroom', 'button mushrooms', 'white mushroom', 'white mushrooms']),
    { ...whole('celery stalk', 'celery stalks', 55, ['celery']), countUnits: ['stalk', 'stalks'] },
    { ...whole('asparagus spear', 'asparagus spears', 19, ['asparagus']), size: undefined, countUnits: ['spear', 'spears'] },
    { ...whole('garlic clove', 'garlic cloves', 3, ['garlic']), size: undefined, countUnits: ['clove', 'cloves'] },
    whole('egg', 'eggs', 50, ['chicken egg', 'chicken eggs'], 'large'),
];

const byName = new Map<string, ItemRule>();
for (const rule of rules) {
    for (const alias of rule.aliases) {
        byName.set(alias, rule);
        if (rule.size) byName.set(`${rule.size} ${alias}`, rule);
    }
}

const gramsPerUnit = new Map([
    ...['g', 'gram', 'grams', 'gm', 'gms'].map(unit => [unit, 1] as const),
    ...['kg', 'kilogram', 'kilograms'].map(unit => [unit, 1000] as const),
    ...['oz', 'ounce', 'ounces'].map(unit => [unit, 28.349523125] as const),
    ...['lb', 'lbs', 'pound', 'pounds'].map(unit => [unit, 453.59237] as const),
]);
const countUnits = new Set(['count', 'counts', 'each', 'ea', 'piece', 'pieces', 'pc', 'pcs', 'unit', 'units', 'whole']);
const dozenUnits = new Set(['dozen', 'dozens', 'dz']);

function ingredientName(name: string, allowPreparation: boolean) {
    let normalized = name.toLowerCase().replace(/[-_,()]/g, ' ')
        .replace(/\b(fresh|raw|organic|whole)\b/g, ' ');
    // Weight totals for chopped raw produce can be bought as whole produce.
    // A "piece" of chopped produce is not a whole item, so never strip these
    // qualifiers when converting counts. Other processing words remain unmatched.
    if (allowPreparation) normalized = normalized.replace(/\b(chopped|diced|sliced|grated|minced|peeled|trimmed|washed|finely|roughly|thinly|coarsely)\b/g, ' ');
    return normalized.replace(/\s+/g, ' ').trim();
}

export type GroceryQuantity = {
    label: string;
    original?: string;
    estimated: boolean;
};

/** A display-only transformation; never changes, combines, or persists API rows. */
export function groceryQuantity(item: GroceryItem): GroceryQuantity {
    const original = `${formatQuantity(item.quantity)}${item.unit ? ` ${item.unit}` : ''}`;
    const unchanged = { label: original, estimated: false };
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) return unchanged;

    const unit = item.unit.trim().toLowerCase().replace(/\.$/, '');
    const grams = gramsPerUnit.get(unit);
    const name = ingredientName(item.name, grams !== undefined);
    const rule = byName.get(name);
    if (!rule) return unchanged;

    let amount: number;
    if (grams !== undefined) {
        amount = item.quantity * grams / rule.grams;
    } else {
        const explicitPart = [rule.singular, rule.plural].includes(name);
        const isCount = rule.countUnits
            ? rule.countUnits.includes(unit) || (explicitPart && countUnits.has(unit))
            : countUnits.has(unit);
        const isDozen = dozenUnits.has(unit) && (!rule.countUnits || explicitPart);
        if (!isCount && !isDozen) return unchanged;
        amount = item.quantity * (isDozen ? 12 : 1);
    }
    if (!Number.isFinite(amount) || amount > Number.MAX_SAFE_INTEGER) return unchanged;

    // Avoid buying an extra item solely because of floating-point arithmetic.
    // Every positive requirement still rounds to at least one shopping item.
    const tolerance = Math.min(1e-9, Number.EPSILON * Math.max(1, amount) * 4);
    const count = Math.max(1, Math.ceil(amount - tolerance));
    const estimated = grams !== undefined || Math.abs(count - amount) > tolerance;
    const size = grams !== undefined && rule.size ? `${rule.size} ` : '';
    const label = `${estimated ? 'About ' : ''}${count} ${size}${count === 1 ? rule.singular : rule.plural}`;
    return { label, original, estimated };
}
