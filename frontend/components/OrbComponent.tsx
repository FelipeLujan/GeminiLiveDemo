import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface OrbProps {
    isActive: boolean;
    volume?: number;
}

export const OrbComponent = ({ isActive, volume = 0 }: OrbProps) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);
    const rotate = useSharedValue(0);
    const innerScale = useSharedValue(1);

    useEffect(() => {
        if (isActive) {
            // Pulse animation (Core) - scaled by volume
            // Web: [1, 1.2 + volume, 1]
            const targetScale = 1.2 + (volume || 0);
            scale.value = withRepeat(
                withSequence(
                    withTiming(targetScale, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );

            // Glow animation
            // Web: opacity [0.2, 0.4, 0.2], scale [1, 1.5, 1]
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.4, { duration: 1000 }),
                    withTiming(0.2, { duration: 1000 })
                ),
                -1,
                true
            );

            // Inner Highlight animation
            // Web: scale [0.8, 1.1, 0.8]
            innerScale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.8, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );

            // Rotation
            rotate.value = withRepeat(
                withTiming(360, { duration: 10000, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            scale.value = withTiming(1);
            opacity.value = withTiming(0.2); // Match Web's idle opacity
            rotate.value = withTiming(0);
            innerScale.value = withTiming(1);
        }
    }, [isActive, volume]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { rotate: `${rotate.value}deg` }
            ],
        };
    });

    const glowStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { scale: scale.value * 1.5 }
            ]
        };
    });

    const innerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: innerScale.value }
            ]
        };
    });

    return (
        <View style={styles.container}>
            {/* Core Orb */}
            <Animated.View style={[styles.orb, animatedStyle]}>
                <LinearGradient
                    colors={['#60A5FA', '#9333EA']} // blue-400 to purple-600
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* Inner Highlight */}
            <Animated.View style={[styles.innerHighlight, innerStyle]} />

            {/* Outer glow */}
            <Animated.View style={[styles.glow, glowStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 300,
        height: 300,
    },
    orb: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: 'hidden',
        zIndex: 10,
    },
    gradient: {
        width: '100%',
        height: '100%',
    },
    innerHighlight: {
        position: 'absolute',
        width: 80, // Approx w-20 (5rem) = 80px? No, w-20 is 5rem = 80px.
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 20,
    },
    glow: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#3B82F6', // blue-500
        zIndex: 5,
    },
});
