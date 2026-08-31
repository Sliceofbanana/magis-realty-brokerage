export type TeamTone = {
  key: string;
  label: string;
  dot: string;
  border: string;
  swatch: string;
};

export const teamTones: TeamTone[] = [
  { key: "navy", label: "Navy", dot: "bg-navy-900", border: "border-l-navy-900", swatch: "bg-navy-900" },
  { key: "gold", label: "Gold", dot: "bg-gold-500", border: "border-l-gold-500", swatch: "bg-gold-500" },
  { key: "blue", label: "Sky Blue", dot: "bg-sky-400", border: "border-l-sky-400", swatch: "bg-sky-400" },
];

export function teamToneFor(key: string): TeamTone {
  return teamTones.find((t) => t.key === key) ?? teamTones[0];
}
