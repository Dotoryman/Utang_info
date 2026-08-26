"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { FortuneButton } from "./FortuneButton";
import { getFortuneById } from "./fortuneData";
import { FortuneModal } from "./FortuneModal";
import { getDailyFortune } from "./fortuneStorage";
import type { DailyFortune } from "./fortuneTypes";
import { getDateLabel } from "./fortuneUtils";

const FOCUSABLE_SELECTOR =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

export function FortuneExperience() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(true);
  const [result, setResult] = useState<DailyFortune | null>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const drawingTimerRef = useRef<number | null>(null);

  const closeFortune = useCallback(() => {
    if (drawingTimerRef.current !== null) {
      window.clearTimeout(drawingTimerRef.current);
      drawingTimerRef.current = null;
    }

    setIsOpen(false);
    window.requestAnimationFrame(() => openButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeFortune();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeFortune, isOpen]);

  useEffect(() => {
    return () => {
      if (drawingTimerRef.current !== null) {
        window.clearTimeout(drawingTimerRef.current);
      }
    };
  }, []);

  function openFortune() {
    const dailyFortune = getDailyFortune(localStorage);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (drawingTimerRef.current !== null) {
      window.clearTimeout(drawingTimerRef.current);
    }

    setResult(dailyFortune);
    setIsDrawing(true);
    setIsOpen(true);

    drawingTimerRef.current = window.setTimeout(
      () => {
        setIsDrawing(false);
        drawingTimerRef.current = null;
      },
      reduceMotion ? 0 : 1050,
    );
  }

  const fortune = getFortuneById(result?.fortuneId);

  return (
    <>
      <FortuneButton buttonRef={openButtonRef} onClick={openFortune} />

      {isOpen &&
        result &&
        createPortal(
          <FortuneModal
            closeButtonRef={closeButtonRef}
            dateLabel={getDateLabel()}
            fortune={fortune}
            isDrawing={isDrawing}
            modalRef={modalRef}
            onClose={closeFortune}
            result={result}
          />,
          document.body,
        )}
    </>
  );
}
