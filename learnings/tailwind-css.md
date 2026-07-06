# Tailwind CSS / NativeWind Notes

This app uses Tailwind-style classes through NativeWind, so `className` works on React Native components like `View`, `Text`, `TouchableOpacity`, and `ScrollView`.

The setup visual theme uses a warm, natural palette:

- Page backgrounds: cream, usually `bg-setup-cream` or `bg-cream-50`
- Cards and inputs: warm card surfaces, usually `bg-setup-card` or `bg-cream-100`
- Borders: soft warm gray, usually `border-setup-border` or `border-light`
- Primary action color: healthy green, usually `bg-setup-primary` or `green-600`
- Selected states: soft natural green, usually `bg-setup-selected`
- Supporting text: warm muted gray, usually `text-setup-muted`
- Main text: near-black, usually `text-setup-main`

## Layout

### `flex-1`

Makes a component fill all available space.

```tsx
<SafeAreaView className="flex-1 bg-gray-50">
  <ScrollView className="flex-1" contentContainerClassName="px-5 pt-2 pb-4">
    <Text className="text-3xl font-bold text-gray-900">Setup</Text>
  </ScrollView>
</SafeAreaView>
```

Visual:

```text
+--------------------------------+
| bg-gray-50                     |
|                                |
|   Setup                        |
|                                |
|   page content fills screen    |
|                                |
+--------------------------------+
```

Use it for full-screen page wrappers, scroll containers, and loading states.

### `flex-row`

Places children horizontally instead of vertically.

```tsx
<View className="flex-row items-center">
  <Text className="text-2xl font-bold text-green-600">160 lb</Text>
  <Ionicons name="arrow-forward-outline" size={24} color="#000" />
  <Text className="text-2xl font-bold text-green-600">150 lb</Text>
</View>
```

Visual:

```text
[ 160 lb ]  ->  [ 150 lb ]
```

Use it for buttons with icons, side-by-side cards, and rows.

### `items-center`, `items-start`

Controls cross-axis alignment.

```tsx
<View className="items-center justify-center bg-white rounded-2xl p-4">
  <Text className="text-lg font-bold text-gray-900">Pace</Text>
  <Text className="text-gray-500 text-center">1.0 lb/week</Text>
</View>
```

Visual:

```text
+----------------------+
|        Pace          |
|     1.0 lb/week      |
+----------------------+
```

Use `items-center` to center children horizontally in vertical layouts or vertically in `flex-row` layouts. Use `items-start` when text should align to the top.

### `justify-center`, `justify-between`, `justify-start`

Controls main-axis spacing.

```tsx
<View className="flex-row items-center justify-between">
  <Text className="text-gray-700">Current Weight</Text>
  <Text className="text-green-600 font-bold">160 lb</Text>
</View>
```

Visual:

```text
Current Weight                  160 lb
```

Use `justify-center` for centered content, `justify-between` for separated row content, and `justify-start` for top/left alignment.

### `gap-1`, `gap-2`, `gap-3`

Adds space between children.

```tsx
<View className="flex-row gap-3">
  <GenderButton label="Male" />
  <GenderButton label="Female" />
</View>
```

Visual:

```text
[ Male ]   [ Female ]
```

Use `gap` for consistent spacing between siblings instead of adding margins to every child.

## Size

### `w-full`

Makes the component take the full width of its parent.

```tsx
<View className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3">
  <Text className="font-bold text-gray-900">Expected Pace</Text>
</View>
```

Visual:

```text
+--------------------------------+
| Expected Pace                  |
+--------------------------------+
```

Use it for full-width cards, progress bars, sliders, and buttons.

### `max-w-[180px]`, `max-w-[300px]`

Sets a custom maximum width.

```tsx
<View className="w-full max-w-[180px]" />
```

Visual:

```text
Screen width: 390px
Card width:   180px max
```

Use custom max widths for small controls. Avoid them when the element should match the screen width, like the pace info card.

### `flex-1`

Inside a row, `flex-1` makes one child take the remaining space.

```tsx
<View className="flex-row w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 gap-2">
  <View className="w-16 h-16 rounded-full bg-green-100" />
  <View className="flex-1">
    <Text className="font-bold text-gray-900">Expected Pace</Text>
    <Text className="text-sm text-gray-500">
      A slower pace is easier to sustain long term.
    </Text>
  </View>
</View>
```

Visual:

```text
+--------------------------------------+
| (icon)  Expected Pace                 |
|         text wraps in remaining space |
+--------------------------------------+
```

Use this when one element should stay fixed, like an icon, while text takes the rest.

### `w-16 h-16`

Sets a fixed square size. In this app, it keeps the green icon bubble circular.

```tsx
<View className="w-16 h-16 shrink-0 self-center rounded-full bg-green-100 items-center justify-center">
  <Ionicons name="trending-down-outline" size={30} color="#16a34a" />
</View>
```

Visual:

```text
    green circle
      _____
    /       \
   |  icon   |
    \ _____ /
```

Use fixed equal width and height when a circle must not stretch. Add `shrink-0` when the circle sits beside long text.

### `h-px`

Creates a 1-pixel divider line.

```tsx
<View className="h-px bg-gray-200" />
```

Visual:

```text
-----------------------
```

Use it for subtle dividers inside cards and forms.

## Relative Sizing Patterns

Relative sizing means the UI adapts to the screen instead of relying on one exact pixel width. This matters a lot in React Native because the same screen may run on a small phone, large phone, tablet, or web.

### Full-width screen content with page padding

```tsx
<ScrollView
  className="flex-1"
  contentContainerClassName="px-5 pt-2 pb-4"
>
  <TouchableOpacity className="w-full bg-green-600 rounded-2xl py-4 items-center">
    <Text className="text-white font-bold text-lg">Continue</Text>
  </TouchableOpacity>
</ScrollView>
```

Visual:

```text
screen width
+--------------------------------------+
| px-5                                 |
|   +------------------------------+   |
|   |          Continue            |   |
|   +------------------------------+   |
+--------------------------------------+
```

Real-world rule: give the page padding, then use `w-full` inside it. This makes the button line up with cards and sliders.

### Fixed icon plus flexible text

```tsx
<View className="flex-row w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 gap-2">
  <View className="w-16 h-16 shrink-0 self-center rounded-full bg-green-100" />
  <View className="flex-1">
    <Text className="text-lg font-bold text-gray-900">Expected Pace</Text>
    <Text className="text-sm text-gray-500">
      A faster pace can show quick results, but is harder to sustain long term.
    </Text>
  </View>
</View>
```

Visual:

```text
+--------------------------------------+
|  64px   fills remaining width         |
| circle  text can wrap naturally       |
+--------------------------------------+
```

Real-world rule: fixed-size decorative/control element, `flex-1` content beside it.

### Two cards in one row

```tsx
<View className="flex-row gap-3">
  <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
    <Text className="text-gray-700 font-medium">Current</Text>
    <Text className="text-2xl font-bold text-green-600">160 lb</Text>
  </View>

  <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
    <Text className="text-gray-700 font-medium">Goal</Text>
    <Text className="text-2xl font-bold text-green-600">150 lb</Text>
  </View>
</View>
```

Visual:

```text
+----------------+   +----------------+
| Current        |   | Goal           |
| 160 lb         |   | 150 lb         |
+----------------+   +----------------+
```

Real-world rule: two equal columns should usually both be `flex-1`, with a parent `gap`.

### Three cards in one row

When three inputs need to stay on one row, avoid hard-coded widths like `w-28` on every card. Fixed widths can look okay on one phone and overflow by a few pixels on another.

Use a row parent with a small gap, then let each child flex into the available space:

```tsx
<View className="flex-row items-center justify-between gap-2 mb-6">
  <WeightPicker className="flex-1 h-48 min-w-0" />
  <EditBox className="flex-1 h-48 min-w-0 justify-center" />
  <HeightPicker className="flex-1 h-48 min-w-0" />
</View>
```

Visual:

```text
+----------+  +----------+  +----------+
| Weight   |  | Age      |  | Height   |
+----------+  +----------+  +----------+
```

Important pieces:

- `flex-1` makes each card take an equal share of the row.
- `gap-2` creates consistent spacing between cards.
- `min-w-0` lets a flex child shrink below its content's preferred width instead of forcing the row off-screen.
- Keep the parent page padding consistent, such as `px-5`, so all cards line up with headers and buttons.

Real-world rule: for three equal cards, prefer `flex-1 min-w-0` over fixed widths.

### Four cards in one row

Four cards can fit on one row, but they need to be narrower and their text must be allowed to wrap.

```tsx
<View className="flex-row items-start justify-between">
  <ActivityButton label="Sedentary" />
  <ActivityButton label="Lightly Active" />
  <ActivityButton label="Active" />
  <ActivityButton label="Very Active" />
</View>
```

Inside the reusable button:

```tsx
<TouchableOpacity className="w-[23%] rounded-xl">
  <View className="w-full h-32 rounded-2xl px-2 py-3">
    <Text numberOfLines={2} className="text-xs font-bold text-center">
      {label}
    </Text>
  </View>
</TouchableOpacity>
```

Why `w-[23%]` instead of `w-1/4`:

- Four cards at exactly `25%` each leave no room for gaps or rounding.
- `23%` gives the row breathing room while still reading as four equal columns.
- `numberOfLines={2}` lets labels like `Lightly Active` wrap instead of shrinking the whole design.

Real-world rule: for four small cards, use percentage widths around `23%`, compact padding, and short text. If the content becomes too dense, switch to a two-column wrap.

### Small controls with a max width

```tsx
<View className="w-full max-w-[180px] rounded-2xl border border-gray-200 bg-white p-4">
  <Text className="text-gray-700">Age</Text>
  <Text className="text-2xl font-bold text-green-600">25</Text>
</View>
```

Visual:

```text
on small screens:  fills available width up to parent
on large screens:  stops at 180px
```

Real-world rule: use `max-w-*` for compact inputs, profile stats, and small cards. Do not use it for page-wide sections.

### Progress bars

```tsx
<View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  <View className="h-full bg-green-600 rounded-full" style={{ width: "50%" }} />
</View>
```

Visual:

```text
+--------------------------------------+
| green filled half | gray empty half   |
+--------------------------------------+
```

Real-world rule: parent is `w-full`; child uses a percentage width from state.

### Responsive text blocks

```tsx
<View className="flex-1">
  <Text className="text-sm text-gray-500">
    This message wraps because the parent is flexible.
  </Text>
</View>
```

Visual:

```text
small phone:  This message wraps
              onto more lines.

large phone:  This message wraps less.
```

Real-world rule: let text wrap first. Avoid shrinking font sizes just to force text into one line.

### When fixed sizes are good

Use fixed sizes for elements that must keep shape:

```tsx
<View className="w-16 h-16 rounded-full bg-green-100" />
<View className="w-2 h-2 rounded-full bg-green-600" />
<View className="h-px bg-gray-200" />
```

Good fixed-size elements:

- icons
- circular status dots
- slider ticks
- dividers
- small edit buttons

Avoid fixed widths for:

- full page cards
- primary buttons
- long text containers
- forms that must work across screen sizes

## Spacing

### Padding: `p-4`, `px-4`, `py-3`, `pt-2`, `pb-4`

Padding is space inside an element.

```tsx
<View className="bg-white rounded-2xl px-4 py-3">
  <Text className="text-lg font-bold text-gray-900">Expected Pace</Text>
</View>
```

Visual:

```text
+------------------------------+
| px-4                         |
|   Expected Pace              |
| py-3                         |
+------------------------------+
```

Use `px` for left/right, `py` for top/bottom, and `p` for all sides.

### Margin: `mb-3`, `mt-2`, `ml-3`, `mr-2`, `my-3`

Margin is space outside an element.

```tsx
<Text className="text-lg font-bold text-gray-900 mb-3">Pace</Text>
```

Visual:

```text
Pace

[slider starts here]

```

Use margins to separate sections. Prefer `gap` for spacing inside a row/column of siblings.

## Borders And Radius

### `border`, `border-setup-border`, `border-light`

Adds a border and color.

```tsx
<View className="rounded-2xl border border-setup-border bg-setup-card p-4">
  <Text className="text-setup-main font-bold">Goal Weight</Text>
</View>
```

Visual:

```text
+------------------------------+
| Goal Weight                  |
+------------------------------+
```

Use it for cards, inputs, and selectable controls.

### `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`

Rounds corners.

```tsx
<TouchableOpacity className="bg-setup-primary rounded-2xl py-4 items-center">
  <Text className="text-white font-bold">Continue</Text>
</TouchableOpacity>
```

Visual:

```text
rounded-lg    [ input     ]
rounded-xl    [ button      ]
rounded-2xl   [ big card       ]
rounded-full  ( circle / pill )
```

Use `rounded-full` for circles/pills, `rounded-2xl` for big setup cards/buttons, and `rounded-lg` for smaller inputs.

## Color

### Project Theme Tokens

This project keeps setup colors in one source file:

```text
src/app/(app)/(tabs)/(setup)/setup-colors.json
```

That JSON file feeds both TypeScript and Tailwind:

```ts
// setup-theme.ts
import setupColors from './setup-colors.json';

export { setupColors };
```

```js
// tailwind.config.js
const setupColors = require("./src/app/(app)/(tabs)/(setup)/setup-colors.json");

module.exports = {
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        setup: {
          primary: setupColors.primary,
          dark: setupColors.dark,
          soft: setupColors.soft,
          selected: setupColors.selected,
          cream: setupColors.cream,
          card: setupColors.card,
          border: setupColors.border,
          main: setupColors.textMain,
          muted: setupColors.textMuted,
        },
      },
    },
  },
};
```

Use NativeWind classes for normal UI styling:

```tsx
<SafeAreaView className="flex-1 bg-setup-cream">
  <View className="rounded-2xl border border-setup-border bg-setup-card p-4">
    <Text className="text-setup-main font-bold">Daily Targets</Text>
    <Text className="text-setup-muted">rough estimate</Text>
  </View>
</SafeAreaView>
```

Use raw color values from `setupColors` only when a React Native or Expo API needs a color prop:

```tsx
import { setupColors } from './setup-theme';

<ActivityIndicator color={setupColors.primary} />
<Ionicons name="leaf" color={setupColors.planIcons.carbs} />
```

Good rule: if the element supports `className`, prefer a semantic NativeWind class. If the prop is named `color`, `thumbTintColor`, `minimumTrackTintColor`, or similar, pass the hex value from `setupColors`.

### Current Setup Palette

```text
Primary green       green-600      #3F8F2F
Primary dark green  green-700      #2F7D27
Soft green bg       green-50       #F1F8EA
Soft selected green green-100      #E6EBD1
Muted olive         olive-400      #929881
Leaf accent         leaf-500       #5B8934
Cream background    cream-50       #FCFBF9
Warm card bg        cream-100      #F9F8F4
Border light        border-light   #E4E4E0
Text primary        text-main      #0A0A0A
Text secondary      text-muted     #65615F
Text dark olive     text-olive     #313128
Icon orange/fire    orange-500     #D95B1E
Fat/yellow accent   yellow-400     #F4C84A
Purple accent       purple-300     #B8A7F0
```

The app also exposes semantic setup aliases:

```text
bg-setup-primary
text-setup-primary
text-setup-dark
bg-setup-soft
bg-setup-selected
bg-setup-cream
bg-setup-card
border-setup-border
text-setup-main
text-setup-muted
bg-setup-olive
```

Prefer the `setup-*` classes inside setup screens because they describe intent. Use palette aliases like `green-600`, `cream-50`, or `olive-400` when matching a design spec directly.

### Backgrounds: `bg-setup-cream`, `bg-setup-card`, `bg-setup-primary`, `bg-setup-soft`

```tsx
<SafeAreaView className="flex-1 bg-setup-cream">
  <View className="bg-setup-card border border-setup-border rounded-2xl p-4">
    <View className="w-16 h-16 rounded-full bg-setup-soft" />
    <TouchableOpacity className="bg-setup-primary rounded-2xl py-4" />
  </View>
</SafeAreaView>
```

Visual:

```text
bg-setup-cream    full screen background
bg-setup-card     card/input surface
bg-setup-primary  primary button or active state
bg-setup-soft     soft icon circle or info surface
```

Use cream and card backgrounds for structure. Use green for primary nutrition/setup actions and selected states.

### Text: `text-setup-main`, `text-setup-muted`, `text-setup-primary`, `text-white`

```tsx
<Text className="text-setup-main font-bold">Expected Pace</Text>
<Text className="text-setup-muted">Sustainable long term.</Text>
<Text className="text-setup-primary font-bold">160 lb</Text>
```

Visual:

```text
text-setup-main     Expected Pace
text-setup-muted    helper text / explanations
text-setup-primary  selected value, edit link
text-white          button text on green
```

Use `text-setup-main` for important content and `text-setup-muted` for supporting descriptions.

## Typography

### `text-xs`, `text-sm`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`

Controls font size.

```tsx
<Text className="text-3xl font-bold text-gray-900 text-center">
  What's your Goal?
</Text>
<Text className="text-sm text-gray-500 text-center">
  Choose what you want to work towards
</Text>
```

Visual:

```text
text-xs   tiny helper / validation
text-sm   body helper text
text-lg   section heading
text-2xl  important numeric value
text-3xl  page title
```

Use larger text for page headings and smaller text for helper copy.

### `font-medium`, `font-semibold`, `font-bold`

Controls text weight.

```tsx
<Text className="text-white font-bold text-lg">Continue</Text>
```

Visual:

```text
font-medium    form label
font-semibold  secondary action
font-bold      page title, value, primary button
```

## Positioning

### `relative`, `absolute`, `top-0`, `left-0`, `right-0`, `bottom-0`

Used in the pace slider for ticks and the floating value bubble.

```tsx
<View className="relative">
  <View className="absolute top-0 bg-green-600 px-3 py-1 rounded-full z-10">
    <Text className="text-white text-xs font-bold">1.0 lb/week</Text>
  </View>
</View>
```

Visual:

```text
relative parent
+--------------------------------+
| [ 1.0 lb/week ]                |
|                                |
| slider track goes here         |
+--------------------------------+
```

Use `relative` on the parent when children need exact placement.

### `z-10`

Moves an element visually above other elements.

```tsx
<View className="absolute z-10" />
```

Use it for floating labels or bubbles that should not be hidden.

## Overflow

### `overflow-hidden`

Clips child content that goes outside the parent.

```tsx
<View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  <View className="h-full bg-green-600 rounded-full" style={{ width: "50%" }} />
</View>
```

Visual:

```text
[ green progress ] [ clipped gray track ]
```

Use it for progress bars, picker windows, and rounded containers.

## State-Based Classes

You used conditional strings to change styling based on state.

```tsx
className={
  "rounded-xl border px-4 py-3 " +
  (selected
    ? "bg-green-600 border-green-600"
    : "bg-white border-gray-200")
}
```

Use this for selected cards, disabled buttons, and active slider ticks.

## Further References

- Tailwind CSS docs: https://tailwindcss.com/docs
- NativeWind docs: https://www.nativewind.dev/
- React Native layout docs: https://reactnative.dev/docs/flexbox
