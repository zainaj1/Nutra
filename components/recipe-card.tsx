import { type Macros, type Recipe } from '@/src/lib/plan-recipes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatNumber = (value: number) => Number(value.toFixed(1)).toLocaleString();
const mealLabel = (slot: string) => slot.replace(/[_-]/g, ' ');

function RecipeImage({ recipe, large = false }: { recipe: Recipe; large?: boolean }) {
    const [failed, setFailed] = useState(false);
    return recipe.image.trim() && !failed ? (
        <Image source={{ uri: recipe.image }} accessibilityLabel={recipe.name}
            style={large ? styles.largeImage : styles.thumbnail} onError={() => setFailed(true)} />
    ) : (
        <View style={[large ? styles.largeImage : styles.thumbnail, styles.imageFallback]}>
            <Ionicons name="restaurant-outline" size={large ? 64 : 36} color="#d7ead9" />
        </View>
    );
}

function Nutrition({ macros }: { macros: Macros }) {
    const items = [
        { label: 'kcal', value: macros.calories == null ? '—' : formatNumber(macros.calories), icon: 'flame-outline' as const, color: '#d95b1e' },
        { label: 'protein', value: `${formatNumber(macros.protein)}g`, icon: 'fish-outline' as const, color: '#3d7b50' },
        { label: 'carbs', value: `${formatNumber(macros.carbohydrates)}g`, icon: 'leaf-outline' as const, color: '#7b9a4a' },
        { label: 'fat', value: `${formatNumber(macros.fat)}g`, icon: 'water-outline' as const, color: '#bd7b09' },
    ];
    return (
        <View style={styles.nutrition}>
            {items.map(item => (
                <View key={item.label} style={styles.macro}>
                    <Ionicons name={item.icon} size={21} color={item.color} />
                    <Text style={[styles.macroValue, { color: item.color }]}>{item.value}</Text>
                    <Text style={styles.muted}>{item.label}</Text>
                </View>
            ))}
        </View>
    );
}

export function RecipeCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
    return (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`View recipe: ${recipe.name}`}
            accessibilityHint="Opens ingredients, nutrition, and cooking instructions" activeOpacity={0.85}
            onPress={onPress} style={styles.card}>
            <LinearGradient colors={['#3d7b50', '#5a9e6f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardHeader}>
                <View style={styles.cardCopy}>
                    <Text style={styles.badge}>{mealLabel(recipe.meal_slot)}</Text>
                    <Text style={styles.cardTitle}>{recipe.name}</Text>
                    <Text style={styles.cardMeta}>{recipe.cookingDetails.cookTime} · {recipe.ingridents.length} ingredients</Text>
                </View>
                <RecipeImage recipe={recipe} />
            </LinearGradient>
            <Nutrition macros={recipe.nutritionPerServing} />
            <View style={styles.cardFooter}>
                <Text style={styles.muted}>Per serving · Serves {recipe.serving_size}</Text>
                <Ionicons name="arrow-forward" size={18} color="#3d7b50" />
            </View>
        </TouchableOpacity>
    );
}

export function RecipeDetails({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
    return (
        <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={styles.detailPage}>
                <View style={styles.detailHeader}>
                    <Text style={styles.eyebrow}>RECIPE DETAILS</Text>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close recipe details"
                        onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#1c3020" />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.detailContent}>
                    <RecipeImage recipe={recipe} large />
                    <Text style={styles.mealSlot}>{mealLabel(recipe.meal_slot)}</Text>
                    <Text accessibilityRole="header" style={styles.detailTitle}>{recipe.name}</Text>
                    <Text style={styles.detailMeta}>{recipe.cookingDetails.cookTime} · Serves {recipe.serving_size} · Difficulty {recipe.cookingDetails.difficulty}</Text>
                    <Text accessibilityRole="header" style={styles.sectionTitle}>Nutrition per serving</Text>
                    <View style={styles.panel}><Nutrition macros={recipe.nutritionPerServing} /></View>
                    <Text accessibilityRole="header" style={styles.sectionTitle}>Ingredients</Text>
                    <View style={styles.panel}>
                        {recipe.ingridents.map((ingredient, index) => (
                            <View key={`${ingredient.name}-${index}`} style={styles.ingredient}>
                                <View style={styles.ingredientHeading}>
                                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                                    <Text style={styles.quantity}>{formatNumber(ingredient.quantity)} {ingredient.unit ?? 'count'}</Text>
                                </View>
                                <Text style={styles.ingredientNutrition}>
                                    Per serving: {ingredient.nutritionPerServing.calories == null ? '—' : formatNumber(ingredient.nutritionPerServing.calories)} kcal · {formatNumber(ingredient.nutritionPerServing.protein)}g protein · {formatNumber(ingredient.nutritionPerServing.carbohydrates)}g carbs · {formatNumber(ingredient.nutritionPerServing.fat)}g fat
                                </Text>
                            </View>
                        ))}
                        {!recipe.ingridents.length && <Text style={styles.emptyText}>No ingredients provided.</Text>}
                    </View>
                    <Text accessibilityRole="header" style={styles.sectionTitle}>Let’s cook</Text>
                    {[...recipe.instructions].sort((a, b) => a.step - b.step).map((instruction, index) => (
                        <View key={`${instruction.step}-${index}`} style={styles.instruction}>
                            <View style={styles.stepCircle}><Text style={styles.stepNumber}>{instruction.step}</Text></View>
                            <Text style={styles.instructionText}>{instruction.description}</Text>
                        </View>
                    ))}
                    {!recipe.instructions.length && <Text style={styles.muted}>No instructions provided.</Text>}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#fff', borderRadius: 24, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#e8ebe4' },
    cardHeader: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardCopy: { flex: 1 },
    badge: { color: '#fff', backgroundColor: '#ffffff26', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', overflow: 'hidden', marginBottom: 12 },
    cardTitle: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 28 },
    cardMeta: { color: '#e0eee2', fontSize: 13, lineHeight: 20, marginTop: 8 },
    thumbnail: { width: 80, height: 80, borderRadius: 40 },
    largeImage: { width: '100%', height: 220, borderRadius: 20 },
    imageFallback: { backgroundColor: '#467e53', justifyContent: 'center', alignItems: 'center' },
    nutrition: { flexDirection: 'row', paddingVertical: 20, paddingHorizontal: 8 },
    macro: { flex: 1, alignItems: 'center', gap: 6 },
    macroValue: { fontSize: 18, fontWeight: '800' },
    muted: { color: '#737b86', fontSize: 12 },
    cardFooter: { borderTopWidth: 1, borderTopColor: '#f0f1ed', paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailPage: { flex: 1, backgroundColor: '#fcfbf9' },
    detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    eyebrow: { fontSize: 13, fontWeight: '700', letterSpacing: 1, color: '#737b86' },
    closeButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eeeee9', alignItems: 'center', justifyContent: 'center' },
    detailContent: { padding: 20, paddingBottom: 40 },
    mealSlot: { fontSize: 12, fontWeight: '700', color: '#3d7b50', textTransform: 'uppercase', marginTop: 20, marginBottom: 8 },
    detailTitle: { fontSize: 28, lineHeight: 35, fontWeight: '800', color: '#1c3020' },
    detailMeta: { color: '#737b86', marginTop: 12, lineHeight: 22 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1c3020', marginTop: 28, marginBottom: 14 },
    panel: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e8ebe4', overflow: 'hidden' },
    ingredient: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e8ebe4', gap: 8 },
    ingredientHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    ingredientName: { flex: 1, fontSize: 16, color: '#1c3020', fontWeight: '600' },
    quantity: { color: '#3d7b50', fontSize: 14, flexShrink: 1 },
    ingredientNutrition: { fontSize: 12, lineHeight: 18, color: '#737b86' },
    emptyText: { padding: 16, color: '#737b86' },
    instruction: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 22 },
    stepCircle: { minWidth: 34, minHeight: 34, padding: 6, borderRadius: 17, backgroundColor: '#e6efdf', alignItems: 'center', justifyContent: 'center' },
    stepNumber: { color: '#3d7b50', fontWeight: '700' },
    instructionText: { flex: 1, fontSize: 16, lineHeight: 25, color: '#39443b', paddingTop: 3 },
});
