import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import setupColors from '@/constants/studio-colors.json';

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
            className="w-[31%] rounded-xl"
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
        >
            <View
                className={
                    "w-full h-28 rounded-2xl items-center justify-center shadow-sm shadow-studio-border border px-2 " +
                    (selected
                        ? "bg-studio-selected border-studio-primary"
                        : "bg-studio-card border-studio-border")
                }
                style={{ elevation: 1 }}
            >
                <View className="h-10 items-center justify-center mb-2">
                    <Ionicons
                        name={icon}
                        size={30}
                        color={selected ? setupColors.primary : setupColors.textMuted}
                    />
                </View>

                <Text
                    numberOfLines={2}
                    className={
                        "text-xs font-bold text-center " +
                        (selected ? "text-studio-dark" : "text-studio-main")
                    }
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
