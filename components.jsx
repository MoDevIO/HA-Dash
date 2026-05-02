/* global React */
const { useState, useEffect, useRef, useCallback } = React;

// ============== ICONS (simple line icons) ==============
const Icon = ({ name, size = 14 }) => {
  const s = {
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const paths = {
    home: (
      <>
        <path d="M3 10l7-6 7 6v8a1 1 0 0 1-1 1h-3v-5h-6v5H4a1 1 0 0 1-1-1z" />
      </>
    ),
    bulb: (
      <>
        <path d="M9 17h4M8 14a4 4 0 1 1 6 0c-.7.5-1 1.5-1 2.3V18h-4v-1.7c0-.8-.3-1.8-1-2.3z" />
      </>
    ),
    plug: (
      <>
        <path d="M9 4v4M13 4v4M7 8h8v3a4 4 0 0 1-8 0zM11 15v4" />
      </>
    ),
    music: (
      <>
        <path d="M8 16V4l9-1v12M8 16a2 2 0 1 1-2-2 2 2 0 0 1 2 2zM17 15a2 2 0 1 1-2-2 2 2 0 0 1 2 2z" />
      </>
    ),
    bolt: (
      <>
        <path d="M11 2L4 12h6l-1 8 7-10h-6z" />
      </>
    ),
    sun: (
      <>
        <circle cx="11" cy="11" r="3.5" />
        <path d="M11 3v2M11 17v2M3 11h2M17 11h2M5 5l1.5 1.5M15.5 15.5L17 17M5 17l1.5-1.5M15.5 6.5L17 5" />
      </>
    ),
    car: (
      <>
        <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h7.2a2 2 0 0 1 1.9 1.5L17 13M3 13v3h2v-1h10v1h2v-3M3 13h14M6 16v1M14 16v1" />
        <circle cx="6.5" cy="13.5" r=".5" />
        <circle cx="13.5" cy="13.5" r=".5" />
      </>
    ),
    vacuum: (
      <>
        <circle cx="11" cy="12" r="6" />
        <circle cx="11" cy="12" r="2" />
        <path d="M11 6v-2" />
      </>
    ),
    user: (
      <>
        <circle cx="11" cy="8" r="3" />
        <path d="M5 18a6 6 0 0 1 12 0" />
      </>
    ),
    settings: (
      <>
        <circle cx="11" cy="11" r="3" />
        <path d="M11 2v2M11 18v2M2 11h2M18 11h2M5 5l1.5 1.5M15.5 15.5L17 17M5 17l1.5-1.5M15.5 6.5L17 5" />
      </>
    ),
    chart: (
      <>
        <path d="M3 17V8M8 17v-6M13 17v-9M18 17V5" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="13" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="13" width="6" height="6" rx="1" />
        <rect x="13" y="13" width="6" height="6" rx="1" />
      </>
    ),
    cam: (
      <>
        <rect x="3" y="6" width="11" height="10" rx="1" />
        <path d="M14 9l5-2v8l-5-2" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="9" width="14" height="9" rx="1" />
        <path d="M7 9V6a4 4 0 0 1 8 0v3" />
      </>
    ),
    search: (
      <>
        <circle cx="9" cy="9" r="5" />
        <path d="M13 13l4 4" />
      </>
    ),
    pause: (
      <>
        <rect x="6" y="4" width="3" height="14" />
        <rect x="13" y="4" width="3" height="14" />
      </>
    ),
    play: (
      <>
        <path d="M6 4l12 7-12 7z" fill="currentColor" />
      </>
    ),
    skipNext: (
      <>
        <path d="M5 4l9 7-9 7zM16 4v14" />
      </>
    ),
    skipPrev: (
      <>
        <path d="M17 4L8 11l9 7zM6 4v14" />
      </>
    ),
    volume: (
      <>
        <path d="M4 8v4h3l4 3V5L7 8zM14 7a4 4 0 0 1 0 8M16 5a7 7 0 0 1 0 12" />
      </>
    ),
    arrowR: (
      <>
        <path d="M5 11h12M13 7l4 4-4 4" />
      </>
    ),
    bath: (
      <>
        <path d="M3 11h16v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM5 11V6a2 2 0 0 1 4 0M17 17v2M5 17v2" />
      </>
    ),
    bed: (
      <>
        <path d="M3 16v-3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 16h16M3 16v2M19 16v2M7 11V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />
      </>
    ),
    chefhat: (
      <>
        <path d="M6 12a3 3 0 1 1 1.5-5.6 4 4 0 0 1 7 0A3 3 0 1 1 16 12zM6 12v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4" />
      </>
    ),
    sofa: (
      <>
        <path d="M3 13v3M19 13v3M3 14h16M5 13V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5M5 13a2 2 0 0 0-2 2M17 13a2 2 0 0 1 2 2" />
      </>
    ),
    fire: (
      <>
        <path d="M11 18a5 5 0 0 1-5-5c0-3 2.5-5 4-9 1 4 5 5 5 9a4 4 0 0 1-4 5z" />
      </>
    ),
    door: (
      <>
        <path d="M5 3h12v18H5zM14 11v2" />
      </>
    ),
    stairs: (
      <>
        <path d="M3 17h4v-3h4v-3h4V8h4" />
      </>
    ),
    desk: (
      <>
        <path d="M3 7h16M3 7v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7M5 12v7M17 12v7M9 7V4h4v3" />
      </>
    ),
    table: (
      <>
        <path d="M3 9h16M5 9v8M17 9v8M3 9l2-3h12l2 3" />
      </>
    ),
    kid: (
      <>
        <circle cx="11" cy="7" r="2.5" />
        <path d="M7 18v-4a4 4 0 0 1 8 0v4" />
      </>
    ),
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ico"
      style={{ width: size, height: size, ...s }}
    >
      {paths[name] || null}
    </svg>
  );
};

// ============== TOGGLE ==============
const Toggle = ({ on, onChange }) => (
  <button
    className={`toggle ${on ? "on" : ""}`}
    onClick={() => onChange(!on)}
    aria-pressed={on}
  />
);

// ============== DIMMER ==============
const Dimmer = ({ value, onChange, disabled }) => {
  const ref = useRef();
  const dragging = useRef(false);
  const [local, setLocal] = useState(value);

  // Sync from prop only when not dragging (so HA poll doesn't jump the thumb)
  useEffect(() => {
    if (!dragging.current) setLocal(value);
  }, [value]);

  const calc = (clientX) => {
    if (!ref.current) return local;
    const r = ref.current.getBoundingClientRect();
    return Math.round(
      Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)),
    );
  };

  const onDown = (e) => {
    if (disabled) return;
    dragging.current = true;
    setLocal(calc(e.touches ? e.touches[0].clientX : e.clientX));
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      e.preventDefault();
      setLocal(calc(e.touches ? e.touches[0].clientX : e.clientX));
    };
    const up = (e) => {
      if (!dragging.current) return;
      dragging.current = false;
      const v = calc(
        e.changedTouches ? e.changedTouches[0].clientX : e.clientX,
      );
      setLocal(v);
      onChange(v); // fire HA only on release
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [onChange]);

  return (
    <div className="dimmer">
      <div className="dim-row">
        <span className="dim-label">Brightness</span>
        <span className="dim-val">{local}%</span>
      </div>
      <div
        className="dim-track"
        ref={ref}
        onMouseDown={onDown}
        onTouchStart={onDown}
      >
        <div className="dim-fill" style={{ width: `${local}%` }} />
        <div className="dim-thumb" style={{ left: `${local}%` }} />
      </div>
    </div>
  );
};

Object.assign(window, { Icon, Toggle, Dimmer });
