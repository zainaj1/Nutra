import { Redirect, useLocalSearchParams } from 'expo-router';

// Keep existing shared grocery links working after moving groceries into Plan.
export default function PantryRedirect() {
    const { generationId } = useLocalSearchParams<{ generationId?: string | string[] }>();
    const planId = Array.isArray(generationId) ? generationId[0] : generationId;
    return <Redirect href={{ pathname: '/(app)/(tabs)/plan', params: planId ? { generationId: planId } : {} }} />;
}
