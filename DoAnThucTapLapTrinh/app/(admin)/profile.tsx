import { supabase } from '@/lib/supabase';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from "react-native-vector-icons/Ionicons";

const ProfileScreen = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/sign-in');
    }
  };

  const menuItems = [
    {
      section: 'Management',
      items: [
        { icon: 'fast-food-outline', label: 'Products', onPress: () => router.push('/(admin)/menu/products') },
      { icon: 'receipt-outline', label: 'Orders', onPress: () => router.push('/(admin)/orders/list/index') },
      { icon: 'cash-outline', label: 'Revenue', onPress: () => router.push('/(admin)/menu/revenue') },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Icon name="person" size={30} color="#B89E8F" />
          </View>
          <View>
            <Text style={styles.greeting}>Welcome Back,</Text>
            <Text style={styles.name}>Admin</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[{ label: 'Products', icon: 'cube-outline' }, { label: 'Orders', icon: 'receipt-outline' }, { label: 'Settings', icon: 'settings-outline' }, { label: 'Analytics', icon: 'stats-chart-outline' }].map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionButton}>
            <Icon name={action.icon} size={24} color="#A47551" />
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu Sections */}
      {menuItems.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity key={itemIndex} style={styles.menuItem} onPress={item.onPress}>
              <Icon name={item.icon} size={22} color="#B89E8F" style={styles.menuIcon} />
              <Text style={styles.menuText}>{item.label}</Text>
              <Icon name="chevron-forward" size={20} color="#B89E8F" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="log-out-outline" size={22} color="#FF6F61" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Add some bottom padding for better scrolling */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7E8DF',
  },
  header: {
    backgroundColor: '#B89E8F',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DFC4B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#F4F1EE',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    justifyContent: 'space-between',
    marginHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B4E3D',
  },
  section: {
    backgroundColor: '#FFF',
    margin: 15,
    padding: 10,
    borderRadius: 15,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A47551',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DED2',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B4E3D',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 15,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  signOutText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#FF6F61',
    fontWeight: '600',
  },
});

export default ProfileScreen;