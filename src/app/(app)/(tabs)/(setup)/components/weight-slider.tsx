const WeightSelection = ({ weight, setWeight }: { weight: number; setWeight: (weight: number) => void }) => {
    {/* Weight Box */ }
    <View
        className="w-48 h-60 rounded-2xl bg-white items-center justify-center shadow-sm border border-gray-100"
        style={{ elevation: 4 }}
    >
        <Text className="text-black text-md mb-1 font-bold">
            Weight
        </Text>

        <Text className="text-xl font-bold text-green-600 mb-2">
            {weight}
        </Text>

        {/* Divider */}
        <View className="w-full flex-row items-center mb-2 px-6">
            <View className="flex-1 h-px bg-gray-200" />
        </View>

        <View className="w-28 h-32 overflow-hidden items-center justify-center">
            <Picker
                selectedValue={weight}
                onValueChange={(value) => setWeight(value)}
                style={{ width: 120, height: 50 }}
            >
                {weights.map((weight) => (
                    <Picker.Item
                        key={weight}
                        label={`${weight} lb`}
                        value={`${weight} lb`}
                    />
                ))}
            </Picker>
        </View>
    </View>

}
