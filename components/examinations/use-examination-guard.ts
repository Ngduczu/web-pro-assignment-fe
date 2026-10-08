"use client";

import { useEffect, useRef } from "react";
import { clientApis } from "@/lib/api/client-apis";
import type { ExaminationAttemptDto, ExaminationSecuritySettings, ExaminationViolationType } from "@/types/api";

export function useExaminationGuard({ attemptId, active, security, onAttemptChange }: { attemptId?: string; active: boolean; security: ExaminationSecuritySettings; onAttemptChange: (attempt: ExaminationAttemptDto) => void }) {
  const fullscreenExitAt = useRef<number | undefined>(undefined);
  const fullscreenTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!active || !attemptId) return;
    async function violation(type: ExaminationViolationType, durationSeconds?: number) { try { onAttemptChange(await clientApis.examinations.recordViolation(attemptId!, type, durationSeconds)); } catch {} }
    const visibility = () => { if (document.hidden && security.detectTabChange) void violation("TabChanged"); };
    const copy = (event: ClipboardEvent) => { if (security.blockCopyPaste) { event.preventDefault(); void violation("CopyAttempt"); } };
    const paste = (event: ClipboardEvent) => { if (security.blockCopyPaste) { event.preventDefault(); void violation("PasteAttempt"); } };
    const context = (event: MouseEvent) => { if (security.blockRightClick) { event.preventDefault(); void violation("RightClickAttempt"); } };
    const fullscreen = () => {
      if (!security.requireFullscreen) return;
      if (!document.fullscreenElement) { fullscreenExitAt.current = Date.now(); fullscreenTimer.current = window.setTimeout(() => void violation("ExitFullscreen", security.fullscreenGraceSeconds + 1), (security.fullscreenGraceSeconds + 1) * 1000); }
      else if (fullscreenExitAt.current) { if (fullscreenTimer.current) window.clearTimeout(fullscreenTimer.current); const duration = Math.ceil((Date.now() - fullscreenExitAt.current) / 1000); fullscreenExitAt.current = undefined; if (duration > security.fullscreenGraceSeconds) void violation("ExitFullscreen", duration); }
    };
    const leave = () => { void fetch(`/api/backend/examination-attempts/${attemptId}/disconnect`, { method: "POST", credentials: "same-origin", keepalive: true }); };
    document.addEventListener("visibilitychange", visibility); document.addEventListener("copy", copy); document.addEventListener("paste", paste); document.addEventListener("contextmenu", context); document.addEventListener("fullscreenchange", fullscreen); window.addEventListener("pagehide", leave);
    return () => { if (fullscreenTimer.current) window.clearTimeout(fullscreenTimer.current); document.removeEventListener("visibilitychange", visibility); document.removeEventListener("copy", copy); document.removeEventListener("paste", paste); document.removeEventListener("contextmenu", context); document.removeEventListener("fullscreenchange", fullscreen); window.removeEventListener("pagehide", leave); };
  }, [active, attemptId, onAttemptChange, security.blockCopyPaste, security.blockRightClick, security.detectTabChange, security.fullscreenGraceSeconds, security.requireFullscreen]);
}
