"use client";

import {
	Loader2,
	Maximize,
	Pause,
	Play,
	Settings,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVideoConfigStore } from "@/store/video-config";

interface HLSVideoPlayerProps {
	src: string;
	poster?: string;
	title?: string;
	className?: string;
	autoplay?: boolean;
	controls?: boolean;
	onLoadStart?: () => void;
	onLoadEnd?: () => void;
	onError?: (error: string) => void;
}

export default function HLSVideoPlayer({
	src,
	poster,
	title,
	className = "",
	autoplay,
	controls,
	onLoadStart,
	onLoadEnd,
	onError,
}: HLSVideoPlayerProps) {
	const { videoConfig } = useVideoConfigStore();

	if (!poster) {
		poster = videoConfig?.PLAYER_CONFIG.poster;
	}
	if (!autoplay) {
		autoplay = videoConfig?.PLAYER_CONFIG.autoplay;
	}
	if (!controls) {
		controls = videoConfig?.PLAYER_CONFIG.controls;
	}

	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [_volume, setVolume] = useState(1);
	const [selectedQuality, _setSelectedQuality] = useState("Auto");

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const handleLoadStart = () => {
			setIsLoading(true);
			onLoadStart?.();
		};

		const handleLoadedData = () => {
			setIsLoading(false);
			setDuration(video.duration);
			onLoadEnd?.();
		};

		const handleTimeUpdate = () => {
			setCurrentTime(video.currentTime);
		};

		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);

		const handleError = () => {
			setIsLoading(false);
			onError?.("Failed to load video");
		};

		// For HLS support, you would typically use hls.js here
		// This is a simplified version for demonstration
		video.src = src;

		video.addEventListener("loadstart", handleLoadStart);
		video.addEventListener("loadeddata", handleLoadedData);
		video.addEventListener("timeupdate", handleTimeUpdate);
		video.addEventListener("play", handlePlay);
		video.addEventListener("pause", handlePause);
		video.addEventListener("error", handleError);

		return () => {
			video.removeEventListener("loadstart", handleLoadStart);
			video.removeEventListener("loadeddata", handleLoadedData);
			video.removeEventListener("timeupdate", handleTimeUpdate);
			video.removeEventListener("play", handlePlay);
			video.removeEventListener("pause", handlePause);
			video.removeEventListener("error", handleError);
		};
	}, [src, onLoadStart, onLoadEnd, onError]);

	const togglePlay = () => {
		const video = videoRef.current;
		if (!video) return;

		if (isPlaying) {
			video.pause();
		} else {
			video.play();
		}
	};

	const toggleMute = () => {
		const video = videoRef.current;
		if (!video) return;

		video.muted = !video.muted;
		setIsMuted(video.muted);
	};

	const _handleVolumeChange = (newVolume: number) => {
		const video = videoRef.current;
		if (!video) return;

		video.volume = newVolume;
		setVolume(newVolume);
		setIsMuted(newVolume === 0);
	};

	const formatTime = (time: number): string => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
		const video = videoRef.current;
		if (!video || !duration) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const newTime = (clickX / rect.width) * duration;

		video.currentTime = newTime;
		setCurrentTime(newTime);
	};

	return (
		<Card className={`w-full max-w-4xl mx-auto overflow-hidden ${className}`}>
			<CardContent className="p-0">
				<div className="relative bg-black">
					{/* Video Element */}
					<video
						ref={videoRef}
						className="w-full aspect-video"
						poster={poster}
						preload={videoConfig.PLAYER_CONFIG.preload}
						autoPlay={autoplay}
						muted={isMuted}
					/>

					{/* Loading Overlay */}
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/50">
							<div className="flex items-center gap-2 text-white">
								<Loader2 className="w-6 h-6 animate-spin" />
								<span>Loading video...</span>
							</div>
						</div>
					)}

					{/* Title Overlay */}
					{title && (
						<div className="absolute top-4 left-4">
							<Badge variant="secondary" className="bg-black/70 text-white">
								{title}
							</Badge>
						</div>
					)}

					{/* Quality Selector */}
					<div className="absolute top-4 right-4">
						<Badge variant="secondary" className="bg-black/70 text-white">
							{selectedQuality}
						</Badge>
					</div>

					{/* Custom Controls */}
					{controls && (
						<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
							{/* Progress Bar */}
							{/** biome-ignore lint/a11y/useKeyWithClickEvents: idk */}
							{/** biome-ignore lint/a11y/noStaticElementInteractions: idk */}
							<div
								className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer"
								onClick={handleSeek}
							>
								<div
									className="h-full bg-primary rounded-full transition-all duration-200"
									style={{
										width: `${duration ? (currentTime / duration) * 100 : 0}%`,
									}}
								/>
							</div>

							{/* Control Buttons */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={togglePlay}
										className="text-white hover:bg-white/20"
									>
										{isPlaying ? (
											<Pause className="w-5 h-5" />
										) : (
											<Play className="w-5 h-5" />
										)}
									</Button>

									<Button
										variant="ghost"
										size="icon"
										onClick={toggleMute}
										className="text-white hover:bg-white/20"
									>
										{isMuted ? (
											<VolumeX className="w-5 h-5" />
										) : (
											<Volume2 className="w-5 h-5" />
										)}
									</Button>

									<div className="text-white text-sm">
										{formatTime(currentTime)} / {formatTime(duration)}
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										className="text-white hover:bg-white/20"
									>
										<Settings className="w-5 h-5" />
									</Button>

									<Button
										variant="ghost"
										size="icon"
										className="text-white hover:bg-white/20"
									>
										<Maximize className="w-5 h-5" />
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
