import { describe, it, expect } from "vitest";
import { RootContext } from "@/parser";
import ToCollector from "@/parser/ToCollector";

function getParticipants(code: string) {
  const rootContext = RootContext(code);
  return ToCollector.getParticipants(rootContext);
}

describe("Emoji in participant declarations", () => {
  it("parses [rocket] as emoji decorator on participant", () => {
    const participants = getParticipants("[rocket] Production");
    const prod = participants.Get("Production");
    expect(prod?.ToValue().emoji).toBe("rocket");
  });

  it("parses participant without emoji", () => {
    const participants = getParticipants("Production");
    const prod = participants.Get("Production");
    expect(prod?.ToValue().emoji).toBeUndefined();
  });

  it("parses emoji with @Type", () => {
    const participants = getParticipants("@Database [fire] HotDB");
    const db = participants.Get("HotDB");
    expect(db?.ToValue().type).toBe("Database");
    expect(db?.ToValue().emoji).toBe("fire");
  });

  it("parses emoji with stereotype", () => {
    const participants = getParticipants('<<service>> [lock] Auth');
    const auth = participants.Get("Auth");
    expect(auth?.ToValue().stereotype).toBe("service");
    expect(auth?.ToValue().emoji).toBe("lock");
  });

  it("parses inline emoji on first usage in message", () => {
    const participants = getParticipants("A->[rocket]B.call()");
    const b = participants.Get("B");
    expect(b?.ToValue().emoji).toBe("rocket");
  });

  it("first emoji wins when declared and used inline", () => {
    const participants = getParticipants("[fire] B\nA->[rocket]B.call()");
    const b = participants.Get("B");
    expect(b?.ToValue().emoji).toBe("fire"); // header declaration wins via ||=
  });
});
