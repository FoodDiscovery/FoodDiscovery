import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
} from 'react-native';

interface RestaurantModalInfo {
    id: string;
    name: string | null;
    description: string | null;
    cuisine_type: string | null;
    image_url: string | null;
    business_hours: { text: string } | null;
    phone: string | null;
    preview_images: string[] | null; // array of image URLs restaurant owners selected to display
}

// Props for the modal component to be passed in from the map component
interface RestaurantModalProps {
    visible: boolean;
    restaurant: RestaurantModalInfo;
    distance?: number;
    onClose: () => void;
}

export default function RestaurantModal({
    visible,
    restaurant,
    distance,
    onClose
}: RestaurantModalProps) {
    if (!restaurant) return null;

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
                    {/* Swipeable menu images section */}
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageScroll}
                    >
                        {restaurant.preview_images?.map((imageUrl, index) => (
                            <Image
                                key={index}
                                source={{ uri: imageUrl }}
                                style={styles.menuImage}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>
                    <ScrollView style={styles.content}>
                        <Text style={styles.name}>{restaurant.name}</Text>

                        {distance && (
                            <Text style={styles.distance}>
                                {distance.toFixed(1)} miles away
                            </Text>
                        )}

                        {restaurant.business_hours && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Hours</Text>
                                <Text style={styles.sectionText}>{restaurant.business_hours.text}</Text>
                            </View>
                        )}

                        {/* Reviews section - you'll need to fetch this from Supabase */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Reviews</Text>
                            <Text style={styles.sectionText}>Coming soon...</Text>
                        </View>

                        {/* Menu section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Menu</Text>
                            <Text style={styles.sectionText}>View full menu...</Text>
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: Dimensions.get('window').height * 0.8,
        paddingBottom: 20,
    },
    imageScroll: {
        height: 200,
    },
    menuImage: {
        width: Dimensions.get('window').width,
        height: 200,
    },
    content: {
        padding: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    distance: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 14,
        color: '#666',
    },
    closeButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        marginHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});