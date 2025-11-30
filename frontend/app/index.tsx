import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { OrbComponent } from '@/components/OrbComponent';
import { useAudioConnection } from '@/hooks/useAudioConnection';
import { Mic, MicOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
    const { isConnected, status, isSpeaking, connect, disconnect } = useAudioConnection();

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['rgba(39, 39, 42, 0.3)', 'transparent']} // zinc-800/30 to transparent
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Gemini Live</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.orbContainer}>
                    <OrbComponent isActive={isSpeaking} volume={isSpeaking ? 0.5 : 0} />
                </View>

                <Text style={styles.status}>{status}</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        isConnected ? styles.buttonDisconnect : styles.buttonConnect
                    ]}
                    onPress={isConnected ? disconnect : connect}
                >
                    {isConnected ? (
                        <MicOff color="white" size={24} />
                    ) : (
                        <Mic color="white" size={24} />
                    )}
                    <Text style={styles.buttonText}>
                        {isConnected ? 'Disconnect' : 'Connect'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerGradient: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#262626', // neutral-800
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orbContainer: {
        marginBottom: 40,
    },
    status: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    footer: {
        padding: 30,
        alignItems: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        gap: 10,
        width: '100%',
        maxWidth: 300,
    },
    buttonConnect: {
        backgroundColor: '#2563EB',
    },
    buttonDisconnect: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
