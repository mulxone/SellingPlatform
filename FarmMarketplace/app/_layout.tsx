// // app/_layout.tsx
// import { Stack } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { supabase } from '../supabase';
// import { User } from '@supabase/supabase-js';
// import { ActivityIndicator, View } from 'react-native';

// export default function RootLayout() {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check active sessions
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//       setLoading(false);
//     });

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//       setLoading(false);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="green" />
//       </View>
//     );
//   }

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       {!user ? (
//         <Stack.Screen name="(auth)" />
//       ) : (
//         <Stack.Screen name="(tabs)" />
//       )}
//     </Stack>
//   );
// }


// app/_layout.tsx


// import React from 'react';
// import { Stack } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { supabase } from '../supabase';
// import { User } from '@supabase/supabase-js';
// import { ActivityIndicator, View, Text } from 'react-native';

// export default function RootLayout() {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check active sessions
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//       setLoading(false);
//     });

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//       setLoading(false);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
//         <ActivityIndicator size="large" color="green" />
//         <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>Loading AgriLink...</Text>
//       </View>
//     );
//   }

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       {!user ? (
//         <Stack.Screen name="(auth)" />
//       ) : (
//         <React.Fragment>
//           <Stack.Screen name="(tabs)" />
//           <Stack.Screen 
//             name="listing/[id]" 
//             options={{
//               headerShown: true,
//               headerTitle: 'Listing Details',
//               headerBackTitle: 'Back',
//               headerTintColor: 'green',
//               headerStyle: {
//                 backgroundColor: '#fff',
//               },
//               headerTitleStyle: {
//                 fontWeight: '600',
//                 color: '#333',
//               },
//             }}
//           />
//         </React.Fragment>
//       )}
//     </Stack>
//   );
// }



// app/_layout.tsx


// import React from 'react';
// import { Stack } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { supabase } from '../supabase';
// import { User } from '@supabase/supabase-js';
// import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

// export default function RootLayout() {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check active sessions
//     const initializeAuth = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       setUser(session?.user ?? null);
//       setLoading(false);
//     };

//     initializeAuth();

//     // Listen for changes to authentication state
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//       setLoading(false);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="green" />
//         <Text style={styles.loadingText}>Loading AgriLink...</Text>
//       </View>
//     );
//   }

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       {!user ? (
//         /**
//          * UNAUTHENTICATED USER FLOW
//          * User is not logged in - show authentication screens
//          */
//         <Stack.Screen name="(auth)" />
//       ) : (
//         /**
//          * AUTHENTICATED USER FLOW
//          * User is logged in - show main app screens
//          */
//         <React.Fragment>
//           {/* Main Tab Navigation */}
//           <Stack.Screen 
//             name="(tabs)" 
//             options={{
//               // Header is handled in the tabs layout
//             }}
//           />
          
//           {/* Individual Listing Details */}
//           <Stack.Screen 
//             name="listing/[id]" 
//             options={{
//               // Custom header implemented in the component
//               headerShown: false,
//             }}
//           />

//           {/* Seller Shop Page */}
//           <Stack.Screen 
//             name="shop/[userId]" 
//             options={{
//               // Custom header implemented in the component
//               headerShown: false,
//             }}
//           />

//           {/* Edit Listing Page */}
//           <Stack.Screen 
//             name="edit-listing/[id]" 
//             options={{
//               // Custom header implemented in the component
//               headerShown: false,
//             }}
//           />
//         </React.Fragment>
//       )}
//     </Stack>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#666',
//   },
// });


// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { ActivityIndicator, View, Text } from 'react-native';

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="green" />
        <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>Loading AgriLink...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listing/[id]" />
          <Stack.Screen name="shop/[userId]" />
          <Stack.Screen name="edit-listing/[id]" />
        </>
      )}
    </Stack>
  );
}