// pako ships no types and only renderer.html decoding uses it.
declare module "pako" {
  export function gzip(data: string | Uint8Array): Uint8Array;
  export function ungzip(data: Uint8Array, options: { to: "string" }): string;
  const pako: { gzip: typeof gzip; ungzip: typeof ungzip };
  export default pako;
}
