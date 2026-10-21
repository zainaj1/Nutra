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

Home reads `user-plan.json` and only fetches when `planSetup` is explicitly `true`
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
Recipe cards open details using the
already loaded data; API errors show an error message.
