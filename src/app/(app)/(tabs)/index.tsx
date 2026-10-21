import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function Page() {
    const { isSignedIn } = useAuth();

    return (
        <Redirect href={isSignedIn ? '/home' : '/sign-in'} />
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#0a7ea4',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
})