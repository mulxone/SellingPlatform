

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import { supabase } from '../../supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  profile_photo: string | null;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  unit: string;
  images: string[];
  category: string;
  status: string;
  created_at: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'shop'>('profile');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  // Enhanced focus effect to refresh data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Profile screen focused - refreshing data...');
      refreshAllData();
    }, [])
  );

  const checkAuth = async (): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await refreshAllData();
    } else {
      router.replace('/(auth)/login');
    }
  };

  const refreshAllData = async (): Promise<void> => {
    if (!user) {
      // Get current user if not available
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        await fetchMyListings(session.user.id);
      }
      return;
    }
    
    await Promise.all([
      fetchProfile(user.id),
      fetchMyListings(user.id)
    ]);
  };

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setForm({
        name: data.name || '',
        phone: data.phone || '',
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchMyListings = async (userId: string): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyListings(data || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      Alert.alert('Error', 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAllData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const requestPermissions = async (): Promise<void> => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
      Alert.alert(
        'Permissions required',
        'Camera and media library permissions are required to upload profile pictures.'
      );
    }
  };

  const uploadProfilePicture = async (uri: string): Promise<string> => {
    const fileExt = uri.split('.').pop();
    const fileName = `profile-${Date.now()}.${fileExt}`;

    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    const blob = Buffer.from(base64, 'base64');

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, blob, { contentType: 'image/jpeg' });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const pickProfilePicture = async (): Promise<void> => {
    await requestPermissions();
    
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateProfilePicture(result.assets[0].uri);
    }
  };

  const takeProfilePicture = async (): Promise<void> => {
    await requestPermissions();
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateProfilePicture(result.assets[0].uri);
    }
  };

  const updateProfilePicture = async (uri: string): Promise<void> => {
    setUploading(true);
    try {
      const profilePhotoUrl = await uploadProfilePicture(uri);

      const { error } = await supabase
        .from('users')
        .update({ profile_photo: profilePhotoUrl })
        .eq('id', user!.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile picture updated!');
      await fetchProfile(user!.id); // Refresh profile data
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async (): Promise<void> => {
    if (!form.name || !form.phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: form.name,
          phone: form.phone,
        })
        .eq('id', user!.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      await fetchProfile(user!.id); // Refresh profile data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string): Promise<void> => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId);

              if (error) throw error;

              Alert.alert('Success', 'Listing deleted successfully');
              // Refresh listings after deletion
              if (user) {
                await fetchMyListings(user.id);
              }
            } catch (error: any) {
              console.error('Error deleting listing:', error);
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleEditListing = (listingId: string): void => {
    router.push(`/edit-listing/${listingId}`);
  };

  const handleSignOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setUser(null);
      setProfile(null);
      setMyListings([]);
      router.replace('/(auth)/login');
    }
  };

  const handleTabChange = (tab: 'profile' | 'shop') => {
    setActiveTab(tab);
    // Refresh data when switching tabs
    if (user) {
      if (tab === 'shop') {
        fetchMyListings(user.id);
      }
    }
  };

  const renderProfilePictureSection = () => (
    <View style={styles.profilePictureSection}>
      <TouchableOpacity 
        style={styles.profilePictureContainer}
        onPress={() => {
          Alert.alert(
            'Update Profile Picture',
            'Choose an option',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Take Photo', onPress: takeProfilePicture },
              { text: 'Choose from Library', onPress: pickProfilePicture },
            ]
          );
        }}
        disabled={uploading}
      >
        {profile?.profile_photo ? (
          <Image 
            source={{ uri: profile.profile_photo }} 
            style={styles.profilePicture}
          />
        ) : (
          <View style={styles.profilePicturePlaceholder}>
            <Ionicons name="person" size={32} color="white" />
          </View>
        )}
        {uploading && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="small" color="white" />
          </View>
        )}
        <View style={styles.cameraIcon}>
          <Ionicons name="camera" size={16} color="white" />
        </View>
      </TouchableOpacity>
      <Text style={styles.profilePictureText}>
        Tap to {profile?.profile_photo ? 'change' : 'add'} photo
      </Text>
    </View>
  );

  const renderListing = ({ item }: { item: Listing }) => (
    <View style={styles.listingCard}>
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
        style={styles.listingImage}
      />
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.listingPrice}>
          ${item.price} / {item.unit}
        </Text>
        <View style={styles.listingMeta}>
          <Text style={[
            styles.listingStatus,
            item.status === 'active' ? styles.statusActive : styles.statusInactive
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
          <Text style={styles.listingCategory}>
            {item.category}
          </Text>
        </View>
        <Text style={styles.listingDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.listingActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditListing(item.id)}
        >
          <Ionicons name="pencil" size={16} color="#666" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteListing(item.id)}
        >
          <Ionicons name="trash" size={16} color="#ff4444" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="green" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
          onPress={() => handleTabChange('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shop' && styles.tabActive]}
          onPress={() => handleTabChange('shop')}
        >
          <Text style={[styles.tabText, activeTab === 'shop' && styles.tabTextActive]}>
            My Shop ({myListings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profile' ? (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['green']}
              tintColor={'green'}
            />
          }
        >
          {/* Profile Picture Section */}
          {renderProfilePictureSection()}

          {editing ? (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Edit Profile</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                keyboardType="phone-pad"
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setEditing(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={updateProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.profileHeader}>
                <View style={styles.profileText}>
                  <Text style={styles.profileName}>{profile?.name || 'Not set'}</Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{profile?.phone || 'Not set'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="storefront-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    {myListings.length} listings in shop
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setEditing(true)}
              >
                <Ionicons name="pencil" size={18} color="white" />
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color="white" />
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.shopContent}>
          <View style={styles.shopHeader}>
            <Text style={styles.shopTitle}>My Shop</Text>
            <Text style={styles.shopSubtitle}>
              Manage your listings and track your sales
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="green" />
              <Text style={styles.loadingText}>Loading your listings....</Text>
            </View>
          ) : myListings.length === 0 ? (
            <View style={styles.emptyShop}>
              <Ionicons name="storefront-outline" size={64} color="#ccc" />
              <Text style={styles.emptyShopTitle}>No Listings Yet</Text>
              <Text style={styles.emptyShopText}>
                Start selling by creating your first listing!
              </Text>
              <TouchableOpacity 
                style={styles.createListingButton}
                onPress={() => router.push('/(tabs)/sell')}
              >
                <Text style={styles.createListingButtonText}>Create Listing</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={myListings}
              renderItem={renderListing}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listingsContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['green']}
                  tintColor={'green'}
                />
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

// ... keep all your existing styles exactly the same ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: 'green',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: 'green',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // Profile Picture Styles
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'green',
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'green',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'green',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profilePictureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  profileInfo: {
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileText: {
    flex: 1,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  infoGrid: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: 'green',
  },
  saveButton: {
    backgroundColor: 'green',
    flex: 1,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    flex: 1,
    marginRight: 8,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shopContent: {
    flex: 1,
  },
  shopHeader: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  shopTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  shopSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyShop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyShopTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyShopText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  createListingButton: {
    backgroundColor: 'green',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createListingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listingsContainer: {
    padding: 16,
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  listingImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  listingInfo: {
    padding: 16,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 8,
  },
  listingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingStatus: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#e8f5e8',
    color: 'green',
  },
  statusInactive: {
    backgroundColor: '#ffe6e6',
    color: '#dc3545',
  },
  listingCategory: {
    fontSize: 12,
    color: 'green',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  listingDate: {
    fontSize: 12,
    color: '#999',
  },
  listingActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  deleteText: {
    color: '#dc3545',
  },
});