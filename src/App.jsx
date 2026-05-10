import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link as RouterLink } from 'react-router-dom';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  sendPasswordResetEmail, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, getDoc, addDoc, updateDoc, 
  onSnapshot, deleteDoc, getDocs, increment, query, where 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Copy, Plus, Trash2, LogOut, User, Zap, Tag, MapPin, 
  ExternalLink, Link2, Search, Instagram, Eye, LayoutDashboard, 
  Settings, Users, Activity, BarChart3, Image as ImageIcon, Lock, 
  ChevronRight, AlertCircle, Globe, Smartphone, MousePointer2, TrendingUp, CheckCircle,
  Youtube, Twitter, Music, Mail, Code, MessageCircle, X, Send,
  Star, Timer, Bell, Crown, Clock, CheckCircle2, Award, ArrowUpRight,
  Twitch, Headphones 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

// ==========================================
// 1. CONFIGURACIÓN FIREBASE (Protegida)
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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = 'topcodes-mvp-v1';

const CATEGORIES = ["Salud y Belleza", "Deportes", "Moda y Estilo", "Tecnología", "Lifestyle", "Viajes", "Fitness", "Gaming"];

// ==========================================
// 2. CONFIGURACIÓN DE MARCA (LOGO Y CONTACTO)
// ==========================================
const BRAND_LOGO_URL = ""; 
const SUPPORT_EMAIL = "contacto@topcodes.lat"; 
const BASE_DOMAIN = "https://topcodes.lat"; 

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
        <Route path="/demo/panel" element={<DemoDashboardLayout />} />
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
// VISTA: LANDING PAGE & AUTENTICACIÓN
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
  const isUnlockedFounders = inviteCode.trim().toUpperCase() === SECRET_CODE_FOUNDERS;

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(''); 
    setMsg('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cleanUser = igUser.replace('@', '').trim().toLowerCase();
        
        // Si ingresa el código Founder, crea la cuenta de inmediato (Bypass de aprobación)
        if (isUnlockedFounders) {
          const userCheck = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', cleanUser));
          if (userCheck.exists()) throw new Error("Este usuario de IG ya está registrado.");

          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;
          
          const profileData = { 
            username: cleanUser, email, category, cities, bio: 'Bienvenido a mi Spot',
            photoUrl: '', views: 0, createdAt: new Date().toISOString(),
            plan: 'Founder Elite (Prueba 3 Meses)'
          };
          
          await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'), profileData);
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', cleanUser), { uid, ...profileData });
        } else {
          // Registro regular: Se va a la base de datos de aprobación
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'waitlist'), {
            instagram: cleanUser,
            email: email,
            status: 'pending_approval',
            timestamp: new Date().toISOString()
          });
          setMsg('🎉 ¡Solicitud recibida! Estamos validando tu perfil. Te notificaremos por correo cuando tus 3 MESES GRATIS estén listos para usarse.');
          setEmail(''); setIgUser(''); setInviteCode('');
        }
      }
    } catch (err) { 
      if (err.code === 'auth/too-many-requests') {
        setError('Acceso bloqueado temporalmente. Por favor, espera 5 minutos o usa datos móviles.');
      } else if (err.code?.includes('auth/')) {
        setError('El correo o la contraseña son incorrectos.');
      } else {
        setError(err.message || 'Ocurrió un error.');
      }
    }
  };

  const handleResetPassword = async () => {
    if (!email) return setError('Ingresa tu correo en el campo superior para resetear la contraseña.');
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('Correo de recuperación enviado. Revisa tu bandeja o carpeta de Spam.');
    } catch (err) { 
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        setError('No encontramos ninguna cuenta con ese correo.');
      } else {
        setError('Error al enviar correo.'); 
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans relative">
      <a href={`mailto:${SUPPORT_EMAIL}?subject=Dudas%20sobre%20TopCodes`} className="fixed bottom-6 left-6 z-50 bg-white border border-slate-200 text-slate-600 p-4 rounded-full shadow-xl hover:scale-105 hover:text-black transition-all flex items-center gap-3 group">
        <Mail size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block transition-all mr-2">Contacto</span>
      </a>
      
      <div className="flex flex-col justify-center w-full lg:w-1/2 bg-black text-white p-8 sm:p-16 lg:p-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Crown size={250} className="lg:w-[400px] lg:h-[400px]"/>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 lg:mb-12">
             <BrandLogo size={32} className="text-[#d1ff64] fill-current" />
             <span className="font-black text-2xl lg:text-3xl tracking-widest uppercase">TopCodes</span>
          </div>
          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6 lg:mb-8">
            Monetiza como <br/><span className="text-[#d1ff64]">la élite.</span>
          </h1>
          
          <p className="text-slate-400 text-lg lg:text-xl max-w-lg leading-relaxed mb-6">
            Linktree te cobra el 12% por vender. TopCodes es tu nueva infraestructura. Únete hoy y obtén <strong className="text-white">3 Meses Gratis de acceso Elite</strong>. Después, mantén la versión gratuita o elige planes desde $29 MXN al mes.
          </p>

          <ul className="space-y-4 text-base font-bold text-slate-300">
            <li className="flex items-start gap-3">
              <CheckCircle size={20} className="text-[#d1ff64] mt-1 shrink-0"/> 
              <div>Tus Stories mueren en 24h, TopCodes las extiende a 28 días.</div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={20} className="text-[#d1ff64] mt-1 shrink-0"/> 
              <div>Analítica Avanzada: Proyecta tus comisiones y negocia mejor.</div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={20} className="text-[#d1ff64] mt-1 shrink-0"/> 
              <div>Planes justos: Desde $0 hasta $99 MXN con 0% de comisión nuestra.</div>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
          
          {/* 🟢 TABS Y DEMOS RESTAURADOS */}
          <div className="flex flex-wrap gap-4 sm:gap-6 mb-10 border-b border-slate-100 items-center">
            <button onClick={() => setIsLogin(true)} className={`pb-4 font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all ${isLogin ? 'border-b-4 border-[#d1ff64] text-black' : 'text-slate-300 hover:text-black'}`}>
              Ingresar
            </button>
            <button onClick={() => setIsLogin(false)} className={`pb-4 font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all ${!isLogin ? 'border-b-4 border-[#d1ff64] text-black' : 'text-slate-300 hover:text-black'}`}>
              Crear mi Spot
            </button>
            
            <div className="ml-auto flex gap-3">
              <RouterLink to="/demo" className="pb-4 font-black uppercase tracking-widest text-[9px] sm:text-[10px] text-[#8b5cf6] hover:text-purple-700 transition-all flex items-center gap-1">
                <Eye size={14}/> Spot Demo
              </RouterLink>
              <RouterLink to="/demo/panel" className="pb-4 font-black uppercase tracking-widest text-[9px] sm:text-[10px] text-blue-500 hover:text-blue-700 transition-all flex items-center gap-1">
                <LayoutDashboard size={14}/> Panel Demo
              </RouterLink>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5"/> <p>{error}</p>
            </div>
          )}
          
          {msg && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
              <CheckCircle size={14}/> <p>{msg}</p>
            </div>
          )}
          
          <form onSubmit={handleAuth} className="space-y-4">
            {isLogin ? (
              <>
                <input type="email" placeholder="Correo" required className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={email} onChange={e=>setEmail(e.target.value)}/>
                <input type="password" placeholder="Contraseña" required className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={password} onChange={e=>setPassword(e.target.value)}/>
                <button type="submit" className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl mt-4">
                  Acceder al Spot
                </button>
                <div className="mt-8 text-center">
                  <button onClick={handleResetPassword} type="button" className="text-[10px] font-black uppercase text-slate-400 hover:text-black tracking-widest transition-colors outline-none">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                
                <div className="bg-slate-900 p-5 rounded-2xl mb-6 border border-slate-800 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10"><Zap size={60}/></div>
                   <p className="text-[10px] text-[#d1ff64] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={12}/> Prueba Elite: 3 Meses Gratis</p>
                   <p className="text-xs text-slate-300 font-bold leading-relaxed">Únete hoy y obtén acceso total a nuestras analíticas. Por control de calidad, <strong className="text-white">revisamos y aprobamos cada perfil manualmente.</strong> Al finalizar tu prueba, puedes mantener la versión gratuita o elegir un plan Pro.</p>
                </div>
                
                <input type="text" placeholder="Usuario de Instagram (@...)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={igUser} onChange={e=>setIgUser(e.target.value)}/>
                <input type="email" placeholder="Tu mejor correo electrónico" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={email} onChange={e=>setEmail(e.target.value)}/>
                
                {isUnlockedFounders && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-4">
                    <p className="text-[10px] font-black text-green-500 uppercase tracking-widest text-center flex items-center justify-center gap-1">
                      <Lock size={12} className="opacity-50"/> 
                      Bypass Code Activado (Aprobación Instantánea)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={category} onChange={e=>setCategory(e.target.value)}>
                        <option value="">Nicho</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input type="text" placeholder="Ciudades" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={cities} onChange={e=>setCities(e.target.value)}/>
                    </div>
                    <input type="password" placeholder="Crea tu contraseña" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={password} onChange={e=>setPassword(e.target.value)}/>
                  </div>
                )}

                <div className="pt-2">
                  <input type="password" placeholder="¿Tienes código de Bypass? (Opcional)" className="w-full bg-transparent border-b border-slate-200 p-2 text-xs font-bold outline-none focus:border-black uppercase transition-colors" value={inviteCode} onChange={e=>setInviteCode(e.target.value)}/>
                </div>

                <button type="submit" className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl mt-4">
                  {isUnlockedFounders ? 'Crear mi Spot Ahora' : 'Solicitar mis 3 Meses Gratis'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VISTA: DASHBOARD
// ==========================================
function DashboardLayout({ user }) {
  const [profile, setProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); 

  useEffect(() => {
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => { 
      if (docSnap.exists()) setProfile(docSnap.data()); 
    });
    
    const promoCol = collection(db, 'artifacts', appId, 'users', user.uid, 'promotions');
    const unsubPromos = onSnapshot(promoCol, (snapshot) => { 
      setPromotions(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); 
    });
    
    return () => { 
      unsubProfile(); 
      unsubPromos(); 
    };
  }, [user]);

  if (!profile) return <LoadingScreen />;
  
  const publicLink = `${BASE_DOMAIN}/${profile.username}`;
  const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=Soporte%20TopCodes%20-%20@${profile.username}`;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans relative">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex shrink-0 shadow-sm">
        <div className="p-8 flex items-center gap-3">
           <div className="bg-black p-2 rounded-xl"><BrandLogo size={20} className="text-[#d1ff64] fill-current" /></div>
           <span className="font-black uppercase tracking-tighter text-xl italic">TopCodes</span>
        </div>
        <nav className="p-4 flex-grow space-y-1">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 size={18}/>} label="Analytics Pro" />
          <NavItem active={activeTab === 'promos'} onClick={() => setActiveTab('promos')} icon={<Link2 size={18}/>} label="Links & Deals" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18}/>} label="Perfil" />
        </nav>
        <div className="p-6 border-t border-slate-100 space-y-2">
          <a href={mailtoLink} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-slate-50 text-slate-500 hover:text-black hover:bg-slate-100 rounded-2xl text-xs font-black uppercase transition-all">
            <Mail size={16} /> Soporte
          </a>
          <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-slate-50 text-slate-500 hover:text-red-500 rounded-2xl text-xs font-black uppercase transition-all">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="lg:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200 shadow-sm z-20">
          <div className="flex items-center gap-2">
            <BrandLogo size={24} className="text-black fill-[#d1ff64]" />
            <span className="font-black uppercase italic">TopCodes</span>
          </div>
          <div className="flex gap-1 items-center bg-slate-50 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('overview')} className={`p-2.5 rounded-xl ${activeTab === 'overview' ? 'bg-black text-[#d1ff64]' : 'text-slate-400'}`}><BarChart3 size={18}/></button>
            <button onClick={() => setActiveTab('promos')} className={`p-2.5 rounded-xl ${activeTab === 'promos' ? 'bg-black text-[#d1ff64]' : 'text-slate-400'}`}><Link2 size={18}/></button>
            <button onClick={() => setActiveTab('profile')} className={`p-2.5 rounded-xl ${activeTab === 'profile' ? 'bg-black text-[#d1ff64]' : 'text-slate-400'}`}><User size={18}/></button>
            <a href={mailtoLink} className="p-2.5 text-slate-400 hover:text-black"><Mail size={18}/></a>
            <button onClick={() => signOut(auth)} className="p-2.5 text-red-500"><LogOut size={18}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-10 pb-24">
          {activeTab === 'overview' && <TabOverview profile={profile} promotions={promotions} spotUrl={publicLink} />}
          {activeTab === 'promos' && <TabPromotions user={user} profile={profile} promotions={promotions} />}
          {activeTab === 'profile' && <TabProfile user={user} profile={profile} />}
        </div>
      </main>
      <SupportChatbot userName={profile.username} />
    </div>
  );
}

const NavItem = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${active ? 'bg-black text-[#d1ff64]' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

// ==========================================
// VISTA: DEMO DASHBOARD (Panel Simulado para TopBot)
// ==========================================
function DemoDashboardLayout() {
  const [activeTab, setActiveTab] = useState('overview'); 
  const profile = DEMO_PROFILE;
  const promotions = DEMO_PROMOTIONS;
  const publicLink = `${BASE_DOMAIN}/demo`;
  const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=Dudas%20sobre%20el%20Demo`;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans relative">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex shrink-0 shadow-sm">
        <div className="p-8 flex items-center gap-3">
           <div className="bg-black p-2 rounded-xl"><BrandLogo size={20} className="text-[#d1ff64] fill-current" /></div>
           <span className="font-black uppercase tracking-tighter text-xl italic">TopCodes</span>
        </div>
        <nav className="p-4 flex-grow space-y-1">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 size={18}/>} label="Analytics Pro" />
          <NavItem active={activeTab === 'promos'} onClick={() => setActiveTab('promos')} icon={<Link2 size={18}/>} label="Links & Deals" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18}/>} label="Perfil" />
        </nav>
        <div className="p-6 border-t border-slate-100 space-y-2">
          <RouterLink to="/demo" className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-[#8b5cf6] text-white hover:bg-purple-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md">
            <Eye size={16} /> Ver Spot Público
          </RouterLink>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="bg-[#8b5cf6] text-white p-2 text-center text-xs font-bold flex flex-wrap justify-center items-center gap-4 z-20 shadow-sm">
            <span>Estás viendo el Panel Interno de demostración (TopBot)</span>
            <div className="flex gap-2">
                <RouterLink to="/demo" className="bg-white text-[#8b5cf6] px-3 py-1.5 rounded-lg text-[10px] uppercase font-black hover:scale-105 transition-transform">Ver Spot</RouterLink>
                <RouterLink to="/" className="bg-black text-[#d1ff64] px-3 py-1.5 rounded-lg text-[10px] uppercase font-black hover:scale-105 transition-transform">Crear mi cuenta</RouterLink>
            </div>
        </div>
        <div className="lg:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200 shadow-sm z-20">
          <div className="flex items-center gap-2">
            <BrandLogo size={24} className="text-black fill-[#d1ff64]" />
            <span className="font-black uppercase italic">TopCodes</span>
          </div>
          <div className="flex gap-1 items-center bg-slate-50 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('overview')} className={`p-2.5 rounded-xl ${activeTab === 'overview' ? 'bg-black text-[#d1ff64]' : 'text-slate-400'}`}><BarChart3 size={18}/></button>
            <button onClick={() => setActiveTab('promos')} className={`p-2.5 rounded-xl ${activeTab === 'promos' ? 'bg-black text-[#d1ff64]' : 'text-slate-400'}`}><Link2 size={18}/></button>
            <button onClick={() => setActiveTab('profile')} className={`p-2.5 rounded-xl ${activeTab === 'profile' ? 'bg-black text-[#d1ff64]' : 'text-slate-400'}`}><User size={18}/></button>
            <a href={mailtoLink} className="p-2.5 text-slate-400 hover:text-black"><Mail size={18}/></a>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-10 pb-24">
          {activeTab === 'overview' && <TabOverview profile={profile} promotions={promotions} spotUrl={publicLink} />}
          {activeTab === 'promos' && <TabPromotions user={{uid:'demo_user_123'}} profile={profile} promotions={promotions} isDemo={true} />}
          {activeTab === 'profile' && <TabProfile user={{uid:'demo_user_123'}} profile={profile} isDemo={true} />}
        </div>
      </main>
      <SupportChatbot userName={profile.username} />
    </div>
  );
}

// ==========================================
// VISTA: ANALYTICS HUB (28 Días + Comas)
// ==========================================
function TabOverview({ profile, promotions, spotUrl }) {
  const [stats, setStats] = useState({ views: 0, clicks: 0, post24h: 0, projection: '0', topLinks: [] });
  const [selectedPromo, setSelectedPromo] = useState('all'); 

  useEffect(() => {
    const activePromos = selectedPromo === 'all' ? promotions : promotions.filter(p => p.id === selectedPromo);
    const totalVistas = selectedPromo === 'all' ? (profile?.views || 0) : 'N/A';
    
    let totalClics = 0; 
    let totalProjValue = 0; 
    let hasMoney = false;

    activePromos.forEach(promo => {
      const clicks = promo.stats?.totalClicks || 0; 
      totalClics += clicks;
      
      if(promo.type !== 'link') {
        const conversions = clicks * 0.03; 
        const val = parseFloat(promo.commissionValue) || 0;
        if (promo.commissionType === '$') { 
          totalProjValue += conversions * val; 
          hasMoney = true; 
        } else if (promo.commissionType === '%') { 
          totalProjValue += conversions * (500 * (val / 100)); 
          hasMoney = true; 
        } 
      }
    });

    const simulatedPost24h = Math.floor(totalClics * 0.65);
    const sortedLinks = [...activePromos].sort((a,b) => (b.stats?.totalClicks || 0) - (a.stats?.totalClicks || 0)).slice(0, 4);

    setStats({ 
      views: totalVistas, 
      clicks: totalClics, 
      post24h: simulatedPost24h, 
      projection: hasMoney ? `$${Number(totalProjValue).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'N/A',
      topLinks: sortedLinks
    });
  }, [profile, promotions, selectedPromo]);

  const chartData = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(); 
    d.setDate(d.getDate() - (27 - i));
    const dayStr = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    let base = stats.clicks > 0 ? (stats.clicks / 28) : 0;
    if(i % 7 === 0) base = base * 2.5;
    return { name: dayStr, clics: Math.max(0, Math.floor(base + (Math.random() * 5))) };
  });

  const userCities = profile?.cities ? profile.cities.split(',').map(c => c.trim()) : ['CDMX', 'Monterrey'];
  const geoData = userCities.map((city, index) => {
    const percentage = index === 0 ? 55 : (index === 1 ? 25 : 20 / (userCities.length - 2 || 1));
    return { name: city, value: percentage };
  });

  return (
    <div className="animate-in fade-in max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic mb-1">Business Analytics</h1>
          <p className="text-slate-500 font-bold text-sm">Rendimiento profesional de los últimos 28 días.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select 
            className="w-full sm:w-auto bg-white border border-slate-100 shadow-sm text-xs font-black uppercase px-4 py-3 rounded-2xl outline-none" 
            value={selectedPromo} 
            onChange={(e) => setSelectedPromo(e.target.value)}
          >
             <option value="all">Todo el Portafolio</option>
             {promotions.map(p => (
               <option key={p.id} value={p.id}>{p.brandName}</option>
             ))}
          </select>
          <div className="bg-white p-2 rounded-2xl flex items-center gap-3 border border-slate-100">
            <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => window.open(spotUrl, '_blank')}>
              <Eye size={16} className="text-slate-600"/>
            </button>
            <button className="p-3 bg-black text-[#d1ff64] rounded-xl transition-colors" onClick={() => {navigator.clipboard.writeText(spotUrl); alert('Copiado!');}}>
              <Copy size={16}/>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-2"><Eye size={14} className="text-[#8b5cf6]"/> Vistas</p>
          <p className="text-4xl font-black">{stats.views === 'N/A' ? 'N/A' : Number(stats.views).toLocaleString('en-US')}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-2"><MousePointer2 size={14} className="text-blue-500"/> Clics</p>
          <p className="text-4xl font-black">{Number(stats.clicks).toLocaleString('en-US')}</p>
        </div>
        <div className="bg-black text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-black uppercase text-[#d1ff64] mb-2 flex items-center gap-2 relative z-10"><Clock size={14}/> Valor Post-24h</p>
          <p className="text-4xl font-black text-[#d1ff64] relative z-10">+{Number(stats.post24h).toLocaleString('en-US')}</p>
          <p className="text-[9px] font-bold text-slate-400 mt-2 relative z-10">Clics salvados tras expirar tu Story.</p>
        </div>
        <div className="bg-[#faffea] p-6 rounded-[2rem] border border-[#d1ff64] shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2"><TrendingUp size={14} className="text-green-600"/> Proyección ROI</p>
          <p className="text-4xl font-black text-black">{stats.projection}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black uppercase text-slate-800">Tráfico de Retención (Últimos 28 Días)</h3>
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d1ff64" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d1ff64" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(v) => Number(v).toLocaleString('en-US')} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} 
                />
                <Tooltip 
                  formatter={(v) => [Number(v).toLocaleString('en-US'), "Clics"]} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold'}} 
                />
                <Area type="monotone" dataKey="clics" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorClics)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#d1ff64] mb-6 flex items-center gap-2">
            <Globe size={16}/> Distribución Geo
          </h3>
          <div className="space-y-5">
            {geoData.map((geo, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold">{geo.name}</span>
                  <span className="text-xs font-black text-slate-400">{Math.round(geo.value)}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#d1ff64] h-full rounded-full" style={{width: `${geo.value}%`}}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Usa esta data para cerrar patrocinios de tiendas locales.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VISTA: LINKS & DEALS
// ==========================================
function TabPromotions({ user, profile, promotions, isDemo }) {
  const [newPromo, setNewPromo] = useState({ 
    type: 'deal', brandName: '', brandDomain: '', discount: '', code: '', originalUrl: '', 
    niche: '', commissionType: '%', commissionValue: '', isHero: false, expiresAt: '', isOwn: false 
  });
  const [editingId, setEditingId] = useState(null); 
  const [msg, setMsg] = useState(''); 
  const [loading, setLoading] = useState(false);

  const getCleanDomain = (domain) => {
    if (!domain) return '';
    return domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
  };

  const handleSave = async (e) => {
    e.preventDefault(); 
    if (isDemo) { 
      setMsg('👀 Estás en el Demo.'); 
      setTimeout(() => setMsg(''), 3000); 
      return; 
    }
    setLoading(true); 
    let trackedUrl = newPromo.originalUrl;
    
    try {
      const urlObj = new URL(newPromo.originalUrl); 
      urlObj.searchParams.set('utm_source', 'topcodes'); 
      urlObj.searchParams.set('subid', profile.username);
      trackedUrl = urlObj.toString();
    } catch (e) { 
      setLoading(false); 
      return alert("Ingresa una URL válida que empiece con https://"); 
    }

    try {
      const cleanDomain = getCleanDomain(newPromo.brandDomain);
      const previewLogoUrl = cleanDomain.includes('.') ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256` : '';

      const promoData = { 
        ...newPromo, 
        brandDomain: newPromo.brandDomain || '', 
        commissionType: newPromo.commissionType || '%', 
        commissionValue: newPromo.commissionValue || '', 
        trackedUrl, 
        logoUrl: previewLogoUrl 
      };

      if (promoData.isHero && promoData.type === 'deal') {
         promotions.forEach(async (p) => {
            if(p.isHero && p.id !== editingId) {
               await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'promotions', p.id), { isHero: false });
               await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', p.id), { isHero: false }, { merge: true });
            }
         });
      }

      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'promotions', editingId), promoData);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', editingId), { ownerId: user.uid, username: profile.username, ...promoData }, { merge: true });
      } else {
        promoData.stats = { totalClicks: 0 }; 
        promoData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'promotions'), promoData);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', docRef.id), { ownerId: user.uid, username: profile.username, ...promoData });
      }
      
      setNewPromo({ type: 'deal', brandName: '', brandDomain: '', discount: '', code: '', originalUrl: '', niche: '', commissionType: '%', commissionValue: '', isHero: false, expiresAt: '', isOwn: false }); 
      setEditingId(null);
      setMsg('✅ Publicado correctamente'); 
      setTimeout(() => setMsg(''), 3000);
    } catch (error) { 
      setMsg(`❌ Error: ${error.message}`); 
    } 
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('¿Borrar elemento?')) return;
    if (isDemo) {
       alert('Modo Demo: Acción deshabilitada.');
       return;
    }
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'promotions', id));
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', id));
  };

  return (
    <div className="animate-in fade-in space-y-10">
      <div className="max-w-2xl bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="text-lg font-black uppercase italic mb-8 flex items-center gap-3">
          {editingId ? <Settings size={20}/> : <Plus size={20}/>} 
          {editingId ? 'Editar Link' : 'Nuevo Link'}
        </h3>
        
        {!editingId && (
          <div className="flex gap-4 mb-4 bg-slate-50 p-2 rounded-2xl">
            <button type="button" onClick={() => setNewPromo({...newPromo, type: 'deal'})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${newPromo.type === 'deal' ? 'bg-black text-[#d1ff64]' : 'text-slate-400'}`}>💰 Deal</button>
            <button type="button" onClick={() => setNewPromo({...newPromo, type: 'link'})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${newPromo.type === 'link' ? 'bg-black text-white' : 'text-slate-400'}`}>🔗 Link</button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {newPromo.type === 'deal' && (
            <div className="p-5 bg-[#faffea] rounded-2xl border border-[#d1ff64] shadow-sm space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-black cursor-pointer" checked={newPromo.isHero} onChange={(e) => setNewPromo({...newPromo, isHero: e.target.checked})} />
                <span className="font-black uppercase text-sm flex items-center gap-2"><Star size={16} className="text-yellow-500 fill-current"/> Destacar como Deal Principal</span>
              </label>
              {newPromo.isHero && (
                <div className="pl-8 border-l-2 border-[#d1ff64] ml-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-2 flex items-center gap-1"><Timer size={12}/> Fecha límite (Pública)</label>
                  <input type="datetime-local" className="bg-white border-none rounded-xl p-3 text-sm font-bold w-full" value={newPromo.expiresAt} onChange={(e) => setNewPromo({...newPromo, expiresAt: e.target.value})} />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nombre (Ej. Sephora)" required className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" value={newPromo.brandName} onChange={e=>setNewPromo({...newPromo, brandName: e.target.value})}/>
            <input type="text" placeholder="Dominio (ej. sephora.com)" required className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" value={newPromo.brandDomain} onChange={e=>setNewPromo({...newPromo, brandDomain: e.target.value})}/>
          </div>
          
          <input type="url" placeholder="URL Destino (https://...)" required className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" value={newPromo.originalUrl} onChange={e=>setNewPromo({...newPromo, originalUrl: e.target.value})}/>
          
          {newPromo.type === 'deal' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Oferta (Ej. 20% OFF)" required className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold" value={newPromo.discount} onChange={e=>setNewPromo({...newPromo, discount: e.target.value})}/>
                <input type="text" placeholder="Código (Opcional)" className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold" value={newPromo.code} onChange={e=>setNewPromo({...newPromo, code: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Comisión Estimada (USD/MXN)" required className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold" value={newPromo.commissionValue} onChange={e=>setNewPromo({...newPromo, commissionValue: e.target.value})}/>
                <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={newPromo.niche} onChange={e=>setNewPromo({...newPromo, niche: e.target.value})}>
                  <option value="" disabled>Selecciona un Nicho</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          ) : (
            <label className="flex items-center gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-black" checked={newPromo.isOwn} onChange={e=>setNewPromo({...newPromo, isOwn: e.target.checked})} />
              <span className="text-xs font-black uppercase">Es mi propio emprendimiento 🌟</span>
            </label>
          )}

          <button type="submit" disabled={loading} className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase shadow-xl hover:scale-105 transition-all">
            {loading ? 'Publicando...' : 'Publicar Ahora'}
          </button>
          {msg && <p className="text-center text-xs font-bold text-green-600">{msg}</p>}
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 border">
                 <img src={p.logoUrl} className="w-8 h-8 object-contain" />
               </div>
               <div className="overflow-hidden">
                  <h4 className="font-black text-sm truncate">{p.brandName}</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    {p.type === 'link' ? (p.isOwn ? 'MI PROYECTO 🌟' : 'LINK') : p.discount}
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center px-4">
                <p className="text-xl font-black">{Number(p.stats?.totalClicks || 0).toLocaleString('en-US')}</p>
                <p className="text-[8px] font-black text-slate-300">CLICS</p>
              </div>
              <button onClick={() => {setNewPromo(p); setEditingId(p.id); window.scrollTo({top:0, behavior:'smooth'});}} className="p-2.5 text-slate-700 hover:text-white hover:bg-[#8b5cf6] bg-slate-200 rounded-xl transition-all shadow-sm">
                <Settings size={16}/>
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-2.5 text-slate-700 hover:text-white hover:bg-red-500 bg-slate-200 rounded-xl transition-all shadow-sm">
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// PESTAÑA: PROFILE
// ==========================================
function TabProfile({ user, profile, isDemo }) {
  const [formData, setFormData] = useState({ 
    bio: profile.bio || '', 
    photoUrl: profile.photoUrl || '', 
    tiktokUrl: profile.tiktokUrl || '', 
    youtubeUrl: profile.youtubeUrl || '', 
    xUrl: profile.xUrl || '', 
    twitchUrl: profile.twitchUrl || '', 
    spotifyUrl: profile.spotifyUrl || '', 
    customUrl: profile.customUrl || '' 
  });
  const [msg, setMsg] = useState(''); 
  const [uploading, setUploading] = useState(false);

  useEffect(() => { 
    setFormData({ 
      bio: profile.bio || '', 
      photoUrl: profile.photoUrl || '', 
      tiktokUrl: profile.tiktokUrl || '', 
      youtubeUrl: profile.youtubeUrl || '', 
      xUrl: profile.xUrl || '', 
      twitchUrl: profile.twitchUrl || '', 
      spotifyUrl: profile.spotifyUrl || '', 
      customUrl: profile.customUrl || '' 
    }); 
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault(); 
    if (isDemo) return alert('Modo Demo');
    
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), formData);
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profile.username), formData);
    setMsg('✅ Actualizado'); 
    setTimeout(() => setMsg(''), 3000);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]; 
    if (!file || isDemo) return; 
    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas'); 
        const MAX_WIDTH = 250; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH; 
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d'); 
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { photoUrl: base64String });
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profile.username), { photoUrl: base64String });
        setFormData(prev => ({ ...prev, photoUrl: base64String })); 
        setUploading(false); 
        setMsg('📸 Foto subida');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in">
      <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3"><Settings size={24}/> Perfil Oficial</h2>
      
      {msg && <div className="p-4 rounded-2xl text-xs font-bold mb-8 bg-green-50 text-green-600">{msg}</div>}
      
      <form onSubmit={handleSave} className="space-y-8">
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-[10px] font-black uppercase text-slate-400">Nombre de Usuario</p>
             <p className="text-lg font-black italic text-black">@{profile.username}</p>
           </div>
           <div className="w-20 h-20 bg-slate-200 rounded-3xl overflow-hidden shadow-sm">
             {formData.photoUrl && <img src={formData.photoUrl} className="w-full h-full object-cover" />}
           </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
            <ImageIcon size={14}/> Cambiar Foto
          </label>
          <label className="cursor-pointer bg-black text-[#d1ff64] px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest inline-block">
            {uploading ? 'Subiendo...' : 'Elegir Imagen'}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        </div>

        <textarea rows="3" className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-bold outline-none" placeholder="Biografía" value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})}></textarea>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {['tiktokUrl', 'youtubeUrl', 'twitchUrl', 'xUrl', 'spotifyUrl', 'customUrl'].map(f => (
             <input key={f} type="url" placeholder={f.replace('Url', '').toUpperCase()} className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none" value={formData[f]} onChange={e=>setFormData({...formData, [f]: e.target.value})}/>
           ))}
        </div>

        <button type="submit" className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase shadow-xl hover:scale-105 transition-all">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

// ==========================================
// VISTA: SPOT PÚBLICO (Lectura Pública Corregida)
// ==========================================
function PublicSpot() {
  const { username } = useParams();
  const [publicProfile, setPublicProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [vipEmail, setVipEmail] = useState('');
  const [leadMsg, setLeadMsg] = useState('');

  useEffect(() => {
    const fetchPublicData = async () => {
      if (username && username.toLowerCase() === 'demo') { 
        setPublicProfile(DEMO_PROFILE); 
        setPromotions(DEMO_PROMOTIONS); 
        return; 
      }
      
      const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', username.toLowerCase());
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        setPublicProfile(profileData);
        updateDoc(profileRef, { views: increment(1) });
        
        // Lectura de colecciones públicas por ID de usuario
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'promotions'), where("ownerId", "==", profileData.uid));
        onSnapshot(q, (snap) => {
          setPromotions(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
        });
      } else { 
        setNotFound(true); 
      }
    };
    fetchPublicData();
  }, [username]);

  const handleClick = async (promo) => {
    if (promo.code && promo.type !== 'link') { 
      const el = document.createElement('textarea'); 
      el.value = promo.code; 
      document.body.appendChild(el); 
      el.select(); 
      document.execCommand('copy'); 
      document.body.removeChild(el); 
    }
    updateDoc(doc(db, 'artifacts', appId, 'users', publicProfile.uid, 'promotions', promo.id), { "stats.totalClicks": increment(1) });
    window.open(promo.trackedUrl, '_blank');
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans text-slate-400">
        <h2>⚠️ Perfil no encontrado</h2>
        <RouterLink to="/" className="mt-4 text-blue-500 font-bold">Crear mi Spot</RouterLink>
      </div>
    );
  }
  
  if (!publicProfile) return <LoadingScreen />;

  const heroDeal = promotions.find(p => p.isHero && p.type !== 'link');
  const regularDeals = promotions.filter(p => !p.isHero && p.type !== 'link' && p.id !== heroDeal?.id && (p.brandName || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const standardLinks = promotions.filter(p => p.type === 'link' && (p.brandName || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const customDomain = publicProfile?.customUrl ? (function(){
    try { return new URL(publicProfile.customUrl).hostname; } 
    catch(e){ return publicProfile.customUrl.replace(/^https?:\/\//, '').split('/')[0]; }
  })() : null;
  
  const customFavUrl = customDomain ? `https://www.google.com/s2/favicons?domain=${customDomain}&sz=256` : null;

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-sans pb-20 p-6 relative">
      <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 relative z-10">
        
        {/* HEADER PERFIL */}
        <header className="text-center mb-10 mt-10">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-2 rounded-[3.5rem] shadow-2xl mx-auto mb-6 border overflow-hidden flex items-center justify-center transition-transform hover:scale-105">
            {publicProfile.photoUrl ? <img src={publicProfile.photoUrl} className="w-full h-full object-cover" /> : <User size={50} className="text-slate-200" />}
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">@{publicProfile.username}</h2>
          <p className="text-sm font-bold text-slate-400 mt-4 max-w-lg mx-auto italic">{publicProfile.bio}</p>
          
          {/* REDES SOCIALES DINÁMICAS */}
          <div className="flex justify-center flex-wrap gap-3 mt-6">
            <a href={`https://instagram.com/${publicProfile.username}`} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm border text-pink-600 flex items-center justify-center w-[46px] h-[46px] hover:scale-110 transition-all"><Instagram size={20} /></a>
            {publicProfile.tiktokUrl && <a href={publicProfile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm border flex items-center justify-center w-[46px] h-[46px] hover:scale-110 transition-all text-black"><Music size={20} /></a>}
            {publicProfile.youtubeUrl && <a href={publicProfile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm border flex items-center justify-center w-[46px] h-[46px] hover:scale-110 transition-all text-red-600"><Youtube size={20} /></a>}
            {publicProfile.twitchUrl && <a href={publicProfile.twitchUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm border flex items-center justify-center w-[46px] h-[46px] hover:scale-110 transition-all text-purple-600"><Twitch size={20} /></a>}
            {publicProfile.xUrl && <a href={publicProfile.xUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm border flex items-center justify-center w-[46px] h-[46px] hover:scale-110 transition-all text-blue-500"><Twitter size={20} /></a>}
            {publicProfile.spotifyUrl && <a href={publicProfile.spotifyUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm border flex items-center justify-center w-[46px] h-[46px] hover:scale-110 transition-all text-green-500"><Headphones size={20} /></a>}
            
            {publicProfile.customUrl && (
              <a href={publicProfile.customUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm border flex items-center justify-center w-[46px] h-[46px] hover:scale-110 transition-all">
                {customFavUrl ? <img src={customFavUrl} alt="Link" className="w-[20px] h-[20px] object-contain rounded-sm" /> : <Globe size={20} className="text-slate-400" />}
              </a>
            )}
          </div>
        </header>

        {/* LISTA VIP / LEAD CAPTURE */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-black text-white p-6 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><Bell size={80}/></div>
             <h3 className="text-sm font-black uppercase text-[#d1ff64] mb-2 relative z-10 flex items-center justify-center gap-2"><Star size={16} className="fill-current"/> VIP List</h3>
             <p className="text-xs font-bold text-slate-300 mb-4 relative z-10">Sé el primero en recibir mis códigos antes de que expiren.</p>
             {leadMsg ? <div className="bg-[#d1ff64] text-black py-3 rounded-2xl text-xs font-black uppercase animate-in zoom-in">{leadMsg}</div> : (
                <form onSubmit={async (e) => { 
                  e.preventDefault(); 
                  await addDoc(collection(db, 'artifacts', appId, 'users', publicProfile.uid, 'leads'), { email: vipEmail, timestamp: new Date().toISOString() }); 
                  setLeadMsg('¡Gracias!'); 
                }} className="flex gap-2 relative z-10">
                  <input type="email" placeholder="Correo" required className="flex-1 bg-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white outline-none" value={vipEmail} onChange={e=>setVipEmail(e.target.value)}/>
                  <button type="submit" className="bg-[#d1ff64] text-black px-6 py-3 rounded-2xl font-black uppercase text-xs">Unirme</button>
                </form>
             )}
          </div>
        </div>

        {/* HERO DEAL */}
        {heroDeal && !searchTerm && (
          <div className="max-w-2xl mx-auto mb-12">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 text-center">Deal Destacado</h3>
            <button onClick={()=>handleClick(heroDeal)} className="w-full bg-[#faffea] p-8 rounded-[3rem] shadow-lg border border-[#d1ff64] flex flex-col items-center text-center hover:scale-[1.02] transition-all relative overflow-hidden outline-none">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#d1ff64] to-yellow-400"></div>
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl mb-6 overflow-hidden border">
                 <img src={heroDeal.logoUrl} className="w-14 h-14 object-contain" />
               </div>
               <h4 className="text-sm font-black uppercase text-slate-500 mb-2">{heroDeal.brandName}</h4>
               <p className="text-4xl font-black tracking-tighter text-black leading-tight mb-4">{heroDeal.discount}</p>
               <div className="bg-black text-[#d1ff64] px-8 py-3 rounded-2xl font-black uppercase text-sm shadow-md transition-colors">{heroDeal.code ? 'Copiar Código' : 'Ir a la Tienda'}</div>
               {heroDeal.expiresAt && <CountdownTimer targetDate={heroDeal.expiresAt} />}
            </button>
          </div>
        )}

        <div className="relative mb-8 max-w-2xl mx-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="Buscar marcas o enlaces..." className="w-full bg-white rounded-[2rem] py-5 pl-16 pr-6 shadow-sm font-bold outline-none focus:ring-2 focus:ring-black transition-all" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
           {regularDeals.map(p => (
             <button key={p.id} onClick={()=>handleClick(p)} className="bg-white p-8 rounded-[2.5rem] shadow-sm border hover:border-black transition-all h-64 text-left flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute -top-4 -right-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><Zap size={120}/></div>
                <div className="flex justify-between items-start relative z-10 w-full">
                   <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border p-1"><img src={p.logoUrl} className="w-10 h-10 object-contain bg-white rounded-xl" /></div>
                   <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:bg-[#d1ff64] group-hover:text-black"><ExternalLink size={16}/></div>
                </div>
                <div className="relative z-10">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 mb-1 truncate">{p.brandName}</h4>
                   <p className="text-2xl font-black tracking-tighter mb-4 truncate">{p.discount}</p>
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black">{p.code ? 'Copiar Código' : 'Ir a la tienda'}</p>
                </div>
             </button>
           ))}
        </div>

        <div className="mt-16 mb-8 max-w-2xl mx-auto space-y-4">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 text-center">Mis Enlaces</h3>
           {standardLinks.map(l => (
             <button key={l.id} onClick={()=>handleClick(l)} className={`w-full p-5 rounded-[2rem] shadow-sm border flex items-center gap-4 hover:border-black transition-all group active:scale-[0.98] ${l.isOwn ? 'bg-[#faffea] border-[#d1ff64]' : 'bg-white border-slate-100'}`}>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 border"><img src={l.logoUrl} className="w-8 h-8 object-contain" /></div>
                <div className="flex-1 text-left overflow-hidden">
                  <span className="block font-black text-lg text-slate-800 flex items-center gap-2">
                    {l.brandName}
                    {l.isOwn && <span className="bg-black text-[#d1ff64] text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">⭐ Mi Proyecto</span>}
                  </span>
                </div>
                <div className="w-12 h-12 bg-white rounded-[1rem] flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-[#d1ff64] shadow-sm border"><ChevronRight size={20}/></div>
             </button>
           ))}
        </div>

        <footer className="mt-24 text-center opacity-30 flex items-center justify-center gap-2">
          <BrandLogo size={14}/>
          <p className="text-[9px] font-black uppercase tracking-[0.5em]">Powered by TopCodes</p>
        </footer>
      </div>

      {username?.toLowerCase() === 'demo' && (
        <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-slate-800 p-4 z-50 animate-in slide-in-from-bottom-full">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#d1ff64] p-2 rounded-xl text-black"><Zap size={16} className="fill-current" /></div>
              <div><p className="text-white text-sm font-black">¿Te gustó el Spot de TopBot?</p><p className="text-slate-400 text-xs font-bold hidden sm:block">Empieza a recuperar tus ventas perdidas hoy mismo.</p></div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <RouterLink to="/" className="px-4 py-3 rounded-2xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20">Inicio</RouterLink>
              <RouterLink to="/demo/panel" className="px-4 py-3 rounded-2xl bg-[#8b5cf6] text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.3)]">Ver Panel Interno</RouterLink>
              <RouterLink to="/" className="px-4 py-3 rounded-2xl bg-[#d1ff64] text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_15px_rgba(209,255,100,0.2)]">Crear Spot</RouterLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SupportChatbot({ userName }) {
  const [isOpen, setIsOpen] = useState(false); const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ text: `¡Hola @${userName}! Soy TopBot ⚡️ ¿En qué te puedo ayudar hoy?`, sender: 'bot' }]);
  const handleSend = (e) => {
    e.preventDefault(); if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, sender: 'user' }]); setInput('');
    setTimeout(() => { setMessages(prev => [...prev, { text: `He guardado tu mensaje. Si es urgente, mándanos un correo a ${SUPPORT_EMAIL}.`, sender: 'bot' }]); }, 1000);
  };
  return (
    <>
      <button onClick={() => setIsOpen(true)} className={`fixed bottom-6 right-6 w-16 h-16 bg-black text-[#d1ff64] rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-[100] border-2 border-[#d1ff64] ${isOpen ? 'hidden' : 'flex'}`}><MessageCircle size={28} /></button>
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-[2.5rem] shadow-2xl border flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-10">
          <div className="bg-black p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#d1ff64]">
                <BrandLogo size={20}/>
              </div>
              <div>
                <span className="font-black text-sm uppercase tracking-widest italic block leading-tight">TopBot</span>
                <span className="text-[9px] text-[#d1ff64] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#d1ff64] rounded-full animate-pulse"></span> En línea</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl"><X size={18}/></button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto h-80 space-y-4 bg-slate-50 flex flex-col">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 text-xs font-bold leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-[#d1ff64] text-black rounded-[1.5rem] rounded-br-md' : 'bg-white border text-slate-700 rounded-[1.5rem] rounded-bl-md'}`}>{msg.text}</div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
            <input type="text" placeholder="Escribe tu duda..." className="flex-1 bg-slate-50 rounded-2xl px-5 py-3 text-xs font-bold outline-none" value={input} onChange={(e) => setInput(e.target.value)}/>
            <button type="submit" className="w-12 h-12 bg-black text-[#d1ff64] rounded-2xl flex items-center justify-center shrink-0 shadow-md"><Send size={18}/></button>
          </form>
        </div>
      )}
    </>
  );
}

function SuperAdmin() {
  const [authenticated, setAuthenticated] = useState(false); const [pass, setPass] = useState('');
  const [users, setUsers] = useState([]); const [globalStats, setGlobalStats] = useState({ users: 0, views: 0, clicks: 0, projRevenue: 0 });
  const MASTER_KEY = "TOPCODES_2026"; 

  const handleAuth = (e) => { 
    e.preventDefault(); 
    if (pass === MASTER_KEY) { 
      setAuthenticated(true); 
      fetchAllData(); 
    } else { 
      alert("Clave incorrecta."); 
    } 
  };

  const fetchAllData = async () => {
    const usersSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
    const usersData = usersSnap.docs.map(d => d.data()); setUsers(usersData);
    let tViews = 0; usersData.forEach(u => tViews += (u.views || 0));
    setGlobalStats(prev => ({ ...prev, users: usersData.length, views: tViews }));
  };

  if (!authenticated) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 font-sans">
      <form onSubmit={handleAuth} className="w-full max-w-sm text-center">
        <Lock size={60} className="mx-auto mb-8 text-[#d1ff64]" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 italic text-white">Admin Console</h1>
        <input type="password" placeholder="Clave Maestra" className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-center text-sm font-bold text-white mb-4 outline-none" value={pass} onChange={e=>setPass(e.target.value)}/>
        <button type="submit" className="w-full bg-[#d1ff64] text-black py-5 rounded-2xl font-black uppercase shadow-xl">Desbloquear</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <BrandLogo size={24} className="text-black fill-[#d1ff64]"/>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">B2B Console</h1>
        </div>
        <RouterLink to="/" className="text-xs font-black text-slate-400 hover:text-black uppercase">Salir App</RouterLink>
      </nav>
      <main className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tráfico Consolidado</p>
            <p className="text-5xl font-black italic">{Number(globalStats.views).toLocaleString('en-US')}</p>
          </div>
          <div className="bg-black p-8 rounded-[2.5rem] shadow-2xl text-white">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Creadores Activos</p>
            <p className="text-5xl font-black italic text-[#d1ff64]">{globalStats.users}</p>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
              <tr className="border-b">
                <th className="p-6">Influencer</th>
                <th className="p-6">Plan</th>
                <th className="p-6 text-center">Vistas</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              {users.map(u => (
                <tr key={u.username} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-6">@{u.username}</td>
                  <td className="p-6">
                    <span className="bg-slate-100 px-3 py-1 rounded-md text-[9px] uppercase tracking-widest text-slate-600">{u.plan}</span>
                  </td>
                  <td className="p-6 text-center font-black text-xl text-[#8b5cf6]">{Number(u.views || 0).toLocaleString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
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
  tiktokUrl: 'https://tiktok.com/@topbot',
  youtubeUrl: 'https://youtube.com/@topbot',
  xUrl: 'https://x.com/topbot',
  twitchUrl: 'https://twitch.tv/topbot',
  spotifyUrl: 'https://spotify.com/topbot',
  customUrl: 'https://pinterest.com/topbot' 
};

const DEMO_PROMOTIONS = [
  { id: 'd1', type: 'deal', isHero: true, brandName: 'Sephora', discount: '20% OFF en toda la tienda', code: 'TOPBOT20', brandDomain: 'sephora.com.mx', logoUrl: 'https://www.google.com/s2/favicons?domain=sephora.com.mx&sz=256', originalUrl: '#', expiresAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16), stats: { totalClicks: 3420 } },
  { id: 'l1', type: 'link', isOwn: true, brandName: 'Reserva mi clase en Síclo 🚴‍♀️', brandDomain: 'siclo.com', logoUrl: 'https://www.google.com/s2/favicons?domain=siclo.com&sz=256', originalUrl: '#', stats: { totalClicks: 1240 } },
  { id: 'l2', type: 'link', isOwn: true, brandName: 'Escucha mi Podcast en Spotify 🎙️', brandDomain: 'spotify.com', logoUrl: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=256', originalUrl: '#', stats: { totalClicks: 850 } },
  { id: 'l3', type: 'link', isOwn: true, brandName: 'Mi E-Book: Creadores 2026 📖', brandDomain: 'amazon.com', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=256', originalUrl: '#', stats: { totalClicks: 530 } },
  { id: 'd2', type: 'deal', brandName: 'Nike', discount: '15% OFF Tenis', code: 'NIKETOPBOT', brandDomain: 'nike.com', logoUrl: 'https://www.google.com/s2/favicons?domain=nike.com&sz=256', originalUrl: '#', stats: { totalClicks: 2100 } },
  { id: 'd3', type: 'deal', brandName: 'Alo Yoga', discount: '10% OFF Nueva Colección', code: 'ALO10', brandDomain: 'aloyoga.com', logoUrl: 'https://www.google.com/s2/favicons?domain=aloyoga.com&sz=256', originalUrl: '#', stats: { totalClicks: 1850 } },
  { id: 'd4', type: 'deal', brandName: 'Dyson', discount: '15% OFF Airwrap', code: 'DYSONVIP', brandDomain: 'dyson.com.mx', logoUrl: 'https://www.google.com/s2/favicons?domain=dyson.com.mx&sz=256', originalUrl: '#', stats: { totalClicks: 1540 } },
  { id: 'd5', type: 'deal', brandName: 'MyProtein', discount: '25% OFF Suplementos', code: 'TOPPROTEIN', brandDomain: 'myprotein.com', logoUrl: 'https://www.google.com/s2/favicons?domain=myprotein.com&sz=256', originalUrl: '#', stats: { totalClicks: 1200 } }
];