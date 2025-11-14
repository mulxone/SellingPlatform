// // app/(tabs)/sell.tsx
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system/legacy';
// import { Buffer } from 'buffer';
// import { supabase } from '../../supabase';

// const CATEGORIES = ['Produce', 'Tools', 'Seeds', 'Fertilizers', 'Equipment'];

// interface SellForm {
//   title: string;
//   description: string;
//   category: string;
//   price: string;
//   unit: string;
//   quantity: string;
//   location: string;
// }

// export default function SellScreen() {
//   const [form, setForm] = useState<SellForm>({
//     title: '',
//     description: '',
//     category: '',
//     price: '',
//     unit: '',
//     quantity: '',
//     location: '',
//   });
//   const [images, setImages] = useState<string[]>([]);
//   const [uploading, setUploading] = useState<boolean>(false);

//   const requestPermissions = async (): Promise<void> => {
//     const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
//     const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
//       Alert.alert(
//         'Permissions required',
//         'Camera and media library permissions are required to upload images.'
//       );
//     }
//   };

//   const pickImage = async (): Promise<void> => {
//     await requestPermissions();
    
//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//     });

//     if (!result.canceled && result.assets[0]) {
//       setImages([...images, result.assets[0].uri]);
//     }
//   };

//   const takePhoto = async (): Promise<void> => {
//     await requestPermissions();
    
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       quality: 0.8,
//     });

//     if (!result.canceled && result.assets[0]) {
//       setImages([...images, result.assets[0].uri]);
//     }
//   };

//   const uploadImage = async (uri: string): Promise<string> => {
//     const fileExt = uri.split('.').pop();
//     const fileName = `${Date.now()}.${fileExt}`;

//     const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
//     const blob = Buffer.from(base64, 'base64');

//     const { data, error } = await supabase.storage
//       .from('uploads')
//       .upload(fileName, blob, { contentType: 'image/jpeg' });

//     if (error) throw error;

//     const { data: { publicUrl } } = supabase.storage
//       .from('uploads')
//       .getPublicUrl(fileName);

//     return publicUrl;
//   };

//   const removeImage = (index: number): void => {
//     const newImages = images.filter((_, i) => i !== index);
//     setImages(newImages);
//   };

//   const handleSubmit = async (): Promise<void> => {
//     if (!form.title || !form.price || !form.category || !form.unit) {
//       Alert.alert('Error', 'Please fill in all required fields');
//       return;
//     }

//     if (images.length === 0) {
//       Alert.alert('Error', 'Please add at least one image');
//       return;
//     }

//     setUploading(true);

//     try {
//       // Upload all images
//       const imageUrls: string[] = [];
//       for (const imageUri of images) {
//         const url = await uploadImage(imageUri);
//         imageUrls.push(url);
//       }

//       // Get current user
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error('User not authenticated');

//       // Check if user profile exists
//       const { data: profile } = await supabase
//         .from('users')
//         .select('*')
//         .eq('id', user.id)
//         .single();

//       if (!profile) {
//         throw new Error('Please complete your profile first');
//       }

//       // Create listing
//       const { error } = await supabase.from('listings').insert({
//         user_id: user.id,
//         title: form.title,
//         description: form.description,
//         category: form.category,
//         price: parseFloat(form.price),
//         unit: form.unit,
//         quantity: form.quantity ? parseFloat(form.quantity) : null,
//         location: form.location,
//         images: imageUrls,
//         phone: profile.phone,
//       });

//       if (error) throw error;

//       Alert.alert('Success', 'Listing created successfully!');
//       // Reset form
//       setForm({
//         title: '',
//         description: '',
//         category: '',
//         price: '',
//         unit: '',
//         quantity: '',
//         location: '',
//       });
//       setImages([]);
//     } catch (error: any) {
//       console.error('Error creating listing:', error);
//       Alert.alert('Error', error.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <Text style={styles.header}>Sell Your Product</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Product Title *"
//         value={form.title}
//         onChangeText={(text) => setForm({ ...form, title: text })}
//       />

//       <TextInput
//         style={[styles.input, styles.textArea]}
//         placeholder="Description"
//         value={form.description}
//         onChangeText={(text) => setForm({ ...form, description: text })}
//         multiline
//         numberOfLines={3}
//       />

//       <Text style={styles.label}>Category *</Text>
//       <View style={styles.categoryContainer}>
//         {CATEGORIES.map((category) => (
//           <TouchableOpacity
//             key={category}
//             style={[
//               styles.categoryButton,
//               form.category === category && styles.categoryButtonSelected,
//             ]}
//             onPress={() => setForm({ ...form, category })}
//           >
//             <Text
//               style={[
//                 styles.categoryText,
//                 form.category === category && styles.categoryTextSelected,
//               ]}
//             >
//               {category}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <View style={styles.row}>
//         <View style={styles.halfInputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Price *"
//             value={form.price}
//             onChangeText={(text) => setForm({ ...form, price: text })}
//             keyboardType="numeric"
//           />
//         </View>
//         <View style={styles.halfInputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Unit (kg, lb, etc) *"
//             value={form.unit}
//             onChangeText={(text) => setForm({ ...form, unit: text })}
//           />
//         </View>
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="Quantity (optional)"
//         value={form.quantity}
//         onChangeText={(text) => setForm({ ...form, quantity: text })}
//         keyboardType="numeric"
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Location"
//         value={form.location}
//         onChangeText={(text) => setForm({ ...form, location: text })}
//       />

//       <Text style={styles.label}>Product Images *</Text>
//       <View style={styles.imageButtons}>
//         <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
//           <Text style={styles.imageButtonText}>Pick from Library</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
//           <Text style={styles.imageButtonText}>Take Photo</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
//         <View style={styles.imagePreviewContainer}>
//           {images.map((uri, index) => (
//             <View key={index} style={styles.imagePreviewWrapper}>
//               <Image source={{ uri }} style={styles.imagePreview} />
//               <TouchableOpacity 
//                 style={styles.removeImageButton}
//                 onPress={() => removeImage(index)}
//               >
//                 <Text style={styles.removeImageText}>×</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//         </View>
//       </ScrollView>

//       <TouchableOpacity
//         style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
//         onPress={handleSubmit}
//         disabled={uploading}
//       >
//         {uploading ? (
//           <ActivityIndicator color="white" />
//         ) : (
//           <Text style={styles.submitButtonText}>Create Listing</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//   },
//   textArea: {
//     height: 80,
//     textAlignVertical: 'top',
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   halfInputContainer: {
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#333',
//   },
//   categoryContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 16,
//   },
//   categoryButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   categoryButtonSelected: {
//     backgroundColor: 'green',
//     borderColor: 'green',
//   },
//   categoryText: {
//     color: '#666',
//     fontSize: 14,
//   },
//   categoryTextSelected: {
//     color: 'white',
//   },
//   imageButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   imageButton: {
//     flex: 1,
//     marginHorizontal: 4,
//     padding: 12,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   imageButtonText: {
//     color: '#333',
//     fontWeight: '600',
//   },
//   imageScrollView: {
//     marginBottom: 16,
//   },
//   imagePreviewContainer: {
//     flexDirection: 'row',
//   },
//   imagePreviewWrapper: {
//     position: 'relative',
//     marginRight: 8,
//   },
//   imagePreview: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//   },
//   removeImageButton: {
//     position: 'absolute',
//     top: -5,
//     right: -5,
//     backgroundColor: 'red',
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   removeImageText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   submitButton: {
//     backgroundColor: 'green',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// app/(tabs)/sell.tsx



// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system/legacy';
// import { Buffer } from 'buffer';
// import { supabase } from '../../supabase';
// import { useRouter } from 'expo-router';

// const CATEGORIES = ['Produce', 'Tools', 'Seeds', 'Fertilizers', 'Equipment'];

// interface SellForm {
//   title: string;
//   description: string;
//   category: string;
//   price: string;
//   unit: string;
//   quantity: string;
//   location: string;
// }

// export default function SellScreen() {
//   const [form, setForm] = useState<SellForm>({
//     title: '',
//     description: '',
//     category: '',
//     price: '',
//     unit: '',
//     quantity: '',
//     location: '',
//   });
//   const [images, setImages] = useState<string[]>([]);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const router = useRouter();

//   const requestPermissions = async (): Promise<void> => {
//     const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
//     const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
//       Alert.alert(
//         'Permissions required',
//         'Camera and media library permissions are required to upload images.'
//       );
//     }
//   };

//   const pickImage = async (): Promise<void> => {
//     await requestPermissions();
    
//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       mediaTypes: ['images'], // FIXED: Use array instead of MediaTypeOptions
//       quality: 0.8,
//     });

//     if (!result.canceled && result.assets[0]) {
//       setImages([...images, result.assets[0].uri]);
//     }
//   };

//   const takePhoto = async (): Promise<void> => {
//     await requestPermissions();
    
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       mediaTypes: ['images'], // FIXED: Use array instead of MediaTypeOptions
//       quality: 0.8,
//     });

//     if (!result.canceled && result.assets[0]) {
//       setImages([...images, result.assets[0].uri]);
//     }
//   };

//   const uploadImage = async (uri: string): Promise<string> => {
//     const fileExt = uri.split('.').pop();
//     const fileName = `${Date.now()}.${fileExt}`;

//     const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
//     const blob = Buffer.from(base64, 'base64');

//     const { data, error } = await supabase.storage
//       .from('uploads')
//       .upload(fileName, blob, { contentType: 'image/jpeg' });

//     if (error) throw error;

//     const { data: { publicUrl } } = supabase.storage
//       .from('uploads')
//       .getPublicUrl(fileName);

//     return publicUrl;
//   };

//   const removeImage = (index: number): void => {
//     const newImages = images.filter((_, i) => i !== index);
//     setImages(newImages);
//   };

//   const checkAuthentication = async (): Promise<boolean> => {
//     const { data: { session } } = await supabase.auth.getSession();
//     if (!session) {
//       Alert.alert(
//         'Authentication Required',
//         'Please sign in to create a listing.',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Sign In', onPress: () => router.push('/profile') }
//         ]
//       );
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (): Promise<void> => {
//     // Check authentication first
//     const isAuthenticated = await checkAuthentication();
//     if (!isAuthenticated) return;

//     if (!form.title || !form.price || !form.category || !form.unit) {
//       Alert.alert('Error', 'Please fill in all required fields');
//       return;
//     }

//     if (images.length === 0) {
//       Alert.alert('Error', 'Please add at least one image');
//       return;
//     }

//     setUploading(true);

//     try {
//       // Upload all images
//       const imageUrls: string[] = [];
//       for (const imageUri of images) {
//         const url = await uploadImage(imageUri);
//         imageUrls.push(url);
//       }

//       // Get current user (we already checked authentication, so this should work)
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error('User not authenticated');

//       // Check if user profile exists, if not create one
//       let profile = null;
//       const { data: existingProfile } = await supabase
//         .from('users')
//         .select('*')
//         .eq('id', user.id)
//         .single();

//       if (!existingProfile) {
//         // Create a basic profile
//         const { data: newProfile, error: createError } = await supabase
//           .from('users')
//           .insert({
//             id: user.id,
//             name: user.email?.split('@')[0] || 'User',
//             phone: user.phone || '',
//           })
//           .select()
//           .single();

//         if (createError) throw createError;
//         profile = newProfile;
//       } else {
//         profile = existingProfile;
//       }

//       // Create listing
//       const { error } = await supabase.from('listings').insert({
//         user_id: user.id,
//         title: form.title,
//         description: form.description,
//         category: form.category,
//         price: parseFloat(form.price),
//         unit: form.unit,
//         quantity: form.quantity ? parseFloat(form.quantity) : null,
//         location: form.location,
//         images: imageUrls,
//         phone: profile.phone,
//       });

//       if (error) throw error;

//       Alert.alert('Success', 'Listing created successfully!');
//       // Reset form
//       setForm({
//         title: '',
//         description: '',
//         category: '',
//         price: '',
//         unit: '',
//         quantity: '',
//         location: '',
//       });
//       setImages([]);
//     } catch (error: any) {
//       console.error('Error creating listing:', error);
//       Alert.alert('Error', error.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <Text style={styles.header}>Sell Your Product</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Product Title *"
//         value={form.title}
//         onChangeText={(text) => setForm({ ...form, title: text })}
//       />

//       <TextInput
//         style={[styles.input, styles.textArea]}
//         placeholder="Description"
//         value={form.description}
//         onChangeText={(text) => setForm({ ...form, description: text })}
//         multiline
//         numberOfLines={3}
//       />

//       <Text style={styles.label}>Category *</Text>
//       <View style={styles.categoryContainer}>
//         {CATEGORIES.map((category) => (
//           <TouchableOpacity
//             key={category}
//             style={[
//               styles.categoryButton,
//               form.category === category && styles.categoryButtonSelected,
//             ]}
//             onPress={() => setForm({ ...form, category })}
//           >
//             <Text
//               style={[
//                 styles.categoryText,
//                 form.category === category && styles.categoryTextSelected,
//               ]}
//             >
//               {category}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <View style={styles.row}>
//         <View style={styles.halfInputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Price *"
//             value={form.price}
//             onChangeText={(text) => setForm({ ...form, price: text })}
//             keyboardType="numeric"
//           />
//         </View>
//         <View style={styles.halfInputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Unit (kg, lb, etc) *"
//             value={form.unit}
//             onChangeText={(text) => setForm({ ...form, unit: text })}
//           />
//         </View>
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="Quantity (optional)"
//         value={form.quantity}
//         onChangeText={(text) => setForm({ ...form, quantity: text })}
//         keyboardType="numeric"
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Location"
//         value={form.location}
//         onChangeText={(text) => setForm({ ...form, location: text })}
//       />

//       <Text style={styles.label}>Product Images *</Text>
//       <View style={styles.imageButtons}>
//         <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
//           <Text style={styles.imageButtonText}>Pick from Library</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
//           <Text style={styles.imageButtonText}>Take Photo</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
//         <View style={styles.imagePreviewContainer}>
//           {images.map((uri, index) => (
//             <View key={index} style={styles.imagePreviewWrapper}>
//               <Image source={{ uri }} style={styles.imagePreview} />
//               <TouchableOpacity 
//                 style={styles.removeImageButton}
//                 onPress={() => removeImage(index)}
//               >
//                 <Text style={styles.removeImageText}>×</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//         </View>
//       </ScrollView>

//       <TouchableOpacity
//         style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
//         onPress={handleSubmit}
//         disabled={uploading}
//       >
//         {uploading ? (
//           <ActivityIndicator color="white" />
//         ) : (
//           <Text style={styles.submitButtonText}>Create Listing</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// // Keep the same styles...
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//   },
//   textArea: {
//     height: 80,
//     textAlignVertical: 'top',
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   halfInputContainer: {
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#333',
//   },
//   categoryContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 16,
//   },
//   categoryButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   categoryButtonSelected: {
//     backgroundColor: 'green',
//     borderColor: 'green',
//   },
//   categoryText: {
//     color: '#666',
//     fontSize: 14,
//   },
//   categoryTextSelected: {
//     color: 'white',
//   },
//   imageButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   imageButton: {
//     flex: 1,
//     marginHorizontal: 4,
//     padding: 12,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   imageButtonText: {
//     color: '#333',
//     fontWeight: '600',
//   },
//   imageScrollView: {
//     marginBottom: 16,
//   },
//   imagePreviewContainer: {
//     flexDirection: 'row',
//   },
//   imagePreviewWrapper: {
//     position: 'relative',
//     marginRight: 8,
//   },
//   imagePreview: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//   },
//   removeImageButton: {
//     position: 'absolute',
//     top: -5,
//     right: -5,
//     backgroundColor: 'red',
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   removeImageText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   submitButton: {
//     backgroundColor: 'green',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });


// app/(tabs)/sell.tsx


// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   Image,
//   ActivityIndicator,
//   Dimensions,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system/legacy';
// import { Buffer } from 'buffer';
// import { supabase } from '../../supabase';
// import { useRouter } from 'expo-router';

// const { width } = Dimensions.get('window');
// const CATEGORIES = ['Produce', 'Tools', 'Seeds', 'Fertilizers', 'Equipment'];

// interface SellForm {
//   title: string;
//   description: string;
//   category: string;
//   price: string;
//   unit: string;
//   quantity: string;
//   location: string;
// }

// export default function SellScreen() {
//   const [form, setForm] = useState<SellForm>({
//     title: '',
//     description: '',
//     category: '',
//     price: '',
//     unit: '',
//     quantity: '',
//     location: '',
//   });
//   const [images, setImages] = useState<string[]>([]);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const router = useRouter();

//   const requestPermissions = async (): Promise<void> => {
//     const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
//     const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
//       Alert.alert(
//         'Permissions required',
//         'Camera and media library permissions are required to upload images.'
//       );
//     }
//   };

//   const pickImage = async (): Promise<void> => {
//     await requestPermissions();
    
//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       mediaTypes: ['images'],
//       quality: 0.8,
//     });

//     if (!result.canceled && result.assets[0]) {
//       setImages([...images, result.assets[0].uri]);
//     }
//   };

//   const takePhoto = async (): Promise<void> => {
//     await requestPermissions();
    
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       mediaTypes: ['images'],
//       quality: 0.8,
//     });

//     if (!result.canceled && result.assets[0]) {
//       setImages([...images, result.assets[0].uri]);
//     }
//   };

//   const uploadImage = async (uri: string): Promise<string> => {
//     const fileExt = uri.split('.').pop();
//     const fileName = `${Date.now()}.${fileExt}`;

//     const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
//     const blob = Buffer.from(base64, 'base64');

//     const { data, error } = await supabase.storage
//       .from('uploads')
//       .upload(fileName, blob, { contentType: 'image/jpeg' });

//     if (error) throw error;

//     const { data: { publicUrl } } = supabase.storage
//       .from('uploads')
//       .getPublicUrl(fileName);

//     return publicUrl;
//   };

//   const removeImage = (index: number): void => {
//     const newImages = images.filter((_, i) => i !== index);
//     setImages(newImages);
//   };

//   const checkAuthentication = async (): Promise<boolean> => {
//     const { data: { session } } = await supabase.auth.getSession();
//     if (!session) {
//       Alert.alert(
//         'Authentication Required',
//         'Please sign in to create a listing.',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Sign In', onPress: () => router.push('/profile') }
//         ]
//       );
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (): Promise<void> => {
//     // Check authentication first
//     const isAuthenticated = await checkAuthentication();
//     if (!isAuthenticated) return;

//     if (!form.title || !form.price || !form.category || !form.unit) {
//       Alert.alert('Error', 'Please fill in all required fields');
//       return;
//     }

//     if (images.length === 0) {
//       Alert.alert('Error', 'Please add at least one image');
//       return;
//     }

//     setUploading(true);

//     try {
//       // Upload all images
//       const imageUrls: string[] = [];
//       for (const imageUri of images) {
//         const url = await uploadImage(imageUri);
//         imageUrls.push(url);
//       }

//       // Get current user (we already checked authentication, so this should work)
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error('User not authenticated');

//       // Check if user profile exists, if not create one
//       let profile = null;
//       const { data: existingProfile } = await supabase
//         .from('users')
//         .select('*')
//         .eq('id', user.id)
//         .single();

//       if (!existingProfile) {
//         // Create a basic profile
//         const { data: newProfile, error: createError } = await supabase
//           .from('users')
//           .insert({
//             id: user.id,
//             name: user.email?.split('@')[0] || 'User',
//             phone: user.phone || '',
//           })
//           .select()
//           .single();

//         if (createError) throw createError;
//         profile = newProfile;
//       } else {
//         profile = existingProfile;
//       }

//       // Create listing
//       const { error } = await supabase.from('listings').insert({
//         user_id: user.id,
//         title: form.title,
//         description: form.description,
//         category: form.category,
//         price: parseFloat(form.price),
//         unit: form.unit,
//         quantity: form.quantity ? parseFloat(form.quantity) : null,
//         location: form.location,
//         images: imageUrls,
//         phone: profile.phone,
//       });

//       if (error) throw error;

//       // Reset form immediately
//       setForm({
//         title: '',
//         description: '',
//         category: '',
//         price: '',
//         unit: '',
//         quantity: '',
//         location: '',
//       });
//       setImages([]);

//       // Show success alert and navigate to marketplace
//       Alert.alert(
//         'Success!',
//         'Your listing has been created successfully!',
//         [
//           {
//             text: 'View Marketplace',
//             onPress: () => {
//               // Navigate to marketplace which will auto-refresh
//               router.replace('/(tabs)');
//             }
//           }
//         ]
//       );

//     } catch (error: any) {
//       console.error('Error creating listing:', error);
//       Alert.alert('Error', error.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const clearForm = () => {
//     Alert.alert(
//       'Clear Form',
//       'Are you sure you want to clear all fields?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Clear',
//           style: 'destructive',
//           onPress: () => {
//             setForm({
//               title: '',
//               description: '',
//               category: '',
//               price: '',
//               unit: '',
//               quantity: '',
//               location: '',
//             });
//             setImages([]);
//           }
//         }
//       ]
//     );
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Sell Your Product</Text>
//         <TouchableOpacity onPress={clearForm} style={styles.clearButton}>
//           <Text style={styles.clearButtonText}>Clear All</Text>
//         </TouchableOpacity>
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="Product Title *"
//         value={form.title}
//         onChangeText={(text) => setForm({ ...form, title: text })}
//       />

//       <TextInput
//         style={[styles.input, styles.textArea]}
//         placeholder="Description"
//         value={form.description}
//         onChangeText={(text) => setForm({ ...form, description: text })}
//         multiline
//         numberOfLines={3}
//       />

//       <Text style={styles.label}>Category *</Text>
//       <View style={styles.categoryContainer}>
//         {CATEGORIES.map((category) => (
//           <TouchableOpacity
//             key={category}
//             style={[
//               styles.categoryButton,
//               form.category === category && styles.categoryButtonSelected,
//             ]}
//             onPress={() => setForm({ ...form, category })}
//           >
//             <Text
//               style={[
//                 styles.categoryText,
//                 form.category === category && styles.categoryTextSelected,
//               ]}
//             >
//               {category}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <View style={styles.row}>
//         <View style={styles.halfInputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Price *"
//             value={form.price}
//             onChangeText={(text) => setForm({ ...form, price: text })}
//             keyboardType="numeric"
//           />
//         </View>
//         <View style={styles.halfInputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Unit (kg, lb, etc) *"
//             value={form.unit}
//             onChangeText={(text) => setForm({ ...form, unit: text })}
//           />
//         </View>
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="Quantity (optional)"
//         value={form.quantity}
//         onChangeText={(text) => setForm({ ...form, quantity: text })}
//         keyboardType="numeric"
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Location"
//         value={form.location}
//         onChangeText={(text) => setForm({ ...form, location: text })}
//       />

//       <Text style={styles.label}>Product Images *</Text>
//       <View style={styles.imageButtons}>
//         <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
//           <Text style={styles.imageButtonText}>Pick from Library</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
//           <Text style={styles.imageButtonText}>Take Photo</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
//         <View style={styles.imagePreviewContainer}>
//           {images.map((uri, index) => (
//             <View key={index} style={styles.imagePreviewWrapper}>
//               <Image source={{ uri }} style={styles.imagePreview} />
//               <TouchableOpacity 
//                 style={styles.removeImageButton}
//                 onPress={() => removeImage(index)}
//               >
//                 <Text style={styles.removeImageText}>×</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//         </View>
//       </ScrollView>

//       <TouchableOpacity
//         style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
//         onPress={handleSubmit}
//         disabled={uploading}
//       >
//         {uploading ? (
//           <ActivityIndicator color="white" />
//         ) : (
//           <Text style={styles.submitButtonText}>Create Listing</Text>
//         )}
//       </TouchableOpacity>

//       <Text style={styles.helperText}>
//         * Required fields must be filled
//       </Text>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   clearButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   clearButtonText: {
//     color: '#666',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//   },
//   textArea: {
//     height: 80,
//     textAlignVertical: 'top',
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   halfInputContainer: {
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#333',
//   },
//   categoryContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 16,
//   },
//   categoryButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   categoryButtonSelected: {
//     backgroundColor: 'green',
//     borderColor: 'green',
//   },
//   categoryText: {
//     color: '#666',
//     fontSize: 14,
//   },
//   categoryTextSelected: {
//     color: 'white',
//   },
//   imageButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   imageButton: {
//     flex: 1,
//     marginHorizontal: 4,
//     padding: 12,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   imageButtonText: {
//     color: '#333',
//     fontWeight: '600',
//   },
//   imageScrollView: {
//     marginBottom: 16,
//   },
//   imagePreviewContainer: {
//     flexDirection: 'row',
//   },
//   imagePreviewWrapper: {
//     position: 'relative',
//     marginRight: 8,
//   },
//   imagePreview: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//   },
//   removeImageButton: {
//     position: 'absolute',
//     top: -5,
//     right: -5,
//     backgroundColor: 'red',
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   removeImageText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   submitButton: {
//     backgroundColor: 'green',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 12,
//     shadowColor: 'green',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#ccc',
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   helperText: {
//     textAlign: 'center',
//     color: '#666',
//     fontSize: 14,
//     marginBottom: 20,
//   },
// });


// app/(tabs)/sell.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import { supabase } from '../../supabase';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CATEGORIES = ['Produce', 'Tools', 'Seeds', 'Fertilizers', 'Equipment'];

interface SellForm {
  title: string;
  description: string;
  category: string;
  price: string;
  unit: string;
  quantity: string;
  location: string;
}

export default function SellScreen() {
  const [form, setForm] = useState<SellForm>({
    title: '',
    description: '',
    category: '',
    price: '',
    unit: '',
    quantity: '',
    location: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const router = useRouter();

  const requestPermissions = async (): Promise<void> => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
      Alert.alert(
        'Permissions required',
        'Camera and media library permissions are required to upload images.'
      );
    }
  };

  const pickImage = async (): Promise<void> => {
    await requestPermissions();
    
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const takePhoto = async (): Promise<void> => {
    await requestPermissions();
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const fileExt = uri.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

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

  const removeImage = (index: number): void => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const checkAuthentication = async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to create a listing.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/profile') }
        ]
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    // Check authentication first
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) return;

    if (!form.title || !form.price || !form.category || !form.unit) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    setUploading(true);

    try {
      // Upload all images
      const imageUrls: string[] = [];
      for (const imageUri of images) {
        const url = await uploadImage(imageUri);
        imageUrls.push(url);
      }

      // Get current user (we already checked authentication, so this should work)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user profile exists, if not create one
      let profile = null;
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create a basic profile
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.email?.split('@')[0] || 'User',
            phone: user.phone || '',
          })
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
      } else {
        profile = existingProfile;
      }

      // Create listing
      const { error } = await supabase.from('listings').insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price),
        unit: form.unit,
        quantity: form.quantity ? parseFloat(form.quantity) : null,
        location: form.location,
        images: imageUrls,
        phone: profile.phone,
      });

      if (error) throw error;

      // Reset form immediately
      setForm({
        title: '',
        description: '',
        category: '',
        price: '',
        unit: '',
        quantity: '',
        location: '',
      });
      setImages([]);

      // Show quick success message and automatically navigate to marketplace
      Alert.alert('Success!', 'Your listing has been created successfully!');
      
      // Automatically navigate to marketplace after a brief delay
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);

    } catch (error: any) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  const clearForm = () => {
    Alert.alert(
      'Clear Form',
      'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setForm({
              title: '',
              description: '',
              category: '',
              price: '',
              unit: '',
              quantity: '',
              location: '',
            });
            setImages([]);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sell Your Product</Text>
        <TouchableOpacity onPress={clearForm} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Product Title *"
        value={form.title}
        onChangeText={(text) => setForm({ ...form, title: text })}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.categoryContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              form.category === category && styles.categoryButtonSelected,
            ]}
            onPress={() => setForm({ ...form, category })}
          >
            <Text
              style={[
                styles.categoryText,
                form.category === category && styles.categoryTextSelected,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.halfInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Price *"
            value={form.price}
            onChangeText={(text) => setForm({ ...form, price: text })}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Unit (kg, lb, etc) *"
            value={form.unit}
            onChangeText={(text) => setForm({ ...form, unit: text })}
          />
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Quantity (optional)"
        value={form.quantity}
        onChangeText={(text) => setForm({ ...form, quantity: text })}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={form.location}
        onChangeText={(text) => setForm({ ...form, location: text })}
      />

      <Text style={styles.label}>Product Images *</Text>
      <View style={styles.imageButtons}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Pick from Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
          <Text style={styles.imageButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
        <View style={styles.imagePreviewContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imagePreviewWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Create Listing</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.helperText}>
        * Required fields must be filled
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: 'green',
    borderColor: 'green',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: 'white',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  imageScrollView: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: 'green',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helperText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
  },
});