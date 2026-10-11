"use client";

import { createContext, useContext, useState, type ComponentPropsWithoutRef, type FormEvent, type InvalidEvent } from "react";
import { useLanguage } from "@/lib/i18n";

type FieldErrors = Record<string, string>;
const FieldErrorsContext = createContext<FieldErrors>({});

function fieldKey(control: HTMLElement) {
  return control.getAttribute("data-field-error") || control.getAttribute("name") || control.id;
}

function validationMessage(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, language: "vi" | "en") {
  const validity = control.validity;
  if (validity.valueMissing) return language === "vi" ? "Vui lòng điền trường bắt buộc này." : "This field is required.";
  if (validity.typeMismatch) return control.type === "email"
    ? language === "vi" ? "Vui lòng nhập địa chỉ email hợp lệ." : "Enter a valid email address."
    : language === "vi" ? "Vui lòng nhập đúng định dạng." : "Enter a value in the required format.";
  if (validity.rangeUnderflow) {
    const minimum = control.getAttribute("min") ?? "";
    return language === "vi" ? `Giá trị phải từ ${minimum} trở lên.` : `Value must be at least ${minimum}.`;
  }
  if (validity.rangeOverflow) {
    const maximum = control.getAttribute("max") ?? "";
    return language === "vi" ? `Giá trị không được lớn hơn ${maximum}.` : `Value must be no greater than ${maximum}.`;
  }
  if (validity.tooShort) {
    const minimumLength = control.getAttribute("minlength") ?? "0";
    return language === "vi" ? `Vui lòng nhập ít nhất ${minimumLength} ký tự.` : `Enter at least ${minimumLength} characters.`;
  }
  if (validity.tooLong) {
    const maximumLength = control.getAttribute("maxlength") ?? "0";
    return language === "vi" ? `Vui lòng nhập không quá ${maximumLength} ký tự.` : `Enter no more than ${maximumLength} characters.`;
  }
  if (validity.stepMismatch || validity.badInput) return language === "vi" ? "Vui lòng nhập một giá trị hợp lệ." : "Enter a valid value.";
  if (validity.patternMismatch) return language === "vi" ? "Giá trị không đúng định dạng yêu cầu." : "The value does not match the required format.";
  return language === "vi" ? "Giá trị không hợp lệ." : "This value is invalid.";
}

type ValidatedFormProps = Omit<ComponentPropsWithoutRef<"form">, "onInvalidCapture" | "onChangeCapture" | "onSubmitCapture">;

export function ValidatedForm(props: ValidatedFormProps) {
  const { language } = useLanguage();
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleInvalid(event: InvalidEvent<HTMLFormElement>) {
    event.preventDefault();
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return;
    const key = fieldKey(control);
    if (key) {
      control.setAttribute("aria-invalid", "true");
      control.setAttribute("aria-describedby", `${key}-error`);
      setErrors((current) => ({ ...current, [key]: validationMessage(control, language) }));
    }
  }

  function handleChange(event: FormEvent<HTMLFormElement>) {
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return;
    const key = fieldKey(control);
    if (key && control.checkValidity()) {
      control.removeAttribute("aria-invalid");
      if (control.getAttribute("aria-describedby") === `${key}-error`) control.removeAttribute("aria-describedby");
      setErrors((current) => {
        if (!(key in current)) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  return <FieldErrorsContext.Provider value={errors}><form {...props} onInvalidCapture={handleInvalid} onChangeCapture={handleChange} onSubmitCapture={() => setErrors({})} /></FieldErrorsContext.Provider>;
}

export function RequiredMark() {
  return <span aria-hidden="true" className="ml-1 inline text-destructive">*</span>;
}

export function FieldError({ field, className = "" }: { field: string; className?: string }) {
  const errors = useContext(FieldErrorsContext);
  const message = errors[field];
  return message ? <p id={`${field}-error`} role="alert" className={`text-xs font-normal text-destructive ${className}`}>{message}</p> : null;
}
