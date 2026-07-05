import ExpoSlider from '@expo/ui/community/slider';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { setupColors } from '../setup-theme';

type PaceSliderProps = {
    value: number;
    onValueChange: (value: number) => void;
};

const MIN = 0.5;
const MAX = 2.0;
const STEP = 0.1;

const majorTicks = [0.5, 1.0, 1.5, 2.0];

const smallTicks = [
    0.5, 0.6, 0.7, 0.8, 0.9,
    1.0, 1.1, 1.2, 1.3, 1.4,
    1.5, 1.6, 1.7, 1.8, 1.9,
    2.0,
];

export default function PaceSlider({
    value,
    onValueChange,
}: PaceSliderProps) {
    const [showBubble, setShowBubble] = useState(false);
    const [sliderWidth, setSliderWidth] = useState(0);

    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const progress = (value - MIN) / (MAX - MIN);
    const bubbleLeft = sliderWidth * progress;

    useEffect(() => {
        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        };
    }, []);

    const handleValueChange = (newValue: number) => {
        setShowBubble(true);
        onValueChange(newValue);

        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }

        hideTimerRef.current = setTimeout(() => {
            setShowBubble(false);
        }, 700);
    };

    return (
        <View className="w-full px-2">
            <View
                className="relative w-full pt-10"
                onLayout={(event) => {
                    setSliderWidth(event.nativeEvent.layout.width);
                }}
            >
                {/* Bubble */}
                {showBubble && sliderWidth > 0 && (
                    <View
                        className="absolute top-0 bg-setup-primary px-3 py-1 rounded-full z-10"
                        style={{
                            left: bubbleLeft,
                            transform: [{ translateX: -38 }],
                        }}
                    >
                        <Text className="text-white text-xs font-bold">
                            {value.toFixed(1)} lb/week
                        </Text>
                    </View>
                )}

                {/* Slider */}
                <ExpoSlider
                    value={value}
                    minimumValue={MIN}
                    maximumValue={MAX}
                    step={STEP}
                    minimumTrackTintColor={setupColors.primary}
                    maximumTrackTintColor={setupColors.border}
                    thumbTintColor={setupColors.primary}
                    onValueChange={handleValueChange}
                    style={{
                        width: '100%',
                        height: 40,
                    }}
                />

                {/* Tick marks */}
                <View className="absolute left-0 right-0 bottom-0 flex-row justify-between px-1 pointer-events-none">
                    {smallTicks.map((tick) => (
                        <View
                            key={tick}
                            className={
                                "w-px rounded-full " +
                                (tick <= value ? "bg-setup-olive" : "bg-setup-border") +
                                (majorTicks.includes(tick) ? " h-3" : " h-1.5")
                            }
                        />
                    ))}
                </View>

                <View className="absolute left-0 right-0 bottom-[11.5px] flex-row justify-between px-0 pointer-events-none">
                    {majorTicks.map((tick) => (
                        <View
                            key={tick}
                            className={
                                "w-2 h-2 rounded-full " +
                                (tick <= value ? "bg-setup-primary" : "bg-setup-olive")
                            }
                        />
                    ))}
                </View>
            </View>

            {/* Labels */}
            <View className="relative mt-1 h-8">
                {majorTicks.map((tick) => {
                    const percent = ((tick - MIN) / (MAX - MIN)) * 100;

                    return (
                        <View
                            key={tick}
                            className="absolute w-16 -translate-x-8 items-center"
                            style={{
                                left: `${percent}%`,
                            }}
                        >
                            <Text
                                className={
                                    "text-xs font-medium text-center " +
                                    (tick === value ? "text-setup-dark" : "text-setup-muted")
                                }
                            >
                                {tick.toFixed(1)}
                            </Text>

                            <Text className="text-xs text-setup-muted text-center">
                                lb/week
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View >
    );
}
