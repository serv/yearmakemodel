"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkUsernameAvailability, saveUsername } from "@/app/actions/username";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type ValidationState = "idle" | "checking" | "available" | "taken" | "invalid";

export function UsernameForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced validation
  useEffect(() => {
    if (!username) {
      setValidationState("idle");
      setErrorMessage("");
      return;
    }

    // Basic client-side validation
    if (username.length < 4) {
      setValidationState("invalid");
      setErrorMessage("Username must be at least 4 characters");
      return;
    }

    if (username.length > 24) {
      setValidationState("invalid");
      setErrorMessage("Username must be at most 24 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setValidationState("invalid");
      setErrorMessage("Username can only contain letters, numbers, and underscores");
      return;
    }

    // Debounce the async check
    setValidationState("checking");
    const timeoutId = setTimeout(async () => {
      const result = await checkUsernameAvailability(username);
      if (result.available) {
        setValidationState("available");
        setErrorMessage("");
      } else {
        setValidationState("taken");
        setErrorMessage(result.error || "Username is taken");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validationState !== "available") {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await saveUsername(username);

      if (result.success) {
        // Use window.location instead of router to ensure clean navigation
        window.location.href = "/";
      } else {
        setErrorMessage(result.error || "Failed to save username");
        setValidationState("invalid");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error saving username:", error);
      setErrorMessage("An unexpected error occurred");
      setValidationState("invalid");
      setIsSubmitting(false);
    }
  };

  const getValidationIcon = () => {
    switch (validationState) {
      case "checking":
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      case "available":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "taken":
      case "invalid":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getInputClassName = () => {
    const base = "pr-10";
    switch (validationState) {
      case "available":
        return `${base} border-green-600 focus-visible:ring-green-600`;
      case "taken":
      case "invalid":
        return `${base} border-red-600 focus-visible:ring-red-600`;
      default:
        return base;
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Choose your username</h1>
        <p className="text-muted-foreground">
          This will be how other users see you in the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className={getInputClassName()}
              disabled={isSubmitting}
              autoFocus
              autoComplete="off"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getValidationIcon()}
            </div>
          </div>
          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
          {validationState === "available" && (
            <p className="text-sm text-green-600">Username is available!</p>
          )}
          <p className="text-xs text-muted-foreground">
            4-24 characters, letters, numbers, and underscores only
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={validationState !== "available" || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </div>
  );
}
