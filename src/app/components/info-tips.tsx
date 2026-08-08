import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export default function InfoTips({
    label,
    description,
    icon,
    color
}: {
    label: string;
    description: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    color: string
}) {
    return (
        <View className="flex-row items-start rounded-2xl border border-gray-100 bg-white gap-2 px-4 py-4 ">
            <Ionicons
                name={icon}
                color={color}
                size={24}
            ></Ionicons>
            <View className="flex-col items-left">
                <Text className="text-left font-bold text-black text-sm">
                    {label}
                </Text>
                <Text className="text-left text-black/50 text-xs">
                    {description}
                </Text>
            </View>
        </View>
    );
}

