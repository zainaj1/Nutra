import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

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
            <Text className="text-sm font-semibold text-green-700 text-center mb-2">
                {currentStep} of {totalSteps}
            </Text>

            <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                    className="h-full bg-green-600 rounded-full"
                    style={{
                        width: `${progress * 100}%` as `${number}%`,
                    }}
                />
            </View>
        </View>
    );
}

export default function SetupLayout() {
    const totalSteps = 4;

    return (
        <Stack
            screenOptions={{
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                headerTintColor: '#16a34a',

                headerStyle: {
                    backgroundColor: '#f9fafb',
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
                name="user-preferences"
                options={{
                    headerTitle: () => (
                        <SetupProgressHeader
                            currentStep={3}
                            totalSteps={totalSteps}
                        />
                    ),
                }}
            />

            <Stack.Screen
                name="user-summary"
                options={{
                    headerTitle: () => (
                        <SetupProgressHeader
                            currentStep={4}
                            totalSteps={totalSteps}
                        />
                    ),
                }}
            />
        </Stack>
    );
}