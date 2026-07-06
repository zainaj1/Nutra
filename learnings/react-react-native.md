# React / React Native Cheat Sheet

This app is built with React Native screens, reusable components, state, props, and Expo Router navigation.

## Components

A component is a function that returns UI.

```tsx
export default function UserGoals() {
  return (
    <View>
      <Text>Goals</Text>
    </View>
  );
}
```

Use components to split the app into reusable pieces like `GenderButton`, `ActivityButton`, `WeightBox`, and `PaceSlider`.

## JSX

JSX lets you write UI inside TypeScript.

```tsx
<Text className="text-lg font-bold">Pace</Text>
```

JSX expressions use `{}`:

```tsx
<Text>{pace.toFixed(1)} lb/week</Text>
```

## Core React Native Components

### `View`

The main layout container.

```tsx
<View className="flex-row items-center" />
```

Use it like a `div` in web React.

### `Text`

Displays text.

```tsx
<Text className="text-gray-900">Continue</Text>
```

All text in React Native must be inside `Text`.

### `TouchableOpacity`

A pressable button with opacity feedback.

```tsx
<TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
  <Text>Save</Text>
</TouchableOpacity>
```

Use it for custom buttons and selectable cards.

### `Pressable`

A lower-level press component.

```tsx
<Pressable onPress={handlePress}>
  <Text>Sign out</Text>
</Pressable>
```

Use it when you want more control over press states.

### `TextInput`

Lets the user type.

```tsx
<TextInput value={emailAddress} onChangeText={setEmailAddress} />
```

Use controlled inputs where React state owns the value.

### `ScrollView`

Makes page content scroll.

```tsx
<ScrollView contentContainerClassName="px-5 pt-2 pb-4">
  {/* form content */}
</ScrollView>
```

Use it for setup screens and forms that might not fit on small screens.

### `ActivityIndicator`

Shows loading.

```tsx
if (!isLoaded) {
  return <ActivityIndicator size="large" color="#0000ff" />;
}
```

Use it while auth or data is loading.

## State

`useState` stores values that change over time.

```tsx
const [weight, setWeight] = useState("160");
```

Use state for:

- selected gender
- selected activity level
- form fields
- current pace slider value
- edit mode in `WeightBox`

## Controlled Components

A controlled component receives its value and update function from React state.

```tsx
<WeightBox
  title="Current Weight"
  value={weight}
  setValue={setWeight}
/>
```

This makes the parent screen the source of truth.

## Props

Props pass data into components.

```tsx
type GenderButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};
```

Use props when a component should be reusable.

## Lifting State Up

When multiple components need the same value, keep the state in their closest shared parent.

Example from setup:

```tsx
const [selectedGender, setSelectedGender] = useState<Gender | null>(null);

<GenderButton
  selected={selectedGender === "MALE"}
  onPress={() => setSelectedGender("MALE")}
/>
```

The button does not own the selected state. It reports presses to the parent.

## Derived State

Derived state is calculated from existing state.

```tsx
const isWeightLoss = parseFloat(goalWeight) < parseFloat(weight);
const displayedPace = pace.toFixed(1);
```

Use derived variables instead of storing the same fact twice.

## Conditional Rendering

Return different UI based on state.

```tsx
if (!isLoaded) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}
```

Use this for loading, auth, errors, and empty screens.

## Conditional Styling

You used string concatenation to style selected states.

```tsx
className={
  "rounded-xl " +
  (selected ? "bg-green-600" : "bg-white")
}
```

Use it for selected buttons, active ticks, and disabled buttons.

## Disabled Buttons

```tsx
<TouchableOpacity
  disabled={!canContinue}
  style={{ opacity: canContinue ? 1 : 0.5 }}
  accessibilityState={{ disabled: !canContinue }}
>
  <Text>Continue</Text>
</TouchableOpacity>
```

Best practice: pair `disabled` with visual feedback and accessibility state.

## Accessibility

You used:

```tsx
accessibilityRole="button"
accessibilityLabel="Continue"
accessibilityState={{ disabled: !canContinue }}
```

Use accessibility props when custom components behave like buttons or controls.

## Icons

Ionicons are used for visual hints.

```tsx
<Ionicons name="trending-down-outline" size={30} color="#16a34a" />
```

Use icons to reinforce meaning, but keep text labels for clarity.

## Safe Areas

```tsx
<SafeAreaProvider>
  <SafeAreaView className="flex-1 bg-gray-50">
    {/* screen */}
  </SafeAreaView>
</SafeAreaProvider>
```

Use safe areas so content does not collide with notches, status bars, or device edges.

## `useEffect`

`useEffect` runs code after React renders the screen. Use it when the component needs to synchronize with something outside normal JSX rendering.

Common use cases:

- Reading a file or API after a screen loads
- Subscribing to events
- Starting and cleaning up timers
- Updating an external system when state changes

Do not use `useEffect` for values that can be calculated during render. For example, this should stay as derived state:

```tsx
const isWeightLoss = parseFloat(goalWeight) < parseFloat(weight);
const displayedPace = pace.toFixed(1);
```

### Why We Used It Today

The Home screen needed to read `user-plan.json` from device storage. File storage is outside React, so the screen:

1. Renders a loading state first.
2. Runs `useEffect` after the first render.
3. Reads the file asynchronously.
4. Stores the result in state.
5. Re-renders with either the plan UI or an empty state.

```tsx
const [savedUserPlan, setSavedUserPlan] = useState<SavedUserPlan | null>();

useEffect(() => {
  readSavedUserPlan().then(setSavedUserPlan);
}, []);
```

This state shape is useful:

```text
undefined = still loading
null      = loaded, but no plan file exists
object    = loaded plan data
```

Then render based on the state:

```tsx
if (savedUserPlan === undefined) {
  return <ActivityIndicator />;
}

if (!savedUserPlan) {
  return <Text>No user plan found.</Text>;
}
```

### Dependency Array

The second argument controls when the effect runs.

Run once after mount:

```tsx
useEffect(() => {
  readSavedUserPlan().then(setSavedUserPlan);
}, []);
```

Run whenever a value changes:

```tsx
useEffect(() => {
  console.log("Pace changed", pace);
}, [pace]);
```

Run after every render:

```tsx
useEffect(() => {
  console.log("Rendered");
});
```

Avoid effects without a dependency array unless you truly need every render. They are easy to turn into accidental render loops.

### Cleanup

Effects can return a cleanup function. React runs cleanup when the component unmounts, or before the effect runs again.

The pace slider uses cleanup for a timer:

```tsx
const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  return () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
  };
}, []);
```

Use `useRef` for values that persist without causing re-renders. Use `useEffect` cleanup for timers and subscriptions.

### Avoid Synchronous Set State In Effects

This pattern can trigger lint warnings:

```tsx
useEffect(() => {
  setSavedUserPlan(readSavedUserPlanSync());
}, []);
```

Prefer async work or callbacks when synchronizing with external systems:

```tsx
useEffect(() => {
  readSavedUserPlan().then(setSavedUserPlan);
}, []);
```

### Quick Rule

- Use render variables for calculations from existing props/state.
- Use `useState` for values that change and affect UI.
- Use `useEffect` for external systems: files, APIs, timers, subscriptions.
- Return cleanup from `useEffect` when you create something that must be stopped.

## Tests

Component tests use React Native Testing Library:

```tsx
const { getByRole } = render(<GenderButton />);
fireEvent.press(getByRole("button"));
```

Domain tests do not need React rendering:

```tsx
const plan = CalculateUserPlan(user, goal);
expect(plan.planCalories).toBeGreaterThan(plan.tdee);
```

Keep pure function tests separate from UI tests when possible.

## Best Practices

- Keep screens responsible for flow and state.
- Keep reusable components focused on rendering and events.
- Keep domain math in pure functions.
- Prefer derived values over duplicate state.
- Use accessibility props for custom controls.
- Use `ScrollView` for forms that may overflow.
- Make loading states explicit.
