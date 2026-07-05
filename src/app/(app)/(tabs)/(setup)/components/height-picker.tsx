import { Picker } from '@expo/ui/community/picker';
import { Text, View } from 'react-native';

type HeightPickerProps = {
    heightFeet: string;
    heightInches: string;
    setHeightFeet: (value: string) => void;
    setHeightInches: (value: string) => void;
};

export default function HeightPicker({
    heightFeet,
    heightInches,
    setHeightFeet,
    setHeightInches,
}: HeightPickerProps) {
    const feetOptions = [4, 5, 6, 7];

    const inchOptions = Array.from(
        { length: 12 },
        (_, index) => index
    );

    return (
        <View
            className="w-40 h-56 rounded-2xl bg-setup-card items-center justify-center shadow-sm border border-setup-border"
            style={{ elevation: 4 }}
        >
            <Text className="text-setup-main text-sm mb-1 font-bold">
                Height
            </Text>

            <Text className="text-lg font-bold text-setup-primary mb-2">
                {`${heightFeet}'${heightInches}`}
            </Text>

            <View className="w-full flex-row items-center mb-2 px-5">
                <View className="flex-1 h-px bg-setup-border" />
            </View>

            <View className="flex-row items-center justify-center gap-1">
                <View className="w-16 h-28 overflow-hidden items-center justify-center">
                    <Picker
                        selectedValue={heightFeet}
                        onValueChange={(value) => setHeightFeet(String(value))}
                        style={{ width: 80, height: 50 }}
                    >
                        {feetOptions.map((feet) => (
                            <Picker.Item
                                key={feet}
                                label={`${feet} ft`}
                                value={`${feet}`}
                            />
                        ))}
                    </Picker>
                </View>

                <View className="w-16 h-28 overflow-hidden items-center justify-center">
                    <Picker
                        selectedValue={heightInches}
                        onValueChange={(value) => setHeightInches(String(value))}
                        style={{ width: 80, height: 50 }}
                    >
                        {inchOptions.map((inch) => (
                            <Picker.Item
                                key={inch}
                                label={`${inch} in`}
                                value={`${inch}`}
                            />
                        ))}
                    </Picker>
                </View>
            </View>
        </View>
    );
}
