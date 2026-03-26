import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
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
  Copy, Plus, Trash2, LogOut, User, Zap, ExternalLink, Link2, Search, 
  Instagram, Eye, LayoutDashboard, Settings, Users, Activity, ImageIcon, 
  Lock, AlertCircle, Globe, Smartphone, MousePointer2, TrendingUp, CheckCircle,
  Youtube, Twitter, Music
} from 'lucide-react';

// IMPORTANTE: Aquí van las gráficas de barras
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

const CATEGORIES = ["Salud y Belleza", "Deportes", "Moda y Estilo", "Tecnología", "Lifestyle", "Viajes", "Fitness", "Gaming", "Comedia", "Educación", "Finanzas", "Foodie", "Arte", "Otro"];

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
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
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
    setLoading(false);
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
          <div className="lg:hidden text-center mb-8">
            <Zap size={48} className="text-black fill-[#d1ff64] mx-auto mb-4" />
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">TopCodes</h1>
            <p className="text-xs text-slate-500 mt-2 font-bold px-4">Aumenta tus ventas más allá de 24 horas y centraliza tus códigos.</p>
          </div>

          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <div className="flex gap-6 mb-10 border-b border-slate-100">
              <button onClick={() => setIsLogin(true)} className={`pb-4 font-black uppercase tracking-widest text-xs transition-all ${isLogin ? 'border-b-4 border-[#d1ff64] text-black' : 'text-slate-300'}`}>Ingresar</button>
              <button onClick={() => setIsLogin(false)} className={`pb-4 font-black uppercase tracking-widest text-xs transition-all ${!isLogin ? 'border-b-4 border-[#d1ff64] text-black' : 'text-slate-300'}`}>Registro</button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
            {msg && <div className="bg-green-50 text-green-600 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2"><CheckCircle size={14}/> {msg}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <input type="text" placeholder="Usuario de Instagram (@...)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={igUser} onChange={e=>setIgUser(e.target.value)}/>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64] appearance-none" value={category} onChange={e=>setCategory(e.target.value)}>
                        <option value="" disabled>Nicho</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <p className="text-[9px] text-slate-400 mt-2 font-bold pl-2">Categoría principal.</p>
                    </div>
                    <div className="w-1/2">
                      <input type="text" placeholder="Ciudades (ej. CDMX)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={cities} onChange={e=>setCities(e.target.value)}/>
                      <p className="text-[9px] text-slate-400 mt-2 font-bold pl-2">Separa con comas (,).</p>
                    </div>
                  </div>
                </div>
              )}
              <input type="email" placeholder="Correo Electrónico" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={email} onChange={e=>setEmail(e.target.value)}/>
              <input type="password" placeholder="Contraseña" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={password} onChange={e=>setPassword(e.target.value)}/>
              
              <button type="submit" disabled={loading} className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl mt-4 disabled:opacity-50">
                {loading ? 'Cargando...' : (isLogin ? 'Acceder ahora' : 'Crear mi Spot')}
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

  useEffect(() => {
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) setProfile(docSnap.data());
    });
    
    const promoCol = collection(db, 'artifacts', appId, 'users', user.uid, 'promotions');
    const unsubPromos = onSnapshot(promoCol, (snapshot) => {
      setPromotions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    return () => { unsubProfile(); unsubPromos(); };
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
        </nav>
        <div className="p-6 border-t border-slate-100">
          <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-slate-50 text-slate-500 hover:text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
            Salir <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="lg:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200 shadow-sm z-20 relative">
          <div className="flex items-center gap-2">
            <Zap size={24} className="text-black fill-[#d1ff64]" />
            <span className="font-black uppercase tracking-tighter italic">TopCodes</span>
          </div>
          <div className="flex gap-1 items-center bg-slate-50 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('overview')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-black text-[#d1ff64] shadow-md' : 'text-slate-400'}`}><LayoutDashboard size={18}/></button>
            <button onClick={() => setActiveTab('promos')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'promos' ? 'bg-black text-[#d1ff64] shadow-md' : 'text-slate-400'}`}><Link2 size={18}/></button>
            <button onClick={() => setActiveTab('profile')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-black text-[#d1ff64] shadow-md' : 'text-slate-400'}`}><User size={18}/></button>
            <button onClick={() => signOut(auth)} className="p-2.5 text-red-500 ml-1 hover:bg-red-50 rounded-xl"><LogOut size={18}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
          {activeTab === 'overview' && <TabOverview profile={profile} promotions={promotions} spotUrl={publicLink} />}
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

// --- PESTAÑA: RESUMEN (PANEL DE CONTROL) ---
function TabOverview({ profile, promotions, spotUrl }) {
  const [stats, setStats] = useState({ views: 0, clicks: 0, persistence: 0, projection: '0' });
  const [selectedPromo, setSelectedPromo] = useState('all');

  useEffect(() => {
    const activePromos = selectedPromo === 'all' ? promotions : promotions.filter(p => p.id === selectedPromo);
    const totalVistas = selectedPromo === 'all' ? (profile?.views || 0) : 'N/A';
    
    let totalClics = 0;
    let totalProjValue = 0;
    let isPointsOnly = true;
    let hasMoney = false;

    activePromos.forEach(promo => {
      const clicks = promo.stats?.totalClicks || 0;
      totalClics += clicks;
      
      const conversions = clicks * 0.03; 
      const val = parseFloat(promo.commissionValue) || 0;

      if (promo.commissionType === '$') {
         totalProjValue += conversions * val;
         hasMoney = true;
         isPointsOnly = false;
      } else if (promo.commissionType === '%') {
         totalProjValue += conversions * (500 * (val / 100));
         hasMoney = true;
         isPointsOnly = false;
      } else if (promo.commissionType === 'puntos') {
         totalProjValue += conversions * val;
         if (!hasMoney) isPointsOnly = true;
      }
    });

    const projPrefix = hasMoney || (!isPointsOnly && totalProjValue > 0) ? '$' : '';
    const projSuffix = isPointsOnly && totalProjValue > 0 ? ' Pts' : '';

    setStats({
      views: totalVistas,
      clicks: totalClics,
      persistence: totalVistas !== 'N/A' && totalVistas > 0 ? Math.floor((totalClics / totalVistas) * 100) : (totalClics > 0 ? 'Alta' : 0),
      projection: `${projPrefix}${totalProjValue.toFixed(2)}${projSuffix}`
    });
  }, [profile, promotions, selectedPromo]);

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    let clicsSimulados = 0;
    if (stats.clicks > 0) {
      if (day === 1) clicsSimulados = stats.clicks * 0.4;
      else if (day <= 3) clicsSimulados = stats.clicks * 0.15;
      else if (day <= 7) clicsSimulados = stats.clicks * 0.05;
      else clicsSimulados = (stats.clicks * 0.25) / 23;
    }
    return { name: `D${day}`, clics: Math.max(0, Math.floor(clicsSimulados + (Math.random() * (stats.clicks > 0 ? 2 : 0)))) };
  });

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-2">Panel de Control</h1>
          <p className="text-slate-500 font-bold">Gestiona tu marca personal y proyecta tus ganancias.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center">
             <select 
                className="bg-transparent border-none text-xs font-black uppercase tracking-widest text-slate-600 outline-none px-4 py-2 cursor-pointer appearance-none"
                value={selectedPromo}
                onChange={(e) => setSelectedPromo(e.target.value)}
             >
                <option value="all">Todas las Campañas (Total)</option>
                {promotions.map(p => <option key={p.id} value={p.id}>{p.brandName} ({p.discount})</option>)}
             </select>
          </div>
          <div className="bg-white p-2 rounded-2xl flex items-center gap-3 border border-slate-100 shadow-sm">
            <div className="px-4 hidden sm:block">
              <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Link de tu Spot</p>
              <p className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{spotUrl}</p>
            </div>
            <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => window.open(spotUrl, '_blank')} title="Ver mi Spot público"><Eye size={16} className="text-slate-600"/></button>
            <button className="p-3 bg-black text-[#d1ff64] hover:bg-zinc-800 rounded-xl transition-colors" onClick={() => navigator.clipboard.writeText(spotUrl)} title="Copiar link"><Copy size={16}/></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <Eye className="text-[#8b5cf6] mb-3" size={24}/>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Vistas Spot</p>
          <p className="text-3xl font-black">{stats.views}</p>
          <p className="text-[9px] text-slate-400 mt-2 font-bold leading-tight">Visitas totales a tu perfil</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <MousePointer2 className="text-[#a855f7] mb-3" size={24}/>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Clics Totales</p>
          <p className="text-3xl font-black">{stats.clicks}</p>
          <p className="text-[9px] text-slate-400 mt-2 font-bold leading-tight">Veces que usaron tus códigos</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <Activity className="text-[#f97316] mb-3" size={24}/>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Persistencia</p>
          <p className="text-3xl font-black">{stats.persistence}{stats.persistence !== 'Alta' && '%'}</p>
          <p className="text-[9px] text-slate-400 mt-2 font-bold leading-tight">Tráfico +24hrs después de la Story</p>
        </div>
        <div className="bg-[#d1ff64] p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform">
          <TrendingUp className="text-black mb-3" size={24}/>
          <p className="text-[10px] font-black uppercase text-black/60 mb-1 tracking-wider">Proyección</p>
          <p className="text-3xl font-black text-black">{stats.projection}</p>
          <p className="text-[9px] text-black/60 mt-2 font-bold leading-tight">Ganancia estimada calculada</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
           <div>
             <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1 flex items-center gap-2"><Activity size={20}/> Retención a 30 Días</h3>
             <p className="text-xs font-bold text-slate-400">Distribución de clics a lo largo del mes. Así de larga es tu ventana de conversión.</p>
           </div>
        </div>
        
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px'}} />
              <Bar dataKey="clics" fill="#000" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// --- PESTAÑA: PROMOCIONES ---
function TabPromotions({ user, profile, promotions }) {
  const [newPromo, setNewPromo] = useState({ brandName: '', brandDomain: '', discount: '', code: '', originalUrl: '', niche: '', commissionType: '%', commissionValue: '' });
  const [editingId, setEditingId] = useState(null); 
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const getCleanDomain = (domain) => {
    if (!domain) return '';
    return domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
  };
  
  const cleanDomain = getCleanDomain(newPromo.brandDomain);
  const isValidDomain = cleanDomain.includes('.');
  const previewLogoUrl = isValidDomain ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256` : '';

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    let trackedUrl = newPromo.originalUrl;
    try {
      const urlObj = new URL(newPromo.originalUrl);
      urlObj.searchParams.set('utm_source', 'topcodes');
      urlObj.searchParams.set('subid', profile.username);
      trackedUrl = urlObj.toString();
    } catch (e) { 
      setLoading(false);
      return alert("Ingresa una URL de Afiliado válida que empiece con http:// o https://"); 
    }

    try {
      const promoData = {
        brandName: newPromo.brandName, brandDomain: newPromo.brandDomain || '', discount: newPromo.discount,
        code: newPromo.code, originalUrl: newPromo.originalUrl, niche: newPromo.niche,
        commissionType: newPromo.commissionType || '%', commissionValue: newPromo.commissionValue || '',
        trackedUrl, logoUrl: previewLogoUrl
      };

      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'promotions', editingId), promoData);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', editingId), { ownerId: user.uid, username: profile.username, ...promoData }, { merge: true });
        setMsg('✅ ¡Deal actualizado con éxito!');
      } else {
        promoData.stats = { totalClicks: 0 };
        promoData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'promotions'), promoData);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', docRef.id), { ownerId: user.uid, username: profile.username, ...promoData });
        setMsg('✅ ¡Deal publicado con éxito!');
      }
      handleCancelEdit();
      setTimeout(() => setMsg(''), 4000);
    } catch (error) { setMsg(`❌ Error: ${error.message}`); }
    setLoading(false);
  };

  const handleEditClick = (promo) => {
    setNewPromo({
      brandName: promo.brandName || '', brandDomain: promo.brandDomain || '', discount: promo.discount || '',
      code: promo.code || '', originalUrl: promo.originalUrl || '', niche: promo.niche || '',
      commissionType: promo.commissionType || '%', commissionValue: promo.commissionValue || ''
    });
    setEditingId(promo.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setNewPromo({ brandName: '', brandDomain: '', discount: '', code: '', originalUrl: '', niche: '', commissionType: '%', commissionValue: '' });
    setEditingId(null);
  };

  const handleDelete = async (promoId) => {
    if(!window.confirm('¿Seguro que quieres eliminar esta promoción?')) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'promotions', promoId));
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', promoId));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-12 animate-in fade-in duration-700">
      <div className="flex-1 space-y-10">
        <div className={`bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border ${editingId ? 'border-black shadow-lg' : 'border-slate-100'} transition-all`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-3">
              {editingId ? <Settings size={20} className="text-[#8b5cf6]"/> : <Plus size={20}/>}
              {editingId ? 'Editar Deal' : 'Nuevo Link / Cupón'}
            </h3>
            {editingId && <button onClick={handleCancelEdit} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Cancelar</button>}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden relative">
                  {previewLogoUrl ? <img key={previewLogoUrl} src={previewLogoUrl} alt="Logo" className="w-full h-full object-cover bg-white relative z-10 p-2" /> : null}
                  <span className="absolute inset-0 flex items-center justify-center font-black text-slate-300 text-xl">{newPromo.brandName ? newPromo.brandName.charAt(0).toUpperCase() : <ImageIcon size={24}/>}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-black mb-1">Logo Inteligente</p>
                  <p className="text-[10px] font-bold text-slate-400">Escribe o pega el sitio web de la marca y nosotros buscamos su logo oficial.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Marca (ej. Sephora)" required className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={newPromo.brandName} onChange={e => setNewPromo({...newPromo, brandName: e.target.value})}/>
                <input type="text" placeholder="Web (ej. sephora.com.mx)" className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={newPromo.brandDomain} onChange={e => setNewPromo({...newPromo, brandDomain: e.target.value})}/>
                <select required className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64] appearance-none" value={newPromo.niche} onChange={e=>setNewPromo({...newPromo, niche: e.target.value})}>
                  <option value="" disabled>Nicho</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Oferta (ej. 20% OFF)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: e.target.value})}/>
              <input type="text" placeholder="Código Cupón (ej. STEF20)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value})}/>
            </div>
            <input type="url" placeholder="Link de Afiliado Directo" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={newPromo.originalUrl} onChange={e => setNewPromo({...newPromo, originalUrl: e.target.value})}/>
            
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
               <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block">Comisión acordada por venta</label>
               <div className="flex gap-4">
                  <select className="w-1/3 bg-white border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={newPromo.commissionType} onChange={e=>setNewPromo({...newPromo, commissionType: e.target.value})}>
                    <option value="%">Porcentaje (%)</option>
                    <option value="$">Monto Fijo ($)</option>
                    <option value="puntos">Puntos</option>
                  </select>
                  <input type="number" placeholder="Valor (ej. 15)" required className="w-2/3 bg-white border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={newPromo.commissionValue} onChange={e=>setNewPromo({...newPromo, commissionValue: e.target.value})}/>
               </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full ${editingId ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]' : 'bg-black text-[#d1ff64] hover:brightness-110'} py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50`}>
              {loading ? 'Guardando...' : (editingId ? 'Actualizar Deal' : 'Publicar Deal')}
            </button>
            {msg && <div className="text-center text-xs font-bold text-green-600 mt-2">{msg}</div>}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-black transition-colors">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-sm shrink-0 overflow-hidden border border-slate-200 relative">
                  {promo.logoUrl ? <img key={promo.logoUrl} src={promo.logoUrl} className="w-full h-full object-cover bg-white relative z-10 p-2"/> : null}
                  <span className="absolute inset-0 flex items-center justify-center">{promo.brandName ? promo.brandName.charAt(0).toUpperCase() : '?'}</span>
                 </div>
                 <div>
                    <h4 className="font-black text-sm leading-none mb-1">{promo.brandName}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{promo.discount}</p>
                    <p className="mt-2 text-[9px] font-black text-[#8b5cf6]">Ganas: {promo.commissionValue}{promo.commissionType}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                   <p className="text-xl font-black leading-none">{promo.stats?.totalClicks || 0}</p>
                   <p className="text-[8px] font-black text-slate-300 uppercase">Clics</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleEditClick(promo)} title="Editar" className="p-2 text-slate-300 hover:text-[#8b5cf6] bg-slate-50 hover:bg-purple-50 rounded-lg transition-colors"><Settings size={14}/></button>
                  <button onClick={() => handleDelete(promo.id)} title="Eliminar" className="p-2 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden xl:flex flex-col items-center w-[380px] shrink-0 sticky top-10 h-[750px]">
        <div className="w-[320px] h-[650px] bg-white rounded-[3.5rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 w-full h-8 bg-slate-900 rounded-b-3xl flex justify-center items-center z-20"><div className="w-16 h-4 bg-black rounded-b-2xl"></div></div>
          <div className="h-full w-full overflow-y-auto pt-14 pb-8 px-6 bg-[#fdfdfd] text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] mx-auto mb-4 border border-slate-200 overflow-hidden flex items-center justify-center">
               {profile.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : <User size={30} className="text-slate-300" />}
            </div>
            <h3 className="text-xl font-black italic">@{profile.username}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-2 px-4 leading-relaxed">{profile.bio}</p>
            <div className="mt-8 space-y-3">
              {promotions.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-left relative overflow-hidden flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-xl text-[#d1ff64] flex items-center justify-center font-black text-[12px] overflow-hidden shrink-0 relative">
                    {p.logoUrl ? <img key={p.logoUrl} src={p.logoUrl} className="w-full h-full object-cover bg-white relative z-10 p-1"/> : null}
                    <span className="absolute inset-0 flex items-center justify-center">{p.brandName ? p.brandName[0].toUpperCase() : '?'}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[9px] font-black uppercase text-slate-300 tracking-widest leading-none mb-1">{p.brandName}</h4>
                    <p className="text-sm font-black italic leading-none">{p.discount}</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-200" />
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
  const [formData, setFormData] = useState({ 
    bio: profile.bio || '', photoUrl: profile.photoUrl || '', tiktokUrl: profile.tiktokUrl || '', youtubeUrl: profile.youtubeUrl || '', xUrl: profile.xUrl || ''
  });
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormData({ bio: profile.bio || '', photoUrl: profile.photoUrl || '', tiktokUrl: profile.tiktokUrl || '', youtubeUrl: profile.youtubeUrl || '', xUrl: profile.xUrl || '' });
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), formData);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profile.username), formData);
      setMsg('✅ Perfil actualizado correctamente.');
      setTimeout(() => setMsg(''), 4000);
    } catch (error) { setMsg(`❌ Error al guardar: ${error.message}`); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2097152) return alert("⚠️ La imagen es muy pesada. Por favor sube una foto menor a 2MB.");

    setUploading(true); setMsg('');
    try {
      const fileRef = ref(storage, `artifacts/${appId}/users/${user.uid}/profilePic_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { photoUrl: url });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profile.username), { photoUrl: url });
      setFormData(prev => ({ ...prev, photoUrl: url }));
      setMsg('📸 ¡Foto subida y guardada con éxito!');
      setTimeout(() => setMsg(''), 4000);
    } catch (error) { setMsg(`❌ ERROR: ${error.message}`); } finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in duration-700">
      <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-8 flex items-center gap-3"><Settings size={24}/> Ajustes de Perfil</h2>
      <form onSubmit={handleSave} className="space-y-8">
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Identidad Base (TopCodes & IG)</p>
          <p className="text-lg font-black text-black italic">@{profile.username}</p>
        </div>

        <div className="space-y-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><ImageIcon size={14}/> Foto de Perfil</label>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
               {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-300" />}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <label className={`cursor-pointer bg-black text-[#d1ff64] px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all inline-block shadow-lg ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                {uploading ? 'Subiendo...' : 'Subir Foto'}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Biografía / Presentación</label>
          <textarea rows="4" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none resize-none focus:ring-2 focus:ring-[#d1ff64]" value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})}></textarea>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Globe size={16}/> Otras Redes Sociales</h3>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Music size={14}/> TikTok (URL)</label><input type="url" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={formData.tiktokUrl} onChange={e=>setFormData({...formData, tiktokUrl: e.target.value})}/></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Youtube size={14}/> YouTube (URL)</label><input type="url" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={formData.youtubeUrl} onChange={e=>setFormData({...formData, youtubeUrl: e.target.value})}/></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Twitter size={14}/> X / Twitter (URL)</label><input type="url" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={formData.xUrl} onChange={e=>setFormData({...formData, xUrl: e.target.value})}/></div>
        </div>

        <div className="pt-4"><button type="submit" className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">Guardar Cambios</button></div>
        {msg && <div className="mt-4 bg-green-50 text-green-700 p-4 rounded-2xl text-xs font-bold text-center">{msg}</div>}
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
  const [editingUser, setEditingUser] = useState(null); 
  const MASTER_KEY = "TOPCODES_2026"; 

  const handleAuth = (e) => {
    e.preventDefault();
    if (pass === MASTER_KEY) { setAuthenticated(true); fetchUsers(); } else { alert("Clave incorrecta."); }
  };

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
    setUsers(snap.docs.map(d => d.data()));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', editingUser.username), editingUser);
      await updateDoc(doc(db, 'artifacts', appId, 'users', editingUser.uid, 'settings', 'profile'), editingUser);
      alert("Usuario actualizado correctamente."); setEditingUser(null); fetchUsers();
    } catch (err) { alert("Error al actualizar: " + err.message); }
  };

  const handleDeleteUser = async (username, uid) => {
    if(!window.confirm(`¿Seguro que deseas eliminar a @${username}?`)) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', username));
      await deleteDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'));
      alert("Usuario eliminado."); setEditingUser(null); fetchUsers();
    } catch (err) { alert("Error al eliminar: " + err.message); }
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
    <div className="min-h-screen bg-slate-50 p-8 font-sans relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic flex items-center gap-4"><Users size={32} className="text-blue-600"/> Master Directory</h1>
          <Link to="/" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-black uppercase tracking-widest transition-colors">Volver a TopCodes</Link>
        </div>
        
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
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
                  <td className="p-6 text-right"><button onClick={() => setEditingUser(u)} className="p-2 text-slate-400 hover:text-black transition-colors"><Settings size={18}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black mb-6 italic uppercase tracking-tighter">Editar @{editingUser.username}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nicho</label>
                <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={editingUser.category} onChange={e => setEditingUser({...editingUser, category: e.target.value})}>
                  <option value="">Seleccionar Nicho</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Ciudades</label>
                <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={editingUser.cities} onChange={e => setEditingUser({...editingUser, cities: e.target.value})}/>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#d1ff64] text-black py-4 rounded-2xl font-black text-xs uppercase shadow-lg">Guardar</button>
              </div>
              <div className="pt-6 border-t border-slate-100 text-center">
                <button type="button" onClick={() => handleDeleteUser(editingUser.username, editingUser.uid)} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors flex items-center justify-center gap-2 w-full"><Trash2 size={12}/> Eliminar Influencer</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
      <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-1000">
        <header className="text-center mb-12 mt-10">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-2 rounded-[3.5rem] shadow-2xl mx-auto mb-6 border border-slate-100 overflow-hidden flex items-center justify-center bg-slate-50 transition-transform hover:scale-105">
            {publicProfile.photoUrl ? <img src={publicProfile.photoUrl} className="w-full h-full object-cover" /> : <User size={50} className="text-slate-200" />}
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">@{publicProfile.username}</h2>
          <p className="text-sm md:text-base font-bold text-slate-400 mt-4 max-w-lg mx-auto italic">{publicProfile.bio}</p>
          
          <div className="flex justify-center gap-3 mt-6">
            <a href={`https://instagram.com/${publicProfile.username}`} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-pink-600"><Instagram size={20} /></a>
            {publicProfile.tiktokUrl && <a href={publicProfile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-black"><Music size={20} /></a>}
            {publicProfile.youtubeUrl && <a href={publicProfile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-red-600"><Youtube size={20} /></a>}
            {publicProfile.xUrl && <a href={publicProfile.xUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-slate-800"><Twitter size={20} /></a>}
          </div>
        </header>

        <div className="relative mb-12 max-w-2xl mx-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="Buscar marcas o descuentos..." className="w-full bg-white border-none rounded-[2rem] py-5 pl-16 pr-6 shadow-sm font-bold text-base outline-none focus:ring-2 focus:ring-black transition-all" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {promotions.filter(p=>(p.brandName || '').toLowerCase().includes(searchTerm.toLowerCase())).map(promo => (
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
    </div>
  );
}