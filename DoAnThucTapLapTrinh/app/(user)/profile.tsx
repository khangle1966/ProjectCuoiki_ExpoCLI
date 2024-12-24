import { supabase } from '@/lib/supabase';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthProvider";

const ProfileScreen = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.log('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/sign-in');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Details', headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color='8B4513' />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile/edit')}>
          <Icon name="create-outline" size={24} color='8B4513' />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <Image
          source={{ uri: userProfile?.avatar_url || 'https://i.pinimg.com/736x/03/eb/d6/03ebd625cc0b9d636256ecc44c0ea324.jpg' }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>
          {userProfile?.full_name || session?.user?.email?.split('@')[0] || 'User'}
        </Text>
        <Text style={styles.userEmail}>
          {session?.user?.email || ''}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Icon name="call-outline" size={24} color='8B4513' />
          <Text style={styles.detailText}>+12 345 678 92</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="mail-outline" size={24} color='8B4513' />
          <Text style={styles.detailText}>{session?.user?.email || 'example@gmail.com'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="location-outline" size={24} color='8B4513' />
          <Text style={styles.detailText}>Franklin Avenue, Corner St. London, 24125151</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="log-out-outline" size={22} color="#FF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  userLocation: {
    fontSize: 14,
    color: '#666',
  },
  detailsContainer: {
    backgroundColor: 'FFF8DC',
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  mostOrderedContainer: {
    marginTop: 30,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  orderImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },
  orderText: {
    fontSize: 14,
    color: '#333',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 25,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  signOutText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '500',
  },
});

export default ProfileScreen;
