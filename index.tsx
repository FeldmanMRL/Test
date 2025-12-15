import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';
import { 
  Menu, Search, Map as MapIcon, Compass, Landmark, Utensils, 
  Hotel, Ticket, Calendar, Briefcase, ShieldAlert, Phone, 
  MoreVertical, Mic, Volume2, Type, Sun, MessageCircle, X, Navigation, User, ChevronRight, Star,
  Clock, Footprints, Home, MapPin, Check, Plus, ArrowUp, ArrowLeft, ArrowRight, CornerUpLeft, CornerUpRight, XCircle, Navigation2, Filter, Globe
} from 'lucide-react';
import L from 'leaflet';

// --- Material Design 3 Constants ---
const M3 = {
  colors: {
    primary: 'bg-blue-600',
    onPrimary: 'text-white',
    primaryContainer: 'bg-blue-100',
    onPrimaryContainer: 'text-blue-900',
    secondaryContainer: 'bg-blue-50',
    onSecondaryContainer: 'text-blue-800',
    surface: 'bg-[#FDFDF5]', 
    surfaceContainer: 'bg-white',
    onSurface: 'text-[#1C1B1F]',
    onSurfaceVariant: 'text-[#49454F]',
    outline: 'border-[#79747E]',
    outlineVariant: 'border-[#CAC4D0]',
    error: 'bg-[#B3261E]',
    onError: 'text-white',
  },
  shape: {
    fab: 'rounded-[16px]', 
    card: 'rounded-[12px]', 
    cornerLarge: 'rounded-[24px]', 
    pill: 'rounded-full',
  },
  elevation: {
    level1: 'shadow-sm',
    level2: 'shadow-md',
    level3: 'shadow-lg',
  },
  typography: {
    headlineMedium: 'text-[28px] leading-[36px]',
    titleLarge: 'text-[22px] leading-[28px] font-normal',
    titleMedium: 'text-[16px] leading-[24px] font-medium tracking-[0.15px]',
    bodyLarge: 'text-[16px] leading-[24px] tracking-[0.5px]',
    bodyMedium: 'text-[14px] leading-[20px] tracking-[0.25px]',
    labelLarge: 'text-[14px] leading-[20px] font-medium tracking-[0.1px]',
  }
};

// --- Types ---
interface Route {
  id: number;
  name: string;
  description: string;
  distance: string;
  duration: string;
  difficulty: string;
  coordinates: [number, number][];
  image: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  day: string;
  month: string;
  time: string;
  location: string;
  description: string;
  image: string;
}

interface MapMarker {
  pos: [number, number];
  title: string;
  desc: string;
  type: string;
}

// --- Data ---
// 10 Requested Languages
const LANGUAGES = [
  { code: 'pt', flag: '🇧🇷', name: 'Português' },
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'zh', flag: '🇨🇳', name: '中文' }, // Mandarin
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' }, // Hindi
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' }, // Arabic
  { code: 'bn', flag: '🇧🇩', name: 'বাংলা' }, // Bengali
  { code: 'ru', flag: '🇷🇺', name: 'Русский' }, // Russian
  { code: 'id', flag: '🇮🇩', name: 'Bahasa Indonesia' },
];

const UI_TEXT: Record<string, any> = {
  pt: {
    appName: "Belo Vale",
    searchPlaceholder: "Pesquisar...",
    home: "Início",
    map: "Mapa",
    itineraries: "Roteiros",
    spots: "Pontos Turísticos",
    gastronomy: "Gastronomia",
    hotels: "Hospedagens",
    experiences: "Experiências",
    events: "Eventos",
    entrepreneur: "Empreendedor",
    security: "Segurança",
    contacts: "Contatos Úteis",
    calendar: "Agenda Cultural",
    exploreRoutes: "Explorar Roteiros",
    exploreEntrepreneurs: "Empreendedores",
    featuredRoutes: "Roteiros em Destaque",
    planVisit: "Planeje sua visita seguindo nossos caminhos sugeridos.",
    exploreMap: "Explore o Mapa Interativo",
    mapDesc: "Navegação GPS, rotas e pontos locais.",
    openMap: "Abrir Mapa",
    viewOnMap: "Ver no Mapa",
    difficulty: { easy: "Fácil", hard: "Difícil", medium: "Médio" },
    startNavigation: "Navegar",
    calculating: "Calculando...",
    navigatingTo: "Indo para",
    exitNavigation: "Sair",
    filter: "Filtrar"
  }
};

// Fallback logic
const getT = (lang: string) => UI_TEXT[lang] || UI_TEXT['pt'];

const ROUTES: Route[] = [
  {
    id: 1,
    name: 'Caminho Histórico',
    description: 'Igrejas e casarões do século XVIII.',
    distance: '3.5km',
    duration: '2h',
    difficulty: 'easy',
    coordinates: [[-20.3887, -43.9157], [-20.3950, -43.9200]],
    image: 'https://images.unsplash.com/photo-1596395819057-d3752e55b6bd?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Rota das Cachoeiras',
    description: 'Trilha ecológica e Cachoeira do Mascate.',
    distance: '8km',
    duration: '4h',
    difficulty: 'hard',
    coordinates: [[-20.3600, -43.9000], [-20.3650, -43.8950]],
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Circuito da Mexerica',
    description: 'Sabores locais e a famosa ponkan.',
    distance: '2km',
    duration: '3h',
    difficulty: 'medium',
    coordinates: [[-20.3800, -43.9100]],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop'
  }
];

const MENU_FULL_LIST = [
  { id: 'home', icon: Home, key: 'home' },
  { id: 'map', icon: MapIcon, key: 'map' },
  { id: 'itineraries', icon: Compass, key: 'itineraries' },
  { id: 'spots', icon: Landmark, key: 'spots' },
  { id: 'gastronomy', icon: Utensils, key: 'gastronomy' },
  { id: 'hotels', icon: Hotel, key: 'hotels' },
  { id: 'experiences', icon: Ticket, key: 'experiences' },
  { id: 'events', icon: Calendar, key: 'events' },
  { id: 'entrepreneur', icon: Briefcase, key: 'entrepreneur' },
  { id: 'security', icon: ShieldAlert, key: 'security' },
  { id: 'contacts', icon: Phone, key: 'contacts' },
  { id: 'calendar', icon: Calendar, key: 'calendar' }, // Agenda Cultural
];

const MAP_MARKERS: MapMarker[] = [
  { pos: [-20.3887, -43.9157], title: 'Centro', desc: 'Ponto de partida.', type: 'landmark' },
  { pos: [-20.3600, -43.9000], title: 'Cachoeira', desc: 'Natureza.', type: 'nature' },
  { pos: [-20.3950, -43.9200], title: 'Fazenda Boa Esperança', desc: 'História.', type: 'history' },
];

const USER_START_POS: [number, number] = [-20.3700, -43.9200];

// --- Components ---

const AIChatFAB = ({ apiKey, lang }: { apiKey: string, lang: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: `Guia turístico Belo Vale. Curto. Idioma ${lang}. Usuário: ${input}` }] }]
      });
      setMessages([...newMessages, { role: 'model', text: response.text || "..." }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: "Erro." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 ${M3.colors.primaryContainer} ${M3.colors.onPrimaryContainer} ${M3.shape.fab} w-14 h-14 flex items-center justify-center ${M3.elevation.level3} hover:brightness-95 active:scale-95 transition-all duration-200`}
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={() => setIsOpen(false)} />
          <div className={`pointer-events-auto w-full sm:w-[360px] h-[80vh] sm:h-[600px] ${M3.colors.surfaceContainer} rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300`}>
            <div className={`p-4 flex items-center justify-between border-b ${M3.colors.outlineVariant}`}>
              <h3 className={`${M3.typography.titleLarge} ${M3.colors.onSurface}`}>Guia Virtual</h3>
              <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full hover:${M3.colors.secondaryContainer}`}>
                <X size={24} className={M3.colors.onSurfaceVariant} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F5F5]">
               {messages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-3 ${msg.role === 'user' ? `${M3.colors.primary} ${M3.colors.onPrimary} rounded-l-[20px] rounded-tr-[20px] rounded-br-[4px]` : `${M3.colors.secondaryContainer} ${M3.colors.onSecondaryContainer} rounded-r-[20px] rounded-tl-[20px] rounded-bl-[4px]`} ${M3.elevation.level1}`}>
                     <p className={M3.typography.bodyMedium}>{msg.text}</p>
                   </div>
                 </div>
               ))}
               <div ref={messagesEndRef} />
            </div>
            <div className={`p-4 ${M3.colors.surfaceContainer} flex gap-2 items-center`}>
              <div className={`flex-1 h-12 ${M3.colors.surface} border ${M3.colors.outline} rounded-full flex items-center px-4`}>
                <input 
                  className="flex-1 bg-transparent outline-none text-base"
                  placeholder="Digite..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                />
              </div>
              <button onClick={handleSend} disabled={loading} className={`h-12 w-12 rounded-full ${M3.colors.primary} ${M3.colors.onPrimary} flex items-center justify-center`}>
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- New Components for Restructured Layout ---

const NavigationDrawer = ({ isOpen, onClose, t, navigateTo }: any) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onClose} />
      <div className={`relative w-[80%] max-w-[300px] h-full ${M3.colors.surfaceContainer} pointer-events-auto flex flex-col animate-in slide-in-from-left duration-300 rounded-r-[16px]`}>
        <div className="p-6 border-b border-gray-100">
           <h2 className={`${M3.typography.headlineMedium} ${M3.colors.onSurface}`}>Menu</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {MENU_FULL_LIST.map((item) => (
            <button
              key={item.id}
              onClick={() => { navigateTo(item.id); onClose(); }}
              className={`w-full flex items-center gap-4 px-6 py-4 hover:${M3.colors.secondaryContainer} transition-colors`}
            >
              <item.icon size={24} className={M3.colors.onSurfaceVariant} />
              <span className={`${M3.typography.bodyLarge} ${M3.colors.onSurface}`}>{t[item.key] || item.key}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomHeader = ({ t, onMenuClick, onLangClick, currentFlag }: any) => (
  <div className={`sticky top-0 z-40 ${M3.colors.surface} ${M3.elevation.level1} px-4 h-[64px] flex items-center justify-between`}>
    <div className="flex items-center gap-2">
      {/* Logo Placeholder */}
      <div className={`w-8 h-8 rounded-lg ${M3.colors.primary} flex items-center justify-center text-white font-bold`}>BV</div>
      <h1 className={`${M3.typography.titleLarge} ${M3.colors.onSurface}`}>Belo Vale</h1>
    </div>
    
    <div className="flex items-center gap-1">
      <button className="p-3 rounded-full hover:bg-black/5">
        <Search size={24} className={M3.colors.onSurfaceVariant} />
      </button>
      
      <button onClick={onLangClick} className="p-2 rounded-full hover:bg-black/5 text-xl">
        {currentFlag}
      </button>

      <button onClick={onMenuClick} className="p-3 rounded-full hover:bg-black/5">
        <MoreVertical size={24} className={M3.colors.onSurfaceVariant} />
      </button>
    </div>
  </div>
);

const LanguageSelector = ({ isOpen, onClose, onSelect }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full max-w-xs ${M3.colors.surfaceContainer} rounded-[28px] shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto`}>
         <div className="p-4 border-b">
           <h3 className={M3.typography.titleLarge}>Idiomas</h3>
         </div>
         {LANGUAGES.map(lang => (
           <button 
             key={lang.code}
             onClick={() => { onSelect(lang.code); onClose(); }}
             className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0"
           >
             <span className={M3.typography.bodyLarge}>{lang.name}</span>
             <span className="text-2xl">{lang.flag}</span>
           </button>
         ))}
      </div>
    </div>
  )
}

// --- Views ---

const HomeView = ({ t, navigateTo }: any) => (
  <div className="bg-[#FDFDF5] min-h-screen pb-10">
    
    <div className="p-4 space-y-6">
      
      {/* 1. Two Main Buttons */}
      <div className="flex gap-4 mt-2">
        <button 
          onClick={() => navigateTo('itineraries')}
          className={`flex-1 h-[100px] ${M3.colors.primaryContainer} rounded-[16px] flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform`}
        >
          <Compass size={32} className={M3.colors.onPrimaryContainer} />
          <span className={`${M3.typography.labelLarge} ${M3.colors.onPrimaryContainer} text-center leading-tight`}>{t.exploreRoutes}</span>
        </button>
        <button 
          onClick={() => navigateTo('entrepreneur')}
          className={`flex-1 h-[100px] ${M3.colors.secondaryContainer} rounded-[16px] flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform`}
        >
          <Briefcase size={32} className={M3.colors.onSecondaryContainer} />
          <span className={`${M3.typography.labelLarge} ${M3.colors.onSecondaryContainer} text-center leading-tight`}>{t.exploreEntrepreneurs}</span>
        </button>
      </div>

      {/* 2. Clickable Categories Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'spots', icon: Landmark, label: t.spots },
          { id: 'gastronomy', icon: Utensils, label: t.gastronomy },
          { id: 'hotels', icon: Hotel, label: t.hotels },
          { id: 'experiences', icon: Ticket, label: t.experiences },
          { id: 'events', icon: Calendar, label: t.events },
          { id: 'entrepreneur', icon: Briefcase, label: t.entrepreneur },
        ].map((item) => (
           <button 
             key={item.id}
             onClick={() => navigateTo(item.id)}
             className={`flex flex-col items-center gap-2 py-2`}
           >
             <div className={`w-14 h-14 ${M3.colors.surfaceContainer} rounded-[16px] border ${M3.colors.outlineVariant} flex items-center justify-center shadow-sm`}>
               <item.icon size={24} className={M3.colors.primary} />
             </div>
             <span className={`text-[11px] font-medium text-center ${M3.colors.onSurface} leading-tight`}>{item.label}</span>
           </button>
        ))}
      </div>

      {/* 3. Featured Itineraries */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className={`${M3.typography.titleMedium} ${M3.colors.onSurface}`}>{t.featuredRoutes}</h2>
          <ChevronRight size={20} className={M3.colors.onSurfaceVariant}/>
        </div>
        <p className={`${M3.typography.bodyMedium} ${M3.colors.onSurfaceVariant} mb-4 px-1`}>{t.planVisit}</p>
        
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
          {ROUTES.map(route => (
            <div 
              key={route.id}
              onClick={() => navigateTo('map')}
              className={`min-w-[280px] w-[280px] snap-center ${M3.colors.surfaceContainer} ${M3.shape.card} ${M3.elevation.level1} overflow-hidden flex flex-col active:scale-[0.98] transition-transform`}
            >
              <div className="relative h-[160px] bg-gray-200">
                <img src={route.image} className="w-full h-full object-cover" alt={route.name} loading="lazy" />
                <div className={`absolute top-2 right-2 ${M3.colors.secondaryContainer} ${M3.colors.onSecondaryContainer} px-2 py-1 rounded-md text-xs font-bold uppercase`}>
                  {t.difficulty[route.difficulty]}
                </div>
              </div>
              <div className="p-4">
                <h3 className={`${M3.typography.titleMedium} ${M3.colors.onSurface} mb-1`}>{route.name}</h3>
                <p className={`${M3.typography.bodyMedium} ${M3.colors.onSurfaceVariant} line-clamp-1`}>{route.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Map Banner */}
      <div 
        onClick={() => navigateTo('map')}
        className={`w-full h-[180px] ${M3.shape.cornerLarge} relative overflow-hidden ${M3.elevation.level2} active:opacity-90`}
      >
        <div className="absolute inset-0 bg-slate-900">
          <MapIcon size={180} className="absolute -right-8 -bottom-8 text-white/10" />
        </div>
        <div className="relative z-10 p-6 flex flex-col justify-end h-full">
          <h3 className={`${M3.typography.headlineMedium} text-white mb-2`}>{t.exploreMap}</h3>
          <p className={`${M3.typography.bodyMedium} text-slate-200 mb-4 max-w-[80%]`}>{t.mapDesc}</p>
          <button className={`${M3.colors.surface} ${M3.colors.onSurface} ${M3.shape.pill} px-5 py-2 self-start font-medium text-sm flex items-center gap-2`}>
            {t.openMap} <ArrowRight size={16} />
          </button>
        </div>
      </div>

    </div>
  </div>
);

const MapView = ({ t }: any) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(USER_START_POS, 14);
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Current Location Marker
    L.marker(USER_START_POS, {
       icon: L.divIcon({
         html: '<div class="w-5 h-5 bg-blue-600 border-[3px] border-white rounded-full shadow-lg"></div>',
         className: 'bg-transparent'
       })
    }).addTo(map);

    MAP_MARKERS.forEach(m => {
      const marker = L.marker(m.pos).addTo(map);
      marker.on('click', () => {
        setSelectedMarker(m);
        setIsNavigating(false);
        if (routePolylineRef.current) routePolylineRef.current.remove();
        map.setView(m.pos, 15, { animate: true });
      });
    });

    setTimeout(() => map.invalidateSize(), 100);
  }, []);

  const startNavigation = async () => {
    if (!selectedMarker || !mapInstanceRef.current) return;
    setIsNavigating(true);
    setRouteInfo(null);
    setStepIndex(0);
    const start = USER_START_POS;
    const end = selectedMarker.pos;
    
    try {
      const resp = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`);
      const data = await resp.json();
      if (data.routes?.[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c: any) => [c[1], c[0]]);
        if (routePolylineRef.current) routePolylineRef.current.remove();
        routePolylineRef.current = L.polyline(coords, { color: '#2563EB', weight: 6 }).addTo(mapInstanceRef.current);
        mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });
        setRouteInfo({
          dist: (route.distance/1000).toFixed(1),
          dur: Math.ceil(route.duration/60),
          steps: route.legs[0].steps
        });
      }
    } catch(e) { console.error(e); }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setSelectedMarker(null);
    if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Controls */}
      {!isNavigating && (
        <div className="absolute top-20 right-4 flex flex-col gap-2 z-[1000]">
           <button className={`w-12 h-12 rounded-full ${M3.colors.surfaceContainer} shadow-md flex items-center justify-center`}>
             <Navigation size={24} className="text-blue-600" />
           </button>
           <button className={`w-12 h-12 rounded-full ${M3.colors.surfaceContainer} shadow-md flex items-center justify-center`}>
             <Filter size={24} className={M3.colors.onSurfaceVariant} />
           </button>
        </div>
      )}

      {/* Details Sheet */}
      {!isNavigating && selectedMarker && (
         <div className={`absolute bottom-6 left-4 right-4 ${M3.colors.surfaceContainer} ${M3.shape.cornerLarge} p-4 shadow-xl z-[1000] animate-in slide-in-from-bottom`}>
            <div className="flex justify-between items-start mb-2">
               <div>
                 <h3 className={M3.typography.headlineMedium}>{selectedMarker.title}</h3>
                 <p className={M3.typography.bodyMedium}>{selectedMarker.desc}</p>
               </div>
               <button onClick={() => setSelectedMarker(null)} className={`p-2 rounded-full ${M3.colors.secondaryContainer}`}><X size={20}/></button>
            </div>
            <button 
              onClick={startNavigation}
              className={`w-full mt-4 h-[48px] ${M3.colors.primary} ${M3.colors.onPrimary} ${M3.shape.pill} font-medium flex items-center justify-center gap-2`}
            >
              <Navigation2 size={20}/> {t.startNavigation}
            </button>
         </div>
      )}

      {/* Navigation UI */}
      {isNavigating && (
        <div className="absolute inset-0 z-[1000] pointer-events-none flex flex-col justify-between p-4 pt-24">
           <div className={`pointer-events-auto ${M3.colors.primary} ${M3.colors.onPrimary} p-4 rounded-[20px] shadow-lg flex gap-4 items-center`}>
              <ArrowUp size={32} />
              <div>
                 <p className="text-sm opacity-80">{routeInfo ? `${routeInfo.steps[stepIndex]?.distance.toFixed(0)}m` : t.calculating}</p>
                 <p className={M3.typography.titleLarge}>{routeInfo ? (routeInfo.steps[stepIndex]?.name || 'Siga em frente') : t.calculating}</p>
              </div>
           </div>
           <div className={`pointer-events-auto ${M3.colors.surfaceContainer} p-4 rounded-[20px] shadow-lg flex items-center justify-between`}>
              <div>
                <p className={`${M3.typography.headlineMedium} text-green-600`}>{routeInfo?.dur} min</p>
                <p className={M3.typography.bodyMedium}>{routeInfo?.dist} km • {t.navigatingTo} {selectedMarker?.title}</p>
              </div>
              <button 
                onClick={stopNavigation}
                className={`w-12 h-12 rounded-full ${M3.colors.error} ${M3.colors.onError} flex items-center justify-center`}
              >
                <X size={24} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [langCode, setLangCode] = useState('pt');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isLangOpen, setLangOpen] = useState(false);

  const t = getT(langCode);
  const currentFlag = LANGUAGES.find(l => l.code === langCode)?.flag || '🇧🇷';

  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const renderContent = () => {
    if (currentView === 'home') return <HomeView t={t} navigateTo={navigateTo} />;
    if (currentView === 'map') return <MapView t={t} />;
    // Fallback for other pages using HomeView structure or simple placeholder
    return (
      <div className="min-h-screen pt-4 px-4 bg-[#FDFDF5]">
         <button onClick={() => navigateTo('home')} className="mb-4 flex items-center gap-2 text-blue-600">
           <ArrowLeft size={20} /> Voltar
         </button>
         <h1 className={M3.typography.headlineMedium}>{t[currentView] || currentView}</h1>
         <p className="text-gray-500 mt-2">Conteúdo da seção em desenvolvimento.</p>
      </div>
    );
  };

  return (
    <div className={`font-sans ${M3.colors.surface} text-[#1C1B1F] min-h-screen selection:bg-blue-200`}>
      <CustomHeader 
        t={t} 
        onMenuClick={() => setDrawerOpen(true)} 
        onLangClick={() => setLangOpen(true)}
        currentFlag={currentFlag}
      />
      
      <NavigationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        t={t} 
        navigateTo={navigateTo} 
      />
      
      <LanguageSelector 
        isOpen={isLangOpen} 
        onClose={() => setLangOpen(false)} 
        onSelect={setLangCode} 
      />

      <main>
        {renderContent()}
      </main>
      
      <AIChatFAB apiKey={process.env.API_KEY || ''} lang={langCode} />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);