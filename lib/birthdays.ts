import { TeamMember } from "@/lib/types";

export function monthDay(date: string) {
  return date.slice(5, 10); // "MM-DD"
}

export function isBirthdayToday(member: TeamMember, today: Date) {
  const todayKey = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
  return monthDay(member.birthDate) === todayKey;
}

export function celebrantsToday(team: TeamMember[], today: Date = new Date()) {
  return team.filter((m) => isBirthdayToday(m, today));
}

export function ageOn(birthDate: string, today: Date = new Date()) {
  const birthYear = Number(birthDate.slice(0, 4));
  return today.getFullYear() - birthYear;
}

export function buildBirthdayMessage(template: string, name: string) {
  return template.replaceAll("{{name}}", name);
}

export function todayKey(today: Date = new Date()) {
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
