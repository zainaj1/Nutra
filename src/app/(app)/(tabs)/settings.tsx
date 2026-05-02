import { useAuth, useClerk } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'


export default function Settings() {
    const { isSignedIn, isLoaded } = useAuth()
    const { signOut } = useClerk()
    const router = useRouter()
    const handleSignOut = async () => {
        try {
            await signOut()
            // Redirect to your desired page
            router.replace('/')
        } catch (err) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        }
    }

    if (!isLoaded) {
        return (<View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
        )
    }

    return (
        <SafeAreaProvider className="flex-1">
            <View className="flex-1 px-6">
                {/* Header Section */}
                <Text className="center-text px-6">Settings</Text>
                <View className="flex-1 justify-center">

                    <View>
                        <Pressable
                            onPress={handleSignOut}
                        >
                            <Text>Sign out</Text>
                        </Pressable>
                    </View>
                </View >
            </View>
        </SafeAreaProvider >
    )
}