"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCircle, Scale, Loader2 } from "lucide-react";

interface RoleSelectionDialogProps {
  open: boolean;
  onSelectRole: (role: "user" | "lawyer") => Promise<void>;
}

export function RoleSelectionDialog({ open, onSelectRole }: RoleSelectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "lawyer" | null>(null);

  const handleRoleSelection = async (role: "user" | "lawyer") => {
    setSelectedRole(role);
    setIsLoading(true);
    try {
      await onSelectRole(role);
    } catch (error) {
      console.error("Error selecting role:", error);
    } finally {
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Welcome to Clarity-Docs! 🎉</DialogTitle>
          <DialogDescription className="text-center text-base">
            Please select your account type to get started
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* User Option */}
          <Card
            className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-md"
            onClick={() => !isLoading && handleRoleSelection("user")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-blue-100">
                <UserCircle className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">I'm a User</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload and analyze legal documents with AI assistance
                </p>
                <ul className="text-xs text-left space-y-2 text-muted-foreground">
                  <li>✓ Upload & analyze contracts</li>
                  <li>✓ Get AI-powered summaries</li>
                  <li>✓ Browse & consult lawyers</li>
                  <li>✓ Request legal advice</li>
                </ul>
              </div>
              <Button
                className="w-full"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelection("user");
                }}
              >
                {isLoading && selectedRole === "user" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Continue as User"
                )}
              </Button>
            </div>
          </Card>

          {/* Lawyer Option */}
          <Card
            className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-md"
            onClick={() => !isLoading && handleRoleSelection("lawyer")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-purple-100">
                <Scale className="h-12 w-12 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">I'm a Lawyer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Provide professional legal consultation services
                </p>
                <ul className="text-xs text-left space-y-2 text-muted-foreground">
                  <li>✓ Create professional profile</li>
                  <li>✓ Accept consultation requests</li>
                  <li>✓ Chat with clients</li>
                  <li>✓ Build your reputation</li>
                </ul>
              </div>
              <Button
                className="w-full"
                variant="outline"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelection("lawyer");
                }}
              >
                {isLoading && selectedRole === "lawyer" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Continue as Lawyer"
                )}
              </Button>
            </div>
          </Card>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Don't worry, you can change this later in your settings
        </p>
      </DialogContent>
    </Dialog>
  );
}
