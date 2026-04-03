type CreateSyncMessageInput = {
  code: string;
  from: string;
  to: string;
  signature?: string;
};

export const createSyncMessageInDsl = ({
  code,
  from,
  to,
  signature = "newMessage()",
}: CreateSyncMessageInput) => {
  const prefix = code.endsWith("\n") || code.length === 0 ? code : `${code}\n`;
  const line = `${from}->${to}.${signature}`;
  const start = prefix.length + `${from}->${to}.`.length;
  const end = start + signature.length - 1;
  return {
    code: `${prefix}${line}`,
    labelPosition: [start, end] as [number, number],
  };
};
