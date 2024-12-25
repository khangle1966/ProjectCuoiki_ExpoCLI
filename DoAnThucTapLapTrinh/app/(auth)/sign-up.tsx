import React, { useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  Dimensions, 
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert
} from "react-native";
import Colors from '@/constants/Colors';
import { Stack, useRouter, Link } from "expo-router";
import { TextInput } from "react-native-gesture-handler";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

function SignUpScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  
  async function signUp() {
    setErrorMessage(""); // Xóa lỗi trước đó
  
    // Kiểm tra các trường có bị trống hay không
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please fill in all fields"); // Hiển thị thông báo lỗi
      return;
    }
  
    // Kiểm tra mật khẩu khớp
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
  
    setLoading(true); // Hiển thị trạng thái đang tải
    try {
      // Đăng ký người dùng với Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) throw error;
  
      // Lấy `userId` từ phản hồi
      if (!data || !data.user) {
        throw new Error("User registration failed. No user returned.");
      }
      
      const userId = data.user.id;
      
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            full_name: fullName || null,
            avatar_url: "",
            role: "user",
            updated_at: new Date().toISOString(),
            username: username || null,
            website: website || null,
          },
        ]);
      
      if (profileError) {
        console.error("Error inserting profile:", profileError);
        throw profileError;
      }
  
      Alert.alert(
        "Success",
        "Account created successfully!",
        [{ text: "OK", onPress: () => router.push('/(auth)/sign-in') }]
      );
    } catch (error) {
      setErrorMessage(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false); // Tắt trạng thái đang tải
    }
  }
  
  

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollViewContent}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen 
        options={{ 
          title: "", 
          headerTransparent: true,
          headerTintColor: Colors.primary 
        }} 
      />

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Image
            source={require("@/assets/images/pizza-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage("");
              }}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage("");
              }}
              style={[styles.input, { flex: 1 }]}
              secureTextEntry={!showPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons 
                name={showPassword ? "visibility" : "visibility-off"} 
                size={20} 
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrorMessage("");
              }}
              style={[styles.input, { flex: 1 }]}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <MaterialIcons 
                name={showConfirmPassword ? "visibility" : "visibility-off"} 
                size={20} 
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Button
            onPress={signUp}
            disabled={loading}
            text={loading ? "Creating Account..." : "Sign Up"}
            style={styles.signUpButton}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="apple" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" style={styles.signInLink}>
              Sign In
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FDF3E7', // Tone màu nâu nhạt làm nền
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 50,
    backgroundColor: '#D7BFAE',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6F4E37', // Tone nâu đậm
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8C6E58',
  },
  formContainer: {
    backgroundColor: '#FFF7EE', // Màu nền nhạt hơn
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EDE4', // Tone nâu rất nhạt
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#D7BFAE', // Viền nâu nhạt
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#5A3E2B', // Màu chữ nâu đậm
  },
  errorText: {
    color: '#FF4D4D',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  signUpButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#6F4E37', // Nút nâu đậm
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D7BFAE', // Đường kẻ nâu nhạt
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#8C6E58',
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signInText: {
    color: '#8C6E58',
    fontSize: 14,
  },
  signInLink: {
    color: '#6F4E37',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SignUpScreen;

