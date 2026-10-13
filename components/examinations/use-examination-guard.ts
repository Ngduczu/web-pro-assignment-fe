"use client";

import { useEffect, useRef } from "react";
import { clientApis } from "@/lib/api/client-apis";
import type { ExaminationAttemptDto, ExaminationSecuritySettings, ExaminationViolationType } from "@/types/api";

const DEV_TOOLS_POLL_INTERVAL_MS = 250;

export function useExaminationGuard({ attemptId, active, security, onAttemptChange, onViolation, onViolationError }: { attemptId?: string; active: boolean; security: ExaminationSecuritySettings; onAttemptChange: (attempt: ExaminationAttemptDto) => void; onViolation?: (type: ExaminationViolationType) => void; onViolationError?: () => void }) {
  const fullscreenExitAt = useRef<number | undefined>(undefined);
  const fullscreenTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!active || !attemptId) return;
    async function recordViolation(type: ExaminationViolationType, durationSeconds?: number) { try { onAttemptChange(await clientApis.examinations.recordViolation(attemptId!, type, durationSeconds)); } catch { onViolationError?.(); } }
    async function violation(type: ExaminationViolationType, durationSeconds?: number) { onViolation?.(type); await recordViolation(type, durationSeconds); }
    let escapeViolationAt = 0;
    const copy = (event: ClipboardEvent) => { if (security.blockCopyPaste) { event.preventDefault(); void violation("CopyAttempt"); } };
    const paste = (event: ClipboardEvent) => { if (security.blockCopyPaste) { event.preventDefault(); void violation("PasteAttempt"); } };
    const context = (event: MouseEvent) => { if (security.blockRightClick) { event.preventDefault(); void violation("RightClickAttempt"); } };
    let devToolsOpen = false;
    const checkDevTools = () => {
      if (!security.detectDevTools) return;
      const threshold = 160;
      const isOpen = window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold;
      if (isOpen && !devToolsOpen) void violation("DevToolsSuspected");
      devToolsOpen = isOpen;
    };
    let fullscreenExitHandled = false;
    const syncFullscreen = () => {
      if (!security.requireFullscreen) return;
      if (document.fullscreenElement) {
        fullscreenExitHandled = false;
        escapeViolationAt = 0;
        if (!fullscreenExitAt.current) return;
        if (fullscreenTimer.current) window.clearTimeout(fullscreenTimer.current);
        const duration = Math.ceil((Date.now() - fullscreenExitAt.current) / 1000);
        fullscreenTimer.current = undefined;
        fullscreenExitAt.current = undefined;
        if (duration > security.fullscreenGraceSeconds) void recordViolation("ExitFullscreen", duration);
        return;
      }

      // Browser-owned controls (including the X shown at the top of fullscreen)
      // can change focus/viewport before or instead of delivering the event in
      // the order we expect. Treat every out-of-fullscreen period as one exit.
      if (fullscreenExitHandled) return;
      fullscreenExitHandled = true;
      if (Date.now() - escapeViolationAt < 1000) { escapeViolationAt = 0; return; }
      onViolation?.("ExitFullscreen");
      fullscreenExitAt.current = Date.now();
      fullscreenTimer.current = window.setTimeout(() => {
        fullscreenTimer.current = undefined;
        fullscreenExitAt.current = undefined;
        void recordViolation("ExitFullscreen", security.fullscreenGraceSeconds + 1);
      }, (security.fullscreenGraceSeconds + 1) * 1000);
    };
    const visibility = () => { if (document.hidden && security.detectTabChange) void violation("TabChanged"); syncFullscreen(); };
    const blur = () => { if (!document.hidden && security.detectTabChange) void violation("WindowBlurred"); syncFullscreen(); };
    const focus = () => { syncFullscreen(); };
    const resize = () => { checkDevTools(); syncFullscreen(); };
    const keyboard = (navigator as Navigator & { keyboard?: { lock?: (codes: string[]) => Promise<void>; unlock?: () => void } }).keyboard;
    // Keyboard Lock (Chromium, fullscreen only) is the only way to keep Esc from leaving fullscreen.
    const lockEscape = () => { if (security.requireFullscreen && document.fullscreenElement) void keyboard?.lock?.(["Escape"]).catch(() => undefined); };
    const fullscreen = () => { lockEscape(); syncFullscreen(); };
    const keydown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const mod = event.ctrlKey || event.metaKey;
      const devTools = key === "f12" || (key === "f11" && security.detectDevTools) || (mod && event.shiftKey && ["i", "j", "c", "k"].includes(key)) || (mod && !event.shiftKey && key === "u") || (event.metaKey && event.altKey && ["i", "j", "c", "u"].includes(key));
      const clipboard = mod && !event.shiftKey && ["c", "x", "v", "p", "s"].includes(key);
      if (key !== "escape" && key !== "printscreen" && !devTools && !clipboard) return;
      event.preventDefault(); event.stopPropagation();
      if (key === "escape" && !event.repeat && security.requireFullscreen && document.fullscreenElement) {
        escapeViolationAt = Date.now();
        void violation("ExitFullscreen", security.fullscreenGraceSeconds + 1);
        return;
      }
      if (key === "printscreen") { void navigator.clipboard?.writeText("").catch(() => undefined); return; }
      if (devTools && security.detectDevTools) void violation("DevToolsSuspected");
      else if (clipboard && security.blockCopyPaste && key !== "p" && key !== "s") void violation(key === "v" ? "PasteAttempt" : "CopyAttempt");
    };
    const keyup = (event: KeyboardEvent) => { if (event.key === "PrintScreen") { event.preventDefault(); void navigator.clipboard?.writeText("").catch(() => undefined); } };
    const cut = (event: ClipboardEvent) => { event.preventDefault(); if (security.blockCopyPaste) void violation("CopyAttempt"); };
    const leave = () => { void fetch(`/api/backend/examination-attempts/${attemptId}/disconnect`, { method: "POST", credentials: "same-origin", keepalive: true }); };
    const devToolsTimer = security.detectDevTools ? window.setInterval(checkDevTools, DEV_TOOLS_POLL_INTERVAL_MS) : undefined;
    lockEscape();
    syncFullscreen();
    document.addEventListener("keydown", keydown, true); document.addEventListener("keyup", keyup, true); document.addEventListener("cut", cut);
    document.addEventListener("visibilitychange", visibility); document.addEventListener("copy", copy); document.addEventListener("paste", paste); document.addEventListener("contextmenu", context); document.addEventListener("fullscreenchange", fullscreen); window.addEventListener("blur", blur); window.addEventListener("focus", focus); window.addEventListener("resize", resize); window.addEventListener("pagehide", leave);
    return () => { keyboard?.unlock?.(); document.removeEventListener("keydown", keydown, true); document.removeEventListener("keyup", keyup, true); document.removeEventListener("cut", cut); if (fullscreenTimer.current) window.clearTimeout(fullscreenTimer.current); fullscreenTimer.current = undefined; fullscreenExitAt.current = undefined; if (devToolsTimer) window.clearInterval(devToolsTimer); document.removeEventListener("visibilitychange", visibility); document.removeEventListener("copy", copy); document.removeEventListener("paste", paste); document.removeEventListener("contextmenu", context); document.removeEventListener("fullscreenchange", fullscreen); window.removeEventListener("blur", blur); window.removeEventListener("focus", focus); window.removeEventListener("resize", resize); window.removeEventListener("pagehide", leave); };
  }, [active, attemptId, onAttemptChange, onViolation, onViolationError, security.blockCopyPaste, security.blockRightClick, security.detectDevTools, security.detectTabChange, security.fullscreenGraceSeconds, security.requireFullscreen]);
}
