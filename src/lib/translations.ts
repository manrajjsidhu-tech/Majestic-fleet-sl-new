export type Language = "en" | "es" | "ca";

export interface SightTranslation {
  name: string;
  description: string;
}

export interface VehicleTranslation {
  name: string;
  description: string;
  powerSource: string;
  amenities: string[];
}

export interface TestimonialTranslation {
  quote: string;
  author: string;
  title: string;
}

export const SIGHTS_TRANSLATIONS: Record<Language, Record<string, SightTranslation>> = {
  en: {
    "el-prat": {
      name: "Barcelona-El Prat Airport",
      description: "Terminal 1 & 2 private pickup gate, VIP arrivals salon access."
    },
    "passeig-de-gracia": {
      name: "Passeig de Gràcia (Atelier Zone)",
      description: "Ultra-luxury retail district, Gaudi icons and gourmet fine-dining."
    },
    "sagrada-familia": {
      name: "La Sagrada Família Basilica",
      description: "Antoni Gaudí's majestic stone masterpiece."
    },
    "gothic-quarter": {
      name: "Gothic Quarter (Barri Gòtic)",
      description: "Atmospheric cobblestone alleys and medieval design."
    },
    "montserrat": {
      name: "Montserrat Royal Monastery",
      description: "Dramatic multi-peaked mountain abbey."
    },
    "sitges": {
      name: "Sitges Coastal Sanctuary",
      description: "Discreet Mediterranean seaside resort."
    },
    "camp-nou": {
      name: "FC Barcelona Camp Nou",
      description: "Iconic football cathedral and premium boxes."
    },
    "girona": {
      name: "Girona Cathedral & Old Town",
      description: "Charming medieval lanes and fortress ramparts."
    },
    "penedes": {
      name: "Penedès Organic Vineyard Atelier",
      description: "Private family organic winery and custom tastings."
    },
    "costa-brava": {
      name: "Begur, Costa Brava Shores",
      description: "Turquoise clifftops and pristine Catalan bays."
    }
  },
  es: {
    "el-prat": {
      name: "Aeropuerto de Barcelona-El Prat",
      description: "Puerta de recogida privada en Terminal 1 y 2, acceso al salón VIP de llegadas."
    },
    "passeig-de-gracia": {
      name: "Paseo de Gracia (Zona Atelier)",
      description: "Distrito comercial de ultra lujo, iconos de Gaudí y alta cocina gourmet."
    },
    "sagrada-familia": {
      name: "Basílica de la Sagrada Familia",
      description: "La obra maestra de piedra de Antoni Gaudí."
    },
    "gothic-quarter": {
      name: "Barrio Gótico",
      description: "Callejones medievales de piedra y atmósfera histórica."
    },
    "montserrat": {
      name: "Monasterio Real de Montserrat",
      description: "Abadía de montaña de picos espectaculares y coro de niños Escolania."
    },
    "sitges": {
      name: "Santuario Costero de Sitges",
      description: "Idílica localidad costera con playas discretas y calas de arena."
    },
    "camp-nou": {
      name: "FC Barcelona Camp Nou",
      description: "Estadio emblemático del FC Barcelona y palcos VIP de diseño."
    },
    "girona": {
      name: "Catedral y Casco Antiguo de Girona",
      description: "Calles empedradas de origen medieval y murallas fortificadas."
    },
    "penedes": {
      name: "Bodega de Vinos Orgánicos del Penedès",
      description: "Viñedo familiar privado de cava ecológico y catas de autor."
    },
    "costa-brava": {
      name: "Begur, Playas de la Costa Brava",
      description: "Aguas cristalinas turquesas y calas vírgenes rodeadas de pinos."
    }
  },
  ca: {
    "el-prat": {
      name: "Aeroport de Barcelona-El Prat",
      description: "Porta de recollida privada de la Terminal 1 i 2, accés al saló privat VIP d'arribades."
    },
    "passeig-de-gracia": {
      name: "Passeig de Gràcia (Zona Atelier)",
      description: "Districte comercial d'ultraluxe, icones de Gaudí i alta cuina gourmet."
    },
    "sagrada-familia": {
      name: "La Sagrada Família Basílica",
      description: "La catedral inacabada d'Antoni Gaudí o majestuós monument de pedra."
    },
    "gothic-quarter": {
      name: "Barri Gòtic",
      description: "Encantadors laberints històrics i arquitectura medieval d'ambient singular."
    },
    "montserrat": {
      name: "Monestir Reial de Montserrat",
      description: "Agulles imponents de muntanya, abadia sagrada i l'Escolania de nois."
    },
    "sitges": {
      name: "Santuari Costaner de Sitges",
      description: "Idíl·lica població costanera amb cales de sorra i platges discretes."
    },
    "camp-nou": {
      name: "FC Barcelona Camp Nou",
      description: "Històric estadi del FC Barcelona i llotges presidencials premium."
    },
    "girona": {
      name: "Catedral i Barri Vell de Girona",
      description: "Carrers medievals de pedra, muralles fortificades i patrimoni històric."
    },
    "penedes": {
      name: "Atelier de Vinyes Orgàniques del Penedès",
      description: "Finca de vins ecològics privats, tastos personalitzats i vistes panoràmiques."
    },
    "costa-brava": {
      name: "Begur, Costa Brava",
      description: "Aigües turqueses transparents, penya-segats ombrejats per pins i cales salvatges."
    }
  }
};

export const VEHICLES_TRANSLATIONS: Record<Language, Record<string, VehicleTranslation>> = {
  en: {
    "tesla-model-3": {
      name: "Tesla Model 3",
      description: "100% Electric. Panoramic glass roof. Zero emissions.",
      powerSource: "Electric (BEV)",
      amenities: ["100% Electric", "Panoramic glass roof", "Zero emissions"]
    },
    "mercedes-e300e": {
      name: "Mercedes-Benz E300e",
      description: "Plug-in Hybrid. Classic corporate luxury. Silent urban driving.",
      powerSource: "Plug-in Hybrid (PHEV)",
      amenities: ["Plug-in Hybrid", "Classic corporate luxury", "Silent urban driving"]
    },
    "mercedes-v-class": {
      name: "Mercedes-Benz V-Class",
      description: "Face-to-face conference seating. Rear climate control. Maximum luggage capacity.",
      powerSource: "Diesel",
      amenities: ["Face-to-face conference seating", "Rear climate control", "Maximum luggage capacity"]
    },
    "taxi-1-4-pax": {
      name: "Taxi 1-4 pax",
      description: "Toyotas Prius Plus , corolla sedan / familiar",
      powerSource: "Hybrid (HEV)",
      amenities: ["Taxi 1-4 Passengers", "Toyotas Prius Plus / Corolla", "Air Conditioning", "Standard Luggage Space"]
    },
    "taxi-vans-4-8-pax": {
      name: "Taxi Vans 4-8 pax",
      description: "Mercedes Vito/V class ,ford custom",
      powerSource: "Diesel / Hybrid",
      amenities: ["Taxi Vans 4-8 Passengers", "Mercedes Vito/V class / Ford Custom", "Large Luggage Capacity", "Air Conditioning"]
    }
  },
  es: {
    "tesla-model-3": {
      name: "Tesla Model 3",
      description: "100% Eléctrico. Techo solar de cristal. Cero emisiones.",
      powerSource: "Eléctrico (BEV)",
      amenities: ["100% Eléctrico", "Techo solar de cristal", "Cero emisiones"]
    },
    "mercedes-e300e": {
      name: "Mercedes-Benz E300e",
      description: "Híbrido Enchufable. Lujo corporativo clásico. Conducción urbana silenciosa.",
      powerSource: "Híbrido Enchufable (PHEV)",
      amenities: ["Híbrido Enchufable", "Lujo corporativo clásico", "Conducción urbana silenciosa"]
    },
    "mercedes-v-class": {
      name: "Mercedes-Benz Clase V",
      description: "Asientos en formato conferencia cara a cara. Climatización trasera. Máxima capacidad de equipaje.",
      powerSource: "Diésel",
      amenities: ["Asientos en conferencia", "Climatizador trasero", "Máxima capacidad de equipaje"]
    },
    "taxi-1-4-pax": {
      name: "Taxi 1-4 pax",
      description: "Toyotas Prius Plus , corolla sedan / familiar",
      powerSource: "Híbrido (HEV)",
      amenities: ["Taxi 1-4 Pasajeros", "Toyotas Prius Plus / Corolla", "Aire Acondicionado", "Capacidad Equipaje Estándar"]
    },
    "taxi-vans-4-8-pax": {
      name: "Taxi Vans 4-8 pax",
      description: "Mercedes Vito/V class ,ford custom",
      powerSource: "Diésel / Híbrido",
      amenities: ["Taxi Vans 4-8 Pasajeros", "Mercedes Vito/Clase V / Ford Custom", "Gran Capacidad de Equipaje", "Aire Acondicionado"]
    }
  },
  ca: {
    "tesla-model-3": {
      name: "Tesla Model 3",
      description: "100% Elèctric. Sostre solar de vidre. Zero emissions.",
      powerSource: "Elèctric (BEV)",
      amenities: ["100% Elèctric", "Sostre solar de vidre", "Zero emissions"]
    },
    "mercedes-e300e": {
      name: "Mercedes-Benz E300e",
      description: "Híbrid Endollable. Luxe corporatiu clàssic. Conducció urbana silenciosa.",
      powerSource: "Híbrid Endollable (PHEV)",
      amenities: ["Híbrid Endollable", "Luxe corporatiu clàssic", "Conducció urbana silenciosa"]
    },
    "mercedes-v-class": {
      name: "Mercedes-Benz Classe V",
      description: "Seients en format conferència cara a cara. Climatització posterior. Màxima capacitat d'equipatge.",
      powerSource: "Dièsel",
      amenities: ["Seients en conferència", "Climatització posterior", "Màxima capacitat d'equipatge"]
    },
    "taxi-1-4-pax": {
      name: "Taxi 1-4 pax",
      description: "Toyotas Prius Plus , corolla sedan / familiar",
      powerSource: "Híbrid (HEV)",
      amenities: ["Taxi 1-4 Passatgers", "Toyotas Prius Plus / Corolla", "Aire Condicionat", "Capacitat Equipatge Estàndard"]
    },
    "taxi-vans-4-8-pax": {
      name: "Taxi Vans 4-8 pax",
      description: "Mercedes Vito/V class ,ford custom",
      powerSource: "Dièsel / Híbrid",
      amenities: ["Taxi Vans 4-8 Passatgers", "Mercedes Vito/V class / Ford Custom", "Gran Capacitat d'Equipatge", "Aire Condicionat"]
    }
  }
};

export const TESTIMONIALS_TRANSLATIONS: Record<Language, TestimonialTranslation[]> = {
  en: [
    {
      quote: "The severe silent cabin option with Majestic Fleet Sl allowed me to prepare for my keynote at the Mobile World Congress in absolute isolation. Incredible luxury standards.",
      author: "MARCUS COHEN",
      title: "Global Logistics and Trade President"
    },
    {
      quote: "A sublime afternoon route through the rolling vineyards of Penedès. Our chauffeur handled our organic cava cases with absolute ease and knew the best scenic lookouts.",
      author: "ELENA ROVIRA",
      title: "Catalonian Cellar Critic & Journalist"
    },
    {
      quote: "Discreet and elite. Majestic Fleet Sl has completely re-modeled executive transport standards in Barcelona. I will use no other service during my coastal trips.",
      author: "DR. PIERRE DUVAL",
      title: "Private Healthcare Founder"
    }
  ],
  es: [
    {
      quote: "La opción de cabina totalmente silenciosa de Majestic Fleet Sl me permitió preparar mi conferencia para el Mobile World Congress en absoluto aislamiento. Un estándar de lujo insuperable.",
      author: "MARCUS COHEN",
      title: "Presidente de Logística y Comercio Global"
    },
    {
      quote: "Una ruta de tarde sublime por los viñedos del Penedès. Nuestro chófer manejó las cajas de cava ecológico con total delicadeza y conocía los mejores miradores panorámicos.",
      author: "ELENA ROVIRA",
      title: "Crítica de Bodegas Catalanas y Periodista"
    },
    {
      quote: "Discreto y de élite. Majestic Fleet Sl ha remodelado por completo los estándares del transporte ejecutivo en Barcelona. No usaré otro servicio en mis visitas a la costa.",
      author: "DR. PIERRE DUVAL",
      title: "Fundador de Sanidad Privada"
    }
  ],
  ca: [
    {
      quote: "L'opció de cabina totalment silenciosa de Majestic Fleet Sl em va permetre preparar la meva conferència al Mobile World Congress amb un aïllament mitjà i total absolut. Estàndards de luxe increïbles.",
      author: "MARCUS COHEN",
      title: "President de Logística i Comerç Global"
    },
    {
      quote: "Una ruta de tarda sublim per les ondulades vinyes de la comarca del Penedès. El nostre xofer va desplaçar el nostre vi/cava amb facilitat i coneixia els miradors de millor vista.",
      author: "ELENA ROVIRA",
      title: "Crítica de Cellers Catalans i Periodista"
    },
    {
      quote: "Discret i elitista. Majestic Fleet Sl ha remodelat completament els estàndards del transport executiu a Barcelona. No utilitzaré cap altre servei en els meus desplaçaments pel litoral.",
      author: "DR. PIERRE DUVAL",
      title: "Fundador de Sanitat Privada"
    }
  ]
};

export const UI_TRANSLATIONS = {
  en: {
    // Navigation bar
    brandSlogan: "SILENT BARCELONA CONCIERGE",
    reserveJourney: "Reserve Journey",
    theCollection: "The Collection",
    myBookings: "My Bookings",
    established: "EST. 2024 BARCELONA",

    // Hero title & text
    arriveQuietTitle: "Arrive with",
    quietDistinction: "Quiet Distinction",
    heroSubtitle: "Enjoy absolute Mediterranean tranquility. Travel comfortably to Montserrat Monasteries, Costa Brava beachsides, or anywhere in Catalunya with our pristine secure chauffeur services.",
    classAChauffeurs: "Class A Chauffeurs Only",
    carbonNeutral: "Zero Carbon Fleet Option",

    // Tab Header
    planCustomJourney: "Plan Your Custom Catalan Journey",
    dashboardHeader: "Active Reservations Dashboard",
    fleetHeader: "The Showroom Fleet Collection",

    // Interactive Itinerary Form
    pickupLabel: "Pickup Station",
    destinationLabel: "Destination Station",
    addStopLabel: "Add Waypoint Stop",
    dateLabel: "Departure Date",
    timeLabel: "Departure Time",
    specialRemarksLabel: "Special Remarks (Optional)",
    flightNumberLabel: "Flight Number (Optional)",
    flightPlaceholder: "e.g., LH1810, VY2004",
    placeholderRemarks: "Specify flight numbers, meet & greet details, language preferences, or child ages...",
    contactDetailsTitle: "Contact Details",
    contactName: "Contact Full Name",
    contactEmail: "Email Address",
    contactPhone: "Mobile Phone Number",
    placeReservation: "Place Secured Reservation",
    provisionalBanner: "PROVISIONAL ROUTE PROFILE TRAFFIC ADJUSTMENTS:",
    estDistance: "EST. DISTANCE",
    estDuration: "EST. DURATION",
    rateType: "COMPREHENSIVE RATE INCLUDED",
    rateDesc: "with complete Class A chauffeured isolation and water setup.",
    childSeatRatePrefix: "Includes €",
    childSeatRateSuffix: " for child safety seats (€6.00 per selected group seat)",
    submitting: "Submitting...",
    
    // AI Concierge
    aiGreetings: "Greetings, passenger. I am your Majestic Fleet Sl Concierge. Allow me to design a custom excursion across Catalonia's historic estates as we journey. \n\nAre you interested in organic wine tastings, sacred Montserrat hikes, or Catalan Michelin dining?",
    aiConciergeTitle: "Majestic AI Concierge",
    aiConciergeSlogan: "Chauffeur Companion",
    aiResetBtn: "Reset Dialogue",
    aiSendPlaceholder: "Ask Concierge (e.g. 'Recommend coffee spots in Girona')...",
    aiStartersHeader: "luxury exploration starters:",
    aiAddStopBtn: "+ Add Stop",
    aiAddedStop: "Stop added directly to route",
    aiErrorMsg: "Forgive me, passenger. A momentary communication blur occurred. Please attempt your query once more. We remain at your service.",

    // Fleet selector view
    fleetSubTitle: "Vehicles of Rare Distinction",
    fleetDescription: "Every vehicle is kept to pristine showroom standards, featuring mineral-water setups, active safety, and pure silent performance.",
    silentCharge: "SILENT CHARGE",
    premiumTag: "PREMIUM",
    taxiTag: "TAXI",
    swapRoute: "SWAP ROUTE",
    setOrigin: "Set as Origin",
    setDestination: "Set as Destination",
    addAsStop: "Add as Stop",
    moveUp: "Move Up",
    moveDown: "Move Down",
    removeStop: "Remove Stop",
    activeSelection: "ACTIVE SELECTION",
    passengersLabel: "Passengers",
    luggageLabel: "Luggage",
    cabinEquipment: "Cabin Equipment:",
    selectedVehicle: "Selected Showroom Vehicle",
    selectVehicle: "Select Executive Vehicle",

    // Dashboard View
    noBookings: "No Active Reservations Found",
    welcomeDesc: "Welcome to your personal private transportation dashboard. Design a scenic itinerary or check vehicle details to get started.",
    activeReservationHeading: "Luxury Reservations",
    verifiedStatus: "Confirmed by Atelier",
    cancelledStatus: "Cancelled",
    detailsBtn: "Details & Itinerary",
    rescheduleBtn: "Reschedule",
    cancelBtn: "Cancel",
    saveNewScheduleBtn: "Apply Schedule",
    rateRide: "Rate Your Ride",
    feedbackTitle: "Post-Trip Luxury Assessment",
    feedbackText: "We offer our highest appreciation for rating your recent Majestic Fleet Sl transfers. Your scores have been direct-transmitted to our private Eixample Operations suite to ensure absolute operational perfection.",
    overallExperience: "Overall Experience",
    smoothnessAndComfort: "Smoothness & Comfort Rating",
    chauffeurRating: "Chauffeur Rating",
    submitAssessment: "Submit Executive Assessment",
    tempLabel: "Temp:",

    // Modal Details
    modalHeading: "Reservation Itinerary File",
    itineraryOverview: "ITINERARY OVERVIEW",
    vehicleSpecs: "VEHICLE SPECIFICATIONS",
    financialSummary: "FINANCIAL SUMMARY",
    clientSignature: "CLIENT AUTHORIZATION FILE",
    fromLabel: "From",
    toLabel: "To",
    stopsLabel: "Stops",
    dateLabelModal: "Date",
    timeLabelModal: "Time",
    remarksLabelModal: "Remarks",
    statusLabelModal: "Status",
    seatLabelSingular: "seat",
    seatLabelPlural: "seats",
    selectedText: "Selected",

    // Amenities controller
    customCabinComfort: "Custom Cabin Comfort",
    cabinAmenitiesDescription: "Configure your private environmental factors, amenities, and child protective gear below.",
    silentCabin: "SEVERE SILENT CABIN",
    silentCabinDesc: "Active acoustic suppression shields outer engine hums & highway noise",
    mineralWater: "COLD MINERAL WATER SETUP",
    mineralWaterDesc: "Chilled mineral glass flasks prepared inside console",
    finTimes: "FINANCIAL TIMES CORNER",
    finTimesDesc: "Printed copy of the morning world logistics briefing",
    privacyTint: "PRIVACY GLASS CONTROL",
    privacyTintDesc: "Electrochromic passenger window dark shading",
    targetCabinTemp: "TARGET CABIN TEMPERATURE:",
    sriSafetySytem: "SRI SAFETY SELECTION (CHILD SEAT)",
    sriDescription: "Custom child safety seats configured according to EU traffic directives",
    activeSeatsPrefix: "Selected (+€",
    sriRateNote: "Selected child safety seats (SRI) add an extra €6.00 per seat to your rate.",
    otherNotesCompliments: "Other concierge options are compliments of the Majestic Fleet Sl Atelier.",
    sriExclusionsTitle: "Excursions - SRI Exclusions (Legal Exemption)",
    sriExclusionsSubtitle: "According to the General Traffic Regulation of Spain (Article 117):",
    sriExclusionsList1: "Within urban perimeters and city limits, taxis and licensed private hire services (VTC) are exempt from carrying solid child safety seats for minors when they travel on rear benches, provided that the height does not exceed 135 cm.",
    sriExclusionsWarning: "No exclusions in Majestic Fleet Sl: We consider safety of minors to be paramount and do not make use of these legal exemptions. We equip clean, inspected child seats for free on urban request if selected.",

    wheelchairTitle: "MOBILITY ACCESSIBILITY",
    wheelchairDesc: "Foldable wheelchair space or customized physical transport ramps",
    wheelchairTypeLabel: "WHEELCHAIR TYPE:",
    wheelchairQuantityLabel: "CANTIDAD ACCOMMODATIONS:",
    wheelchairOptionFoldable: "Foldable manual wheelchair",
    wheelchairOptionMotorized: "Motorized power chair",
    wheelchairPlaceholderNone: "None / Not required",

    requestInvoiceLabel: "I require an official invoice",
    invoiceDocTypeLabel: "Official Document Type",
    invoiceDocNumberLabel: "Passport or Official ID Document Number",
    invoiceNameLabel: "Full Billing Name or Business corporate entity name",

    // Testimonial
    testimonialsHeader: "Atelier Testimonials",
    standardCategory: "Standard",
    minivanCategory: "Minivan",
    vansCategory: "Vans",
    taxiCategory: "Taxi",
  },
  es: {
    brandSlogan: "CONCIERGE DE SILENCIO EN BARCELONA",
    reserveJourney: "Reservar Viaje",
    theCollection: "La Colección",
    myBookings: "Mis Reservas",
    established: "EST. 2024 BARCELONA",
    standardCategory: "Estándar",
    minivanCategory: "Monovolumen",
    vansCategory: "Furgonetas",
    taxiCategory: "Taxi",

    arriveQuietTitle: "Arribar con",
    quietDistinction: "Silenciosa Distinción",
    heroSubtitle: "Disfrute de una tranquilidad mediterránea absoluta. Viaje cómodamente a los monasterios de Montserrat, costas de la Costa Brava o cualquier rincón de Cataluña con nuestros distinguidos servicios de chófer privado.",
    classAChauffeurs: "Solo Chóferes Clase A",
    carbonNeutral: "Opción de Flota Cero Carbono",

    planCustomJourney: "Planifique su Viaje por Cataluña",
    dashboardHeader: "Panel de Reservas Activas",
    fleetHeader: "Colección de Nuestra Flota",

    pickupLabel: "Punto de Recogida",
    destinationLabel: "Punto de Destino",
    addStopLabel: "Añadir Parada Intermedia",
    dateLabel: "Fecha de Salida",
    timeLabel: "Hora de Salida",
    specialRemarksLabel: "Observaciones Especiales (Opcional)",
    flightNumberLabel: "Número de Vuelo (Opcional)",
    flightPlaceholder: "ej., LH1810, VY2004",
    placeholderRemarks: "Especifique el número de vuelo, solicitudes de idiomas, edades de los niños o indicaciones de bienvenida...",
    contactDetailsTitle: "Datos de Contacto",
    contactName: "Nombre Completo de Contacto",
    contactEmail: "Correo Electrónico",
    contactPhone: "Número de Teléfono Móvil",
    placeReservation: "Efectuar Reserva Confirmada",
    provisionalBanner: "AJUSTES DE TRÁNSITO DE LA RUTA PROVISIONAL:",
    estDistance: "DISTANCIA EST.",
    estDuration: "DURACIÓN EST.",
    rateType: "SE INCLUYE LA TARIFA INTEGRAL",
    rateDesc: "con aislamiento de alta gama de chófer de Clase A y botellas de agua fría preparadas.",
    childSeatRatePrefix: "Incluye €",
    childSeatRateSuffix: " por los sistemas de seguridad infantil (SRI) (€6.00 por asiento seleccionado)",
    submitting: "Tramitando...",

    aiGreetings: "Bienvenido, pasajero. Soy su Concierge de Majestic Fleet Sl. Permítame diseñar una excursión a medida por Cataluña durante nuestro trayecto. \n\n¿Le interesa una cata de vinos orgánicos, caminatas guiadas por Montserrat o cenar en los mejores restaurantes Michelin?",
    aiConciergeTitle: "Majestic AI Concierge",
    aiConciergeSlogan: "Acompañante de Chófer",
    aiResetBtn: "Reiniciar Diálogo",
    aiSendPlaceholder: "Pregunte al Concierge (ej. 'Recomienda cafeterías en Girona')...",
    aiStartersHeader: "inicios de exploración de lujo disponibles:",
    aiAddStopBtn: "+ Añadir Parada",
    aiAddedStop: "Se ha añadido la parada directamente a la ruta",
    aiErrorMsg: "Disculpe, pasajero. Ha ocurrido una pequeña anomalía de comunicación. Por favor, vuelva a realizar su consulta. Estamos a su servicio.",

    fleetSubTitle: "Vehículos de Distinción Singular",
    fleetDescription: "Cada vehículo se mantiene con estándares de salón impecables, con agua mineral, seguridad activa y rendimiento puramente silencioso.",
    silentCharge: "CARGA SILENCIOSA",
    premiumTag: "PREMIUM",
    taxiTag: "TAXI",
    swapRoute: "INTERCAMBIAR RUTA",
    setOrigin: "Establecer como Origen",
    setDestination: "Establecer como Destino",
    addAsStop: "Añadir como Parada",
    moveUp: "Subir",
    moveDown: "Bajar",
    removeStop: "Eliminar Parada",
    activeSelection: "SELECCIÓN ACTIVA",
    passengersLabel: "Pasajeros",
    luggageLabel: "Equipaje",
    cabinEquipment: "Equipamiento de Cabina:",
    selectedVehicle: "Vehículo de Flota Seleccionado",
    selectVehicle: "Seleccionar Vehículo Ejecutivo",

    noBookings: "No se encontraron reservas activas",
    welcomeDesc: "Bienvenido a su panel de transporte privado personalizado. Diseñe una ruta panorámica o consulte los detalles de la flota para comenzar.",
    activeReservationHeading: "Reservas de Lujo",
    verifiedStatus: "Confirmado por el Atelier",
    cancelledStatus: "Anulado",
    detailsBtn: "Detalles e Itinerario",
    rescheduleBtn: "Cambiar Fecha",
    cancelBtn: "Anular",
    saveNewScheduleBtn: "Aplicar Nuevo Horario",
    rateRide: "Valorar el Viaje",
    feedbackTitle: "Valoración de Lujo Post-Viaje",
    feedbackText: "Le agradecemos enormemente que haya valorado su servicio reciente con Majestic Fleet Sl. Sus calificaciones han sido enviadas directamente al despacho de operaciones para garantizar la excelencia del servicio.",
    overallExperience: "Experiencia General",
    smoothnessAndComfort: "Suavidad y Confort",
    chauffeurRating: "Valoración del Chófer",
    submitAssessment: "Enviar Valoración Ejecutiva",
    tempLabel: "Temp:",

    modalHeading: "Archivo de Itinerario de Reserva",
    itineraryOverview: "RESUMEN DEL ITINERARIO",
    vehicleSpecs: "ESPECIFICACIONES DEL VEHÍCULO",
    financialSummary: "RESUMEN FINANCIERO",
    clientSignature: "AUTORIZACIÓN DE LA RESERVA DEL CLIENT",
    fromLabel: "De (Recogida)",
    toLabel: "A (Destino)",
    stopsLabel: "Paradas",
    dateLabelModal: "Fecha",
    timeLabelModal: "Hora",
    remarksLabelModal: "Observaciones",
    statusLabelModal: "Estado",
    seatLabelSingular: "asiento",
    seatLabelPlural: "asientos",
    selectedText: "Seleccionado",

    customCabinComfort: "Confort de Cabina Personalizado",
    cabinAmenitiesDescription: "Configure sus factores ambientales exclusivos de cabina y elementos de protección infantil a continuación.",
    silentCabin: "CABINA SILENCIOSA SEVERA",
    silentCabinDesc: "El aislamiento acústico activo reduce por completo el ruido del motor y de la autopista",
    mineralWater: "AGUA MINERAL FRÍA",
    mineralWaterDesc: "Botellas de vidrio con agua fría colocadas en la consola central",
    finTimes: "DIARIO FINANCIAL TIMES",
    finTimesDesc: "Copia impresa de las principales noticias económicas y logísticas mundiales",
    privacyTint: "CONTROL DE CRISTAL DE PRIVACIDAD",
    privacyTintDesc: "Cristales oscuros electrocrómicos tenues según su preferencia",
    targetCabinTemp: "TEMPERATURA DE CABINA SELECCIONADA:",
    sriSafetySytem: "SEGURIDAD INFANTIL (ASIENTOS SRI)",
    sriDescription: "Sistemas de seguridad infantil homologados según las directivas de la Unión Europea",
    activeSeatsPrefix: "Seleccionado (+€",
    sriRateNote: "Incorporar asientos homologados (SRI) añade un coste extraordinario de €6.00 por asiento.",
    otherNotesCompliments: "El resto de opciones de confort son cortesía del Atelier de Majestic Fleet Sl.",
    sriExclusionsTitle: "Asuntos de Tránsito - Exclusiones de SRI (Exención Legal)",
    sriExclusionsSubtitle: "De acuerdo con el Reglamento General de Circulación de España (Artículo 117):",
    sriExclusionsList1: "Bajo perímetros exclusivamente urbanos o núcleos de población, los taxis y los servicios privados (VTC) están legalmente exentos de incorporar sistemas de retención infantil si los niños viajan en los asientos traseros y su altura no supera los 135 cm.",
    sriExclusionsWarning: "Sin exclusiones en Majestic Fleet Sl: Para nosotros, la seguridad de los menores de edad es absolutamente sagrada y nunca hacemos uso de estas exenciones legales. Colocamos gratuitamente asientos SRI limpios y revisados en cualquier trayecto solicitado.",

    wheelchairTitle: "ACCESIBILIDAD DE MOVILIDAD",
    wheelchairDesc: "Espacio dedicado para silla de ruedas plegable o rampa de transporte a medida",
    wheelchairTypeLabel: "TIPO DE SILLA DE REUDAS:",
    wheelchairQuantityLabel: "CANTIDAD DE ADAPTACIONES:",
    wheelchairOptionFoldable: "Silla de ruedas manual plegable",
    wheelchairOptionMotorized: "Silla de ruedas motorizada",
    wheelchairPlaceholderNone: "Ninguna adaptación solicitada",

    requestInvoiceLabel: "Necesito factura oficial",
    invoiceDocTypeLabel: "Tipo de Documento Oficial",
    invoiceDocNumberLabel: "Número de Pasaporte o Documento de Identidad Oficial",
    invoiceNameLabel: "Nombre de Facturación o Nombre de la empresa",

    testimonialsHeader: "Testimonios del Atelier",
  },
  ca: {
    // Navigation bar
    brandSlogan: "CONCIERGE DE SILENCI A BARCELONA",
    reserveJourney: "Reservar Viatge",
    theCollection: "La Col·lecció",
    myBookings: "Les Meves Reserves",
    established: "EST. 2024 BARCELONA",
    standardCategory: "Standard",
    minivanCategory: "Minivan",
    vansCategory: "Vans",
    taxiCategory: "Taxi",

    // Hero title & text
    arriveQuietTitle: "Arribi amb",
    quietDistinction: "Quiet Distinció",
    heroSubtitle: "Gaudeixi d'una tranquil·litat mediterrània absoluta. Viatgi còmodament als monestirs de Montserrat, costes de la Costa Brava o qualsevol indret de Catalunya amb els nostres distingits serveis de xofer privat.",
    classAChauffeurs: "Només Xofers Clase A",
    carbonNeutral: "Opció de Flota Zero Carboni",

    // Tab Header
    planCustomJourney: "Planifiqui el seu desplaçament català",
    dashboardHeader: "Panell de Reserves Actives",
    fleetHeader: "La Col·lecció de la Nostra Flota",

    // Interactive Itinerary Form
    pickupLabel: "Estació de Recollida",
    destinationLabel: "Estació de Destí",
    addStopLabel: "Afegir Parada de Camí",
    dateLabel: "Data de Sortida",
    timeLabel: "Hora de Sortida",
    specialRemarksLabel: "Observacions Especiales (Opcional)",
    flightNumberLabel: "Número de Vol (Opcional)",
    flightPlaceholder: "ex., LH1810, VY2004",
    placeholderRemarks: "Especifiqui el número de vol, peticions d'idiomes, edats dels nens o indicacions de benvinguda...",
    contactDetailsTitle: "Dades de Contacte",
    contactName: "Nom Complet de Contacte",
    contactEmail: "Correu Electrònic",
    contactPhone: "Número de Telèfon Mòbil",
    placeReservation: "Efectuar Reserva Confirmada",
    provisionalBanner: "AJUSTOS DE TRÀNSIT DEL PERFIL DE RUTA PROVISIONAL:",
    estDistance: "DISTÀNCIA EST.",
    estDuration: "DURADA EST.",
    rateType: "S'INCLOU LA TARIFA INTEGRAL",
    rateDesc: "amb aïllament d'alta gamma de xofer de Classe A i ampolles d'aigua preparades.",
    childSeatRatePrefix: "Inclou €",
    childSeatRateSuffix: " pels sistemes de seguretat infantil (SRI) (€6.00 per seient seleccionat)",
    submitting: "Tramitant...",

    // AI Concierge
    aiGreetings: "Benvingut, passatger. Sóc el vostre Concierge de Majestic Fleet Sl. Permeteu-me dissenyar una excursió a mida per Catalunya durant el nostre viatge. \n\nUs interessa un tast de vins ecològics, caminades guiades per Montserrat o sopar als millors restaurants Michelin?",
    aiConciergeTitle: "Majestic AI Concierge",
    aiConciergeSlogan: "Acompanyant del Xofer",
    aiResetBtn: "Reiniciar Diàleg",
    aiSendPlaceholder: "Pregunteu al Concierge (exemple: 'Recomana cafeteries a Girona')...",
    aiStartersHeader: "inicis d'exploració de luxe disponibles:",
    aiAddStopBtn: "+ Afegir Parada",
    aiAddedStop: "S'ha afegit directament la parada a la ruta",
    aiErrorMsg: "Disculpeu, passatger. Ha passat una petita anomalia de comunicació. Si us plau, torneu a demanar la consulta. Estem al vostre servei.",

    // Fleet selector view
    fleetSubTitle: "Vehicles de Distinció Singular",
    fleetDescription: "Cada vehicle es manté amb estàndards de saló impecables, amb aigua mineral, seguretat activa i rendiment pur totalment silenciós.",
    silentCharge: "CÀRREGA SILENCIOSA",
    premiumTag: "PREMIUM",
    taxiTag: "TAXI",
    swapRoute: "INTERCANVIAR RUTA",
    setOrigin: "Establir com a Origen",
    setDestination: "Establir com a Destinació",
    addAsStop: "Afegir com a Parada",
    moveUp: "Pujar",
    moveDown: "Baixar",
    removeStop: "Eliminar Parada",
    activeSelection: "SELECCIÓ ACTIVA",
    passengersLabel: "Passatgers",
    luggageLabel: "Equipatge",
    cabinEquipment: "Equipament de la Cabina:",
    selectedVehicle: "Vehicle de Flota Seleccionat",
    selectVehicle: "Seleccionar Vehicle Executiu",

    // Dashboard View
    noBookings: "No s'han trobat reserves actives",
    welcomeDesc: "Benvingut al vostre panell de transport privat personalitzat. Planifiqueu una ruta panoràmica o consulteu els detalls de la flota per començar.",
    activeReservationHeading: "Reserves de Luxe",
    verifiedStatus: "Confirmat per l'Atelier",
    cancelledStatus: "Anul·lat",
    detailsBtn: "Detalls i Itinerari",
    rescheduleBtn: "Canviar Data",
    cancelBtn: "Anul·lar",
    saveNewScheduleBtn: "Aplicar Nou Horari",
    rateRide: "Avaluar el Viatge",
    feedbackTitle: "Valoració de Luxe Post-Viatge",
    feedbackText: "Us agraïm molt que hagueu valorat el vostre servei recent amb Majestic Fleet Sl. Les vostres notes s'han enviat directament al despatx privat d'operacions de l'Eixample per vetllar per la perfecció del servei.",
    overallExperience: "Experiència General",
    smoothnessAndComfort: "Suavitat i Confort",
    chauffeurRating: "Valoració del Xofer",
    submitAssessment: "Enviar Valoració Executiva",
    tempLabel: "Temp:",

    // Modal Details
    modalHeading: "Fitxer d'Itinerari de Reserva",
    itineraryOverview: "RESUM DE L'ITINERARI",
    vehicleSpecs: "ESPECIFICACIONS DEL VEHICLE",
    financialSummary: "RESUM FINANCER",
    clientSignature: "AUTORITZACIÓ DE LA RESERVA DEL CLIENT",
    fromLabel: "De (Recollida)",
    toLabel: "A (Destí)",
    stopsLabel: "Parades",
    dateLabelModal: "Data",
    timeLabelModal: "Hora",
    remarksLabelModal: "Observacions",
    statusLabelModal: "Estat",
    seatLabelSingular: "seient",
    seatLabelPlural: "seients",
    selectedText: "Seleccionat",

    // Amenities controller
    customCabinComfort: "Confort de Cabina Personalitzat",
    cabinAmenitiesDescription: "Configureu els vostres factors ambientals exclusius de cabina i elements de protecció per a nens.",
    silentCabin: "CABINA SILENCIOSA SEVERA",
    silentCabinDesc: "L'aïllament acústic actiu redueix completament el soroll de l'autopista i el motor",
    mineralWater: "AIGUA MINERAL FREDA",
    mineralWaterDesc: "Ampolles de vidre amb aigua freda col·locades al consola central de viatge",
    finTimes: "DIARI FINANCIAL TIMES",
    finTimesDesc: "Una còpia impresa de les principals notícies econòmiques i logístiques mundials",
    privacyTint: "CONTROL DE VIDRE DE PRIVACITAT",
    privacyTintDesc: "Vidres foscos electrocròmics tènues segons la vostra preferència",
    targetCabinTemp: "TEMPERATURA SELECCIONADA DE CABINA:",
    sriSafetySytem: "SEGURETAT INFANTIL (SEIENTS SRI)",
    sriDescription: "Sistemes de seguretat homologats segons les directives de la Unió Europea",
    activeSeatsPrefix: "Seleccionat (+€",
    sriRateNote: "Incorparar seients homologats (SRI) afegeix un cost extraordinari de €6.00 per seient.",
    otherNotesCompliments: "La resta d'opcions premium són gentilesa de Majestic Fleet Sl Atelier.",
    sriExclusionsTitle: "Assumptes de Trànsit - Exclusions de SRI (Exempció Legal)",
    sriExclusionsSubtitle: "D'acord amb el Reglament General de Circulació d'Espanya (Article 117):",
    sriExclusionsList1: "Sota perímetres exclusivament urbans o nuclis de població, els taxis i els serveis privats (VTC) estan legalment exempts d'incorporar sistemes de retenció infantil si els nens viatgen als seients del darrere i la seva alçada no supera els 135 cm.",
    sriExclusionsWarning: "Sense exclusions a Majestic Fleet Sl: Per a nosaltres, la seguretat dels menors d'edat és totalment sagrada i mai fem ús d'aquestes exempcions legals. Col·loquem gratuïtament seients SRI nets i revisats en qualsevol trajecte demanat.",

    wheelchairTitle: "ACCESSIBILITAT DE MOBILITAT",
    wheelchairDesc: "Espai dedicat per a cadira de rodes plegable o rampa de transport físic a mida",
    wheelchairTypeLabel: "TIPUS DE CADIRA DE RODES:",
    wheelchairQuantityLabel: "CANTITATS ADAPTACIONS:",
    wheelchairOptionFoldable: "Cadira de rodes manual plegable",
    wheelchairOptionMotorized: "Cadira de rodes motoritzada",
    wheelchairPlaceholderNone: "Cap adaptació demanada",

    requestInvoiceLabel: "Necessito factura oficial",
    invoiceDocTypeLabel: "Tipus de Document Oficial",
    invoiceDocNumberLabel: "Número de Passaport o Document d'Identitat Oficial",
    invoiceNameLabel: "Nom de Facturació concret o Nom de l'empresa",

    // Testimonial
    testimonialsHeader: "Testimonis de l'Atelier",
  }
};
