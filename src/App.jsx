import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  sendPasswordResetEmail, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, getDoc, addDoc, updateDoc, 
  onSnapshot, deleteDoc, getDocs, increment 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Copy, Plus, Trash2, LogOut, User, Zap, Tag, MapPin, 
  ExternalLink, Link2, Search, Instagram, Eye, LayoutDashboard, 
  Settings, Users, Activity, BarChart3, Image as ImageIcon, Lock, 
  ChevronRight, AlertCircle, Globe, Smartphone, MousePointer2, TrendingUp, CheckCircle,
  Youtube, Twitter, Music, Mail, Code, MessageCircle, X, Send,
  Star, Timer, Bell, Crown, Clock, CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ==========================================
// 1. CONFIGURACIÓN FIREBASE 
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBwZyz9UqDCGY7wbO2B2cGPSAkqebx4iV4",
  authDomain: "top-codes-7208c.firebaseapp.com",
  projectId: "top-codes-7208c",
  storageBucket: "top-codes-7208c.firebasestorage.app",
  messagingSenderId: "960236695146",
  appId: "1:960236695146:web:4963cc8d4faffa47d26413",
  measurementId: "G-RCTZTKDHHK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = 'topcodes-mvp-v1';

const CATEGORIES = ["Salud y Belleza", "Deportes", "Moda y Estilo", "Tecnología", "Lifestyle", "Viajes", "Fitness", "Gaming"];

// ==========================================
// 2. CONFIGURACIÓN DE MARCA (LOGO)
// ==========================================
const BRAND_LOGO_URL = ""; 

const BrandLogo = ({ size = 32, className = "" }) => {
  if (BRAND_LOGO_URL) {
    return <img src={BRAND_LOGO_URL} alt="TopCodes Logo" style={{ width: size, height: size, objectFit: 'contain' }} className={className} />;
  }
  return <Zap size={size} className={className} />;
};

// ==========================================
// COMPONENTE PRINCIPAL (ENRUTADOR)
// ==========================================
export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <DashboardLayout user={user} /> : <LandingPage />} />
        <Route path="/admin-master" element={<SuperAdmin />} />
        <Route path="/:username" element={<PublicSpot />} />
      </Routes>
    </Router>
  );
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <BrandLogo size={50} className="animate-pulse text-[#d1ff64] fill-black" />
  </div>
);

// ==========================================
// COMPONENTE: TEMPORIZADOR FOMO
// ==========================================
function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('EXPIRADO');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return null;
  
  return (
    <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 animate-pulse w-max mt-3">
      <Timer size={14} /> Expira en: {timeLeft}
    </div>
  );
}

// ==========================================
// VISTA: LANDING PAGE & AUTENTICACIÓN (ESTRATEGIA VELVET ROPE)
// ==========================================
function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [igUser, setIgUser] = useState('');
  const [category, setCategory] = useState('');
  const [cities, setCities] = useState('');
  const [inviteCode, setInviteCode] = useState(''); 
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const SECRET_CODE_FOUNDERS = 'FOUNDERS26'; 
  const SECRET_CODE_BETA = 'BETA50'; 
  
  const isUnlockedFounders = inviteCode.trim().toUpperCase() === SECRET_CODE_FOUNDERS;
  const isUnlockedBeta = inviteCode.trim().toUpperCase() === SECRET_CODE_BETA;
  const isUnlocked = isUnlockedFounders || isUnlockedBeta;

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cleanUser = igUser.replace('@', '').trim().toLowerCase();
        
        if (isUnlocked) {
          const userCheck = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', cleanUser));
          if (userCheck.exists()) throw new Error("Este usuario de IG ya está registrado.");

          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;
          
          const assignedPlan = isUnlockedFounders ? 'Founder (1 Año Gratis)' : 'Beta 50 (1 Mes Gratis)';
          
          const profileData = { 
            username: cleanUser, email, category, cities, bio: 'Bienvenido a mi Spot',
            photoUrl: '', views: 0, createdAt: new Date().toISOString(),
            plan: assignedPlan
          };
          
          await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'), profileData);
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', cleanUser), { uid, ...profileData });
        } else {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'waitlist'), {
            instagram: cleanUser,
            email: email,
            timestamp: new Date().toISOString()
          });
          setMsg('🎉 ¡Estás en la lista VIP! Si eres de los primeros 50, recibirás tu código de 1 MES GRATIS por correo.');
          setEmail(''); setIgUser(''); setInviteCode('');
        }
      }
    } catch (err) { setError(err.message); }
  };

  const handleResetPassword = async () => {
    if (!email) return setError('Ingresa tu correo para resetear la contraseña.');
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('Correo de recuperación enviado. Revisa tu bandeja o carpeta de Spam.');
    } catch (err) { setError('Error al enviar correo.'); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      <div className="flex flex-col justify-center w-full lg:w-1/2 bg-black text-white p-8 sm:p-16 lg:p-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><Crown size={250} className="lg:w-[400px] lg:h-[400px]"/></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 lg:mb-12">
             <BrandLogo size={32} className="text-[#d1ff64] fill-current" />
             <span className="font-black text-2xl lg:text-3xl tracking-widest uppercase">TopCodes</span>
          </div>
          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6 lg:mb-8">La élite no paga <br/><span className="text-[#d1ff64]">comisiones.</span></h1>
          <p className="text-slate-400 text-lg lg:text-xl max-w-lg leading-relaxed mb-6">
            Linktree te cobra el 12% por vender. Nosotros te cobramos <strong className="text-white">$99 MXN al mes. Punto.</strong>
          </p>
          <ul className="space-y-4 lg:space-y-6 text-base lg:text-lg font-bold text-slate-300">
            <li className="flex items-start gap-3 lg:gap-4">
              <CheckCircle size={20} className="text-[#d1ff64] shrink-0 mt-1"/> 
              <div><strong className="text-white">Un solo pago, 0% comisiones.</strong> Tú te quedas con todo lo que generes en ventas o reservas.</div>
            </li>
            <li className="flex items-start gap-3 lg:gap-4">
              <CheckCircle size={20} className="text-[#d1ff64] shrink-0 mt-1"/> 
              <div><strong className="text-white">Tu página, tu dominio propio.</strong> Protege tu marca personal y obtén un escudo anti-baneo de Instagram (Shadowban safe).</div>
            </li>
            <li className="flex items-start gap-3 lg:gap-4">
              <CheckCircle size={20} className="text-[#d1ff64] shrink-0 mt-1"/> 
              <div><strong className="text-white">Mucho más que descuentos.</strong> Comparte tus productos propios, reserva de clases (ej. Síclo), renta de Airbnbs y eventos en un solo lugar.</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
             <BrandLogo size={48} className="text-black fill-[#d1ff64] mx-auto mb-4" />
             <h1 className="text-4xl font-black uppercase tracking-tighter italic">TopCodes</h1>
          </div>
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <div className="flex flex-wrap gap-4 sm:gap-6 mb-10 border-b border-slate-100">
              <button onClick={() => { setIsLogin(true); setError(''); setMsg(''); }} className={`pb-4 font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all ${isLogin ? 'border-b-4 border-[#d1ff64] text-black' : 'text-slate-300 hover:text-black'}`}>Ingresar</button>
              <button onClick={() => { setIsLogin(false); setError(''); setMsg(''); }} className={`pb-4 font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all ${!isLogin ? 'border-b-4 border-[#d1ff64] text-black' : 'text-slate-300 hover:text-black'}`}>Acceso VIP</button>
              <RouterLink to="/demo" className="pb-4 font-black uppercase tracking-widest text-[10px] sm:text-xs text-blue-500 hover:text-blue-600 transition-all flex items-center gap-1 ml-auto"><Eye size={14}/> Ver Demo</RouterLink>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
            {msg && <div className="bg-green-50 text-green-600 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2"><CheckCircle size={14}/> {msg}</div>}
            
            <form onSubmit={handleAuth} className="space-y-4">
              {isLogin ? (
                <>
                  <input type="email" placeholder="Correo Electrónico" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={email} onChange={e=>setEmail(e.target.value)}/>
                  <input type="password" placeholder="Contraseña" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={password} onChange={e=>setPassword(e.target.value)}/>
                  <button type="submit" className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl mt-4">Acceder al Spot</button>
                  <div className="mt-8 text-center"><button onClick={handleResetPassword} type="button" className="text-[10px] font-black uppercase text-slate-400 hover:text-black tracking-widest transition-colors">¿Olvidaste tu contraseña?</button></div>
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-slate-900 p-4 rounded-2xl mb-6 border border-slate-800 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-2 opacity-10"><Zap size={60}/></div>
                     <p className="text-[10px] text-[#d1ff64] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={12}/> Beta Cerrada</p>
                     <p className="text-xs text-slate-300 font-bold leading-relaxed">Únete a la lista de espera. Los primeros <strong className="text-white">50 creadores</strong> en entrar recibirán <strong className="text-[#d1ff64]">1 Mes de TopCodes PRO Gratis</strong>.</p>
                  </div>
                  
                  <input type="text" placeholder="Usuario de Instagram (@...)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={igUser} onChange={e=>setIgUser(e.target.value)}/>
                  <input type="email" placeholder="Tu mejor correo electrónico" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={email} onChange={e=>setEmail(e.target.value)}/>
                  
                  <input type="text" placeholder="Código de Invitación (Opcional)" className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-black uppercase transition-colors" value={inviteCode} onChange={e=>setInviteCode(e.target.value)}/>

                  {isUnlocked && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-4">
                      <p className="text-[10px] font-black text-green-500 uppercase tracking-widest text-center flex items-center justify-center gap-1">
                        <Lock size={12} className="opacity-50"/> 
                        {isUnlockedFounders ? 'Acceso Founder (1 Año Gratis 👑)' : 'Acceso Beta (1 Mes Gratis 🚀)'}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={category} onChange={e=>setCategory(e.target.value)}><option value="">Nicho</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <input type="text" placeholder="Ciudades" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={cities} onChange={e=>setCities(e.target.value)}/>
                      </div>
                      <input type="password" placeholder="Crea tu contraseña" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={password} onChange={e=>setPassword(e.target.value)}/>
                    </div>
                  )}

                  <button type="submit" className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl mt-4 ${isUnlocked ? 'bg-[#d1ff64] text-black' : 'bg-black text-white'}`}>
                    {isUnlocked ? 'Crear mi Spot Ahora' : 'Unirme a la Lista de Espera'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// DATOS DE DEMOSTRACIÓN (PERFIL PERFECTO)
// ==========================================
const DEMO_PROFILE = {
  uid: 'demo_user_123',
  username: 'topbot',
  category: 'Inteligencia Artificial',
  cities: 'TopCodes HQ',
  bio: '¡Hola! ⚡️ Soy TopBot. Este es un Spot de demostración para que descubras cómo lucirá tu imperio digital cuando te unas a la elite. 👇',
  photoUrl: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&q=80',
  tiktokUrl: 'https://tiktok.com',
  youtubeUrl: 'https://youtube.com',
  instagramUrl: 'https://instagram.com'
};

const DEMO_PROMOTIONS = [
  // EL HERO DEAL (Destacado con FOMO)
  { id: 'd1', type: 'deal', isHero: true, brandName: 'Sephora', discount: '20% OFF en toda la tienda', code: 'TOPBOT20', brandDomain: 'sephora.com.mx', logoUrl: 'https://www.google.com/s2/favicons?domain=sephora.com.mx&sz=256', originalUrl: '#', expiresAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16), stats: { totalClicks: 3420 } },

  // LINKS Y NEGOCIOS PROPIOS
  { id: 'l1', type: 'link', brandName: 'Reserva mi clase en Síclo 🚴‍♀️', brandDomain: 'siclo.com', logoUrl: 'https://www.google.com/s2/favicons?domain=siclo.com&sz=256', originalUrl: '#', stats: { totalClicks: 1240 } },
  { id: 'l2', type: 'link', brandName: 'Escucha mi Podcast en Spotify 🎙️', brandDomain: 'spotify.com', logoUrl: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=256', originalUrl: '#', stats: { totalClicks: 850 } },
  { id: 'l3', type: 'link', brandName: 'Mi E-Book: Creadores 2026 📖', brandDomain: 'amazon.com', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=256', originalUrl: '#', stats: { totalClicks: 530 } },

  // DEALS REGULARES (Grilla de marcas)
  { id: 'd2', type: 'deal', brandName: 'Nike', discount: '15% OFF Tenis', code: 'NIKETOPBOT', brandDomain: 'nike.com', logoUrl: 'https://www.google.com/s2/favicons?domain=nike.com&sz=256', originalUrl: '#', stats: { totalClicks: 2100 } },
  { id: 'd3', type: 'deal', brandName: 'Alo Yoga', discount: '10% OFF Nueva Colección', code: 'ALO10', brandDomain: 'aloyoga.com', logoUrl: 'https://www.google.com/s2/favicons?domain=aloyoga.com&sz=256', originalUrl: '#', stats: { totalClicks: 1850 } },
  { id: 'd4', type: 'deal', brandName: 'Dyson', discount: '15% OFF Airwrap', code: 'DYSONVIP', brandDomain: 'dyson.com.mx', logoUrl: 'https://www.google.com/s2/favicons?domain=dyson.com.mx&sz=256', originalUrl: '#', stats: { totalClicks: 1540 } },
  { id: 'd5', type: 'deal', brandName: 'MyProtein', discount: '25% OFF Suplementos', code: 'TOPPROTEIN', brandDomain: 'myprotein.com', logoUrl: 'https://www.google.com/s2/favicons?domain=myprotein.com&sz=256', originalUrl: '#', stats: { totalClicks: 1200 } },
  { id: 'd6', type: 'deal', brandName: 'Lululemon', discount: 'Envío Gratis', code: 'LULUFREE', brandDomain: 'lululemon.com', logoUrl: 'https://www.google.com/s2/favicons?domain=lululemon.com&sz=256', originalUrl: '#', stats: { totalClicks: 980 } },
  { id: 'd7', type: 'deal', brandName: 'Oura Ring', discount: '10% OFF Smart Ring', code: 'OURABOT', brandDomain: 'ouraring.com', logoUrl: 'https://www.google.com/s2/favicons?domain=ouraring.com&sz=256', originalUrl: '#', stats: { totalClicks: 890 } },
  { id: 'd8', type: 'deal', brandName: 'ELLAZ', discount: '15% OFF Boob Tape', code: 'ELLAZBOT', brandDomain: 'ellaz.com', logoUrl: 'https://www.google.com/s2/favicons?domain=ellaz.com&sz=256', originalUrl: '#', stats: { totalClicks: 750 } },
  { id: 'd9', type: 'deal', brandName: 'Uber Eats', discount: '$150 MXN de regalo', code: 'EATSBOT', brandDomain: 'ubereats.com', logoUrl: 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=256', originalUrl: '#', stats: { totalClicks: 620 } },
  { id: 'd10', type: 'deal', brandName: 'Kiko Milano', discount: '20% OFF Makeup', code: 'KIKO20', brandDomain: 'kikocosmetics.com', logoUrl: 'https://www.google.com/s2/favicons?domain=kikocosmetics.com&sz=256', originalUrl: '#', stats: { totalClicks: 500 } }
];

// ==========================================
// VISTA: THE SPOT PÚBLICO 
// (NUEVA DUALIDAD: DEALS VS LINKS PERSONALES)
// ==========================================
function PublicSpot() {
  const { username } = useParams();
  const [publicProfile, setPublicProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [vipEmail, setVipEmail] = useState('');
  const [leadMsg, setLeadMsg] = useState('');

  useEffect(() => {
    const fetchPublicData = async () => {
      // MAGIA DEL DEMO: Si la ruta es /demo, inyectamos la base de datos falsa
      if (username.toLowerCase() === 'demo') {
        setPublicProfile(DEMO_PROFILE);
        setPromotions(DEMO_PROMOTIONS);
        return;
      }

      // FLUJO NORMAL: Buscar en Firebase para usuarios reales
      const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', username.toLowerCase());
      const profileDoc = await getDoc(profileRef);
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        setPublicProfile(profileData);
        updateDoc(profileRef, { views: increment(1) });
        updateDoc(doc(db, 'artifacts', appId, 'users', profileData.uid, 'settings', 'profile'), { views: increment(1) });
        onSnapshot(collection(db, 'artifacts', appId, 'users', profileData.uid, 'promotions'), (snap) => {
          setPromotions(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
        });
      }
    };
    fetchPublicData();
  }, [username]);

  const handleClick = async (promo) => {
    if (promo.code && promo.type !== 'link') {
      const el = document.createElement('textarea'); el.value = promo.code; document.body.appendChild(el);
      el.select(); document.execCommand('copy'); document.body.removeChild(el);
    }
    const promoRef = doc(db, 'artifacts', appId, 'users', publicProfile.uid, 'promotions', promo.id);
    updateDoc(promoRef, { "stats.totalClicks": increment(1) });
    window.open(promo.trackedUrl, '_blank');
  };

  const handleLeadCapture = async (e) => {
    e.preventDefault();
    if(!vipEmail) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', publicProfile.uid, 'leads'), { email: vipEmail, timestamp: new Date().toISOString() });
      setLeadMsg('¡Gracias! Te avisaremos pronto.');
      setVipEmail('');
      setTimeout(() => setLeadMsg(''), 4000);
    } catch (err) { setLeadMsg('Error al unirse.'); }
  };

  if (!publicProfile) return <LoadingScreen />;

  // 🟢 FILTROS INTELIGENTES PARA LA VISTA PÚBLICA
  const heroDeal = promotions.find(p => p.isHero && p.type !== 'link');
  const regularDeals = promotions.filter(p => !p.isHero && p.type !== 'link' && p.brandName.toLowerCase().includes(searchTerm.toLowerCase()));
  const standardLinks = promotions.filter(p => p.type === 'link' && p.brandName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-sans pb-20 p-6 relative">
      <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-1000 relative z-10">
        
        {/* HEADER PERFIL */}
        <header className="text-center mb-10 mt-10">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-2 rounded-[3.5rem] shadow-2xl mx-auto mb-6 border border-slate-100 overflow-hidden flex items-center justify-center bg-slate-50 transition-transform hover:scale-105">
            {publicProfile.photoUrl ? <img src={publicProfile.photoUrl} className="w-full h-full object-cover" /> : <User size={50} className="text-slate-200" />}
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">@{publicProfile.username}</h2>
          <p className="text-sm md:text-base font-bold text-slate-400 mt-4 max-w-lg mx-auto italic">{publicProfile.bio}</p>
          <div className="flex justify-center gap-3 mt-6">
            <a href={`https://instagram.com/${publicProfile.username}`} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-pink-600"><Instagram size={20} /></a>
            {publicProfile.tiktokUrl && <a href={publicProfile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-black"><Music size={20} /></a>}
            {publicProfile.youtubeUrl && <a href={publicProfile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-red-600"><Youtube size={20} /></a>}
          </div>
        </header>

        {/* ECOSISTEMA B2B: CAPTURA DE LEADS */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-black text-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-800 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><Bell size={80}/></div>
             <h3 className="text-sm font-black uppercase tracking-widest text-[#d1ff64] mb-2 relative z-10 flex items-center justify-center gap-2"><Star size={16} className="fill-current"/> VIP List</h3>
             <p className="text-xs font-bold text-slate-300 mb-4 relative z-10">Déjame tu correo y sé el primero en recibir mis códigos de descuento antes de que se agoten en Stories.</p>
             {leadMsg ? (
                <div className="bg-[#d1ff64] text-black py-3 rounded-2xl text-xs font-black uppercase tracking-widest animate-in zoom-in">{leadMsg}</div>
             ) : (
                <form onSubmit={handleLeadCapture} className="flex gap-2 relative z-10">
                  <input type="email" placeholder="Tu correo electrónico" required className="flex-1 bg-white/10 border-none rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64] text-white" value={vipEmail} onChange={e=>setVipEmail(e.target.value)}/>
                  <button type="submit" className="bg-[#d1ff64] text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform text-xs">Unirme</button>
                </form>
             )}
          </div>
        </div>

        {/* ANTI-FATIGA DE DECISIÓN: EL HERO DEAL */}
        {heroDeal && (!searchTerm || heroDeal.brandName.toLowerCase().includes(searchTerm.toLowerCase())) && (
          <div className="max-w-2xl mx-auto mb-12">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 text-center">Top Deal del Día</h3>
            <button onClick={()=>handleClick(heroDeal)} className="w-full bg-[#faffea] p-8 rounded-[3rem] shadow-lg border border-[#d1ff64] flex flex-col items-center text-center hover:scale-[1.02] active:scale-95 transition-all group relative outline-none overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#d1ff64] to-yellow-400"></div>
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center font-black text-black text-2xl shadow-xl mb-6 overflow-hidden border border-slate-100">
                  {heroDeal.logoUrl ? <img src={heroDeal.logoUrl} className="w-full h-full object-cover p-2"/> : heroDeal.brandName[0].toUpperCase()}
               </div>
               <h4 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em] mb-2">{heroDeal.brandName}</h4>
               <p className="text-4xl font-black tracking-tighter text-black leading-tight mb-4">{heroDeal.discount}</p>
               <div className="bg-black text-[#d1ff64] px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm shadow-md group-hover:bg-slate-800 transition-colors">
                  {heroDeal.code ? 'Copiar Código y Comprar' : 'Ir a la Tienda'}
               </div>
               {heroDeal.expiresAt && <CountdownTimer targetDate={heroDeal.expiresAt} />}
            </button>
          </div>
        )}

        {/* BUSCADOR */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="Buscar marcas, códigos o enlaces..." className="w-full bg-white border-none rounded-[2rem] py-5 pl-16 pr-6 shadow-sm font-bold text-base outline-none focus:ring-2 focus:ring-black transition-all" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
        </div>

        {/* SECCIÓN 1: DEALS DE MARCA (GRID) */}
        {regularDeals.length > 0 && (
          <div className="mb-12">
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 text-center">Códigos Exclusivos</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {regularDeals.map(promo => (
                  <button key={promo.id} onClick={()=>handleClick(promo)} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between h-64 text-left hover:border-black hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute -top-4 -right-4 opacity-[0.02] text-black group-hover:opacity-[0.05] transition-opacity"><Zap size={120} /></div>
                    <div className="flex justify-between items-start relative z-10 w-full">
                      <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center font-black text-[#d1ff64] text-lg shadow-lg overflow-hidden border border-slate-800 p-1">
                        {promo.logoUrl ? <img src={promo.logoUrl} className="w-full h-full object-cover bg-white rounded-xl"/> : (promo.brandName ? promo.brandName[0].toUpperCase() : '?')}
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:bg-[#d1ff64] group-hover:text-black transition-colors"><ExternalLink size={16} /></div>
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1 truncate">{promo.brandName}</h4>
                      <p className="text-2xl font-black tracking-tighter text-black leading-tight mb-4 truncate">{promo.discount}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 group-hover:text-black transition-colors">{promo.code ? 'Copiar Código' : 'Ir a la tienda'}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        )}

        {/* 🟢 SECCIÓN 2: LINKS NORMALES / PROYECTOS (LISTA BEACONS/LINKTREE STYLE) */}
        {standardLinks.length > 0 && (
          <div className="mt-16 mb-8 max-w-2xl mx-auto">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 text-center">Mis Enlaces</h3>
            <div className="space-y-4">
              {standardLinks.map(link => (
                <button key={link.id} onClick={() => handleClick(link)} className="w-full bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 hover:border-black hover:shadow-md transition-all group active:scale-[0.98]">
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                     {link.logoUrl ? <img src={link.logoUrl} className="w-full h-full object-cover p-2"/> : <Link2 size={20} className="text-slate-400"/>}
                   </div>
                   <span className="flex-1 text-left font-black text-lg text-slate-800 group-hover:text-black transition-colors truncate">{link.brandName}</span>
                   <div className="w-12 h-12 bg-slate-50 rounded-[1rem] flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-[#d1ff64] transition-colors shadow-sm"><ChevronRight size={20}/></div>
                </button>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-24 text-center opacity-30 flex items-center justify-center gap-2">
           <BrandLogo size={14}/>
           <p className="text-[9px] font-black uppercase tracking-[0.5em]">Powered by TopCodes</p>
        </footer>
      </div>
    </div>
  );
}