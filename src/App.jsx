import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
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
  Youtube, Twitter, Music, Code, MessageCircle, X, Send
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ==========================================
// 1. CONFIGURACIÓN FIREBASE 
// ==========================================
// ⚠️ RECUERDA PONER TUS LLAVES AQUÍ ANTES DE GUARDAR
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
          <div className="flex items-center gap-3 mb-12"><Zap size={32} className="text-[#d1ff64] fill-current" /><span className="font-black text-3xl tracking-widest uppercase">TopCodes</span></div>
          <h1 className="text-6xl xl:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8">Aumenta <br/><span className="text-[#d1ff64]">Tus Ventas.</span></h1>
          <p className="text-slate-400 text-xl max-w-lg leading-relaxed">Tus Stories son efímeras, pero tu influencia no tiene por qué serlo. Extiende tu ventana de conversión de 24 horas a <strong>28 días</strong>.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8"><Zap size={48} className="text-black fill-[#d1ff64] mx-auto mb-4" /><h1 className="text-4xl font-black uppercase tracking-tighter italic">TopCodes</h1></div>
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
                  <input type="text" placeholder="Usuario de Instagram (@...)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={igUser} onChange={e=>setIgUser(e.target.value)}/>
                  <div className="grid grid-cols-2 gap-3">
                    <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={category} onChange={e=>setCategory(e.target.value)}><option value="">Nicho</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <input type="text" placeholder="Ciudades" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={cities} onChange={e=>setCities(e.target.value)}/>
                  </div>
                </>
              )}
              <input type="email" placeholder="Correo Electrónico" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={email} onChange={e=>setEmail(e.target.value)}/>
              <input type="password" placeholder="Contraseña" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#d1ff64]" value={password} onChange={e=>setPassword(e.target.value)}/>
              <button type="submit" className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl mt-4">{isLogin ? 'Acceder ahora' : 'Crear mi Spot'}</button>
            </form>
            {isLogin && <div className="mt-8 text-center"><button onClick={handleResetPassword} type="button" className="text-[10px] font-black uppercase text-slate-400 hover:text-black tracking-widest transition-colors">¿Olvidaste tu contraseña?</button></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VISTA: LAYOUT DEL DASHBOARD (Sidebar Influencer)
// ==========================================
function DashboardLayout({ user }) {
  const [profile, setProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); 

  // 🟢 CONFIGURACIÓN DE WHATSAPP (SOPORTE B2B)
  const supportPhone = "525529402572"; // <-- ⚠️ PON TU NÚMERO REAL DE WHATSAPP AQUÍ (Ej. 52 para México + 10 dígitos)

  useEffect(() => {
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => { if (docSnap.exists()) setProfile(docSnap.data()); });
    const promoCol = collection(db, 'artifacts', appId, 'users', user.uid, 'promotions');
    const unsubPromos = onSnapshot(promoCol, (snapshot) => { setPromotions(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); });
    return () => { unsubProfile(); unsubPromos(); };
  }, [user]);

  if (!profile) return <LoadingScreen />;
  
  const publicLink = `${window.location.origin}/${profile.username}`;
  
  // Generar link dinámico de WhatsApp con mensaje pre-escrito
  const waMessage = encodeURIComponent(`¡Hola equipo TopCodes! Necesito ayuda con mi cuenta (@${profile.username}).`);
  const waLink = `https://wa.me/${supportPhone}?text=${waMessage}`;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans relative">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex shrink-0 z-30 shadow-sm">
        <div className="p-8 flex items-center gap-3"><div className="bg-black p-2 rounded-xl"><Zap size={20} className="text-[#d1ff64] fill-current" /></div><span className="font-black uppercase tracking-tighter text-xl italic">TopCodes</span></div>
        <nav className="p-4 flex-grow space-y-1 mt-4">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18}/>} label="Overview" />
          <NavItem active={activeTab === 'promos'} onClick={() => setActiveTab('promos')} icon={<Link2 size={18}/>} label="Promociones" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18}/>} label="Perfil" />
        </nav>
        <div className="p-6 border-t border-slate-100 space-y-2">
          {/* BOTÓN WHATSAPP SIDEBAR */}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-green-50 text-green-600 hover:bg-green-100 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
            <MessageCircle size={16} /> WhatsApp
          </a>
          <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-slate-50 text-slate-500 hover:text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"><LogOut size={16} /> Salir </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="lg:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200 shadow-sm z-20 relative">
          <div className="flex items-center gap-2"><Zap size={24} className="text-black fill-[#d1ff64]" /><span className="font-black uppercase tracking-tighter italic">TopCodes</span></div>
          <div className="flex gap-1 items-center bg-slate-50 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('overview')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-black text-[#d1ff64] shadow-md' : 'text-slate-400'}`}><LayoutDashboard size={18}/></button>
            <button onClick={() => setActiveTab('promos')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'promos' ? 'bg-black text-[#d1ff64] shadow-md' : 'text-slate-400'}`}><Link2 size={18}/></button>
            <button onClick={() => setActiveTab('profile')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-black text-[#d1ff64] shadow-md' : 'text-slate-400'}`}><User size={18}/></button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            {/* BOTÓN WHATSAPP MÓVIL */}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="p-2.5 text-green-500 hover:bg-green-50 rounded-xl" title="Soporte por WhatsApp"><MessageCircle size={18}/></a>
            <button onClick={() => signOut(auth)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><LogOut size={18}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 pb-24">
          {activeTab === 'overview' && <TabOverview profile={profile} promotions={promotions} spotUrl={publicLink} />}
          {activeTab === 'promos' && <TabPromotions user={user} profile={profile} promotions={promotions} />}
          {activeTab === 'profile' && <TabProfile user={user} profile={profile} />}
        </div>
      </main>

      {/* 🤖 EL ASISTENTE VIRTUAL (TOPBOT) */}
      <SupportChatbot userName={profile.username} />

    </div>
  );
}

const NavItem = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${active ? 'bg-black text-[#d1ff64]' : 'text-slate-400 hover:bg-slate-50'}`}>{icon} {label}</button>
);

// ==========================================
// COMPONENTE: CHATBOT DE SOPORTE (TopBot)
// ==========================================
function SupportChatbot({ userName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { text: `¡Hola @${userName}! Soy TopBot ⚡️ ¿En qué te puedo ayudar con tus campañas hoy?`, sender: 'bot' }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Respuestas automáticas inteligentes simuladas
    setTimeout(() => {
      let botReply = "He guardado tu mensaje. Si es algo urgente, haz clic en el botón de WhatsApp del menú para hablar con el CEO directamente.";
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('hola') || lowerInput.includes('buenas')) {
        botReply = "¡Hola! ¿Todo bien con tus links hoy? Recuerda que el botón de WhatsApp está siempre disponible en tu menú.";
      } else if (lowerInput.includes('pago') || lowerInput.includes('dinero') || lowerInput.includes('comision')) {
        botReply = "TopCodes proyecta tus ventas basándose en los clics, pero los pagos reales te los hace directamente cada marca según tu contrato. Nosotros te damos los datos para que les cobres. 💸";
      } else if (lowerInput.includes('marca') || lowerInput.includes('logo') || lowerInput.includes('foto')) {
        botReply = "Extraemos los logos automáticamente de la web de la marca. Si no sale o quieres subir uno especial, ve a 'Promociones', edita la campaña y podrás subir el logo tú mismo.";
      } else if (lowerInput.includes('borrar') || lowerInput.includes('eliminar')) {
        botReply = "Para eliminar una marca, ve a la pestaña 'Promociones' y dale clic al icono de bote de basura rojo junto a tu código.";
      }

      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
    }, 1000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-black text-[#d1ff64] rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-110 transition-transform z-[100] border-2 border-[#d1ff64] ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-10">
          <div className="bg-black p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#d1ff64]">
                <Zap size={20}/>
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
                <div className={`max-w-[85%] p-4 text-xs font-bold leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-[#d1ff64] text-black rounded-[1.5rem] rounded-br-md' : 'bg-white border border-slate-200 text-slate-700 rounded-[1.5rem] rounded-bl-md'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Escribe tu duda..."
              className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-black"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="w-12 h-12 bg-black text-[#d1ff64] rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 outline-none shadow-md">
              <Send size={18}/>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// --- PESTAÑAS DEL INFLUENCER ---
function TabOverview({ profile, promotions, spotUrl }) {
  const [stats, setStats] = useState({ views: 0, clicks: 0, persistence: 0, projection: '0' });
  const [selectedPromo, setSelectedPromo] = useState('all');

  useEffect(() => {
    const activePromos = selectedPromo === 'all' ? promotions : promotions.filter(p => p.id === selectedPromo);
    const totalVistas = selectedPromo === 'all' ? (profile?.views || 0) : 'N/A';
    let totalClics = 0; let totalProjValue = 0; let isPointsOnly = true; let hasMoney = false;

    activePromos.forEach(promo => {
      const clicks = promo.stats?.totalClicks || 0; totalClics += clicks;
      const conversions = clicks * 0.03; const val = parseFloat(promo.commissionValue) || 0;
      if (promo.commissionType === '$') { totalProjValue += conversions * val; hasMoney = true; isPointsOnly = false; } 
      else if (promo.commissionType === '%') { totalProjValue += conversions * (500 * (val / 100)); hasMoney = true; isPointsOnly = false; } 
      else if (promo.commissionType === 'puntos') { totalProjValue += conversions * val; if (!hasMoney) isPointsOnly = true; }
    });

    const projPrefix = hasMoney || (!isPointsOnly && totalProjValue > 0) ? '$' : '';
    const projSuffix = isPointsOnly && totalProjValue > 0 ? ' Pts' : '';
    setStats({ views: totalVistas, clicks: totalClics, persistence: totalVistas !== 'N/A' && totalVistas > 0 ? Math.floor((totalClics / totalVistas) * 100) : (totalClics > 0 ? 'Alta' : 0), projection: `${projPrefix}${totalProjValue.toFixed(2)}${projSuffix}` });
  }, [profile, promotions, selectedPromo]);

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1; let clicsSimulados = 0;
    if (stats.clicks > 0) {
      if (day === 1) clicsSimulados = stats.clicks * 0.4; else if (day <= 3) clicsSimulados = stats.clicks * 0.15; else if (day <= 7) clicsSimulados = stats.clicks * 0.05; else clicsSimulados = (stats.clicks * 0.25) / 23;
    }
    return { name: `D${day}`, clics: Math.max(0, Math.floor(clicsSimulados + (Math.random() * (stats.clicks > 0 ? 2 : 0)))) };
  });

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div><h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-2">Panel de Control</h1><p className="text-slate-500 font-bold">Gestiona tu marca personal y proyecta tus ganancias.</p></div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center"><select className="bg-transparent border-none text-xs font-black uppercase tracking-widest text-slate-600 outline-none px-4 py-2 cursor-pointer appearance-none" value={selectedPromo} onChange={(e) => setSelectedPromo(e.target.value)}><option value="all">Todas las Campañas (Total)</option>{promotions.map(p => <option key={p.id} value={p.id}>{p.brandName} ({p.discount})</option>)}</select></div>
          <div className="bg-white p-2 rounded-2xl flex items-center gap-3 border border-slate-100 shadow-sm">
            <div className="px-4 hidden sm:block"><p className="text-[9px] font-black uppercase text-slate-400 mb-1">Link de tu Spot</p><p className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{spotUrl}</p></div>
            <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => window.open(spotUrl, '_blank')} title="Ver mi Spot público"><Eye size={16} className="text-slate-600"/></button>
            <button className="p-3 bg-black text-[#d1ff64] hover:bg-zinc-800 rounded-xl transition-colors" onClick={() => navigator.clipboard.writeText(spotUrl)} title="Copiar link"><Copy size={16}/></button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center"><Eye className="text-[#8b5cf6] mb-3" size={24}/><p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Vistas Spot</p><p className="text-3xl font-black">{stats.views}</p></div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center"><MousePointer2 className="text-[#a855f7] mb-3" size={24}/><p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Clics Totales</p><p className="text-3xl font-black">{stats.clicks}</p></div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center"><Activity className="text-[#f97316] mb-3" size={24}/><p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Persistencia</p><p className="text-3xl font-black">{stats.persistence}{stats.persistence !== 'Alta' && '%'}</p></div>
        <div className="bg-[#d1ff64] p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center"><TrendingUp className="text-black mb-3" size={24}/><p className="text-[10px] font-black uppercase text-black/60 mb-1 tracking-wider">Proyección</p><p className="text-3xl font-black text-black">{stats.projection}</p></div>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px'}} /><Bar dataKey="clics" fill="#000" radius={[4, 4, 0, 0]} barSize={12} /></BarChart></ResponsiveContainer></div>
    </div>
  );
}

function TabPromotions({ user, profile, promotions }) {
  const [newPromo, setNewPromo] = useState({ brandName: '', brandDomain: '', discount: '', code: '', originalUrl: '', niche: '', commissionType: '%', commissionValue: '' });
  const [editingId, setEditingId] = useState(null); 
  const [msg, setMsg] = useState(''); const [loading, setLoading] = useState(false);

  const getCleanDomain = (domain) => {
    if (!domain) return '';
    return domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
  };
  const cleanDomain = getCleanDomain(newPromo.brandDomain);
  const previewLogoUrl = cleanDomain.includes('.') ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256` : '';

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true); let trackedUrl = newPromo.originalUrl;
    try {
      const urlObj = new URL(newPromo.originalUrl);
      urlObj.searchParams.set('utm_source', 'topcodes'); urlObj.searchParams.set('subid', profile.username);
      trackedUrl = urlObj.toString();
    } catch (e) { setLoading(false); return alert("Ingresa una URL de Afiliado válida."); }

    try {
      const promoData = { ...newPromo, brandDomain: newPromo.brandDomain || '', commissionType: newPromo.commissionType || '%', commissionValue: newPromo.commissionValue || '', trackedUrl, logoUrl: previewLogoUrl };
      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'promotions', editingId), promoData);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', editingId), { ownerId: user.uid, username: profile.username, ...promoData }, { merge: true });
        setMsg('✅ Deal actualizado');
      } else {
        promoData.stats = { totalClicks: 0 }; promoData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'promotions'), promoData);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', docRef.id), { ownerId: user.uid, username: profile.username, ...promoData });
        setMsg('✅ Deal publicado');
      }
      setNewPromo({ brandName: '', brandDomain: '', discount: '', code: '', originalUrl: '', niche: '', commissionType: '%', commissionValue: '' }); setEditingId(null);
      setTimeout(() => setMsg(''), 3000);
    } catch (error) { setMsg(`❌ Error: ${error.message}`); }
    setLoading(false);
  };

  const handleDelete = async (promoId) => {
    if(!window.confirm('¿Eliminar promoción?')) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'promotions', promoId));
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', promoId));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-12 animate-in fade-in duration-700">
      <div className="flex-1 space-y-10">
        <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border ${editingId ? 'border-black' : 'border-slate-100'} transition-all`}>
          <div className="flex justify-between mb-8"><h3 className="text-lg font-black uppercase italic flex items-center gap-3">{editingId ? <Settings size={20} className="text-[#8b5cf6]"/> : <Plus size={20}/>} {editingId ? 'Editar Deal' : 'Nuevo Link'}</h3>{editingId && <button onClick={()=>{setNewPromo({ brandName: '', brandDomain: '', discount: '', code: '', originalUrl: '', niche: '', commissionType: '%', commissionValue: '' }); setEditingId(null);}} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500">Cancelar</button>}</div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-4"><div className="w-16 h-16 bg-white rounded-full flex items-center justify-center relative overflow-hidden">{previewLogoUrl ? <img key={previewLogoUrl} src={previewLogoUrl} className="w-full h-full object-cover p-2 relative z-10" /> : null}<span className="absolute inset-0 flex items-center justify-center font-black text-slate-300 text-xl">{newPromo.brandName ? newPromo.brandName[0].toUpperCase() : <ImageIcon size={24}/>}</span></div><div><p className="text-xs font-black uppercase text-black mb-1">Logo Inteligente</p><p className="text-[10px] font-bold text-slate-400">Escribe la web de la marca.</p></div></div>
              <div className="grid grid-cols-3 gap-4"><input type="text" placeholder="Marca" required className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold" value={newPromo.brandName} onChange={e => setNewPromo({...newPromo, brandName: e.target.value})}/><input type="text" placeholder="Web (ej. nike.com)" className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold" value={newPromo.brandDomain} onChange={e => setNewPromo({...newPromo, brandDomain: e.target.value})}/><select required className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold" value={newPromo.niche} onChange={e=>setNewPromo({...newPromo, niche: e.target.value})}><option value="" disabled>Nicho</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Oferta (20% OFF)" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: e.target.value})}/><input type="text" placeholder="Código (Opcional)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value})}/></div>
            <input type="url" placeholder="Link de Afiliado Directo" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={newPromo.originalUrl} onChange={e => setNewPromo({...newPromo, originalUrl: e.target.value})}/>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100"><label className="text-[10px] font-black uppercase text-slate-400 mb-3 block">Comisión acordada</label><div className="flex gap-4"><select className="w-1/3 bg-white border-none rounded-xl p-4 text-sm font-bold" value={newPromo.commissionType} onChange={e=>setNewPromo({...newPromo, commissionType: e.target.value})}><option value="%">Porcentaje (%)</option><option value="$">Monto Fijo ($)</option><option value="puntos">Puntos</option></select><input type="number" placeholder="Valor (ej. 15)" required className="w-2/3 bg-white border-none rounded-xl p-4 text-sm font-bold" value={newPromo.commissionValue} onChange={e=>setNewPromo({...newPromo, commissionValue: e.target.value})}/></div></div>
            <button type="submit" disabled={loading} className={`w-full ${editingId ? 'bg-[#8b5cf6] text-white' : 'bg-black text-[#d1ff64]'} py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-50`}>{loading ? 'Guardando...' : (editingId ? 'Actualizar Deal' : 'Publicar Deal')}</button>
            {msg && <div className="text-center text-xs font-bold text-green-600 mt-2">{msg}</div>}
          </form>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-sm relative overflow-hidden">{promo.logoUrl ? <img key={promo.logoUrl} src={promo.logoUrl} className="w-full h-full object-cover p-2 relative z-10"/> : null}<span className="absolute inset-0 flex items-center justify-center text-slate-400">{promo.brandName ? promo.brandName[0].toUpperCase() : '?'}</span></div>
                 <div><h4 className="font-black text-sm leading-none mb-1">{promo.brandName}</h4><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{promo.discount}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center"><p className="text-xl font-black leading-none">{promo.stats?.totalClicks || 0}</p><p className="text-[8px] font-black text-slate-300 uppercase">Clics</p></div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => {setNewPromo({ brandName: promo.brandName||'', brandDomain: promo.brandDomain||'', discount: promo.discount||'', code: promo.code||'', originalUrl: promo.originalUrl||'', niche: promo.niche||'', commissionType: promo.commissionType||'%', commissionValue: promo.commissionValue||'' }); setEditingId(promo.id); window.scrollTo({top:0, behavior:'smooth'});}} className="p-2 text-slate-300 hover:text-[#8b5cf6] bg-slate-50 rounded-lg"><Settings size={14}/></button>
                  <button onClick={() => handleDelete(promo.id)} className="p-2 text-slate-300 hover:text-red-500 bg-slate-50 rounded-lg"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden xl:flex flex-col items-center w-[380px] shrink-0 sticky top-10 h-[750px] opacity-50"><p className="text-xs font-bold text-center mt-40">Preview Oculto para espacio de código</p></div>
    </div>
  );
}

function TabProfile({ user, profile }) {
  const [formData, setFormData] = useState({ bio: profile.bio || '', photoUrl: profile.photoUrl || '', tiktokUrl: profile.tiktokUrl || '', youtubeUrl: profile.youtubeUrl || '', xUrl: profile.xUrl || '' });
  const [msg, setMsg] = useState(''); const [uploading, setUploading] = useState(false);

  useEffect(() => { setFormData({ bio: profile.bio || '', photoUrl: profile.photoUrl || '', tiktokUrl: profile.tiktokUrl || '', youtubeUrl: profile.youtubeUrl || '', xUrl: profile.xUrl || '' }); }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), formData);
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profile.username), formData);
    setMsg('✅ Perfil actualizado.'); setTimeout(() => setMsg(''), 3000);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]; if (!file) return; setUploading(true); setMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas'); const MAX_WIDTH = 250; const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        try {
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { photoUrl: base64String });
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profile.username), { photoUrl: base64String });
          setFormData(prev => ({ ...prev, photoUrl: base64String })); setMsg('📸 ¡Foto subida!'); setTimeout(() => setMsg(''), 4000);
        } catch (error) { setMsg(`❌ ERROR: ${error.message}`); } finally { setUploading(false); }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in">
      <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3"><Settings size={24}/> Ajustes de Perfil</h2>
      {msg && <div className="p-4 rounded-2xl text-xs font-bold mb-8 bg-green-50 text-green-600">{msg}</div>}
      <form onSubmit={handleSave} className="space-y-8">
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[10px] font-black uppercase text-slate-400 mb-1">Identidad Base</p><p className="text-lg font-black text-black italic">@{profile.username}</p></div>
        <div className="space-y-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><ImageIcon size={14}/> Foto de Perfil</label>
          <div className="flex items-center gap-6"><div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">{formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-300" />}</div><label className={`cursor-pointer bg-black text-[#d1ff64] px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg ${uploading ? 'opacity-50' : ''}`}>{uploading ? 'Subiendo...' : 'Subir Foto'}<input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} /></label></div>
        </div>
        <textarea rows="4" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none resize-none focus:ring-2 focus:ring-[#d1ff64]" placeholder="Biografía" value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})}></textarea>
        <button type="submit" className="w-full bg-black text-[#d1ff64] py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Guardar Cambios</button>
      </form>
    </div>
  );
}

// ==========================================
// VISTA: SÚPER ADMIN (B2B TORRE DE CONTROL)
// ==========================================
function SuperAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pass, setPass] = useState('');
  
  const [users, setUsers] = useState([]);
  const [allPromos, setAllPromos] = useState([]);
  const [globalStats, setGlobalStats] = useState({ users: 0, views: 0, clicks: 0, projRevenue: 0 });
  
  const [activeTab, setActiveTab] = useState('directorio'); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const MASTER_KEY = "TOPCODES_2026"; 

  const handleAuth = (e) => {
    e.preventDefault();
    if (pass === MASTER_KEY) { setAuthenticated(true); fetchAllData(); } else { alert("Clave incorrecta."); }
  };

  const fetchAllData = async () => {
    const usersSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
    const usersData = usersSnap.docs.map(d => d.data());
    
    const promosSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'promotions'));
    const promosData = promosSnap.docs.map(d => ({id: d.id, ...d.data()}));
    
    setUsers(usersData.sort((a,b) => (b.views||0) - (a.views||0)));
    setAllPromos(promosData);

    let tViews = 0; let tClicks = 0; let tMoney = 0;
    usersData.forEach(u => tViews += (u.views || 0));
    promosData.forEach(p => {
      const clics = p.stats?.totalClicks || 0;
      tClicks += clics;
      if (p.commissionType === '$' && p.commissionValue) { tMoney += (clics * 0.02 * parseFloat(p.commissionValue)); }
      else if (p.commissionType === '%' && p.commissionValue) { tMoney += (clics * 0.02 * (500 * (parseFloat(p.commissionValue)/100))); }
    });

    setGlobalStats({ users: usersData.length, views: tViews, clicks: tClicks, projRevenue: tMoney });
  };

  const handleUpdateUserProfile = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', selectedUser.username), selectedUser);
      await updateDoc(doc(db, 'artifacts', appId, 'users', selectedUser.uid, 'settings', 'profile'), selectedUser);
      alert("✅ Usuario actualizado"); fetchAllData();
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDeleteUser = async (username, uid) => {
    if(!window.confirm(`⚠️ PELIGRO: ¿Seguro que deseas eliminar a @${username} y TODA su información?`)) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', username));
      await deleteDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'));
      alert("🗑️ Usuario eliminado de la plataforma."); 
      setSelectedUser(null); 
      fetchAllData();
    } catch (err) { alert("Error al eliminar: " + err.message); }
  };

  if (!authenticated) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 font-sans">
      <form onSubmit={handleAuth} className="w-full max-w-sm text-center">
        <Lock size={60} className="mx-auto mb-8 text-[#d1ff64]" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 italic text-white">Admin Console</h1>
        <input type="password" placeholder="Clave Maestra" className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-center text-sm font-bold text-white mb-4 outline-none focus:border-[#d1ff64]" value={pass} onChange={e=>setPass(e.target.value)}/>
        <button type="submit" className="w-full bg-[#d1ff64] text-black py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Desbloquear</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Zap size={24} className="text-black fill-[#d1ff64]"/>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">B2B Console</h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button onClick={()=>setActiveTab('directorio')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab==='directorio'?'bg-white shadow-sm text-black':'text-slate-400'}`}>Directorio</button>
          <button onClick={()=>setActiveTab('finanzas')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab==='finanzas'?'bg-white shadow-sm text-black':'text-slate-400'}`}>Finanzas</button>
          <button onClick={()=>setActiveTab('pixeles')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab==='pixeles'?'bg-white shadow-sm text-black':'text-slate-400'}`}>Pixeles (Marcas)</button>
        </div>
        <Link to="/" className="text-xs font-black text-slate-400 hover:text-black uppercase tracking-widest">Salir App</Link>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 animate-in fade-in duration-500">
        
        {activeTab === 'directorio' && !selectedUser && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-black uppercase italic">Creadores Registrados ({globalStats.users})</h2>
               <button onClick={fetchAllData} className="text-xs font-bold text-blue-500">Actualizar Datos</button>
             </div>
             <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                   <tr><th className="p-6">Influencer</th><th className="p-6">Nicho/GEO</th><th className="p-6">Vistas (Tráfico)</th><th className="p-6 text-right">Auditar Cuenta</th></tr>
                 </thead>
                 <tbody className="text-sm font-bold">
                   {users.map((u, i) => (
                     <tr key={u.username} className="border-t border-slate-50 hover:bg-slate-50">
                       <td className="p-6 flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">{u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover"/> : <User size={16} className="text-slate-400"/>}</div>
                         <div><span className="font-black italic text-base">@{u.username}</span><br/><span className="text-[10px] text-slate-400 font-medium">{u.email}</span></div>
                       </td>
                       <td className="p-6"><span className="bg-slate-100 px-3 py-1 rounded-md text-[9px] uppercase tracking-widest text-slate-600">{u.category || 'N/A'}</span><br/><span className="text-[10px] text-slate-400 mt-1 block">{u.cities || 'Global'}</span></td>
                       <td className="p-6 font-black text-xl text-[#8b5cf6]">{u.views || 0}</td>
                       <td className="p-6 text-right">
                         <button onClick={() => setSelectedUser(u)} className="px-4 py-2 bg-black text-[#d1ff64] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-all">Ver y Editar</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'directorio' && selectedUser && (
          <div className="space-y-6">
            <button onClick={() => setSelectedUser(null)} className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 hover:text-black mb-4"><ChevronRight className="rotate-180" size={16}/> Volver al Directorio</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-black uppercase italic mb-6">Perfil: @{selectedUser.username}</h3>
                <form onSubmit={handleUpdateUserProfile} className="space-y-4">
                  <div><label className="text-[10px] font-black uppercase text-slate-400">Nicho</label><input type="text" className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold border-none" value={selectedUser.category} onChange={e=>setSelectedUser({...selectedUser, category: e.target.value})}/></div>
                  <div><label className="text-[10px] font-black uppercase text-slate-400">Ciudades</label><input type="text" className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold border-none" value={selectedUser.cities} onChange={e=>setSelectedUser({...selectedUser, cities: e.target.value})}/></div>
                  <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest mt-4">Guardar Perfil</button>
                </form>
                <div className="pt-6 border-t border-slate-100 text-center mt-6">
                  <button type="button" onClick={() => handleDeleteUser(selectedUser.username, selectedUser.uid)} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors flex items-center justify-center gap-2 w-full"><Trash2 size={12}/> Borrar Influencer</button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black uppercase italic">Sus Campañas Activas</h3>
                  <p className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">Solo Lectura MVP</p>
                </div>
                <div className="space-y-3">
                  {allPromos.filter(p => p.ownerId === selectedUser.uid).length === 0 && <p className="text-sm text-slate-400 italic">No tiene campañas publicadas.</p>}
                  {allPromos.filter(p => p.ownerId === selectedUser.uid).map(promo => (
                    <div key={promo.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden">{promo.logoUrl ? <img src={promo.logoUrl} className="w-full h-full object-cover p-1"/> : <span className="font-black text-xs">{promo.brandName[0]}</span>}</div>
                        <div>
                          <p className="font-black text-sm">{promo.brandName}</p>
                          <p className="text-[9px] font-bold uppercase text-slate-400">{promo.discount} | Clics: {promo.stats?.totalClicks || 0}</p>
                        </div>
                      </div>
                      <a href={promo.trackedUrl} target="_blank" className="p-2 text-slate-400 hover:text-blue-500 bg-white rounded-lg shadow-sm"><ExternalLink size={14}/></a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finanzas' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black uppercase italic mb-2">Platform Economics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tráfico Consolidado (Vistas)</p><p className="text-5xl font-black italic">{globalStats.views.toLocaleString()}</p></div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clics Redirigidos a Marcas</p><p className="text-5xl font-black italic text-[#8b5cf6]">{globalStats.clicks.toLocaleString()}</p></div>
              <div className="bg-black p-8 rounded-[2.5rem] shadow-2xl"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ventas Proyectadas (Total)</p><p className="text-5xl font-black italic text-[#d1ff64]">${globalStats.projRevenue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p></div>
            </div>
            
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
               <h3 className="text-lg font-black uppercase italic mb-2">Top Marcas en TopCodes</h3>
               <p className="text-xs font-bold text-slate-400 mb-8">Las marcas que más clics están recibiendo por tus influencers.</p>
               <div className="space-y-4">
                 {Object.entries(allPromos.reduce((acc, p) => {
                    const name = p.brandName.toUpperCase();
                    acc[name] = (acc[name] || 0) + (p.stats?.totalClicks || 0);
                    return acc;
                 }, {})).sort((a,b)=>b[1]-a[1]).slice(0, 5).map(([brand, clics], idx) => (
                   <div key={brand} className="flex items-center gap-4">
                     <span className="font-black text-slate-300 w-4">{idx+1}</span>
                     <div className="flex-1 bg-slate-50 h-10 rounded-xl overflow-hidden flex relative">
                        <div className="bg-blue-100 h-full" style={{width: `${Math.min((clics/globalStats.clicks)*100, 100)}%`}}></div>
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xs">{brand}</span>
                     </div>
                     <span className="font-black text-sm w-12 text-right">{clics}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'pixeles' && (
          <div className="space-y-8 max-w-4xl mx-auto">
             <div className="text-center mb-10">
               <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"><Code size={24} className="text-[#d1ff64]"/></div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter">Laboratorio de Píxeles B2B</h2>
               <p className="text-sm font-bold text-slate-500 mt-2 max-w-lg mx-auto">Genera los scripts de rastreo para enviárselos a las tiendas directas (Shopify, WooCommerce) y confirmar ventas reales.</p>
             </div>

             <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Instrucciones para la Marca</h3>
               <p className="text-sm font-bold text-slate-600 leading-relaxed mb-6">"Hola equipo técnico de la marca. Para poder reportarle a nuestro influencer sus ventas exactas, por favor agreguen este fragmento de código (Image Pixel) en su página de 'Thank You' o 'Checkout Success'."</p>
               
               <div className="bg-slate-900 p-6 rounded-2xl relative group">
                  <div className="absolute top-4 right-4 text-xs font-black bg-white/10 text-white px-3 py-1 rounded-md">HTML / Shopify</div>
                  <pre className="text-[#d1ff64] font-mono text-xs overflow-x-auto pt-6 pb-2">
{`<!-- TOPCODES CONVERSION PIXEL -->
<script>
  // Extrae el ID del influencer de la URL de compra
  const urlParams = new URLSearchParams(window.location.search);
  const topcodesSubId = urlParams.get('subid') || 'UNKNOWN';
  
  // Monto de la venta (Ejemplo para Shopify)
  const orderAmount = {{ checkout.total_price | money_without_currency }};

  // Disparar el Pixel Invisible
  const pixel = new Image();
  pixel.src = "https://api.topcodes.com/track/sale?amount=" + orderAmount + "&subid=" + topcodesSubId;
</script>
<!-- END TOPCODES PIXEL -->`}
                  </pre>
               </div>
               
               <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4 items-start">
                  <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20}/>
                  <p className="text-xs font-bold text-blue-800 leading-relaxed">Nota de MVP: Este píxel es un mockup visual para tu estrategia B2B. En esta fase 1 del producto, toda la analítica de ventas se proyectará basada en clics (Camino A).</p>
               </div>
             </div>
          </div>
        )}

      </main>
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
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center font-black text-[#d1ff64] text-lg shadow-lg overflow-hidden border border-slate-800">
                  {promo.logoUrl ? <img src={promo.logoUrl} className="w-full h-full object-cover bg-white"/> : (promo.brandName ? promo.brandName[0].toUpperCase() : '?')}
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
        <footer className="mt-24 text-center opacity-30"><p className="text-[9px] font-black uppercase tracking-[0.5em]">Powered by TopCodes</p></footer>
      </div>
    </div>
  );
}