import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Flag, RotateCcw, Trophy } from 'lucide-react';
import { makeFlagQuestions, readFlagRecords, QUESTION_COUNTS, ROUND_COUNT, saveFlagRecord } from '../data/flagQuiz';

function initialRecords() {
  try { return readFlagRecords(window.localStorage); } catch { return []; }
}

export default function FlagQuiz() {
  const [questionCount, setQuestionCount] = useState(ROUND_COUNT);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState('intro');
  const [records, setRecords] = useState(initialRecords);
  const [storageWarning, setStorageWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [lifelineUsed, setLifelineUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const deadlineRef = useRef(0);
  const lifelineLockedRef = useRef(false);
  const lockedRef = useRef(false);
  const finishedRef = useRef(false);
  const current = questions[index];
  const total = questions.length || questionCount;
  const modeRecords = records.filter(record => record.total === questionCount);

  function startGame() {
    setQuestions(makeFlagQuestions(Math.random, questionCount));
    setIndex(0);
    setScore(0);
    setChoice(null);
    lockedRef.current = false;
    finishedRef.current = false;
    deadlineRef.current = Date.now() + 10000;
    lifelineLockedRef.current = false;
    setTimeLeft(10);
    setLifelineUsed(false);
    setHiddenOptions([]);
    setStage('game');
  }

  function choose(code) {
    if (lockedRef.current || stage !== 'game') return;
    lockedRef.current = true;
    const timedOut = code === null || Date.now() >= deadlineRef.current;
    setTimeLeft(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)));
    setChoice(timedOut ? 'timeout' : code);
    if (!timedOut && code === current.country.code) setScore(value => value + 1);
  }

  function useFiftyFifty() {
    if (stage !== 'game' || lockedRef.current || lifelineLockedRef.current) return;
    if (Date.now() >= deadlineRef.current) { choose(null); return; }
    lifelineLockedRef.current = true;
    const wrong = current.options.filter(option => option.code !== current.country.code);
    const keep = Math.floor(Math.random() * wrong.length);
    setHiddenOptions(wrong.filter((_, index) => index !== keep).map(option => option.code));
    setLifelineUsed(true);
  }

  function next() {
    if (!choice || finishedRef.current) return;
    if (index + 1 < questions.length) {
      setIndex(value => value + 1);
      setChoice(null);
      lockedRef.current = false;
      deadlineRef.current = Date.now() + 10000;
      setTimeLeft(10);
      setHiddenOptions([]);
      return;
    }
    finishedRef.current = true;
    try {
      const result = saveFlagRecord(window.localStorage, { score, total, date: new Date().toISOString() });
      setRecords(result.records);
      setStorageWarning(!result.saved);
    } catch { setStorageWarning(true); }
    setStage('result');
  }

  const expireQuestion = useEffectEvent(() => choose(null));
  const advanceQuestion = useEffectEvent(() => next());
  useEffect(() => {
    if (stage !== 'game' || choice !== null) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) expireQuestion();
    }, 100);
    return () => clearInterval(timer);
  }, [stage, choice, current]);
  useEffect(() => {
    if (stage !== 'game' || choice === null) return;
    const timer = setTimeout(() => advanceQuestion(), 2000);
    return () => clearTimeout(timer);
  }, [stage, choice, current]);

  return <main className="min-h-screen bg-page px-4 pb-16 pt-28 text-main sm:px-6">
    <div className="mx-auto max-w-5xl">
      <Link to="/geography" className="mb-7 inline-flex items-center gap-2 text-sm text-muted hover:text-main"><ArrowLeft size={17} /> Geografiyaga qaytish</Link>
      <div className="mb-9"><p className="mb-3 text-xs font-bold tracking-[.25em] text-amber-700 dark:text-amber-300">BAYROQLAR OLAMI</p><h1 className="text-3xl font-black sm:text-5xl">Bayroqni top!</h1><p className="mt-4 text-muted">Bayroqni ko‘ring, to‘rtta variantdan davlatni tanlang. Har to‘g‘ri javob — 1 ball.</p></div>
      <p className="mb-6 text-sm text-muted">Har savolga 10 soniya. Javobdan keyin keyingi savol avtomatik ochiladi. Har o‘yinda bir marta 50/50 yordamidan foydalanish mumkin.</p>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_280px]">
        <section className="rounded-3xl border border-line bg-panel p-5 sm:p-8" aria-label="Bayroq o‘yini">
          {stage === 'intro' && <div className="py-8 text-center"><Flag size={64} className="mx-auto text-amber-700 dark:text-amber-300" /><h2 className="mt-6 text-2xl font-bold">Bayroqlarni qanchalik yaxshi bilasiz?</h2><p className="mx-auto mt-4 max-w-md leading-7 text-muted">32 davlat ichidan {questionCount} ta tasodifiy bayroq. Savollar takrorlanmaydi. Yakunda eng yaxshi beshta natijangiz har bir savol soni uchun alohida saqlanadi.</p><fieldset className="mt-6"><legend className="mb-3 text-sm text-muted">Savollar soni</legend><div className="flex justify-center gap-3">{QUESTION_COUNTS.map(count => <button key={count} type="button" aria-pressed={questionCount === count} onClick={() => setQuestionCount(count)} className={`rounded-xl border px-5 py-3 font-bold ${questionCount === count ? 'border-amber-300 bg-amber-300 text-slate-950' : 'border-line bg-inset'}`}>{count} ta</button>)}</div></fieldset><button onClick={startGame} className="mt-8 inline-flex items-center gap-3 rounded-xl bg-amber-300 px-6 py-3 font-bold text-slate-950 hover:bg-amber-200">O‘yinni boshlash <ArrowRight size={19} /></button></div>}
          {stage === 'game' && current && <>
            <div className="mb-4 flex justify-between text-sm text-muted"><span>Savol {index + 1}/{total}</span><span>{score} ball</span></div>
            <progress aria-label="O‘yin davomiyligi" className="mb-6 h-2 w-full accent-amber-300" value={index + 1} max={total} />
            <div className="mb-5 flex items-center justify-between gap-3"><span role="timer" aria-label="Qolgan vaqt" className={`text-xl font-black ${timeLeft <= 3 ? 'text-rose-500' : 'text-main'}`}>00:{String(timeLeft).padStart(2, '0')}</span><button type="button" onClick={useFiftyFifty} disabled={lifelineUsed || choice !== null} className="rounded-xl border border-amber-300 bg-amber-300/10 px-4 py-2 font-bold disabled:opacity-40">50/50{lifelineUsed ? ' — ishlatildi' : ' — 1 imkoniyat'}</button></div>
            <div className="flex h-44 items-center justify-center rounded-2xl bg-panel/50 p-6 sm:h-52"><img key={current.country.code} src={`/flags/${current.country.code}.svg`} alt="Qaysi davlatning bayrog‘i?" className="max-h-full max-w-full object-contain shadow-xl" /></div>
            <h2 className="mb-4 mt-6 text-xl font-bold">Bu qaysi davlat?</h2>
            <div aria-label="Javob variantlari" className="grid gap-3 sm:grid-cols-2">{current.options.filter(option => !hiddenOptions.includes(option.code)).map(option => {
              const correct = choice !== null && option.code === current.country.code;
              const wrong = choice === option.code && !correct;
              return <button key={option.code} disabled={choice !== null} onClick={() => choose(option.code)} className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold transition disabled:cursor-default ${correct ? 'border-emerald-400 bg-emerald-400/15 text-emerald-700 dark:text-emerald-200' : wrong ? 'border-rose-400 bg-rose-400/15 text-rose-700 dark:text-rose-200' : 'border-line bg-inset enabled:hover:border-amber-300 enabled:hover:bg-amber-300/10'}`}>{correct ? '✓ ' : wrong ? '✗ ' : ''}{option.name}</button>;
            })}</div>
            {choice !== null && <div className="mt-5" role="status"><p className={choice === current.country.code ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>{choice === current.country.code ? 'To‘g‘ri javob! +1 ball' : `${choice === 'timeout' ? 'Vaqt tugadi! ' : ''}To‘g‘ri javob: ${current.country.name}`}</p><p className="mt-2 text-sm text-muted">{index + 1 === total ? 'Natija avtomatik ochiladi…' : 'Keyingi savol avtomatik ochiladi…'}</p></div>}
          </>}
          {stage === 'result' && <div className="py-8 text-center"><Trophy size={64} className="mx-auto text-amber-700 dark:text-amber-300" /><h2 className="mt-5 text-2xl font-bold">O‘yin yakunlandi!</h2><p className="mt-6 text-6xl font-black text-amber-700 dark:text-amber-300">{score}/{total}</p><p className="mt-4 text-muted">{Math.round(score / total * 100)}% to‘g‘ri javob</p><button onClick={startGame} className="mt-8 inline-flex items-center gap-3 rounded-xl bg-amber-300 px-6 py-3 font-bold text-slate-950"><RotateCcw size={18} /> Qayta o‘ynash</button><button onClick={() => setStage('intro')} className="mx-auto mt-4 block rounded-xl px-5 py-3 text-sm text-muted hover:text-main">Savollar sonini o‘zgartirish</button></div>}
        </section>
        <aside className="rounded-3xl border border-amber-300/20 bg-panel p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><Trophy size={20} className="text-amber-700 dark:text-amber-300" /> Rekordlar</h2><p className="mt-2 text-xs leading-5 text-subtle">{questionCount} ta savollik o‘yin uchun eng yaxshi 5 natija.</p>{modeRecords.length ? <ol className="mt-5 space-y-3">{modeRecords.map((record,i) => <li key={`${record.date}-${i}`} className="flex justify-between gap-3 rounded-xl bg-inset p-3"><div><p className="text-sm font-semibold">{i + 1}-o‘rin</p><p className="mt-1 text-xs text-subtle">{new Date(record.date).toLocaleDateString('uz-UZ')}</p></div><span className="font-bold text-amber-700 dark:text-amber-300">{record.score}/{record.total}</span></li>)}</ol> : <p className="mt-6 text-sm text-subtle">Birinchi rekordingizni o‘rnating!</p>}{storageWarning && <p role="status" className="mt-4 text-sm text-amber-700 dark:text-amber-200">Brauzer saqlashga ruxsat bermadi. Natija faqat shu sessiyada ko‘rinadi.</p>}<p className="mt-6 text-xs text-subtle">Bayroqlar: FlagCDN. Tasvirlar sayt ichidan yuklanadi.</p></aside>
      </div>
    </div>
  </main>;
}
