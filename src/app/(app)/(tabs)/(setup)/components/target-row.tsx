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
            <View className="flex-1 flex-row items-center">
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${iconColor}12` }}>
                <Ionicons
                    name={iconName}
                    size={21}
                    color={iconColor}
                />
                </View>
                <Text className="text-sm px-3 font-semibold text-studio-main">{targetLabel}</Text>
            </View>

            <View className="flex-row items-center justify-center">
                <Text className="text-xl font-bold text-studio-main">{targetValue}</Text>
                <Text className="text-xs text-studio-muted"> {targetSubValue}</Text>
            </View>
        </View>
    );
}
