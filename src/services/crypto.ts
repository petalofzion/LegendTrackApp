// The "Secret Phrase" embedded in the grimoire (code)
// This protects against generic scrapers but not reverse engineering.
// It creates a "Lightweight Obfuscation" layer.
const GRIMOIRE_SECRET = "LegendTrack_Grimoire_Secret_Key_2025_✨";

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(GRIMOIRE_SECRET),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("legendtrack_fixed_salt"), // Fixed salt for deterministic key
      iterations: 1000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function obfuscate(text: string): Promise<string> {
  if (!text) return "";
  try {
    const key = await getKey();
    // Use random IV for semantic security (same text = different output each time)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(text)
    );

    // Serialize to a simple JSON string structure
    const bundle = {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    };
    
    // Add a prefix to easily identify our obfuscated strings
    return "ENC:" + JSON.stringify(bundle);
  } catch (e) {
    console.error("Obfuscation spell failed", e);
    return text;
  }
}

export async function deobfuscate(ciphertext: string): Promise<string> {
  if (!ciphertext) return "";
  
  // Migration check: If it doesn't start with our prefix, assume it's legacy plain text
  if (!ciphertext.startsWith("ENC:")) {
    return ciphertext;
  }

  try {
    const rawJson = ciphertext.slice(4); // Remove "ENC:"
    const bundle = JSON.parse(rawJson);
    
    const key = await getKey();
    const iv = new Uint8Array(bundle.iv);
    const data = new Uint8Array(bundle.data);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (e) {
    console.warn("Deobfuscation spell fizzled", e);
    return ""; // Return empty if decryption fails (safest default)
  }
}
