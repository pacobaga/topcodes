import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  sendPasswordResetEmail, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, getDoc, addDoc, updateDoc, 
  onSnapshot, deleteDoc, getDocs 
} from 'firebase/firestore';
import { 
  Copy, Plus, Trash2, LogOut, User, Zap, Tag, MapPin, 
  ExternalLink, Link2, Search, Instagram, Eye, LayoutDashboard, 
  Settings, Users, Activity, BarChart3, Image as ImageIcon, ChevronRight, Lock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
const appId = 'topcodes-mvp-v1';

const CATEGORIES = ["Salud y Belleza", "Deportes", "Moda y Estilo", "Tecnología", "Lifestyle", "Viajes"];

// Helper: Generar datos de gráfica simulados basados en clics reales
const generateChartData = (profileViews, promoClicks) => {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return days.map((day, i) => ({
    name: day,
    Vistas: Math.floor((profileViews / 7) * (1 + Math.random() * 0.5)),
    Clics: Math.floor((promoClicks / 7) * (1 + Math.random() * 0.5)),
  }));
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

// ==========================================
// UI COMPONENT: LOADING
// ==========================================
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
        // Verificar si el usuario ya existe (simplificado para MVP)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        const profileData = { 
          username: cleanUser, email, category, cities, bio: 'Bienvenido a mi Spot',
          photoUrl: '', views: 0, createdAt: new Date().toISOString() 
        };
        
        // Guardar privado y público
        await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'), profileData);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', cleanUser), { uid, ...profileData });
      }
    } catch (err) {
      setError(err.message.includes('email-already') ? 'El correo ya está registrado.' : 'Error al autenticar. Verifica tus datos.');
    }
  };

  const handleResetPassword = async () => {
    if (!email) return setError('Ingresa tu correo primero para resetear la contraseña.');
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('Correo de recuperación enviado.');
    } catch (err) { setError('Error al enviar correo.'); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mitad Izquierda (Info) */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-black text-white p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><Zap size={400}/></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <Zap size={30} className="text-[#d1ff64] fill-current" />
            <span className="font-black text-2xl tracking-widest uppercase">TopCodes</span>
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
            Recupera <br/><span className="text-[#d1ff64]">Tus Ventas.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-md">El 80% de tus ventas se pierden cuando tus Stories expiran. Centraliza tus códigos y demuestra tu verdadero ROI a las marcas.</p>
        </div>
      </div>

      {/* Mitad Derecha (Formulario) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <Zap size={24} className="text-black fill-[#d1ff64]" />
            <span className="font-black text-xl tracking-widest uppercase">TopCodes</span>
          </div>

          <div className="bg-white p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex gap-4 mb-8">
              <button onClick={() => setIsLogin(true)} className={`pb-2 font-black uppercase tracking-widest text-sm transition-all ${isLogin ? 'border-b-2 border-[#d1ff64] text-black' : 'text-slate-400'}`}>Ingresar</button>
              <button onClick={() => setIsLogin(false)} className={`pb-2 font-black uppercase tracking-widest text-sm transition-all ${!isLogin ? 'border-b-2 border-[#d1ff64] text-black' : 'text-slate-400'}`}>Registrarse</button>
            </div>

            {error && <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}
            {msg && <p className="text-green-500 text-xs font-bold mb-4 bg-green-50 p-3 rounded-xl">{msg}</p>}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <input type="text" placeholder="Usuario IG (ej. stef_lifestyle)" required className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={igUser} onChange={e=>setIgUser(e.target.value)}/>
                  <select required className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none" value={category} onChange={e=>setCategory(e.target.value)}>
                    <option value="">Nicho Principal</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="text" placeholder="Ciudades (ej. CDMX, Mty)" required className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none" value={cities} onChange={e=>setCities(e.target.value)}/>
                </>
              )}
              <input type="email" placeholder="Correo Electrónico" required className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={email} onChange={e=>setEmail(e.target.value)}/>
              <input type="password" placeholder="Contraseña" required className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={password} onChange={e=>setPassword(e.target.value)}/>
              
              <button type="submit" className="w-full bg-black text-[#d1ff64] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-900 transition-colors mt-2">
                {isLogin ? 'Entrar al Spot' : 'Crear Cuenta'}
              </button>
            </form>

            {isLogin && (
              <div className="mt-6 text-center">
                <button onClick={handleResetPassword} type="button" className="text-xs font-bold text-slate-400 hover:text-black transition-colors">¿Olvidaste tu contraseña?</button>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/admin-master" className="text-[10px] font-black uppercase text-slate-300 hover:text-slate-500 flex items-center justify-center gap-1"><Lock size={10}/> Admin Access</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VISTA: LAYOUT DEL DASHBOARD (Sidebar + Content)
// ==========================================
function DashboardLayout({ user }) {
  const [profile, setProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, promos, profile
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'));
      if (docSnap.exists()) setProfile(docSnap.data());
      
      const promoCol = collection(db, 'artifacts', appId, 'users', user.uid, 'promotions');
      onSnapshot(promoCol, (snapshot) => {
        setPromotions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    };
    loadData();
  }, [user]);

  if (!profile) return <LoadingScreen />;

  const publicLink = `${window.location.origin}/${profile.username}`;

  return (
    <div className="flex h-screen bg-[#f4f4f5] overflow-hidden font-sans">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0 z-20 shadow-[10px_0_30px_rgba(0,0,0,0.02)]">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-black p-2 rounded-xl"><Zap size={18} className="text-[#d1ff64] fill-current" /></div>
          <span className="font-black uppercase tracking-tighter text-lg">TopCodes</span>
        </div>
        
        <div className="p-4 flex-grow space-y-2 overflow-y-auto">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-3 mb-2 mt-4">Tú Espacio</p>
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-slate-100 text-black' : 'text-slate-500 hover:bg-slate-50 hover:text-black'}`}>
            <LayoutDashboard size={18} /> Overview (Data)
          </button>
          <button onClick={() => setActiveTab('promos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'promos' ? 'bg-slate-100 text-black' : 'text-slate-500 hover:bg-slate-50 hover:text-black'}`}>
            <Link2 size={18} /> Promociones
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-slate-100 text-black' : 'text-slate-500 hover:bg-slate-50 hover:text-black'}`}>
            <Settings size={18} /> Editar Perfil
          </button>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200">
          <Zap size={20} className="text-black fill-[#d1ff64]" />
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('overview')} className="p-2 text-slate-500"><LayoutDashboard size={20}/></button>
            <button onClick={() => setActiveTab('promos')} className="p-2 text-slate-500"><Link2 size={20}/></button>
            <button onClick={() => signOut(auth)} className="p-2 text-red-500"><LogOut size={20}/></button>
          </div>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* BANNER PROMO */}
          <div className="bg-gradient-to-r from-black to-slate-800 rounded-2xl p-6 text-white mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg">
            <div>
              <h2 className="text-xl font-black italic">Bienvenida a TopCodes Elite, {profile.username}</h2>
              <p className="text-slate-400 text-sm mt-1">Tu infraestructura personal para convertir influencia en ventas reales.</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-center bg-white/10 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] font-black uppercase text-[#d1ff64] tracking-widest mb-2">Tu Link Público</p>
              <div className="flex items-center gap-2 bg-black p-2 rounded-lg">
                <span className="text-xs text-slate-300 font-mono truncate max-w-[150px]">{publicLink}</span>
                <button onClick={() => navigator.clipboard.writeText(publicLink)} className="bg-[#d1ff64] text-black p-1.5 rounded hover:bg-white transition-colors">
                  <Copy size={14}/>
                </button>
              </div>
            </div>
          </div>

          {/* RENDERIZADO CONDICIONAL DE PESTAÑAS */}
          {activeTab === 'overview' && <TabOverview profile={profile} promotions={promotions} />}
          {activeTab === 'promos' && <TabPromotions user={user} profile={profile} promotions={promotions} publicLink={publicLink} />}
          {activeTab === 'profile' && <TabProfile user={user} profile={profile} />}

        </div>
      </main>
    </div>
  );
}

// --- PESTAÑA 1: OVERVIEW (ANALYTICS) ---
function TabOverview({ profile, promotions }) {
  const profileViews = profile.views || 0;
  const promoClicks = promotions.reduce((acc, p) => acc + (p.stats?.totalClicks || 0), 0);
  const estComm = Math.floor((promoClicks * 0.05) * 50); // Simulación: 5% conversión * $50 mxn
  
  const chartData = generateChartData(profileViews, promoClicks);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Vistas de Perfil</p>
          <p className="text-5xl font-black tracking-tighter">{profileViews}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center border-b-4 border-b-black">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Clics de Colaboración</p>
          <p className="text-5xl font-black tracking-tighter text-black">{promoClicks}</p>
        </div>
        <div className="bg-[#d1ff64] p-6 rounded-2xl shadow-sm border border-[#c0eb5c] flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Comisión Estimada*</p>
          <p className="text-5xl font-black tracking-tighter text-black">${estComm}</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={18}/> Tráfico Post-24h (Últimos 7 días)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
              <Line type="monotone" dataKey="Vistas" stroke="#94a3b8" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="Clics" stroke="#000000" strokeWidth={4} dot={{r: 5, fill: '#d1ff64'}} activeDot={{r: 7}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-400 font-bold mt-4 italic text-center">*La gráfica demuestra cómo tus links siguen generando clics a marcas días después de que tus historias expiran.</p>
      </div>
    </div>
  );
}

// --- PESTAÑA 2: GESTOR DE PROMOS & PREVIEW ---
function TabPromotions({ user, profile, promotions, publicLink }) {
  const [newPromo, setNewPromo] = useState({ brandName: '', discount: '', code: '', originalUrl: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    let trackedUrl = newPromo.originalUrl;
    try {
      const urlObj = new URL(newPromo.originalUrl);
      urlObj.searchParams.set('utm_source', 'topcodes');
      urlObj.searchParams.set('subid', profile.username);
      trackedUrl = urlObj.toString();
    } catch (e) { return alert("URL inválida."); }

    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'promotions'), { 
      ...newPromo, trackedUrl, stats: { totalClicks: 0 }, createdAt: new Date().toISOString() 
    });
    setNewPromo({ brandName: '', discount: '', code: '', originalUrl: '' });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'promotions', id));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-500">
      {/* Columna Izquierda: Formulario y Lista */}
      <div className="flex-1 space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-black tracking-tighter mb-4 italic flex items-center gap-2"><Plus size={18}/> Añadir Promoción</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Marca (ej. Sephora)" required className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={newPromo.brandName} onChange={e => setNewPromo({...newPromo, brandName: e.target.value})}/>
              <input type="text" placeholder="Oferta (20% OFF)" required className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: e.target.value})}/>
            </div>
            <input type="text" placeholder="Código de descuento (ej. STEF20)" className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value})}/>
            <input type="url" placeholder="Link de afiliado (https://...)" required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={newPromo.originalUrl} onChange={e => setNewPromo({...newPromo, originalUrl: e.target.value})}/>
            <button type="submit" className="w-full bg-black text-[#d1ff64] py-3 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Publicar y Rastrear</button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tighter mb-4">Mis Promociones Activas</h2>
          <div className="space-y-3">
            {promotions.map(promo => (
              <div key={promo.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm">{promo.brandName} <span className="text-[10px] text-slate-400 ml-1">{promo.discount}</span></h4>
                  <p className="text-[10px] font-bold text-slate-400">{promo.code || 'Link'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#d1ff64] bg-black px-2 py-1 rounded uppercase">{promo.stats.totalClicks} clics</span>
                  <button onClick={() => handleDelete(promo.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
            {promotions.length === 0 && <p className="text-slate-400 text-sm italic">No hay promociones activas.</p>}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Preview Celular Falso */}
      <div className="hidden xl:flex flex-col items-center w-[350px] shrink-0 sticky top-4 h-[700px]">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Live Preview</p>
        <div className="w-[320px] h-[650px] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 w-full h-6 bg-slate-900 rounded-b-2xl flex justify-center"><div className="w-16 h-4 bg-black rounded-b-xl"></div></div>
          {/* Contenido del celular simulado */}
          <div className="h-full w-full overflow-y-auto pt-10 pb-6 px-4 bg-[#fdfdfd]">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-slate-100 rounded-[2rem] mx-auto mb-3 flex items-center justify-center overflow-hidden border border-slate-200">
                {profile.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover"/> : <User size={30} className="text-slate-300"/>}
              </div>
              <h2 className="text-xl font-black italic">@{profile.username}</h2>
              <p className="text-[10px] font-bold text-slate-400 px-4 mt-2">{profile.bio}</p>
            </div>
            <div className="space-y-3">
              {promotions.map(promo => (
                <div key={promo.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                   <div className="flex justify-between items-start relative z-10">
                    <div className="w-8 h-8 bg-black rounded-xl text-white flex items-center justify-center text-[10px] font-black">{promo.brandName[0]}</div>
                    <ExternalLink size={12} className="text-slate-300" />
                  </div>
                  <div className="mt-2 relative z-10">
                    <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{promo.brandName}</h4>
                    <p className="text-sm font-black leading-tight mb-1">{promo.discount}</p>
                    <p className="text-[8px] font-bold text-slate-400">{promo.code ? 'Copiar Código' : 'Ir a la tienda'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PESTAÑA 3: EDITAR PERFIL ---
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
    <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in duration-500">
      <h2 className="text-xl font-black tracking-tighter mb-6 flex items-center gap-2"><Settings size={20}/> Ajustes del Perfil</h2>
      {msg && <p className="bg-green-50 text-green-600 p-3 rounded-xl text-sm font-bold mb-4">{msg}</p>}
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2"><ImageIcon size={14}/> URL de Foto de Perfil</label>
          <input type="url" placeholder="Ej: https://instagram.com/p/foto.jpg" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})}/>
          {formData.photoUrl && <img src={formData.photoUrl} alt="Preview" className="w-16 h-16 rounded-2xl mt-4 object-cover border border-slate-200" />}
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Biografía / Mensaje</label>
          <textarea rows="3" placeholder="Hola, aquí dejo mis códigos favoritos..." className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
        </div>
        <button type="submit" className="bg-[#d1ff64] text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black hover:text-[#d1ff64] transition-colors">Guardar Cambios</button>
      </form>
    </div>
  );
}

// ==========================================
// VISTA: SÚPER ADMIN (Para ver a todos)
// ==========================================
function SuperAdmin() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
      setUsers(snap.docs.map(d => d.data()));
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3"><Users className="text-blue-500"/> Súper Admin Panel</h1>
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-black">Volver a inicio</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-[10px] uppercase tracking-widest text-slate-500">
              <tr><th className="p-4">Usuario</th><th className="p-4">Correo</th><th className="p-4">Nicho</th><th className="p-4">Vistas</th><th className="p-4">Registro</th></tr>
            </thead>
            <tbody className="text-sm font-bold">
              {users.map(u => (
                <tr key={u.username} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-4 text-blue-500"><a href={`/${u.username}`} target="_blank">@{u.username}</a></td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.category}</td>
                  <td className="p-4">{u.views || 0}</td>
                  <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
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
        
        // Sumar una vista al perfil (sin await para no bloquear)
        updateDoc(profileRef, { views: (profileData.views || 0) + 1 }).catch(()=>{});
        // Si el usuario existe, actualizar también su doc privado de settings (para que lo vea en su admin)
        updateDoc(doc(db, 'artifacts', appId, 'users', profileData.uid, 'settings', 'profile'), { views: (profileData.views || 0) + 1 }).catch(()=>{});

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
    
    // Tracking Clic
    if (publicProfile?.uid) {
      const promoRef = doc(db, 'artifacts', appId, 'users', publicProfile.uid, 'promotions', promo.id);
      updateDoc(promoRef, { "stats.totalClicks": (promo.stats?.totalClicks || 0) + 1 }).catch(()=>{});
    }

    let finalUrl = promo.trackedUrl;
    try { const u = new URL(finalUrl); u.searchParams.set('tcid', Math.random().toString(36).substr(2,6)); finalUrl = u.toString(); } catch(e){}
    window.open(finalUrl, '_blank');
  };

  if (!publicProfile) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-sans pb-20">
      <div className="max-w-xl mx-auto p-6 animate-in slide-in-from-bottom-8 duration-700">
        
        <header className="text-center mb-10 mt-10">
          <div className="w-28 h-28 bg-white p-2 rounded-[3rem] shadow-xl mx-auto mb-6 border border-slate-100 overflow-hidden">
            <div className="w-full h-full bg-slate-50 rounded-[2.5rem] flex items-center justify-center overflow-hidden">
              {publicProfile.photoUrl ? <img src={publicProfile.photoUrl} className="w-full h-full object-cover"/> : <User size={40} className="text-slate-300"/>}
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">@{publicProfile.username}</h2>
          <p className="text-sm font-bold text-slate-500 mt-2 max-w-sm mx-auto">{publicProfile.bio}</p>
          <div className="flex justify-center gap-2 mt-4">
            <span className="bg-white px-4 py-2 rounded-full text-[10px] font-black text-slate-400 border border-slate-100 uppercase shadow-sm"><Tag size={12} className="inline mr-1"/>{publicProfile.category}</span>
          </div>
        </header>

        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input type="text" placeholder="Buscar marcas..." className="w-full bg-white border-none rounded-[2rem] py-5 pl-16 pr-6 shadow-sm font-bold text-sm outline-none" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {promotions.filter(p=>p.brandName.toLowerCase().includes(searchTerm.toLowerCase())).map(promo => (
            <button key={promo.id} onClick={()=>handleClick(promo)} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between h-52 text-left hover:border-black transition-all group overflow-hidden relative outline-none">
              <div className="absolute -top-4 -right-4 opacity-[0.02] text-black group-hover:opacity-[0.05]"><Zap size={100} /></div>
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-lg">{promo.brandName[0].toUpperCase()}</div>
                <div className="bg-slate-50 p-2.5 rounded-2xl text-slate-400 group-hover:bg-[#d1ff64] group-hover:text-black transition-colors"><ExternalLink size={14} /></div>
              </div>
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1 truncate">{promo.brandName}</h4>
                <p className="text-xl font-black tracking-tighter text-black leading-tight mb-3 truncate">{promo.discount}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 group-hover:text-black">{promo.code ? <><Copy size={10}/> Copiar Código</> : <><Link2 size={10}/> Ir a la tienda</>}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
