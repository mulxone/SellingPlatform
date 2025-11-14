
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { supabase } from '../../supabase';
import { useRouter, useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

interface Listing {
  id: string;
  title: string;
  price: number;
  unit: string;
  images: string[];
  location: string | null;
  created_at: string;
  category: string;
  description?: string;
}

export default function MarketplaceScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const router = useRouter();

  // Fetch listings function
  const fetchListings = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      Alert.alert('Error', 'Failed to load listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh when screen comes into focus (after creating listing)
  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [])
  );

  useEffect(() => {
    fetchListings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleListingPress = (listingId: string) => {
    console.log('Navigating to listing:', listingId);
    router.push(`/listing/${listingId}`);
  };

  const renderListing = ({ item }: { item: Listing }) => (
    <TouchableOpacity 
      style={styles.listingCard}
      onPress={() => handleListingPress(item.id)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
        style={styles.listingImage}
        defaultSource={{ uri: 'https://via.placeholder.com/150' }}
      />
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.listingPrice}>
          ${item.price} / {item.unit}
        </Text>
        <View style={styles.listingMeta}>
          {item.location && (
            <Text style={styles.listingLocation} numberOfLines={1}>
              📍 {item.location}
            </Text>
          )}
          <Text style={styles.listingCategory}>
            {item.category}
          </Text>
        </View>
        <Text style={styles.listingDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Listings Yet</Text>
      <Text style={styles.emptyStateText}>
        Be the first to create a listing in the marketplace!
      </Text>
      <TouchableOpacity 
        style={styles.createListingButton}
        onPress={() => router.push('/(tabs)/sell')}
      >
        <Text style={styles.createListingButtonText}>Create First Listing</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
        <Text style={styles.loadingText}>Loading marketplace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <Text style={styles.headerSubtitle}>
          Discover fresh produce and farm equipment
        </Text>
      </View>

      {listings.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListing}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {listings.length} {listings.length === 1 ? 'listing' : 'listings'} available
            </Text>
          }
        />
      )}
    </View>
  );
}

// ... keep the same styles from before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listingCard: {
    width: (width - 40) / 2,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listingImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
    lineHeight: 18,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 6,
  },
  listingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  listingCategory: {
    fontSize: 11,
    color: 'green',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  listingDate: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
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
});