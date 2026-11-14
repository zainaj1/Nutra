import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

// Glass is reserved for controls and small floating surfaces, keeping body copy
// on solid cards. Unsupported devices retain a readable frosted surface.
export default function GlassSurface({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
    const [reduceTransparency, setReduceTransparency] = useState(true);
    useEffect(() => {
        let active = true;
        void AccessibilityInfo.isReduceTransparencyEnabled().then(value => {
            if (active) setReduceTransparency(value);
        }).catch(() => {});
        const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
        return () => { active = false; subscription.remove(); };
    }, []);

    let nativeGlass = false;
    if (Platform.OS === 'ios' && !reduceTransparency) {
        try { nativeGlass = isGlassEffectAPIAvailable() && isLiquidGlassAvailable(); } catch { /* Older native build. */ }
    }
    return (
        <View style={[styles.surface, style]}>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                {nativeGlass ? (
                    <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular" colorScheme="light" tintColor="#edf5ef33" />
                ) : !reduceTransparency && Platform.OS !== 'android' ? (
                    <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={48} />
                ) : <View style={[StyleSheet.absoluteFill, styles.solid]} />}
            </View>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    surface: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.45)' },
    solid: { backgroundColor: '#f5f8f3' },
});
