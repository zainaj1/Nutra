import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { setupColors } from '../setup-theme';

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
                        ? "bg-setup-selected border-setup-border"
                        : "bg-setup-card border-setup-border")
                }
                style={{ elevation: 4 }}
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
                        "text-sm font-bold text-center " +
                        (selected ? "text-setup-dark" : "text-setup-main")
                    }
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
