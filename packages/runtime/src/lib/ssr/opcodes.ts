// Opcode format for Lynx SSR snapshot serialization.
// Mirrors the opcode types used by React Lynx's renderToOpcodes system —
// the Lynx engine expects this format from ssrEncode().
export const enum Opcode {
  Begin = 0,
  End = 1,
  Attr = 2,
  Text = 3,
}

export class OpcodeRecorder {
  readonly opcodes: unknown[] = [];
  #nextSsrId = 0;

  nextId(): string {
    return String(this.#nextSsrId++);
  }

  begin(ssrId: string, tag: string): void {
    this.opcodes.push(Opcode.Begin, ssrId, tag);
  }

  end(): void {
    this.opcodes.push(Opcode.End);
  }

  attr(key: string, value: unknown): void {
    this.opcodes.push(Opcode.Attr, key, value);
  }

  text(ssrId: string, content: string): void {
    this.opcodes.push(Opcode.Text, ssrId, content);
  }
}
