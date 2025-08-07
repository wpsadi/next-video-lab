import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { videoStorage } from "@/utils/video-storage";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const action = searchParams.get("action");
		const videoId = searchParams.get("videoId");

		switch (action) {
			case "stats": {
				const stats = await videoStorage.getStorageStats();
				return NextResponse.json(stats);
			}

			case "list": {
				if (!videoId) {
					return NextResponse.json(
						{ error: "videoId is required for list action" },
						{ status: 400 },
					);
				}
				const files = await videoStorage.listVideoFiles(videoId);
				return NextResponse.json({ videoId, files });
			}

			case "exists": {
				if (!videoId) {
					return NextResponse.json(
						{ error: "videoId is required for exists action" },
						{ status: 400 },
					);
				}
				const exists = await videoStorage.videoExists(videoId);
				return NextResponse.json({ videoId, exists });
			}

			default:
				return NextResponse.json(
					{ error: "Invalid action. Supported actions: stats, list, exists" },
					{ status: 400 },
				);
		}
	} catch (error) {
		console.error("Storage API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const videoId = searchParams.get("videoId");

		if (!videoId) {
			return NextResponse.json(
				{ error: "videoId is required" },
				{ status: 400 },
			);
		}

		await videoStorage.deleteVideo(videoId);
		return NextResponse.json({
			success: true,
			message: `Video ${videoId} deleted successfully`,
		});
	} catch (error) {
		console.error("Delete video error:", error);
		return NextResponse.json(
			{ error: "Failed to delete video" },
			{ status: 500 },
		);
	}
}
