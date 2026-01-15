import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

const { width } = Dimensions.get('window');

export const ShimmerCarCard: React.FC = () => {
    const shimmerProps = {
        shimmerColors: ['#232323', '#333', '#111'],
        backgroundColor: '#181818',
        highlightColor: '#232323',
    };
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <ShimmerPlaceHolder {...shimmerProps} style={styles.image} shimmerStyle={styles.image} />
                {/* Fav Button shimmer */}
                <View style={styles.favButton}>
                    <ShimmerPlaceHolder {...shimmerProps} style={styles.favIcon} />
                </View>
                {/* Countdown shimmer */}
                <View style={styles.countdownContainer}>
                    {[0, 1, 2, 3].map((_, idx) => (
                        <View key={idx} style={styles.countdownItem}>
                            <ShimmerPlaceHolder {...shimmerProps} style={styles.countdownValue} />
                            <ShimmerPlaceHolder {...shimmerProps} style={styles.countdownLabel} />
                        </View>
                    ))}
                </View>
                <View style={styles.bottomContent}>
                    <View style={styles.infoRow}>
                        <View style={styles.titleContainer}>
                            <ShimmerPlaceHolder {...shimmerProps} style={styles.title} />
                            <ShimmerPlaceHolder {...shimmerProps} style={styles.subtitle} />
                        </View>
                        <View style={styles.priceContainer}>
                            <View style={styles.priceColumn}>
                                <ShimmerPlaceHolder {...shimmerProps} style={styles.priceBadge} />
                                <ShimmerPlaceHolder {...shimmerProps} style={styles.priceValue} />
                            </View>
                            {/* <View style={styles.divider} /> */}
                            <View style={styles.priceColumn}>
                                <ShimmerPlaceHolder {...shimmerProps} style={styles.priceBadge} />
                                <ShimmerPlaceHolder {...shimmerProps} style={styles.priceValue} />
                            </View>
                        </View>
                    </View>
                    <View style={styles.badgeRow}>
                        {[0, 1, 2].map((_, idx) => (
                            <ShimmerPlaceHolder {...shimmerProps} key={idx} style={styles.badge} />
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: '100%', marginBottom: 15 },
    card: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
        position: 'relative',
    },
    image: { width: '100%', height: '100%' },
    favButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    favIcon: { width: 20, height: 20, borderRadius: 10 },
    countdownContainer: { position: 'absolute', top: 12, left: 14, flexDirection: 'row', gap: 4 },
    countdownItem: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
    countdownValue: { width: 20, height: 12, borderRadius: 6, marginBottom: 2 },
    countdownLabel: { width: 20, height: 8, borderRadius: 4 },
    bottomContent: { position: 'absolute', bottom: 12, left: 16, right: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
    titleContainer: { flex: 1, paddingRight: 10, justifyContent: 'center' },
    title: { width: width * 0.5, height: 18, borderRadius: 8, marginBottom: 6 },
    subtitle: { width: 60, height: 12, borderRadius: 6, marginBottom: 2 },
    priceContainer: { flexDirection: 'row', gap: 6, alignItems: 'flex-end' },
    priceColumn: { alignItems: 'center' },
    priceBadge: { width: 60, height: 14, borderRadius: 7, marginBottom: 2 },
    priceValue: { width: 60, height: 14, borderRadius: 7 },
    divider: { width: 1, height: 38, backgroundColor: 'rgba(0,0,0,0.45)', marginBottom: 3, marginHorizontal: 6 },
    badgeRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
    badge: { width: 60, height: 14, borderRadius: 7, marginRight: 4 },
});
