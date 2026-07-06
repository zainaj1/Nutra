import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { setupColors } from '../setup-theme';

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
            className="w-[23%] rounded-xl"
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
        >
            <View
                className={
                    "w-full h-36 rounded-2xl items-center shadow-sm border shadow-xl shadow-setup-border px-2 py-3 " +
                    (selected
                        ? "bg-setup-selected border-setup-border"
                        : "bg-setup-card border-setup-border")
                }
                style={{ elevation: 4 }}
            >
                <View className="h-10 w-full items-center justify-center mb-2">
                    <Ionicons
                        name={icon}
                        size={30}
                        color={selected ? setupColors.primary : setupColors.textMuted}
                    />
                </View>

                <View className="h-8 w-full items-center justify-center">
                    <Text
                        numberOfLines={2}
                        className={
                            "text-xs font-bold text-center " +
                            (selected ? "text-setup-dark" : "text-setup-main")
                        }
                    >
                        {label}
                    </Text>
                </View>

                <View className="h-10 w-full items-center justify-start">
                    <Text
                        numberOfLines={2}
                        className={
                            "text-xs text-center " +
                            (selected ? "text-setup-dark" : "text-setup-muted")
                        }
                    >
                        {secondaryLabel}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
