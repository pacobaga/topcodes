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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Copy, Plus, Trash2, LogOut, User, Zap, Tag, MapPin, 
  ExternalLink, Link2, Search, Instagram, Eye, LayoutDashboard, 
  Settings, Users, Activity, BarChart3, Image as ImageIcon, Lock, 
  ChevronRight, AlertCircle, Globe, Smartphone, MousePointer2, TrendingUp, CheckCircle,
  Youtube, Twitter, Music
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
const storage = getStorage(app);
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
      
      {/* Lado Izquierdo - Solo visible en computadora */}
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

      {/* Lado Derecho - Visible en todo, ajustado para celular */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          
          {/* Título y logo móvil */}
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
                        <option value="Salud y Belleza">Salud y Belleza</option>
                        <option value="Deportes">Deportes</option>
                        <option value="Moda y Estilo">Moda y Estilo</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Viajes">Viajes</option>
                        <option value="Fitness">Fitness</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Comedia">Comedia</option>
                        <option value="Educación">Educación</option>
                        <option value="Finanzas">Finanzas / Negocios</option>
                        <option value="Foodie">Foodie / Gastronomía</option>
                        <option value="Arte">Arte y Diseño</option>
                        <option value="Otro">Otro</option>
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
  const navigate = useNavigate();

  useEffect(() => {
    // Vigilante del Perfil en tiempo real
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) setProfile(docSnap.data());
    });
    
    // Vigilante de las Promociones en tiempo real
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

  const publicLink = `${window.location.origin}/${profile.username}`;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* Menú de PC (Izquierda) */}
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
        
        {/* MENÚ MÓVIL */}
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Panel de Control</h1>
              <p className="text-slate-400 text-sm font-medium mt-1">Gestiona tu marca personal y proyecta tus ganancias.</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-none">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Link de tu Spot</p>
                <p className="text-xs font-bold text-black font-mono truncate max-w-[180px]">{publicLink}</p>
              </div>
              <div className="flex gap-2 shrink-0">
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

// --- PESTAÑA: OVERVIEW ---
function TabOverview({ profile, promotions }) {
  const profileViews = profile.views || 0;
  const promoClicks = promotions.reduce((acc, p) => acc + (p.stats?.totalClicks || 0), 0);
  
  const proj28Days = Math.floor((promoClicks * 0.03) * 45 * 2.2);
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Vistas Spot" value={profileViews} icon={<Eye className="text-blue-500" size={24}/>} />
        <StatCard label="Clics Totales" value={promoClicks} icon={<MousePointer2 className="text-purple-500" size={24}/>} />
        <StatCard label="Persistencia" value={persistenceRate} icon={<Activity className="text-orange-500" size={24}/>} />
        <StatCard label="Proyección" value={`$${proj28Days}`} icon={<TrendingUp className="text-green-500" size={24}/>} highlight />
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
    <p className="text-2xl md:text-3xl font-black tracking-tighter text-black">{value}</p>
  </div>
);

// --- PESTAÑA: PROMOS ---
function TabPromotions({ user, profile, promotions }) {
  const [newPromo, setNewPromo] = useState({ 
    brandName: '', 
    discount: '', 
    code: '', 
    originalUrl: '',
    niche: '',
    commissionType: '%',
    commissionValue: ''
  });
  const [promoLogoUrl, setPromoLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Subir Logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fileRef = ref(storage, `artifacts/${appId}/users/${user.uid}/brands/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setPromoLogoUrl(url);
    } catch (error) {
      alert("Error al subir el logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAdd = async (e) => {
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
      return alert("Ingresa una URL válida que empiece con http:// o https://"); 
    }

    try {
      const promoData = {
        ...newPromo,
        trackedUrl,
        logoUrl: promoLogoUrl,
        stats: { totalClicks: 0 },
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'promotions'), promoData);
      
      // Guardar también en el Spot público para que se vea la info nueva
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', docRef.id), {
        ownerId: user.uid,
        username: profile.username,
        ...promoData
      });

      setNewPromo({ brandName: '', discount: '', code: '', originalUrl: '', niche: '', commissionType: '%', commissionValue: '' });
      setPromoLogoUrl('');
      setMsg('✅ ¡Deal publicado con éxito!');
      setTimeout(() => setMsg(''), 4000);
    } catch (error) {
      setMsg(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleDelete = async (promoId) => {
    if(!window.confirm('¿Seguro que quieres eliminar esta promoción?')) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'promotions', promoId));
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', promoId));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-12 animate-in fade-in duration-700">
      <div className="flex-1 space-y-10">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black uppercase tracking-tighter italic mb-8 flex items-center gap-3"><Plus size={20}/> Nuevo Link / Cupón</h3>
          <form onSubmit={handleAdd} className="space-y-6">
            
            {/* Logo y Nicho */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                  {promoLogoUrl ? <img src={promoLogoUrl} alt="Logo" className="w-full h-full object-cover"/> : <ImageIcon size={24} className="text-slate-300"/>}
                </div>
                <div className="flex-1">
                  <label className={`cursor-pointer bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors inline-block shadow-sm ${uploadingLogo ? 'opacity-50 cursor-wait' : ''}`}>
                    {uploadingLogo ? 'Subiendo...' : 'Subir Logo Marca'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                  <p className="text-[9px] font-bold text-slate-400 mt-2">Sube el logo oficial (Opcional).</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <input type="text" placeholder="Marca (ej. Sephora)" required className="w-1/2 bg-white border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={newPromo.brandName} onChange={e => setNewPromo({...newPromo, brandName: e.target.value})}/>
                <select required className="w-1/2 bg-white border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64] appearance-none" value={newPromo.niche} onChange={e=>setNewPromo({...newPromo, niche: e.target.value})}>
                  <option value="" disabled>Nicho de la Marca</option>
                  <option value="Salud y Belleza">Salud y Belleza</option>
                  <option value="Deportes">Deportes</option>
                  <option value="Moda y Estilo">Moda y Estilo</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Foodie">Foodie / Alimentos</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Oferta y Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Oferta (20% OFF)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: e.target.value})}/>
              <input type="text" placeholder="Código Cupón (ej. STEF20)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value})}/>
            </div>
            <input type="url" placeholder="Link de Afiliado Directo" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={newPromo.originalUrl} onChange={e => setNewPromo({...newPromo, originalUrl: e.target.value})}/>
            
            {/* Comisión */}
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

            <button type="submit" disabled={loading} className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 shadow-xl transition-all disabled:opacity-50">
              {loading ? 'Guardando...' : 'Publicar Deal'}
            </button>
            {msg && <div className="text-center text-xs font-bold text-green-600 mt-2">{msg}</div>}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-xs shrink-0 overflow-hidden border border-slate-200">
                  {promo.logoUrl ? <img src={promo.logoUrl} className="w-full h-full object-cover"/> : (promo.brandName ? promo.brandName.charAt(0).toUpperCase() : '?')}
                 </div>
                 <div>
                    <h4 className="font-black text-sm">{promo.brandName}</h4>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{promo.discount}</p>
                    <p className="mt-1 text-[9px] font-black text-[#8b5cf6]">Ganas: {promo.commissionValue}{promo.commissionType}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                   <p className="text-lg font-black leading-none">{promo.stats?.totalClicks || 0}</p>
                   <p className="text-[8px] font-black text-slate-300 uppercase">Clics</p>
                </div>
                <button onClick={() => handleDelete(promo.id)} className="p-3 text-slate-300 hover:text-red-500 bg-slate-50 rounded-xl transition-colors"><Trash2 size={18}/></button>
              </div>
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
                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-left relative overflow-hidden flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-xl text-[#d1ff64] flex items-center justify-center font-black text-[12px] overflow-hidden shrink-0">
                    {p.logoUrl ? <img src={p.logoUrl} className="w-full h-full object-cover"/> : (p.brandName ? p.brandName[0].toUpperCase() : '?')}
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
// --- PESTAÑA: PERFIL ---
function TabProfile({ user, profile }) {
  const [formData, setFormData] = useState({ 
    bio: profile.bio || '', 
    photoUrl: profile.photoUrl || '',
    tiktokUrl: profile.tiktokUrl || '',
    youtubeUrl: profile.youtubeUrl || '',
    xUrl: profile.xUrl || ''
  });
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormData({
      bio: profile.bio || '', 
      photoUrl: profile.photoUrl || '',
      tiktokUrl: profile.tiktokUrl || '',
      youtubeUrl: profile.youtubeUrl || '',
      xUrl: profile.xUrl || ''
    });
  }, [profile]);

 // Subir Logo con Validación de Tamaño
 const handleLogoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validación: Si pesa más de 2MB (2 * 1024 * 1024 bytes), rebótalo.
  if (file.size > 2097152) {
    alert("⚠️ La imagen es muy pesada. Por favor sube un logo menor a 2MB.");
    return;
  }

  setUploadingLogo(true);
  try {
    const fileRef = ref(storage, `artifacts/${appId}/users/${user.uid}/brands/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    setPromoLogoUrl(url);
  } catch (error) {
    console.error(error);
    alert(`❌ Error técnico: ${error.message}`);
  } finally {
    setUploadingLogo(false);
  }
};

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMsg(''); // Limpia mensajes viejos
    
    try {
      // Le agregamos "Date.now()" para evitar que los celulares guarden en caché la foto vieja
      const fileRef = ref(storage, `artifacts/${appId}/users/${user.uid}/profilePic_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { photoUrl: url });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profile.username), { photoUrl: url });
      
      setFormData(prev => ({ ...prev, photoUrl: url }));
      setMsg('📸 ¡Foto subida y guardada con éxito!');
      setTimeout(() => setMsg(''), 4000);
    } catch (error) {
      setMsg(`❌ ERROR FIREBASE: ${error.code || error.message}`);
      console.error(error);
    } finally {
      // ESTA ES LA MAGIA: Pase lo que pase, destraba el botón
      setUploading(false); 
    }
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
              <p className="text-[10px] font-bold text-slate-400 mt-4 leading-relaxed max-w-sm">Te recomendamos subir la <strong className="text-black">misma foto de tu Instagram</strong> para que tus seguidores reconozcan tu Spot al instante.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Biografía / Presentación</label>
          <textarea rows="4" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none resize-none focus:ring-2 focus:ring-[#d1ff64]" value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})}></textarea>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Globe size={16}/> Otras Redes Sociales</h3>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Music size={14}/> TikTok (URL)</label>
            <input type="url" placeholder="https://tiktok.com/@..." className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={formData.tiktokUrl} onChange={e=>setFormData({...formData, tiktokUrl: e.target.value})}/>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Youtube size={14}/> YouTube (URL)</label>
            <input type="url" placeholder="https://youtube.com/..." className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={formData.youtubeUrl} onChange={e=>setFormData({...formData, youtubeUrl: e.target.value})}/>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Twitter size={14}/> X / Twitter (URL)</label>
            <input type="url" placeholder="https://x.com/..." className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={formData.xUrl} onChange={e=>setFormData({...formData, xUrl: e.target.value})}/>
          </div>
        </div>

        {/* --- EL MENSAJE AHORA APARECE AQUÍ ABAJO --- */}
        <div className="pt-4">
          <button type="submit" className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">Guardar Cambios</button>
          {msg && <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl text-xs font-bold text-center animate-in slide-in-from-top-2">{msg}</div>}
        </div>

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
    if (pass === MASTER_KEY) {
      setAuthenticated(true);
      fetchUsers();
    } else { alert("Clave incorrecta."); }
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
      alert("Usuario actualizado correctamente.");
      setEditingUser(null);
      fetchUsers();
    } catch (err) { alert("Error al actualizar: " + err.message); }
  };

  const handleDeleteUser = async (username, uid) => {
    if(!window.confirm(`¿Seguro que deseas eliminar a @${username}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', username));
      await deleteDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'));
      alert("Usuario eliminado del sistema.");
      setEditingUser(null);
      fetchUsers();
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
                  <td className="p-6 text-right">
                    <button onClick={() => setEditingUser(u)} className="p-2 text-slate-400 hover:text-black transition-colors"><Settings size={18}/></button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                 <tr><td colSpan="5" className="p-10 text-center text-slate-400 italic font-medium">No hay usuarios registrados en la infraestructura.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-6 italic uppercase tracking-tighter">Editar @{editingUser.username}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nicho</label>
                <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={editingUser.category} onChange={e => setEditingUser({...editingUser, category: e.target.value})}>
                  <option value="">Seleccionar Nicho</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Ciudades</label>
                <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={editingUser.cities} onChange={e => setEditingUser({...editingUser, cities: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email (Solo Lectura)</label>
                <input type="email" disabled className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-bold text-slate-400 outline-none cursor-not-allowed" value={editingUser.email} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#d1ff64] text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">Guardar</button>
              </div>
              <div className="pt-6 border-t border-slate-100 text-center">
                <button type="button" onClick={() => handleDeleteUser(editingUser.username, editingUser.uid)} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors flex items-center justify-center gap-2 w-full">
                  <Trash2 size={12}/> Eliminar Influencer
                </button>
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
            <a href={`https://instagram.com/${publicProfile.username}`} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-pink-600">
              <Instagram size={20} />
            </a>
            {publicProfile.tiktokUrl && (
              <a href={publicProfile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-black">
                <Music size={20} />
              </a>
            )}
            {publicProfile.youtubeUrl && (
              <a href={publicProfile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-red-600">
                <Youtube size={20} />
              </a>
            )}
            {publicProfile.xUrl && (
              <a href={publicProfile.xUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-50 text-slate-800">
                <Twitter size={20} />
              </a>
            )}
          </div>
        </header>

        <div className="relative mb-12 max-w-2xl mx-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="Buscar marcas o descuentos..." className="w-full bg-white border-none rounded-[2rem] py-5 pl-16 pr-6 shadow-sm font-bold text-base outline-none focus:ring-2 focus:ring-black transition-all" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {promotions.filter(p=>p.brandName.toLowerCase().includes(searchTerm.toLowerCase())).map(promo => (
            <button key={promo.id} onClick={()=>handleClick(promo)} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between h-64 text-left hover:border-black hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute -top-4 -right-4 opacity-[0.02] text-black group-hover:opacity-[0.05] transition-opacity"><Zap size={120} /></div>
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg">{promo.brandName[0].toUpperCase()}</div>
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
        <footer className="mt-24 text-center opacity-30"><p className="text-[9px] font-black uppercase tracking-[0.5em]">Powered by TopCodes</p></footer>
      </div>
    </div>
  );
}