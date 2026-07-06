# TypeScript / JavaScript Cheat Sheet

This project uses TypeScript with React Native. TypeScript is JavaScript plus static types, which helps catch mistakes before running the app.

## Variables

### `const`

Use `const` when the variable should not be reassigned.

```ts
const age = 25;
const isWeightLoss = goalWeight < weight;
```

Most values in React components should be `const`.

### `let`

Use `let` when a variable must be reassigned.

```ts
let message = "Loading";
message = "Ready";
```

Prefer `const` until reassignment is actually needed.

## Types

### Primitive Types

```ts
const weight: number = 180;
const gender: string = "MALE";
const isLoaded: boolean = true;
```

Common primitives:

- `number`
- `string`
- `boolean`
- `undefined`
- `null`

## Type Aliases

You used type aliases for domain concepts.

```ts
export type Gender = "MALE" | "FEMALE" | "OTHER";

export type User = {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
};
```

Use type aliases when a data shape appears in more than one place.

## Union Types

A union type allows only specific values.

```ts
export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHTLY_ACTIVE"
  | "MODERATELY_ACTIVE"
  | "VERY_ACTIVE";
```

Use unions for dropdown/button choices, route modes, status values, and other fixed options.

## Records

`Record<KeyType, ValueType>` maps known keys to values.

```ts
export const activityMultiplier: Record<ActivityLevel, number> = {
  SEDENTARY: 1.1,
  LIGHTLY_ACTIVE: 1.3,
  MODERATELY_ACTIVE: 1.5,
  VERY_ACTIVE: 1.7,
};
```

Use `Record` when every possible key should have a value.

## Functions

### Named Function

```ts
function calculateTdee(bmi: number, multiplier: number) {
  return bmi * multiplier;
}
```

Good for reusable logic and domain calculations.

### Function With Return Type

```ts
function calculateTdee(bmi: number, multiplier: number): number {
  return bmi * multiplier;
}
```

Use explicit return types for exported functions and important domain logic.

### Arrow Function

```ts
const handlePress = () => {
  setSelectedActivity("SEDENTARY");
};
```

Common in React props and event handlers.

## Objects

```ts
const user: User = {
  weight: 180,
  height: 70,
  age: 30,
  gender: "MALE",
  activityLevel: "MODERATELY_ACTIVE",
};
```

Use objects to group related values that move through the app together.

## Classes And Instances

A class defines a blueprint for objects that should have the same fields and methods.

```ts
type UserPlanValues = {
  planCalories: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  totalWeeksToReachGoal: number;
};

export default class UserPlan {
  readonly planCalories: number;
  readonly proteinGrams: number;
  readonly fatGrams: number;
  readonly carbGrams: number;
  readonly totalWeeksToReachGoal: number;

  constructor(values: UserPlanValues) {
    this.planCalories = values.planCalories;
    this.proteinGrams = values.proteinGrams;
    this.fatGrams = values.fatGrams;
    this.carbGrams = values.carbGrams;
    this.totalWeeksToReachGoal = values.totalWeeksToReachGoal;
  }
}
```

Creating one with `new` gives you a class instance:

```ts
const plan = new UserPlan({
  planCalories: 2200,
  proteinGrams: 165,
  fatGrams: 61,
  carbGrams: 248,
  totalWeeksToReachGoal: 20,
});
```

Use a class when the value is more than loose data: it has a meaningful domain name, should be created consistently, or may later need methods.

### Constructor

The `constructor` runs when you call `new UserPlan(...)`.

```ts
constructor(values: UserPlanValues) {
  this.planCalories = values.planCalories;
}
```

`this` means "this specific instance." Each `UserPlan` gets its own `planCalories`, `proteinGrams`, and other fields.

### `readonly`

`readonly` means a field can be assigned in the constructor, then should not be changed later.

```ts
readonly planCalories: number;
```

Use `readonly` for calculated domain results that should be treated as a snapshot.

## Static Factory Methods

A static method belongs to the class itself, not to one instance.

```ts
const plan = UserPlan.from(user, goal);
```

This is different from an instance method:

```ts
plan.planCalories;
```

Use static factory methods to give names to common ways of creating an object.

```ts
export default class UserPlan {
  static from(user: User, goal: UserGoal) {
    const { planCalories } = CalculateUserPlan(user, goal);
    const macros = CalculateUserMacros(planCalories);

    return new UserPlan({
      planCalories,
      proteinGrams: macros.proteinGrams,
      fatGrams: macros.fatGrams,
      carbGrams: macros.carbGrams,
      totalWeeksToReachGoal: Math.abs(user.weight - goal.goalWeight) / goal.pace,
    });
  }
}
```

`UserPlan.from(user, goal)` is nicer than spreading the calculation details across a screen component. The screen asks for a plan; the domain class knows how to build one.

## JSON And Plain Objects

JSON is a string format for saving or sending data.

```ts
const json = JSON.stringify({
  user,
  goal,
  plan,
});
```

`JSON.stringify` turns objects into a string. It saves data fields, but it does not save class methods.

```ts
const parsed = JSON.parse(json);
```

`JSON.parse` turns the string back into plain JavaScript objects. A plain object may have the same fields as a class instance, but it is not an instance of that class.

```ts
const parsedPlan = JSON.parse(json).plan;

parsedPlan.planCalories; // works if the field exists
parsedPlan instanceof UserPlan; // false
```

This matters because methods and class behavior are not restored by `JSON.parse`.

## Hydrating Parsed JSON

Hydrating means turning saved plain data back into the richer shape the app wants to use.

For a class, add a factory that accepts the plain saved values:

```ts
export type UserPlanValues = {
  planCalories: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  totalWeeksToReachGoal: number;
};

export default class UserPlan {
  static fromValues(values: UserPlanValues) {
    return new UserPlan(values);
  }
}
```

Then hydrate after parsing:

```ts
type SavedUserPlanFile = {
  user: User;
  goal: UserGoal;
  plan: UserPlanValues;
};

const savedPlan = JSON.parse(fileContents) as SavedUserPlanFile;

const hydrated = {
  user: savedPlan.user,
  goal: savedPlan.goal,
  plan: UserPlan.fromValues(savedPlan.plan),
};
```

Now `hydrated.plan` is a real `UserPlan` instance again.

## Type Assertions With `as`

`JSON.parse` returns `any` because TypeScript cannot know what is inside a string.

```ts
const savedPlan = JSON.parse(fileContents) as SavedUserPlanFile;
```

The `as SavedUserPlanFile` part is a type assertion. It tells TypeScript, "treat this value as this shape."

Be careful: `as` does not validate at runtime. If the file is malformed, TypeScript will still trust you.

Good pattern:

```ts
try {
  const savedPlan = JSON.parse(fileContents) as SavedUserPlanFile;
  return UserPlan.fromValues(savedPlan.plan);
} catch (error) {
  console.error("Could not read saved plan", error);
  return null;
}
```

For simple app-local JSON, a type assertion plus `try/catch` is often enough. For user-edited files, network data, or high-risk data, add runtime validation before trusting the parsed object.

## Object Spread

Used in tests to create variations of a base object.

```ts
const femaleUser = {
  ...baseUser,
  gender: "FEMALE",
};
```

Use spread to avoid repeating every field when only one or two values change.

## Arrays

```ts
const genders: Gender[] = ["MALE", "FEMALE", "OTHER"];
```

Use typed arrays when mapping test cases or rendering button lists.

## Array Methods

### `map`

Transforms each item into something new.

```ts
activityLevels.map((activityLevel) => ({ gender, activityLevel }));
```

In React, `map` is often used to render a list.

### `flatMap`

Maps and flattens one level.

```ts
const cases = genders.flatMap((gender) =>
  activityLevels.map((activityLevel) => ({ gender, activityLevel }))
);
```

Use it to build combinations for test matrices.

## Conditionals

### `if`

```ts
if (!isLoaded) {
  return <ActivityIndicator />;
}
```

Use early returns for loading, error, and empty states.

### Ternary

```ts
const iconName = isWeightLoss
  ? "trending-down-outline"
  : "trending-up-outline";
```

Use ternaries for small expressions in JSX.

Avoid deeply nested ternaries when the logic becomes hard to read. Move it into a named function or variable.

## Template Literals

```ts
const label = `${pace.toFixed(1)} lb/week`;
```

Use template literals when combining strings and variables.

## Number Conversion

Route params and text input values often arrive as strings.

```ts
const age = Number(params.age);
const weight = parseFloat(weightInput);
```

Use `Number(...)` when the whole string should be numeric. Use `parseFloat(...)` when the string may include decimals.

## Boolean Conversion

URL params are strings, so convert booleans explicitly.

```ts
const isWeightLoss = params.isWeightLoss === "true";
```

Do not use `Boolean("false")`, because it returns `true`.

## Optional And Array Route Params

Expo route params can be a string, an array of strings, or undefined.

```ts
function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
```

Use a helper like this when reading route params repeatedly.

## Imports And Exports

### Default Export

```ts
export default function CalculateUserPlan() {}
```

Imported with any local name:

```ts
import CalculateUserPlan from "./calculate-user-plan";
```

### Named Export

```ts
export type User = {};
export const activityMultiplier = {};
```

Imported by exact name:

```ts
import { User, activityMultiplier } from "./user";
```

## Testing Basics

```ts
describe("CalculateUserPlan", () => {
  it("adds calories when the goal is weight gain", () => {
    expect(plan.planCalories).toBeGreaterThan(plan.tdee);
  });
});
```

Common Jest tools used:

- `describe` groups related tests.
- `it` defines one behavior.
- `expect` makes an assertion.
- `toBeCloseTo` compares decimal math safely.
- `it.each` runs the same test over many cases.

## Clean Code Notes

Prefer names that explain intent:

```ts
const planCalories = calculatePlanCalories(user, userGoal, tdee);
```

Better than:

```ts
const x = tdee + y * z;
```

Pull repeated or meaningful numbers into constants:

```ts
const CALORIES_PER_POUND = 3500;
const DAYS_PER_WEEK = 7;
```

Use small functions when a calculation has a clear name.
