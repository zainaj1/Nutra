import { useAuth } from '@clerk/expo';
import { Picker } from '@expo/ui/community/picker';
import { Button } from '@react-navigation/elements';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';




export default function UserMetrics() {
    const [language, setLanguage] = useState('java');
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return (<View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
        )
    }

    return (
        // <Text>User Metrics</Text>
        <SafeAreaProvider className="flex-1 p-5 gap-3">
            {/* Header */}
            <View className="flex-col flex-1 px-6 items-center justify-center">
                <Text className="text-3xl font-bold text-gray-900 mb-2"> Tell us about yourself</Text>
                <Text className="text-gray-500 mb-2"> We will use this to personalize your plan.</Text>

                {/* body  */}
                <View className="flex-row flex-1 items-center justify-center">
                    <View>
                        <Picker selectedValue={language} onValueChange={value => setLanguage(value)}>
                            <Picker.Item label="Java" value="java" />
                            <Picker.Item label="JavaScript" value="js" />
                            <Picker.Item label="Objective C" value="objc" />
                            <Picker.Item label="Swift" value="swift" />
                        </Picker>
                        <Text>Selected: {language}</Text>
                    </View>
                    <View>
                        <Text> Height</Text>
                    </View>
                </View>
            </View>

            <Link href="/(app)/(tabs)/(setup)/user-goals" push asChild>
                <Button> User Goals</Button>
            </Link>
        </SafeAreaProvider>

    )
}