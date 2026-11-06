import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Evaluate the pinned source without booting its browser UI or making requests.
export function upstreamAt(initialTime = new Date(2026, 0, 5, 12).getTime(), randomValues = [0.5]) {
  let time = initialTime;
  let randomIndex = 0;
  const html = readFileSync(new URL('../reference/upstream.html', import.meta.url), 'utf8');
  const source = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { textContent: '', innerHTML: '', classList: { add() {}, remove() {}, toggle() {} }, focus() {}, querySelector() { return this; } });
    return elements.get(id);
  };
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [time])); }
    static now() { return time; }
  }
  const math = Object.create(Math);
  math.random = () => randomValues[randomIndex++ % randomValues.length];
  const values = new Map();
  const context = vm.createContext({
    Date: ClockDate, Math: math, console,
    document: { addEventListener() {}, getElementById: element, querySelectorAll: () => [] },
    window: {},
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) },
    setTimeout() {}, clearTimeout() {}, setInterval() {}, clearInterval() {},
    getComputedStyle: () => ({ getPropertyValue: name => name === '--lcd-bg' ? '#c4cfa1' : '#0f380f' }),
  });
  vm.runInContext(source + '\nglobalThis.reference = { C, PF, SP, Evo, GameState, Renderer, TamagotchiApp, AIManager };', context);
  return { ...context.reference, setTime(value) { time = value; }, element };
}

export const plain = value => JSON.parse(JSON.stringify(value));
