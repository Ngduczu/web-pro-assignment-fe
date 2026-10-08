"use client";

import { useLanguage } from "@/lib/i18n";
import type { ExaminationSecuritySettings } from "@/types/api";

const field = "h-10 w-full border border-input bg-background px-3 text-sm";
const copy = {
  en: { title: "Security and behavior", disconnect: "Disconnect timeout (minutes)", fullscreen: "Require fullscreen", copy: "Block copy and paste", rightClick: "Block right click", tabs: "Detect tab changes", tools: "Detect developer tools", violations: "Maximum violations", shuffle: "Shuffle questions", score: "Show score immediately" },
  vi: { title: "Bảo mật và cách thức thi", disconnect: "Thời gian mất kết nối tối đa (phút)", fullscreen: "Yêu cầu toàn màn hình", copy: "Chặn sao chép và dán", rightClick: "Chặn chuột phải", tabs: "Phát hiện chuyển tab", tools: "Phát hiện công cụ lập trình", violations: "Số vi phạm tối đa", shuffle: "Trộn thứ tự câu hỏi", score: "Hiện điểm ngay" },
};

export function ExaminationSecurityFields({ value, onChange, shuffleQuestions, onShuffleChange, showScore, onShowScoreChange }: { value: ExaminationSecuritySettings; onChange: (value: ExaminationSecuritySettings) => void; shuffleQuestions: boolean; onShuffleChange: (value: boolean) => void; showScore: boolean; onShowScoreChange: (value: boolean) => void }) {
  const { language } = useLanguage();
  const text = copy[language];
  const toggles: [string, boolean, (checked: boolean) => void][] = [
    [text.shuffle, shuffleQuestions, onShuffleChange], [text.score, showScore, onShowScoreChange],
    [text.fullscreen, value.requireFullscreen, (checked) => onChange({ ...value, requireFullscreen: checked })],
    [text.copy, value.blockCopyPaste, (checked) => onChange({ ...value, blockCopyPaste: checked })],
    [text.rightClick, value.blockRightClick, (checked) => onChange({ ...value, blockRightClick: checked })],
    [text.tabs, value.detectTabChange, (checked) => onChange({ ...value, detectTabChange: checked })],
    [text.tools, value.detectDevTools, (checked) => onChange({ ...value, detectDevTools: checked })],
  ];
  return <fieldset className="mt-6"><legend className="text-sm font-semibold">{text.title}</legend><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{toggles.map(([label, checked, setter]) => <label key={label} className="flex items-center gap-2 border border-border p-3 text-sm"><input type="checkbox" checked={checked} onChange={(event) => setter(event.target.checked)} />{label}</label>)}</div><div className="mt-3 grid max-w-xl gap-3 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">{text.violations}<input required min={0} type="number" value={value.maxViolations} onChange={(event) => onChange({ ...value, maxViolations: Number(event.target.value) })} className={field} /></label><label className="grid gap-2 text-sm font-medium">{text.disconnect}<input required min={0} type="number" value={value.maxDisconnectMinutes} onChange={(event) => onChange({ ...value, maxDisconnectMinutes: Number(event.target.value) })} className={field} /></label></div></fieldset>;
}
