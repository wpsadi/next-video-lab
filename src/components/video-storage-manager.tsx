"use client";

import { FileVideo, HardDrive, RefreshCw, Trash2, Video } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StorageStats {
	totalVideos: number;
	totalFiles: number;
}

interface VideoFiles {
	videoId: string;
	files: string[];
}

export default function VideoStorageManager() {
	const [stats, setStats] = useState<StorageStats | null>(null);
	const [videoFiles, setVideoFiles] = useState<VideoFiles[]>([]);
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState<string | null>(null);

	const fetchStats = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/video/storage?action=stats");
			const data = await response.json();
			setStats(data);
		} catch (error) {
			console.error("Failed to fetch storage stats:", error);
			toast.error("Failed to fetch storage stats");
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteVideo = async (videoId: string) => {
		try {
			setDeleting(videoId);
			const response = await fetch(
				`/api/video/storage?videoId=${encodeURIComponent(videoId)}`,
				{
					method: "DELETE",
				},
			);

			if (response.ok) {
				toast.success(`Video ${videoId} deleted successfully`);
				await fetchStats();
				setVideoFiles((prev) => prev.filter((v) => v.videoId !== videoId));
			} else {
				throw new Error("Failed to delete video");
			}
		} catch (error) {
			console.error(`Failed to delete video ${videoId}:`, error);
			toast.error(`Failed to delete video ${videoId}`);
		} finally {
			setDeleting(null);
		}
	};

	const loadAllData = async () => {
		await fetchStats();
		// Note: In a real app, you'd want to get a list of video IDs from your database
		// For now, we'll just show the stats
	};

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Video Storage Manager</h2>
				<Button onClick={loadAllData} disabled={loading} size="sm">
					<RefreshCw
						className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
					/>
					Refresh
				</Button>
			</div>

			{/* Storage Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Videos</CardTitle>
						<Video className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.totalVideos ?? "..."}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Files</CardTitle>
						<FileVideo className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.totalFiles ?? "..."}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Storage Type</CardTitle>
						<HardDrive className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-sm">Temporary</div>
						<Badge variant="secondary" className="mt-1">
							In-Memory Cache
						</Badge>
					</CardContent>
				</Card>
			</div>

			{/* Instructions */}
			<Card>
				<CardHeader>
					<CardTitle>How it works</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground space-y-2">
					<p>• Videos are uploaded to your storage bucket (UploadThing)</p>
					<p>• When processed, HLS segments are stored in temporary cache</p>
					<p>• Videos are served from cache, not from public directory</p>
					<p>• This approach works in serverless environments like Vercel</p>
					<p>• Cache is cleared when the server restarts</p>
				</CardContent>
			</Card>

			{/* Video Management */}
			{videoFiles.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Cached Videos</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{videoFiles.map((video) => (
								<div
									key={video.videoId}
									className="flex items-center justify-between p-3 border rounded-lg"
								>
									<div>
										<div className="font-medium">{video.videoId}</div>
										<div className="text-sm text-muted-foreground">
											{video.files.length} files
										</div>
									</div>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => deleteVideo(video.videoId)}
										disabled={deleting === video.videoId}
									>
										{deleting === video.videoId ? (
											<RefreshCw className="w-4 h-4 animate-spin" />
										) : (
											<Trash2 className="w-4 h-4" />
										)}
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
