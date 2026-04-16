import { useAuth } from '@clerk/expo'
import { Text } from 'react-native'


export default function Settings() {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return null
    }

    return <Text>Settings</Text>
}