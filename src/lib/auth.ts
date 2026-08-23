import { z } from "zod";

// 빈 문자열("")이면 상대경로로 호출 → dev 서버 프록시가 백엔드로 전달(CORS 우회).
// undefined(프로덕션 빌드 등)면 배포 백엔드로 직접 호출.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://mongle.cloud";

export interface UserInfo {
  userId: string;
  email: string;
  nickname: string;
  profileImage: string;
  isNewUser?: boolean;
}

const userInfoSchema: z.ZodType<UserInfo> = z.object({
  userId: z.string(),
  email: z.string(),
  nickname: z.string(),
  profileImage: z.string(),
  // /api/user/me 응답엔 isNewUser가 없다(OAuth 콜백 전용 값). 필수로 두면 검증 실패로 로그인 표시가 안 됨.
  isNewUser: z.boolean().optional(),
});

function parseUserInfo(data: unknown): UserInfo | null {
  const result = userInfoSchema.safeParse(data);
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.error("[auth] UserInfo 스키마 검증 실패", result.error.issues);
    }
    return null;
  }
  return result.data;
}

export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token: string): void {
  localStorage.setItem("accessToken", token);
}

export function removeAccessToken(): void {
  localStorage.removeItem("accessToken");
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

export function redirectToKakaoLogin(): void {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`;
}

export function redirectToNaverLogin(): void {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/naver`;
}

export async function logout(): Promise<void> {
  try {
    // 토큰이 있을 때만 로그아웃 API 호출
    if (getAccessToken()) {
      await fetchWithAuth("/api/auth/logout", { method: "POST" });
    }
  } catch {
    // 로그아웃 API 실패와 무관하게 로컬 상태는 정리
  }

  removeAccessToken();
  clearUserCache();
  document.cookie = "token=; path=/; max-age=0";
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
      return data.data.accessToken;
    }

    return null;
  } catch {
    return null;
  }
}

let cachedUser: UserInfo | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchUserMe(force = false): Promise<UserInfo | null> {
  // 비로그인 상태에서는 me API를 호출하지 않음
  if (!getAccessToken()) return null;

  if (!force && cachedUser && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedUser;
  }

  try {
    const res = await fetchWithAuth("/api/user/me");
    if (!res.ok) return null;

    const json = await res.json();
    if (json.success && json.data) {
      const parsed = parseUserInfo(json.data);
      if (!parsed) return null;
      cachedUser = parsed;
      cacheTimestamp = Date.now();
      return cachedUser;
    }

    return null;
  } catch {
    return null;
  }
}

export function clearUserCache(): void {
  cachedUser = null;
  cacheTimestamp = 0;
}

export interface ProfileUpdateRequest {
  nickname: string;
  email: string;
  profileImage: string;
}

export async function updateUserProfile(request: ProfileUpdateRequest): Promise<UserInfo> {
  const res = await fetchWithAuth("/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (res.status === 409) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }
  if (res.status === 404) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }
  if (!res.ok) {
    throw new Error("프로필 수정에 실패했습니다.");
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error("프로필 수정 응답이 올바르지 않습니다.");
  }

  const updated = parseUserInfo(json.data);
  if (!updated) {
    throw new Error("프로필 수정 응답이 올바르지 않습니다.");
  }
  cachedUser = updated;
  cacheTimestamp = Date.now();
  return updated;
}

export async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers);
  const token = getAccessToken();
  const hadToken = !!token;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // 토큰이 있을 때만 refresh 재시도
  if (res.status === 401 && hadToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  return res;
}
