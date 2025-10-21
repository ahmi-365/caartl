import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// --- TypeScript Interfaces ---
interface Plan {
  name: string;
  price: string;
  selected: boolean;
  dots: boolean[];
  curruncy: string;
}

interface PlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: Plan | null;
}

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  isLast: boolean;
  onInfoPress: (plan: Plan) => void; // Added for 'i' button
}

// --- PlanDetailsModal Component ---
const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  visible,
  onClose,
  plan,
}) => {
  if (!plan) return null;

  const features: { [key: string]: string[] } = {
    Basic: [
      "Access to limited daily auctions",
      "Standard bidding tools",
      "Basic vehicle history reports",
      "Email notifications for new listings",
      "Customer support (Email only)",
    ],
    Standard: [
      "Access to all daily auctions",
      "Advanced bidding tools",
      "Detailed vehicle history reports",
      "Real-time listing notifications",
      "Priority email and chat support",
      "Personalized auction recommendations",
    ],
    Premium: [
      "Unlimited access to all auctions",
      "Premium bidding tools & analytics",
      "Comprehensive vehicle history reports",
      "Instant SMS/App notifications for listings",
      "24/7 Phone, email, and chat support",
      "Dedicated account manager",
      "Exclusive early bird access to new listings",
    ],
  };

  const numericPrice = parseInt(plan.price.replace("AED", ""));

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Image
              source={{
                uri: "https://static.codia.ai/image/2025-10-20/x-icon.png",
              }} // Placeholder for X icon
              style={modalStyles.closeIcon}
            />
          </TouchableOpacity>

          <Text style={modalStyles.planName}>{plan.name} Package</Text>

          <View style={modalStyles.priceBannerContainer}>
            <LinearGradient
              colors={["#CADB2A", "#CADB2A", "#000000"]} // Gradient from light green to black
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0.8, y: 0.5 }}
              style={modalStyles.priceBannerGradient}
            ></LinearGradient>
            <Text style={modalStyles.priceBannerText}>{numericPrice}</Text>

            <Text style={modalStyles.priceBannerCurrency}>AED</Text>
          </View>

          <Text style={modalStyles.description}>
            {plan.name === "Basic" &&
              "Perfect for beginners looking to explore the world of car auctions."}
            {plan.name === "Standard" &&
              "Ideal for regular users seeking more insights and support."}
            {plan.name === "Premium" &&
              "For serious bidders who want all the tools and top-tier support."}
          </Text>

          <View style={modalStyles.featuresContainer}>
            {features[plan.name]?.map((feature, index) => (
              <View key={index} style={modalStyles.featureItem}>
                <View style={modalStyles.bullet} />
                <Text style={modalStyles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- SignUpScreen Component ---
const SignUpScreen: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("Standard");

  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<Plan | null>(
    null
  );

  const plans: Plan[] = [
    {
      name: "Basic",
      price: "500",
      curruncy: "AED",
      selected: false,
      dots: [true, false, false],
    },
    {
      name: "Standard",
      price: "750",
      curruncy: "AED",
      selected: true,
      dots: [true, true, false],
    },
    {
      name: "Premium",
      price: "999",
      curruncy: "AED",
      selected: false,
      dots: [true, true, true],
    },
  ];

  const handlePlanInfoClick = (plan: Plan) => {
    setCurrentPlanDetails(plan);
    setModalVisible(true);
  };

  const PlanCard: React.FC<PlanCardProps> = ({
    plan,
    isSelected,
    onSelect,
    isLast,
    onInfoPress,
  }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        isSelected && styles.selectedPlanCard,
        !isLast && { marginRight: 10 },
      ]}
      onPress={onSelect}
    >
      <View style={styles.planHeader}>
        <Text style={[styles.planName, isSelected && styles.selectedPlanName]}>
          {plan.name}
        </Text>
        {/* Info button to open modal */}
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => onInfoPress(plan)}
        >
          <Text style={styles.infoButtonText}>i</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.planDots}>
        {plan.dots.map((filled, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              filled && isSelected
                ? styles.activeDot
                : filled && !isSelected
                ? styles.basicActiveDot
                : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
      {/* Price and Currency on the same line */}
      <View style={styles.priceAndCurrencyContainer}>
        <Text
          style={[
            styles.planPriceNumber, // Style for the numeric price
            isSelected && styles.selectedPlanPrice,
          ]}
        >
          {plan.price}
        </Text>
        <Text
          style={[
            styles.planCurrencyText, // Style for the currency
            isSelected && styles.selectedPlanPrice, // Keep selected color consistent
          ]}
        >
          {plan.curruncy}
        </Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Background Images */}
        <Image
          source={{
            uri: "https://static.codia.ai/image/2025-10-20/w6zCFKrx5n.png",
          }}
          style={styles.backgroundTop}
        />
        <Image
          source={{
            uri: "https://static.codia.ai/image/2025-10-20/66UXWNnDCx.png",
          }}
          style={styles.backgroundBottom}
        />

        <View style={styles.content}>
          {/* Logo */}
          <Image
            source={{
              uri: "https://static.codia.ai/image/2025-10-20/2s2Butmi2c.png",
            }}
            style={styles.logo}
          />

          {/* Header Text */}
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>
              Sign up using email or social networks!
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Image
                source={{
                  uri: "https://static.codia.ai/image/2025-10-20/o1cmtzYQO9.png",
                }}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Name"
                placeholderTextColor="rgba(0, 0, 0, 0.37)"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Image
                source={{
                  uri: "https://static.codia.ai/image/2025-10-20/bTCs4R8GxF.png",
                }}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                placeholderTextColor="rgba(0, 0, 0, 0.37)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Image
                source={{
                  uri: "https://static.codia.ai/image/2025-10-20/cWMbeoqwoW.png",
                }}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="rgba(0, 0, 0, 0.37)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image
                  source={{
                    uri: "https://static.codia.ai/image/2025-10-20/GKQN4AKuf9.png",
                  }}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Image
                source={{
                  uri: "https://static.codia.ai/image/2025-10-20/i0ijcQGGGc.png",
                }}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(0, 0, 0, 0.37)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Image
                  source={{
                    uri: "https://static.codia.ai/image/2025-10-20/0uBggjLtw6.png",
                  }}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Plan Selection */}
          <View style={styles.plansContainer}>
            {plans.map((plan, index) => (
              <PlanCard
                key={index}
                plan={plan}
                isSelected={selectedPlan === plan.name}
                onSelect={() => setSelectedPlan(plan.name)}
                isLast={index === plans.length - 1}
                onInfoPress={handlePlanInfoClick} // Pass the handler
              />
            ))}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signUpButton}>
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Login</Text>
          </Text>

          {/* Social Login */}
          <Text style={styles.orText}>Or sign up with</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={{
                  uri: "https://static.codia.ai/image/2025-10-20/3MFdSJwDmX.png",
                }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={{
                  uri: "https://static.codia.ai/image/2025-10-20/eMqVbppD5O.png",
                }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Plan Details Modal */}
      <PlanDetailsModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        plan={currentPlanDetails}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  backgroundTop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height * 0.52,
    resizeMode: "cover",
  },
  backgroundBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: width,
    height: height * 0.47,
    resizeMode: "cover",
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 60,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 65,
    marginBottom: 35,
    resizeMode: "contain",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeText: {
    fontFamily: "Borg9",
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontFamily: "Baloo Thambi 2",
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 12,
    height: 45,
  },
  inputIcon: {
    width: 18,
    height: 18,
    marginRight: 12,
    resizeMode: "contain",
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#000000",
  },
  eyeIcon: {
    width: 20,
    height: 14,
    resizeMode: "contain",
  },
  plansContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  planCard: {
    flex: 1,
    maxWidth: (width - 25 * 2 - 10 * 2) / 3, // Adjust for spacing
    height: 105, // Adjusted height
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#CADB2A",
    paddingVertical: 10, // Adjusted vertical padding
    paddingHorizontal: 5, // Adjusted horizontal padding
    alignItems: "center",
    justifyContent: "space-around", // Distribute space
    backgroundColor: "transparent",
  },
  selectedPlanCard: {
    backgroundColor: "#CADB2A", // Fully opaque for selected
  },
  planHeader: {
    flexDirection: "row", // Align name and info button
    alignItems: "center",
    justifyContent: "center", // Center content initially
    width: "100%",
    position: "relative", // For absolute positioning of info button
    marginBottom: 5, // Space between header and price
  },
  planName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF", // Default color
  },
  selectedPlanName: {
    color: "#000000", // Text color when selected
  },
  infoButton: {
    position: "absolute",
    top: -8, // Adjust position as needed
    right: 0, // Align to the right of the card
    backgroundColor: "#CADB2A",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    borderWidth: 1, // Add border to match image
    borderColor: "#000000", // Border color
  },
  infoButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Removed planIcon as it was not in the reference image for the card

  priceAndCurrencyContainer: {
    flexDirection: "row",
    alignItems: "baseline", // Align text by their baseline
    marginBottom: 5, // Space between price and dots
  },
  planPriceNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  planCurrencyText: {
    fontSize: 12, // Smaller font size for currency
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 3, // Small space between price and currency
    top: 2, // Slightly lower to align with bottom of price number
  },
  selectedPlanPrice: {
    color: "#000000", // Text color when selected
  },
  planDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5, // Space after price
  },
  dot: {
    width: 12,
    height: 2,
    borderRadius: 26,
    marginHorizontal: 1.5,
  },
  activeDot: {
    backgroundColor: "#000000", // Black for selected active dots
  },
  basicActiveDot: {
    backgroundColor: "#CADB2A", // Green for unselected active dots
  },
  inactiveDot: {
    backgroundColor: "#676C34", // Inactive dot color remains
  },
  signUpButton: {
    backgroundColor: "#CADB2A",
    borderRadius: 18,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  signUpButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
  },
  loginText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "Baloo Thambi 2",
  },
  loginLink: {
    color: "#CADB2A",
  },
  orText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "Baloo Thambi 2",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingBottom: 20,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    width: "48%",
    justifyContent: "center",
  },
  socialIcon: {
    width: 25,
    height: 25,
    marginRight: 8,
    resizeMode: "contain",
  },
  socialText: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "500",
  },
});

// --- Modal Specific Styles ---
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalView: {
    width: width * 0.9,
    backgroundColor: "#000000",
    borderRadius: 20,
    padding: 25,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderColor: "#CADB2A",
    borderWidth: 1,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 1,
    backgroundColor: "#000000", // Match modal background
    borderRadius: 15, // Make it circular or rounded
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: "#CADB2A",
    resizeMode: "contain",
  },
  planName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
    marginTop: 10,
  },
  // Styles for the new price banner
  priceBannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  priceBannerGradient: {
    paddingVertical: 5,
    paddingRight: 10, // Adjust padding to control gradient width
    borderRadius: 10, // Match the rounded ends in your image
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60, // Ensure it's wide enough for price
    height: 40, // Height of the banner
  },
  priceBannerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  priceBannerCurrency: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#CADB2A",
    marginTop: 15,
  },
  description: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: "500",
  },
  featuresContainer: {
    width: "100%",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CADB2A",
    marginRight: 10,
    marginTop: 7,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 20,
  },
});

export default SignUpScreen;
