# Expo Cheat Sheet

This app uses Expo with Expo Router, Expo vector icons, Expo UI community controls, and Clerk auth.

## Expo Router

Expo Router maps files to routes.

```text
src/app/(app)/(tabs)/(setup)/user-metrics.tsx
src/app/(app)/(tabs)/(setup)/user-goals.tsx
src/app/(app)/(tabs)/(setup)/finalize-plan.tsx
```

Each file exports a React component that becomes a screen.

## `Stack`

`Stack` creates stack navigation.

```tsx
import { Stack } from "expo-router";

export default function SetupLayout() {
  return (
    <Stack>
      <Stack.Screen name="user-metrics" />
      <Stack.Screen name="user-goals" />
    </Stack>
  );
}
```

Use stacks for flows where screens push forward and back, like onboarding/setup.

## `Stack.Screen`

Configures one screen in a stack.

```tsx
<Stack.Screen
  name="user-goals"
  options={{
    headerTitle: () => <SetupProgressHeader currentStep={2} totalSteps={4} />,
  }}
/>
```

Use screen options for header titles, progress UI, animations, and visibility.

## Protected Routes

The app layout uses `Stack.Protected` with Clerk auth.

```tsx
<Stack.Protected guard={isSignedIn}>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
</Stack.Protected>
```

Use protected routes when signed-in and signed-out users should see different screens.

## `Link`

`Link` navigates to another route.

```tsx
<Link href="/(app)/(tabs)/(setup)/user-goals" push asChild>
  <TouchableOpacity>
    <Text>Continue</Text>
  </TouchableOpacity>
</Link>
```

Use `asChild` when your own component should behave as the link.

### `push` vs `replace` in `Link`

`push` adds a new screen to the navigation history.

```tsx
<Link href="/(app)/(tabs)/(setup)/user-goals" push asChild>
  <TouchableOpacity>
    <Text>Continue</Text>
  </TouchableOpacity>
</Link>
```

Use `push` for normal forward movement where the user should be able to go back to the previous screen.

`replace` swaps the current screen for the next screen.

```tsx
<Link href="/(app)/(tabs)" replace asChild>
  <TouchableOpacity>
    <Text>Finish Setup</Text>
  </TouchableOpacity>
</Link>
```

Use `replace` after finishing a flow, redirecting after auth, or preventing the user from going back to a temporary screen.

Avoid passing both `push` and `replace` on the same `Link`. Pick the history behavior you want.

### Reusable Link Buttons

When multiple screens use the same navigation button, extract the `Link` + `TouchableOpacity` pair into a component. Type the destination with Expo Router's `Href` type so route objects and params stay checked.

```tsx
import { Link, type Href } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

type SetupContinueButtonProps = {
  href: Href;
  label?: string;
  disabled?: boolean;
  replace?: boolean;
};

export default function SetupContinueButton({
  href,
  label = "Continue",
  disabled = false,
  replace = false,
}: SetupContinueButtonProps) {
  return (
    <Link href={href} replace={replace} push={!replace} asChild>
      <TouchableOpacity
        disabled={disabled}
        className={
          "bg-setup-primary rounded-full py-4 items-center justify-center " +
          (disabled ? "opacity-50" : "opacity-100")
        }
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <Text className="text-white font-bold text-lg">{label}</Text>
      </TouchableOpacity>
    </Link>
  );
}
```

Use it from setup screens like this:

```tsx
<SetupContinueButton
  href={{
    pathname: "/(app)/(tabs)/(setup)/finalize-plan",
    params: { weight, pace },
  }}
  disabled={!canContinue}
/>

<SetupContinueButton
  href={{ pathname: "/(app)/(tabs)/home" }}
  label="Finalize Plan"
  replace
/>
```

This keeps button styling, disabled accessibility state, and `push` vs `replace` behavior in one place. The important detail is `push={!replace}`: normal setup steps push forward, while final redirects replace the current screen.

## Passing Route Params

Params are passed through `href`.

```tsx
<Link
  href={{
    pathname: "/(app)/(tabs)/(setup)/finalize-plan",
    params: {
      activityLevel,
      gender,
      height,
      age,
      isWeightLoss: String(isWeightLoss),
      "goal-weight": goalWeight,
      weight,
      pace,
    },
  }}
>
  <Text>Continue</Text>
</Link>
```

Use route params when the next screen needs values from the current screen.

## Reading Route Params

Use `useLocalSearchParams`.

```tsx
import { useLocalSearchParams } from "expo-router";

const params = useLocalSearchParams();
const age = Number(params.age);
```

Remember that params arrive as strings, arrays, or undefined. Convert values before using them in calculations.

## `useRouter`

Used for imperative navigation.

```tsx
const router = useRouter();
router.replace("/");
```

Use `Link` for normal button/link navigation. Use `useRouter` after async work like sign in, sign out, or submitting a form.

### Router History Methods

`router.push(href)` adds a route on top of the current stack.

```tsx
router.push("/(app)/(tabs)/(setup)/user-goals");
```

Use it for normal forward navigation.

`router.replace(href)` changes the current route without adding another history entry.

```tsx
router.replace("/");
```

Use it for redirects, auth completion, sign out, and final submit screens where back should not return to the old route.

`router.back()` goes back one route in navigation history.

```tsx
if (router.canGoBack()) {
  router.back();
}
```

Use it for custom back buttons.

`router.dismiss(count?)` pops screens off the closest stack. With no count, it dismisses one screen. With a number, it dismisses that many screens.

```tsx
router.dismiss();
router.dismiss(2);
```

Use `dismiss` when the current screen was presented within a stack or modal-like flow and you want to close back down the stack. `dismiss` is stack-focused; `replace` is redirect-focused.

`router.dismissTo(href)` dismisses screens until it reaches the target route. If that route is not already in the stack, Expo Router replaces the current screen with it.

```tsx
router.dismissTo("/(app)/(tabs)");
```

Use it when closing a nested flow back to a known route.

`router.dismissAll()` returns to the first screen in the closest stack.

```tsx
router.dismissAll();
```

Use it when a stack flow should reset to its first screen.

`router.canDismiss()` checks whether the current stack has something to dismiss.

```tsx
if (router.canDismiss()) {
  router.dismiss();
}
```

Quick rule:

- `push`: go forward and keep back history.
- `replace`: redirect by swapping the current route.
- `back`: go back one browser/navigation history entry.
- `dismiss`: pop screens from the current stack.
- `dismissTo`: pop back to a specific route if it exists, otherwise replace.
- `dismissAll`: pop to the first route in the closest stack.

## Route Groups

Folders in parentheses group routes without adding URL segments.

```text
(app)
(auth)
(tabs)
(setup)
```

Use route groups to organize screens by purpose while keeping clean URLs.

## Expo Vector Icons

Ionicons come from `@expo/vector-icons`.

```tsx
import { Ionicons } from "@expo/vector-icons";
import { setupColors } from "./setup-theme";

<Ionicons name="restaurant-outline" size={24} color={setupColors.primary} />
```

Use icons for actions, setup options, and visual meaning.

NativeWind classes do not style `Ionicons` directly. Use `setupColors` for icon `color` props so icons stay aligned with the Tailwind palette:

```tsx
<Ionicons name="flame" size={30} color={setupColors.planIcons.calories} />
<Ionicons name="leaf" size={30} color={setupColors.planIcons.carbs} />
```

Common icons used:

- `restaurant-outline`
- `mail-outline`
- `lock-closed-outline`
- `person-outline`
- `person-add-outline`
- `trending-down-outline`
- `trending-up-outline`
- `arrow-forward-outline`
- `logo-google`

## Expo UI Community Picker

The app uses `Picker` from `@expo/ui/community/picker`.

```tsx
import { Picker } from "@expo/ui/community/picker";

<Picker selectedValue={weight} onValueChange={(value) => setWeight(String(value))}>
  <Picker.Item label="160 lb" value="160 lb" />
</Picker>
```

Use picker controls for fixed choices like weight, feet, and inches.

## Expo UI Community Slider

The app uses `Slider` from `@expo/ui/community/slider`.

```tsx
import ExpoSlider from "@expo/ui/community/slider";
import { setupColors } from "./setup-theme";

<ExpoSlider
  value={pace}
  minimumValue={0.5}
  maximumValue={2}
  step={0.1}
  minimumTrackTintColor={setupColors.primary}
  maximumTrackTintColor={setupColors.border}
  thumbTintColor={setupColors.primary}
  onValueChange={setPace}
/>
```

Use sliders for numeric ranges where users benefit from seeing the range visually, like pace.

Like icons, slider tint props need raw color values. Keep those values in `setup-colors.json` and read them through `setupColors`; use NativeWind classes for the surrounding labels, ticks, bubble, and layout.

## Expo File System

The app uses `File` and `Paths` from `expo-file-system` for local JSON files.

```tsx
import { File, Paths } from "expo-file-system";

const file = new File(Paths.document, "user-plan.json");
```

### One File vs Multiple Files

Keep closely related data in one file when it represents one snapshot.

For setup, `user`, `goal`, and `plan` should usually live together:

```json
{
  "user": {},
  "goal": {},
  "plan": {}
}
```

This is better than three separate files because the values must stay in sync. If the user changes their weight, goal, or pace, the calculated plan belongs to that same moment in time.

Use separate files only when the data has separate lifecycles. Examples:

- `user-profile.json`: rarely changes
- `active-plan.json`: changes when setup changes
- `daily-logs/2026-07-05.json`: changes every day

Rule of thumb: if the app must read all pieces together to render one screen correctly, store them together.

### Writing A JSON Snapshot

```tsx
const file = new File(Paths.document, "user-plan.json");

if (!file.exists) {
  file.create();
}

file.write(JSON.stringify({
  user,
  goal,
  plan,
}));
```

Use `JSON.stringify` for plain data. Class instances can be written too if their fields are enumerable, but methods are not saved.

### Reading JSON On A Screen

Prefer reading files in an effect and storing the result in state.

```tsx
const [savedUserPlan, setSavedUserPlan] = useState<SavedUserPlan | null>();

useEffect(() => {
  readSavedUserPlan().then(setSavedUserPlan);
}, []);
```

The effect is used because file storage is an external system. React renders first, then the effect reads the file and updates state when the read finishes.

Use `undefined` for "still loading", `null` for "not found", and an object for "loaded".

```tsx
if (savedUserPlan === undefined) {
  return <ActivityIndicator color={setupColors.primary} />;
}

if (!savedUserPlan) {
  return <Text>No user plan found.</Text>;
}
```

### Hydrating Classes From JSON

`JSON.parse` returns plain objects. It does not recreate class instances or methods.

If a saved plan should become a `UserPlan` again, add a factory like `fromValues`:

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

```tsx
const savedPlan = JSON.parse(await file.text()) as SavedUserPlanFile;

return {
  user: savedPlan.user,
  goal: savedPlan.goal,
  plan: UserPlan.fromValues(savedPlan.plan),
};
```

Avoid using `JSON.parse` revivers for normal app data unless you truly need custom parsing for every key. Parsing once and explicitly constructing objects is easier to read and debug.

## Clerk Auth With Expo

Auth hooks come from `@clerk/expo`.

```tsx
const { isLoaded, isSignedIn } = useAuth();
```

Use `isLoaded` before rendering authenticated UI:

```tsx
if (!isLoaded) {
  return <ActivityIndicator size="large" color={setupColors.primary} />;
}
```

## Clerk Sign In / Sign Up

Sign-in screens use Clerk hooks.

```tsx
const { signIn } = useSignIn();
const { signUp } = useSignUp();
```

Use these for email/password auth and verification flows.

## Google Sign In

The Google button uses Clerk's Expo Google hook.

```tsx
const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
```

Use this when users should authenticate through Google.

## Platform

React Native `Platform` detects the OS.

```tsx
if (Platform.OS === "ios") {
  // iOS-specific behavior
}
```

Use platform checks only when behavior truly differs between iOS, Android, or web.

## Safe Area

From `react-native-safe-area-context`:

```tsx
<SafeAreaProvider>
  <SafeAreaView className="flex-1">
    {/* app content */}
  </SafeAreaView>
</SafeAreaProvider>
```

Use safe areas on screens so content avoids device notches and system UI.

## Expo Commands

From `package.json`:

```bash
npm run start
npm run ios
npm run android
npm run web
npm run lint
npm test
```

Use:

- `npm run start` to start the Expo dev server.
- `npm run ios` to open the iOS flow.
- `npm run android` to open Android.
- `npm run web` to run web.
- `npm run lint` to check code style.
- `npm test` to run Jest tests.

## When To Use What

- Use `Link` for normal navigation between screens.
- Use `useRouter` for navigation after async actions.
- Use `useLocalSearchParams` when a screen needs route values.
- Use `Stack` for multi-step setup flows.
- Use route groups to organize app sections.
- Use `Ionicons` for consistent icons.
- Use `Picker` for fixed option lists.
- Use `Slider` for numeric ranges.
- Use `SafeAreaView` for screen containers.
