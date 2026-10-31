import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import setupColors from '@/constants/studio-colors.json';

export default function ActivityButton({
    label,
    secondaryLabel,
    icon,
    selected,
    onPress,
}: {
    label: string;
    secondaryLabel: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="w-[48%] rounded-xl"
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
        >
            <View
                className={
                    "w-full min-h-28 rounded-2xl items-center border shadow-sm shadow-studio-border px-2 py-3 " +
                    (selected
                        ? "bg-studio-selected border-studio-primary"
                        : "bg-studio-card border-studio-border")
                }
                style={{ elevation: 1 }}
            >
                <View className="h-10 w-full items-center justify-center mb-2">
                    <Ionicons
                        name={icon}
                        size={30}
                        color={selected ? setupColors.primary : setupColors.textMuted}
                    />
                </View>

                <View className="min-h-6 w-full items-center justify-center">
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

                <View className="min-h-6 w-full items-center justify-start">
                    <Text
                        numberOfLines={2}
                        className={
                            "text-xs text-center " +
                            (selected ? "text-studio-dark" : "text-studio-muted")
                        }
                    >
                        {secondaryLabel}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
