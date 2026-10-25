import { Component } from 'react';
import { Link, useLocation } from 'react-router-dom';

class PageBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="flex min-h-dvh items-center justify-center bg-page px-6 pt-24 text-main">
      <div role="alert" className="max-w-md rounded-2xl border border-line bg-panel p-7 text-center">
        <h1 className="text-2xl font-bold">Sahifani ochib bo‘lmadi</h1>
        <p className="mt-3 leading-7 text-muted">Ulanishni tekshirib, sahifani qayta yuklang yoki bosh sahifaga qayting.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Qayta yuklash</button>
        <Link to="/" className="mt-4 block text-sm text-muted underline">Bosh sahifaga qaytish</Link>
      </div>
    </main>;
  }
}

export default function PageErrorBoundary({children}) {
  const location = useLocation();
  return <PageBoundary key={location.pathname}>{children}</PageBoundary>;
}
