import type { NextRequest } from "next/server";
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
import { env } from "@/env";

// Create a base handler without config
const baseHandler = (token: string) =>
	createRouteHandler({
		router: ourFileRouter,

		config: {
			token: token, // Pass the token to the config
			isDev: process.env.NODE_ENV === "development",
			logLevel: "All",
			// callbackUrl:"/api/uploadthing", // Use a static callback URL for development
			callbackUrl: `${env.NEXT_PUBLIC_VERCEL_URL}/api/uploadthing`, // Use the token in the callback URL
		},
		// config will be injected per request
	});

// Custom GET handler
export const GET = async (req: NextRequest) => {
	try {
		const token = req.headers.get("x-uploadthing-token");
		// getfrom query
		const url = new URL(req.url);
		const queryToken = url.searchParams.get("token");
		return baseHandler(token || queryToken || "").GET(req);
	} catch (error) {
		console.error("Error in GET handler:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
	// Get token from header
};

// Custom POST handler
export const POST = async (req: NextRequest) => {
	// Get token from header
	try {
		const token = req.headers.get("x-uploadthing-token");
		const url = new URL(req.url);
		const queryToken = url.searchParams.get("token");
		return baseHandler(token || queryToken || "").POST(req);
	} catch (error) {
		console.error("Error in POST handler:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
};
