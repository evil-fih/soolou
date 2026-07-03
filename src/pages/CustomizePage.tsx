import { useMemo, useState } from "react";
import { ShoppingBag } from "@phosphor-icons/react";
import { Button } from "../components/Button";
import { CustomizationPanel } from "../components/CustomizationPanel";
import { DollPreview } from "../components/DollPreview";
import type { DollExpression, DollLook } from "../data/products";

export function CustomizePage() {
  const [body, setBody] = useState("#f4d6bc");
  const [hair, setHair] = useState("#3d231a");
  const [outfit, setOutfit] = useState("#79c6ed");
  const [expression, setExpression] = useState<DollExpression>("smile");
  const [note, setNote] = useState("For someone special");

  const look = useMemo<DollLook>(
    () => ({
      body,
      belly: "#fff3e7",
      hair,
      outfit,
      accent: "#ff5da2",
      expression,
    }),
    [body, expression, hair, outfit],
  );

  return (
    <section className="section customize-layout">
      <div className="customize-preview stitch-frame">
        <div className="customize-copy">
          <h1>Create your own plushie</h1>
          <p>Choose the face, colors, outfit, and a tiny stitched note.</p>
        </div>
        <DollPreview look={look} label="Custom Soolou plush preview" size="lg" floating />
        <div className="note-preview">
          <span>Note</span>
          <strong>{note || "Add a tiny message"}</strong>
        </div>
      </div>
      <div className="customize-controls">
        <CustomizationPanel
          body={body}
          hair={hair}
          outfit={outfit}
          expression={expression}
          note={note}
          onBodyChange={setBody}
          onHairChange={setHair}
          onOutfitChange={setOutfit}
          onExpressionChange={setExpression}
          onNoteChange={setNote}
        />
        <div className="builder-summary">
          <div>
            <span>Estimated total</span>
            <strong>$52</strong>
          </div>
          <Button href="#/cart" size="lg" icon={<ShoppingBag weight="bold" />}>
            Add Design
          </Button>
        </div>
      </div>
    </section>
  );
}
