import { useSignInWithGoogle } from '@clerk/expo/google'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Alert, Platform, Text, TouchableOpacity, View } from 'react-native'

interface GoogleSignInButtonProps {
    onSignInComplete?: () => void
    showDivider?: boolean
}

export default function GoogleSignInButton({
    onSignInComplete,
    showDivider = true,
}: GoogleSignInButtonProps) {
    const { startGoogleAuthenticationFlow } = useSignInWithGoogle()
    const router = useRouter()

    // Only render on iOS and Android
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        return null
    }

    const handleGoogleSignIn = async () => {
        try {
            const { createdSessionId, setActive } = await startGoogleAuthenticationFlow()

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId })

                if (onSignInComplete) {
                    onSignInComplete()
                } else {
                    router.replace('/')
                }
            }
        } catch (err: any) {
            if (err.code === 'SIGN_IN_CANCELLED' || err.code === '-5') {
                return
            }

            Alert.alert('Error', err.message || 'An error occurred during Google sign-in')
            console.error('Sign in with Google error:', JSON.stringify(err, null, 2))
        }
    }

    return (
        <TouchableOpacity
            onPress={handleGoogleSignIn}
            className="bg-white border-gray-300 rounded-xl py-4 px-4 mb-4 shadow-sm"
            activeOpacity={0.8}
        >
            <View className="flex-row items-center justify-center">
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text className="text-lg ml-3 font-semibold text-gray-900"> Sign in with Google</Text>
            </View>
        </TouchableOpacity>
    )
}