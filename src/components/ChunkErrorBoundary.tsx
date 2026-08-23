import { Component, type ReactNode } from "react";

/**
 * lazy() 청크 동적 import 실패(배포 후 옛 index.html이 사라진 해시 청크를 참조 →
 * "Failed to fetch dynamically imported module" / "Loading chunk failed")를 잡아
 * 한 번만 강제 새로고침해 최신 index.html을 받아오게 한다.
 *
 * 마지막 새로고침 시각을 기록해, 새로고침 직후 또 같은 에러가 나면(= 캐시 문제가
 * 아니라 서버에 청크가 실제로 없는 경우) 무한 새로고침 대신 fallback을 보여준다.
 */
const RELOAD_AT_KEY = "chunk-reload-at";
const RELOAD_COOLDOWN_MS = 10_000;

function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /dynamically imported module/i.test(message) ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    if (isChunkLoadError(error)) {
      const lastReloadAt = Number(sessionStorage.getItem(RELOAD_AT_KEY) ?? 0);
      // 최근 쿨다운 내에 이미 새로고침했다면 또 새로고침하지 않는다(루프 방지).
      if (Date.now() - lastReloadAt > RELOAD_COOLDOWN_MS) {
        sessionStorage.setItem(RELOAD_AT_KEY, String(Date.now()));
        window.location.reload();
      }
    }
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
