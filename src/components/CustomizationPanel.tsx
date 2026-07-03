import type { DollExpression } from "../data/products";

interface CustomizationPanelProps {
  body: string;
  hair: string;
  outfit: string;
  expression: DollExpression;
  note: string;
  onBodyChange: (value: string) => void;
  onHairChange: (value: string) => void;
  onOutfitChange: (value: string) => void;
  onExpressionChange: (value: DollExpression) => void;
  onNoteChange: (value: string) => void;
}

const bodyColors = [
  { label: "Peach", value: "#f4d6bc" },
  { label: "Cocoa", value: "#c69278" },
  { label: "Rose", value: "#f7d6e7" },
  { label: "Lavender", value: "#d8d2ff" },
];

const hairColors = [
  { label: "Cocoa", value: "#3d231a" },
  { label: "Berry", value: "#7b4a85" },
  { label: "Sunny", value: "#e7a93a" },
  { label: "Ink", value: "#2d2b35" },
];

const outfitColors = [
  { label: "Sky", value: "#79c6ed" },
  { label: "Pink", value: "#ff8fba" },
  { label: "Leaf", value: "#79b94e" },
  { label: "Moon", value: "#c8bdff" },
];

const expressions: Array<{ label: string; value: DollExpression }> = [
  { label: "Smile", value: "smile" },
  { label: "Button", value: "button" },
  { label: "Sleepy", value: "sleepy" },
  { label: "Spark", value: "spark" },
];

export function CustomizationPanel({
  body,
  hair,
  outfit,
  expression,
  note,
  onBodyChange,
  onHairChange,
  onOutfitChange,
  onExpressionChange,
  onNoteChange,
}: CustomizationPanelProps) {
  return (
    <div className="customization-panel">
      <OptionGroup title="Body color">
        {bodyColors.map((color) => (
          <button
            className={body === color.value ? "swatch swatch-active" : "swatch"}
            key={color.value}
            type="button"
            onClick={() => onBodyChange(color.value)}
            aria-label={color.label}
            style={{ background: color.value }}
          />
        ))}
      </OptionGroup>
      <OptionGroup title="Hair style">
        {hairColors.map((color) => (
          <button
            className={hair === color.value ? "chip chip-active" : "chip"}
            key={color.value}
            type="button"
            onClick={() => onHairChange(color.value)}
          >
            {color.label}
          </button>
        ))}
      </OptionGroup>
      <OptionGroup title="Outfit">
        {outfitColors.map((color) => (
          <button
            className={outfit === color.value ? "chip chip-active" : "chip"}
            key={color.value}
            type="button"
            onClick={() => onOutfitChange(color.value)}
          >
            {color.label}
          </button>
        ))}
      </OptionGroup>
      <OptionGroup title="Face">
        {expressions.map((item) => (
          <button
            className={expression === item.value ? "chip chip-active" : "chip"}
            key={item.value}
            type="button"
            onClick={() => onExpressionChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </OptionGroup>
      <label className="field-group">
        <span>Embroidered note</span>
        <textarea
          value={note}
          maxLength={80}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Add a name, date, or tiny message"
        />
      </label>
    </div>
  );
}

function OptionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="option-group">
      <h3>{title}</h3>
      <div className="option-row">{children}</div>
    </div>
  );
}
