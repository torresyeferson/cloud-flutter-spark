import { useState, useEffect, useCallback } from "react";

const BIOMETRIC_CRED_KEY = "puntualometro_biometric_cred";
const BIOMETRIC_USER_KEY = "puntualometro_biometric_user";

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function useBiometric() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      if (
        window.PublicKeyCredential &&
        typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
      ) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsAvailable(available);
      }
      setIsEnabled(!!localStorage.getItem(BIOMETRIC_CRED_KEY));
    })();
  }, []);

  const register = useCallback(async (userId: string, email: string, displayName: string) => {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Puntualómetro" },
        user: {
          id: new TextEncoder().encode(userId),
          name: email,
          displayName,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
      },
    }) as PublicKeyCredential | null;

    if (!credential) throw new Error("No se pudo registrar biométrico");

    localStorage.setItem(BIOMETRIC_CRED_KEY, bufferToBase64(credential.rawId));
    localStorage.setItem(BIOMETRIC_USER_KEY, JSON.stringify({ userId, email }));
    setIsEnabled(true);
  }, []);

  const authenticate = useCallback(async (): Promise<{ userId: string; email: string } | null> => {
    const storedCred = localStorage.getItem(BIOMETRIC_CRED_KEY);
    const storedUser = localStorage.getItem(BIOMETRIC_USER_KEY);
    if (!storedCred || !storedUser) return null;

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credId = base64ToBuffer(storedCred);

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: credId, type: "public-key", transports: ["internal"] }],
          userVerification: "required",
          timeout: 60000,
        },
      });

      if (assertion) {
        return JSON.parse(storedUser);
      }
    } catch {
      return null;
    }
    return null;
  }, []);

  const disable = useCallback(() => {
    localStorage.removeItem(BIOMETRIC_CRED_KEY);
    localStorage.removeItem(BIOMETRIC_USER_KEY);
    setIsEnabled(false);
  }, []);

  return { isAvailable, isEnabled, register, authenticate, disable };
}
