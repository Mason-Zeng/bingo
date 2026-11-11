import { useEffect, useRef, useState } from 'react';
import { SQUARES, FREE_INDEX } from './squares.js';
import { STRINGS } from './i18n.js';

const NAMES_KEY = 'bingo.names';
const LANG_KEY = 'bingo.lang';

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [names, setNames] = useState(() => {
    const saved = load(NAMES_KEY, null);
    return Array.isArray(saved) && saved.length === 25 ? saved : Array(25).fill('');
  });
  const [lang, setLang] = useState(() => (load(LANG_KEY, 'en') === 'zh' ? 'zh' : 'en'));
  const [editing, setEditing] = useState(null); // index of the square being edited

  const t = STRINGS[lang];

  useEffect(() => {
    localStorage.setItem(NAMES_KEY, JSON.stringify(names));
  }, [names]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, JSON.stringify(lang));
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t.title;
  }, [lang, t.title]);

  const isMarked = (i) => i === FREE_INDEX || names[i].trim() !== '';
  const filled = names.filter((_, i) => isMarked(i)).length;
  const won = filled === 25; // blackout: the whole board must be filled

  const saveName = (i, value) => {
    setNames((prev) => prev.map((n, j) => (j === i ? value.trim() : n)));
    setEditing(null);
  };

  const reset = () => {
    if (window.confirm(t.resetConfirm)) setNames(Array(25).fill(''));
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </div>
        <button
          className="lang-toggle"
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          aria-label={t.toggleLabel}
          title={t.toggleLabel}
        >
          🌐 {t.toggle}
        </button>
      </header>

      <div className="status" aria-live="polite">
        {won ? (
          <span className="bingo-banner">{t.bingo}</span>
        ) : (
          <span>{t.progress(filled)}</span>
        )}
      </div>

      <div className="board">
        {['B', 'I', 'N', 'G', 'O'].map((l) => (
          <div key={l} className="board-letter" aria-hidden="true">
            {l}
          </div>
        ))}
        {SQUARES.map((sq, i) => {
          const free = i === FREE_INDEX;
          const classes = ['cell', isMarked(i) && 'marked', free && 'free', won && 'win']
            .filter(Boolean)
            .join(' ');
          return (
            <button key={i} className={classes} onClick={() => setEditing(i)} disabled={free}>
              <span className="prompt">{free ? t.free : sq[lang]}</span>
              {!free && names[i] && <span className="name">{names[i]}</span>}
            </button>
          );
        })}
      </div>

      <footer className="footer">
        <span className="hint">{t.tapHint}</span>
        <button className="reset" onClick={reset}>
          {t.reset}
        </button>
      </footer>

      {editing !== null && (
        <NameDialog
          key={editing}
          prompt={SQUARES[editing][lang]}
          initial={names[editing]}
          t={t}
          onSave={(v) => saveName(editing, v)}
          onClear={() => saveName(editing, '')}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function NameDialog({ prompt, initial, t, onSave, onClear, onCancel }) {
  const [value, setValue] = useState(initial);
  const inputRef = useRef(null);
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && cancelRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="overlay" onClick={onCancel}>
      <form
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={prompt}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSave(value);
        }}
      >
        <p className="dialog-label">{t.enterName}</p>
        <h2 className="dialog-prompt">{prompt}</h2>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t.namePlaceholder}
          maxLength={40}
          autoComplete="off"
          enterKeyHint="done"
        />
        <div className="dialog-actions">
          {initial && (
            <button type="button" className="btn-danger" onClick={onClear}>
              {t.clear}
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {t.cancel}
          </button>
          <button type="submit" className="btn-primary">
            {t.save}
          </button>
        </div>
      </form>
    </div>
  );
}
