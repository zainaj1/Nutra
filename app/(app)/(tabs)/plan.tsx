import { useAuth } from '@clerk/expo'
import { Text } from 'react-native'

export default function Plan() {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return null
    }

    return <Text>Plan</Text>
}