import { AntDesign } from '@expo/vector-icons'
import { Tabs } from 'expo-router'

export default function Layout() {
    return (
        <Tabs>
            <Tabs.Screen name="home" options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                    <AntDesign name="home" size={size} style={{ color }} />
                ),
            }} />
            <Tabs.Screen name="plan" options={{
                title: 'Groceries',
                headerShown: false,
                // A tab press opens the current saved plan, even after viewing an older linked plan.
                href: { pathname: '/(app)/(tabs)/plan', params: { generationId: '' } },
                tabBarIcon: ({ color, size }) => (
                    <AntDesign name="profile" size={size} style={{ color }} />
                ),
            }} />
            <Tabs.Screen name="(setup)" options={{
                title: 'Setup',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                    <AntDesign name="plus" size={size} style={{ color }} />
                ),
            }} />
            <Tabs.Screen name="settings" options={{
                title: 'Settings',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                    <AntDesign name="setting" size={size} style={{ color }} />
                ),
            }} />
            <Tabs.Screen name="index" options={{
                title: 'Index',
                headerShown: false,
                href: null,
            }} />
        </Tabs>
    )
}
