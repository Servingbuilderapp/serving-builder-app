const fs = require('fs');

const apps = [];

// I. Contabilidad Ambiental e Infraestructura UCAM (20)
const contabilidad = [
    ["ucam-asset", "Award", "UCAM Asset Generator", "UCAM Asset Generator", "Crea un 'título valor' digital de tu impacto positivo para que puedas venderlo o mostrarlo como un activo de tu empresa.", "Creates a digital 'security' of your positive impact to sell or show as an asset."],
    ["pasivos-invisibles", "TrendingDown", "Balance de Pasivos Invisibles", "Invisible Liabilities Balance", "Encuentra las deudas ambientales que no aparecen en tu contabilidad normal, como basura acumulada o contaminación pasada.", "Finds environmental debts not in normal accounting, like accumulated waste."],
    ["huella-a-ucam", "RefreshCw", "Conversor de Huella a UCAM", "Footprint to UCAM Converter", "Traduce tus toneladas de CO2 o kilos de plástico a 'monedas' de impacto UCAM para facilitar intercambios.", "Translates CO2 tons to UCAM impact coins for easy exchange."],
    ["costo-inaccion", "AlertTriangle", "Costo de Inacción", "Cost of Inaction", "Te muestra cuánto dinero perderá tu negocio si no empiezas a ser sostenible hoy mismo antes de que lleguen las multas.", "Shows money lost if you don't become sustainable before fines arrive."],
    ["auditor-activos", "CheckShield", "Auditor de Activos Verificables", "Verifiable Assets Auditor", "Revisa que tus datos sean tan sólidos que cualquier auditor internacional pueda darles el visto bueno.", "Checks data solidity for international auditors' approval."],
    ["simulador-externalidades", "Globe", "Simulador de Externalidades", "Externalities Simulator", "Calcula cuánto le cuesta al planeta tu operación y cómo eso afecta tu rentabilidad real.", "Calculates planet cost of your operation and real profitability impact."],
    ["brecha-regulatoria", "FileText", "Monitor de Brecha Regulatoria", "Regulatory Gap Monitor", "Te avisa qué tan lejos estás de cumplir las nuevas leyes ambientales de Europa y Latinoamérica.", "Alerts how far you are from meeting new EU/LatAm environmental laws."],
    ["valuador-capital-natural", "TreePine", "Valuador de Capital Natural", "Natural Capital Valuator", "Le pone un precio justo al aire limpio, el agua y la sombra que producen los árboles de tu propiedad.", "Prices clean air, water, and shade produced by your trees."],
    ["registro-trazabilidad", "Lock", "Registro de Trazabilidad", "Traceability Ledger", "Un libro contable digital donde nadie puede borrar ni alterar la historia de tus mejoras ambientales.", "Digital ledger where no one can alter your environmental improvements."],
    ["roi-estrategico", "Sun", "ROI Estratégico", "Strategic ROI", "Calcula exactamente en cuánto tiempo recuperarás el dinero que inviertas en tecnología verde.", "Calculates exact payback time for green tech investments."],
    ["gestor-creditos", "Wallet", "Gestor de Créditos de Impacto", "Impact Credits Manager", "Una billetera digital para administrar los certificados de ahorro de energía o reciclaje que generas.", "Digital wallet to manage generated energy/recycling certificates."],
    ["tax-carbon-predict", "BarChart", "Tax-Carbon Predictor", "Tax-Carbon Predictor", "Predice cuánto tendrás que pagar en impuestos por contaminar en los próximos 5 años.", "Predicts pollution tax payments for the next 5 years."],
    ["flujo-fondos-verdes", "TrendingUp", "Flujo de Fondos Verdes", "Green Cash Flow", "Proyecta cuánto dinero extra entrará a tu caja por vender bonos de carbono o certificados UCAM.", "Projects extra cash from selling carbon bonds or UCAM certificates."],
    ["sna-lms-integrator", "BookOpen", "SNA-LMS Integrator", "SNA-LMS Integrator", "Conecta lo que tus empleados aprenden con los resultados reales de ahorro ambiental de la empresa.", "Connects employee learning with real environmental savings."],
    ["bio-equity-ledger", "Map", "Bio-Equity Ledger", "Bio-Equity Ledger", "Registra la variedad de plantas y animales de tu zona como un patrimonio que aumenta el valor de tu tierra.", "Logs local biodiversity as an asset increasing land value."],
    ["costos-ocultos-residuos", "Trash2", "Costos Ocultos de Residuos", "Hidden Waste Costs", "Te dice cuánto dinero estás botando a la basura en forma de materia prima que aún sirve.", "Shows money thrown away as still useful raw materials."],
    ["green-interest", "Percent", "Green-Interest Optimizer", "Green-Interest Optimizer", "Te ayuda a negociar con el banco para que te bajen los intereses si demuestras que eres una empresa limpia.", "Helps negotiate lower bank interest rates by proving you're clean."],
    ["sdg-budgeting", "Target", "SDG-Budgeting Tool", "SDG-Budgeting Tool", "Organiza tus gastos para que cada peso que inviertas ayude a cumplir los Objetivos de Desarrollo Sostenible.", "Organizes spending so every dollar helps meet UN SDGs."],
    ["risk-climate", "ShieldAlert", "Risk-Climate Scorecard", "Risk-Climate Scorecard", "Te da una calificación de seguridad para saber si tus bodegas o plantas están en riesgo por el clima.", "Gives a safety score for warehouse/plant climate risk."],
    ["esg-autoreport", "FileCheck", "ESG-AutoReport", "ESG-AutoReport", "Escribe por ti el reporte de sostenibilidad que te piden los bancos o socios internacionales.", "Writes the sustainability report required by banks/partners."]
];
contabilidad.forEach(h => apps.push({ cat: "I. Contabilidad Ambiental", icon: h[1], slug: h[0], name_es: h[2], name_en: h[3], desc_es: h[4], desc_en: h[5] }));

// II. Medicina Ambiental y Salud Sistémica (20)
const medicina = [
    ["disruptor-finder", "Search", "Disruptor-Endocrino Finder", "Endocrine Disruptor Finder", "Analiza si tus productos de aseo o belleza tienen químicos que alteran tus hormonas.", "Analyzes if cleaning/beauty products have hormone-altering chemicals."],
    ["bau-screener", "Home", "Bau-Biologie Screener", "Building Biology Screener", "Un examen para tu oficina o casa que detecta si el edificio te está enfermando.", "Test for home/office to detect if the building is making you sick."],
    ["neuro-toxic-map", "MapPin", "Neuro-Toxic Risk Map", "Neuro-Toxic Risk Map", "Te dice si vives o trabajas cerca de zonas con químicos que afectan el cerebro y los nervios.", "Shows if you live/work near brain/nerve-affecting chemical zones."],
    ["pfas-check", "Droplet", "PFAS-Check", "PFAS-Check", "Identifica 'químicos eternos' en tu agua o sartenes que no se borran del cuerpo y pueden ser peligrosos.", "Identifies 'forever chemicals' in water/pans that stay in the body."],
    ["microplastic-calc", "Wind", "Microplastic Exposure Calc", "Microplastic Exposure Calc", "Estima cuántas partículas diminutas de plástico estás respirando o comiendo sin darte cuenta.", "Estimates microplastic particles breathed or eaten unknowingly."],
    ["emf-safety", "Radio", "EMF-Safety Distance", "EMF-Safety Distance", "Calcula a qué distancia debes estar de routers, cables y antenas para que no afecten tu salud.", "Calculates safe distance from routers/antennas for your health."],
    ["voc-health", "Activity", "VOC-Health Impact", "VOC-Health Impact", "Mide si el olor a pintura o pegamento en tu trabajo está dañando tus pulmones.", "Measures if paint/glue smells at work are damaging lungs."],
    ["heavy-metal-bio", "AlertCircle", "Heavy-Metal Bio-Accumulation", "Heavy-Metal Bio-Accumulation", "Te explica cómo metales como el plomo se guardan en tu cuerpo y qué riesgo tienes según tu zona.", "Explains how heavy metals store in the body and location risks."],
    ["circadian-light-opt", "Sun", "Circadian-Light Optimizer", "Circadian-Light Optimizer", "Te dice cómo configurar tus luces para que tu cuerpo sepa cuándo dormir y cuándo estar alerta.", "How to configure lights so your body knows when to sleep/be alert."],
    ["toxic-load", "Battery", "Toxic-Load Calculator", "Toxic-Load Calculator", "Calcula cuántos químicos has acumulado en tu vida basándose en dónde has vivido y trabajado.", "Calculates accumulated chemicals based on living/working history."],
    ["allergy-pollution", "Cloud", "Allergy-Pollution Alert", "Allergy-Pollution Alert", "Te avisa cuando el smog y el polen se juntan para evitar ataques de asma o rinitis.", "Alerts when smog and pollen mix to avoid asthma attacks."],
    ["skin-barrier", "Shield", "Skin-Barrier Protector", "Skin-Barrier Protector", "Analiza si tus jabones industriales están rompiendo la protección natural de tu piel.", "Analyzes if industrial soaps break your skin's natural barrier."],
    ["radon-estimator", "Thermometer", "Radon-Risk Estimator", "Radon-Risk Estimator", "Detecta si en el suelo de tu edificio hay gas radón, un riesgo invisible pero importante.", "Detects radon gas in building soil, an invisible risk."],
    ["detox-support", "Heart", "Detox-Support Nutrition", "Detox-Support Nutrition", "Guía médica de alimentos que ayudan a tu hígado y riñones a sacar los metales pesados del cuerpo.", "Medical food guide to help liver/kidneys extract heavy metals."],
    ["noise-stress-mon", "Volume2", "Noise-Stress Monitor", "Noise-Stress Monitor", "Te muestra cómo el ruido de las máquinas o el tráfico está subiendo tus niveles de estrés y presión.", "Shows how machine/traffic noise raises stress and blood pressure."],
    ["water-contaminant", "Droplets", "Water-Contaminant Decoder", "Water-Contaminant Decoder", "Traduce esos informes difíciles de los laboratorios de agua a palabras que tú entiendas.", "Translates complex water lab reports into understandable words."],
    ["eco-psychology", "Smile", "Eco-Psychology Support", "Eco-Psychology Support", "Herramientas para manejar la tristeza o el miedo que causa ver el daño al planeta (eco-ansiedad).", "Tools to manage sadness/fear from planetary damage (eco-anxiety)."],
    ["thermal-strain", "ThermometerSun", "Thermal-Strain Index", "Thermal-Strain Index", "Te avisa cuando el calor y la humedad en el trabajo ya son peligrosos para el corazón.", "Alerts when work heat/humidity becomes dangerous for the heart."],
    ["food-additive-tox", "Coffee", "Food-Additive Toxicity", "Food-Additive Toxicity", "Te dice qué colorantes y conservantes de tu comida son seguros y cuáles es mejor evitar.", "Shows which food dyes/preservatives are safe and which to avoid."],
    ["health-roi", "PieChart", "Health-ROI Simulator", "Health-ROI Simulator", "Calcula cuánto dinero ahorra una empresa al tener empleados sanos gracias a un aire más puro.", "Calculates money saved by having healthy employees via pure air."]
];
medicina.forEach(h => apps.push({ cat: "II. Medicina Ambiental", icon: h[1], slug: h[0], name_es: h[2], name_en: h[3], desc_es: h[4], desc_en: h[5] }));

// III. Ingeniería de Pirólisis y Valorización Técnica (20)
const ingenieria = [
    ["pyro-yield-pred", "Flame", "Pyro-Yield Predictor", "Pyro-Yield Predictor", "Te dice cuánto carbón y aceite sacarás de una tonelada de madera o plástico viejo.", "Predicts coal/oil yield from a ton of wood or old plastic."],
    ["syngas-btu", "Zap", "Syngas-BTU Calculator", "Syngas-BTU Calculator", "Mide cuánta energía tiene el gas que sale de tu horno para ver si puedes generar electricidad.", "Measures gas energy from kiln to see if electricity can be generated."],
    ["polymer-pyro", "Box", "Polymer-Pyrolysis ID", "Polymer-Pyrolysis ID", "Te ayuda a identificar qué plásticos sirven para quemar y cuáles para hacer aceite.", "Identifies which plastics to burn and which for oil."],
    ["mass-energy-bal", "Scale", "Mass-Energy Balance Pro", "Mass-Energy Balance Pro", "Asegura que tu máquina no gaste más energía de la que produce.", "Ensures your machine doesn't spend more energy than it produces."],
    ["reactor-sizing", "Maximize", "Reactor-Sizing Tool", "Reactor-Sizing Tool", "Te da las medidas exactas que debe tener tu horno según cuánta basura quieras procesar.", "Exact kiln dimensions based on waste processing volume."],
    ["biochar-quality-an", "CheckSquare", "Biochar-Quality Analyzer", "Biochar-Quality Analyzer", "Revisa si tu carbón vegetal sirve para venderlo como abono o como filtro de agua.", "Checks if biochar is sellable as fertilizer or water filter."],
    ["emission-scrubber", "CloudRain", "Emission-Scrubber Calc", "Emission-Scrubber Calc", "Calcula cuánta agua necesitas para lavar el humo de tu chimenea y que salga limpio.", "Calculates water needed to wash chimney smoke clean."],
    ["thermal-loss-det", "ThermometerSnowflake", "Thermal-Loss Detector", "Thermal-Loss Detector", "Te señala por dónde se está escapando el calor de tu máquina para que no gastes leña o gas de más.", "Points out machine heat leaks to save wood/gas."],
    ["moisture-impact", "Droplet", "Moisture-Impact Simulator", "Moisture-Impact Simulator", "Te dice qué tanto afecta la humedad de tu leña al tiempo que tarda en quemarse.", "Shows how wood moisture affects burning time."],
    ["tire-carbon-black", "Circle", "Tire-Carbon-Black Recovery", "Tire-Carbon-Black Recovery", "Calcula cuánto acero y polvo negro puedes sacar de 100 llantas usadas.", "Calculates steel and black powder from 100 used tires."],
    ["sludge-to-energy", "Trash2", "Sludge-to-Energy Designer", "Sludge-to-Energy Designer", "Una guía para convertir el lodo de las alcantarillas en energía útil.", "Guide to convert sewage sludge into useful energy."],
    ["heat-exchanger", "RefreshCw", "Heat-Exchanger Optimizer", "Heat-Exchanger Optimizer", "Diseña tubos para que el calor que sale de tu horno sirva para calentar agua gratis.", "Designs pipes to use kiln heat for free water heating."],
    ["pyrolysis-oil-stab", "Settings", "Pyrolysis-Oil Stabilizer", "Pyrolysis-Oil Stabilizer", "Consejos para mejorar la calidad del aceite que fabricas para que no se dañe.", "Tips to improve manufactured oil quality to prevent degradation."],
    ["safety-pressure", "AlertCircle", "Safety-Pressure Valve Calc", "Safety-Pressure Valve Calc", "Calcula qué tan fuerte debe ser tu válvula para que el horno no explote por presión.", "Calculates valve strength to prevent pressure explosions."],
    ["feedstock-mix-mast", "List", "Feedstock-Mix Master", "Feedstock-Mix Master", "La receta perfecta: cuánto plástico y cuánta madera mezclar para que el fuego sea estable.", "Perfect recipe: plastic/wood ratio for a stable fire."],
    ["catalyst-selection", "FlaskConical", "Catalyst-Selection Guide", "Catalyst-Selection Guide", "Te recomienda polvos químicos para que tu proceso funcione a menos temperatura y sea más barato.", "Recommends chemicals to lower process temperature and cost."],
    ["ash-chemical-prof", "Archive", "Ash-Chemical Profile", "Ash-Chemical Profile", "Analiza si la ceniza que te sobra sirve para mezclar con cemento y hacer ladrillos.", "Analyzes if leftover ash is useful for cement brick mixing."],
    ["process-duration", "Clock", "Process-Duration Timer", "Process-Duration Timer", "Te dice exactamente cuántos minutos debe estar la basura en el horno para que se convierta en carbón.", "Exact kiln minutes needed to turn waste into coal."],
    ["maintenance-pred", "Tool", "Maintenance-Predictor AI", "Maintenance-Predictor AI", "Te avisa cuándo debes limpiar tu máquina antes de que se rompa por el uso.", "Alerts when to clean machine before it breaks from use."],
    ["plant-efficiency", "FileText", "Plant-Efficiency Logger", "Plant-Efficiency Logger", "Un diario digital para anotar cuánto produjiste cada día y ver si tu planta es rentable.", "Digital diary to log daily production and profitability."]
];
ingenieria.forEach(h => apps.push({ cat: "III. Ingeniería Pirólisis", icon: h[1], slug: h[0], name_es: h[2], name_en: h[3], desc_es: h[4], desc_en: h[5] }));

// IV. Economía Circular y Reciclaje Profesional (20)
const circular = [
    ["reverse-log-plan", "Truck", "Reverse-Logistics Planner", "Reverse-Logistics Planner", "Diseña la ruta más corta para recoger material reciclable y gastar menos gasolina.", "Designs shortest route for recyclables to save gas."],
    ["material-flow-sank", "Share2", "Material-Flow Sankey", "Material-Flow Sankey", "Un mapa visual que muestra por dónde entra la materia prima a tu fábrica y por dónde se desperdicia.", "Visual map of raw material entry and waste points."],
    ["upcycling-rank", "Star", "Upcycling-Potential Ranker", "Upcycling-Potential Ranker", "Te da ideas creativas para convertir tus residuos industriales en productos de lujo.", "Creative ideas to turn industrial waste into luxury products."],
    ["ewaste-dismantle", "Cpu", "E-Waste Dismantle Guide", "E-Waste Dismantle Guide", "Manual paso a paso para desarmar computadores y sacarles el oro y la plata de forma segura.", "Step-by-step guide to dismantle PCs for safe gold/silver extraction."],
    ["recyclability-score", "Package", "Recyclability Scorecard", "Recyclability Scorecard", "Le da una nota a tu producto para ver qué tan fácil será reciclarlo en el futuro.", "Grades product to see how easy it is to recycle in the future."],
    ["cn-ratio", "Leaf", "C/N Ratio Composter", "C/N Ratio Composter", "Te dice cuántas hojas secas y cuántas cáscaras de fruta echar a tu abono para que no huela mal.", "Dry leaves/fruit peel ratio for odor-free compost."],
    ["zero-waste-audit", "CheckCircle", "Zero-Waste Audit Tool", "Zero-Waste Audit Tool", "Encuentra los puntos exactos de tu empresa donde estás creando basura que podrías evitar.", "Finds exact company spots creating avoidable trash."],
    ["digital-mat-pass", "CreditCard", "Digital Material Passport", "Digital Material Passport", "Crea una 'cédula' para tu producto que dice de qué está hecho para que siempre se sepa cómo reciclarlo.", "Product ID showing composition for future recycling."],
    ["symbiosis-matcher", "Users", "Industrial Symbiosis Matcher", "Industrial Symbiosis Matcher", "Un 'Tinder' de basura: busca empresas que necesiten lo que a ti te sobra como materia prima.", "Waste Tinder: finds companies needing your waste as raw material."],
    ["waste-hazard", "AlertTriangle", "Waste-Hazard Classifier", "Waste-Hazard Classifier", "Te dice si un químico es peligroso y cómo debes guardarlo para no causar accidentes.", "Shows if a chemical is hazardous and how to store it safely."],
    ["plastic-density", "Droplet", "Plastic-Density Tester", "Plastic-Density Tester", "Una prueba sencilla con agua y sal para saber exactamente qué tipo de plástico tienes en la mano.", "Simple water/salt test to identify plastic type."],
    ["water-circular", "RefreshCcw", "Water-Circular Designer", "Water-Circular Designer", "Diseña un sistema para que el agua que usas en una máquina sirva para otra en lugar de botarla.", "Designs a system to reuse machine water instead of wasting it."],
    ["pallet-tracker", "Archive", "Pallet-Life-Cycle Tracker", "Pallet-Life-Cycle Tracker", "Controla cuántas estibas tienes y cuántas veces se han reparado para que duren más años.", "Tracks pallets and repairs so they last more years."],
    ["textile-analyzer", "Scissors", "Textile-Fiber Analyzer", "Textile-Fiber Analyzer", "Te ayuda a saber si una tela es algodón natural o poliéster plástico para poder reciclarla.", "Helps identify if fabric is natural cotton or plastic polyester."],
    ["biodegradability", "Clock", "Biodegradability Timer", "Biodegradability Timer", "Te dice cuánto tardará un material en desaparecer si cae al suelo, al agua o al compost.", "Shows how long a material takes to disappear in soil/water/compost."],
    ["paper-to-tree", "TreePine", "Paper-to-Tree Converter", "Paper-to-Tree Converter", "Traduce tus kilos de papel reciclado a número de árboles salvados para tus redes sociales.", "Translates recycled paper kilos to saved trees for social media."],
    ["demolition-inv", "Home", "Demolition-Inventory Pro", "Demolition-Inventory Pro", "Lista qué ventanas, puertas o cables puedes salvar de una casa vieja antes de tumbarla.", "Lists salvageable windows/doors from an old house before demolition."],
    ["scrap-value", "DollarSign", "Scrap-Value Live", "Scrap-Value Live", "Te da el precio real del metal, cartón y plástico en el mercado hoy mismo.", "Gives real-time market price for scrap metal/cardboard/plastic."],
    ["modular-design", "Grid", "Modular-Design Checklist", "Modular-Design Checklist", "Consejos para fabricar cosas que se puedan desarmar y arreglar fácilmente.", "Tips to manufacture easily dismantled and repairable items."],
    ["green-vendor-aud", "ShoppingCart", "Green-Vendor Auditor", "Green-Vendor Auditor", "Revisa si tus proveedores son realmente ecológicos o si solo lo dicen por publicidad.", "Checks if suppliers are truly eco-friendly or just greenwashing."]
];
circular.forEach(h => apps.push({ cat: "IV. Economía Circular", icon: h[1], slug: h[0], name_es: h[2], name_en: h[3], desc_es: h[4], desc_en: h[5] }));

// V. Estrategia y Educación (20) - Conserved from original requested 120 total
const estrategia = [
    ["law-library", "Book", "Law-Library", "Law-Library", "Las leyes ambientales de tu país resumidas.", "Your country's environmental laws summarized."],
    ["iso-14001-prep", "List", "ISO-14001-Prep", "ISO-14001-Prep", "Lista de tareas para certificarte internacionalmente.", "Task list for international certification."],
    ["ecolabel-verify", "ShieldAlert", "Ecolabel-Verify", "Ecolabel-Verify", "Detecta si un sello Eco es falso (Greenwashing).", "Detects if an Eco label is fake."],
    ["green-glossary", "BookOpen", "Green-Glossary", "Green-Glossary", "Significado de palabras técnicas ambientales.", "Meaning of technical environmental words."],
    ["audit-cam", "Camera", "Audit-Cam", "Audit-Cam", "Toma fotos de problemas ambientales y crea un reporte.", "Take photos of environmental issues and report."],
    ["stakeholder-map", "Map", "Stakeholder-Map", "Stakeholder-Map", "Lista de vecinos y grupos que afectan tu negocio.", "List of neighbors and groups affecting business."],
    ["policy-maker", "FileText", "Policy-Maker", "Policy-Maker", "Escribe la misión ambiental de tu empresa por ti.", "Writes your company's environmental mission."],
    ["climate-action-planner", "Calendar", "Climate-Action-Planner", "Climate-Action-Planner", "Metas mes a mes para dejar de contaminar.", "Month-by-month goals to stop polluting."],
    ["eco-trivia", "HelpCircle", "Eco-Trivia", "Eco-Trivia", "Juego para que tus empleados aprendan a reciclar.", "Game for employees to learn recycling."],
    ["crisis-response", "AlertCircle", "Crisis-Response", "Crisis-Response", "Qué hacer si se rompe un tarro de ácido.", "What to do if an acid jar breaks."],
    ["reporting-gri", "BarChart", "Reporting-GRI", "Reporting-GRI", "Llena un formulario y genera tu reporte anual.", "Fill form and generate annual report."],
    ["permit-tracker", "Clock", "Permit-Tracker", "Permit-Tracker", "Te avisa antes de que venza tu licencia de agua.", "Alerts before your water license expires."],
    ["bio-ethics-app", "Scale", "Bio-Ethics-App", "Bio-Ethics-App", "Ayuda a decidir dilemas morales sobre naturaleza.", "Helps decide moral dilemmas regarding nature."],
    ["citizen-science", "Eye", "Citizen-Science", "Citizen-Science", "Sube fotos de animales raros para biólogos.", "Upload photos of rare animals for biologists."],
    ["grant-finder", "Search", "Grant-Finder", "Grant-Finder", "Dónde hay dinero regalado para proyectos verdes.", "Where to find free money for green projects."],
    ["supply-risk", "Activity", "Supply-Risk", "Supply-Risk", "Te avisa si tu proveedor está deforestando.", "Alerts if your supplier is deforesting."],
    ["workshop-pro", "Users", "Workshop-Pro", "Workshop-Pro", "Ideas para reuniones de equipo sobre ecología.", "Ideas for team meetings about ecology."],
    ["lobby-monitor", "Radio", "Lobby-Monitor", "Lobby-Monitor", "Qué se decidió hoy en las cumbres del clima.", "What was decided today at climate summits."],
    ["eco-impact-simulator", "Globe", "Eco-Impact-Simulator", "Eco-Impact-Simulator", "Mira cómo se vería el mundo si todos reciclaran.", "See world if everyone recycled."],
    ["portal-config", "Settings", "Portal-Config", "Portal-Config", "Ajusta tus apps favoritas y personales.", "Adjust your favorite and personal apps."]
];
estrategia.forEach(h => apps.push({ cat: "V. Estrategia y Edu", icon: h[1], slug: h[0], name_es: h[2], name_en: h[3], desc_es: h[4], desc_en: h[5] }));


// VI. Estructuración y Financiamiento de Proyectos (15)
const proyectos = [
    ["linea-base-exp", "Map", "Línea Base Express", "Express Baseline", "Permite establecer la situación inicial de un proyecto (estado 'cero') para poder medir cuánto impacto positivo se genera realmente desde el inicio.", "Establishes initial project state to measure positive impact generated."],
    ["estructurador-proyectos", "Layout", "Estructurador de Proyectos de Impacto", "Impact Project Structurer", "Guía al usuario en la creación del documento técnico (pitch deck) necesario para presentar proyectos ante fondos de inversión ambiental.", "Guides creation of pitch deck for environmental investment funds."],
    ["calc-adicionalidad", "PlusCircle", "Calculadora de Adicionalidad", "Additionality Calculator", "Determina si un proyecto ambiental realmente aporta un beneficio nuevo o si es algo que sucedería de todos modos por ley.", "Determines if an environmental project provides a truly new benefit."],
    ["sim-escalabilidad", "Maximize", "Simulador de Escalabilidad Técnica", "Tech Scalability Simulator", "Evalúa si una solución ambiental pequeña puede crecer 10 o 100 veces manteniendo su eficiencia.", "Evaluates if a small eco solution can scale 10-100x efficiently."],
    ["validador-mrv", "CheckSquare", "Validador de Metodologías MRV", "MRV Methodologies Validator", "Ayuda a elegir el método correcto para medir, reportar y verificar el impacto según el estándar internacional.", "Helps choose correct MRV method based on international standards."],
    ["monitor-convocatorias", "Search", "Monitor de Convocatorias Internacionales", "International Grants Monitor", "Filtra y alerta sobre fondos no reembolsables y licitaciones de organismos como el BID, BM o agencias de cooperación.", "Alerts on grants and bids from BID, WB, or cooperation agencies."],
    ["analizador-riesgo-ejec", "AlertTriangle", "Analizador de Riesgo de Ejecución", "Execution Risk Analyzer", "Identifica cuellos de botella técnicos o sociales que podrían hacer que un proyecto ambiental fracase antes de completarse.", "Identifies bottlenecks that could fail an eco project mid-way."],
    ["gestor-app", "Handshake", "Gestor de Alianzas Público-Privadas", "PPP Alliance Manager", "Estructura modelos de colaboración donde el gobierno pone el marco legal y la empresa privada la tecnología de impacto.", "Structures PPP models combining gov legal frame with private tech."],
    ["buscador-inversionistas", "Users", "Buscador de Inversionistas de Impacto", "Impact Investors Finder", "Conecta proyectos verificados con Angel Investors o fondos de capital de riesgo que buscan retorno ambiental y financiero.", "Connects verified projects with Impact Angel Investors."],
    ["huella-proyecto", "Wind", "Calculadora de Huella de Proyecto", "Project Footprint Calculator", "Estima cuántas emisiones generará construir el proyecto mismo, para asegurar que el beneficio final sea mayor al costo inicial.", "Estimates project construction emissions vs final benefit."],
    ["disenador-kpis", "Target", "Diseñador de KPIs Ambientales", "Environmental KPIs Designer", "Genera los indicadores clave de desempeño que los financiadores exigen ver en los reportes mensuales de avance.", "Generates key performance indicators demanded by financiers."],
    ["certificador-impacto", "Award", "Certificador de Impacto Verificable", "Verifiable Impact Certifier", "Organiza la documentación necesaria para que una entidad externa (EVA) emita un certificado de cumplimiento sin errores.", "Organizes docs for error-free external compliance certification."],
    ["simulador-precios", "DollarSign", "Simulador de Precios de Activos Ambientales", "Eco Asset Price Simulator", "Proyecta cuánto podría valer en el mercado un activo generado por el proyecto (ej. una unidad UCAM).", "Projects future market value of project-generated assets."],
    ["analizador-social", "Heart", "Analizador de Co-beneficios Sociales", "Social Co-benefits Analyzer", "Mide los impactos positivos extra, como creación de empleo local o mejora de la salud comunitaria.", "Measures extra positive impacts like local jobs or community health."],
    ["cronograma-transicion", "Calendar", "Cronograma de Transición Sistémica", "Systemic Transition Timeline", "Crea una hoja de ruta paso a paso para que un proyecto pase de ser una idea voluntaria a ser parte de la infraestructura del negocio.", "Creates step-by-step roadmap to integrate voluntary ideas into infrastructure."]
];
proyectos.forEach(h => apps.push({ cat: "VI. Proyectos", icon: h[1], slug: h[0], name_es: h[2], name_en: h[3], desc_es: h[4], desc_en: h[5] }));

// VII. Segmentos Específicos (5)
const segmentos = [
    ["hogar-sano", "Home", "Hogar Sano", "Healthy Home", "Una app para familias que evalúa la salud de la casa. Escanea productos de limpieza, mide riesgos de moho y disruptores endocrinos.", "Family app evaluating home health, scanning products, and mold risks."],
    ["corp-eco-manager", "Briefcase", "Corporate Eco-Manager", "Corporate Eco-Manager", "El tablero de control para el gerente de sostenibilidad. Centraliza la huella de carbono, gestiona residuos y genera reportes ESG.", "Sustainability manager dashboard for footprint, waste, and ESG reports."],
    ["comunidad-circular", "Users", "Comunidad Circular", "Circular Community", "Herramienta para barrios que organiza el intercambio de residuos, coordina rutas de reciclaje y mide el impacto positivo colectivo.", "Neighborhood tool for waste exchange and communal recycling routes."],
    ["eco-campus", "BookOpen", "Eco-Campus", "Eco-Campus", "Una plataforma que convierte el campus en un laboratorio vivo. Permite medir el consumo energético y gestionar el compost escolar.", "Turns campus into a living lab for energy tracking and school compost."],
    ["gov-impact-mon", "Landmark", "Gov-Impact Monitor", "Gov-Impact Monitor", "Diseñada para alcaldías. Permite monitorear metas climáticas, gestionar licencias ambientales y visualizar riesgos sanitarios.", "Mayoralty app to monitor climate goals and visualize health risks."]
];
segmentos.forEach(h => apps.push({ cat: "VII. Segmentos", icon: h[1], slug: h[0], name_es: h[2], name_en: h[3], desc_es: h[4], desc_en: h[5] }));

let sql = `-- Script de inserción de 120 Micro-Apps para Vertical Medio Ambiente\n\n`;

// Clear old apps if any
sql += `DELETE FROM app_executions;\n`;
sql += `DELETE FROM plan_apps;\n`;
sql += `DELETE FROM user_app_overrides;\n`;
sql += `DELETE FROM micro_apps;\n\n`;

sql += `INSERT INTO micro_apps (slug, name_es, name_en, description_es, description_en, icon, form_schema, autofill_presets, prompt_template)\nVALUES\n`;

const values = apps.map((app, i) => {
    const isLast = i === apps.length - 1;
    const formSchema = `[{"name": "input", "type": "textarea", "label_es": "Describe tu necesidad", "label_en": "Describe your need", "required": true}]`;
    const presets = `[]`;
    const prompt = `GENERAL INSTRUCTIONS: You are an expert Environmental Consultant. Respond in {{responseLanguage}}. Task: Process {{input}} for ${app.name_en}`;
    
    return `('${app.slug}', '${app.cat}: ${app.name_es}', '${app.cat}: ${app.name_en}', '${app.desc_es}', '${app.desc_en}', '${app.icon}', '${formSchema}'::jsonb, '${presets}'::jsonb, '${prompt}')`;
});

sql += values.join(",\n") + "\nON CONFLICT (slug) DO UPDATE SET\n  name_es = EXCLUDED.name_es,\n  name_en = EXCLUDED.name_en,\n  description_es = EXCLUDED.description_es,\n  description_en = EXCLUDED.description_en,\n  icon = EXCLUDED.icon,\n  form_schema = EXCLUDED.form_schema,\n  prompt_template = EXCLUDED.prompt_template;\n\n";

// NEW PLANS LOGIC
sql += `\n-- Vinculación de Apps a Planes\n`;
sql += `\n-- 1. Primero, asegurarse de que los planes existan según la nueva estructura\n`;
sql += `DELETE FROM plans;\n\n`;

sql += `
INSERT INTO plans (slug, name_es, name_en, description_es, description_en, price_monthly, app_limit, sort_order)
VALUES 
  ('gratis', 'Gratuito', 'Free', '5 Apps maestras pre-asignadas (familia, empresas, etc.).', '5 pre-assigned master apps (family, corporate, etc.).', 0, 5, 1),
  ('crecimiento-10', 'Crecimiento Inicial', 'Initial Growth', 'Desbloquea 10 apps adicionales a tu elección.', 'Unlocks 10 additional apps of your choice.', 27, 15, 2),
  ('crecimiento-30', 'Crecimiento Pro', 'Pro Growth', 'Desbloquea 30 apps a tu elección.', 'Unlocks 30 apps of your choice.', 47, 30, 3),
  ('crecimiento-max', 'Crecimiento Max', 'Max Growth', 'Desbloquea 60 apps a tu elección.', 'Unlocks 60 apps of your choice.', 97, 60, 4),
  ('elite', 'Plan Elite', 'Elite Plan', 'Desbloquea 80 apps a tu elección.', 'Unlocks 80 apps of your choice.', 197, 80, 5),
  ('master', 'Plan Master', 'Master Plan', 'Desbloqueo Ilimitado (120 apps).', 'Unlimited Unlock (120 apps).', 497, 120, 6)
ON CONFLICT (slug) DO UPDATE SET 
  name_es = EXCLUDED.name_es, 
  name_en = EXCLUDED.name_en, 
  price_monthly = EXCLUDED.price_monthly,
  app_limit = EXCLUDED.app_limit,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  sort_order = EXCLUDED.sort_order;
`;

sql += `\n-- 2. Vincular Apps Demo del Segmento Maestro al Plan Gratuito (slug: gratis)\n`;
sql += `INSERT INTO plan_apps (plan_id, app_id)
SELECT p.id, m.id FROM plans p, micro_apps m 
WHERE p.slug = 'gratis' AND m.slug IN ('hogar-sano', 'corp-eco-manager', 'comunidad-circular', 'eco-campus', 'gov-impact-mon')
ON CONFLICT DO NOTHING;\n`;

sql += `\n-- 3. Vincular Todas las Apps a los demás planes (el desbloqueo lo limita app_limit en el backend)\n`;
sql += `INSERT INTO plan_apps (plan_id, app_id)
SELECT p.id, m.id FROM plans p, micro_apps m 
WHERE p.slug IN ('crecimiento-10', 'crecimiento-30', 'crecimiento-max', 'elite', 'master')
ON CONFLICT DO NOTHING;\n`;


fs.writeFileSync('supabase_setup_environment.sql', sql, 'utf8');
console.log('SQL script generated successfully in root directory.');
