import colors from '@/constants/studio-colors.json';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type PropsWithChildren } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassSurface from './glass-surface';

export function SetupHeader({ step }: { step: number }) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <View style={styles.navRow}>
                <GlassSurface style={styles.back}>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.backTouch}
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/home')}>
                        <Ionicons name="chevron-back" size={20} color={colors.textMain} />
                    </TouchableOpacity>
                </GlassSurface>
                <Text style={styles.step}>Step {step} of 5</Text>
                <View style={{ width: 44 }} />
            </View>
            <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 5, now: step }} style={styles.progress}>
                {[1, 2, 3, 4, 5].map(value => <View key={value} style={[styles.segment, value <= step && styles.filled]} />)}
            </View>
        </View>
    );
}

export function SetupFooter({ children }: PropsWithChildren) {
    return <View style={styles.footer}><GlassSurface style={styles.footerGlass}>{children}</GlassSurface></View>;
}

export function PageHeading({ title, subtitle, eyebrow }: { title: string; subtitle: string; eyebrow?: string }) {
    return <View style={styles.heading}>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
    </View>;
}

const styles = StyleSheet.create({
    header: { backgroundColor: colors.cream, paddingHorizontal: 20, paddingBottom: 12 },
    navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
    back: { width: 44, height: 44, borderRadius: 15 },
    backTouch: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    step: { color: colors.primary, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
    progress: { flexDirection: 'row', gap: 5 },
    segment: { flex: 1, height: 4, borderRadius: 4, backgroundColor: '#e5e7e2' },
    filled: { backgroundColor: colors.primary },
    footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: colors.cream },
    footerGlass: { padding: 7 },
    heading: { marginBottom: 24 },
    eyebrow: { color: colors.primary, fontWeight: '700', letterSpacing: 1.8, fontSize: 11, textTransform: 'uppercase', marginBottom: 12 },
    title: { color: colors.textMain, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.7 },
    subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 22, marginTop: 8 },
});
