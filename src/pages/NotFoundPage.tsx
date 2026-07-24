import { HouseLine, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "../components/Button";

export function NotFoundPage() {
  return (
    <section className="section not-found-page" aria-labelledby="not-found-heading">
      <div className="empty-state stitch-frame">
        <MagnifyingGlass weight="bold" aria-hidden="true" />
        <h1 id="not-found-heading">This page wandered off</h1>
        <p>The Soolou page you were looking for does not exist.</p>
        <Button href="#/" icon={<HouseLine weight="bold" />}>
          Back to home
        </Button>
      </div>
    </section>
  );
}
