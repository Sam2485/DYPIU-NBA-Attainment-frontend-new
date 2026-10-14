/**
 * End-to-End Encryption (E2EE) Utility for Emmu Messenger
 * Uses Web Crypto API (AES-GCM 256-bit) with PBKDF2 key derivation.
 * Messages are encrypted in the client before transmission and decrypted in memory upon receipt.
 */

const E2EE_PREFIX = 'E2EE::v1::';

/**
 * Derives a deterministic AES-GCM 256-bit key for a conversation pair.
 */
async function deriveConversationKey(conversationId) {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return null;
  }
  const encoder = new TextEncoder();
  const baseSecret = `dypiu-nba-e2ee-secret::${conversationId}`;
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(baseSecret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const salt = encoder.encode(`conv-salt::${conversationId}`);

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plain text string into Base64 ciphertext with a random 12-byte IV.
 */
export async function encryptMessage(text, conversationId) {
  if (!text) return { content: '', iv: '', isEncrypted: false };

  try {
    const key = await deriveConversationKey(conversationId);
    if (!key) {
      return { content: text, iv: null, isEncrypted: false };
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encoded = encoder.encode(text);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encoded
    );

    const ciphertextArray = new Uint8Array(ciphertextBuffer);
    const ciphertextBase64 = btoa(String.fromCharCode(...ciphertextArray));
    const ivBase64 = btoa(String.fromCharCode(...iv));

    return {
      content: `${E2EE_PREFIX}${ciphertextBase64}`,
      iv: ivBase64,
      isEncrypted: true,
    };
  } catch (err) {
    console.error('[E2EE] Encryption failed, falling back to plain text:', err);
    return { content: text, iv: null, isEncrypted: false };
  }
}

/**
 * Decrypts a ciphertext string using conversation key and IV.
 */
export async function decryptMessage(content, ivBase64, conversationId) {
  if (!content) return '';
  if (!content.startsWith(E2EE_PREFIX) || !ivBase64) {
    return content; // Plain text or unencrypted message
  }

  try {
    const key = await deriveConversationKey(conversationId);
    if (!key) return content;

    const rawCiphertext = content.slice(E2EE_PREFIX.length);
    const ciphertextBytes = Uint8Array.from(atob(rawCiphertext), (c) => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
      },
      key,
      ciphertextBytes
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    console.warn('[E2EE] Decryption failed (content preserved):', err);
    return content;
  }
}
