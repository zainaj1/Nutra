# Grocery shopping quantities

The Groceries tab converts familiar raw ingredients into whole shopping items:
`300 g Tomatoes` displays **About 2 medium tomatoes**, with **Recipe total: 300 g**
underneath. Counts use natural labels such as **12 eggs** instead of **12 count**.
Fractional counts round up for shopping; half an onion becomes **About 1 onion**.
This is a display transformation. API quantities, units, IDs, and individual rows
remain intact, including duplicates. Nothing is persisted or added across rows.

`src/lib/grocery-quantity.ts` contains the explicit ingredient rules and unit
aliases. Gram, kilogram, ounce, and pound weights are accepted. Known count units
and dozens are supported. Volume units, packages, unknown measures, and foods
without a matching rule retain their original quantity. Even tiny positive
requirements produce at least one shopping item; zero stays zero.

## Estimates and sources

These are rounded edible-weight assumptions for shopping, not guaranteed produce
sizes or nutrition calculations. They are based on the
[FDA raw vegetable portions](https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/nutrition-information-raw-vegetables)
and [FDA raw fruit portions](https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/raw-fruits-poster-text-version-accessible-version).
Reference fractional portions are scaled to a whole item. Weight estimates are
rounded to practical values; for example, the FDA's 148 g medium tomato and onion
become 150 g. Color varieties share the base food's estimate.

| Food / shopping unit | Approximate edible grams |
| --- | ---: |
| Medium tomato, onion, bell pepper, potato | 150 |
| Medium carrot | 80 |
| Medium sweet potato | 130 |
| Medium cucumber | 300 |
| Medium zucchini / courgette | 200 |
| Medium avocado | 150 |
| Medium banana | 130 |
| Large apple | 240 |
| Medium lemon / lime | 60 / 70 |
| Medium orange / peach | 150 |
| Medium pear | 170 |
| Medium nectarine | 140 |
| Medium plum / kiwi | 75 |
| Medium tangerine / grapefruit | 110 / 310 |
| Medium cauliflower head | 600 |
| Medium green cabbage head | 1000 |
| Medium iceberg lettuce head | 530 |
| Medium button mushroom | 17 |
| Medium celery stalk | 55 |
| Asparagus spear | 19 |
| Garlic clove | 3 |
| Large whole egg | 50 |

Garlic uses [Health Canada's raw garlic portions](https://aliments-nutrition.canada.ca/cnf-fce/serving-portion?id=2394&lang=eng&wbdisable=true).
Eggs use the 50 g large whole raw egg portion in the
[USDA reference table hosted by NIH](https://ods.od.nih.gov/pubs/usdandb/EPA-Food.pdf).

## Matching and limitations

Names are matched completely after normalizing case, whitespace, and a small set
of descriptors. Fresh/raw/organic qualifiers are allowed. Chopped, diced, sliced,
grated, minced, or peeled raw ingredients can use weight estimates, but their
piece counts are not interpreted as whole items. Explicit sizes must match the
rule's size. A few aliases and spelling variants are supported, including
tomatos/tomatores, capsicum, courgette, and kiwifruit; there is no fuzzy matching.

Tomato paste, canned tomatoes, onion powder, juice, frozen/cooked foods, egg whites,
and unrecognized varieties such as cherry tomatoes keep their supplied amounts.
Ambiguous counts of garlic or celery remain unchanged unless the unit explicitly
says cloves/stalks or the ingredient name identifies that part. There are no
assumed cup densities, package sizes, serving multipliers, or conversions between
different API rows. Item sizes and preparation losses vary, so recipe totals
remain visible for measuring while cooking. Rounding each duplicate row separately
can overestimate purchases; combining those rows is deliberately outside this
display formatter's responsibility.

Run the formatter and UI checks with:

```sh
npm test -- --preset jest-expo --runInBand --watchman=false __tests__/grocery-quantity.test.ts __tests__/pantry.test.tsx
```
