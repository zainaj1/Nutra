import { PageHeading, SetupFooter } from '@/components/design/setup-chrome';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/studio-colors.json';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import GenericButton from './components/generic-button';
import SetupContinueButton from './components/setup-continue-button';



export default function SetupMeals() {
    const cookDayMap: { [key: string]: string } = {
        '1': 'M',
        '2': 'T',
        '3': 'W',
        '4': 'T',
        '5': 'F',
        '6': 'S',
        '7': 'S',
    };
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert'];
    const [cookDays, setCookDays] = useState('');
    const [cookDayCount, setCookDayCount] = useState(0);
    const [people, setPeople] = useState(1);
    const [meals, setMeals] = useState('');

    function handleCookDaysChange(day: string) {
        if (cookDays.includes(day)) {
            setCookDays(cookDays.replace(day, ''));
            setCookDayCount(cookDayCount - 1);
        } else {
            setCookDays(cookDays + day);
            setCookDayCount(cookDayCount + 1);
        }
    }

    function convertCookDaysToString(cookDays: string): string {
        const dayNames = Object.keys(cookDayMap).filter((day) => cookDays.includes(day)).map((day) => cookDayMap[day]);
        return dayNames.join(', ');
    }

    function handleMealsChange(meal: string) {
        if (meals.includes(meal)) {
            setMeals(meals.replace(meal, ''));
        } else {
            setMeals(meals + meal);
        }
    }

    function convertMealsToString(meals: string): string {
        const mealNames = mealTypes.filter((meal) => meals.includes(meal));
        return mealNames.join(', ');
    }


    return (
        <SafeAreaProvider>
            <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-studio-cream">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-4 pb-6"
                    showsVerticalScrollIndicator={false}
                >

                    <PageHeading title="Make room for good food" subtitle="A plan that fits your week, your table, and the meals you love." />
                    <Text className="text-xs uppercase tracking-widest font-semibold text-studio-muted mb-3">Cooking days</Text>
                    <View className="bg-white rounded-2xl border border-studio-border p-4 mb-6">
                        <View className="flex-row justify-between gap-1 w-full">
                            {Object.keys(cookDayMap).map((day) => (
                                <GenericButton key={day} label={cookDayMap[day]} accessibilityLabel={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][Number(day) - 1]} selected={cookDays.includes(day)} onPress={() => handleCookDaysChange(day)} />
                            ))}
                        </View>
                        <Text className="text-xs text-studio-muted mt-4">{cookDayCount ? `${cookDayCount} cooking days · ${convertCookDaysToString(cookDays)}` : 'Choose the days you’d like to cook.'}</Text>
                    </View>

                    <Text className="text-xs uppercase tracking-widest font-semibold text-studio-muted mb-3">Around your table</Text>
                    <View className="flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-studio-border p-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-studio-main">How many people?</Text>
                            <Text className="text-xs text-studio-muted mt-1">We’ll adjust the serving sizes.</Text>
                        </View>
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fewer people" accessibilityState={{ disabled: people <= 1 }} disabled={people <= 1}
                            onPress={() => setPeople(Math.max(1, people - 1))} className="w-11 h-11 border border-studio-border rounded-xl items-center justify-center" style={{ opacity: people <= 1 ? 0.4 : 1 }}>
                            <Ionicons name="remove" size={20} color={colors.primary} />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-studio-primary">{people}</Text>
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="More people" accessibilityState={{ disabled: people >= 5 }} disabled={people >= 5}
                            onPress={() => setPeople(Math.min(5, people + 1))} className="w-11 h-11 border border-studio-border rounded-xl items-center justify-center" style={{ opacity: people >= 5 ? 0.4 : 1 }}>
                            <Ionicons name="add" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-xs uppercase tracking-widest font-semibold text-studio-muted mb-3">Meals to plan</Text>
                    <View className="gap-3 mb-5">
                        {mealTypes.map((meal, index) => {
                            const selected = meals.includes(meal);
                            const icons = ['sunny-outline', 'partly-sunny-outline', 'moon-outline', 'ice-cream-outline'] as const;
                            const descriptions = ['A good start to your day', 'A little midday fuel', 'Something to look forward to', 'Room for a little sweetness'];
                            return <TouchableOpacity key={meal} accessibilityRole="button" accessibilityLabel={meal} accessibilityState={{ selected }} onPress={() => handleMealsChange(meal)}
                                className={'flex-row items-center gap-4 rounded-2xl border p-4 ' + (selected ? 'bg-studio-soft border-studio-primary' : 'bg-white border-studio-border')}>
                                <View className="w-11 h-11 rounded-xl bg-studio-cream items-center justify-center"><Ionicons name={icons[index]} size={23} color={colors.primary} /></View>
                                <View className="flex-1"><Text className="capitalize text-base font-bold text-studio-main">{meal}</Text><Text className="text-xs text-studio-muted mt-1">{descriptions[index]}</Text></View>
                                <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={23} color={selected ? colors.primary : '#cdd4cc'} />
                            </TouchableOpacity>;
                        })}
                    </View>
                    <View className="flex-row gap-3 bg-studio-soft border border-studio-border rounded-2xl p-4">
                        <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                        <Text className="flex-1 text-sm text-studio-dark leading-5">{cookDayCount && meals ? `${cookDayCount} days of ${convertMealsToString(meals)} for ${people}. Your week is taking shape.` : 'Choose your cooking days and meals to start building your week.'}</Text>
                    </View>
                </ScrollView>

                {/* Finalize Button */}
                <SetupFooter>
                    <SetupContinueButton
                        href={{
                            pathname: "/(app)/(tabs)/(setup)/select-meals",
                            params: {
                                cookDayCount: cookDayCount,
                                people: people,
                                meals: meals
                            }
                        }}
                        label="Find my recipes"
                        disabled={cookDayCount === 0 || meals.length === 0}
                    />
                </SetupFooter>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}
