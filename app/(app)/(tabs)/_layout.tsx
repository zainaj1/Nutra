import { AntDesign } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

export default function Layout() {
    return (
        <Tabs>
            <Tabs.Screen name="home" options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                    <AntDesign name="home" size={size} color={color} />
                ),
            }} />
            <Tabs.Screen name="plan" options={{
                title: 'Plan',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                    <AntDesign name="plus" size={size} color={color} />
                ),
            }} />
            <Tabs.Screen name="settings" options={{
                title: 'Settings',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                    <AntDesign name="setting" size={size} color={color} />
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
