import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { setupColors } from '../../../domain/setup-theme';

export default function GenericButton({
    label,
    selected,
    icon,
    onPress,
}: {
    label: string;
    selected: boolean;
    icon?: React.ComponentProps<typeof Ionicons>['name'];
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="w-[14%] rounded"
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
        >
            <View
                className={
                    "aspect-square rounded-xl items-center justify-center border px-2" +
                    (selected
                        ? "bg-setup-selected border-setup-border"
                        : "bg-setup-card border-setup-border")
                }
                style={{ elevation: 4 }}
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
                        (selected ? "text-setup-dark" : "text-setup-main")
                    }
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
