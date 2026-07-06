import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

export default function TargetRow({
    iconName,
    iconColor,
    targetLabel,
    targetValue,
    targetSubValue,
}: {
    iconName: ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    targetLabel: string;
    targetValue: string | number;
    targetSubValue: string;
}) {
    return (
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center justify-center">
                <Ionicons
                    name={iconName}
                    size={30}
                    color={iconColor}
                />
                <Text className=" text-lg px-3 font-bold">{targetLabel}</Text>
            </View>

            <View className="flex-row items-center justify-center">
                <Text className="text-xl font-bold text-setup-dark"> {targetValue}</Text>
                <Text className="text-sm font-bold text-setup-dark"> {targetSubValue}</Text>
            </View>
        </View>
    );
}
