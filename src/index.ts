import "./components/Cosmetic.scss";
import "./components/Cosmetic-blue.scss";
import "./components/Cosmetic-black-white.scss";
import "./components/Cosmetic-star-uml.scss";
import "./components/theme-blue-river.scss";

import Store from "./store/Store";
import { SeqDiagram } from "./components/DiagramFrame/SeqDiagram/SeqDiagram";
import { DiagramFrame } from "./components/DiagramFrame/DiagramFrame";

const Version = import.meta.env.VERSION || "";
const BuildTime = import.meta.env.BUILD_TIME || "";
const VueSequence = {
  Version,
  BuildTime,
  Store,
  SeqDiagram,
  DiagramFrame,
};
export { VueSequence };
