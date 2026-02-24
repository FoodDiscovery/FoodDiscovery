import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
    ActivityIndicator
} from 'react-native';
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

// Function to determine if restaurant is currently open
function getLegacyOpenStatus(hoursText: string): { isOpen: boolean; statusText: string } {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Time in minutes since midnight

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayName = dayNames[currentDay];
    const currentDayAbbrev = dayAbbrevs[currentDay];

    // Try to find today's hours in the text
    // Look for patterns like "Monday: 9:00 AM - 5:00 PM" or "Mon: 9am-5pm"
    const dayPatterns = [
        new RegExp(`${currentDayName}[^\\n]*?([0-9]{1,2}):?([0-9]{2})?\\s*(AM|PM|am|pm)[^\\n]*?([0-9]{1,2}):?([0-9]{2})?\\s*(AM|PM|am|pm)`, 'i'),
        new RegExp(`${currentDayAbbrev}[^\\n]*?([0-9]{1,2}):?([0-9]{2})?\\s*(AM|PM|am|pm)[^\\n]*?([0-9]{1,2}):?([0-9]{2})?\\s*(AM|PM|am|pm)`, 'i'),
    ];

    for (const pattern of dayPatterns) {
        const match = hoursText.match(pattern);
        if (match) {
            // Parse opening time
            let openHour = parseInt(match[1]);
            const openMin = match[2] ? parseInt(match[2]) : 0;
            const openPeriod = match[3].toUpperCase();

            // Parse closing time
            let closeHour = parseInt(match[4]);
            const closeMin = match[5] ? parseInt(match[5]) : 0;
            const closePeriod = match[6].toUpperCase();

            // Convert to 24-hour format
            if (openPeriod === 'PM' && openHour !== 12) openHour += 12;
            if (openPeriod === 'AM' && openHour === 12) openHour = 0;

            if (closePeriod === 'PM' && closeHour !== 12) closeHour += 12;
            if (closePeriod === 'AM' && closeHour === 12) closeHour = 0;

            const openTime = openHour * 60 + openMin;
            const closeTime = closeHour * 60 + closeMin;

            // Check if current time is within business hours
            // Handle case where closing time is next day (e.g., 11 PM - 2 AM)
            if (closeTime < openTime) {
                // Hours span midnight
                const isOpen = currentTime >= openTime || currentTime < closeTime;
                return { isOpen, statusText: isOpen ? 'Open now' : 'Closed' };
            } else {
                const isOpen = currentTime >= openTime && currentTime < closeTime;
                return { isOpen, statusText: isOpen ? 'Open now' : 'Closed' };
            }
        }
    }

    // If we can't parse the hours, check for common patterns like "Open 24 hours" or "Closed"
    if (hoursText.toLowerCase().includes('24 hours') || hoursText.toLowerCase().includes('open 24')) {
        return { isOpen: true, statusText: 'Open 24 hours' };
    }
    if (hoursText.toLowerCase().includes('closed')) {
        return { isOpen: false, statusText: 'Closed' };
    }

    // Default: can't determine
    return { isOpen: false, statusText: 'Hours vary' };
}

function getRestaurantHoursDisplay(businessHours: RestaurantModalInfo['business_hours']) {
    if (!businessHours) {
        return { isOpen: false, statusText: 'Hours not available', displayText: 'Hours not available' };
    }

    if (isWeeklyBusinessHours(businessHours)) {
        const status = getRestaurantOpenStatus(businessHours);
        return {
            ...status,
            displayText: businessHoursToDisplayText(businessHours),
        };
    }

    if (typeof businessHours === 'string' && businessHours.trim()) {
        const legacyStatus = getLegacyOpenStatus(businessHours);
        return {
            ...legacyStatus,
            displayText: businessHours,
        };
    }

    if (typeof businessHours === 'object' && typeof businessHours.text === 'string' && businessHours.text.trim()) {
        const legacyStatus = getLegacyOpenStatus(businessHours.text);
        return {
            ...legacyStatus,
            displayText: businessHours.text,
        };
    }

    return { isOpen: false, statusText: 'Hours not available', displayText: 'Hours not available' };
}

export default function RestaurantModal({
    visible,
    restaurant,
    distance,
    onClose,
    onViewMenu
}: RestaurantModalProps) {
    if (!restaurant) return null;

    const { session } = useAuth();
    const [ratingSummary, setRatingSummary] = useState<RestaurantRatingSummary | null>(null);
    const [savedUserRating, setSavedUserRating] = useState<number | null>(null);

    useEffect(() => {
        let isCancelled = false;

        const loadRating = async () => {
            const summary = await fetchRestaurantRating(restaurant.id);
            if (!isCancelled) {
                setRatingSummary(summary);
            }

            if (session?.user?.id) {
                const savedRating = await getSavedUserRestaurantRating(session.user.id, restaurant.id);
                if (!isCancelled) {
                    setSavedUserRating(savedRating);
                }
            } else if (!isCancelled) {
                setSavedUserRating(null);
            }
        };

        loadRating();

        return () => {
            isCancelled = true;
        };
    }, [restaurant.id, session?.user?.id]);

    const { isOpen, statusText, displayText } = getRestaurantHoursDisplay(restaurant.business_hours);

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
                    {!restaurant ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4285F4" />
                            <Text style={styles.loadingText}>Loading restaurant details...</Text>
                        </View>
                    ) : (
                        <>
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
                                {restaurant.preview_images && restaurant.preview_images.length > 0 ? (
                                    restaurant.preview_images.map((imageUrl, index) => (
                                        <View key={index} style={styles.imageWrapper}>
                                            <Image
                                                source={{ uri: imageUrl }}
                                                style={styles.menuImage}
                                                resizeMode="cover"
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
                                        <Text style={styles.name}>{restaurant.name}</Text>
                                        {restaurant.business_hours && (
                                            <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
                                                <View style={[styles.statusDot, isOpen ? styles.statusDotOpen : styles.statusDotClosed]} />
                                                <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
                                                    {statusText}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    {distance && (
                                        <View style={styles.distanceContainer}>
                                            <Text style={styles.distanceIcon}>📍</Text>
                                            <Text style={styles.distance}>
                                                {distance.toFixed(1)} miles away
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Divider */}
                                <View style={styles.divider} />

                                {restaurant.description && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionIcon}>ℹ️</Text>
                                            <Text style={styles.sectionTitle}>About</Text>
                                        </View>
                                        <Text style={styles.sectionText}>{restaurant.description}</Text>
                                    </View>
                                )}

                                {restaurant.cuisine_type && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionIcon}>🍽️</Text>
                                            <Text style={styles.sectionTitle}>Cuisine</Text>
                                        </View>
                                        <View style={styles.tagContainer}>
                                            <View style={styles.tag}>
                                                <Text style={styles.tagText}>{restaurant.cuisine_type}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {restaurant.business_hours && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionIcon}>🕐</Text>
                                            <Text style={styles.sectionTitle}>Hours</Text>
                                        </View>
                                        <Text style={styles.sectionText}>{displayText}</Text>
                                    </View>
                                )}

                                {restaurant.phone && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionIcon}>📞</Text>
                                            <Text style={styles.sectionTitle}>Phone</Text>
                                        </View>
                                        <Text style={styles.sectionText}>{restaurant.phone}</Text>
                                    </View>
                                )}

                                {/* Reviews section */}
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionIcon}>⭐</Text>
                                        <Text style={styles.sectionTitle}>Reviews</Text>
                                    </View>
                                    <View style={styles.ratingRow}>
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
                                    <Text style={styles.comingSoonText}>Reviews coming soon...</Text>
                                </View>

                                {/* Menu section */}
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionIcon}>📋</Text>
                                        <Text style={styles.sectionTitle}>Menu</Text>
                                    </View>
                                    <Text style={styles.comingSoonText}>View full menu...</Text>
                                </View>

                                {/* Bottom padding for scroll */}
                                <View style={styles.bottomPadding} />
                            </ScrollView>

                            {/* Close Button */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.menuButton}
                                    onPress={() => onViewMenu?.(restaurant.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.menuButtonText}>View Full Menu</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={onClose}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: Dimensions.get('window').height * 0.85,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#D0D0D0',
        borderRadius: 2,
    },
    imageScroll: {
        height: 220,
    },
    imageScrollContent: {
        paddingHorizontal: 0,
    },
    imageWrapper: {
        width: Dimensions.get('window').width,
        height: 220,
        paddingHorizontal: 16,
    },
    menuImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    headerSection: {
        marginBottom: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    name: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: -0.5,
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 4,
    },
    statusOpen: {
        backgroundColor: '#E8F5E9',
    },
    statusClosed: {
        backgroundColor: '#FCE4EC',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusDotOpen: {
        backgroundColor: '#34A853',
    },
    statusDotClosed: {
        backgroundColor: '#EA4335',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    statusTextOpen: {
        color: '#137333',
    },
    statusTextClosed: {
        color: '#C5221F',
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    distanceIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    distance: {
        fontSize: 15,
        color: '#5F6368',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E8EAED',
        marginVertical: 16,
        marginHorizontal: -20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        letterSpacing: -0.3,
    },
    sectionText: {
        fontSize: 15,
        color: '#5F6368',
        lineHeight: 22,
        marginLeft: 26,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 26,
    },
    tag: {
        backgroundColor: '#F1F3F4',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 14,
        color: '#1A73E8',
        fontWeight: '500',
    },
    comingSoonText: {
        fontSize: 15,
        color: '#9AA0A6',
        fontStyle: 'italic',
        marginLeft: 26,
    },
    ratingRow: {
        marginLeft: 26,
        marginBottom: 8,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E8EAED',
        gap: 10,
    },
    menuButton: {
        backgroundColor: '#34A853',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#34A853',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    menuButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    closeButton: {
        backgroundColor: '#1A73E8',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#1A73E8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    loadingContainer: {
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        color: '#5F6368',
    },
    noImageContainer: {
        width: Dimensions.get('window').width,
        height: 220,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 16,
        borderRadius: 16,
    },
    noImageText: {
        color: '#9AA0A6',
        fontSize: 16,
        fontWeight: '500',
    },
    bottomPadding: {
        height: 20,
    },
});