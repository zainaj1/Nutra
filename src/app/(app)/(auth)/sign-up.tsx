import AuthPage from '@/components/design/auth-page';
import { useAuth, useSignUp } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native'


export default function Page() {
    const { signUp, errors, fetchStatus } = useSignUp()
    const [isLoading] = React.useState(false)
    const { isSignedIn } = useAuth()
    const router = useRouter()

    const { height } = Dimensions.get('window')
    const iconSize = height > 700 ? 40 : 30


    React.useEffect(() => {
        if (errors) {
            console.log('Sign up errors:', errors) // TODO: remove debug logs before prod release
        }
    }, [errors])

    const [username, setUsername] = React.useState('')
    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')

    const [code, setCode] = React.useState('')

    const handleSubmit = async () => {
        const { error } = await signUp.password({
            username,
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
                        console.log("Logging in here")
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
            <AuthPage>
                <View className="flex-1">
                    <View className="flex-1 justify-center">
                        {/* Logo */}
                        <View className="items-center mb-6" style={{ flexShrink: 1 }}>
                            <View className="w-20 h-20 bg-studio-primary rounded-2xl items-center justify-center mb-2 shadow-sm">
                                <Ionicons name="restaurant-outline" size={iconSize} color="white" />
                            </View>
                            <Text className="text-3xl font-bold text-studio-main mb-2">
                                Join Nutra
                            </Text>
                            <Text className="text-lg text-studio-muted text-center">
                                A nutrition and meal planning app{"\n"} to help you stay on track
                            </Text>
                        </View>

                        {/* Header Section */}

                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-studio-border mb-6" style={{ flexShrink: 1 }}
                        >
                            <Text className="text-xl text-studio-main font-bold text-center mb-4">
                                Verify your account
                            </Text>

                            <View className="flex-row items-center bg-studio-cream rounded-xl border-studio-border border px-4 py-4 mb-2">
                                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                                <TextInput
                                    value={code}
                                    placeholder=" Enter your verification code"
                                    placeholderTextColor="#666666"
                                    onChangeText={(code) => setCode(code)}
                                    keyboardType="numeric"
                                />
                                {errors.fields.code && (
                                    <Text>{errors.fields.code.message}</Text>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={handleVerify}
                                disabled={fetchStatus === 'fetching'}
                                className={"rounded-xl py-4 px-4 shadow-sm mb-2 " + (isLoading ? "bg-gray-400" : "bg-studio-primary")}
                                activeOpacity={0.8}
                            >
                                <View className="flex-row items-center justify-center">
                                    {isLoading ?
                                        (<Ionicons name="refresh" size={20} color="white" className="animate-spin" />) :
                                        (<Ionicons name="person-add-outline" size={20} color="white" />)}
                                    <Text className='text-white font-semibold text-lg ml-2'>Verify</Text>
                                </View>
                            </TouchableOpacity>
                            <View className="flex-row items-center justify-center mb-6">
                                <Pressable
                                    onPress={() => signUp.verifications.sendEmailCode()}
                                >
                                    <Text className="text-studio-primary font-semibold">I need a new code</Text>
                                </Pressable>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </View >
            </AuthPage>
        )
    }
    return (
        <AuthPage>
            <View className="flex-1">
                {/* Header Section */}

                <View className="flex-1 justify-center">

                    {/* Logo */}
                    <View className="items-center mb-6" style={{ flexShrink: 1 }}>
                        <View className="w-20 h-20 bg-studio-primary rounded-2xl items-center justify-center mb-2 shadow-sm">
                            <Ionicons name="restaurant-outline" size={iconSize} color="white" />
                        </View>
                        <Text className="text-3xl font-bold text-studio-main mb-2">
                            Join Nutra
                        </Text>
                        <Text className="text-lg text-studio-muted text-center">
                            A nutrition and meal planning app{"\n"} to help you stay on track
                        </Text>
                    </View>


                    {/* Sign-up form  */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-studio-border mb-4" style={{ flexShrink: 1 }}
                    >
                        {/* Form header */}
                        <Text className="text-xl text-studio-main font-bold text-center mb-4">
                            Create your account
                        </Text>

                        {/* username Input  */}
                        <Text className="text-sm font-medium text-studio-main mb-2">
                            Username
                        </Text>

                        <View className="flex-row items-center bg-studio-cream rounded-xl border-studio-border border px-4 py-4 mb-2">
                            <Ionicons name="person-outline" size={20} color="#6B7280" />
                            <TextInput
                                autoCapitalize="none"
                                value={username}
                                placeholder="Create a username"
                                placeholderTextColor="#666666"
                                onChangeText={(username) => setUsername(username)}
                                keyboardType="email-address"
                                className="flex-1 ml-3 text-studio-main"
                                editable={!isLoading}

                            />
                            {errors.fields.emailAddress && (
                                <Text className="text-red-600 text-xs -mt-2">{errors.fields.emailAddress.message}</Text>
                            )}
                        </View>

                        {/* Email Input  */}
                        <Text className="text-sm font-medium text-studio-main mb-2">
                            Email
                        </Text>

                        <View className="flex-row items-center bg-studio-cream rounded-xl border-studio-border border px-4 py-4 mb-2">
                            <Ionicons name="mail-outline" size={20} color="#6B7280" />
                            <TextInput
                                autoCapitalize="none"
                                value={emailAddress}
                                placeholder="Enter your email"
                                placeholderTextColor="#666666"
                                onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                                keyboardType="email-address"
                                className="flex-1 ml-3 text-studio-main"
                                editable={!isLoading}

                            />
                            {errors.fields.emailAddress && (
                                <Text className="text-red-600 text-xs -mt-2">{errors.fields.emailAddress.message}</Text>
                            )}
                        </View>

                        {/* Password Input  */}
                        <Text className="text-sm font-medium text-studio-main mb-2">
                            Password
                        </Text>

                        <View className="flex-row items-center bg-studio-cream rounded-xl border-studio-border border px-4 py-4 mb-2">
                            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                            <TextInput
                                value={password}
                                placeholder="Create a password"
                                placeholderTextColor="#666666"
                                secureTextEntry={true}
                                onChangeText={(password) => setPassword(password)}
                                className="flex-1 ml-3 text-studio-main"
                                editable={!isLoading}
                            />
                            {errors.fields.password && (
                                <Text className="text-red-600 text-xs -mt-2">{errors.fields.password.message}</Text>
                            )}
                        </View>
                        <Text className="text-xs text-gray-500 mb-4">
                            Create a strong password
                        </Text>

                        {/* Commit buttong  */}

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={!emailAddress || !password || fetchStatus === 'fetching' || isLoading}
                            className={"rounded-xl py-4 px-4 shadow-sm mb-1 " + (isLoading ? "bg-gray-400" : "bg-studio-primary")}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center justify-center">
                                {isLoading ?
                                    (<Ionicons name="refresh" size={20} color="white" className="animate-spin" />) :
                                    (<Ionicons name="person-add-outline" size={20} color="white" />)}
                                <Text className='text-white font-semibold text-lg ml-2'>Create Account</Text>
                            </View>

                        </TouchableOpacity>

                        <Text className="text-xs text-gray-500 py-4">
                            By signing up, you agree to our Terms of Service and Privacy Policy.
                        </Text>
                    </KeyboardAvoidingView>

                    <View className="flex-row items-center justify-center mb-6">
                        <Text className="text-studio-muted">
                            Already have an account?
                        </Text>
                        <Link href="/sign-in">
                            <Text className="text-studio-primary font-semibold"> Sign in</Text>
                        </Link>
                    </View>

                    {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
                    <View nativeID="clerk-captcha" />
                </View>
                {/* Footer Section */}
                <View className="pb-6 items-center flex-col">
                    <Text className="text-xs text-gray-500">
                        Smarter nutrition, personalized for you.
                    </Text>
                </View>

            </View>
        </AuthPage>
    )
}