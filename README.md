# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure the backend host in `.env`:

   ```dotenv
   EXPO_PUBLIC_ADDRESS=192.168.1.100
   ```

   Use your backend computer's hostname or LAN IP, without a protocol or port;
   requests use `http://<host>:8000/api/...`. On a physical phone, the host must
   be reachable from the phone. Fully reload the app after changing this value.
   Expo exposes `EXPO_PUBLIC_` variables in the app bundle, so use them only for
   public configuration.

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Plan creation requests

Creation sends an `Idempotency-Key` header; the JSON requirements body is unchanged.
The app writes the key and requirements to a user/backend-specific file before
sending a POST, then reuses that intent after retries, remounts, and app restarts.
A storage failure stops the request. “Create My Plan” on Home starts a new intent.
Changing requirements within an existing intent requires starting a new plan;
HTTP 409 conflicts do not silently generate a replacement key.

Keys are local to each device. Multiple devices must receive the same intent key
through a separate sharing/sync mechanism to refer to the same creation. Locally
generated keys on different devices represent different intents. Backend memory
resets and multiple workers remain limitations of the backend's current storage.

## Home recipes

Without an explicit `generationId` URL parameter, Home reads `user-plan.json` and only fetches when `planSetup` is explicitly `true`
and `plan-id` is a nonempty generation ID. Missing, unreadable, or incomplete setup
records show the original setup screen without a recipe request. Old records
without `planSetup: true` also default to setup.

For completed plans, Home makes one authenticated GET to
`/api/plan_generations/{generation_id}/recipies` per page mount, after
authentication loads. Re-renders, opening recipe details, switching
back to an already mounted tab, and development effect replay do not fetch again.
There is no polling or automatic retry. Completing a new plan starts a fresh Home
load using its generation ID as the page key.

The saved `planSetup` boolean becomes true when all required recipes are accepted.
An explicit false, a null/empty recipe response, a `404` with
`reason: "Plan generation not found"` (or the default FastAPI `detail` field),
or no saved generation ID shows the original setup screen. A missing-plan
response also clears the matching saved ID and sets `planSetup` to false, so a
backend restart does not leave the device repeatedly fetching a stale plan.
An explicit `generationId` loads that plan instead of the device's saved plan.
Recipe cards open details using the
already loaded data; API errors show an error message.

## Pantry

Groceries live in the bottom navigation's **Groceries** tab. Opening the tab directly
loads the current saved plan; no saved plan shows a link to Home to get started.
Completed recipe selection and Home offer **View groceries**, which opens Groceries.
The protected route `/plan?generationId=<plan-id>` uses the existing query-parameter convention and
exports as a static page, allowing direct navigation and refresh for arbitrary
plan IDs without generating individual pages at build time. Older `/pantry` links
redirect into the Groceries tab, preserving the plan ID. **Back to plan**
resumes `/select-meals?generationId=<plan-id>` through an authenticated GET;
a missing linked plan never triggers creation of a replacement.

Pantry fetches `/api/plan_generations/{plan-id}/grocery_list` using the Clerk
authenticated client. It ignores the response's `generation_id` (a pantry UUID),
preserves every item row and original quantity. Familiar raw produce and eggs show
approximate whole shopping items, with original recipe totals underneath; known
count units get natural names such as "12 eggs". Unsupported foods and measures
keep their supplied quantities without fixed decimal rounding. See
[grocery quantity rules and sources](docs/grocery-quantities.md) for coverage and
limitations. Very small unconverted quantities may use scientific notation. There are no editing
or persisted checkbox controls.

State is scoped to the signed-in user and route plan. Each focus and explicit retry
fetches fresh data, including after completion of recipe selection. A missing
pantry triggers a plan-status GET so only `IN_PROGRESS` plans show completion
instructions. Completed or cancelled plans offer retry. Missing plans, session
expiry, malformed responses, and service failures have distinct error handling;
only a successful empty `items` array shows the empty state. Session expiry offers
Clerk sign-out followed by the existing sign-in routing flow.

Run the relevant tests with:

```bash
npm test -- --preset jest-expo --runInBand --watchman=false __tests__/pantry.test.tsx __tests__/home-recipes.test.tsx __tests__/select-meals-initialization.test.tsx
```

## Design theme

Setup, authentication, Plan, and Settings follow the supplied Figma Make design:
forest green, warm off-white backgrounds, sage selections, rounded cards, and
segmented setup progress. The separate `studio` palette in
`constants/studio-colors.json` keeps Home's existing theme and layout unchanged.

`components/design/glass-surface.tsx` provides small glass surfaces for setup
navigation, the Continue area, recipe labels, and account controls. It uses
[Expo GlassEffect](https://docs.expo.dev/versions/v57.0.0/sdk/glass-effect/) when
the native API is available, blur on supported fallback platforms, and a solid
surface on Android or when Reduce Transparency is enabled. Glass is decorative;
the controls and their accessibility labels remain ordinary React Native views.
