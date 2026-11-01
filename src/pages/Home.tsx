import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavLoader } from "@/App";
import {
  ArrowRight, Bot, Check, ChevronDown, Code2, Cpu, Menu, MessageCircle,
  Rocket, ShieldCheck, Sparkles, X, Zap
} from "lucide-react";

function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <img
      src="/logo/icon.png"
      alt="GestonX"
      width={size}
      height={size}
      className="object-contain shrink-0"
      draggable={false}
    />
  );
}

const NAV = [
  ["Accueil", "#home"],
  ["Fonctionnalités", "#features"],
  ["Comment ça marche", "#how"],
  ["FAQ", "#faq"],
];

const FEATURES = [
  { icon: Bot, title: "Bots WhatsApp", text: "Une interface claire pour gérer et connecter vos bots WhatsApp sans configuration inutile." },
  { icon: Zap, title: "Rapide", text: "Une expérience légère, fluide et optimisée pour mobile comme pour ordinateur." },
  { icon: ShieldCheck, title: "Simple & sécurisé", text: "Vos actions importantes sont regroupées dans une interface propre et protégée." },
  { icon: Code2, title: "Pensé pour Geston-MD", text: "Une interface moderne construite autour de l'écosystème Geston-MD." },
];

const FAQ = [
  ["Le service est-il gratuit ?", "Oui. Cette version du site ne contient aucun système de paiement, aucun abonnement et aucun achat."],
  ["Y a-t-il des réseaux sociaux à gérer ?", "Non. Toute la partie Social Media / Boosting a été retirée de l'interface."],
  ["Le site fonctionne-t-il sur téléphone ?", "Oui. L'interface est responsive et pensée d'abord pour une utilisation mobile."],
  ["Puis-je le déployer sur Vercel ?", "Oui. Le frontend est une application Vite/React et peut être déployé sur Vercel."],
];

export default function Home() {
  const { user } = useAuth();
  const { navigateWithLoader } = useNavLoader();
  const [menu, setMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (path: string) => {
    setMenu(false);
    navigateWithLoader(path);
  };

  return (
    <main id="home" className="ice-site min-h-screen overflow-hidden bg-[#050608] text-white">
      <div className="ice-noise" aria-hidden />
      <div className="ice-orb ice-orb-a" aria-hidden />
      <div className="ice-orb ice-orb-b" aria-hidden />

      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "ice-nav-scrolled" : ""}`}>
        <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => go("/")} className="flex items-center gap-3">
            <span className="ice-logo"><BrandMark size={34} /></span>
            <span className="text-[15px] font-semibold tracking-tight">Geston<span className="text-white/45"> Hosting</span></span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="ice-nav-link">{label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!user && (
              <button onClick={() => go("/login")} className="hidden sm:inline-flex ice-ghost-btn">Connexion</button>
            )}
            <button onClick={() => go(user ? "/dashboard" : "/signup")} className="ice-primary-btn hidden sm:inline-flex">
              {user ? "Tableau de bord" : "Commencer gratuitement"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => setMenu(!menu)} className="md:hidden ice-icon-btn" aria-label="Menu">
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menu && (
          <div className="md:hidden mx-3 mt-1 rounded-2xl border border-white/10 bg-black/75 p-3 backdrop-blur-2xl">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenu(false)} className="block rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white">{label}</a>
            ))}
            <button onClick={() => go(user ? "/dashboard" : "/signup")} className="ice-primary-btn mt-2 w-full justify-center">
              {user ? "Tableau de bord" : "Commencer gratuitement"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      <section className="relative mx-auto max-w-6xl px-4 pb-24 pt-36 sm:px-6 sm:pt-44 lg:pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="ice-pill mx-auto mb-7 w-fit">
            <span className="ice-live-dot" />
            100% GRATUIT · AUCUN PAIEMENT
          </div>

          <h1 className="ice-title">
            Votre espace <span>Geston-MD</span>,<br />
            repensé en <i>liquide glace.</i>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
            Une plateforme sombre, élégante et ultra-fluide pour gérer votre expérience Geston-MD.
            Sans abonnements, sans recharge et sans section réseaux sociaux.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => go(user ? "/dashboard" : "/signup")} className="ice-primary-btn ice-primary-large">
              {user ? "Ouvrir mon espace" : "Commencer gratuitement"}
              <ArrowRight className="h-5 w-5" />
            </button>
            <a href="#features" className="ice-secondary-btn">Découvrir la plateforme</a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-x-7 gap-y-3 text-xs text-white/40">
            {["Sans paiement", "Sans abonnement", "Sans boosting", "Responsive mobile"].map((x) => (
              <span key={x} className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-300/80" />{x}</span>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-5xl">
          <div className="ice-window">
            <div className="ice-window-bar">
              <div className="flex gap-1.5"><span/><span/><span/></div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-white/25">geston hosting</span>
              <span className="h-2 w-12 rounded-full bg-white/5"/>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr] sm:p-6">
              <aside className="hidden rounded-2xl border border-white/7 bg-white/[0.025] p-3 sm:block">
                <div className="mb-5 flex items-center gap-2 px-2"><BrandMark size={24}/><span className="text-xs font-semibold">Geston</span></div>
                {["Overview", "Bots WhatsApp", "Documentation", "Support"].map((x, i) => (
                  <div key={x} className={`mb-1 rounded-xl px-3 py-2.5 text-[11px] ${i === 0 ? "bg-white/8 text-white" : "text-white/35"}`}>{x}</div>
                ))}
              </aside>
              <div className="space-y-4">
                <div className="ice-dashboard-card flex items-center justify-between">
                  <div><p className="text-[10px] uppercase tracking-widest text-white/30">Statut</p><p className="mt-1 text-xl font-semibold">Tout est prêt.</p></div>
                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-3"><Sparkles className="h-5 w-5 text-cyan-200"/></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="ice-dashboard-card">
                    <Bot className="mb-5 h-5 w-5 text-cyan-200"/>
                    <p className="font-medium">Geston-MD</p><p className="mt-1 text-xs leading-5 text-white/35">Gestion et connexion de votre bot.</p>
                    <button onClick={() => go(user ? "/dashboard" : "/signup")} className="mt-5 text-xs font-medium text-cyan-200">Ouvrir <ArrowRight className="ml-1 inline h-3.5 w-3.5"/></button>
                  </div>
                  <div className="ice-dashboard-card">
                    <Cpu className="mb-5 h-5 w-5 text-white/60"/>
                    <p className="font-medium">Performance</p><p className="mt-1 text-xs leading-5 text-white/35">Interface légère et optimisée.</p>
                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full w-[92%] rounded-full bg-gradient-to-r from-cyan-300/50 to-white/70"/></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <div className="ice-section-kicker">PLATEFORME</div>
          <h2 className="ice-section-title">Tout ce qu'il faut.<br/><span>Rien de superflu.</span></h2>
          <p className="mt-5 text-sm leading-6 text-white/45">Nous avons retiré les paiements et les fonctions sociales pour garder une plateforme dédiée à Geston-MD.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({icon: Icon, title, text}) => (
            <article key={title} className="ice-feature-card">
              <div className="ice-feature-icon"><Icon className="h-5 w-5"/></div>
              <h3 className="mt-6 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/40">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
        <div className="ice-process">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="ice-section-kicker">EXPÉRIENCE</div>
              <h2 className="ice-section-title">Simple dès la<br/><span>première seconde.</span></h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["01", "Créez votre compte", "Inscription gratuite et rapide."],
                ["02", "Ouvrez votre espace", "Retrouvez vos outils dans un seul endroit."],
                ["03", "Connectez Geston-MD", "Utilisez les fonctions disponibles pour votre bot."],
                ["04", "Profitez", "Aucun paiement ni abonnement à gérer."],
              ].map(([n,t,d]) => <div key={n} className="ice-step"><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="relative mx-auto max-w-3xl scroll-mt-24 px-4 py-24 sm:px-6">
        <div className="text-center">
          <div className="ice-section-kicker">FAQ</div>
          <h2 className="ice-section-title">Questions <span>fréquentes.</span></h2>
        </div>
        <div className="mt-10 space-y-2">
          {FAQ.map(([q,a], i) => (
            <div key={q} className="ice-faq">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-5 p-5 text-left">
                <span className="font-medium">{q}</span><ChevronDown className={`h-4 w-4 text-white/35 transition-transform ${openFaq === i ? "rotate-180" : ""}`}/>
              </button>
              {openFaq === i && <div className="px-5 pb-5 text-sm leading-6 text-white/45">{a}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="ice-cta">
          <div className="relative z-10">
            <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 p-2"><MessageCircle className="h-5 w-5 text-cyan-200"/></div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Prêt à utiliser Geston-MD ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/45">Une interface professionnelle, sombre et glacée. Gratuitement.</p>
            <button onClick={() => go(user ? "/dashboard" : "/signup")} className="ice-primary-btn mt-7">
              Commencer maintenant <Rocket className="h-4 w-4"/>
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/7 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-white/30 sm:flex-row">
          <div className="flex items-center gap-2"><BrandMark size={22}/> GestonX</div>
          <p>© {new Date().getFullYear()} GestonX · Gratuit</p>
          <a href="#home" className="hover:text-white/60">Retour en haut ↑</a>
        </div>
      </footer>
    </main>
  );
}
