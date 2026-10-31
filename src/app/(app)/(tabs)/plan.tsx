import { PageHeading } from '@/components/design/setup-chrome';
import colors from '@/constants/studio-colors.json';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Plan() {
    const { isLoaded } = useAuth();
    if (!isLoaded) return <View className="flex-1 items-center justify-center bg-studio-cream"><ActivityIndicator color={colors.primary} /></View>;
    return <SafeAreaView className="flex-1 bg-studio-cream">
        <ScrollView contentContainerClassName="px-6 py-6">
            <PageHeading eyebrow="Made for your everyday" title="Plan" subtitle="Good food, with a little less planning." />
            <View className="bg-white rounded-3xl border border-studio-border p-6 items-center">
                <View className="w-20 h-20 rounded-3xl bg-studio-soft items-center justify-center mb-5"><Ionicons name="restaurant-outline" size={34} color={colors.primary} /></View>
                <Text className="text-xl font-bold text-studio-main mb-3 text-center">Your recipes live on Home</Text>
                <Text className="text-sm text-studio-muted text-center leading-6 mb-6">Head home to see your current recipes or get started with your first personalized plan.</Text>
                <Link href="/(app)/(tabs)/home" asChild>
                    <TouchableOpacity accessibilityRole="button" className="bg-studio-primary rounded-2xl px-6 py-4 flex-row items-center gap-3">
                        <Text className="text-white font-semibold">Go to Home</Text><Ionicons name="arrow-forward" size={18} color="white" />
                    </TouchableOpacity>
                </Link>
            </View>
        </ScrollView>
    </SafeAreaView>;
}
