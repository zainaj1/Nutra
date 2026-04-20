import { useSignIn } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function Page() {
    const { signIn, errors, fetchStatus } = useSignIn()
    const [isLoading] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        if (errors) {
            console.log('Sign in errors:', errors) // TODO: remove debug logs before prod release
        }
    }, [errors])

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [code, setCode] = React.useState('')

    const handleSubmit = async () => {
        const { error } = await signIn.password({
            emailAddress,
            password,
        })
        if (error) {
            console.error(JSON.stringify(error, null, 2))
            return
        }

        if (signIn.status === 'complete') {
            await signIn.finalize({
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
        } else if (signIn.status === 'needs_second_factor') {
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
        } else if (signIn.status === 'needs_client_trust') {
            // For other second factor strategies,
            // see https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
            const emailCodeFactor = signIn.supportedSecondFactors.find(
                (factor) => factor.strategy === 'email_code',
            )

            if (emailCodeFactor) {
                await signIn.mfa.sendEmailCode()
            }
        } else {
            // Check why the sign-in is not complete
            console.error('Sign-in attempt not complete:', signIn)
        }
    }

    const handleVerify = async () => {
        await signIn.mfa.verifyEmailCode({ code })

        if (signIn.status === 'complete') {
            await signIn.finalize({
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
            // Check why the sign-in is not complete
            console.error('Sign-in attempt not complete:', signIn)
        }
    }

    if (signIn.status === 'needs_client_trust') {
        return (
            <SafeAreaProvider className="flex-1 p-5 gap-3">
                <Text className="text-2xl font-bold mb-4 py-3 px-6">
                    Verify your account
                </Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-2"
                    value={code}
                    placeholder="Enter your verification code"
                    placeholderTextColor="#666666"
                    onChangeText={(code) => setCode(code)}
                    keyboardType="numeric"
                />
                {errors.fields.code && (
                    <Text className="text-red-600 text-xs -mt-2">{errors.fields.code.message}</Text>
                )}
                <Pressable
                    className={`bg-blue-600 py-3 px-6 rounded-lg items-center mt-2 ${fetchStatus === 'fetching' ? 'opacity-50' : ''
                        }`}
                    onPress={handleVerify}
                    disabled={fetchStatus === 'fetching'}
                >
                    <Text className="text-white font-semibold">Verify</Text>
                </Pressable>
                <Pressable className="py-3 px-6 rounded-lg items-center mt-2">
                    <Text
                        className="text-blue-600 font-semibold"
                        onPress={() => signIn.mfa.sendEmailCode()}
                    >
                        I need a new code
                    </Text>
                </Pressable>
                <Pressable className="py-3 px-6 rounded-lg items-center mt-2">
                    <Text
                        className="text-blue-600 font-semibold"
                        onPress={() => signIn.reset()}
                    >
                        Start over
                    </Text>
                </Pressable>
            </SafeAreaProvider>
        )
    }

    return (
        <SafeAreaProvider className="flex-1">

            <View className="flex-1 px-6">

                {/* Header Section */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1">
                    <View className="flex-1 justify-center scale-90">

                        {/* Logo */}
                        <View className="items-center mb-2">
                            <View className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                                <Ionicons name="restaurant-outline" size={40} color="white" />
                            </View>
                            <Text className="text-3xl font-bold text-gray-900 mb-2">
                                Nutra
                            </Text>
                            <Text className="text-lg text-gray-600 text-center">
                                A nutrition and meal planning app{"\n"} to help you stay on track with your health goals
                            </Text>
                        </View>

                        {/* Sign-in Form Section */}
                        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                            <Text className="text-2xl font-bold mb-6 text-gray-900 text-center">
                                Welcome Back
                            </Text>


                            {/* Email input */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </Text>
                                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                                    <Ionicons name="mail-outline" size={20} color="#6B7280" />
                                    <TextInput
                                        autoCapitalize="none"
                                        value={emailAddress}
                                        placeholder="Enter email"
                                        placeholderTextColor="#9CA3AF"
                                        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                                        keyboardType="email-address"
                                        className="flex-1 ml-3 text-gray-900"
                                        editable={!isLoading}
                                    />
                                </View>

                            </View>
                            {errors.fields.identifier && (
                                <Text className="text-red-600 text-xs -mt-2">{errors.fields.identifier.message}</Text>
                            )}

                            {/* Password input */}
                            <View className="mb-6">
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </Text>
                                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                                    <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                                    <TextInput
                                        value={password}
                                        placeholder="Enter password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={true}
                                        onChangeText={(password) => setPassword(password)}
                                        className="flex-1 ml-3 text-gray-900"
                                        editable={!isLoading}
                                    />
                                </View>
                            </View>
                            {errors.fields.password && (
                                <Text className="text-red-600 text-xs -mt-2">{errors.fields.password.message}</Text>
                            )}
                        </View>

                        {/* Sign in button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isLoading}
                            className={"rounded-xl py-4 shadow-sm mb-4 " + (isLoading ? "bg-gray-400" : "bg-blue-600")}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center justify-center">
                                {isLoading ? (
                                    <Ionicons name="refresh" size={20} color="white" className="animate-spin" />
                                ) : (
                                    <Ionicons name="log-in-outline" size={20} color="white" />
                                )}
                                <Text className="text-white font-semibold text-lg ml-2">
                                    {isLoading ? "Signing in..." : "Sign In"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
                {/* Divider */}
                <View className="flex-row items-center my-4">
                    <View className="flex-1 h-px bg-gray-200" />
                    <Text className="px-4 text-gray-500 text-sm">or</Text>
                    <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Google Sign In  */}
                {/* <GoogleSignInButton>    </GoogleSignInButton> */}


                {/* Footer Section */}
                <View className="pb-6 items-center flex-col">
                    <Text className=" text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/sign-up">
                            <Text className="text-blue-600 font-semibold pb-6">
                                Sign up
                            </Text>
                        </Link>
                    </Text>
                    <Text className="text-xs text-gray-500 py-4 pb-0">
                        Smarter nutrition, personalized for you.
                    </Text>
                </View>

            </View>
        </SafeAreaProvider >
    )
}
