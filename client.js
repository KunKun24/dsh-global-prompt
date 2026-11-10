window.__ModuleLoader__.load({
  id: 'dsh-global-prompt',
  factory: (require) => {
    const React = require('react');
    const h = React.createElement;
    const NS = 'global-prompt';
    const { useState, useEffect, useRef, useCallback } = React;

    const MUTED = 'var(--dsw-alias-text-secondary, #8b93a7)';
    const LINE = 'var(--dsw-alias-border-secondary, rgba(128,128,128,.22))';
    const BRAND = 'var(--dsw-alias-brand-primary, #4d6bfe)';

    function Icon({ size = 16 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
      },
        h('line', { key: 'l1', x1: 3, y1: 6, x2: 21, y2: 6 }),
        h('line', { key: 'l2', x1: 3, y1: 12, x2: 21, y2: 12 }),
        h('line', { key: 'l3', x1: 3, y1: 18, x2: 21, y2: 18 }),
        h('circle', { key: 'c1', cx: 8, cy: 6, r: 2.4, fill: 'currentColor', stroke: 'none' }),
        h('circle', { key: 'c2', cx: 16, cy: 12, r: 2.4, fill: 'currentColor', stroke: 'none' }),
        h('circle', { key: 'c3', cx: 9, cy: 18, r: 2.4, fill: 'currentColor', stroke: 'none' })
      );
    }

    function Switch({ checked, onChange, disabled }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': checked,
        disabled: !!disabled,
        onClick: () => onChange(!checked),
        style: {
          width: 46, height: 26, borderRadius: 13, border: 0, flex: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer', padding: 0,
          background: checked ? BRAND : 'rgba(128,128,128,.35)',
          position: 'relative', transition: 'background .18s', opacity: disabled ? 0.5 : 1,
        },
      }, h('span', {
        style: {
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: 'left .18s', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
        },
      }));
    }

    function Row({ title, desc, checked, onChange, children }) {
      return h('div', {
        style: {
          border: '1px solid ' + LINE, borderRadius: 12, padding: '14px 16px',
          marginBottom: 12, background: 'var(--dsw-alias-bg-secondary, transparent)',
        },
      },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 14 } },
          h('div', { style: { flex: 1, minWidth: 0 } },
            h('div', { style: { fontSize: 14, fontWeight: 500 } }, title),
            desc ? h('div', { style: { fontSize: 12, color: MUTED, marginTop: 3, lineHeight: 1.5 } }, desc) : null
          ),
          h(Switch, { checked: checked, onChange: onChange })
        ),
        checked && children ? h('div', { style: { marginTop: 12 } }, children) : null
      );
    }

    const areaStyle = {
      width: '100%', boxSizing: 'border-box', minHeight: 88, resize: 'vertical',
      padding: '10px 12px', fontSize: 13, lineHeight: 1.6, borderRadius: 9,
      border: '1px solid ' + LINE, background: 'var(--dsw-alias-bg-primary, rgba(0,0,0,.15))',
      color: 'inherit', fontFamily: 'inherit', outline: 'none',
    };

    function Panel() {
      const [state, setState] = useState(null);
      const [preview, setPreview] = useState('');
      const [preset, setPreset] = useState('');
      const [status, setStatus] = useState('');
      const timer = useRef(null);

      const load = useCallback(async () => {
        try {
          const r = await fetch('/api/global-prompt/state', { credentials: 'same-origin' });
          const d = await r.json();
          if (d && d.ok) {
            setState(d.state);
            setPreview(d.preview || '');
            setPreset(d.preset || '');
          }
        } catch (e) {
          setStatus('读取失败');
        }
      }, []);

      useEffect(() => { load(); }, [load]);

      const save = useCallback((patch) => {
        setState((prev) => ({ ...prev, ...patch }));
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(async () => {
          try {
            const current = { ...(stateRef.current || {}), ...patch };
            const r = await fetch('/api/global-prompt/state', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(current),
            });
            const d = await r.json();
            if (d && d.ok) {
              setPreview(d.preview || '');
              setStatus('已保存');
              setTimeout(() => setStatus(''), 1500);
            }
          } catch (e) {
            setStatus('保存失败');
          }
        }, 500);
      }, [state]);

      const stateRef = useRef(state);
      useEffect(() => { stateRef.current = state; }, [state]);

      if (!state) {
        return h('div', { style: { padding: 32, color: MUTED, fontSize: 13 } }, '加载中…');
      }

      return h('div', { style: { padding: '20px 22px', maxWidth: 760, margin: '0 auto' } },
        h('div', { style: { marginBottom: 18 } },
          h('div', { style: { fontSize: 17, fontWeight: 600, marginBottom: 4 } }, '全局提示词'),
          h('div', { style: { fontSize: 12.5, color: MUTED, lineHeight: 1.6 } },
            '以下设置对你本人的所有对话生效，不会影响其他成员。')
        ),

        h(Row, {
          title: '中文回答思考',
          desc: preset ? '内置提示词：' + preset : '使用内置中文回答提示词',
          checked: state.presetZh,
          onChange: (v) => save({ presetZh: v }),
        }),

        h(Row, {
          title: '全局人设',
          desc: '设定 AI 的身份与语气，对每个对话生效',
          checked: state.personaEnabled,
          onChange: (v) => save({ personaEnabled: v }),
        },
          h('textarea', {
            value: state.persona,
            placeholder: '例如：你是一位严谨的技术顾问，回答简洁，直接给结论。',
            style: areaStyle,
            onChange: (e) => setState((p) => ({ ...p, persona: e.target.value })),
            onBlur: (e) => save({ persona: e.target.value }),
          })
        ),

        h(Row, {
          title: '全局提示词',
          desc: '附加的通用要求，例如输出格式、语言、禁忌',
          checked: state.promptEnabled,
          onChange: (v) => save({ promptEnabled: v }),
        },
          h('textarea', {
            value: state.prompt,
            placeholder: '例如：回答末尾附上一句总结；不要使用 emoji。',
            style: areaStyle,
            onChange: (e) => setState((p) => ({ ...p, prompt: e.target.value })),
            onBlur: (e) => save({ prompt: e.target.value }),
          })
        ),

        h('div', {
          style: {
            marginTop: 16, padding: '12px 14px', borderRadius: 10,
            border: '1px dashed ' + LINE, fontSize: 12.5, lineHeight: 1.7, color: MUTED,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          },
        },
          h('div', { style: { fontWeight: 600, color: 'inherit', marginBottom: 6 } }, '最终生效内容'),
          preview ? preview : '（当前未启用任何内容）'
        ),

        status ? h('div', { style: { marginTop: 10, fontSize: 12, color: MUTED } }, status) : null
      );
    }

    function apply(ctx) {
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register({
          name: 'sidebar.panellist',
          id: NS,
          order: 15,
          locale: NS,
          label: () => '全局提示词',
        }, Icon)
      );
      ctx.slots.inject('main', () =>
        ctx.slots.register({
          name: 'main',
          key: NS,
          locale: NS,
        }, Panel)
      );
    }

    return { apply, inject: ['slots'] };
  },
});
