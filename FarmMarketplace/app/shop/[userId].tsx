

// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   FlatList,
//   Dimensions,
//   StatusBar,
//   Alert
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { supabase } from '../../supabase';
// import { Ionicons } from '@expo/vector-icons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const { width } = Dimensions.get('window');

// interface User {
//   id: string;
//   name: string;
//   phone: string;
//   profile_photo: string | null;
//   created_at: string;
// }

// interface Listing {
//   id: string;
//   title: string;
//   price: number;
//   unit: string;
//   images: string[];
//   category: string;
//   location: string | null;
//   created_at: string;
// }

// export default function SellerShopScreen() {
//   const { userId } = useLocalSearchParams();
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const [seller, setSeller] = useState<User | null>(null);
//   const [listings, setListings] = useState<Listing[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (userId) {
//       fetchSellerAndListings();
//     }
//   }, [userId]);

//   const fetchSellerAndListings = async () => {
//     try {
//       // Fetch seller profile
//       const { data: sellerData, error: sellerError } = await supabase
//         .from('users')
//         .select('*')
//         .eq('id', userId)
//         .single();

//       if (sellerError) throw sellerError;
//       setSeller(sellerData);

//       // Fetch seller's active listings
//       const { data: listingsData, error: listingsError } = await supabase
//         .from('listings')
//         .select('*')
//         .eq('user_id', userId)
//         .eq('status', 'active')
//         .order('created_at', { ascending: false });

//       if (listingsError) throw listingsError;
//       setListings(listingsData || []);
//     } catch (error: any) {
//       console.error('Error fetching shop:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBack = () => {
//     router.back();
//   };

//   const handleListingPress = (listingId: string) => {
//     router.push(`/listing/${listingId}`);
//   };

//   const handleContactSeller = () => {
//     if (seller?.phone) {
//       // In a real app, you'd implement calling/messaging
//       Alert.alert(
//         'Contact Seller',
//         `Phone: ${seller.phone}`,
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Call', onPress: () => console.log('Call:', seller.phone) },
//           { text: 'Message', onPress: () => console.log('Message:', seller.phone) }
//         ]
//       );
//     }
//   };

//   const renderListing = ({ item }: { item: Listing }) => (
//     <TouchableOpacity 
//       style={styles.listingCard}
//       onPress={() => handleListingPress(item.id)}
//       activeOpacity={0.7}
//     >
//       <Image
//         source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
//         style={styles.listingImage}
//       />
//       <View style={styles.listingInfo}>
//         <Text style={styles.listingTitle} numberOfLines={2}>
//           {item.title}
//         </Text>
//         <Text style={styles.listingPrice}>
//           ${item.price} / {item.unit}
//         </Text>
//         <View style={styles.listingMeta}>
//           {item.location && (
//             <Text style={styles.listingLocation} numberOfLines={1}>
//               📍 {item.location}
//             </Text>
//           )}
//           <Text style={styles.listingCategory}>
//             {item.category}
//           </Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={[styles.center, { paddingTop: insets.top }]}>
//         <ActivityIndicator size="large" color="green" />
//         <Text style={styles.loadingText}>Loading shop...</Text>
//       </View>
//     );
//   }

//   if (!seller) {
//     return (
//       <View style={[styles.center, { paddingTop: insets.top }]}>
//         <Text style={styles.errorText}>Shop not found</Text>
//         <TouchableOpacity style={styles.button} onPress={handleBack}>
//           <Text style={styles.buttonText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
//       {/* Header */}
//       <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={handleBack}
//           activeOpacity={0.7}
//         >
//           <Ionicons name="chevron-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Seller Shop</Text>
//         <View style={styles.headerSpacer} />
//       </View>

//       <ScrollView 
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
//       >
//         {/* Seller Profile */}
//         <View style={styles.sellerSection}>
//           <View style={styles.sellerHeader}>
//             <View style={styles.avatar}>
//               <Text style={styles.avatarText}>
//                 {seller.name?.charAt(0)?.toUpperCase() || 'S'}
//               </Text>
//             </View>
//             <View style={styles.sellerInfo}>
//               <Text style={styles.sellerName}>{seller.name}</Text>
//               <Text style={styles.sellerStats}>
//                 {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
//               </Text>
//               <Text style={styles.sellerJoinDate}>
//                 Selling since {new Date(seller.created_at).getFullYear()}
//               </Text>
//             </View>
//           </View>

//           <TouchableOpacity 
//             style={styles.contactButton}
//             onPress={handleContactSeller}
//           >
//             <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
//             <Text style={styles.contactButtonText}>Contact Seller</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Listings */}
//         <View style={styles.listingsSection}>
//           <Text style={styles.sectionTitle}>
//             All Listings ({listings.length})
//           </Text>
          
//           {listings.length === 0 ? (
//             <View style={styles.emptyListings}>
//               <Ionicons name="storefront-outline" size={64} color="#ccc" />
//               <Text style={styles.emptyText}>No listings available</Text>
//               <Text style={styles.emptySubtext}>
//                 This seller hasn't posted any items yet.
//               </Text>
//             </View>
//           ) : (
//             <FlatList
//               data={listings}
//               renderItem={renderListing}
//               keyExtractor={(item) => item.id}
//               numColumns={2}
//               scrollEnabled={false}
//               columnWrapperStyle={styles.columnWrapper}
//               contentContainerStyle={styles.listingsGrid}
//             />
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   errorText: {
//     fontSize: 18,
//     color: '#666',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f8f8f8',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#e8e8e8',
//   },
//   headerTitle: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: '#333',
//   },
//   headerSpacer: {
//     width: 40,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   sellerSection: {
//     padding: 20,
//     backgroundColor: '#f8f9fa',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   sellerHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   avatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: 'green',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   avatarText: {
//     color: 'white',
//     fontSize: 32,
//     fontWeight: 'bold',
//   },
//   sellerInfo: {
//     flex: 1,
//   },
//   sellerName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   sellerStats: {
//     fontSize: 16,
//     color: 'green',
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   sellerJoinDate: {
//     fontSize: 14,
//     color: '#666',
//   },
//   contactButton: {
//     backgroundColor: 'green',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 16,
//     borderRadius: 12,
//   },
//   contactButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   listingsSection: {
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 16,
//   },
//   emptyListings: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//   },
//   listingsGrid: {
//     paddingBottom: 20,
//   },
//   columnWrapper: {
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   listingCard: {
//     width: (width - 56) / 2,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 12,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   listingImage: {
//     width: '100%',
//     height: 120,
//     resizeMode: 'cover',
//   },
//   listingInfo: {
//     padding: 12,
//   },
//   listingTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 6,
//     color: '#333',
//     lineHeight: 18,
//   },
//   listingPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: 'green',
//     marginBottom: 6,
//   },
//   listingMeta: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   listingLocation: {
//     fontSize: 12,
//     color: '#666',
//     flex: 1,
//   },
//   listingCategory: {
//     fontSize: 11,
//     color: 'green',
//     backgroundColor: '#e8f5e8',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   button: {
//     backgroundColor: 'green',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });


// app/shop/[userId].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../supabase';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface User {
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
  location: string | null;
  created_at: string;
}

export default function SellerShopScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [seller, setSeller] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchSellerAndListings();
    }
  }, [userId]);

  const fetchSellerAndListings = async () => {
    try {
      // Fetch seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Fetch seller's active listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;
      setListings(listingsData || []);
    } catch (error: any) {
      console.error('Error fetching shop:', error);
      Alert.alert('Error', 'Failed to load shop');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}`);
  };

  const handleContactSeller = () => {
    if (seller?.phone) {
      Alert.alert(
        'Contact Seller',
        `Phone: ${seller.phone}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Call:', seller.phone) },
          { text: 'Message', onPress: () => console.log('Message:', seller.phone) }
        ]
      );
    } else {
      Alert.alert('Info', 'Contact information not available');
    }
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
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="green" />
        <Text style={styles.loadingText}>Loading shop...</Text>
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Shop not found</Text>
        <TouchableOpacity style={styles.button} onPress={handleBack}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Shop</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Seller Profile */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerHeader}>
            <View style={styles.avatar}>
              {seller.profile_photo ? (
                <Image 
                  source={{ uri: seller.profile_photo }} 
                  style={styles.profilePicture}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {seller.name?.charAt(0)?.toUpperCase() || 'S'}
                </Text>
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{seller.name}</Text>
              <Text style={styles.sellerStats}>
                {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
              </Text>
              <Text style={styles.sellerJoinDate}>
                Selling since {new Date(seller.created_at).getFullYear()}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContactSeller}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
            <Text style={styles.contactButtonText}>Contact Seller</Text>
          </TouchableOpacity>
        </View>

        {/* Listings */}
        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>
            All Listings ({listings.length})
          </Text>
          
          {listings.length === 0 ? (
            <View style={styles.emptyListings}>
              <Ionicons name="storefront-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No listings available</Text>
              <Text style={styles.emptySubtext}>
                This seller hasn't posted any items yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={listings}
              renderItem={renderListing}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listingsGrid}
            />
          )}
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
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  sellerSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sellerStats: {
    fontSize: 16,
    color: 'green',
    fontWeight: '600',
    marginBottom: 4,
  },
  sellerJoinDate: {
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    backgroundColor: 'green',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listingsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyListings: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listingsGrid: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listingCard: {
    width: (width - 56) / 2,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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