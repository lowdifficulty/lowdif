const REF_ID_KEY = "lowdif_ref";
const REF_NAME_KEY = "lowdif_ref_name";

export function storeReferral(refId: string, refName?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REF_ID_KEY, refId);
  if (refName) localStorage.setItem(REF_NAME_KEY, refName);
  else localStorage.removeItem(REF_NAME_KEY);
}

export function getStoredReferral(): {
  refId: string | null;
  refName: string | null;
} {
  if (typeof window === "undefined") {
    return { refId: null, refName: null };
  }
  return {
    refId: localStorage.getItem(REF_ID_KEY),
    refName: localStorage.getItem(REF_NAME_KEY),
  };
}

export function clearStoredReferral(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REF_ID_KEY);
  localStorage.removeItem(REF_NAME_KEY);
}
