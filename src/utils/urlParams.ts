import pako from "pako";

// URL parameter extraction functionality
export function extractCodeFromURL(): string | null {
  try {
    console.log("Extracting code parameter from URL...");

    // Get current URL
    const currentUrl = new URL(window.location.href);
    console.log("Current URL:", currentUrl.href);

    // Extract the 'code' parameter
    const codeParam = currentUrl.searchParams.get("code");

    if (codeParam) {
      console.log("Code parameter found:", codeParam.substring(0, 50) + "...");
      return codeParam;
    } else {
      console.log("No code parameter found in URL");
      return null;
    }
  } catch (error) {
    console.error("Error extracting code from URL:", error);
    return null;
  }
}

// Check if URL parameter exists
export function hasCodeParameter(): boolean {
  try {
    const currentUrl = new URL(window.location.href);
    return currentUrl.searchParams.has("code");
  } catch (error) {
    console.error("Error checking for code parameter:", error);
    return false;
  }
}

// Base64 decoding functionality
export function decodeBase64(encodedString: string): string {
  try {
    console.log("Attempting to decode Base64 string...");

    // Check if the string is valid Base64
    if (!encodedString || typeof encodedString !== "string") {
      throw new Error(
        "Invalid input: string is null, undefined, or not a string",
      );
    }

    // Remove any whitespace
    const cleanedString = encodedString.trim();

    // Check if string looks like Base64 (basic validation)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(cleanedString)) {
      throw new Error("Invalid Base64 format");
    }

    // Attempt to decode
    const decodedString = atob(cleanedString);
    console.log("Base64 decoding successful");

    return decodedString;
  } catch (error) {
    console.error("Base64 decoding failed:", error);
    throw new Error(`Base64 decoding failed: ${(error as Error).message}`);
  }
}

// Gzip decompression functionality
export function decompressGzip(compressedData: string): string {
  try {
    console.log("Attempting to decompress gzip data...");

    // Convert base64 decoded string to Uint8Array
    const binaryString = compressedData;
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decompress using pako
    const decompressed = pako.ungzip(bytes, { to: "string" });
    console.log("Gzip decompression successful");

    return decompressed;
  } catch (error) {
    console.error("Gzip decompression failed:", error);
    throw new Error(`Gzip decompression failed: ${(error as Error).message}`);
  }
}

// Process URL code parameter with Base64 decoding and optional gzip decompression
export function processURLCodeParameter(encodedCode: string): string | null {
  try {
    console.log("Processing URL code parameter...");

    if (!encodedCode) {
      console.log("No encoded code provided");
      return null;
    }

    let processedCode: string = encodedCode;

    // Step 1: Try to decode as Base64
    try {
      const base64Decoded = decodeBase64(encodedCode);
      console.log("Base64 decoding successful");
      processedCode = base64Decoded;

      // Step 2: Check if the decoded data is gzipped and decompress if needed
      // Gzip files start with magic numbers: 1f 8b
      if (
        processedCode.length >= 2 &&
        processedCode.charCodeAt(0) === 0x1f &&
        processedCode.charCodeAt(1) === 0x8b
      ) {
        console.log("Gzip signature detected, attempting decompression...");
        processedCode = decompressGzip(processedCode);
        console.log("Successfully decompressed gzipped data");
      } else {
        console.log("No gzip signature found, using Base64 decoded data");
      }
    } catch (base64Error) {
      console.warn(
        "Base64 decoding failed, trying direct gzip decompression:",
        base64Error,
      );

      // If Base64 fails, maybe it's already raw text or needs different handling
      // Try to see if it's URL encoded
      try {
        const urlDecoded = decodeURIComponent(encodedCode);
        if (urlDecoded !== encodedCode) {
          console.log("URL decoding applied");
          processedCode = urlDecoded;
        }
      } catch (urlError) {
        console.warn("URL decoding failed:", urlError);
      }
    }

    return processedCode;
  } catch (error) {
    console.error("Failed to process URL code parameter:", error);

    // Return the original code as fallback (might be plain text)
    console.log("All decoding attempts failed, using raw parameter value");
    return encodedCode;
  }
}
