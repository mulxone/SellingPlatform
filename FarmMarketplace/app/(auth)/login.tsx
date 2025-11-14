// app/(auth)/login.tsx
import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { supabase } from '../../supabase';
import { useRouter } from 'expo-router';

export default function Login() { // Make sure this is the default export
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter both phone and password');
      return;
    }

    setLoading(true);

    try {
      // Sign in using phone pseudo-email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${phone}@agrolink.com`,
        password,
      });

      if (error) throw error;
      if (!data?.user) {
        Alert.alert('Error', 'No user found with this phone number.');
        return;
      }

      Alert.alert('Success', 'Logged in successfully!');
      router.replace('/(tabs)');

    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to AgriLink</Text>
      
      <TextInput 
        placeholder="Phone Number" 
        value={phone} 
        onChangeText={setPhone} 
        style={styles.input} 
        keyboardType="phone-pad"
        autoCapitalize="none"
      />
      
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        style={styles.input} 
        secureTextEntry 
        autoCapitalize="none"
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center',
    color: 'green'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    marginBottom: 15, 
    padding: 15, 
    borderRadius: 8,
    fontSize: 16
  },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  link: { 
    marginTop: 10, 
    textAlign: 'center', 
    color: '#007BFF', 
    fontWeight: '500',
    fontSize: 16
  },
});