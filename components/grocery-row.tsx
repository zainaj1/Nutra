import { groceryQuantity } from '@/src/lib/grocery-quantity';
import { type GroceryItem } from '@/src/lib/pantry';
import { Text, View } from 'react-native';

export function GroceryRow({ item }: { item: GroceryItem }) {
    const quantity = groceryQuantity(item);
    return <View className="flex-row flex-wrap items-start justify-between gap-3 py-4 border-b border-studio-border">
        <Text className="text-base font-semibold text-studio-main flex-grow flex-shrink basis-40">{item.name}</Text>
        <View className="flex-shrink max-w-full">
            <Text className="text-base text-studio-muted">{quantity.label}</Text>
            {quantity.original && <Text className="text-sm text-studio-muted mt-1">Recipe total: {quantity.original}</Text>}
        </View>
    </View>;
}
