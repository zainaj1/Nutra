import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function GenderButton({
    label,
    icon,
    selected,
    onPress,
}: {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="rounded-xl"
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
        >
            <View
                className={
                    "w-28 h-28 rounded-2xl items-center justify-center shadow-sm border px-2 " +
                    (selected
                        ? "bg-green-100 border-green-400"
                        : "bg-white border-gray-100")
                }
                style={{ elevation: 4 }}
            >
                <View className="h-10 items-center justify-center mb-2">
                    <Ionicons
                        name={icon}
                        size={30}
                        color={selected ? "#16a34a" : "grey"}
                    />
                </View>

                <Text
                    numberOfLines={2}
                    className={
                        "text-sm font-bold text-center " +
                        (selected ? "text-green-700" : "text-black")
                    }
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
