import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { cssInterop } from 'nativewind';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import InfoTips from '../../components/info-tips';
import { setupColors } from '../domain/setup-theme';




cssInterop(LinearGradient, {
    className: 'style',
});


export default function Home() {
    const { user } = useUser();
    const { getToken } = useAuth();

    const userName = user?.username
        ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
        : "";

    const currentDateText = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
    const router = useRouter();

    const redirectToSetup = () => {
        router.replace('/(app)/(tabs)/(setup)/user-metrics')
    }

    async function fetchMe() {
        const token = await getToken()
        const res = await fetch('http://localhost:8000/api/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
        console.log(res.status, await res.clone().json())
        return res.json()
    }



    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-setup-cream">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-2 pb-4"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Header */}
                    <View className='flex-col items-left gap-2 pb-8'>
                        <Text className='text-lg, text-gray-400 font-bold'> {currentDateText} </Text>
                        <View className="flex-row">
                            <Text className='text-2xl font-bold'> Good Morning {userName}</Text>
                            <Ionicons
                                name="hand-right"
                                color={setupColors.yellow}
                                size={24}
                            ></Ionicons>
                        </View>
                    </View>

                    {/* Meal Plan Card */}
                    <LinearGradient
                        // Background Linear Gradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        // RGB colors converted to Hex (or you can use 'rgb(61, 123, 80)')
                        colors={['#3d7b50', '#5a9e6f']}
                        className="flex-col w-full rounded-2xl items-start gap-4 px-5 py-5 mb-4"
                    >

                        <Text className="font-bold text-white/70 text-base">Ready to start?</Text>

                        <Text className="font-bold text-white text-xl">
                            No meal plan yet? {'\n'}Let's build yours
                        </Text>

                        <Text className="text-left font-bold text-white/70 text-sm">
                            Answer a few quick questions and we'll create a personalized plan with recipes matched to your goals.
                        </Text>

                        {/* TODO: Change to working button */}
                        <TouchableOpacity onPress={redirectToSetup}>

                            <View className=" flex-row rounded-2xl items-center shadow-sm bg-white gap-2 px-4 py-3 mb-4" >
                                <Text className="text-left font-bold text-[#3d7b50] text-sm" > Create My Plan</Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={16}
                                    color="#3d7b50" />
                            </View>
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* What Youll get Cards */}

                    <Text className='text-lg text-gray-600 mb-5'> What you'll get </Text>
                    <View className='flex-col gap-2'>
                        <InfoTips
                            label="Personalized Macros"
                            description="Calorie and nutrient targets based on your body and goals"
                            icon="golf-outline"
                            color="red"
                        />
                        <InfoTips
                            label="Custom recipes"
                            description="Handpicked meals that match your taste and dietary needs"
                            icon="fast-food-outline"
                            color="black"
                        />
                        <InfoTips
                            label="Grocery list"
                            description="Automated weekly shopping list synced to your plan"
                            icon="list-outline"
                            color="grey"
                        />
                        <InfoTips
                            label="Progress tracking"
                            description="Daily check-ins to keep you on track toward your goal"
                            icon="bar-chart-outline"
                            color="grey"
                        />

                        <TouchableOpacity onPress={() => fetchMe()}>
                            <View className="flex-row rounded-2xl items-center justify-center shadow-sm bg-[#3d7b50] gap-2 px-2 py-4" >
                                <Text className="font-bold text-white" > Get Started</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider >
    );
}
