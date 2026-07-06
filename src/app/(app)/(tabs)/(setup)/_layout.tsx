import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { setupColors } from './setup-theme';

function SetupProgressHeader({
    currentStep,
    totalSteps,
}: {
    currentStep: number;
    totalSteps: number;
}) {
    const progress = currentStep / totalSteps;

    return (
        <View className="w-full px-4">
            <Text className="text-sm font-semibold text-setup-dark text-center mb-2">
                {currentStep} of {totalSteps}
            </Text>

            <View className="w-full h-2 bg-setup-border rounded-full overflow-hidden">
                <View
                    className="h-full bg-setup-primary rounded-full"
                    style={{
                        width: `${progress * 100}%` as `${number}%`,
                    }}
                />
            </View>
        </View>
    );
}

export default function SetupLayout() {
    const totalSteps = 3;

    return (
        <Stack
            screenOptions={{
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                headerTintColor: setupColors.primary,

                headerStyle: {
                    backgroundColor: setupColors.cream,
                },

                animation: 'slide_from_right',
                animationDuration: 250,
                gestureEnabled: true,
            }}
        >
            <Stack.Screen
                name="user-metrics"
                options={{
                    headerTitle: () => (
                        <SetupProgressHeader
                            currentStep={1}
                            totalSteps={totalSteps}
                        />
                    ),
                }}
            />

            <Stack.Screen
                name="user-goals"
                options={{
                    headerTitle: () => (
                        <SetupProgressHeader
                            currentStep={2}
                            totalSteps={totalSteps}
                        />
                    ),
                }}
            />

            <Stack.Screen
                name="finalize-plan"
                options={{
                    headerTitle: () => (
                        <SetupProgressHeader
                            currentStep={3}
                            totalSteps={totalSteps}
                        />
                    ),
                }}
            />
        </Stack>
    );
}
