import { useAuth } from '@clerk/expo'
import { ActivityIndicator, Text, View } from 'react-native'


export default function Home() {

    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return (<View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
        )
    }

    return <Text>Home</Text>
}