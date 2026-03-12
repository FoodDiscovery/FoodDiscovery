import { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CachedImage from "./CachedImage";
import { restaurantModalStyles as styles } from "./styles";
import {
    WeeklyBusinessHours,
    businessHoursToDisplayText,
    getRestaurantOpenStatus,
    isWeeklyBusinessHours,
} from '../lib/businessHours';
import Rating from "./reviews/ratings";
import {
    fetchRestaurantRating,
    getSavedUserRestaurantRating,
    type RestaurantRatingSummary
} from "../lib/ratings";
import { useAuth } from "../Providers/AuthProvider";

interface RestaurantModalInfo {
    id: string;
    name: string | null;
    description: string | null;
    cuisine_type: string | null;
    image_url: string | null;
    business_hours: WeeklyBusinessHours | { text: string } | string | null;
    phone: string | null;
    preview_images: string[] | null; // array of image URLs restaurant owners selected to display
}

// Props for the modal component to be passed in from the map component
interface RestaurantModalProps {
    visible: boolean;
    restaurant: RestaurantModalInfo;
    distance?: number;
    onClose: () => void;
    onViewMenu?: (restaurantId: string) => void;
}

function getRestaurantHoursDisplay(businessHours: RestaurantModalInfo['business_hours']) {
    if (!businessHours || !isWeeklyBusinessHours(businessHours)) {
        return {
            hasHours: false,
            isOpen: false,
            statusText: "Hours unavailable",
            displayText: "Hours not available",
        };
    }

    const status = getRestaurantOpenStatus(businessHours);
    return {
        hasHours: true,
        ...status,
        displayText: businessHoursToDisplayText(businessHours),
    };
}

export default function RestaurantModal({
    visible,
    restaurant,
    distance,
    onClose,
    onViewMenu
}: RestaurantModalProps) {
    if (!restaurant) return null;

    const insets = useSafeAreaInsets();
    const { session } = useAuth();
    const [ratingSummary, setRatingSummary] = useState<RestaurantRatingSummary | null>(null);
    const [savedUserRating, setSavedUserRating] = useState<number | null>(null);

    useEffect(() => {
        let isCancelled = false;

        const loadRating = async () => {
            try {
                
                // fetch the rating summary for the restaurant
                const summary = await fetchRestaurantRating(restaurant.id);
                // if the rating summary is not cancelled, set the rating summary
                if (!isCancelled) {
                    setRatingSummary(summary);
                }

                // if the user is logged in, get the user's rating for the restaurant
                if (session?.user?.id) {
                    const savedRating = await getSavedUserRestaurantRating(session.user.id, restaurant.id);
                    if (!isCancelled) {
                        setSavedUserRating(savedRating);
                    }
                } else if (!isCancelled) {
                    setSavedUserRating(null);
                }
            } catch (error) {
                console.error("Failed to load rating data", error);
                if (!isCancelled) {
                    setRatingSummary(null);
                    setSavedUserRating(null);
                }
            }
        };

        loadRating();

        return () => {
            isCancelled = true;
        };
    }, [restaurant.id, session?.user?.id]);

    const { hasHours, isOpen, statusText, displayText } = getRestaurantHoursDisplay(restaurant.business_hours);
    const previewImages = restaurant.preview_images?.filter(Boolean) ?? [];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={styles.modalContainer}>
                            {/* Drag Handle */}
                            <View style={styles.handleContainer}>
                                <View style={styles.handle} />
                            </View>

                            {/* Swipeable menu images section */}
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                style={styles.imageScroll}
                                contentContainerStyle={styles.imageScrollContent}
                            >
                                {previewImages.length > 0 ? (
                                    previewImages.map((imageUrl, index) => (
                                        <View key={index} style={styles.imageWrapper}>
                                            <CachedImage
                                                uri={imageUrl}
                                                style={styles.menuImage}
                                            />
                                        </View>
                                    ))
                                ) : (
                                    // Fallback if no preview images
                                    <View style={styles.noImageContainer}>
                                        <Text style={styles.noImageText}>📷 No preview images</Text>
                                    </View>
                                )}
                            </ScrollView>

                            <ScrollView
                                style={styles.content}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Header Section */}
                                <View style={styles.headerSection}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name}>{restaurant.name ?? "Unnamed restaurant"}</Text>
                                        {hasHours && (
                                            <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
                                                <View style={[styles.statusDot, isOpen ? styles.statusDotOpen : styles.statusDotClosed]} />
                                                <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
                                                    {statusText}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.metaRow}>
                                        {distance != null && (
                                            <View style={styles.metaChip}>
                                                <Ionicons name="location-outline" size={14} color="#0B2D5B" />
                                                <Text style={styles.metaChipText}>
                                                    {distance.toFixed(1)} mi away
                                                </Text>
                                            </View>
                                        )}
                                        {restaurant.cuisine_type && (
                                            <View style={styles.metaChip}>
                                                <Ionicons name="restaurant-outline" size={14} color="#0B2D5B" />
                                                <Text style={styles.metaChipText}>{restaurant.cuisine_type}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Divider */}
                                <View style={styles.divider} />

                                {restaurant.description && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Ionicons name="information-circle-outline" size={18} color="#0B2D5B" />
                                            <Text style={styles.sectionTitle}>About</Text>
                                        </View>
                                        <Text style={styles.sectionBodyText}>{restaurant.description}</Text>
                                    </View>
                                )}

                                {hasHours && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Ionicons name="time-outline" size={18} color="#0B2D5B" />
                                            <Text style={styles.sectionTitle}>Hours</Text>
                                        </View>
                                        <Text style={styles.sectionBodyText}>{displayText}</Text>
                                    </View>
                                )}

                                {restaurant.phone && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Ionicons name="call-outline" size={18} color="#0B2D5B" />
                                            <Text style={styles.sectionTitle}>Phone</Text>
                                        </View>
                                        <Text style={styles.sectionBodyText}>{restaurant.phone}</Text>
                                    </View>
                                )}

                                {/* Reviews section */}
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="star-outline" size={18} color="#0B2D5B" />
                                        <Text style={styles.sectionTitle}>Reviews</Text>
                                    </View>
                                    <View style={styles.sectionBody}>
                                        <Rating
                                            value={savedUserRating ?? ratingSummary?.average_rating ?? 0}
                                            size="md"
                                            label={
                                                savedUserRating != null
                                                    ? `Your rating: ${savedUserRating.toFixed(1)}`
                                                    :
                                                ratingSummary &&
                                                ratingSummary.rating_count > 0 &&
                                                ratingSummary.average_rating != null
                                                    ? `Ratings: ${ratingSummary.average_rating.toFixed(
                                                          1
                                                      )} (${ratingSummary.rating_count})`
                                                    : undefined
                                            }
                                        />
                                    </View>
                                </View>

                                {/* Bottom padding for scroll */}
                                <View style={styles.bottomPadding} />
                            </ScrollView>

                            {/* Close Button */}
                            <View style={[styles.buttonContainer, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
                                <TouchableOpacity
                                    style={styles.menuButton}
                                    onPress={() => onViewMenu?.(restaurant.id)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="restaurant" size={16} color="#FFFFFF" />
                                    <Text style={styles.menuButtonText}>View Full Menu</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={onClose}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="close" size={16} color="#0B2D5B" />
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                </View>
            </View>
        </Modal>
    );
}
