import colors from '@/constants/studio-colors.json';
import { type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthPage({ children }: PropsWithChildren) {
    return <SafeAreaView style={styles.page}>
        <View pointerEvents="none" style={styles.halo} />
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.cream },
    fill: { flex: 1 },
    halo: { position: 'absolute', top: -120, right: -90, width: 330, height: 330, borderRadius: 165, backgroundColor: '#edf5ef' },
    content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, width: '100%', maxWidth: 520, alignSelf: 'center' },
});
