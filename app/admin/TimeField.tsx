"use client";

import { useState } from "react";
import { to12h, to24h } from "../lib/time";

/**
 * A clock picker for the admin's result-time fields, replacing the free-text
 * boxes that let "5:0 pm" or "17.00" be typed in and stored.
 *
 * The site stores and renders times as 12-hour strings ("1:30 PM") while
 * `<input type="time">` only speaks 24-hour "HH:MM", so the picker holds the
 * 24-hour value and a hidden input carries the display string the form posts.
 *
 * Works in two modes: pass `name` for a plain form field, or `value` +
 * `onChange` (both in display format) to drive it from parent state.
 */
export default function TimeField({
  name,
  defaultValue = "",
  value,
  onChange,
  className,
  ariaLabel,
}: {
  /** Form field name. Omit when driving the field with `value`/`onChange`. */
  name?: string;
  /** Initial display-format time, e.g. "1:30 PM". */
  defaultValue?: string;
  /** Controlled display-format time. */
  value?: string;
  /** Called with the new display-format time. */
  onChange?: (display: string) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const display = value ?? internal;

  // "" whenever the stored text isn't a time the picker can represent. The
  // hidden input still posts the original text, so an unparseable legacy value
  // survives until someone deliberately picks a new time.
  const picked = to24h(display);

  function handle(next: string) {
    const asDisplay = next ? to12h(next) : "";
    setInternal(asDisplay);
    onChange?.(asDisplay);
  }

  return (
    <>
      <input
        type="time"
        value={picked}
        onChange={(e) => handle(e.target.value)}
        aria-label={ariaLabel}
        className={className}
      />
      {name && <input type="hidden" name={name} value={display} />}
    </>
  );
}
