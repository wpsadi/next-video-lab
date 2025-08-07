import { defaultHLSConfig, defaultVideoConfig } from "@/store/video-config";

export interface VideoChunk {
	id: string;
	blob: Blob;
	index: number;
	size: number;
}

export interface ProcessedVideo {
	chunks: VideoChunk[];
	totalChunks: number;
	originalSize: number;
	duration?: number;
}

// Split video file into chunks for upload
export const chunkVideoFile = async (file: File): Promise<ProcessedVideo> => {
	const chunks: VideoChunk[] = [];
	const chunkSize = defaultVideoConfig.CHUNK_SIZE;
	const totalChunks = Math.ceil(file.size / chunkSize);

	for (let i = 0; i < totalChunks; i++) {
		const start = i * chunkSize;
		const end = Math.min(start + chunkSize, file.size);
		const chunk = file.slice(start, end);

		chunks.push({
			id: `chunk_${i}_${Date.now()}`,
			blob: chunk,
			index: i,
			size: chunk.size,
		});
	}

	return {
		chunks,
		totalChunks,
		originalSize: file.size,
	};
};

// Validate video file
export const validateVideoFile = (
	file: File,
): { isValid: boolean; error?: string } => {
	// Check file size

	if (file.size > defaultVideoConfig.MAX_FILE_SIZE) {
		return {
			isValid: false,
			error: `File size exceeds ${defaultVideoConfig.MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
		};
	}

	// Check file type
	if (!defaultVideoConfig.ALLOWED_VIDEO_TYPES.includes(file.type)) {
		return {
			isValid: false,
			error: `File type ${file.type} is not supported. Allowed types: ${defaultVideoConfig.ALLOWED_VIDEO_TYPES.join(", ")}`,
		};
	}

	// Check file extension
	const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
	if (!defaultVideoConfig.ALLOWED_EXTENSIONS.includes(extension)) {
		return {
			isValid: false,
			error: `File extension ${extension} is not supported`,
		};
	}

	return { isValid: true };
};

// Generate HLS playlist content
export const generateHLSPlaylist = (
	segments: string[],
	duration: number,
): string => {
	if (!duration) {
		duration = defaultVideoConfig.HLS_SEGMENT_DURATION;
	}
	const playlist = [
		"#EXTM3U",
		"#EXT-X-VERSION:3",
		`#EXT-X-TARGETDURATION:${duration}`,
		"#EXT-X-MEDIA-SEQUENCE:0",
		"#EXT-X-PLAYLIST-TYPE:VOD",
		"",
	];

	segments.forEach((_segment, index) => {
		playlist.push(`#EXTINF:${duration}.0,`);
		playlist.push(`${defaultHLSConfig.SEGMENT_PREFIX}${index}.ts`);
	});

	playlist.push("#EXT-X-ENDLIST");
	return playlist.join("\n");
};
