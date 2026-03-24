import { useState, useRef } from "react";
import type { ReactNode, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { successful: Array<{ name: string; uploadURL: string; type: string }> }) => void;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  children: ReactNode;
  acceptedFileTypes?: string;
}

export function ObjectUploader({
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  buttonVariant = "outline",
  buttonSize = "default",
  children,
  acceptedFileTypes = "image/*,video/*",
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      alert(`File size exceeds the maximum allowed (${Math.round(maxFileSize / 1024 / 1024)}MB)`);
      return;
    }

    setIsUploading(true);
    try {
      const { url } = await onGetUploadParameters();
      
      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      onComplete?.({
        successful: [{
          name: file.name,
          uploadURL: url,
          type: file.type,
        }],
      });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        style={{ display: "none" }}
        data-testid="input-file-upload"
      />
      <Button 
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className={buttonClassName}
        variant={buttonVariant}
        size={buttonSize}
        data-testid="button-upload-media"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}
