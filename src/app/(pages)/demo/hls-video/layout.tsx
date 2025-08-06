"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SpinnerPage from "@/components/spinner-page";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUploadThingStore } from "@/store/uploadThing.store";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const { UPLOADTHING_TOKEN, hydrated } = useUploadThingStore();

	useEffect(() => {
		if (!UPLOADTHING_TOKEN && hydrated) {
			router.push("/configure/complete-configuration");
		}
	}, [UPLOADTHING_TOKEN, router.push, hydrated]);
	if (!hydrated) {
		return (
			<SpinnerPage
				description="Retrieving your configuration..."
				text="Processing"
			/>
		);
	}

	return (
		<>
			<header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem className="hidden md:block">
							<BreadcrumbLink href="#">demo</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator className="hidden md:block" />
						<BreadcrumbItem>
							<BreadcrumbPage>HLS Video</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</header>
			{children}
		</>
	);
}
