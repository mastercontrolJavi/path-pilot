import { persona, railSteps } from "../fixtures";
import { mix } from "../lib/anim";
import { RouteLine, RouteNode } from "../components/Route";
import { ArrowLeft, Check, FileText, MapPin } from "../components/Icons";
import { color, radius } from "../tokens";
import { displayStyle, font } from "../fonts";

/**
 * The wizard's CV step (src/components/wizard/cv-step.tsx), at app scale (CSS px).
 * The scene scales it up. `enter` (0–1 per block) drives the 4-frame stagger.
 */
export type UploadState = {
  enter: [number, number, number, number]; // rail, heading, tabs, zone+footer
  dragOver: number; // 0–1
  dropped: boolean;
  line: number; // mini Route draw, 0–1
  ready: number; // "Ready" and the end node, 0–1
  press: number; // Continue pressed, 0–1
};

const fade = (p: number, dy = 10) => ({ opacity: p, transform: `translateY(${dy * (1 - p)}px)` });

export function WizardRail({ enter }: { enter: number }) {
  const step = 38;
  const pts = railSteps.map((_, i) => ({ x: 10, y: 14 + i * step }));
  return (
    <div style={{ position: "relative", width: 230, ...fade(enter) }}>
      <svg width={30} height={pts[pts.length - 1].y + 14} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <RouteLine points={pts} progress={0} width={1.5} track />
        {pts.map((p, i) => (
          <RouteNode key={i} x={p.x} y={p.y} r={5} state={i === 0 ? "current" : "upcoming"} />
        ))}
      </svg>
      {railSteps.map((label, i) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: 30,
            top: 14 + i * step - 11,
            fontFamily: font.sans,
            fontSize: 14,
            lineHeight: "22px",
            color: i === 0 ? color.ink : color.inkMuted,
            fontWeight: i === 0 ? 500 : 400,
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

/** Mobile: the rail collapses to a segmented path with "1/13". */
export function CompactPath({ enter }: { enter: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, ...fade(enter) }}>
      <div style={{ display: "flex", flex: 1, gap: 4 }}>
        {railSteps.map((s, i) => (
          <span key={s} style={{ flex: 1, height: 6, borderRadius: 999, background: i === 0 ? color.blaze : color.fog, boxShadow: i === 0 ? `inset 0 0 0 1px ${color.forestDeep}` : `inset 0 0 0 1px ${color.contour}` }} />
        ))}
      </div>
      <span style={{ fontFamily: font.mono, fontSize: 12, color: color.inkMuted }}>1/{railSteps.length}</span>
    </div>
  );
}

export function CvStep({ s, width = 640 }: { s: UploadState; width?: number }) {
  const [, eHead, eTabs, eZone] = s.enter;
  return (
    <div style={{ width, fontFamily: font.sans, color: color.ink }}>
      <div style={fade(eHead)}>
        <h1 style={{ margin: 0, color: color.ink, ...displayStyle(30, 400), lineHeight: 1.15 }}>Start with your CV</h1>
        <p style={{ margin: "8px 0 0", fontSize: 16, lineHeight: 1.6, color: color.inkMuted }}>We read it to find the experience that transfers.</p>
      </div>

      {/* Tabs (track variant) */}
      <div style={{ marginTop: 32, display: "inline-flex", gap: 4, padding: 4, borderRadius: radius.control + 2, background: color.fog, ...fade(eTabs) }}>
        {["Upload a PDF", "Paste the text"].map((label, i) => (
          <span
            key={label}
            style={{
              padding: "6px 14px",
              borderRadius: radius.control,
              fontSize: 14,
              fontWeight: 500,
              background: i === 0 ? color.sheet : "transparent",
              color: i === 0 ? color.ink : color.inkMuted,
              boxShadow: i === 0 ? "0 1px 2px rgb(23 33 28 / 0.08)" : "none",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 16, ...fade(eZone) }}>{s.dropped ? <FilePanel s={s} /> : <DropZone over={s.dragOver} />}</div>

      {/* Footer */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${color.contour}`, display: "flex", justifyContent: "space-between", alignItems: "center", ...fade(eZone) }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: color.inkMuted, opacity: 0.5 }}>
          <ArrowLeft size={16} color={color.inkMuted} /> Back
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: font.mono, fontSize: 12, color: color.inkMuted, border: `1px solid ${color.contour}`, borderRadius: 6, padding: "2px 7px", background: color.sheet }}>↵</span>
          <span
            style={{
              background: s.press > 0.5 ? color.forestDeep : color.forest,
              color: color.sheet,
              fontSize: 14,
              fontWeight: 500,
              padding: "10px 18px",
              borderRadius: radius.control,
              transform: `scale(${1 - 0.02 * s.press})`,
              display: "inline-block",
            }}
          >
            Continue
          </span>
        </span>
      </div>
    </div>
  );
}

function DropZone({ over }: { over: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "48px 24px",
        borderRadius: radius.panel,
        border: `2px dashed ${over > 0.5 ? color.forest : color.edge}`,
        background: over > 0.5 ? color.fog : color.sheet,
        transform: `scale(${mix(1, 1.01, over)})`,
        textAlign: "center",
      }}
    >
      <span style={{ transform: `translateY(${-6 * over}px)` }}>
        <MapPin size={32} color={color.forest} />
      </span>
      <span style={{ marginTop: 4, color: color.ink, ...displayStyle(26, 420), lineHeight: 1.2 }}>Drop your CV here</span>
      <span style={{ fontSize: 16, color: color.forest, textDecoration: "underline", textDecorationColor: "rgb(31 77 58 / 0.4)", textUnderlineOffset: 4 }}>or choose a file</span>
      <span style={{ marginTop: 4, fontSize: 14, color: color.inkMuted }}>PDF, up to 5 MB</span>
    </div>
  );
}

function FilePanel({ s }: { s: UploadState }) {
  return (
    <div style={{ borderRadius: radius.panel, border: `1px solid ${color.contour}`, background: color.sheet, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <FileText size={20} color={color.inkMuted} />
        <span style={{ flex: 1, fontSize: 16, color: color.ink }}>{persona.cvFile}</span>
        <span style={{ fontFamily: font.mono, fontSize: 14, color: color.inkMuted }}>{persona.cvSize}</span>
      </div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
        {/* Drawn at its real width so the nodes stay round. */}
        <svg width={510} height={16} style={{ overflow: "visible" }}>
          <RouteLine points={[{ x: 6, y: 8 }, { x: 504, y: 8 }]} progress={s.line} width={1.5} />
          <RouteNode x={6} y={8} r={4.5} state="done" />
          <RouteNode x={504} y={8} r={4.5} state="done" opacity={s.ready} />
        </svg>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 500, color: color.success, opacity: s.ready }}>
          <Check size={16} color={color.success} progress={s.ready} /> Ready
        </span>
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 20, fontSize: 14 }}>
        <span style={{ fontWeight: 500, color: color.forest, textDecoration: "underline", textDecorationColor: "rgb(31 77 58 / 0.4)", textUnderlineOffset: 4 }}>Replace file</span>
        <span style={{ color: color.inkMuted, textDecoration: "underline", textDecorationColor: color.contour, textUnderlineOffset: 4 }}>Remove</span>
      </div>
    </div>
  );
}

/** The OS drag image that follows the cursor: the file, slightly translucent. */
export function DragGhost({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: radius.control,
        background: color.sheet,
        border: `1px solid ${color.contour}`,
        boxShadow: "0 1px 2px rgb(23 33 28 / 0.06), 0 8px 24px -8px rgb(23 33 28 / 0.14)",
        fontFamily: font.sans,
        fontSize: 15,
        color: color.ink,
        opacity,
        whiteSpace: "nowrap",
      }}
    >
      <FileText size={18} color={color.inkMuted} />
      {persona.cvFile}
    </div>
  );
}
