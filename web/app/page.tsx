"use client";

import { useState, useRef, useEffect } from "react";
import Orb from "../components/Orb";

export default function Home() {
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState("Ready to connect");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // Playback state
    // Playback state
    const nextStartTimeRef = useRef<number>(0);
    const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
    const isSpeakingTimeoutRef = useRef<any>(null);

    const connect = async () => {
        try {
            setStatus("Requesting microphone...");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    autoGainControl: true,
                    noiseSuppression: true
                }
            });
            streamRef.current = stream;

            setStatus("Connecting...");

            // Initialize AudioContext
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                    sampleRate: 24000, // Use 24kHz for playback context to match Gemini output
                });
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            // Reset playback timing
            nextStartTimeRef.current = audioContextRef.current.currentTime;

            const ws = new WebSocket("ws://localhost:8000/ws");

            ws.onopen = () => {
                console.log("Connected to WebSocket");
                setIsConnected(true);
                setStatus("Connected - Listening...");
                wsRef.current = ws;
                startRecording(stream);
            };

            ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "audio_response") {
                    setIsSpeaking(true);
                    if (isSpeakingTimeoutRef.current) {
                        clearTimeout(isSpeakingTimeoutRef.current);
                        isSpeakingTimeoutRef.current = null;
                    }
                    scheduleAudio(data.data);
                } else if (data.type === "transcription") {
                    setStatus(`Gemini: ${data.text}`);
                } else if (data.type === "turn_complete") {
                    // Delay turning off isSpeaking until audio finishes
                    if (audioContextRef.current) {
                        const currentTime = audioContextRef.current.currentTime;
                        const remainingTime = Math.max(0, nextStartTimeRef.current - currentTime);

                        if (isSpeakingTimeoutRef.current) clearTimeout(isSpeakingTimeoutRef.current);

                        isSpeakingTimeoutRef.current = setTimeout(() => setIsSpeaking(false), remainingTime * 1000);
                    } else {
                        setIsSpeaking(false);
                    }
                } else if (data.type === "interrupted") {
                    console.log("Received interruption signal");
                    // Stop ALL active sources immediately
                    activeSourcesRef.current.forEach(source => {
                        try {
                            source.stop();
                        } catch (e) {
                            // ignore
                        }
                    });
                    activeSourcesRef.current = [];

                    if (audioContextRef.current) {
                        nextStartTimeRef.current = audioContextRef.current.currentTime;
                    }
                    setIsSpeaking(false);
                    if (isSpeakingTimeoutRef.current) {
                        clearTimeout(isSpeakingTimeoutRef.current);
                        isSpeakingTimeoutRef.current = null;
                    }
                }
            };

            ws.onclose = () => {
                console.log("Disconnected");
                stopRecording();
                setIsConnected(false);
                setStatus("Disconnected");
                wsRef.current = null;
                setIsSpeaking(false);
                if (isSpeakingTimeoutRef.current) clearTimeout(isSpeakingTimeoutRef.current);
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                setStatus("Connection error - check backend");
                stopRecording();
                setIsConnected(false);
            };

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setStatus("Microphone access denied or error");
        }
    };

    const startRecording = (stream: MediaStream) => {
        // Create a separate recording context to force 16kHz
        const recordingContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000
        });

        const source = recordingContext.createMediaStreamSource(stream);
        const processor = recordingContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

            const inputData = e.inputBuffer.getChannelData(0);

            // Convert Float32 to Int16 PCM
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            const base64Audio = arrayBufferToBase64(pcmData.buffer);

            wsRef.current.send(JSON.stringify({
                type: "audio_chunk",
                data: base64Audio,
                timestamp: Date.now()
            }));
        };

        source.connect(processor);
        processor.connect(recordingContext.destination);

        processorRef.current = processor;
        // @ts-ignore
        sourceRef.current = source;
        (processorRef.current as any).contextToClose = recordingContext;
    };

    const stopRecording = () => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            if ((processorRef.current as any).contextToClose) {
                (processorRef.current as any).contextToClose.close();
            }
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const disconnect = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        stopRecording();
    };

    const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const scheduleAudio = (base64Audio: string) => {
        if (!audioContextRef.current) return;

        try {
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const float32Data = new Float32Array(bytes.length / 2);
            const dataView = new DataView(bytes.buffer);

            for (let i = 0; i < float32Data.length; i++) {
                const int16 = dataView.getInt16(i * 2, true);
                float32Data[i] = int16 / 32768.0;
            }

            const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
            audioBuffer.getChannelData(0).set(float32Data);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);

            // Track active source
            activeSourcesRef.current.push(source);

            source.onended = () => {
                source.disconnect();
                // Remove from active sources
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
            };

            // Gapless playback logic
            const currentTime = audioContextRef.current.currentTime;

            // If nextStartTime is in the past (buffer underrun), reset to now
            if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime;
            }

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;

        } catch (e) {
            console.error("Audio scheduling error:", e);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white overflow-hidden">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Gemini Live Web Client
                </p>
            </div>

            <div className="relative flex flex-col items-center justify-center flex-1 w-full">
                {/* Orb Container */}
                <div className="mb-12 relative">
                    <Orb isActive={isSpeaking} volume={isSpeaking ? 0.5 : 0} />
                </div>

                <div className="flex flex-col items-center gap-8 z-20">
                    <p className="text-xl opacity-80 font-mono text-center max-w-2xl px-4">
                        {status}
                    </p>

                    <button
                        onClick={isConnected ? disconnect : connect}
                        className={`px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:scale-105 active:scale-95 ${isConnected
                            ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                            : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
                            }`}
                    >
                        {isConnected ? "Disconnect" : "Connect"}
                    </button>
                </div>
            </div>
        </main>
    );
}
