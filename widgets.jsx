/* global React, Icon, Toggle, Dimmer */
const {
  useState: useStateW,
  useEffect: useEffectW,
  useMemo,
  useRef: useRefW,
} = React;

// ============== ENERGY FLOW (cross: Solar top, Battery left, Grid right, Car bottom) ==============
// Compact layout: labels sit right next to the lines, dots fade in/out
const EnergyFlow4 = ({
  solar = null,
  grid = null,
  battery = null,
  batteryFlow = null,
  home = null,
  evPct = null,
  evFlow = null,
  span = "col-6",
}) => {
  if (solar === null)
    return (
      <div
        className={`card ${span}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 220,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <div style={{ marginBottom: 10, fontSize: 20 }}>○</div>Connecting to
          Home Assistant…
        </div>
      </div>
    );
  // SVG coordinate system — house is centered, lines are short so labels land close
  const W = 500,
    H = 240,
    cx = 250,
    cy = 120;
  const hw = 44; // half house width/height

  // Line endpoints (node side — where label sits)
  const solarEnd = { x: cx, y: 8 };
  const carEnd = { x: cx, y: H - 8 };
  const batEnd = { x: 8, y: cy };
  const gridEnd = { x: W - 8, y: cy };

  // Line endpoints (house side)
  const hTop = { x: cx, y: cy - hw };
  const hBot = { x: cx, y: cy + hw };
  const hLeft = { x: cx - hw, y: cy };
  const hRight = { x: cx + hw, y: cy };

  // Helper: animated dot with fade-in/out
  const FlowDot = ({ path, dur, begin, dashed }) => (
    <circle r="2.5" fill="var(--text)">
      <animateMotion
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        path={path}
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.12;0.82;1"
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
      />
    </circle>
  );

  const solarPath = `M ${solarEnd.x} ${solarEnd.y} L ${hTop.x} ${hTop.y}`;
  const carPath = `M ${hBot.x} ${hBot.y} L ${carEnd.x} ${carEnd.y}`;
  const batPath = `M ${hLeft.x} ${hLeft.y} L ${batEnd.x} ${batEnd.y}`;
  const gridPath = `M ${hRight.x} ${hRight.y} L ${gridEnd.x} ${gridEnd.y}`;

  return (
    <div className={`card ${span}`}>
      <div className="card-h">
        <div>
          <div className="card-title">Energy Flow</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6 }}>
            <span style={{ color: "var(--good)" }}>● </span>
            {(() => {
              const parts = [];
              if (solar !== null && home !== null) {
                if (solar >= home) parts.push("solar covers full consumption");
                else
                  parts.push(
                    `${solar.toFixed(1)} kW solar · ${(home - solar).toFixed(1)} kW from grid`,
                  );
              }
              if (batteryFlow !== null) {
                if (batteryFlow > 0.05) parts.push("battery charging");
                else if (batteryFlow < -0.05) parts.push("battery discharging");
              }
              if (grid !== null && grid > 0.05)
                parts.push(`${grid.toFixed(1)} kW exporting`);
              else if (grid !== null && grid < -0.05)
                parts.push(`${Math.abs(grid).toFixed(1)} kW importing`);
              return parts.join(" · ") || "calculating…";
            })()}
          </div>
        </div>
        <div className="card-sub">LIVE</div>
      </div>

      {/* Compact cross — constrained width so card doesn't stretch */}
      <div
        style={{
          maxWidth: 560,
          margin: "20px auto 8px",
          display: "grid",
          gridTemplateColumns: "1fr 160px 1fr",
          gridTemplateRows: "auto 160px auto",
          alignItems: "center",
        }}
      >
        {/* Row 1: Solar (top center) */}
        <div />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: 6,
          }}
        >
          <div className="ef-label">
            <Icon name="sun" size={12} /> SOLAR
          </div>
          <div className="ef-val">
            {solar !== null ? solar.toFixed(1) : "–"}
            <span className="unit">{solar !== null ? "kW" : ""}</span>
          </div>
          <div className="ef-sub">producing · 4.8 kWp</div>
        </div>
        <div />

        {/* Row 2: Battery | SVG cross | Grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            paddingRight: 14,
            gap: 2,
          }}
        >
          <div className="ef-label" style={{ flexDirection: "row-reverse" }}>
            BATTERY <Icon name="plug" size={12} />
          </div>
          <div className="ef-val">
            {battery !== null ? battery : "–"}
            <span className="unit">{battery !== null ? "%" : ""}</span>
          </div>
          <div className="ef-sub" style={{ textAlign: "right" }}>
            {batteryFlow === null
              ? ""
              : Math.abs(batteryFlow) < 0.05
                ? "standby"
                : `${batteryFlow >= 0 ? "charging · +" : "discharging · "}${Math.abs(batteryFlow).toFixed(1)} kW`}
          </div>
        </div>

        {/* SVG cross: lines + animated dots + house box */}
        <div
          style={{
            position: "relative",
            width: 160,
            height: 160,
            flexShrink: 0,
          }}
        >
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            style={{ position: "absolute", inset: 0 }}
          >
            <line
              x1="80"
              y1="0"
              x2="80"
              y2="47"
              stroke="var(--border-strong)"
              strokeWidth="1.2"
            />
            <line
              x1="80"
              y1="113"
              x2="80"
              y2="160"
              stroke="var(--border-strong)"
              strokeWidth="1.2"
            />
            <line
              x1="0"
              y1="80"
              x2="47"
              y2="80"
              stroke="var(--border-strong)"
              strokeWidth="1.2"
            />
            <line
              x1="113"
              y1="80"
              x2="160"
              y2="80"
              stroke="var(--border-strong)"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {solar > 0.05 &&
              [0, 0.9, 1.8].map((b, i) => (
                <FlowDot
                  key={`s${i}`}
                  path="M 80 0 L 80 47"
                  dur={2.4}
                  begin={b}
                />
              ))}
            {batteryFlow !== null &&
              Math.abs(batteryFlow) > 0.05 &&
              [0, 1.5].map((b, i) => (
                <FlowDot
                  key={`b${i}`}
                  path={batteryFlow >= 0 ? "M 47 80 L 0 80" : "M 0 80 L 47 80"}
                  dur={2.8}
                  begin={b}
                />
              ))}
            {evFlow !== null &&
              evFlow > 0.05 &&
              [0, 1.4].map((b, i) => (
                <FlowDot
                  key={`c${i}`}
                  path="M 80 113 L 80 160"
                  dur={2.6}
                  begin={b}
                />
              ))}
            {grid !== null &&
              Math.abs(grid) > 0.05 &&
              [0, 1.2].map((b, i) => (
                <FlowDot
                  key={`g${i}`}
                  path="M 113 80 L 160 80"
                  dur={2.6}
                  begin={b}
                />
              ))}

            <rect
              x="47"
              y="47"
              width="66"
              height="66"
              rx="13"
              fill="var(--surface-0)"
              stroke="var(--border-strong)"
              strokeWidth="1"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="home" size={24} />
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-3)",
                marginTop: 4,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {home !== null ? home.toFixed(1) + " kW" : "–"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            paddingLeft: 14,
            gap: 2,
          }}
        >
          <div className="ef-label">
            GRID <Icon name="bolt" size={12} />
          </div>
          <div className="ef-val" style={{ color: "var(--text-3)" }}>
            {grid !== null ? grid.toFixed(1) : "–"}
            <span className="unit">{grid !== null ? "kW" : ""}</span>
          </div>
          <div className="ef-sub">
            {grid !== null
              ? Math.abs(grid) < 0.05
                ? "idle"
                : grid < 0
                  ? `importing ${Math.abs(grid).toFixed(1)} kW`
                  : `exporting ${grid.toFixed(1)} kW`
              : ""}
          </div>
        </div>

        {/* Row 3: Car (bottom center) */}
        <div />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 6,
          }}
        >
          <div className="ef-label">
            <Icon name="car" size={12} /> EV
          </div>
          <div className="ef-val">
            {evPct !== null ? evPct : "–"}
            <span className="unit">{evPct !== null ? "%" : ""}</span>
          </div>
          <div className="ef-sub">
            {evFlow !== null && evFlow > 0.05
              ? `charging · +${evFlow.toFixed(1)} kW`
              : evPct !== null
                ? "not charging"
                : ""}
          </div>
        </div>
        <div />
      </div>
    </div>
  );
};

// ============== TODAY'S ENERGY SUMMARY ==============
const EnergyTodayCard = ({
  span = "col-6",
  solarToday = null,
  consumedToday = null,
  exportedToday = null,
}) => {
  const f = (v, d = 1) => (v === null ? "–" : v.toFixed(d));
  const co2 = solarToday !== null ? (solarToday * 0.385).toFixed(1) : "–";
  const eur =
    solarToday !== null && exportedToday !== null
      ? (exportedToday * 0.08 + solarToday * 0.35).toFixed(2)
      : "–";
  const stats = [
    {
      label: "Solar today",
      value: f(solarToday),
      unit: "kWh",
      sub: solarToday !== null ? "" : "–",
      icon: "sun",
      good: true,
    },
    {
      label: "Consumed",
      value: f(consumedToday),
      unit: "kWh",
      sub:
        consumedToday !== null
          ? "avg " + (consumedToday / 24).toFixed(2) + " kW/h"
          : "–",
      icon: "home",
      good: false,
    },
    {
      label: "Exported",
      value: f(exportedToday),
      unit: "kWh",
      sub: "fed into grid",
      icon: "plug",
      good: true,
    },
    {
      label: "CO\u2082 saved",
      value: co2,
      unit: "kg",
      sub: eur !== "–" ? "\u2248 \u20ac" + eur + " saved today" : "–",
      icon: "bolt",
      good: true,
    },
  ];
  // Sparkline: real HA history for sensor.foxess_pv_power, bucketed into hourly averages
  const [spark, setSparkW] = useStateW(new Array(24).fill(0));
  useEffectW(() => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    fetch(
      `/api/history/period/${midnight.toISOString()}?filter_entity_id=sensor.foxess_pv_power&minimal_response=true`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (!data || !data[0] || !data[0].length) return;
        const buckets = new Array(24)
          .fill(null)
          .map(() => ({ sum: 0, count: 0 }));
        data[0].forEach(({ state, last_changed }) => {
          const v = parseFloat(state);
          if (isNaN(v) || v < 0) return;
          const h = new Date(last_changed).getHours();
          buckets[h].sum += v;
          buckets[h].count++;
        });
        setSparkW(
          buckets.map(({ sum, count }) => (count > 0 ? sum / count : 0)),
        );
      })
      .catch(() => {});
  }, []);
  const smax = Math.max(...spark, 0.01);
  return (
    <div
      className={`card ${span}`}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div className="card-h">
        <div className="card-title">Today</div>
        <div className="card-sub">
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}
        </div>
      </div>
      {/* 2x2 stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-3)",
                marginBottom: 6,
              }}
            >
              <Icon name={s.icon} size={11} />
              {s.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: s.good ? "var(--text)" : "var(--text-2)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s.value}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                {s.unit}
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-4)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: 3,
              }}
            >
              {s.sub}
            </div>
          </div>
        ))}
      </div>
      {/* Solar sparkline */}
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          Solar · hourly
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 2,
            height: 48,
          }}
        >
          {spark.map((v, i) => {
            const now = new Date().getHours();
            const past = i <= now;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: past ? "var(--text)" : "var(--surface-3)",
                  borderRadius: "2px 2px 0 0",
                  height: `${(v / smax) * 100}%`,
                  minHeight: v > 0 ? 2 : 0,
                  opacity: i === now ? 1 : past ? 0.7 : 0.3,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--text-4)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginTop: 4,
          }}
        >
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>now</span>
        </div>
      </div>
    </div>
  );
};

// ============== ENERGY CHART ==============
const EnergyChart = ({ span = "col-12" }) => {
  const data = [
    12, 18, 22, 30, 42, 58, 68, 72, 75, 78, 72, 64, 55, 48, 42, 38, 32, 28, 22,
    18, 14, 10, 8, 6,
  ];
  const max = Math.max(...data);
  return (
    <div className={`card ${span}`}>
      <div className="card-h">
        <div>
          <div className="card-title">Production · 24h</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
            28.4 kWh today{" "}
            <span style={{ color: "var(--text-3)" }}>
              · peak 4.2 kW @ 13:20
            </span>
          </div>
        </div>
        <div className="card-sub">PV</div>
      </div>
      <div className="chart" style={{ height: 140 }}>
        {data.map((v, i) => (
          <div key={i} className="chart-bar">
            <div
              className="pos"
              style={{
                height: `${(v / max) * 100}%`,
                opacity: i > 16 ? 0.4 : 1,
              }}
            />
          </div>
        ))}
      </div>
      <div className="chart-axis">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>now</span>
      </div>
    </div>
  );
};

// ============== ENERGY METRIC CARD ==============
const EnergyMetric = ({
  label,
  icon,
  value,
  unit,
  sub,
  accent,
  span = "col-3",
}) => (
  <div className={`card ${span}`}>
    <div className="card-h">
      <div className="card-title">{label}</div>
      {accent && (
        <span className="chip live">
          <span className="dot" />
          {accent}
        </span>
      )}
    </div>
    <div
      style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}
    >
      <span
        style={{
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: "-0.025em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 14, color: "var(--text-3)" }}>{unit}</span>
    </div>
    <div
      style={{
        fontSize: 11,
        color: "var(--text-3)",
        fontFamily: "var(--font-mono)",
        marginTop: 6,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {sub}
    </div>
  </div>
);

// ============== LIGHT CAPABILITY HELPERS ==============
const supportsColor = (modes = []) =>
  modes.some((m) => ["xy", "hs", "rgb", "rgbw", "rgbww"].includes(m));
const supportsColorTemp = (modes = []) => modes.includes("color_temp");
const supportsBrightness = (modes = []) => modes.some((m) => m !== "onoff");

const prettyName = (entity) =>
  entity.attributes?.friendly_name ||
  entity.entity_id
    .split(".")[1]
    .replace(/_\d+$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Generic slider: renders a visual track + invisible range input, calls onRelease only on mouse/touch up
const SliderControl = ({
  label,
  value,
  unit,
  min,
  max,
  trackBg,
  onChange,
  onRelease,
}) => (
  <div>
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: "var(--text-4)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 5,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>{label}</span>
      <span>
        {value}
        {unit}
      </span>
    </div>
    <div style={{ position: "relative", height: 18 }}>
      <div
        style={{
          position: "absolute",
          inset: "5px 0",
          borderRadius: 4,
          background: trackBg,
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          margin: 0,
        }}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={(e) => onRelease(Number(e.target.value))}
        onTouchEnd={(e) => onRelease(Number(e.currentTarget.value))}
      />
    </div>
  </div>
);

// ============== HA LIGHT ROW (real entity, capability-aware) ==============
const HALightRow = ({ entity, callService }) => {
  const modes = entity.attributes?.supported_color_modes || [];
  const hasColor = supportsColor(modes);
  const hasTemp = supportsColorTemp(modes) && !hasColor;
  const hasBright = supportsBrightness(modes);
  const isUnavail = entity.state === "unavailable";
  const isOn = entity.state === "on";
  const name = prettyName(entity);
  const brightness = entity.attributes?.brightness
    ? Math.round(entity.attributes.brightness / 2.55)
    : 50;
  const minMireds = entity.attributes?.min_mireds || 153;
  const maxMireds = entity.attributes?.max_mireds || 500;
  const ctInit = entity.attributes?.color_temp || minMireds;
  const hsColor = entity.attributes?.hs_color;
  const hueInit = hsColor?.[0] || 0;
  const satInit = hsColor?.[1] ?? 100;

  const [localOn, setLocalOn] = useStateW(isOn);
  const [localBright, setLocalBright] = useStateW(brightness);
  const [localHue, setLocalHue] = useStateW(hueInit);
  const [localSat, setLocalSat] = useStateW(satInit);
  const [localTemp, setLocalTemp] = useStateW(ctInit);

  useEffectW(() => {
    setLocalOn(isOn);
  }, [isOn]);
  useEffectW(() => {
    if (brightness) setLocalBright(brightness);
  }, [brightness]);

  // keep a ref so the onRelease callbacks always see the latest sibling value
  const hueRef = useRefW(localHue);
  const satRef = useRefW(localSat);
  useEffectW(() => {
    hueRef.current = localHue;
  }, [localHue]);
  useEffectW(() => {
    satRef.current = localSat;
  }, [localSat]);

  const call = (svc, params = {}) =>
    callService &&
    callService("light", svc, { entity_id: entity.entity_id, ...params });

  const toggle = (v) => {
    setLocalOn(v);
    call(v ? "turn_on" : "turn_off");
  };
  const applyDim = (v) => call("turn_on", { brightness_pct: v });
  const applyHue = (v) => call("turn_on", { hs_color: [v, satRef.current] });
  const applySat = (v) => call("turn_on", { hs_color: [hueRef.current, v] });
  const applyTemp = (v) => call("turn_on", { color_temp: v });

  const showControls =
    localOn && !isUnavail && (hasBright || hasTemp || hasColor);

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        paddingTop: 10,
        marginTop: 2,
        opacity: isUnavail ? 0.35 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: showControls ? 10 : 0,
        }}
      >
        <div className="l-info" style={{ flex: 1 }}>
          <div className="l-name">{name}</div>
          <div className="l-meta">
            {isUnavail
              ? "unavailable"
              : localOn
                ? hasBright
                  ? `${localBright}%`
                  : "on"
                : "off"}
          </div>
        </div>
        <Toggle on={localOn && !isUnavail} onChange={toggle} />
      </div>
      {showControls && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {hasBright && (
            <SliderControl
              label="Brightness"
              value={localBright}
              unit="%"
              min={1}
              max={100}
              trackBg={`linear-gradient(to right, var(--text) ${localBright}%, var(--surface-3) ${localBright}%)`}
              onChange={setLocalBright}
              onRelease={applyDim}
            />
          )}
          {hasTemp && (
            <SliderControl
              label="Color Temp"
              value={localTemp}
              unit=" mired"
              min={minMireds}
              max={maxMireds}
              trackBg="linear-gradient(to right, #b4d4ff, #ffffff, #ffcc70)"
              onChange={setLocalTemp}
              onRelease={applyTemp}
            />
          )}
          {hasColor && (
            <SliderControl
              label="Hue"
              value={Math.round(localHue)}
              unit="°"
              min={0}
              max={360}
              trackBg="linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
              onChange={setLocalHue}
              onRelease={applyHue}
            />
          )}
          {hasColor && (
            <SliderControl
              label="Saturation"
              value={Math.round(localSat)}
              unit="%"
              min={0}
              max={100}
              trackBg={`linear-gradient(to right, #888 0%, hsl(${localHue},100%,50%) 100%)`}
              onChange={setLocalSat}
              onRelease={applySat}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ============== HA DEVICE ROW (real entity) ==============
const HADeviceRow = ({ entity, callService }) => {
  const id = entity.entity_id;
  const domain = id.split(".")[0];
  const name =
    entity.attributes?.friendly_name ||
    id
      .split(".")[1]
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const isUnavail = entity.state === "unavailable";
  const call = (svc, params = {}) =>
    callService && callService(domain, svc, { entity_id: id, ...params });

  if (domain === "vacuum") {
    const isRunning = ["cleaning", "sweeping"].includes(entity.state);
    const stateLabel =
      {
        docked: "Docked",
        cleaning: "Cleaning",
        returning: "Returning",
        idle: "Idle",
        error: "Error",
        paused: "Paused",
      }[entity.state] || entity.state;
    const batt = entity.attributes?.battery_level;
    const meta = isUnavail
      ? "unavailable"
      : `${stateLabel}${batt !== undefined ? " · " + batt + "%" : ""}`;
    return (
      <div
        className={`device-row ${isRunning ? "on" : "off"}`}
        style={{
          opacity: isUnavail ? 0.35 : 1,
          flexDirection: "column",
          alignItems: "stretch",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="d-glyph">
            <Icon name="vacuum" size={14} />
          </div>
          <div className="device-info" style={{ flex: 1 }}>
            <div className="device-name">{name}</div>
            <div className="device-meta">{meta}</div>
          </div>
        </div>
        {!isUnavail && (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="btn primary"
              style={{ flex: 1 }}
              onClick={() => call(isRunning ? "pause" : "start")}
            >
              <Icon name={isRunning ? "pause" : "play"} size={10} />{" "}
              {isRunning ? "Pause" : "Start"}
            </button>
            <button className="btn" onClick={() => call("return_to_base")}>
              Dock
            </button>
            <button className="btn" onClick={() => call("clean_spot")}>
              Spot
            </button>
          </div>
        )}
      </div>
    );
  }

  let icon = "plug",
    meta = entity.state,
    on = false;
  if (domain === "media_player") {
    icon = "music";
    const title = entity.attributes?.media_title;
    meta = isUnavail
      ? "unavailable"
      : title
        ? `${entity.state} · ${title}`
        : entity.state;
    on = entity.state === "playing";
  } else if (domain === "climate") {
    icon = "sun";
    const t = entity.attributes?.current_temperature;
    meta = isUnavail
      ? "unavailable"
      : `${entity.state}${t !== undefined ? " · " + t + "°C" : ""}`;
    on = entity.state !== "off" && !isUnavail;
  }
  return (
    <div
      className={`device-row ${on ? "on" : "off"}`}
      style={{ opacity: isUnavail ? 0.35 : 1 }}
    >
      <div className="d-glyph">
        <Icon name={icon} size={14} />
      </div>
      <div className="device-info">
        <div className="device-name">{name}</div>
        <div className="device-meta">{meta}</div>
      </div>
    </div>
  );
};

// ============== FLOOR MASTER CARD ==============
const FloorMaster = ({
  floor,
  name,
  rooms,
  roomState,
  onToggleAll,
  onOpenRoom,
  masterOn,
}) => {
  const onCount = rooms.filter((r) => roomState[r.id]?.on).length;
  return (
    <div className="floor-master">
      <div className="fm-head">
        <div>
          <div className="fm-name">{name}</div>
          <div className="fm-meta">
            {rooms.length} rooms · {onCount} active
          </div>
        </div>
        <Toggle on={masterOn} onChange={onToggleAll} />
      </div>
      <div className="fm-rooms">
        {rooms.map((r) => (
          <button
            key={r.id}
            className={`fm-room-chip ${roomState[r.id]?.on ? "on" : ""}`}
            onClick={() => onOpenRoom(r.id)}
          >
            {r.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============== ROOM MODAL (real entities only) ==============
const RoomModal = ({
  room,
  state,
  onClose,
  onToggle,
  onDim,
  haStates = {},
  callService,
  roomLightIds = [],
  roomDeviceIds = [],
}) => {
  if (!room) return null;
  const haLoaded = Object.keys(haStates).length > 0;
  const lights = roomLightIds.map((id) => haStates[id]).filter(Boolean);
  const devices = roomDeviceIds.map((id) => haStates[id]).filter(Boolean);
  const anyBright = lights.some((l) =>
    supportsBrightness(l.attributes?.supported_color_modes),
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>
            <div className="modal-title">
              <span
                style={{ color: state?.on ? "var(--text)" : "var(--text-3)" }}
              >
                <Icon name={room.icon} size={22} />
              </span>
              {room.name}
            </div>
            <div className="modal-sub">
              {haLoaded
                ? `${lights.length} lights · ${devices.length} devices`
                : "connecting…"}{" "}
              · {room.sensor}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {!haLoaded ? (
            <div
              style={{
                textAlign: "center",
                padding: "52px 0",
                color: "var(--text-3)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Connecting to Home Assistant…
            </div>
          ) : (
            <>
              {/* Master toggle + optional brightness dimmer */}
              <div className="modal-section">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="modal-section-title">Master</div>
                  <Toggle
                    on={state?.on}
                    onChange={(v) => onToggle(room.id, v)}
                  />
                </div>
                {anyBright && (
                  <Dimmer
                    value={state?.brightness || 0}
                    onChange={(v) => onDim(room.id, v)}
                    disabled={!state?.on}
                  />
                )}
              </div>

              {/* Real lights */}
              {lights.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">
                    Lights · {lights.length}
                  </div>
                  {lights.map((l) => (
                    <HALightRow
                      key={l.entity_id}
                      entity={l}
                      callService={callService}
                    />
                  ))}
                </div>
              )}

              {/* Real devices */}
              {devices.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">
                    Devices · {devices.length}
                  </div>
                  {devices.map((d) => (
                    <HADeviceRow
                      key={d.entity_id}
                      entity={d}
                      callService={callService}
                    />
                  ))}
                </div>
              )}

              {lights.length === 0 && devices.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "var(--text-3)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  No entities mapped for this room
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============== MEDIA NOW PLAYING (compact) ==============
const formatTime = (s) => {
  s = Math.max(0, Math.round(s));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
};

// Shared hook: ticks every second so progress bar stays live
const useMediaProgress = (player) => {
  const [tick, setTick] = useStateW(0);
  useEffectW(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  if (!player) return { pos: 0, dur: 1, pct: 0 };
  const attr = player.attributes || {};
  const base = attr.media_position || 0;
  const updatedAt = attr.media_position_updated_at
    ? new Date(attr.media_position_updated_at).getTime()
    : Date.now();
  const elapsed =
    player.state === "playing"
      ? Math.max(0, (Date.now() - updatedAt) / 1000)
      : 0;
  const dur = attr.media_duration || 1;
  const pos = Math.min(dur, Math.max(0, base + elapsed));
  return { pos, dur, pct: Math.min(100, (pos / dur) * 100) };
};

// Fetches live MA queue data for a player (current_item + elapsed_time)
const useMAQueue = (player) => {
  const [q, setQ] = useStateW(null);
  const isMA = player?.attributes?.source === "Music Assistant Queue";
  useEffectW(() => {
    if (!player || !isMA) {
      setQ(null);
      return;
    }
    const load = () =>
      fetch(`/ma-queue?entity_id=${encodeURIComponent(player.entity_id)}`)
        .then((r) => r.json())
        .then(setQ)
        .catch(() => {});
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [player?.entity_id, isMA]);
  return q;
};

const haCall = (callService, player, svc, extra = {}) =>
  callService &&
  callService("media_player", svc, { entity_id: player.entity_id, ...extra });

const useSeek = (player, dur, callService) => {
  const seekRef = useRefW(null); // { target, at }
  const { pos: haPos, pct: haPct } = useMediaProgress(player);

  let pos = haPos,
    pct = haPct;
  if (seekRef.current) {
    const elapsed =
      player?.state === "playing"
        ? (Date.now() - seekRef.current.at) / 1000
        : 0;
    const sp = Math.min(dur, seekRef.current.target + elapsed);
    // Clear once HA catches up (media_position within 3s of target)
    const haPos2 = player?.attributes?.media_position || 0;
    if (Math.abs(haPos2 - seekRef.current.target) < 3) seekRef.current = null;
    else {
      pos = sp;
      pct = Math.min(100, (sp / dur) * 100);
    }
  }

  const seekClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const target = Math.round(((e.clientX - r.left) / r.width) * dur);
    seekRef.current = { target, at: Date.now() };
    callService &&
      callService("media_player", "media_seek", {
        entity_id: player.entity_id,
        seek_position: target,
      });
  };
  return { pos, pct, seekClick };
};

const useQueueProgress = (player, q) => {
  const [tick, setTick] = useStateW(0);
  useEffectW(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  // Prefer MA queue elapsed_time (accurate), fall back to HA attributes
  const dur =
    q?.current_item?.duration || player?.attributes?.media_duration || 1;
  const basePos = q
    ? (q.elapsed_time ?? 0)
    : player?.attributes?.media_position || 0;
  const baseTime = q
    ? Date.now()
    : player?.attributes?.media_position_updated_at
      ? new Date(player.attributes.media_position_updated_at).getTime()
      : Date.now();
  const elapsed =
    player?.state === "playing"
      ? Math.max(0, (Date.now() - baseTime) / 1000)
      : 0;
  const pos = q
    ? Math.min(dur, basePos + elapsed)
    : Math.min(dur, Math.max(0, basePos + elapsed));
  return { pos, dur, pct: Math.min(100, (pos / dur) * 100) };
};

const MediaNowPlaying = ({ player, callService, span = "col-12" }) => {
  const q = useMAQueue(player);
  const { pos, dur, pct } = useQueueProgress(player, q);
  const {
    pos: seekPos,
    pct: seekPct,
    seekClick,
  } = useSeek(player, dur, callService);
  if (!player) return null;
  const attr = player.attributes || {};
  const cur = q?.current_item?.media_item;
  const isPlaying = player.state === "playing";
  const call = (svc, extra) => haCall(callService, player, svc, extra);
  const title = cur?.name || attr.media_title || "—";
  const artist =
    cur?.artists?.[0]?.name || attr.media_artist || attr.media_album_name || "";
  const image = cur?.image || attr.entity_picture;
  const displayPos = seekPct != null ? seekPos : pos;
  const displayPct = seekPct != null ? seekPct : pct;
  return (
    <div className={`card ${span}`}>
      <div className="card-h">
        <div className="card-title">{attr.friendly_name || "Now Playing"}</div>
        <span className={`chip ${isPlaying ? "live" : ""}`}>
          <span className="dot" />
          {isPlaying ? "Playing" : "Paused"}
        </span>
      </div>
      <div className="media">
        {image ? (
          <img
            src={image}
            style={{
              width: 72,
              height: 72,
              borderRadius: 8,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div className="album" />
        )}
        <div className="media-info">
          <div className="media-track">{title}</div>
          <div className="media-artist">{artist}</div>
          <div className="media-progress" onClick={seekClick}>
            <div
              className="media-progress-fill"
              style={{ width: `${displayPct}%` }}
            />
          </div>
          <div className="media-times">
            <span>{formatTime(displayPos)}</span>
            <span>–{formatTime(Math.max(0, dur - displayPos))}</span>
          </div>
        </div>
        <div className="media-controls">
          <button
            className="m-btn"
            onClick={() => call("media_previous_track")}
          >
            <Icon name="skipPrev" size={14} />
          </button>
          <button
            className="m-btn play"
            onClick={() => call(isPlaying ? "media_pause" : "media_play")}
          >
            <Icon name={isPlaying ? "pause" : "play"} size={12} />
          </button>
          <button className="m-btn" onClick={() => call("media_next_track")}>
            <Icon name="skipNext" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== MEDIA PAGE: Player + Zones + Playlists ==============
const ZoneRow = ({ player, callService }) => {
  const attr = player.attributes || {};
  const haVol = Math.round((attr.volume_level || 0) * 100);
  const isActive = player.state === "playing" || player.state === "paused";
  const [local, setLocal] = useStateW(haVol);
  const dragging = useRefW(false);
  const pendingUntil = useRefW(0);
  const barRef = useRefW();

  // Sync from HA only when not dragging AND no pending command
  useEffectW(() => {
    if (!dragging.current && Date.now() > pendingUntil.current) setLocal(haVol);
  }, [haVol]);

  const calc = (clientX) => {
    if (!barRef.current) return local;
    const r = barRef.current.getBoundingClientRect();
    return Math.round(
      Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)),
    );
  };
  const onDown = (e) => {
    dragging.current = true;
    setLocal(calc(e.touches ? e.touches[0].clientX : e.clientX));
  };
  useEffectW(() => {
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
      pendingUntil.current = Date.now() + 5000; // block HA poll from overwriting for 5s
      callService &&
        callService("media_player", "volume_set", {
          entity_id: player.entity_id,
          volume_level: v / 100,
        });
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
  }, [callService, player.entity_id]);

  const toggle = (on) =>
    callService &&
    callService("media_player", on ? "media_play" : "media_pause", {
      entity_id: player.entity_id,
    });
  return (
    <div className={`zone-row ${isActive ? "" : "off"}`}>
      <span className="name">{attr.friendly_name || player.entity_id}</span>
      <div
        className="vol"
        ref={barRef}
        onMouseDown={onDown}
        onTouchStart={onDown}
      >
        <div className="vol-fill" style={{ width: `${local}%` }} />
      </div>
      <span className="vol-pct">{local}</span>
    </div>
  );
};

const MediaFullPlayer = ({ player, callService, span = "col-12" }) => {
  const q = useMAQueue(player);
  const { pos, dur, pct } = useQueueProgress(player, q);
  const {
    pos: seekPos,
    pct: seekPct,
    seekClick,
  } = useSeek(player, dur, callService);
  if (!player) return null;
  const attr = player.attributes || {};
  const cur = q?.current_item?.media_item;
  const isPlaying = player.state === "playing";
  const call = (svc, extra) => haCall(callService, player, svc, extra);
  const title = cur?.name || attr.media_title || "—";
  const artist =
    cur?.artists?.[0]?.name || attr.media_artist || attr.media_album_name || "";
  const image = cur?.image || attr.entity_picture;
  const displayPos = seekPct != null ? seekPos : pos;
  const displayPct = seekPct != null ? seekPct : pct;
  return (
    <div className={`card ${span}`}>
      <div className="card-h">
        <div className="card-title">{attr.friendly_name || "Now Playing"}</div>
        <span className={`chip ${isPlaying ? "live" : ""}`}>
          <span className="dot" />
          {isPlaying ? "Playing" : "Paused"}
        </span>
      </div>
      <div className="media">
        {image ? (
          <img
            src={image}
            style={{
              width: 96,
              height: 96,
              borderRadius: 10,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div className="album" style={{ width: 96, height: 96 }} />
        )}
        <div className="media-info">
          <div className="media-track" style={{ fontSize: 16 }}>
            {title}
          </div>
          <div className="media-artist">{artist}</div>
          <div className="media-progress" onClick={seekClick}>
            <div
              className="media-progress-fill"
              style={{ width: `${displayPct}%` }}
            />
          </div>
          <div className="media-times">
            <span>{formatTime(displayPos)}</span>
            <span>–{formatTime(Math.max(0, dur - displayPos))}</span>
          </div>
        </div>
      </div>
      <div
        className="media-controls"
        style={{ marginTop: 18, justifyContent: "flex-start" }}
      >
        <button className="m-btn" onClick={() => call("media_previous_track")}>
          <Icon name="skipPrev" size={14} />
        </button>
        <button
          className="m-btn play"
          onClick={() => call(isPlaying ? "media_pause" : "media_play")}
        >
          <Icon name={isPlaying ? "pause" : "play"} size={12} />
        </button>
        <button className="m-btn" onClick={() => call("media_next_track")}>
          <Icon name="skipNext" size={14} />
        </button>
      </div>
    </div>
  );
};

const UpNextRow = ({ player }) => {
  const queue = useMAQueue(player);
  const upNext = queue?.next_item;
  const qSize = queue?.items ?? 0;
  const currentId = queue?.current_item?.queue_item_id;
  if (!upNext || upNext.queue_item_id === currentId) return null;
  const attr = player.attributes || {};
  return (
    <div
      style={{
        marginTop: 14,
        borderTop: "1px solid var(--border)",
        paddingTop: 12,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 8,
        }}
      >
        {attr.friendly_name} · Up Next · {qSize} in queue
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {upNext.media_item?.image && (
          <img
            src={upNext.media_item.image}
            style={{
              width: 36,
              height: 36,
              borderRadius: 5,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {upNext.media_item?.name || upNext.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              fontFamily: "var(--font-mono)",
              marginTop: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {upNext.media_item?.artists?.[0]?.name || ""}
            {upNext.media_item?.album?.name
              ? ` · ${upNext.media_item.album.name}`
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaZones = ({ players = [], callService, span = "col-12" }) => {
  const active = players.filter(
    (p) => p.state === "playing" || p.state === "paused",
  ).length;
  const maPlayers = players.filter(
    (p) => p.state === "playing" || p.state === "paused",
  );

  return (
    <div className={`card ${span}`}>
      <div className="card-h">
        <div className="card-title">Players</div>
        <div className="card-sub">
          {active} / {players.length} active
        </div>
      </div>
      <div
        className="zone-list"
        style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}
      >
        {players.length === 0 ? (
          <div
            style={{
              color: "var(--text-3)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
          >
            No players found
          </div>
        ) : (
          players.map((p) => (
            <ZoneRow key={p.entity_id} player={p} callService={callService} />
          ))
        )}
      </div>
      {maPlayers.map((p) => (
        <UpNextRow key={p.entity_id} player={p} />
      ))}
    </div>
  );
};

const MA_PLAYLISTS = [
  {
    id: "pl1",
    name: "Liked Songs",
    meta: "Spotify · ttttttom",
    hue: 340,
    uri: "library://playlist/136",
  },
  {
    id: "pl2",
    name: "Liked Songs",
    meta: "Spotify · Nini",
    hue: 30,
    uri: "library://playlist/172",
  },
  {
    id: "pl3",
    name: "Liked Songs",
    meta: "Spotify · motijo",
    hue: 220,
    uri: "library://playlist/7",
  },
  {
    id: "pl4",
    name: "Discover Weekly",
    meta: "Spotify · ttttttom",
    hue: 280,
    uri: "library://playlist/166",
  },
  {
    id: "pl5",
    name: "Discover Weekly",
    meta: "Spotify · motijo",
    hue: 160,
    uri: "library://playlist/131",
  },
];

const MUSIC_ASSISTANT_URL = "http://192.168.178.23:8095";

const PlaylistGrid = ({
  playingId,
  onPlay,
  players = [],
  callService,
  span = "col-12",
}) => {
  const [pendingPl, setPendingPl] = useStateW(null);
  const [showAll, setShowAll] = useStateW(false);
  const playlists = MA_PLAYLISTS;

  const openMusicAssistant = () => {
    window.open(MUSIC_ASSISTANT_URL, "_blank", "noopener,noreferrer");
  };

  const handlePick = (player) => {
    if (!pendingPl) return;
    callService &&
      callService("music_assistant", "play_media", {
        entity_id: player.entity_id,
        media_id: pendingPl.uri,
        media_type: "playlist",
      });
    onPlay(pendingPl);
    setPendingPl(null);
  };

  const pickable = players.filter((p) => p.state !== "unavailable");
  const list = playlists;
  const visibleList = showAll ? list : list.slice(0, 2);

  return (
    <div className={`card ${span}`}>
      <div className="card-h" style={{ alignItems: "center" }}>
        <div>
          <div className="card-title">Playlists</div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: 4,
            }}
          >
            Music Assistant · {list.length || "…"} playlists
          </div>
        </div>
        <button className="btn" onClick={openMusicAssistant}>
          <Icon name="search" size={11} /> Browse
        </button>
      </div>
      <div
        className="playlist-grid"
        style={{
          marginTop: 14,
          gridTemplateColumns:
            span === "col-6" ? "repeat(2,1fr)" : "repeat(4,1fr)",
        }}
      >
        {visibleList.map((pl) => (
          <button
            key={pl.id}
            className={`pl ${playingId === pl.id ? "playing" : ""} ${pendingPl?.id === pl.id ? "playing" : ""}`}
            onClick={() => {
              if (playingId === pl.id) {
                // Pause all playing players
                players
                  .filter((p) => p.state === "playing")
                  .forEach(
                    (p) =>
                      callService &&
                      callService("media_player", "media_pause", {
                        entity_id: p.entity_id,
                      }),
                  );
                onPlay(pl); // deselect
              } else {
                setPendingPl(pendingPl?.id === pl.id ? null : pl);
              }
            }}
          >
            <div
              className="pl-cover"
              style={{
                background: `linear-gradient(135deg, oklch(0.32 0.08 ${pl.hue}) 0%, oklch(0.18 0.04 ${pl.hue}) 100%)`,
              }}
            >
              <div
                className="pl-play"
                style={{
                  opacity:
                    playingId === pl.id || pendingPl?.id === pl.id
                      ? 1
                      : undefined,
                }}
              >
                <Icon name={playingId === pl.id ? "pause" : "play"} size={12} />
              </div>
            </div>
            <div>
              <div className="pl-name">{pl.name}</div>
              <div className="pl-meta">{pl.meta}</div>
            </div>
          </button>
        ))}
      </div>

      {list.length > 2 && (
        <button
          className="btn"
          style={{ width: "100%", marginTop: 12, justifyContent: "center" }}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : `Show ${list.length - 2} more`}
        </button>
      )}

      {/* Device picker */}
      {pendingPl && (
        <div
          style={{
            marginTop: 18,
            borderTop: "1px solid var(--border)",
            paddingTop: 14,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            Play "{pendingPl.name}" ({pendingPl.meta.split("· ")[1]}) on…
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {pickable.length === 0 ? (
              <div style={{ color: "var(--text-3)", fontSize: 12 }}>
                No players available
              </div>
            ) : (
              pickable.map((p) => (
                <button
                  key={p.entity_id}
                  className="btn primary"
                  onClick={() => handlePick(p)}
                >
                  <Icon name="music" size={11} />{" "}
                  {p.attributes?.friendly_name || p.entity_id.split(".")[1]}
                </button>
              ))
            )}
            <button className="btn" onClick={() => setPendingPl(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== PRESENCE CHIPS ==============
const PresenceChips = ({ people }) => {
  const ppl = people || [
    { name: "Dad", loc: "Living Room", state: "home", initials: "DA" },
    { name: "Mom", loc: "Office", state: "home", initials: "MO" },
    { name: "Mo", loc: "School · 4.2km", state: "away", initials: "MO" },
    { name: "Levin", loc: "Levin\u2019s Room", state: "home", initials: "LE" },
  ];
  return (
    <div className="presence-chips">
      {ppl.map((p, i) => (
        <div className={`p-chip ${p.state}`} key={i}>
          <div className="p-chip-avatar">
            {p.initials}
            <span className={`pin ${p.state}`} />
          </div>
          <div className="p-chip-text">
            <div className="p-chip-name">{p.name}</div>
            <div className="p-chip-loc">{p.loc}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============== VACUUM ==============
const VacuumCard = ({
  span = "col-4",
  vacState = null,
  batteryPct = null,
  lastCleanBegin = null,
  cleaningArea = null,
  cleaningTime = null,
  callService,
  entityId = "vacuum.q5_pro",
}) => {
  if (vacState === null)
    return (
      <div
        className={`card ${span}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 160,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <Icon name="vacuum" size={20} />
          </div>
          Connecting…
        </div>
      </div>
    );
  const isRunning = ["cleaning", "sweeping"].includes(vacState);
  const isPaused = vacState === "paused";
  const stateLabel =
    {
      docked: "Docked",
      cleaning: "Cleaning",
      returning: "Returning",
      idle: "Idle",
      error: "Error",
      paused: "Paused",
      charger_disconnected: "Idle",
    }[vacState] || vacState;
  const call = (svc, params = {}) =>
    callService &&
    callService("vacuum", svc, { entity_id: entityId, ...params });
  const lastCleanDay = lastCleanBegin
    ? (() => {
        const d = new Date(lastCleanBegin);
        const diff = Math.floor((Date.now() - d) / 86400000);
        return diff === 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff}d ago`;
      })()
    : "–";
  const areaStr =
    cleaningArea !== null ? `${Math.round(cleaningArea)} m²` : "–";
  const timeStr =
    cleaningTime !== null ? `${Math.round(cleaningTime)} min` : "–";
  return (
    <div className={`card ${span}`}>
      <div className="card-h">
        <div className="card-title">Dreame Q5 Pro</div>
        <span className={`chip ${isRunning ? "live" : ""}`}>
          <span className="dot" />
          {stateLabel}
        </span>
      </div>
      <div className="vacuum">
        <div className="vacuum-stats">
          <div className="stat">
            <div className="stat-label">Battery</div>
            <div className="stat-val">
              {batteryPct !== null ? batteryPct : "–"}
              <span className="unit">%</span>
            </div>
            {batteryPct !== null && (
              <div className="bar-tiny" style={{ marginTop: 6 }}>
                <div
                  className="bar-tiny-fill"
                  style={{ width: `${batteryPct}%` }}
                />
              </div>
            )}
          </div>
          <div className="stat">
            <div className="stat-label">Last clean</div>
            <div className="stat-val" style={{ fontSize: 14 }}>
              {lastCleanDay}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-3)",
                marginTop: 4,
              }}
            >
              {areaStr} · {timeStr}
            </div>
          </div>
        </div>
        <div className="vac-actions">
          <button
            className="btn primary"
            onClick={() => call(isRunning ? "pause" : "start")}
          >
            <Icon name={isRunning ? "pause" : "play"} size={11} />
            {isRunning ? "Pause" : isPaused ? "Resume" : "Start"}
          </button>
          <button className="btn" onClick={() => call("return_to_base")}>
            Dock
          </button>
          <button className="btn" onClick={() => call("clean_spot")}>
            Spot
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== EV ==============
const EVCard = ({
  span = "col-4",
  evPct = null,
  evRange = null,
  evKw = null,
}) => {
  if (evPct === null)
    return (
      <div
        className={`card ${span}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 160,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <Icon name="car" size={20} />
          </div>
          Connecting…
        </div>
      </div>
    );
  const charging = evKw !== null && evKw > 0;
  return (
    <div className={`card ${span}`}>
      <div className="card-h">
        <div className="card-title">EV · Garage</div>
        <span className={`chip ${charging ? "live" : ""}`}>
          <span className="dot" />
          {charging ? "Charging" : "Idle"}
        </span>
      </div>
      <div className="ev">
        <div className="ev-row">
          <div
            className="ev-circle"
            style={{
              background: `conic-gradient(var(--text) ${evPct * 3.6}deg, var(--surface-3) 0)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 4,
                borderRadius: "50%",
                background: "var(--surface-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="ev-pct">{evPct}%</span>
            </div>
          </div>
          <div className="ev-info">
            <div className="ev-status">
              {charging ? `${evKw.toFixed(1)} kW · charging` : "Not charging"}
            </div>
            <div className="ev-name">VW ID.3</div>
            <div className="ev-eta">
              {evRange !== null ? `${evRange} km range` : "–"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============== QUICK ACTIONS (main page only) ==============
const QuickActions = ({ span = "col-12" }) => {
  const [active, setActive] = useStateW(null);
  const items = [
    {
      id: "stop",
      name: "Stop all music",
      desc: "All zones · silent",
      icon: "pause",
    },
    {
      id: "evening",
      name: "Evening mood",
      desc: "Warm · 30% · fireplace",
      icon: "fire",
    },
    {
      id: "morning",
      name: "Morning mood",
      desc: "Bright · 80% · blinds up",
      icon: "sun",
    },
  ];
  return (
    <div className={`card ${span}`}>
      <div className="card-h">
        <div className="card-title">Quick Actions</div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        {items.map((it) => (
          <button
            key={it.id}
            className={`action-row ${active === it.id ? "active" : ""}`}
            onClick={() => {
              setActive(it.id);
              setTimeout(() => setActive(null), 1200);
            }}
          >
            <span className="action-glyph">
              <Icon name={it.icon} size={14} />
            </span>
            <div className="action-text">
              <div className="action-name">{it.name}</div>
              <div className="action-desc">{it.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, {
  EnergyFlow4,
  EnergyTodayCard,
  EnergyChart,
  EnergyMetric,
  FloorMaster,
  RoomModal,
  MediaNowPlaying,
  MediaFullPlayer,
  MediaZones,
  PlaylistGrid,
  PresenceChips,
  VacuumCard,
  EVCard,
  QuickActions,
});
