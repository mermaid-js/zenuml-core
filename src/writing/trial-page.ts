/**
 * The public typing trial (ADR 0009, G5 and G6). Page: `trial.html`, dev
 * server only. Flow: consent, a warm-up in the smart editor, three copy tasks
 * in a plain textarea (arm order drawn per session), a thank-you screen with
 * the person's own WPM. A touch-only device does the warm-up and stops.
 * Each recording is POSTed to the collector Worker as soon as its task ends.
 */
import ZenUml from "@/core";
import { createSmartEditor, type SmartEditor } from "@/editor/smart";
import { readConfig } from "./trial-config";
import {
  buildProbe,
  DeviceDetector,
  drawArmOrder,
  HiddenTimer,
  loadClarity,
  maskForClarity,
  newSessionId,
  orderCode,
  type Probe,
} from "./trial-flow";
import { createSender, turnstileTokens, type SendPayload } from "./trial-send";
import {
  armSettings,
  Recorder,
  TASKS,
  typingMetrics,
  type Arm,
  type DetectAnswer,
} from "./trial";

const LIMIT_MS = 3 * 60 * 1000;
/** Done unlocks once this share of the text is typed. Probes fire before it. */
const DONE_SHARE = 0.8;

const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;

const cfg = readConfig(location);
const sessionId = newSessionId();
const order: Arm[] = drawArmOrder();
const orderStr = orderCode(order);
const detector = new DeviceDetector(matchMedia("(any-pointer: fine)").matches);
const sender = createSender({
  endpoint: cfg.endpoint,
  tokens: turnstileTokens($("ts-box"), cfg.siteKey),
});

interface Upload {
  taskId: SendPayload["taskId"];
  label: string;
  payload: SendPayload;
  status: "sending" | "sent" | "failed";
  message?: string;
}
const uploads: Upload[] = [];
const wpms: number[] = [];

document.body.dataset.order = orderStr;
document.body.dataset.sessionId = sessionId;
maskForClarity($("app"));

// Device class. A touch before any key makes the device touch.
document.addEventListener("touchstart", () => detector.touch(), {
  passive: true,
  capture: true,
});
document.addEventListener(
  "pointerdown",
  (e) => {
    if (e.pointerType === "touch") detector.touch();
  },
  { capture: true },
);
document.addEventListener("keydown", () => detector.key(), { capture: true });

type Screen = "consent" | "warmup" | "task" | "thanks";
function show(screen: Screen) {
  for (const s of ["consent", "warmup", "task", "thanks"] as Screen[])
    $(`screen-${s}`).hidden = s !== screen;
  document.body.dataset.screen = screen;
}

/** Per recording: paste flag, hidden-tab timer, start time. */
class Capture {
  paste = false;
  readonly hidden = new HiddenTimer();
  readonly t0 = performance.now();

  constructor() {
    if (document.hidden) this.hidden.change(true, this.t0);
  }

  extras(detect: DetectAnswer[]) {
    const now = performance.now();
    return {
      paste: this.paste,
      hiddenMs: this.hidden.total(now),
      durationMs: Math.round(now - this.t0),
      detect,
    };
  }
}
let capture: Capture | null = null;
document.addEventListener("visibilitychange", () =>
  capture?.hidden.change(document.hidden, performance.now()),
);

function enqueue(
  taskId: SendPayload["taskId"],
  label: string,
  arm: Arm,
  jsonl: string,
) {
  const upload: Upload = {
    taskId,
    label,
    status: "sending",
    payload: {
      sessionId,
      taskId,
      arm,
      order: orderStr,
      device: detector.device(),
      consent: true,
      jsonl,
    },
  };
  uploads.push(upload);
  void transmit(upload);
}

async function transmit(upload: Upload) {
  upload.status = "sending";
  renderUploads();
  const result = await sender.send(upload.payload);
  upload.status = result.ok ? "sent" : "failed";
  upload.message = result.message;
  renderUploads();
}

function download(name: string, text: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([text], { type: "application/x-ndjson" }),
  );
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function renderUploads() {
  const box = $("uploads");
  box.replaceChildren();
  for (const u of uploads) {
    const row = document.createElement("div");
    row.className = "upload";
    row.dataset.status = u.status;
    row.textContent = `${u.label}: ${
      u.status === "sent"
        ? "sent"
        : u.status === "sending"
          ? "sending…"
          : `could not be sent${u.message ? ` (${u.message})` : ""}`
    }`;
    box.append(row);
  }
  const failed = uploads.filter((u) => u.status === "failed");
  const downloads = $("fallback");
  downloads.replaceChildren();
  downloads.hidden = failed.length === 0;
  if (failed.length) {
    const p = document.createElement("p");
    p.textContent =
      "Some recordings could not be sent. You can try again, or keep a copy and send it to the researchers.";
    const retry = document.createElement("button");
    retry.textContent = "Try again";
    retry.addEventListener("click", () =>
      failed.forEach((u) => void transmit(u)),
    );
    downloads.append(p, retry);
    for (const u of failed) {
      const b = document.createElement("button");
      b.className = "secondary";
      b.textContent = `Download my recording (${u.label})`;
      b.addEventListener("click", () =>
        download(`${u.taskId}.jsonl`, u.payload.jsonl),
      );
      downloads.append(b);
    }
  }
  document.body.dataset.sent = String(
    uploads.filter((u) => u.status === "sent").length,
  );
}

// ---- Consent -------------------------------------------------------------

const agree = $<HTMLInputElement>("agree");
agree.addEventListener("change", () => {
  $<HTMLButtonElement>("begin").disabled = !agree.checked;
});
$("begin").addEventListener("click", () => {
  if (!agree.checked) return;
  // Clarity loads only now, after consent, and only if a project id is set.
  loadClarity(cfg.clarityId);
  show("warmup");
  startWarmup();
});

// ---- Warm-up in the smart editor -----------------------------------------

let smart: SmartEditor | null = null;

async function startWarmup() {
  const zen = new ZenUml($("wdiagram"));
  await zen.render("", { enableWritingAnimation: false });
  capture = new Capture();
  const recorder = new Recorder(
    "",
    { task: "warmup", arm: "A" },
    capture.t0,
    "smart",
  );
  const markPaste = () => {
    if (capture) capture.paste = true;
  };
  const host = $("weditor");
  host.addEventListener("paste", markPaste, true);
  host.addEventListener("drop", markPaste, true);
  let edits = 0;
  smart = createSmartEditor(host, {
    doc: "",
    onChange: (doc) => {
      recorder.input(doc, performance.now());
      void zen.render(doc, {});
      if (++edits === 1) $<HTMLButtonElement>("wdone").disabled = false;
    },
  });
  void smart.ready.then(() => {
    document.body.dataset.smartReady = "1";
  });
  $("wdone").addEventListener(
    "click",
    () => {
      if (!capture) return;
      enqueue("warmup", "Warm-up", "A", recorder.toJsonl(capture.extras([])));
      capture = null;
      smart?.destroy();
      smart = null;
      if (detector.device() === "touch") {
        showThanks(true);
      } else {
        show("task");
        prepareTask(0);
      }
    },
    { once: true },
  );
}

// ---- Copy tasks ------------------------------------------------------------

const editor = $<HTMLTextAreaElement>("teditor");
let step = 0;

interface TaskSession {
  arm: Arm;
  zen: ZenUml;
  recorder: Recorder;
  timer: number;
  probeAt: number[];
  probe: Probe | null;
  detect: DetectAnswer[];
}
let session: TaskSession | null = null;

function prepareTask(n: number) {
  step = n;
  $("tnum").textContent = `Task ${n + 1} of 3`;
  $("ttask").textContent = TASKS[n].text;
  $("tdiagram").replaceChildren();
  editor.value = "";
  editor.disabled = true;
  const start = $<HTMLButtonElement>("tstart");
  start.disabled = false;
  start.textContent = `Start task ${n + 1}`;
  $<HTMLButtonElement>("tdone").disabled = true;
  $("tclock").textContent = "3 minutes";
}

$("tstart").addEventListener("click", async () => {
  const arm = order[step];
  const task = TASKS[step];
  const { gate, motion } = armSettings(arm);
  $<HTMLButtonElement>("tstart").disabled = true;
  const zen = new ZenUml($("tdiagram"));
  await zen.render("", { enableWritingAnimation: gate });
  zen._setWritingMotion(motion);
  editor.value = "";
  editor.disabled = false;
  editor.focus();
  capture = new Capture();
  const [a, b] = cfg.probeAt ?? [
    0.25 + Math.random() * 0.2,
    0.55 + Math.random() * 0.2,
  ];
  session = {
    arm,
    zen,
    recorder: new Recorder("", { task: task.id, arm }, capture.t0),
    probeAt: [a, b],
    probe: null,
    detect: [],
    // An interval, not requestAnimationFrame: the limit holds in a hidden tab too.
    timer: window.setInterval(tick, 200),
  };
  tick();
});

function tick() {
  if (!session || !capture) return;
  const elapsed = performance.now() - capture.t0;
  $("tclock").textContent =
    Math.max(0, Math.ceil((LIMIT_MS - elapsed) / 1000)) + " s left";
  if (elapsed >= LIMIT_MS) finishTask();
}

for (const type of ["paste", "drop"])
  editor.addEventListener(type, () => {
    if (capture) capture.paste = true;
  });

editor.addEventListener("input", (e) => {
  if (!session || !capture) return;
  if (/^insertFrom(Paste|Drop|Yank)/.test((e as InputEvent).inputType ?? ""))
    capture.paste = true;
  session.recorder.input(editor.value, performance.now());
  void session.zen.render(editor.value, {});
  const task = TASKS[step];
  const share = editor.value.length / task.text.length;
  $<HTMLButtonElement>("tdone").disabled = share < DONE_SHARE;
  if (!session.probe && session.probeAt.length && share >= session.probeAt[0])
    ask();
});

function ask() {
  if (!session) return;
  const probe = buildProbe(editor.value, TASKS[step].text, Math.random);
  if (!probe) return;
  session.probeAt.shift();
  session.probe = probe;
  editor.disabled = true;
  $("probe-q").textContent = probe.q;
  const options = $("probe-options");
  options.replaceChildren();
  probe.options.forEach((text, i) => {
    const label = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "probe";
    radio.value = String(i);
    radio.addEventListener("change", () => {
      $<HTMLButtonElement>("probe-go").disabled = false;
    });
    const code = document.createElement("code");
    code.textContent = text;
    label.append(radio, code);
    options.append(label);
  });
  $<HTMLButtonElement>("probe-go").disabled = true;
  $("cover").hidden = false;
}

$("probe-go").addEventListener("click", () => {
  if (!session?.probe) return;
  const picked = document.querySelector<HTMLInputElement>(
    "input[name=probe]:checked",
  );
  if (!picked) return;
  const i = Number(picked.value);
  session.detect.push({
    q: session.probe.q,
    answer: session.probe.options[i],
    correct: i === session.probe.correctIndex,
  });
  session.probe = null;
  $("cover").hidden = true;
  editor.disabled = false;
  editor.focus();
});

$("tdone").addEventListener("click", () => finishTask());

function finishTask() {
  if (!session || !capture) return;
  const s = session;
  const cap = capture;
  clearInterval(s.timer);
  session = null;
  capture = null;
  editor.disabled = true;
  $("cover").hidden = true;
  $<HTMLButtonElement>("tdone").disabled = true;
  $("tclock").textContent = "";
  // A question still open at the limit counts as never asked.
  const jsonl = s.recorder.toJsonl(cap.extras(s.detect));
  wpms.push(typingMetrics(jsonl).wpm);
  enqueue(
    TASKS[step].id as SendPayload["taskId"],
    `Task ${step + 1}`,
    s.arm,
    jsonl,
  );
  if (step < 2) prepareTask(step + 1);
  else showThanks(false);
}

// ---- Thank you ---------------------------------------------------------------

function showThanks(touchOnly: boolean) {
  show("thanks");
  $("thanks-touch").hidden = !touchOnly;
  $("thanks-full").hidden = touchOnly;
  if (!touchOnly) {
    const avg = Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length);
    $("wpm").textContent = String(avg);
    $("wpm-list").textContent = wpms
      .map((w, i) => `Task ${i + 1}: ${w} WPM`)
      .join(" · ");
  }
  renderUploads();
}

show("consent");
document.body.dataset.ready = "1";
