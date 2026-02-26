import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator
} from "react-native";
import { restaurantModalStyles as styles } from "./styles";
import {
    WeeklyBusinessHours,
    businessHoursToDisplayText,
    getRestaurantOpenStatus,
    isWeeklyBusinessHours,
} from '../lib/businessHours';

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
                                    <Text style={styles.comingSoonText}>Coming soon...</Text>
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