export interface TranslationSet {
  titulo: string;
  entidad_otorgante: string;
  requisitos_clave: string;
  sectores_elegibles: string[];
  justificacion_high: string;
  justificacion_low: string;
}

export const CONVOCATORIA_TRANSLATIONS: Record<string, Record<string, TranslationSet>> = {
  c1: {
    es: {
      titulo: "Fondo Verde para la Acción Climática Local",
      entidad_otorgante: "Cooperación Alemana (GIZ)",
      requisitos_clave: "Requiere personería jurídica de derecho privado sin fines de lucro con mínimo 2 años de existencia. Aporte propio del 10% del presupuesto.",
      sectores_elegibles: [
        "Reforestación y Restauración Ecológica",
        "Economía Circular y Gestión de Residuos",
        "Medición de Huella de Carbono",
        "Medición de Huella Hídrica",
        "Tratamiento y Conservación de Aguas"
      ],
      justificacion_high: "El sector del proyecto tiene alta coincidencia con las directrices de GIZ. El presupuesto solicitado es viable dentro del techo financiero.",
      justificacion_low: "Existe alineación sectorial básica, pero se sugiere reformular los objetivos y adecuar la propuesta a los requisitos de GIZ."
    },
    en: {
      titulo: "Green Fund for Local Climate Action",
      entidad_otorgante: "German Cooperation (GIZ)",
      requisitos_clave: "Requires private non-profit legal entity with a minimum of 2 years of existence. Own contribution of 10% of the budget.",
      sectores_elegibles: [
        "Reforestation and Ecological Restoration",
        "Circular Economy and Waste Management",
        "Carbon Footprint Measurement",
        "Water Footprint Measurement",
        "Water Treatment and Conservation"
      ],
      justificacion_high: "The project sector has high alignment with GIZ guidelines. The requested budget is viable within the funding limit.",
      justificacion_low: "Basic sector alignment exists, but it is suggested to reformulate goals to meet GIZ requirements."
    },
    pt: {
      titulo: "Fundo Verde para Ação Climática Local",
      entidad_otorgante: "Cooperação Alemã (GIZ)",
      requisitos_clave: "Requer pessoa jurídica de direito privado sem fins lucrativos com no mínimo 2 anos de existência. Contrapartida própria de 10% do orçamento.",
      sectores_elegibles: [
        "Reflorestamento e Restauração Ecológica",
        "Economia Circular e Gestão de Resíduos",
        "Medição de Pegada de Carbono",
        "Medição de Pegada Hídrica",
        "Tratamiento e Conservação de Água"
      ],
      justificacion_high: "O setor do projeto tem alto alinhamento com as diretrizes da GIZ. O orçamento solicitado é viável dentro do teto financeiro.",
      justificacion_low: "Existe alinhamento setorial básico, mas sugere-se reformular os objetivos e adequar a proposta aos requisitos da GIZ."
    },
    fr: {
      titulo: "Fonds Vert pour l'Action Climatique Locale",
      entidad_otorgante: "Coopération Allemande (GIZ)",
      requisitos_clave: "Requiert une personne morale de droit privé à but non lucratif ayant au moins 2 ans d'existence. Contribution propre de 10% du budget.",
      sectores_elegibles: [
        "Reboisement et Restauration Écologique",
        "Économie Circulaire et Gestion des Déchets",
        "Mesure de l'Empreinte Carbone",
        "Mesure de l'Empreinte Eau",
        "Traitement et Conservation des Eaux"
      ],
      justificacion_high: "Le secteur du projet est très aligné avec les directives de la GIZ. Le budget demandé est viable au sein de l'enveloppe.",
      justificacion_low: "Il existe un alignement sectoriel de base, mais il est suggéré de reformuler les objectifs pour répondre aux exigences de la GIZ."
    },
    de: {
      titulo: "Grüner Fonds für lokalen Klimaschutz",
      entidad_otorgante: "Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)",
      requisitos_clave: "Erfordert eine private gemeinnützige juristische Person mit einer Mindestbestehensdauer von 2 Jahren. Eigenanteil von 10% des Budgets.",
      sectores_elegibles: [
        "Aufforstung und ökologische Wiederherstellung",
        "Kreislaufwirtschaft und Abfallentsorgung",
        "Messung des CO2-Fußabdrucks",
        "Messung des Wasserfußabdrucks",
        "Wasseraufbereitung und -erhaltung"
      ],
      justificacion_high: "Der Projektsektor stimmt hervorragend mit den GIZ-Richtlinien überein. Das beantragte Budget ist tragbar.",
      justificacion_low: "Eine grundlegende Sektorausrichtung ist gegeben, aber es wird empfohlen, die Ziele an die GIZ-Anforderungen anzupassen."
    },
    it: {
      titulo: "Fondo Verde per l'Azione Climatica Locale",
      entidad_otorgante: "Cooperazione Tedesca (GIZ)",
      requisitos_clave: "Richiede personalità giuridica di diritto privato senza scopo di lucro con almeno 2 anni di esistenza. Contributo proprio del 10% del bilancio.",
      sectores_elegibles: [
        "Riforestazione e Ripristino Ecologico",
        "Economia Circolare e Gestione dei Rifiuti",
        "Misurazione dell'Impronta di Carbonio",
        "Misurazione dell'Impronta Idrica",
        "Tratamiento e Conservazione dell'Acqua"
      ],
      justificacion_high: "Il settore del progetto ha un elevato allineamento con le linee guida GIZ. Il budget richiesto è praticabile.",
      justificacion_low: "Esiste un allineamento settoriale di base, ma si suggerisce di riformulare gli obiettivi in linea con i requisiti GIZ."
    },
    zh: {
      titulo: "地方气候行动绿色基金",
      entidad_otorgante: "德国国际合作机构 (GIZ)",
      requisitos_clave: "需要成立至少2年的非营利私立法人实体。项目预算自筹资金比例不低于10%。",
      sectores_elegibles: [
        "重新造林与生态修复",
        "循环经济与垃圾管理",
        "碳足迹测量",
        "水足迹测量",
        "水处理与保护"
      ],
      justificacion_high: "项目领域与德国国际合作机构（GIZ）的指导方针高度吻合。所申请的预算完全在限额内可行。",
      justificacion_low: "存在基础行业契合度，但建议重新规划目标以适应GIZ的具体申报要求。"
    },
    ja: {
      titulo: "ローカル気候アクションのためのグリーン基金",
      entidad_otorgante: "ドイツ国際協力公社 (GIZ)",
      requisitos_clave: "設立後2年以上の非営利の民間法人格が必要。予算の10%の自己資金が必要。",
      sectores_elegibles: [
        "植林と生態系回復",
        "循環型経済と廃棄物管理",
        "炭素足跡の測定",
        "水足跡の測定",
        "水処理と保全"
      ],
      justificacion_high: "プロジェクト分野はGIZのガイドラインと高度に一致しています。要求予算は上限値に対して実行可能です。",
      justificacion_low: "基本的な分野の一致は見られますが、GIZの要件に適合するよう目標を再設計することをお勧めします。"
    },
    ar: {
      titulo: "الصندوق الأخضر للعمل المناخي المحلي",
      entidad_otorgante: "الوكالة الألمانية للتعاون الدولي (GIZ)",
      requisitos_clave: "يتطلب شخصية قانونية خاصة غير هادفة للربح قائمة منذ عامين على الأقل. مساهمة ذاتية بنسبة 10% من الميزانية.",
      sectores_elegibles: [
        "إعادة التشجير والاستعادة البيئية",
        "الاقتصاد الدائري وإدارة النفايات",
        "قياس البصمة الكربونية",
        "قياس البصمة المائية",
        "معالجة المياه وحفظها"
      ],
      justificacion_high: "يتماشى قطاع المشروع بشكل كبير مع توجيهات الوكالة الألمانية (GIZ). الميزانية المطلوبة مجدية.",
      justificacion_low: "يوجد توافق قطاعي أساسي، ولكن يُقترح إعادة صياغة الأهداف لتتوافق مع متطلبات GIZ."
    },
    ru: {
      titulo: "Зеленый фонд для местных климатических инициатив",
      entidad_otorgante: "Немецкое общество международного сотрудничества (GIZ)",
      requisitos_clave: "Требуется зарегистрированное некоммерческое юридическое лицо с опытом работы не менее 2 лет. Собственный вклад — 10% от бюджета.",
      sectores_elegibles: [
        "Лесовосстановление и экологическая реставрация",
        "Циклическая экономика и управление отходами",
        "Измерение углеродного следа",
        "Измерение водного следа",
        "Очистка и сохранение водных ресурсов"
      ],
      justificacion_high: "Направление проекта демонстрирует высокое соответствие экологическим стандартам GIZ. Запрашиваемый бюджет обоснован.",
      justificacion_low: "Выявлено базовое отраслевое соответствие, однако рекомендуется адаптировать цели проекта под специфические регламенты GIZ."
    }
  },
  c2: {
    es: {
      titulo: "Subvenciones de Educación STEM y Equidad de Género",
      entidad_otorgante: "Unión Europea (Grants.gov)",
      requisitos_clave: "Debe dirigirse a poblaciones juveniles vulnerables en regiones en desarrollo. Toda la contabilidad financiera y los informes de progreso deben presentarse en inglés.",
      sectores_elegibles: [
        "Educación STEM para Jóvenes",
        "Alfabetización Digital Comunitaria",
        "Plataformas E-learning de Habilidades Blandas"
      ],
      justificacion_high: "Excelente alineación con las metas de educación y equidad de la UE. El presupuesto y el sector coinciden de forma ideal.",
      justificacion_low: "Se requiere mayor enfoque en educación STEM e inclusión de género para cumplir con los estándares de la Unión Europea."
    },
    en: {
      titulo: "STEM Education and Gender Equality Grants",
      entidad_otorgante: "European Union (Grants.gov)",
      requisitos_clave: "Must target vulnerable youth populations in developing regions. All financial accounting and progress reports must be submitted in English.",
      sectores_elegibles: [
        "STEM Education for Youth",
        "Community Digital Literacy",
        "Soft Skills E-learning Platforms"
      ],
      justificacion_high: "Excellent alignment with EU education and equity goals. The budget and sector are a perfect match.",
      justificacion_low: "Greater focus on STEM education and inclusion is required to meet European Union standards."
    },
    pt: {
      titulo: "Subsídios para Educação STEM e Equidade de Gênero",
      entidad_otorgante: "União Europeia (Grants.gov)",
      requisitos_clave: "Deve ter como alvo populações de jovens vulneráveis em regiões em desenvolvimento. Toda a contabilidade financeira e relatórios de progresso devem ser apresentados em inglês.",
      sectores_elegibles: [
        "Educação STEM para Jovens",
        "Alfabetização Digital Comunitária",
        "Plataformas E-learning de Habilidades Comportamentais"
      ],
      justificacion_high: "Excelente alinhamento com as metas de educação e equidade da UE. O orçamento e o setor coincidem de forma ideal.",
      justificacion_low: "É necessário maior foco na educação STEM e inclusão para cumprir os padrões da União Europeia."
    },
    fr: {
      titulo: "Subventions pour l'Éducation STEM et l'Égalité des Genres",
      entidad_otorgante: "Union Européenne (Grants.gov)",
      requisitos_clave: "Doit cibler les populations de jeunes vulnérables dans les régions en développement. Toute la comptabilité financière et les rapports d'étape doivent être soumis en anglais.",
      sectores_elegibles: [
        "Éducation STEM pour les Jeunes",
        "Alphabétisation Numérique Communautaire",
        "Plateformes E-learning de Compétences Douces"
      ],
      justificacion_high: "Excellent alignement avec les objectifs d'éducation et d'équité de l'UE. Le budget et le secteur correspondent parfaitement.",
      justificacion_low: "Un accent accru sur l'éducation STEM et l'inclusion est nécessaire pour répondre aux normes de l'Union Européenne."
    },
    de: {
      titulo: "Zuschüsse für MINT-Bildung und Geschlechtergerechtigkeit",
      entidad_otorgante: "Europäische Union (Grants.gov)",
      requisitos_clave: "Muss auf gefährdete Jugendpopulationen in Entwicklungsländern abzielen. Die gesamte Buchführung und Zwischenberichte müssen auf Englisch eingereicht werden.",
      sectores_elegibles: [
        "MINT-Bildung für Jugendliche",
        "Digitale Kompetenzförderung in Gemeinden",
        "E-Learning-Plattformen für Soft Skills"
      ],
      justificacion_high: "Hervorragende Abstimmung mit den Bildungs- und Gleichstellungszielen der EU. Budget und Sektor stimmen überein.",
      justificacion_low: "Ein stärkerer Fokus auf MINT-Bildung und Inklusion ist erforderlich, um die EU-Kriterien zu erfüllen."
    },
    it: {
      titulo: "Sovvenzioni per l'Educazione STEM e Parità di Genere",
      entidad_otorgante: "Unione Europea (Grants.gov)",
      requisitos_clave: "Deve rivolgersi a popolazioni giovanili vulnerabili nelle regioni in via di sviluppo. Tutta la contabilità finanziaria e i report di avanzamento devono essere presentati in inglese.",
      sectores_elegibles: [
        "Educazione STEM per i Giovani",
        "Alfabetizzazione Digitale Comunitaria",
        "Piattaforme E-learning per Soft Skills"
      ],
      justificacion_high: "Eccellente allineamento con gli obiettivi di istruzione ed equità dell'UE. Budget e settore corrispondono in modo ideale.",
      justificacion_low: "È necessario un maggiore focus sull'educazione STEM e sull'inclusione per soddisfare gli standard dell'Unione Europea."
    },
    zh: {
      titulo: "STEM教育与性别平等资助计划",
      entidad_otorgante: "欧盟 (Grants.gov)",
      requisitos_clave: "项目必须针对发展中国家及地区的弱势青年群体。所有财务会计账目和进度报告必须使用英文提交。",
      sectores_elegibles: [
        "青少年STEM教育",
        "社区数字化普及教育",
        "软实力提升在线学习平台"
      ],
      justificacion_high: "项目符合欧盟的教育与性别平等目标。预算方案与申报领域完全吻合。",
      justificacion_low: "需要更侧重于STEM教育和包容性，以符合欧盟的准入标准。"
    },
    ja: {
      titulo: "STEM教育およびジェンダー平等助成金",
      entidad_otorgante: "欧州連合 (Grants.gov)",
      requisitos_clave: "開発途上地域の脆弱な若者層を対象とすること。すべての財務会計および進捗報告書は英語で提出すること。",
      sectores_elegibles: [
        "若者向けSTEM教育",
        "地域デジタル・リテラシー",
        "ソフトスキル向上eラーニングプラットフォーム"
      ],
      justificacion_high: "EUの教育および平等目標と非常に高い整合性があります。予算と分野が抜群に適合しています。",
      justificacion_low: "EUの基準を満たすには、STEM教育や社会的包容力へのさらなる注力が必要です。"
    },
    ar: {
      titulo: "منح تعليم STEM والمساواة بين الجنسين",
      entidad_otorgante: "الاتحاد الأوروبي (Grants.gov)",
      requisitos_clave: "يجب أن يستهدف الفئات الشبابية الأكثر ضعفاً في المناطق النامية. يجب تقديم كافة التقارير المالية والتقدم باللغة الإنجليزية.",
      sectores_elegibles: [
        "تعليم STEM للشباب",
        "محو الأمية الرقمية المجتمعية",
        "منصات التعلم الإلكتروني للمهارات الناعمة"
      ],
      justificacion_high: "انسجام مميز مع أهداف الاتحاد الأوروبي للتعليم والمساواة. تتوافق الميزانية والقطاع تماماً.",
      justificacion_low: "يتطلب الأمر تركيزاً أكبر على تعليم STEM والدمج الاجتماعي لتلبية معايير الاتحاد الأوروبي."
    },
    ru: {
      titulo: "Гранты на образование STEM и гендерное равенство",
      entidad_otorgante: "Европейский Союз (Grants.gov)",
      requisitos_clave: "Проект должен быть ориентирован на уязвимые группы молодежи в развивающихся регионах. Отчетность ведется строго на английском языке.",
      sectores_elegibles: [
        "Образование STEM для молодежи",
        "Цифровая грамотность населения",
        "E-learning платформы для гибких навыков"
      ],
      justificacion_high: "Отличное соответствие целям ЕС в области инклюзивного образования. Проект идеально вписывается в лимиты финансирования.",
      justificacion_low: "Требуется более выраженный акцент на техническое образование и равенство для прохождения стандартов ЕС."
    }
  },
  c3: {
    es: {
      titulo: "Programa Nacional de Aceleración y Fomento Empresarial",
      entidad_otorgante: "Fondo Emprender SENA",
      requisitos_clave: "Emprendedores colombianos mayores de edad o empresas con menos de 12 meses de constitución mercantil. Requiere plan de negocio estructurado.",
      sectores_elegibles: [
        "Startups Tecnológicas en Fase Temprana",
        "Micro-apps y SaaS para PyMEs",
        "Comercio Electrónico y D2C",
        "Inteligencia Artificial Aplicada"
      ],
      justificacion_high: "Alineación total con las directrices de fomento empresarial del Fondo Emprender. Presupuesto dentro del rango admitido.",
      justificacion_low: "El proyecto requiere un plan de negocio enfocado en base tecnológica para calificar al Fondo Emprender."
    },
    en: {
      titulo: "National Entrepreneurial Acceleration and Development Program",
      entidad_otorgante: "SENA Fondo Emprender",
      requisitos_clave: "Colombian entrepreneurs of legal age or companies with less than 12 months of commercial constitution. Requires structured business plan.",
      sectores_elegibles: [
        "Early-Stage Tech Startups",
        "Micro-apps and SaaS for SMEs",
        "E-commerce and D2C",
        "Applied Artificial Intelligence"
      ],
      justificacion_high: "Total alignment with Fondo Emprender entrepreneurship guidelines. Budget within the allowed range.",
      justificacion_low: "The project requires a tech-focused business plan to qualify for Fondo Emprender."
    },
    pt: {
      titulo: "Programa Nacional de Aceleração e Fomento Empresarial",
      entidad_otorgante: "Fundo Emprender SENA",
      requisitos_clave: "Empreendedores colombianos maiores de idade ou empresas com menos de 12 meses de constituição comercial. Requer plano de negócios estruturado.",
      sectores_elegibles: [
        "Startups de Tecnologia em Estágio Inicial",
        "Micro-apps e SaaS para PMEs",
        "Comércio Eletrônico e D2C",
        "Inteligência Artificial Aplicada"
      ],
      justificacion_high: "Alinhamento total com as diretrizes de fomento do Fundo Emprender. Orçamento dentro da faixa permitida.",
      justificacion_low: "O projeto requer um plano de negócios com foco em tecnologia para se qualificar ao Fundo Emprender."
    },
    fr: {
      titulo: "Programme National d'Accélération et de Développement des Entreprises",
      entidad_otorgante: "Fonds Emprender SENA",
      requisitos_clave: "Entrepreneurs colombiens majeurs ou entreprises de moins de 12 mois de constitution commerciale. Requiert un plan d'affaires structuré.",
      sectores_elegibles: [
        "Startups Technologiques en Phase Initiale",
        "Micro-apps et SaaS pour les PME",
        "Commerce Électronique et D2C",
        "Intelligence Artificielle Appliquée"
      ],
      justificacion_high: "Alignement total avec les directives de promotion du Fondo Emprender. Budget dans la fourchette autorisée.",
      justificacion_low: "Le projet nécessite un plan d'affaires axé sur la technologie pour être éligible au Fondo Emprender."
    },
    de: {
      titulo: "Nationales Programm zur Unternehmensbeschleunigung und -förderung",
      entidad_otorgante: "SENA Fondo Emprender",
      requisitos_clave: "Volljährige kolumbianische Unternehmer oder Unternehmen mit einer Gründungsdauer von unter 12 Monaten. Erfordert strukturierten Businessplan.",
      sectores_elegibles: [
        "Tech-Startups in der Frühphase",
        "Micro-Apps und SaaS für KMU",
        "E-Commerce und D2C",
        "Angewandte Künstliche Intelligenz"
      ],
      justificacion_high: "Vollständige Übereinstimmung mit den Gründerrichtlinien des Fondo Emprender. Budget im zulässigen Bereich.",
      justificacion_low: "Das Projekt benötigt einen technologieorientierten Geschäftsplan, um sich für den Fondo Emprender zu qualifizieren."
    },
    it: {
      titulo: "Programma Nazionale di Accelerazione e Promozione Imprenditoriale",
      entidad_otorgante: "Fondo Emprender SENA",
      requisitos_clave: "Imprenditori colombiani maggiorenni o imprese con meno di 12 mesi di costituzione commerciale. Richiede un business plan strutturato.",
      sectores_elegibles: [
        "Startup Tecnologiche in Fase Iniziale",
        "Micro-app e SaaS per le PMI",
        "Commercio Elettronico e D2C",
        "Intelligenza Artificiale Applicata"
      ],
      justificacion_high: "Allineamento totale con le linee guida del Fondo Emprender. Budget all'interno della fascia consentita.",
      justificacion_low: "Il progetto richiede un business plan orientato alla tecnologia per essere idoneo al Fondo Emprender."
    },
    zh: {
      titulo: "国家企业加速与扶持计划",
      entidad_otorgante: "哥伦比亚SENA创业基金 (Fondo Emprender)",
      requisitos_clave: "哥伦比亚成年创业者或注册未满12个月的小微企业。需要提交系统化的商业计划书。",
      sectores_elegibles: [
        "早期科技初创企业",
        "中小企业微型应用及SaaS",
        "电子商务与D2C",
        "应用人工智能"
      ],
      justificacion_high: "完全符合SENA创业基金（Fondo Emprender）的扶持要求。预算在核准区间内。",
      justificacion_low: "项目需要制定侧重科技成果转化的商业计划，方可达到该基金的申报标准。"
    },
    ja: {
      titulo: "起業家育成・ビジネス加速国家プログラム",
      entidad_otorgante: "SENA起業家育成基金 (Fondo Emprender)",
      requisitos_clave: "成人したコロンビア人の起業家、または設立12ヶ月未満の新興企業。具体化された事業計画書が必要。",
      sectores_elegibles: [
        "初期ステージのテックスタートアップ",
        "中小企業向けマイクロアプリ・SaaS",
        "EコマースとD2C",
        "応用人工知能（AI）"
      ],
      justificacion_high: "起業家育成基金の助成要件に完全に合致します。申請予算は上限以内です。",
      justificacion_low: "当基金に申請するには、テクノロジー中心の明確なビジネスモデル策定が必要です。"
    },
    ar: {
      titulo: "البرنامج الوطني لتسريع ودعم الأعمال",
      entidad_otorgante: "صندوق ريادة الأعمال الوطني (Fondo Emprender)",
      requisitos_clave: "رواد الأعمال الكولومبيون البالغون أو الشركات التي يقل عمرها التجاري عن 12 شهراً. يتطلب خطة عمل متكاملة.",
      sectores_elegibles: [
        "الشركات التكنولوجية الناشئة في المراحل المبكرة",
        "التطبيقات الصغيرة والبرمجيات للشركات الصغيرة",
        "التجارة الإلكترونية والبيع المباشر",
        "الذكاء الاصطناعي التطبيقي"
      ],
      justificacion_high: "توافق كامل مع معايير ريادة الأعمال الخاصة بصندوق Emprender. الميزانية مناسبة للغاية.",
      justificacion_low: "يحتاج المشروع إلى إعادة هيكلة خطة العمل التقنية ليتأهل للحصول على دعم الصندوق."
    },
    ru: {
      titulo: "Национальная программа ускорения бизнеса и предпринимательства",
      entidad_otorgante: "Фонд развития предпринимательства SENA",
      requisitos_clave: "Совершеннолетние колумбийские предприниматели или компании, зарегистрированные менее 12 месяцев назад. Обязателен детальный бизнес-план.",
      sectores_elegibles: [
        "Технологические стартапы ранней стадии",
        "Микро-приложения и SaaS для малого бизнеса",
        "Электронная коммерция и direct-to-consumer",
        "Прикладной искусственный интеллект"
      ],
      justificacion_high: "Абсолютная гармония с государственными требованиями Fondo Emprender. Бюджет укладывается в нормативы.",
      justificacion_low: "Для соответствия критериям отбора фонду необходим бизнес-план с технологической спецификой."
    }
  },
  c4: {
    es: {
      titulo: "Línea de Crédito de Desarrollo Rural Sostenible",
      entidad_otorgante: "Banco Interamericano de Desarrollo (BID)",
      requisitos_clave: "Requiere aval de viabilidad técnica y ambiental del ministerio sectorial. Tasa de interés blanda con período de gracia de 24 meses.",
      sectores_elegibles: [
        "Infraestructura Comunitaria Sostenible",
        "Energías Renovables",
        "Sistemas de Riego Automatizado"
      ],
      justificacion_high: "Proyecto de gran envergadura rural alineado con las metas del BID. Estructura financiera viable para esta línea.",
      justificacion_low: "Se requiere un componente de impacto ambiental y rural más fuerte para acceder a esta línea de crédito del BID."
    },
    en: {
      titulo: "Sustainable Rural Development Credit Line",
      entidad_otorgante: "Inter-American Development Bank (IDB)",
      requisitos_clave: "Requires technical and environmental feasibility endorsement from the sector ministry. Soft interest rate with a 24-month grace period.",
      sectores_elegibles: [
        "Sustainable Community Infrastructure",
        "Renewable Energies",
        "Automated Irrigation Systems"
      ],
      justificacion_high: "Large-scale rural project highly aligned with IDB goals. Financial structure is solid and eligible.",
      justificacion_low: "A stronger environmental and rural impact component is required to access this credit line."
    },
    pt: {
      titulo: "Linha de Crédito para Desenvolvimento Rural Sustentável",
      entidad_otorgante: "Banco Interamericano de Desenvolvimento (BID)",
      requisitos_clave: "Requer aval de viabilidade técnica e ambiental do ministério setorial. Taxa de juros subsidiada com período de graça de 24 meses.",
      sectores_elegibles: [
        "Infraestrutura Comunitária Sustentável",
        "Energias Renováveis",
        "Sistemas de Irrigação Automatizados"
      ],
      justificacion_high: "Projeto de grande porte rural alinhado com as metas do BID. Estrutura financeira viável para esta linha.",
      justificacion_low: "É necessário um componente de impacto ambiental e rural mais forte para acessar esta linha de crédito."
    },
    fr: {
      titulo: "Ligne de Crédit pour le Développement Rural Durable",
      entidad_otorgante: "Banque Interaméricaine de Développement (BID)",
      requisitos_clave: "Requiert l'aval de faisabilité technique et environnementale du ministère sectoriel. Taux d'intérêt préférentiel avec différé de remboursement de 24 mois.",
      sectores_elegibles: [
        "Infrastructures Communautaires Durables",
        "Énergies Renouvelables",
        "Systèmes d'Irrigation Automatisés"
      ],
      justificacion_high: "Projet rural d'envergure aligné avec les objectifs de la BID. Structure financière viable pour cette ligne.",
      justificacion_low: "Une composante d'impact environnemental et rural plus solide est requise pour accéder à cette ligne de crédit."
    },
    de: {
      titulo: "Kreditlinie für nachhaltige ländliche Entwicklung",
      entidad_otorgante: "Interamerikanische Entwicklungsbank (IDB)",
      requisitos_clave: "Erfordert die Bestätigung der technischen und ökologischen Machbarkeit durch das zuständige Ministerium. Zinsgünstiges Darlehen mit 24 Monaten Tilgungsfreizeit.",
      sectores_elegibles: [
        "Nachhaltige kommunale Infrastruktur",
        "Erneuerbare Energien",
        "Automatisierte Bewässerungssysteme"
      ],
      justificacion_high: "Großes ländliches Projekt, das sehr gut auf die Ziele der IDB abgestimmt ist. Finanzierungsstruktur ist solide.",
      justificacion_low: "Ein stärkerer Umwelt- und ländlicher Wirkungsgrad ist erforderlich, um Zugang zu dieser Kreditlinie zu erhalten."
    },
    it: {
      titulo: "Linea di Credito per lo Sviluppo Rurale Sostenibile",
      entidad_otorgante: "Banca Interamericana di Sviluppo (BID)",
      requisitos_clave: "Richiede il benestare di fattibilità tecnica e ambientale del ministero di settore. Tasso di interesse agevolato con periodo di grazia di 24 mesi.",
      sectores_elegibles: [
        "Infrastrutture Comunitarie Sostenibili",
        "Energie Rinnovabili",
        "Sistemi di Irrigazione Automatizzati"
      ],
      justificacion_high: "Progetto rurale ad alto impatto in sintonia con gli obiettivi della BID. Struttura finanziaria idonea per questa linea.",
      justificacion_low: "È richiesto un maggiore impatto ambientale e rurale per accedere a questa linea di credito della BID."
    },
    zh: {
      titulo: "可持续农业与农村发展信贷资金",
      entidad_otorgante: "美洲开发银行 (IDB)",
      requisitos_clave: "需要获得相关政府部门的技術和环境可行性批复。提供优惠低息利率及24个月的还款宽限期。",
      sectores_elegibles: [
        "可持续社区基础设施",
        "可再生能源应用",
        "自动化灌溉系统"
      ],
      justificacion_high: "契合美洲开发银行（IDB）乡村振兴战略的重大项目。融资架构合理可行。",
      justificacion_low: "需增加对环境及农村发展的带动作用，方能符合该贷款额度的发放要求。"
    },
    ja: {
      titulo: "持続可能な農村開発融資ライン",
      entidad_otorgante: "米州開発銀行 (IDB)",
      requisitos_clave: "関係省庁による技術的・環境的実現可能性の承認が必要。24ヶ月の据置期間を伴う低利融資。",
      sectores_elegibles: [
        "持続可能な地域インフラ",
        "再生可能エネルギー",
        "自動灌漑システム"
      ],
      justificacion_high: "IDBの融資基準に適合した大規模な農村プロジェクトです。財務スキームは十分に妥当です。",
      justificacion_low: "本融資ラインの対象となるには、より高い環境保護効果や地域貢献性が求められます。"
    },
    ar: {
      titulo: "خط ائتمان التنمية الريفية المستدامة",
      entidad_otorgante: "بنك التنمية للبلدان الأمريكية (IDB)",
      requisitos_clave: "يتطلب موافقة فنية وبيئية من الوزارة القطاعية المعنية. سعر فائدة ميسر مع فترة سماح 24 شهراً.",
      sectores_elegibles: [
        "البنية التحتية المجتمعية المستدامة",
        "الطاقة المتجددة",
        "أنظمة الري الآلية"
      ],
      justificacion_high: "مشروع ريفي ضخم يتوافق تماماً مع أهداف البنك. الهيكلية التمويلية قوية ومجدية.",
      justificacion_low: "يحتاج المشروع إلى إبراز الجوانب البيئية والتأثير الريفي بشكل أقوى للتأهل للقرض."
    },
    ru: {
      titulo: "Кредитная линия для устойчивого сельского развития",
      entidad_otorgante: "Межамериканский банк развития (IDB)",
      requisitos_clave: "Необходимо заключение профильного министерства о технической и экологической осуществимости. Льготная ставка с 24-месячным льготным периодом.",
      sectores_elegibles: [
        "Устойчивая коммунальная инфраструктура",
        "Возобновляемые источники энергии",
        "Автоматические системы орошения"
      ],
      justificacion_high: "Масштабный сельскохозяйственный проект, отвечающий критериям IDB. Схема финансирования абсолютно жизнеспособна.",
      justificacion_low: "Требуется усиление экологического компонента для одобрения данной кредитной линии."
    }
  },
  c5: {
    es: {
      titulo: "Fondo de Capital de Riesgo para Salud Digital y Bienestar",
      entidad_otorgante: "Citibank Global Venture Fund",
      requisitos_clave: "Soluciones digitales escalables con MVP ya validado en el mercado. Requiere participación accionaria minoritaria (10-15%) y puesto en la junta directiva.",
      sectores_elegibles: [
        "Plataformas de Apoyo Psicológico Digital",
        "Salud y Seguridad en el Trabajo (SST)",
        "Prevención de Desgaste Laboral (Burnout)"
      ],
      justificacion_high: "Solución escalable e idónea para la cartera de salud digital de Citibank. Gran potencial de retorno de inversión.",
      justificacion_low: "El proyecto requiere madurez comercial y un MVP funcional y validado para calificar a este fondo de capital de riesgo."
    },
    en: {
      titulo: "Venture Capital Fund for Digital Health and Wellness",
      entidad_otorgante: "Citibank Global Venture Fund",
      requisitos_clave: "Scalable digital solutions with MVP already validated in the market. Minority equity stake (10-15%) and board seat required.",
      sectores_elegibles: [
        "Digital Psychological Support Platforms",
        "Occupational Health and Safety (OHS)",
        "Burnout Prevention"
      ],
      justificacion_high: "Highly scalable solution aligned with Citibank's digital health portfolio. Great return potential.",
      justificacion_low: "The project requires commercial maturity and a validated MVP to qualify for venture capital."
    },
    pt: {
      titulo: "Fundo de Capital de Risco para Saúde Digital e Bem-Estar",
      entidad_otorgante: "Citibank Global Venture Fund",
      requisitos_clave: "Soluções digitais escaláveis com MVP já validado no mercado. Requer participação acionária minoritária (10-15%) e assento no conselho.",
      sectores_elegibles: [
        "Plataformas de Apoio Psicológico Digital",
        "Saúde e Segurança no Trabalho (SST)",
        "Prevenção de Desgaste Laboral (Burnout)"
      ],
      justificacion_high: "Solução escalável e ideal para o portfólio de saúde digital do Citibank. Grande potencial de retorno de investimento.",
      justificacion_low: "O projeto requer maturidade comercial e um MVP funcional para se qualificar ao capital de risco."
    },
    fr: {
      titulo: "Fonds de Capital Risque pour la Santé Digitale et le Bien-être",
      entidad_otorgante: "Citibank Global Venture Fund",
      requisitos_clave: "Solutions numériques évolutives avec MVP déjà validé sur le marché. Prise de participation minoritaire (10-15%) et siège au conseil d'administration requis.",
      sectores_elegibles: [
        "Plateformes de Soutien Psychologique Numérique",
        "Santé et Sécurité au Travail (SST)",
        "Prévention du Burnout Professionnel"
      ],
      justificacion_high: "Solution évolutive et idéale pour le portefeuille de santé numérique de Citibank. Fort potentiel de retour.",
      justificacion_low: "Le projet nécessite une plus grande maturité commerciale et un MVP validé pour être éligible au capital-risque."
    },
    de: {
      titulo: "Risikokapitalfonds für digitale Gesundheit und Wohlbefinden",
      entidad_otorgante: "Citibank Global Venture Fund",
      requisitos_clave: "Skalierbare digitale Lösungen mit bereits am Markt validiertem MVP. Minderheitsbeteiligung (10-15%) und Sitz im Aufsichtsrat erforderlich.",
      sectores_elegibles: [
        "Digitale Plattformen für psychologische Unterstützung",
        "Arbeitssicherheit und Gesundheitsschutz",
        "Burnout-Prävention"
      ],
      justificacion_high: "Skalierbare und erstklassige Lösung für das Digital-Health-Portfolio der Citibank. Hohes Renditepotential.",
      justificacion_low: "Das Projekt benötigt Markt-Reife und ein validiertes MVP, um für Risikokapital infrage zu kommen."
    },
    it: {
      titulo: "Fondo di Capitale di Rischio per la Salute Digitale e il Benessere",
      entidad_otorgante: "Citibank Global Venture Fund",
      requisitos_clave: "Soluzioni digitali scalabili con MVP già validato sul mercato. Richiede partecipazione azionaria di minoranza (10-15%) e posto nel consiglio di amministrazione.",
      sectores_elegibles: [
        "Piattaforme di Supporto Psicologico Digitale",
        "Salute e Sicurezza sul Lavoro (SST)",
        "Prevenzione del Burnout"
      ],
      justificacion_high: "Soluzione scalabile e ideale per il portafoglio di salute digitale di Citibank. Ottimo potenziale di rendimento finanziario.",
      justificacion_low: "Il progetto richiede maturità commerciale e un MVP convalidato per accedere al capitale di rischio di Citibank."
    },
    zh: {
      titulo: "数字医疗与健康风险投资基金",
      entidad_otorgante: "花旗集团全球风险投资基金 (Citibank)",
      requisitos_clave: "具备已通过市场验证的可扩展数字医疗解决方案及最小可行性产品（MVP）。需要提供10-15%的少数股权并获得董事会席位。",
      sectores_elegibles: [
        "数字化心理健康咨询平台",
        "职业健康与安全系统 (SST)",
        "职场倦怠 (Burnout) 预防与干预"
      ],
      justificacion_high: "高成长性解决方案，完美融入花旗数字医疗投资版图。具有优秀的ROI潜力。",
      justificacion_low: "项目需要更明确的市场表现和已验证的MVP产品，方能符合风险投资的门槛。"
    },
    ja: {
      titulo: "デジタルヘルス＆ウェルネス・ベンチャーキャピタルファンド",
      entidad_otorgante: "シティバンク・グローバル・ベンチャーファンド",
      requisitos_clave: "市場で検証済みのMVPを有するスケーラブルなデジタルソリューション。少数株式（10〜15%）の譲渡と取締役会席が必要。",
      sectores_elegibles: [
        "デジタルメンタルヘルスケアプラットフォーム",
        "労働安全衛生管理システム",
        "バーンアウト（燃え尽き症候群）予防策"
      ],
      justificacion_high: "シティバンクのデジタルヘルスポートフォリオに最適な事業であり、高い投資リターンが期待できます。",
      justificacion_low: "当ファンドから資金調達するには、より高い商業的成熟度と動作するMVPの実証が必要です。"
    },
    ar: {
      titulo: "صندوق رأس المال الاستثماري للصحة الرقمية والرفاهية",
      entidad_otorgante: "صندوق سيتي بنك الاستثماري العالمي",
      requisitos_clave: "حلول رقمية قابلة للتوسع مع منتج MVP تم التحقق من نجاحه في السوق. يتطلب حصة أقلية (10-15%) ومقعداً بمجلس الإدارة.",
      sectores_elegibles: [
        "منصات الدعم النفسي الرقمية",
        "الصحة والسلامة المهنية (SST)",
        "الوقاية من الاحتراق الوظيفي"
      ],
      justificacion_high: "حل تكنولوجي متميز وقابل للتوسع ومثالي لمحفظة سيتي بنك الصحية. إمكانيات عائد ممتازة.",
      justificacion_low: "يحتاج المشروع إلى مستوى أعلى من النضوج التجاري ومنتج حقيقي بالحد الأدنى ليحصل على التمويل الاستثماري."
    },
    ru: {
      titulo: "Венчурный фонд цифрового здравоохранения и благополучия",
      entidad_otorgante: "Глобальный венчурный фонд Citibank",
      requisitos_clave: "Масштабируемые цифровые решения с валидированным на рынке MVP. Требуется миноритарная доля (10–15%) и место в совете директоров.",
      sectores_elegibles: [
        "Цифровые платформы психологической поддержки",
        "Охрана труда и производственная безопасность",
        "Профилактика профессионального выгорания"
      ],
      justificacion_high: "Масштабируемый продукт с высокой коммерческой ценностью для портфеля здравоохранения Citibank. Отличный потенциал.",
      justificacion_low: "Для венчурного финансирования проекту требуется коммерческая зрелость и готовый к эксплуатации прототип."
    }
  }
};
