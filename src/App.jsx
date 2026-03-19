import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  sendPasswordResetEmail, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, getDoc, addDoc, updateDoc, 
  onSnapshot, deleteDoc, getDocs, query, where, increment 
} from 'firebase/firestore';
import { 
  Copy, Plus, Trash2, LogOut, User, Zap, Tag, MapPin, 
  ExternalLink, Link2, Search, Instagram, Eye, LayoutDashboard, 
  Settings, Users, Activity, BarChart3, Image as ImageIcon, Lock, 
  ChevronRight, AlertCircle, Globe, Smartphone, MousePointer2, TrendingUp, CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// ==========================================
// 1. CONFIGURACIÓN FIREBASE 
// ==========================================
// REEMPLAZA ESTOS VALORES CON LOS DE TU CONSOLA DE FIREBASE
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
const appId = 'topcodes-mvp-v1';

const CATEGORIES = ["Salud y Belleza", "Deportes", "Moda y Estilo", "Tecnología", "Lifestyle", "Viajes", "Fitness", "Gaming"];

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
    <Zap className="animate-pulse text-[#d1ff64] fill-black" size={50}/>
  </div>
);

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
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cleanUser = igUser.replace('@', '').trim().toLowerCase();
        const userCheck = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', cleanUser));
        if (userCheck.exists()) throw new Error("Este usuario de IG ya está registrado.");

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        const profileData = { 
          username: cleanUser, email, category, cities, bio: 'Bienvenido a mi Spot',
          photoUrl: '', views: 0, createdAt: new Date().toISOString() 
        };
        
        await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'), profileData);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', cleanUser), { uid, ...profileData });
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
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-sans">
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-black text-white p-24 relative">
        <div className="absolute top-0 right-0 p-10 opacity-10"><Zap size={400}/></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <Zap size={32} className="text-[#d1ff64] fill-current" />
            <span className="font-black text-3xl tracking-widest uppercase">TopCodes</span>
          </div>
          
          {/* NUEVO COPY GANADOR */}
          <h1 className="text-6xl xl:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            Aumenta <br/><span className="text-[#d1ff64]">Tus Ventas.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-lg leading-relaxed">
            Tus Stories son efímeras, pero tu influencia no tiene por qué serlo. Extiende tu ventana de conversión de 24 horas a <strong>28 días</strong>. Centraliza tus códigos, genera ventas recurrentes y demuestra a las marcas el impacto real y duradero de tu ROI.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <div className="flex gap-6 mb-10 border-b border-slate-100">
              <button onClick={() => setIsLogin(true)} className={`pb-4 font-black uppercase tracking-widest text-xs transition-all ${isLogin ? 'border-b-4 border-[#d1ff64] text-black' : 'text-slate-300'}`}>Ingresar</button>
              <button onClick={() => setIsLogin(false)} className={`pb-4 font-black uppercase tracking-widest text-xs transition-all ${!isLogin ? 'border-b-4 border-[#d1ff64] text-black' : 'text-slate-300'}`}>Registro</button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
            {msg && <div className="bg-green-50 text-green-600 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2"><CheckCircle size={14}/> {msg}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <input type="text" placeholder="Usuario de Instagram (@...)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={igUser} onChange={e=>setIgUser(e.target.value)}/>
                  <div className="grid grid-cols-2 gap-3">
                    <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={category} onChange={e=>setCategory(e.target.value)}>
                      <option value="">Nicho</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" placeholder="Ciudades" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={cities} onChange={e=>setCities(e.target.value)}/>
                  </div>
                </>
              )}
              <input type="email" placeholder="Correo Electrónico" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={email} onChange={e=>setEmail(e.target.value)}/>
              <input type="password" placeholder="Contraseña" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={password} onChange={e=>setPassword(e.target.value)}/>
              
              <button type="submit" className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl mt-4">
                {isLogin ? 'Acceder ahora' : 'Crear mi Spot'}
              </button>
            </form>

            {isLogin && (
              <div className="mt-8 text-center">
                <button onClick={handleResetPassword} type="button" className="text-[10px] font-black uppercase text-slate-400 hover:text-black tracking-widest transition-colors">¿Olvidaste tu contraseña?</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VISTA: LAYOUT DEL DASHBOARD (Sidebar)
// ==========================================
function DashboardLayout({ user }) {
  const [profile, setProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); 
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'));
      if (docSnap.exists()) setProfile(docSnap.data());
      
      const promoCol = collection(db, 'artifacts', appId, 'users', user.uid, 'promotions');
      const unsub = onSnapshot(promoCol, (snapshot) => {
        setPromotions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return unsub;
    };
    loadData();
  }, [user]);

  if (!profile) return <LoadingScreen />;

  const publicLink = `${window.location.origin}/${profile.username}`;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex shrink-0 z-30 shadow-sm">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-black p-2 rounded-xl"><Zap size={20} className="text-[#d1ff64] fill-current" /></div>
          <span className="font-black uppercase tracking-tighter text-xl italic">TopCodes</span>
        </div>
        
        <nav className="p-4 flex-grow space-y-1 mt-4">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18}/>} label="Overview" />
          <NavItem active={activeTab === 'promos'} onClick={() => setActiveTab('promos')} icon={<Link2 size={18}/>} label="Promociones" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18}/>} label="Perfil" />
          <div className="pt-8 border-t border-slate-50 mt-8">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300 cursor-not-allowed"><BarChart3 size={18}/> Premium Data</button>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-slate-50 text-slate-500 hover:text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
            Salir <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="lg:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200">
          <Zap size={24} className="text-black fill-[#d1ff64]" />
          <button onClick={() => signOut(auth)} className="p-2 text-red-500"><LogOut size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Panel de Control</h1>
              <p className="text-slate-400 text-sm font-medium mt-1">Gestiona tu marca personal y proyecta tus ganancias.</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="hidden sm:block">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Link de tu Spot</p>
                <p className="text-xs font-bold text-black font-mono truncate max-w-[200px]">{publicLink}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.open(publicLink, '_blank')} className="bg-slate-100 text-black p-3 rounded-2xl hover:bg-slate-200 transition-all"><Eye size={16}/></button>
                <button onClick={() => { navigator.clipboard.writeText(publicLink); }} className="bg-black text-[#d1ff64] p-3 rounded-2xl hover:scale-105 transition-all shadow-lg"><Copy size={16}/></button>
              </div>
            </div>
          </div>

          {activeTab === 'overview' && <TabOverview profile={profile} promotions={promotions} />}
          {activeTab === 'promos' && <TabPromotions user={user} profile={profile} promotions={promotions} />}
          {activeTab === 'profile' && <TabProfile user={user} profile={profile} />}
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${active ? 'bg-black text-[#d1ff64]' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

// --- PESTAÑA: OVERVIEW (NUEVAS MÉTRICAS) ---
function TabOverview({ profile, promotions }) {
  const profileViews = profile.views || 0;
  const promoClicks = promotions.reduce((acc, p) => acc + (p.stats?.totalClicks || 0), 0);
  
  // FÓRMULA PROYECCIÓN: 3% conversión, $45 MXN prom., multiplicado por un factor de 28 días
  const proj28Days = Math.floor((promoClicks * 0.03) * 45 * 2.2);
  
  // ÍNDICE DE PERSISTENCIA SIMULADO
  const persistenceRate = promoClicks > 5 ? "68%" : "0%";

  const dataChart = [
    { name: 'Día 1', vistas: Math.floor(profileViews * 0.4), clics: Math.floor(promoClicks * 0.4) },
    { name: 'Día 2', vistas: Math.floor(profileViews * 0.2), clics: Math.floor(promoClicks * 0.25) },
    { name: 'Día 3', vistas: Math.floor(profileViews * 0.15), clics: Math.floor(promoClicks * 0.15) },
    { name: 'Día 4', vistas: Math.floor(profileViews * 0.1), clics: Math.floor(promoClicks * 0.08) },
    { name: 'Día 5+', vistas: Math.floor(profileViews * 0.15), clics: Math.floor(promoClicks * 0.12) },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Vistas Spot" value={profileViews} icon={<Eye className="text-blue-500" size={24}/>} />
        <StatCard label="Clics Totales" value={promoClicks} icon={<MousePointer2 className="text-purple-500" size={24}/>} />
        <StatCard label="Índice Persistencia" value={persistenceRate} icon={<Activity className="text-orange-500" size={24}/>} />
        <StatCard label="Proyección (28 Días)" value={`$${proj28Days}`} icon={<TrendingUp className="text-green-500" size={24}/>} highlight />
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2"><Activity size={20}/> Retención de Tráfico Post-24h</h3>
            <p className="text-slate-400 text-xs font-bold mt-1">Así es como tu Spot sigue mandando tráfico a las marcas después de que tu historia expira.</p>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataChart}>
              <defs><linearGradient id="colorClic" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d1ff64" stopOpacity={0.3}/><stop offset="95%" stopColor="#d1ff64" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
              <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'}} />
              <Area type="monotone" dataKey="clics" stroke="#000" strokeWidth={4} fillOpacity={1} fill="url(#colorClic)" />
              <Area type="monotone" dataKey="vistas" stroke="#cbd5e1" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, icon, highlight }) => (
  <div className={`p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:scale-[1.02] ${highlight ? 'bg-[#d1ff64]' : 'bg-white'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${highlight ? 'bg-black text-[#d1ff64]' : 'bg-slate-50'}`}>{icon}</div>
    <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-black/60' : 'text-slate-400'}`}>{label}</p>
    <p className="text-3xl md:text-4xl font-black tracking-tighter text-black">{value}</p>
  </div>
);

// --- PESTAÑA: PROMOS ---
function TabPromotions({ user, profile, promotions }) {
  const [newPromo, setNewPromo] = useState({ brandName: '', discount: '', code: '', originalUrl: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    let trackedUrl = newPromo.originalUrl;
    try {
      const urlObj = new URL(newPromo.originalUrl);
      urlObj.searchParams.set('utm_source', 'topcodes');
      urlObj.searchParams.set('subid', profile.username);
      trackedUrl = urlObj.toString();
    } catch (e) { return alert("Ingresa una URL válida."); }

    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'promotions'), { 
      ...newPromo, trackedUrl, stats: { totalClicks: 0 }, createdAt: new Date().toISOString() 
    });
    setNewPromo({ brandName: '', discount: '', code: '', originalUrl: '' });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-12 animate-in fade-in duration-700">
      <div className="flex-1 space-y-10">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black uppercase tracking-tighter italic mb-8 flex items-center gap-3"><Plus size={20}/> Nuevo Link / Cupón</h3>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Marca (ej. Sephora)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={newPromo.brandName} onChange={e => setNewPromo({...newPromo, brandName: e.target.value})}/>
              <input type="text" placeholder="Oferta (20% OFF)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: e.target.value})}/>
            </div>
            <input type="text" placeholder="Código Cupón (ej. STEF20)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value})}/>
            <input type="url" placeholder="Link de Afiliado Directo" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={newPromo.originalUrl} onChange={e => setNewPromo({...newPromo, originalUrl: e.target.value})}/>
            <button type="submit" className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 shadow-xl transition-all">Publicar Deal</button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
              <div>
                <h4 className="font-black text-sm">{promo.brandName}</h4>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{promo.discount}</p>
                <p className="mt-2 text-[10px] font-black text-blue-500">{promo.stats?.totalClicks || 0} clics registrados</p>
              </div>
              <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'promotions', promo.id))} className="p-3 text-slate-300 hover:text-red-500 bg-slate-50 rounded-xl transition-colors"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden xl:flex flex-col items-center w-[380px] shrink-0 sticky top-10 h-[750px]">
        <div className="w-[320px] h-[650px] bg-white rounded-[3.5rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 w-full h-8 bg-slate-900 rounded-b-3xl flex justify-center items-center"><div className="w-16 h-4 bg-black rounded-b-2xl"></div></div>
          <div className="h-full w-full overflow-y-auto pt-14 pb-8 px-6 bg-[#fdfdfd] text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] mx-auto mb-4 border border-slate-200 overflow-hidden flex items-center justify-center">
               {profile.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : <User size={30} className="text-slate-300" />}
            </div>
            <h3 className="text-xl font-black italic">@{profile.username}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-2 px-4 leading-relaxed">{profile.bio}</p>
            <div className="mt-8 space-y-3">
              {promotions.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-left relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2"><div className="w-8 h-8 bg-black rounded-xl text-white flex items-center justify-center font-black text-[10px]">{p.brandName[0]}</div><ExternalLink size={12} className="text-slate-200" /></div>
                  <h4 className="text-[9px] font-black uppercase text-slate-300 tracking-widest">{p.brandName}</h4>
                  <p className="text-sm font-black italic">{p.discount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] italic flex items-center gap-2"><Smartphone size={12}/> Live Preview</p>
      </div>
    </div>
  );
}

// --- PESTAÑA: PERFIL ---
function TabProfile({ user, profile }) {
  const [formData, setFormData] = useState({ bio: profile.bio || '', photoUrl: profile.photoUrl || '' });
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), formData);
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profile.username), formData);
    setMsg('Perfil actualizado correctamente.');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="max-w-2xl bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in duration-700">
      <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-8 flex items-center gap-3"><Settings size={24}/> Ajustes de Perfil</h2>
      {msg && <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-bold mb-8">{msg}</div>}
      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><ImageIcon size={14}/> Foto de Perfil (URL)</label>
          <input type="url" placeholder="https://..." className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none" value={formData.photoUrl} onChange={e=>setFormData({...formData, photoUrl: e.target.value})}/>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Biografía / Presentación</label>
          <textarea rows="4" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none resize-none" value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})}></textarea>
        </div>
        <button type="submit" className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:brightness-110 transition-all">Guardar Cambios</button>
      </form>
    </div>
  );
}

// ==========================================
// VISTA: SÚPER ADMIN
// ==========================================
function SuperAdmin() {
  const [users, setUsers] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [pass, setPass] = useState('');
  const MASTER_KEY = "TOPCODES_2026"; 

  const handleAuth = (e) => {
    e.preventDefault();
    if (pass === MASTER_KEY) {
      setAuthenticated(true);
      fetchUsers();
    } else { alert("Clave incorrecta."); }
  };

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
    setUsers(snap.docs.map(d => d.data()));
  };

  if (!authenticated) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 text-white font-sans">
      <div className="w-full max-w-sm text-center">
        <Lock size={60} className="mx-auto mb-8 text-[#d1ff64]" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 italic">Admin Console</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="password" placeholder="Clave de Infraestructura" className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={pass} onChange={e=>setPass(e.target.value)}/>
          <button type="submit" className="w-full bg-[#d1ff64] text-black py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Desbloquear</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-10 flex items-center gap-4"><Users size={32} className="text-blue-600"/> Master Directory</h1>
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <tr><th className="p-6">Influencer</th><th className="p-6">Email</th><th className="p-6">Nicho</th><th className="p-6 text-center">Vistas</th><th className="p-6 text-right">Acciones</th></tr>
            </thead>
            <tbody className="text-sm font-bold">
              {users.map(u => (
                <tr key={u.username} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-6"><a href={`/${u.username}`} target="_blank" className="flex items-center gap-2 text-blue-600"><Instagram size={14}/> @{u.username}</a></td>
                  <td className="p-6 text-slate-500">{u.email}</td>
                  <td className="p-6"><span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">{u.category}</span></td>
                  <td className="p-6 text-center font-black text-xl italic">{u.views || 0}</td>
                  <td className="p-6 text-right"><button onClick={()=>alert("Funcionalidad Pro: Editar usuario")} className="p-2 text-slate-300 hover:text-black"><Settings size={18}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VISTA: THE SPOT (Público)
// ==========================================
function PublicSpot() {
  const { username } = useParams();
  const [publicProfile, setPublicProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPublicData = async () => {
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
    if (promo.code) {
      const el = document.createElement('textarea'); el.value = promo.code; document.body.appendChild(el);
      el.select(); document.execCommand('copy'); document.body.removeChild(el);
    }
    const promoRef = doc(db, 'artifacts', appId, 'users', publicProfile.uid, 'promotions', promo.id);
    updateDoc(promoRef, { "stats.totalClicks": increment(1) });
    window.open(promo.trackedUrl, '_blank');
  };

  if (!publicProfile) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-sans pb-20 p-6">
      <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-8 duration-1000">
        <header className="text-center mb-10 mt-10">
          <div className="w-28 h-28 bg-white p-2 rounded-[3.5rem] shadow-2xl mx-auto mb-6 border border-slate-100 overflow-hidden flex items-center justify-center bg-slate-50">
            {publicProfile.photoUrl ? <img src={publicProfile.photoUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-200" />}
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">@{publicProfile.username}</h2>
          <p className="text-sm font-bold text-slate-400 mt-2 max-w-sm mx-auto italic">{publicProfile.bio}</p>
        </header>

        <div className="relative mb-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input type="text" placeholder="Buscar marcas..." className="w-full bg-white border-none rounded-[2rem] py-5 pl-16 pr-6 shadow-sm font-bold text-sm outline-none" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {promotions.filter(p=>p.brandName.toLowerCase().includes(searchTerm.toLowerCase())).map(promo => (
            <button key={promo.id} onClick={()=>handleClick(promo)} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between h-56 text-left hover:border-black transition-all group overflow-hidden relative">
              <div className="absolute -top-4 -right-4 opacity-[0.02] text-black group-hover:opacity-[0.05]"><Zap size={100} /></div>
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-lg">{promo.brandName[0].toUpperCase()}</div>
                <div className="bg-slate-50 p-2.5 rounded-2xl text-slate-400 group-hover:bg-[#d1ff64] group-hover:text-black transition-colors"><ExternalLink size={14} /></div>
              </div>
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1 truncate">{promo.brandName}</h4>
                <p className="text-xl font-black tracking-tighter text-black leading-tight mb-3 truncate">{promo.discount}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 group-hover:text-black">{promo.code ? 'Copiar Código' : 'Ir a la tienda'}</p>
              </div>
            </button>
          ))}
        </div>
        <footer className="mt-20 text-center opacity-30"><p className="text-[8px] font-black uppercase tracking-[0.5em]">Powered by TopCodes</p></footer>
      </div>
    </div>
  );
}
