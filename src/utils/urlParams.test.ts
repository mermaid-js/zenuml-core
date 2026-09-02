import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock window.location
const mockLocation = {
  href: '',
  search: ''
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// URL parameter extraction functions (copied from renderer.html for testing)
function extractCodeFromURL(): string | null {
  try {
    const currentUrl = new URL(window.location.href);
    const codeParam = currentUrl.searchParams.get('code');
    return codeParam;
  } catch (error) {
    console.error('Error extracting code from URL:', error);
    return null;
  }
}

function hasCodeParameter(): boolean {
  try {
    const currentUrl = new URL(window.location.href);
    return currentUrl.searchParams.has('code');
  } catch (error) {
    console.error('Error checking for code parameter:', error);
    return false;
  }
}

// Base64 decoding functions (copied from renderer.html for testing)
function decodeBase64(encodedString: string): string {
  try {
    // Check if the string is valid Base64
    if (!encodedString || typeof encodedString !== 'string') {
      throw new Error('Invalid input: string is null, undefined, or not a string');
    }
    
    // Remove any whitespace
    const cleanedString = encodedString.trim();
    
    // Check if string looks like Base64 (basic validation)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(cleanedString)) {
      throw new Error('Invalid Base64 format');
    }
    
    // Attempt to decode
    const decodedString = atob(cleanedString);
    
    return decodedString;
  } catch (error) {
    throw new Error(`Base64 decoding failed: ${(error as Error).message}`);
  }
}

function processURLCodeParameter(encodedCode: string): string | null {
  try {
    if (!encodedCode) {
      return null;
    }
    
    // Try to decode as Base64
    const decodedCode = decodeBase64(encodedCode);
    
    return decodedCode;
  } catch {
    // Return the original code as fallback (might be plain text)
    return encodedCode;
  }
}

describe('URL Parameter Extraction', () => {
  beforeEach(() => {
    // Reset console.error mock
    vi.clearAllMocks();
  });

  describe('extractCodeFromURL', () => {
    it('should extract code parameter from URL', () => {
      mockLocation.href = 'https://example.com?code=test123';
      
      const result = extractCodeFromURL();
      
      expect(result).toBe('test123');
    });

    it('should return null when no code parameter exists', () => {
      mockLocation.href = 'https://example.com';
      
      const result = extractCodeFromURL();
      
      expect(result).toBeNull();
    });

    it('should extract code parameter when multiple parameters exist', () => {
      mockLocation.href = 'https://example.com?theme=dark&code=mycode&other=value';
      
      const result = extractCodeFromURL();
      
      expect(result).toBe('mycode');
    });

    it('should handle Base64-like code parameters', () => {
      const base64Code = 'dGVzdCBjb2Rl'; // "test code" in Base64
      mockLocation.href = `https://example.com?code=${base64Code}`;
      
      const result = extractCodeFromURL();
      
      expect(result).toBe(base64Code);
    });

    it('should handle URL-encoded code parameters', () => {
      const encodedCode = 'test%20code%20with%20spaces';
      mockLocation.href = `https://example.com?code=${encodedCode}`;
      
      const result = extractCodeFromURL();
      
      expect(result).toBe('test code with spaces');
    });

    it('should return null and log error for invalid URLs', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLocation.href = 'invalid-url';
      
      const result = extractCodeFromURL();
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error extracting code from URL:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('hasCodeParameter', () => {
    it('should return true when code parameter exists', () => {
      mockLocation.href = 'https://example.com?code=test123';
      
      const result = hasCodeParameter();
      
      expect(result).toBe(true);
    });

    it('should return false when no code parameter exists', () => {
      mockLocation.href = 'https://example.com';
      
      const result = hasCodeParameter();
      
      expect(result).toBe(false);
    });

    it('should return true when code parameter exists among other parameters', () => {
      mockLocation.href = 'https://example.com?theme=dark&code=mycode&other=value';
      
      const result = hasCodeParameter();
      
      expect(result).toBe(true);
    });

    it('should return false when only other parameters exist', () => {
      mockLocation.href = 'https://example.com?theme=dark&other=value';
      
      const result = hasCodeParameter();
      
      expect(result).toBe(false);
    });

    it('should return false and log error for invalid URLs', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLocation.href = 'invalid-url';
      
      const result = hasCodeParameter();
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error checking for code parameter:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('decodeBase64', () => {
    it('should decode valid Base64 string', () => {
      const base64String = 'dGVzdCBjb2Rl'; // "test code" in Base64
      
      const result = decodeBase64(base64String);
      
      expect(result).toBe('test code');
    });

    it('should decode Base64 string with padding', () => {
      const base64String = 'SGVsbG8gV29ybGQ='; // "Hello World" in Base64
      
      const result = decodeBase64(base64String);
      
      expect(result).toBe('Hello World');
    });

    it('should decode Base64 string with double padding', () => {
      const base64String = 'SGVsbG8='; // "Hello" in Base64
      
      const result = decodeBase64(base64String);
      
      expect(result).toBe('Hello');
    });

    it('should handle Base64 string with whitespace', () => {
      const base64String = '  dGVzdCBjb2Rl  '; // "test code" with spaces
      
      const result = decodeBase64(base64String);
      
      expect(result).toBe('test code');
    });

    it('should throw error for null input', () => {
      expect(() => {
        decodeBase64(null as any);
      }).toThrow('Base64 decoding failed: Invalid input: string is null, undefined, or not a string');
    });

    it('should throw error for undefined input', () => {
      expect(() => {
        decodeBase64(undefined as any);
      }).toThrow('Base64 decoding failed: Invalid input: string is null, undefined, or not a string');
    });

    it('should throw error for non-string input', () => {
      expect(() => {
        decodeBase64(123 as any);
      }).toThrow('Base64 decoding failed: Invalid input: string is null, undefined, or not a string');
    });

    it('should throw error for invalid Base64 format', () => {
      const invalidBase64 = 'invalid@base64!';
      
      expect(() => {
        decodeBase64(invalidBase64);
      }).toThrow('Base64 decoding failed: Invalid Base64 format');
    });

    it('should throw error for malformed Base64 string', () => {
      const malformedBase64 = 'dGVzdA==='; // Invalid padding (too many equals)
      
      expect(() => {
        decodeBase64(malformedBase64);
      }).toThrow('Base64 decoding failed: Invalid Base64 format');
    });

    it('should decode ZenUML code example', () => {
      // Example ZenUML code: "A.method() { B.process() }"
      const zenUmlCode = 'A.method() { B.process() }';
      const base64ZenUml = btoa(zenUmlCode); // Encode it first
      
      const result = decodeBase64(base64ZenUml);
      
      expect(result).toBe(zenUmlCode);
    });
  });

  describe('processURLCodeParameter', () => {
    it('should decode valid Base64 code parameter', () => {
      const originalCode = 'A.method() { B.process() }';
      const base64Code = btoa(originalCode);
      
      const result = processURLCodeParameter(base64Code);
      
      expect(result).toBe(originalCode);
    });

    it('should return null for empty input', () => {
      const result = processURLCodeParameter('');
      
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = processURLCodeParameter(null as any);
      
      expect(result).toBeNull();
    });

    it('should fallback to original string for invalid Base64', () => {
      const invalidBase64 = 'plain-text-code';
      
      const result = processURLCodeParameter(invalidBase64);
      
      expect(result).toBe(invalidBase64);
    });

    it('should handle complex ZenUML code', () => {
      const complexCode = `title Complex Sequence
A.start() {
  B.process() {
    C.validate()
    if (valid) {
      D.save()
      return success
    } else {
      return error
    }
  }
  return result
}`;
      const base64Code = btoa(complexCode);
      
      const result = processURLCodeParameter(base64Code);
      
      expect(result).toBe(complexCode);
    });

    it('should handle special characters in decoded content', () => {
      const codeWithSpecialChars = 'A.method("test@example.com", 123, true)';
      const base64Code = btoa(codeWithSpecialChars);
      
      const result = processURLCodeParameter(base64Code);
      
      expect(result).toBe(codeWithSpecialChars);
    });
  });
});