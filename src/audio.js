/** Soft forest SFX + soul cues */
export function createAudio() {
  /** @type {AudioContext | null} */
  let ctx = null;
  /** @type {GainNode | null} */
  let master = null;
  let enabled = false;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }

  function resume() {
    ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    enabled = true;
  }

  function tone(freq, dur, type = "sine", vol = 0.1, slideTo = freq) {
    if (!enabled || !ctx || !master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  return {
    resume,
    jump: () => tone(280, 0.08, "sine", 0.07, 160),
    land: () => tone(90, 0.06, "triangle", 0.05, 60),
    swap: (kind) => {
      const map = { glide: 520, stomp: 180, crawl: 360 };
      const f = map[kind] || 400;
      tone(f, 0.1, "sine", 0.09, f * 1.4);
      tone(f * 1.5, 0.12, "triangle", 0.05, f);
    },
    stomp: () => {
      tone(70, 0.12, "triangle", 0.12, 40);
      tone(120, 0.08, "sawtooth", 0.06, 50);
    },
    break: () => tone(90, 0.15, "square", 0.08, 40),
    hurt: () => tone(110, 0.2, "sawtooth", 0.1, 50),
    win: () => {
      [330, 392, 494, 660].forEach((f, i) => {
        setTimeout(() => tone(f, 0.15, "sine", 0.08, f), i * 100);
      });
    },
    lose: () => tone(150, 0.45, "triangle", 0.1, 55),
  };
}
