import { useEffect, useState, useRef, useMemo } from 'react';
import { Heart, Sparkles, Users, Music, Edit2, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Helmet } from "react-helmet";
import L from 'leaflet';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function App() {
  const [time, setTime] = useState(new Date());
  const [showRelationshipImage, setShowRelationshipImage] = useState(false);
  const [showFirstDateImage, setShowFirstDateImage] = useState(false);
  const [showOneMonthImage, setShowOneMonthImage] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // NEW: Dreams section - generic editable list
  const [dreams, setDreams] = useState(() => {
    const saved = localStorage.getItem('dreams');
    return saved ? JSON.parse(saved) : ['Viajar juntos por el mundo', 'Construir un hogar', 'Lograr metas profesionales en pareja'];
  });
  const [newDream, setNewDream] = useState('');

  // NEW: Learned section - generic editable list
  const [learned, setLearned] = useState(() => {
    const saved = localStorage.getItem('learned');
    return saved ? JSON.parse(saved) : [
      'Lo responsable que eres en todo lo que haces',
      'Los increíbles logros que has alcanzado',
      'Lo maravillosa persona que eres, siempre inspirándome'
    ];
  });
  const [newLearned, setNewLearned] = useState('');

  // NEW: Special mode for birthdays/anniversaries
  const [isSpecialDay, setIsSpecialDay] = useState(false);

  // Countdown for reunion
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const reunionDate = new Date('2026-01-02T21:00:00');

  /* const audioRef = useRef<HTMLAudioElement>(null); */

  const relationshipStart = new Date('2025-10-17T11:15:00');
  const firstDateStart = new Date('2025-08-30T05:52:00');

  // NEW: Birthdays
  const thaliaBirthday = { month: 3, day: 25 }; // 25/03
  const yamirBirthday = { month: 8, day: 15 }; // 15/08

  // Memories map data
  const memories = [
    {
      position: [-9.401659, -77.571566] as [number, number],
      title: 'Entre Cordilleras',
      date: '8 de Diciembre, 2025',
      description: 'La magia de lo extraordinario juntos',
      photos: [
        '/1000142011.jpg',
        '/1000142044.jpg',
        '/1000142083.jpg',
        '/1000142089.jpg',
        '/1000142107.jpg',
        '/1000142116.jpg',
        '/1000142377.jpg',
      ]
    },
    {
      position: [-9.530008, -77.529042] as [number, number],
      title: 'Huaraz',
      date: '7-9 de Diciembre, 2025',
      description: 'Nuevos recuerdos en un lugar mágico',
      photos: [
        '/1000141688.jpg',
        '/1000142134.jpg',
        '/1000142152.jpg',
        '/1000142188.jpg',
        '/1000142202.jpg',
        '/1000142277.jpg',
        '/1000142346.jpg',
      ]
    },
    {
      position: [-9.138954, -78.182943] as [number, number],
      title: 'Moro',
      date: '17 de Octubre, 2025',
      description: 'El día de un nuevo comienzo, donde todo se hizo oficial',
      photos: [
        '/IMG-20251020-WA0043.jpg',
        '/IMG-20251020-WA0048.jpg',
        '/IMG-20251020-WA0047.jpg',
        '/IMG-20251020-WA0046.jpg',
        '/IMG-20251020-WA0045.jpg',
        '/IMG-20251020-WA0044.jpg',
        '/IMG-20251020-WA0042.jpg',
      ]
    },
    {
      position: [-9.149004, -78.279272] as [number, number],
      title: 'San Jacinto',
      date: '18 de Octubre, 2025',
      description: 'Otra parte de nuestra aventura inolvidable',
      photos: [
        '/IMG-20251020-WA0038.jpg',
        '/IMG-20251020-WA0027.jpg',
        '/IMG-20251020-WA0026.jpg',
        '/IMG-20251020-WA0040.jpg',
        '/IMG-20251020-WA0041.jpg',
      ]
    },
    {
      position: [-9.078359, -78.590135] as [number, number],
      title: 'Chimbote',
      date: '30 Ago 2025 • 19-20 Oct 2025',
      description: 'Donde todo empezó y donde seguimos construyendo',
      photos: [
        '/IMG-20250905-WA0002.jpg',
        '/IMG-20250905-WA0005.jpg',
        '/IMG-20250905-WA0012.jpg',
        '/IMG-20251020-WA0019.jpg',
        '/IMG-20251020-WA0020.jpg',
        '/IMG-20251020-WA0022.jpg',
        '/IMG-20251020-WA0023.jpg',
        '/IMG-20251020-WA0024.jpg',
        '/IMG-20251020-WA0025.jpg',
        '/IMG-20251108-WA0007.jpg',
      ]
    },
  ];

  // NEW: State for gallery modal
  const [selectedMemory, setSelectedMemory] = useState(null);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Autoplay music with fallback
  /* useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.45;
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, []); */

  // Live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = reunionDate.getTime() - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate loading
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  // Persist dreams and learned
  useEffect(() => {
    localStorage.setItem('dreams', JSON.stringify(dreams));
  }, [dreams]);

  useEffect(() => {
    localStorage.setItem('learned', JSON.stringify(learned));
  }, [learned]);

  // Check for special days
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Birthdays
    const isThaliaBD = month === thaliaBirthday.month && day === thaliaBirthday.day;
    const isYamirBD = month === yamirBirthday.month && day === yamirBirthday.day;

    // Anniversary (monthly from relationship start)
    const relMonth = relationshipStart.getMonth() + 1;
    const relDay = relationshipStart.getDate();
    const isAnniversary = month === relMonth && day === relDay;

    setIsSpecialDay(isThaliaBD || isYamirBD || isAnniversary);
  }, []);

  /* const toggleMusic = () => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  }; */

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addDream = (e) => {
    e.preventDefault();
    if (newDream.trim()) {
      setDreams([...dreams, newDream]);
      setNewDream('');
    }
  };

  const addLearned = (e) => {
    e.preventDefault();
    if (newLearned.trim()) {
      setLearned([...learned, newLearned]);
      setNewLearned('');
    }
  };

  const calculateTime = (startDate: Date, currentDate: Date) => {
    const diff = currentDate.getTime() - startDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const relationshipTime = calculateTime(relationshipStart, time);
  const firstDateTime = calculateTime(firstDateStart, time);

  // Memoized map to prevent re-renders
  const memoriesMap = useMemo(() => (
    <MapContainer
      center={[-9.2533, -78.0894]}
      zoom={10}
      style={{ height: '500px', width: '100%' }}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {memories.map((mem, i) => (
        <Marker key={i} position={mem.position}>
          <Popup maxWidth={350} className="custom-popup">
            <div className="text-center">
              <h4 className="font-bold text-lg text-rose-700 mb-1">{mem.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{mem.date}</p>
              <p className="text-gray-700 italic mb-4">{mem.description}</p>

              {/* Vista previa de fotos en popup (solo las primeras 3) */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {mem.photos.slice(0, 3).map((photo, idx) => (
                  <div key={idx} className="relative group cursor-pointer">
                    <img
                      src={photo}
                      alt={`${mem.title} preview ${idx + 1}`}
                      className="w-full h-20 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón para abrir galería completa */}
              {mem.photos.length > 3 && (
                <button
                  onClick={() => setSelectedMemory(mem)}
                  className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Ver Galería Completa ({mem.photos.length} fotos)
                </button>
              )}

              {mem.photos.length === 0 && (
                <p className="text-gray-500 text-sm italic">Pronto más recuerdos aquí</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  ), []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-red-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Heart className="w-16 h-16 text-rose-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Nuestro Love Counter - Shirley ❤️ Yamir</title>

        {/* FAVICON */}
        <link rel="icon" type="image/png" href="/COUNTER-LOVE.png" />
        <link rel="icon" type="image/x-icon" href="/COUNTER-LOVE.ico" />

        {/* OG IMAGE */}
        <meta property="og:image" content="/COUNTER-LOVE.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* FACEBOOK + WHATSAPP */}
        <meta property="og:title" content="Nuestro Love Counter" />
        <meta property="og:description" content="Nuestro amor contado desde el primer segundo ❤️" />

        {/* TWITTER */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/COUNTER-LOVE.png" />
      </Helmet>

      {/* <audio ref={audioRef} src="/novios.mpeg" loop preload="auto" /> */}

      {/* <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
        <button
          onClick={toggleMusic}
          className={`
            relative w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center
            transition-all duration-300 hover:scale-110 border-4 border-white/60
            ${isPlaying ? 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse' : 'bg-white/95 backdrop-blur-md'}
          `}
          title={isPlaying ? "Pausar" : "Reproducir"}
          aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
        >
          <Music className={`w-8 h-8 md:w-9 md:h-9 ${isPlaying ? 'text-white' : 'text-rose-600'}`} />
          {isPlaying && (
            <>
              <span className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full"></span>
            </>
          )}
        </button>
      </div> */}

      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center"
          aria-label="Alternar modo oscuro"
        >
          {darkMode ? '🌞' : '🌙'}
        </button>
      </div>

      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white' : 'bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 text-rose-900'} relative overflow-hidden ${isSpecialDay ? 'animate-special-bg' : ''}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 md:w-80 md:h-80 bg-pink-300 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-32 right-10 w-64 h-64 md:w-80 md:h-80 bg-rose-300 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/3 w-64 h-64 md:w-80 md:h-80 bg-red-300 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Heart className="w-10 h-10 md:w-12 md:h-12 text-rose-500 fill-rose-500 animate-pulse" />
              <Heart className="w-14 h-14 md:w-16 md:h-16 text-red-500 fill-red-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <Heart className="w-10 h-10 md:w-12 md:h-12 text-rose-500 fill-rose-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 leading-tight">
              Nuestra Historia de Amor
            </h1>
            <p className="text-lg md:text-xl">Contando cada momento juntos</p>
            {isSpecialDay && <p className="text-2xl text-yellow-500 mt-4 animate-bounce">¡Feliz día especial! 🎉</p>}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
            <motion.div
              className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-amber-200 relative overflow-hidden cursor-pointer group"
              onMouseEnter={() => setShowFirstDateImage(true)}
              onMouseLeave={() => setShowFirstDateImage(false)}
              onClick={() => setShowFirstDateImage(!showFirstDateImage)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-full">
                  <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-center text-amber-900 mb-2">PRIMERA VEZ PARA TODO</h2>
              <p className="text-center text-amber-600 text-sm md:text-base mb-6">30 de Agosto, 2025</p>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                {['Días', 'Horas', 'Minutos', 'Segundos'].map((label, i) => {
                  const value = [firstDateTime.days, firstDateTime.hours, firstDateTime.minutes, firstDateTime.seconds][i];
                  return (
                    <div key={label} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 md:p-4 text-center">
                      <div className="text-3xl md:text-4xl font-bold text-amber-600">{value}</div>
                      <div className="text-xs md:text-sm text-amber-500 font-medium">{label}</div>
                    </div>
                  );
                })}
              </div>

              <motion.div
                className={`space-y-3 text-sm md:text-base`}
                animate={{ opacity: showFirstDateImage ? 0 : 1 }}
                transition={{ duration: 0.5 }}
              >
                {["Primera vez que nos tomamos de la mano", "Primer abrazo", "Primer beso", "La magia de conocernos"].map((text, i) => (
                  <div key={i} className="flex items-start space-x-3 bg-amber-50 p-3 rounded-lg">
                    <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-700 font-medium">{text}</p>
                  </div>
                ))}
              </motion.div>

              {showFirstDateImage && (
                <motion.img
                  src="/IMG-20250831-WA0009.jpg"
                  alt="Primera cita"
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.div>

            <motion.div
              className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-rose-200 relative overflow-hidden cursor-pointer group"
              onMouseEnter={() => setShowRelationshipImage(true)}
              onMouseLeave={() => setShowRelationshipImage(false)}
              onClick={() => setShowRelationshipImage(!showRelationshipImage)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-rose-500 to-red-500 p-4 rounded-full">
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-center text-rose-900 mb-2">AL FIN NOVIOS</h2>
              <p className="text-center text-rose-600 text-sm md:text-base mb-6">17 de Octubre, 2025</p>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                {['Días', 'Horas', 'Minutos', 'Segundos'].map((label, i) => {
                  const value = [relationshipTime.days, relationshipTime.hours, relationshipTime.minutes, relationshipTime.seconds][i];
                  return (
                    <div key={label} className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 md:p-4 text-center">
                      <div className="text-3xl md:text-4xl font-bold text-rose-600">{value}</div>
                      <div className="text-xs md:text-sm text-rose-500 font-medium">{label}</div>
                    </div>
                  );
                })}
              </div>

              <motion.div
                className={`space-y-3 text-sm md:text-base`}
                animate={{ opacity: showRelationshipImage ? 0 : 1 }}
                transition={{ duration: 0.5 }}
              >
                {["Propuesta de novios", "Compartir nuestra vida entera", "Desde ese día somos 4", "El mejor día de mi vida"].map((text, i) => (
                  <div key={i} className="flex items-start space-x-3 bg-rose-50 p-3 rounded-lg">
                    <Heart className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <p className="text-rose-700 font-medium">{text}</p>
                  </div>
                ))}
              </motion.div>

              {showRelationshipImage && (
                <motion.img
                  src="/IMG-20251020-WA0019.jpg"
                  alt="Noviazgo"
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.div>
          </div>

          {/* <motion.div
            className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-red-300 relative overflow-hidden cursor-pointer"
            onMouseEnter={() => setShowOneMonthImage(true)}
            onMouseLeave={() => setShowOneMonthImage(false)}
            onClick={() => setShowOneMonthImage(!showOneMonthImage)}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-red-900 text-center mb-6">Primer Mes</h3>
            <motion.div
              className={`text-red-800 text-base md:text-lg leading-relaxed space-y-4`}
              animate={{ opacity: showOneMonthImage ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <p>¡Feliz primer mes, mi amorcito, mi BEYBE, mi todo! 🥰</p>

              <p>Hace exactamente un mes, que con el corazón queriendo salirse de mi pecho, te dije todo lo que sentía, y te pedí ser formalmente MI NOVIA… No sabes lo significativo que fue para mí ese momento en el que abrimos nuestro corazón y expresamos nuestros sentimientos más profundos ❤️ el estar allí el uno con el otro en un momento tan íntimo con el corazón en la mano 🥺</p>

              <p>Apenas es un mes nada más… y a la vez ya pareciera que es toda una vida. Porque en tan poco tiempo, nuestra conexión ha sido tan grande y ha fortalecido todos los lazos que nos unían desde antes de conocernos... Hemos reído, hemos planeado un futuro juntos, hemos cuidado el uno del otro como si lleváramos años haciéndolo, y hemos construido algo tan bonito que ya no imagino mi mundo sin ti.</p>

              <p>Gracias por elegirme todos los días. Gracias por ser mi paz, mi alegría, mi felicidad, mi lugar seguro, mi hogar 🤗. Gracias por hacerme sentir que por fin todo en mi vida tiene sentido cuando estoy contigo. Agradezco a Dios y a la vida por darme a una mujer tan maravillosa como tú 😍</p>

              <p>Te quiero con todo mi corazón, con todo mi ser... No me imagino sin ti ni un solo segundo, quiero todo, toda mi vida contigo... Darte todo, todo de mí, todo lo que soy y todo lo que seré, quiero que sea contigo a mi lado 🥺❤️.</p>

              <p className="font-bold text-xl">Tuyo hoy, tuyo mañana, tuyo todas las vidas que vengan, TUYO SIEMPRE ❤️🥰</p>
              <p className="font-bold text-xl text-center mt-6">TUYO SIEMPRE</p>
            </motion.div>
            {showOneMonthImage && (
              <motion.img
                src="/IMG_20250830_172046.jpg"
                alt="Primer mes"
                className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div> */}

          <motion.div
            className="mt-10 bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-purple-300 relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-full animate-pulse">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-center text-purple-900 mb-2">
              LO QUE RESTA PARA VERTE
            </h3>
            <p className="text-center text-purple-600 text-sm md:text-base mb-6 font-medium">
              2 de enero de 2026
            </p>

            <div className="grid grid-cols-2 gap-4">
              {(['Días', 'Horas', 'Minutos', 'Segundos'] as const).map((label, i) => {
                const value = [countdown.days, countdown.hours, countdown.minutes, countdown.seconds][i];
                return (
                  <div key={label} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center border-2 border-purple-200">
                    <div className="text-4xl md:text-5xl font-bold text-purple-700">{value}</div>
                    <div className="text-sm md:text-base text-purple-600 font-semibold">{label}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-purple-800 font-bold text-lg md:text-xl italic">
                "Cada día falta menos para abrazarte a mi pecho"
              </p>
              <div className="flex justify-center mt-5 space-x-4">
                <Heart className="w-10 h-10 text-purple-500 fill-purple-500 animate-pulse" />
                <Heart className="w-12 h-12 text-pink-500 fill-pink-500 animate-pulse animation-delay-200" />
                <Heart className="w-10 h-10 text-purple-500 fill-purple-500 animate-pulse animation-delay-400" />
              </div>
            </div>
          </motion.div>

          {/* Mapa de Recuerdos */}
          <motion.div
            className="mt-10 bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-green-300 overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-center text-green-900 mb-6">
              Mapa de Nuestros Recuerdos
            </h3>

            <div className="rounded-2xl overflow-hidden shadow-lg">
              {memoriesMap}
            </div>
          </motion.div>

          <div className="mt-12 text-center">
            <p className="text-xl md:text-2xl font-semibold">"Cada segundo a tu lado es un regalo"</p>
            <div className="mt-4 flex justify-center flex-wrap gap-2">
              {[...Array(12)].map((_, i) => (
                <Heart key={i} className="w-6 h-6 text-red-400 fill-red-400 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Modal para Galería Completa */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Cerrar galería"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-center text-rose-900 mb-6">
              Galería de {selectedMemory.title}
            </h3>
            <p className="text-center text-gray-600 mb-4">{selectedMemory.date}</p>
            <p className="text-center text-gray-700 italic mb-8">{selectedMemory.description}</p>

            {/* Grid de galería completa */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedMemory.photos.map((photo, idx) => (
                <div key={idx} className="relative group cursor-pointer">
                  <img
                    src={photo}
                    alt={`${selectedMemory.title} ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default App;
