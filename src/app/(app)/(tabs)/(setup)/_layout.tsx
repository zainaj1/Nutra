import { SetupHeader } from '@/components/design/setup-chrome';
import colors from '@/constants/studio-colors.json';
import { Stack } from 'expo-router';

export default function SetupLayout() {
    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.cream },
            animation: 'slide_from_right',
            gestureEnabled: true,
        }}>
            {['user-metrics', 'user-goals', 'user-plan', 'setup-meals', 'select-meals'].map((name, index) => (
                <Stack.Screen key={name} name={name} options={{ header: () => <SetupHeader step={index + 1} /> }} />
            ))}
        </Stack>
    );
}
