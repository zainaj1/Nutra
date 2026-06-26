import { useAuth } from '@clerk/expo'
import { Button } from '@react-navigation/elements'
import { Link } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'


export default function UserGoals() {

    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return (<View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
        )
    }

    return (
        // <Text>User Metrics</Text>
        <Link href="/(app)/(tabs)/(setup)/user-pace"><Button> Test</Button></Link>

    )
}