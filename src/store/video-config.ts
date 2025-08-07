// stores/useVideoConfigStore.ts
import { create } from "zustand";

type VideoQuality = {
	name: string;
	width: number;
	height: number;
	bitrate: string;
};

type PlayerConfig = {
	autoplay: boolean;
	controls: boolean;
	preload: string;
	poster: string;
};

type UploadConfig = {
	maxFileCount: number;
	multiple: boolean;
	accept: string;
};

type VideoConfig = {
	MAX_FILE_SIZE: number;
	ALLOWED_VIDEO_TYPES: string[];
	ALLOWED_EXTENSIONS: string[];
	CHUNK_SIZE: number;
	HLS_SEGMENT_DURATION: number;
	HLS_PLAYLIST_TYPE: string;
	VIDEO_QUALITIES: VideoQuality[];
	PLAYER_CONFIG: PlayerConfig;
	UPLOAD_CONFIG: UploadConfig;
};

type HLSConfig = {
	SEGMENT_PREFIX: string;
	PLAYLIST_NAME: string;
	MASTER_PLAYLIST: string;
	OUTPUT_FORMAT: string;
};

type VideoConfigStore = {
	videoConfig: VideoConfig;
	hlsConfig: HLSConfig;
	updatePlayerPoster: (poster: string) => void;
	addVideoQuality: (quality: VideoQuality) => void;
	resetToDefault: () => void;
};

export const defaultVideoConfig: VideoConfig = {
	MAX_FILE_SIZE: 50 * 1024 * 1024,
	ALLOWED_VIDEO_TYPES: [
		"video/mp4",
		"video/webm",
		"video/quicktime",
		"video/x-msvideo",
		"video/x-ms-wmv",
	],
	ALLOWED_EXTENSIONS: [".mp4", ".webm", ".mov", ".avi", ".wmv"],
	CHUNK_SIZE: 1* 1024 * 1024,
	HLS_SEGMENT_DURATION: 10,
	HLS_PLAYLIST_TYPE: "VOD",
	VIDEO_QUALITIES: [
		{ name: "1080p", width: 1920, height: 1080, bitrate: "5000k" },
		{ name: "720p", width: 1280, height: 720, bitrate: "2500k" },
		{ name: "480p", width: 854, height: 480, bitrate: "1000k" },
		{ name: "360p", width: 640, height: 360, bitrate: "500k" },
	],
	PLAYER_CONFIG: {
		autoplay: false,
		controls: true,
		preload: "metadata",
		poster: "/placeholder.svg?height=400&width=600&text=Video+Thumbnail",
	},
	UPLOAD_CONFIG: {
		maxFileCount: 1,
		multiple: false,
		accept: "video/*",
	},
};

export const defaultHLSConfig: HLSConfig = {
	SEGMENT_PREFIX: "segment_",
	PLAYLIST_NAME: "playlist.m3u8",
	MASTER_PLAYLIST: "master.m3u8",
	OUTPUT_FORMAT: "mp4",
};

export const useVideoConfigStore = create<VideoConfigStore>((set) => ({
	videoConfig: defaultVideoConfig,
	hlsConfig: defaultHLSConfig,

	updatePlayerPoster: (poster) =>
		set((state) => ({
			videoConfig: {
				...state.videoConfig,
				PLAYER_CONFIG: {
					...state.videoConfig.PLAYER_CONFIG,
					poster,
				},
			},
		})),

	addVideoQuality: (quality) =>
		set((state) => ({
			videoConfig: {
				...state.videoConfig,
				VIDEO_QUALITIES: [...state.videoConfig.VIDEO_QUALITIES, quality],
			},
		})),

	resetToDefault: () =>
		set(() => ({
			videoConfig: defaultVideoConfig,
			hlsConfig: defaultHLSConfig,
		})),
}));
