import { useAuth } from '@clerk/expo';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
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
    const { getToken } = useAuth();

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
            <SafeAreaView className="flex-1 bg-setup-cream">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-4 pb-6"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Header Text */}
                    <View className="items-center mb-6">
                        <Text className="text-3xl font-bold text-setup-main mb-2 text-center">
                            Plan your Meals
                        </Text>
                        <Text className="text-sm text-setup-muted text-center">
                            Tell us how you like to cook and we&apos;ll build around your schedule.
                        </Text>
                    </View>

                    <Text className="text-sm text-setup-muted mb-2">
                        Which Days would you like to cook?
                    </Text>
                    <View className="flex-col items-center gap-2 bg-setup-card rounded-xl border border-setup-border px-4 py-4 mb-4 shadow-xl shadow-setup-border">
                        <View className="flex-row justify-center gap-1 w-full">
                            {
                                Object.keys(cookDayMap).map((day) => (
                                    <GenericButton
                                        key={day}
                                        label={cookDayMap[day]}
                                        selected={cookDays.includes(day)}
                                        onPress={() => handleCookDaysChange(day)}
                                    />
                                ))
                            }
                        </View>
                        <Text>
                            Cook Days: {convertCookDaysToString(cookDays)}
                        </Text>
                    </View>

                    <Text> How many people are you cooking for?</Text>
                    <View className="flex-col items-center gap-2 bg-setup-card rounded-xl border border-setup-border px-4 py-4 mb-4 shadow-xl shadow-setup-border">
                        <View className="flex-row justify-center gap-1 w-full">
                            {
                                [1, 2, 3, 4, 5].map((num) => (
                                    <GenericButton
                                        key={num}
                                        label={num.toString()}
                                        selected={people === num}
                                        onPress={() => setPeople(num)}
                                    />
                                ))
                            }
                        </View>
                        <Text>
                            People: {people}
                        </Text>
                    </View>

                    <Text>Which Meals would you like to prepare</Text>
                    <View className="flex-col items-center gap-2 bg-setup-card rounded-xl border border-setup-border px-4 py-4 mb-4 shadow-xl shadow-setup-border">
                        <View className="flex-row justify-center gap-1 w-full">
                            {
                                mealTypes.map((meal) => (
                                    <GenericButton
                                        key={meal}
                                        label={meal}
                                        selected={meals.includes(meal)}
                                        onPress={() => handleMealsChange(meal)}
                                    />
                                ))
                            }
                        </View>
                        <Text>
                            Meals: {convertMealsToString(meals)}
                        </Text>
                    </View>
                </ScrollView>

                {/* Finalize Button */}
                <View className="px-5 pt-3 pb-4">
                    <SetupContinueButton
                        href={{
                            pathname: "/(app)/(tabs)/(setup)/select-meals",
                            params: {
                                cookDayCount: cookDayCount,
                                people: people,
                                meals: meals
                            }
                        }}
                        label="Pick my Recipes"
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}
