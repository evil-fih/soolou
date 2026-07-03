import { CheckCircle, Gift, ShieldCheck, Truck } from "@phosphor-icons/react";

const badges = [
  {
    icon: ShieldCheck,
    title: "Careful stitching",
    text: "Every plush is checked before it leaves the studio.",
  },
  {
    icon: Gift,
    title: "Gift-ready wrap",
    text: "Choose a note, name stitch, and soft paper wrap.",
  },
  {
    icon: Truck,
    title: "Order updates",
    text: "Follow the make, pack, and ship steps from checkout.",
  },
  {
    icon: CheckCircle,
    title: "Friendly support",
    text: "Ask us about fabric, sizing, or custom ideas anytime.",
  },
];

export function TrustBadges() {
  return (
    <section className="trust-band" aria-label="Soolou promises">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div className="trust-item" key={badge.title}>
            <span>
              <Icon weight="fill" />
            </span>
            <div>
              <strong>{badge.title}</strong>
              <p>{badge.text}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
