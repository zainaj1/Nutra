import { useAuth, useSignUp } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'


export default function Page() {
    const { signUp, errors, fetchStatus } = useSignUp()
    const { isSignedIn } = useAuth()
    const router = useRouter()

    React.useEffect(() => {
        if (errors) {
            console.log('Sign up errors:', errors) // TODO: remove debug logs before prod release
        }
    }, [errors])

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [code, setCode] = React.useState('')

    const handleSubmit = async () => {
        const { error } = await signUp.password({
            emailAddress,
            password,
        })
        if (error) {
            console.error(JSON.stringify(error, null, 2))
            return
        }

        if (!error) await signUp.verifications.sendEmailCode()
    }

    const handleVerify = async () => {
        await signUp.verifications.verifyEmailCode({
            code,
        })
        if (signUp.status === 'complete') {
            await signUp.finalize({
                // Redirect the user to the home page after signing up
                navigate: ({ session, decorateUrl }) => {
                    // Handle session tasks
                    // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                    if (session?.currentTask) {
                        console.log(session?.currentTask)
                        return
                    }

                    // If no session tasks, navigate the signed-in user to the home page
                    const url = decorateUrl('/')
                    if (url.startsWith('http')) {
                        window.location.href = url
                    } else {
                        router.push(url as Href)
                    }
                },
            })
        } else {
            // Check why the sign-up is not complete
            console.error('Sign-up attempt not complete:', signUp)
        }
    }

    if (signUp.status === 'complete' || isSignedIn) {
        return null
    }

    if (
        signUp.status === 'missing_requirements' &&
        signUp.unverifiedFields.includes('email_address') &&
        signUp.missingFields.length === 0
    ) {
        return (
            <SafeAreaProvider>
                <Text>
                    Verify your account
                </Text>
                <TextInput
                    value={code}
                    placeholder="Enter your verification code"
                    placeholderTextColor="#666666"
                    onChangeText={(code) => setCode(code)}
                    keyboardType="numeric"
                />
                {errors.fields.code && (
                    <Text>{errors.fields.code.message}</Text>
                )}
                <Pressable
                    onPress={handleVerify}
                    disabled={fetchStatus === 'fetching'}
                >
                    <Text>Verify</Text>
                </Pressable>
                <Pressable
                    onPress={() => signUp.verifications.sendEmailCode()}
                >
                    <Text>I need a new code</Text>
                </Pressable>
            </SafeAreaProvider>
        )
    }

    return (
        <SafeAreaProvider className="flex-1">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header Section */}
                <View className=" container flex-1 justify-center">
                    {/* Logo */}
                    <View className="items-center mb-2">
                        <View className="w-20 h-15 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                            <Ionicons name="restaurant-outline" size={40} color="white" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-900 mb-2">
                            Nutra
                        </Text>
                        <Text className="text-lg text-gray-600 text-center">
                            A nutrition and meal planning app{"\n"} to help you stay on track with your health goals
                        </Text>
                    </View>
                </View>

                <Text>
                    Sign up
                </Text>

                <Text>Email address</Text>
                <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter email"
                    placeholderTextColor="#666666"
                    onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                    keyboardType="email-address"
                />
                {errors.fields.emailAddress && (
                    <Text>{errors.fields.emailAddress.message}</Text>
                )}
                <Text>Password</Text>
                <TextInput
                    value={password}
                    placeholder="Enter password"
                    placeholderTextColor="#666666"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                />
                {errors.fields.password && (
                    <Text>{errors.fields.password.message}</Text>
                )}
                <Pressable
                    onPress={handleSubmit}
                    disabled={!emailAddress || !password || fetchStatus === 'fetching'}
                >
                    <Text>Sign up</Text>
                </Pressable>

                <View>
                    <Text>Already have an account? </Text>
                    <Link href="/sign-in">
                        <Text>Sign in</Text>
                    </Link>
                </View>

                {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
                <View nativeID="clerk-captcha" />
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    )
}