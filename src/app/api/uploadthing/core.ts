import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	// Define as many FileRoutes as you like, each with a unique routeSlug
	imageUploader: f({
		image: {
			/**
			 * For full list of options and defaults, see the File Route API reference
			 * @see https://docs.uploadthing.com/file-routes#route-config
			 */
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	})
		// Set permissions and file types for this FileRoute
		.middleware(async ({ req }) => {
			// This code runs on your server before the upload
			// You can access the request object and perform any necessary checks
			const token = req.headers.get("x-uploadthing-token");
			if (!token) {
				throw new Error("No token provided");
			}
			return { token };
		})
		.onUploadError(async ({ error }) => {
			console.error("Upload error:", error);
			// You can also access the request object here
		})
		.onUploadComplete(async ({ metadata, file, req }) => {
			console.log("File uploaded:", file, req);
			// This code RUNS ON YOUR SERVER after upload

			console.log("file url", file.ufsUrl);

			// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
			return {
				fileUrl: file.ufsUrl,
				metadata: metadata,
			};
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
