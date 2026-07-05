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
            className="rounded-xl"
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
        >
            <View
                className={
                    "w-24 h-36 rounded-2xl items-center shadow-sm border px-2 py-3 " +
                    (selected
                        ? "bg-setup-light border-setup-border"
                        : "bg-white border-gray-100")
                }
                style={{ elevation: 4 }}
            >
                <View className="h-10 w-full items-center justify-center mb-2">
                    <Ionicons
                        name={icon}
                        size={30}
                        color={selected ? setupColors.primary : setupColors.neutralIcon}
                    />
                </View>

                <View className="h-8 w-full items-center justify-center">
                    <Text
                        numberOfLines={1}
                        className={
                            "text-xs font-bold text-center " +
                            (selected ? "text-setup-dark" : "text-black")
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
                            (selected ? "text-setup-dark" : "text-gray-500")
                        }
                    >
                        {secondaryLabel}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
