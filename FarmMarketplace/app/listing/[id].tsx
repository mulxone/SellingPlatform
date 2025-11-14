
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../supabase';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  quantity: number | null;
  location: string | null;
  images: string[];
  phone: string | null;
  user_id: string;
  created_at: string;
  user?: {
    name: string;
    phone: string;
  };
}

export default function ListingDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          user:users(name, phone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error: any) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = () => {
    if (listing?.phone) {
      Alert.alert(
        'Contact Seller',
        `Phone: ${listing.phone}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Call:', listing.phone) },
          { text: 'Message', onPress: () => console.log('Message:', listing.phone) }
        ]
      );
    } else if (listing?.user?.phone) {
      Alert.alert(
        'Contact Seller',
        `Phone: ${listing.user.phone}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Call:', listing.user?.phone) },
          { text: 'Message', onPress: () => console.log('Message:', listing.user?.phone) }
        ]
      );
    } else {
      Alert.alert('Info', 'Contact information not available');
    }
  };

  const nextImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewSellerShop = () => {
    if (listing?.user_id) {
      router.push(`/shop/${listing.user_id}`);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <ActivityIndicator size="large" color="green" />
        <Text style={styles.loadingText}>Loading listing...</Text>
      </View>
    );
  }

  // Show error state
  if (error || !listing) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <Text style={styles.errorText}>{error || 'Listing not found'}</Text>
        <TouchableOpacity style={styles.button} onPress={handleBack}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Custom Header with Safe Area - Only back button */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: listing.images[currentImageIndex] || 'https://via.placeholder.com/300' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          
          {listing.images.length > 1 && (
            <>
              <TouchableOpacity 
                style={[styles.navButton, styles.prevButton]} 
                onPress={prevImage}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]} 
                onPress={nextImage}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.imageIndicator}>
                <Text style={styles.imageIndicatorText}>
                  {currentImageIndex + 1} / {listing.images.length}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Thumbnail Images */}
        {listing.images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
            {listing.images.map((image, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setCurrentImageIndex(index)}
                style={[
                  styles.thumbnail,
                  index === currentImageIndex && styles.thumbnailActive
                ]}
                activeOpacity={0.7}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Listing Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>${listing.price} / {listing.unit}</Text>
          
          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag-outline" size={16} color="green" />
            <Text style={styles.category}>{listing.category}</Text>
          </View>

          {listing.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          )}

          <View style={styles.detailsGrid}>
            {listing.quantity && (
              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={20} color="#666" />
                <Text style={styles.detailText}>Quantity: {listing.quantity}</Text>
              </View>
            )}
            
            {listing.location && (
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{listing.location}</Text>
              </View>
            )}
            
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Listed {new Date(listing.created_at).toLocaleDateString()}
              </Text>
            </View>

            {listing.user && (
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <Text style={styles.detailText}>Seller: {listing.user.name}</Text>
              </View>
            )}
          </View>

          {/* Seller Shop Button */}
          {listing.user && (
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={handleViewSellerShop}
              activeOpacity={0.8}
            >
              <Ionicons name="storefront-outline" size={20} color="green" />
              <Text style={styles.shopButtonText}>View Seller's Shop</Text>
            </TouchableOpacity>
          )}

          {/* Contact Seller Button */}
          <TouchableOpacity 
            style={styles.contactButton} 
            onPress={handleContactSeller}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="white" />
            <Text style={styles.contactButtonText}>Contact Seller</Text>
          </TouchableOpacity>

          {/* Safety Tips */}
          <View style={styles.safetyTips}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#856404" />
              <Text style={styles.safetyTitle}>Safety Tips</Text>
            </View>
            <Text style={styles.safetyText}>• Meet in a public place</Text>
            <Text style={styles.safetyText}>• Check the product before buying</Text>
            <Text style={styles.safetyText}>• Never pay in advance</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 1000,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: height * 0.4, // Responsive height
    maxHeight: 400,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -22 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  prevButton: {
    left: 16,
  },
  nextButton: {
    right: 16,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailContainer: {
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnailActive: {
    borderColor: 'green',
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    lineHeight: 28,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  category: {
    color: 'green',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
  },
  detailsGrid: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f8fff8',
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shopButtonText: {
    color: 'green',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactButton: {
    backgroundColor: 'green',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  safetyTips: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#856404',
  },
  safetyText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
    lineHeight: 18,
  },
  button: {
    backgroundColor: 'green',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});