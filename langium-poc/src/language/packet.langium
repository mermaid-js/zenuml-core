grammar Packet
import "./common";

entry Packet:
  NEWLINE*
  "packet-beta"
  (
    TitleAndAccessibilities
    | blocks+=PacketBlock
    | NEWLINE
  )*
;

PacketBlock:
  (
    start=INT('-' end=INT)?
    | '+' bits=INT
  )
  ':' label=STRING
  EOL
;
