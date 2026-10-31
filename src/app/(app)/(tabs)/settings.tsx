import GlassSurface from '@/components/design/glass-surface';
import { PageHeading } from '@/components/design/setup-chrome';
import colors from '@/constants/studio-colors.json';
import { useAuth, useClerk, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
    const { isLoaded } = useAuth();
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const name = user?.firstName || user?.username || 'Your account';

    const handleSignOut = async () => {
        if (signingOut) return;
        setSigningOut(true);
        setError(null);
        try {
            await signOut();
            router.replace('/');
        } catch {
            setError('Could not sign out. Please try again.');
            setSigningOut(false);
        }
    };

    if (!isLoaded) return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;

    return <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.content}>
            <PageHeading eyebrow="Your space" title="Settings" subtitle="A little more about you and your Nutra account." />
            <LinearGradient colors={['#edf5ef', '#e1eee2', '#fafaf7']} style={styles.profile}>
                <View pointerEvents="none" style={styles.orb} />
                <GlassSurface style={styles.avatar}><Text style={styles.initial}>{name.charAt(0).toUpperCase()}</Text></GlassSurface>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress || 'Signed in to Nutra'}</Text>
                <View style={styles.member}><Ionicons name="leaf-outline" size={14} color={colors.primary} /><Text style={styles.memberText}>Your everyday nutrition companion</Text></View>
            </LinearGradient>
            <Text style={styles.section}>YOUR NUTRA</Text>
            <View style={styles.card}>
                <TouchableOpacity accessibilityRole="button" onPress={() => router.replace('/(app)/(tabs)/home')} style={styles.row}>
                    <View style={styles.icon}><Ionicons name="restaurant-outline" size={22} color={colors.primary} /></View>
                    <View style={styles.rowCopy}><Text style={styles.rowTitle}>Your meal plan</Text><Text style={styles.rowDescription}>Recipes and daily inspiration, all in one place.</Text></View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </View>
            <Text style={styles.section}>ACCOUNT</Text>
            <View style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.icon}><Ionicons name="mail-outline" size={22} color={colors.primary} /></View>
                    <View style={styles.rowCopy}><Text style={styles.rowTitle}>Email address</Text><Text style={styles.rowDescription}>{user?.primaryEmailAddress?.emailAddress || 'No email address added'}</Text></View>
                </View>
            </View>
            <GlassSurface style={styles.signOutSurface}>
                <TouchableOpacity onPress={handleSignOut} accessibilityRole="button" accessibilityLabel="Sign out" disabled={signingOut} accessibilityState={{ disabled: signingOut }} style={styles.signOut}>
                    {signingOut ? <ActivityIndicator color={colors.dark} /> : <Ionicons name="log-out-outline" size={21} color={colors.dark} />}
                    <Text style={styles.signOutText}>{signingOut ? 'Signing out…' : 'Sign out'}</Text>
                </TouchableOpacity>
            </GlassSurface>
            {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            <View style={styles.footer}><Ionicons name="leaf" size={20} color={colors.primary} /><Text style={styles.brand}>nutra</Text><Text style={styles.tagline}>Small choices. A healthier everyday.</Text></View>
        </ScrollView>
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.cream },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
    content: { padding: 24, paddingBottom: 32, width: '100%', maxWidth: 600, alignSelf: 'center' },
    profile: { padding: 24, borderRadius: 26, alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#dfebdd' },
    orb: { position: 'absolute', right: -40, top: -40, width: 170, height: 170, borderRadius: 85, backgroundColor: '#c6dfc94d' },
    avatar: { height: 76, width: 76, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    initial: { color: colors.primary, fontSize: 32, fontWeight: '800' },
    name: { fontSize: 23, fontWeight: '800', color: colors.textMain },
    email: { fontSize: 13, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
    member: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 18 },
    memberText: { color: colors.dark, fontSize: 11, flexShrink: 1 },
    section: { marginTop: 28, marginBottom: 12, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.textMuted },
    card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
    rowCopy: { flex: 1 },
    rowTitle: { fontSize: 15, fontWeight: '600', color: colors.textMain },
    rowDescription: { fontSize: 12, lineHeight: 18, color: colors.textMuted, marginTop: 4 },
    signOutSurface: { marginTop: 24 },
    signOut: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    signOutText: { fontWeight: '600', color: colors.dark, fontSize: 15 },
    error: { color: '#b91c1c', marginTop: 12 },
    footer: { marginTop: 36, alignItems: 'center', gap: 5 },
    brand: { fontSize: 22, fontWeight: '800', letterSpacing: -1, color: colors.primary },
    tagline: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
});
