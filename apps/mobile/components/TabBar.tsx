import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TABS, C, type Tab } from '../lib/constants';

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: Tab) => void;
  paddingBottom: number;
}

export function TabBar({ activeTab, onTabPress, paddingBottom }: TabBarProps) {
  return (
    <View style={[styles.tabBar, { paddingBottom }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabPress(tab)}
            style={styles.tabItem}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text
              style={[styles.tabLabel, { color: isActive ? C.active : C.inactive }]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { fontSize: 20, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
