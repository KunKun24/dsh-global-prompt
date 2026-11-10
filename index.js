import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const name = 'global-prompt';
export const inject = ['systemPrompt', 'connection'];

const PRESET_ZH = '请用中文进行思考回答我';

/** 提示词总长度上限，防止拼进请求后超上下文导致报错 */
const MAX_TOTAL_CHARS = 4000;
/** 单段上限 */
const MAX_PART_CHARS = 2000;

/** 首轮注入记录：按作用域对象直接计数（绝不可 JSON.stringify 作用域，会触发 ctx 代理报错） */
const scopeCount = new WeakMap();
const stringCount = new Map();
let fallbackCount = 0;
/** 首轮注入记录上限，防止无限增长 */
const MAX_TRACKED = 500;

function rememberScope(scope) {
  if (!scope) return ++fallbackCount;
  const t = typeof scope;
  if (t === 'object' || t === 'function') {
    const n = (scopeCount.get(scope) || 0) + 1;
    scopeCount.set(scope, n);
    return n;
  }
  const key = String(scope);
  const n = (stringCount.get(key) || 0) + 1;
  stringCount.set(key, n);
  if (stringCount.size > MAX_TRACKED) {
    const first = stringCount.keys().next().value;
    if (first !== undefined) stringCount.delete(first);
  }
  return n;
}

const CLIP_SUFFIX = '\n…（已截断）';

function clip(text, limit) {
  if (typeof text !== 'string') return '';
  if (text.length <= limit) return text;
  return text.slice(0, Math.max(0, limit - CLIP_SUFFIX.length)) + CLIP_SUFFIX;
}
const EMPTY = { presetZh: false, personaEnabled: false, persona: '', promptEnabled: false, prompt: '' };

function stateFile() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
  return path.join(home, 'global-prompt.json');
}

function readState() {
  try {
    const v = JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
    return {
      presetZh: v.presetZh === true,
      personaEnabled: v.personaEnabled === true,
      persona: typeof v.persona === 'string' ? v.persona : '',
      promptEnabled: v.promptEnabled === true,
      prompt: typeof v.prompt === 'string' ? v.prompt : '',
    };
  } catch {
    return { ...EMPTY };
  }
}

function writeState(patch) {
  const next = { ...readState(), ...patch };
  const file = stateFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(next, null, 2), { mode: 0o600 });
  return next;
}

export function composePrompt(s) {
  const parts = [];
  if (s.presetZh) parts.push(PRESET_ZH);
  if (s.personaEnabled && s.persona.trim()) {
    parts.push('【全局人设】\n' + clip(s.persona.trim(), MAX_PART_CHARS));
  }
  if (s.promptEnabled && s.prompt.trim()) {
    parts.push('【全局提示词】\n' + clip(s.prompt.trim(), MAX_PART_CHARS));
  }
  const joined = parts.join('\n\n');
  return clip(joined, MAX_TOTAL_CHARS);
}

export function apply(ctx) {
  ctx.effect(() =>
    ctx.systemPrompt.section({
      name: 'global-prompt',
      order: ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX') + 1,
      interpolate: false,
      text: (context) => {
        // 只在会话首次组装时注入；后续轮次返回空串，避免累积超限
        const times = rememberScope(context && context.scope);
        if (times > 1) return '';
        return composePrompt(readState());
      },
    }),
  );

  const json = (obj) =>
    new Response(JSON.stringify(obj), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });

  ctx.effect(() =>
    ctx.connection.fetch.register({
      path: '/api/global-prompt/state',
      methods: ['GET', 'POST'],
      requestBody: 'buffered',
      fetch: async (request) => {
        if (request.method === 'GET') {
          const s = readState();
          return json({ ok: true, state: s, preview: composePrompt(s), preset: PRESET_ZH });
        }
        let body = {};
        try { body = await request.json(); } catch { body = {}; }
        const patch = {};
        if (body.presetZh !== undefined) patch.presetZh = !!body.presetZh;
        if (body.personaEnabled !== undefined) patch.personaEnabled = !!body.personaEnabled;
        if (body.persona !== undefined) patch.persona = String(body.persona);
        if (body.promptEnabled !== undefined) patch.promptEnabled = !!body.promptEnabled;
        if (body.prompt !== undefined) patch.prompt = String(body.prompt);
        const next = writeState(patch);
        return json({ ok: true, state: next, preview: composePrompt(next), preset: PRESET_ZH });
      },
    }),
  );
}
