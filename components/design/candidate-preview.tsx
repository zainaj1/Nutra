import colors from '@/constants/studio-colors.json';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import GlassSurface from './glass-surface';

type Candidate = {
    name: string; image?: string; meal_slot?: string;
    cookingDetails: { cookTime: string; difficulty: number };
    nutritionPerServing: { calories?: number | null; protein: number; carbohydrates: number; fat: number };
};

export default function CandidatePreview({ recipe }: { recipe: Candidate }) {
    const [imageFailed, setImageFailed] = useState(false);
    const nutrition = recipe.nutritionPerServing;
    return <View style={styles.card}>
        <View style={styles.hero}>
            {recipe.image && !imageFailed ? <Image source={{ uri: recipe.image }} style={styles.image} onError={() => setImageFailed(true)} />
                : <View style={styles.illustration}><Ionicons name="restaurant-outline" size={60} color={colors.primary} /></View>}
            <View style={styles.tag}><GlassSurface style={{ paddingHorizontal: 12, paddingVertical: 7 }}><Text style={styles.tagText}>{recipe.meal_slot?.replace(/[_-]/g, ' ') || 'Made for your plan'}</Text></GlassSurface></View>
        </View>
        <View style={styles.content}>
            <Text accessibilityRole="header" style={styles.title}>{recipe.name}</Text>
            <View style={styles.chips}>
                <View style={styles.chip}><Ionicons name="time-outline" size={15} color={colors.primary} /><Text style={styles.chipText}>{recipe.cookingDetails.cookTime}</Text></View>
                <View style={styles.chip}><Ionicons name="sparkles-outline" size={15} color={colors.primary} /><Text style={styles.chipText}>Difficulty {recipe.cookingDetails.difficulty}</Text></View>
            </View>
            <View style={styles.macros}>
                {[
                    { label: 'Calories', value: nutrition.calories == null ? '—' : Math.round(nutrition.calories), icon: 'flame-outline', color: colors.orange },
                    { label: 'Protein', value: `${Math.round(nutrition.protein)}g`, icon: 'fish-outline', color: colors.primary },
                    { label: 'Carbs', value: `${Math.round(nutrition.carbohydrates)}g`, icon: 'leaf-outline', color: colors.leaf },
                    { label: 'Fat', value: `${Math.round(nutrition.fat)}g`, icon: 'water-outline', color: '#b77a09' },
                ].map(item => <View key={item.label} style={styles.macro}><Ionicons name={item.icon as 'flame-outline'} size={20} color={item.color} /><Text style={[styles.value, { color: item.color }]}>{item.value}</Text><Text style={styles.label}>{item.label}</Text></View>)}
            </View>
            <Text style={styles.caption}>Nutrition per serving</Text>
        </View>
    </View>;
}

const styles = StyleSheet.create({
    card: { borderRadius: 24, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: '#fff', width: '100%' },
    hero: { height: 170, backgroundColor: colors.soft },
    image: { width: '100%', height: '100%' },
    illustration: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    tag: { position: 'absolute', bottom: 12, left: 16 },
    tagText: { textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10, fontWeight: '700', color: colors.dark },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: '800', color: colors.textMain, lineHeight: 30, letterSpacing: -0.5 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, marginBottom: 22 },
    chip: { flexDirection: 'row', gap: 5, backgroundColor: colors.cream, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7, alignItems: 'center' },
    chipText: { fontSize: 12, color: colors.textMuted },
    macros: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 18 },
    macro: { flex: 1, alignItems: 'center', gap: 7 },
    value: { fontSize: 17, fontWeight: '800' },
    label: { fontSize: 10, color: colors.textMuted },
    caption: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 20 },
});
