import { Link, type Href } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

type SetupContinueButtonProps = {
    href: Href;
    label?: string;
    disabled?: boolean;
    replace?: boolean;
    accessibilityLabel?: string;
    onPress?: () => void;
};

export default function SetupContinueButton({
    href,
    label = 'Continue',
    disabled = false,
    replace = false,
    accessibilityLabel = label,
    onPress = () => { console.log('SetupContinueButton pressed') },
}: SetupContinueButtonProps) {
    return (
        <Link href={href} replace={replace} push={!replace} asChild>
            <TouchableOpacity
                activeOpacity={0.85}
                className={
                    "bg-setup-primary rounded-full py-4 items-center justify-center shadow-sm " +
                    (disabled ? "opacity-50" : "opacity-100")
                }
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                accessibilityState={{ disabled }}
                onPress={onPress}
            >
                <Text className="text-white font-bold text-lg">
                    {label}
                </Text>
            </TouchableOpacity>
        </Link>
    );
}
