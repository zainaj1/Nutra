import { useAuth } from '@clerk/expo'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, View } from 'react-native'



export default function Layout() {

    const { isSignedIn, isLoaded } = useAuth()
    const [count, setCount] = useState(0);

    if (!isLoaded) {
        return (<View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
        )
    }

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: 'white',
                },
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerBackVisible: true,
                headerBackTitle: 'Back',
                headerShadowVisible: false,
            }}>
            <Stack.Screen name="user-metrics" options={{ title: `1` }} />
            <Stack.Screen name="user-goals" options={{ title: `2` }} />
            <Stack.Screen name="user-pace" options={{ title: `3` }} />
            <Stack.Screen name="finalize-plan" options={{ title: `4` }} />
        </Stack>

    )
}