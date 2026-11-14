import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import setupColors from '@/constants/studio-colors.json';

export default function GenericButton({
    label,
    selected,
    icon,
    onPress,
    accessibilityLabel = label,
}: {
    label: string;
    selected: boolean;
    icon?: React.ComponentProps<typeof Ionicons>['name'];
    onPress: () => void;
    accessibilityLabel?: string;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-1 min-w-0 rounded"
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ selected }}
        >
            <View
                className={
                    "aspect-square rounded-xl items-center justify-center border px-2 " +
                    (selected
                        ? "bg-studio-selected border-studio-primary"
                        : "bg-studio-card border-studio-border")
                }
                style={{ elevation: 1 }}
            >
                {icon ?
                    <View className="h-10 items-center justify-center mb-2">
                        <Ionicons
                            name={icon}
                            size={30}
                            color={selected ? setupColors.primary : setupColors.textMuted}
                        />
                    </View>
                    : null
                }

                <Text
                    numberOfLines={2}
                    className={
                        "text-sm font-bold text-center " +
                        (selected ? "text-studio-dark" : "text-studio-main")
                    }
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
