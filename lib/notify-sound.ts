let ctx: AudioContext | null = null;

export function playDing() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    if (ctx.state !== "running") return;
    const t = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    master.connect(ctx.destination);
    const partials: [number, number][] = [
      [987.77, 1],
      [1975.53, 0.38],
      [2963.3, 0.12],
    ];
    for (const [freq, amp] of partials) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + 1.7);
    }
  } catch {}
}
