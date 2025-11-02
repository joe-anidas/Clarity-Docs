import { storage, storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "./firebase";

/**
 * Upload a chat document to Firebase Storage with progress tracking
 * @param file - The file to upload
 * @param sessionId - The chat session ID
 * @param userId - The user ID who is uploading
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise with the download URL or error
 */
export async function uploadChatDocument(
  file: File,
  sessionId: string,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("Starting upload for file:", file.name, "Size:", file.size);
    
    // Immediately report 0% progress
    if (onProgress) {
      onProgress(0);
    }

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `chat-documents/${sessionId}/${userId}/${timestamp}_${sanitizedFileName}`;
    
    console.log("Upload path:", filePath);
    
    // Create storage reference
    const fileRef = storageRef(storage, filePath);
    
    // Upload file with resumable upload
    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        sessionId: sessionId,
        originalName: file.name,
      },
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(2)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error("Error uploading chat document:", error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          resolve({ 
            success: false, 
            error: error.message || "Failed to upload document" 
          });
        },
        async () => {
          // Upload completed successfully
          console.log("Upload completed, getting download URL...");
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Download URL obtained:", downloadURL);
            if (onProgress) {
              onProgress(100); // Ensure we show 100%
            }
            resolve({ success: true, url: downloadURL });
          } catch (error) {
            console.error("Error getting download URL:", error);
            resolve({ 
              success: false, 
              error: error instanceof Error ? error.message : "Failed to get download URL" 
            });
          }
        }
      );
    });
  } catch (error) {
    console.error("Error uploading chat document:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to upload document" 
    };
  }
}

/**
 * Delete a chat document from Firebase Storage
 * @param fileUrl - The download URL of the file to delete
 * @returns Promise with success status
 */
export async function deleteChatDocument(
  fileUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const fileRef = storageRef(storage, fileUrl);
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting chat document:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete document" 
    };
  }
}
