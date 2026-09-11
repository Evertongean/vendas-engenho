import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View, type ColorValue } from "react-native";

import { useTheme } from "@/hooks/use-theme";

interface TabIconProps {
  color: ColorValue;
  focused: boolean;
  name: SymbolViewProps["name"];
  featured?: boolean;
  fallback: string;
}

function TabIcon({ color, focused, name, featured, fallback }: TabIconProps) {
  const colors = useTheme();
  const size = featured ? (focused ? 32 : 29) : focused ? 25 : 23;

  return (
    <View
      style={[
        featured && styles.featuredIconContainer,
        featured &&
          focused && {
            backgroundColor: colors.tabActiveBackground,
          },
      ]}
    >
      <SymbolView
        name={name}
        tintColor={color}
        size={size}
        fallback={
          <Text style={[styles.fallbackIcon, { color, fontSize: size - 2 }]}>
            {fallback}
          </Text>
        }
      />
    </View>
  );
}

export default function TabsLayout() {
  const colors = useTheme();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 72,
          paddingTop: 7,
          paddingBottom: 9,
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="historico"
        options={{
          title: "Historico",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              name={{ ios: "clock.arrow.circlepath", android: "history", web: "history" }}
              fallback="H"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Venda",
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "800",
          },
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              name={{ ios: "cart.fill", android: "point_of_sale", web: "point_of_sale" }}
              featured
              fallback="$"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="configuracoes"
        options={{
          title: "Configuracoes",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              name={{ ios: "gearshape.fill", android: "settings", web: "settings" }}
              fallback="C"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  featuredIconContainer: {
    width: 52,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
  },

  fallbackIcon: {
    fontWeight: "800",
    lineHeight: 30,
  },
});
