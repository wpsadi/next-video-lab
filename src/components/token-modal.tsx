"use client";

import { Eye, EyeOff, Key, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TokenModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onTokenUpdate?: () => void;
}

interface TokenState {
	token: string;
	isConfigured: boolean;
	showToken: boolean;
	lastUpdated: string | null;
	isLoading: boolean;
	isSaving: boolean;
}

export function TokenModal({
	open,
	onOpenChange,
	onTokenUpdate,
}: TokenModalProps) {
	const [state, setState] = useState<TokenState>({
		token: "",
		isConfigured: false,
		showToken: false,
		lastUpdated: null,
		isLoading: true,
		isSaving: false,
	});

	useEffect(() => {
		if (open) {
			setState((prev) => ({ ...prev, isLoading: true }));

			// Simulate loading delay for better UX
			setTimeout(() => {
				const savedToken = localStorage.getItem("uploadthing-token");
				const lastUpdated = localStorage.getItem("token-updated");

				setState((prev) => ({
					...prev,
					token: savedToken || "",
					isConfigured: !!savedToken,
					lastUpdated,
					isLoading: false,
				}));
			}, 800);
		}
	}, [open]);

	const handleSaveToken = async () => {
		if (!state.token.trim()) {
			toast.error("Please enter a valid token");
			return;
		}

		setState((prev) => ({ ...prev, isSaving: true }));

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 1500));

		localStorage.setItem("uploadthing-token", state.token);
		localStorage.setItem("token-updated", new Date().toISOString());

		setState((prev) => ({
			...prev,
			isConfigured: true,
			lastUpdated: new Date().toISOString(),
			isSaving: false,
		}));

		toast.success("Token saved successfully");

		onTokenUpdate?.();
	};

	const handleDeleteToken = async () => {
		setState((prev) => ({ ...prev, isSaving: true }));

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		localStorage.removeItem("uploadthing-token");
		localStorage.removeItem("token-updated");

		setState((prev) => ({
			...prev,
			token: "",
			isConfigured: false,
			lastUpdated: null,
			isSaving: false,
		}));

		toast.info("Token deleted successfully");

		onTokenUpdate?.();
	};

	const toggleShowToken = () => {
		setState((prev) => ({ ...prev, showToken: !prev.showToken }));
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Key className="h-5 w-5" />
						Token Management
					</DialogTitle>
					<DialogDescription>
						Configure your UploadThing token for cloud storage
					</DialogDescription>
				</DialogHeader>

				{state.isLoading ? (
					<div className="space-y-4 animate-pulse">
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
						<div className="space-y-3">
							<div className="h-4 bg-muted rounded w-3/4"></div>
							<div className="h-10 bg-muted rounded"></div>
							<div className="h-4 bg-muted rounded w-1/2"></div>
						</div>
					</div>
				) : (
					<div className="space-y-6">
						{/* Status */}
						<div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
							<div>
								<Badge
									variant={state.isConfigured ? "default" : "secondary"}
									className="mb-2"
								>
									{state.isConfigured ? "Configured" : "Not Set"}
								</Badge>
								{state.lastUpdated && (
									<p className="text-xs text-muted-foreground">
										Updated: {new Date(state.lastUpdated).toLocaleString()}
									</p>
								)}
							</div>
							{state.isConfigured && (
								<Button
									variant="destructive"
									size="sm"
									onClick={handleDeleteToken}
									disabled={state.isSaving}
								>
									{state.isSaving ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Trash2 className="h-4 w-4" />
									)}
								</Button>
							)}
						</div>

						{/* Token Input */}
						<div className="space-y-2">
							<Label htmlFor="token">UploadThing Token</Label>
							<div className="relative">
								<Input
									id="token"
									type={state.showToken ? "text" : "password"}
									value={state.token}
									onChange={(e) =>
										setState((prev) => ({ ...prev, token: e.target.value }))
									}
									placeholder="Enter your UploadThing token"
									className="pr-10"
									disabled={state.isSaving}
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={toggleShowToken}
									disabled={state.isSaving}
								>
									{state.showToken ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-2">
							<Button
								onClick={handleSaveToken}
								className="flex-1"
								disabled={state.isSaving || !state.token.trim()}
							>
								{state.isSaving ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										Save Token
									</>
								)}
							</Button>
						</div>

						{/* Help Text */}
						<div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted/30 rounded-lg">
							<p>
								<strong>Note:</strong> This token is optional. The app works in
								demo mode without it.
							</p>
							<p>Get your token from uploadthing.com → Dashboard → API Keys</p>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
