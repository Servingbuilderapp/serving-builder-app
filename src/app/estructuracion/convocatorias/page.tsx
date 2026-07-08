'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { 
  Loader2, Award, CheckCircle2, Copy, Globe, Filter, TrendingUp, Calendar, ArrowRight, ShieldCheck
} from 'lucide-react';

// DICCIONARIO DE TRADUCCIONES PARA LOS 10 IDIOMAS DE SERVING
const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    title: "Marketplace de Subvenciones",
    subtitle: "Emparejamiento inteligente de iniciativas con convocatorias nacionales e internacionales.",
    badge: "Ecosistema de Fomento & Fondos Globales",
    projectLabel: "Iniciativa Seleccionada",
    budgetLabel: "Presupuesto de Proyecto",
    languageLabel: "Idioma",
    closingDate: "Fecha Límite",
    maxFunding: "Financiamiento Máximo",
    eligibleSectors: "Sectores Elegibles",
    keyRequirements: "Requisitos Clave",
    scoreLabel: "Score de Compatibilidad",
    justificationLabel: "Análisis de Justificación",
    prePostulateBtn: "Pre-postular Proyecto",
    noConvocatorias: "No se encontraron convocatorias elegibles.",
    loadingMatch: "El Agente de Emparejamiento está analizando variables del proyecto, presupuesto y alineación ODS...",
    modalTitle: "Borrador de Postulación",
    modalSubtitle: "Asistente de Postulación Global",
    modalClose: "Cerrar",
    modalCopy: "Copiar Texto",
    modalCopied: "¡Copiado!",
    complianceTitle: "Certificación de Cumplimiento Técnico",
    complianceText: "El borrador ha sido validado por el supervisor de cumplimiento. Se bloqueó el uso de fondos de anticipo y se estructuró bajo el concepto estricto de Honorarios de Estructuración de Serving.",
    complianceCorrection: "Modificador Aplicado: Términos prohibidos corregidos en vivo",
    syncText: "Sincronización Realizada: Este trámite se ha registrado en estado 'Postulado' y ya es visible en tiempo real en la consola de la Presidencia.",
    step1: "1. Analizando el encaje de la Nota de Concepto...",
    step2: "2. Redactando Carta de Intención en idioma nativo del fondo...",
    step3: "3. Ejecutando Agente Supervisor de Cumplimiento (Verificando términos prohibidos)...",
    fundingType_subvencion: "subvención",
    fundingType_fomento: "fomento",
    fundingType_credito: "crédito",
    fundingType_capital_riesgo: "capital riesgo",
    selectProject: "Seleccione Iniciativa",
    fundedBy: "Financiado por"
  },
  en: {
    title: "Grants & Subsidies Marketplace",
    subtitle: "Smart matchmaking of initiatives with national and international funding opportunities.",
    badge: "Promotion & Global Funds Ecosystem",
    projectLabel: "Selected Initiative",
    budgetLabel: "Project Budget",
    languageLabel: "Language",
    closingDate: "Deadline",
    maxFunding: "Maximum Funding",
    eligibleSectors: "Eligible Sectors",
    keyRequirements: "Key Requirements",
    scoreLabel: "Compatibility Score",
    justificationLabel: "Justification Analysis",
    prePostulateBtn: "Pre-apply Project",
    noConvocatorias: "No eligible calls for proposals were found.",
    loadingMatch: "The Matchmaking Agent is analyzing project variables, budget, and SDG alignment...",
    modalTitle: "Draft Proposal",
    modalSubtitle: "Global Application Assistant",
    modalClose: "Close",
    modalCopy: "Copy Text",
    modalCopied: "Copied!",
    complianceTitle: "Technical Compliance Certification",
    complianceText: "The draft has been validated by the compliance supervisor. The use of advance funds ('anticipo') was blocked and structured strictly under the concept of Serving Structuring Fees.",
    complianceCorrection: "Modifier Applied: Forbidden terms corrected in real-time",
    syncText: "Synchronization Complete: This process has been registered in 'Postulado' state and is visible in real-time on the Presidencia dashboard.",
    step1: "1. Analyzing the Concept Note fit...",
    step2: "2. Drafting the Letter of Intent in the native language of the fund...",
    step3: "3. Executing Compliance Supervisor (Verifying forbidden terms)...",
    fundingType_subvencion: "grant",
    fundingType_fomento: "development",
    fundingType_credito: "credit",
    fundingType_capital_riesgo: "venture capital",
    selectProject: "Select Initiative",
    fundedBy: "Funded by"
  },
  pt: {
    title: "Marketplace de Subsídios",
    subtitle: "Emparelhamento inteligente de iniciativas com oportunidades de financiamento nacionais e internacionais.",
    badge: "Ecossistema de Promoção e Fundos Globais",
    projectLabel: "Iniciativa Selecionada",
    budgetLabel: "Orçamento do Projeto",
    languageLabel: "Idioma",
    closingDate: "Prazo Limite",
    maxFunding: "Financiamento Máximo",
    eligibleSectors: "Setores Elegíveis",
    keyRequirements: "Requisitos Chave",
    scoreLabel: "Pontuação de Compatibilidade",
    justificationLabel: "Análise de Justificativa",
    prePostulateBtn: "Pré-postular Projeto",
    noConvocatorias: "Nenhuma convocatória elegível foi encontrada.",
    loadingMatch: "O Agente de Emparelhamento está analisando variáveis do projeto, orçamento e alinhamento dos ODS...",
    modalTitle: "Rascunho de Proposta",
    modalSubtitle: "Assistente de Candidatura Global",
    modalClose: "Fechar",
    modalCopy: "Copiar Texto",
    modalCopied: "Copiado!",
    complianceTitle: "Certificação de Conformidade Técnica",
    complianceText: "O rascunho foi validado pelo supervisor de conformidade. O uso de adiantamento ('anticipo') foi bloqueado e estruturado sob os Honorários de Estruturação da Serving.",
    complianceCorrection: "Modificador Aplicado: Termos proibidos corrigidos em tempo real",
    syncText: "Sincronização Concluída: Este processo foi registrado no estado 'Postulado' e está visível no painel da Presidência.",
    step1: "1. Analisando o ajuste da Nota de Conceito...",
    step2: "2. Redigindo a Carta de Intenção no idioma nativo do fundo...",
    step3: "3. Executando Supervisor de Conformidade (Verificando termos proibidos)...",
    fundingType_subvencion: "subsídio",
    fundingType_fomento: "fomento",
    fundingType_credito: "crédito",
    fundingType_capital_riesgo: "capital de risco",
    selectProject: "Selecionar Iniciativa",
    fundedBy: "Financiado por"
  },
  fr: {
    title: "Plateforme de Subventions",
    subtitle: "Mise en correspondance intelligente des projets avec les opportunités de financement nationales et internationales.",
    badge: "Écosystème de Promotion et de Fonds Globaux",
    projectLabel: "Projet Sélectionné",
    budgetLabel: "Budget du Projet",
    languageLabel: "Langue",
    closingDate: "Date Limite",
    maxFunding: "Financement Maximum",
    eligibleSectors: "Secteurs Éligibles",
    keyRequirements: "Exigences Clés",
    scoreLabel: "Score de Compatibilité",
    justificationLabel: "Analyse de Justification",
    prePostulateBtn: "Pré-postuler le Projet",
    noConvocatorias: "Aucun appel à projets éligible n'a été trouvé.",
    loadingMatch: "L'agent de mise en correspondance analyse les variables du projet, le budget et l'alignement sur les ODS...",
    modalTitle: "Brouillon de Proposition",
    modalSubtitle: "Assistant de Candidature Global",
    modalClose: "Fermer",
    modalCopy: "Copier le Texte",
    modalCopied: "Copié !",
    complianceTitle: "Certification de Conformité Technique",
    complianceText: "Le brouillon a été validé par le superviseur de conformité. L'utilisation d'acomptes ('anticipo') a été bloquée et structurée sous les Frais de Structuration de Serving.",
    complianceCorrection: "Modificateur Appliqué : Termes interdits corrigés en temps réel",
    syncText: "Synchronisation Réussie : Cette démarche a été enregistrée à l'état 'Postulado' et est visible sur le tableau de bord de la Présidence.",
    step1: "1. Analyse de la pertinence de la Note de Concept...",
    step2: "2. Rédaction de la Lettre d'Intention dans la langue native du fonds...",
    step3: "3. Exécution du Superviseur de Conformité (Vérification des termes interdits)...",
    fundingType_subvencion: "subvention",
    fundingType_fomento: "développement",
    fundingType_credito: "crédit",
    fundingType_capital_riesgo: "capital risque",
    selectProject: "Sélectionner un Projet",
    fundedBy: "Financé par"
  },
  de: {
    title: "Förderprogramm-Marktplatz",
    subtitle: "Intelligente Zuordnung von Projektinitiativen zu nationalen und internationalen Förderprogrammen.",
    badge: "Ökosystem für Förderung & Globale Fonds",
    projectLabel: "Ausgewähltes Projekt",
    budgetLabel: "Projektbudget",
    languageLabel: "Sprache",
    closingDate: "Bewerbungsfrist",
    maxFunding: "Maximale Förderung",
    eligibleSectors: "Förderfähige Sektoren",
    keyRequirements: "Schlüsselanforderungen",
    scoreLabel: "Kompatibilitäts-Score",
    justificationLabel: "Begründungs-Analyse",
    prePostulateBtn: "Projekt vorab einreichen",
    noConvocatorias: "Keine förderfähigen Ausschreibungen gefunden.",
    loadingMatch: "Der Matching-Agent analysiert Projektvariablen, Budget und SDG-Ausrichtung...",
    modalTitle: "Antragsentwurf",
    modalSubtitle: "Globaler Bewerbungs-Assistent",
    modalClose: "Schließen",
    modalCopy: "Text kopieren",
    modalCopied: "Kopiert!",
    complianceTitle: "Technische Compliance-Zertifizierung",
    complianceText: "Der Entwurf wurde vom Compliance-Beauftragten validiert. Die Verwendung von Vorschüssen ('anticipo') wurde blockiert und strikt unter Serving Strukturierungsgebühren erfasst.",
    complianceCorrection: "Korrektur Angewandt: Verbotene Begriffe in Echtzeit korrigiert",
    syncText: "Synchronisierung Abgeschlossen: Diese Bewerbung wurde im Status 'Postulado' erfasst und ist live im Dashboard der Präsidentschaft sichtbar.",
    step1: "1. Analyse der Passgenauigkeit des Konzeptpapiers...",
    step2: "2. Verfassen des Absichtserklärungsentwurfs in der Landessprache des Fonds...",
    step3: "3. Ausführen der Compliance-Prüfung (Überprüfung verbotener Begriffe)...",
    fundingType_subvencion: "Zuschuss",
    fundingType_fomento: "Förderung",
    fundingType_credito: "Kredit",
    fundingType_capital_riesgo: "Risikokapital",
    selectProject: "Projekt auswählen",
    fundedBy: "Gefördert durch"
  },
  it: {
    title: "Marketplace delle Sovvenzioni",
    subtitle: "Abbinamento intelligente delle iniziative con opportunità di finanziamento nazionali e internazionali.",
    badge: "Ecosistema di Sostegno e Fondi Globali",
    projectLabel: "Iniziativa Selezionata",
    budgetLabel: "Budget di Progetto",
    languageLabel: "Lingua",
    closingDate: "Termine Ultimo",
    maxFunding: "Finanziamento Massimo",
    eligibleSectors: "Settori Ammissibili",
    keyRequirements: "Requisiti Chiave",
    scoreLabel: "Punteggio di Compatibilità",
    justificationLabel: "Analisi di Giustificazione",
    prePostulateBtn: "Pre-candidare Progetto",
    noConvocatorias: "Nessun bando ammissibile trovato.",
    loadingMatch: "L'Agente di Abbinamento sta analizzando le variabili del progetto, il budget e l'allineamento SDG...",
    modalTitle: "Bozza di Proposta",
    modalSubtitle: "Assistente di Candidatura Globale",
    modalClose: "Chiudi",
    modalCopy: "Copia Testo",
    modalCopied: "Copiato!",
    complianceTitle: "Certificazione di Conformità Tecnica",
    complianceText: "La bozza è stata validata dal supervisore di conformità. L'uso di anticipi ('anticipo') è stato bloccato e strutturato sotto le Commissioni di Strutturazione di Serving.",
    complianceCorrection: "Modifica Applicata: Termini vietati corretti in tempo reale",
    syncText: "Sincronizzazione Completata: La pratica è stata registrata nello stato 'Postulado' ed è visibile sulla dashboard di Presidenza.",
    step1: "1. Analisi della coerenza della Nota di Concetto...",
    step2: "2. Redazione della Lettera di Intenti nella lingua nativa del fondo...",
    step3: "3. Esecuzione del Supervisore di Conformità (Verifica dei termini vietati)...",
    fundingType_subvencion: "sovvenzione",
    fundingType_fomento: "sviluppo",
    fundingType_credito: "credito",
    fundingType_capital_riesgo: "capitale di rischio",
    selectProject: "Seleziona Progetto",
    fundedBy: "Finanziato da"
  },
  zh: {
    title: "补助金与基金对接市场",
    subtitle: "将项目倡议与国家及国际的资金扶持机会进行智能匹配与对接。",
    badge: "全球扶持基金生态系统",
    projectLabel: "已选项目倡议",
    budgetLabel: "项目预算",
    languageLabel: "语言选择",
    closingDate: "截止日期",
    maxFunding: "最高资助额度",
    eligibleSectors: "符合要求的行业领域",
    keyRequirements: "核心申报条件",
    scoreLabel: "匹配度得分",
    justificationLabel: "可行性评估分析",
    prePostulateBtn: "一键预申报项目",
    noConvocatorias: "未找到符合申报条件的基金项目。",
    loadingMatch: "智能对接助手正在分析项目特征、资金规模与联合国可持续发展目标（SDG）的对齐情况...",
    modalTitle: "项目意向书草案",
    modalSubtitle: "全球基金申报助手",
    modalClose: "关闭",
    modalCopy: "复制文本",
    modalCopied: "已复制！",
    complianceTitle: "合规技术审查认证",
    complianceText: "该申报文件已通过技术合规审核。系统自动阻断了涉及“预付款（anticipo）”的提法，并严格调整为Serving规范下的“项目规划与结构化费用”。",
    complianceCorrection: "合规修正应用：已实时纠正禁止使用的财务术语",
    syncText: "数据实时同步完成：该预申报操作已录入为“已申报（Postulado）”状态，并在总裁端看板实时同步更新。",
    step1: "1. 评估项目倡议书与申报指南的契合度...",
    step2: "2. 正在以基金官方语言编写申报意向书...",
    step3: "3. 启动合规控制算法（核查禁止性词汇）...",
    fundingType_subvencion: "无偿补助",
    fundingType_fomento: "产业扶持",
    fundingType_credito: "低息贷款",
    fundingType_capital_riesgo: "风险投资",
    selectProject: "选择申报项目",
    fundedBy: "资助机构"
  },
  ja: {
    title: "助成金・資金調達マーケットプレイス",
    subtitle: "プロジェクトと国内外の補助金・融資制度をAIで高度にマッチングします。",
    badge: "グローバル公的資金・ファンド推進エコシステム",
    projectLabel: "選択されたプロジェクト",
    budgetLabel: "要請予算",
    languageLabel: "表示言語",
    closingDate: "公募締切",
    maxFunding: "最大支援金額",
    eligibleSectors: "対象分野",
    keyRequirements: "主な申請要件",
    scoreLabel: "適合性スコア",
    justificationLabel: "適合理由の分析",
    prePostulateBtn: "事前申請を作成する",
    noConvocatorias: "該当する公募情報が見つかりませんでした。",
    loadingMatch: "マッチングエージェントがプロジェクト指標、予算規模、およびSDGsへの適合性を分析中...",
    modalTitle: "申請書草案",
    modalSubtitle: "グローバル資金調達アシスタント",
    modalClose: "閉じる",
    modalCopy: "テキストをコピー",
    modalCopied: "コピーしました！",
    complianceTitle: "技術適合性・コンプライアンス認証",
    complianceText: "草案はコンプライアンス管理監査をクリアしました。事前交付（anticipo）の項目は自動修正され、Servingの「プロジェクト組成手数料」として厳格に記載されました。",
    complianceCorrection: "適用された修正: 禁止財務用語をリアルタイムで修正しました",
    syncText: "リアルタイム同期完了: この申請ログは「申請中（Postulado）」として社長管理画面に即時反映されました。",
    step1: "1. コンセプトノートの適合性を分析中...",
    step2: "2. 対象ファンドの公用語で申請意向書を生成中...",
    step3: "3. コンpliance監視プログラムを実行中（禁止用語のチェック）...",
    fundingType_subvencion: "助成金",
    fundingType_fomento: "振興支援",
    fundingType_credito: "低利融資",
    fundingType_capital_riesgo: "ベンチャーキャピタル",
    selectProject: "プロジェクトを選択",
    fundedBy: "提供機関"
  },
  ar: {
    title: "سوق المنح والتمويل العالمي",
    subtitle: "المطابقة الذكية للمشاريع والمبادرات مع المنح والتمويلات الوطنية والدولية.",
    badge: "منظومة تنمية ودعم الصناديق العالمية",
    projectLabel: "المبادرة المحددة",
    budgetLabel: "ميزانية المشروع",
    languageLabel: "اللغة",
    closingDate: "تاريخ الإغلاق",
    maxFunding: "الحد الأقصى للتمويل",
    eligibleSectors: "القطاعات المؤهلة",
    keyRequirements: "الشروط الأساسية",
    scoreLabel: "نسبة المطابقة والتوافق",
    justificationLabel: "التحليل والتقرير الفني",
    prePostulateBtn: "تقديم مبدئي للمشروع",
    noConvocatorias: "لم يتم العثور على برامج تمويل متوافقة.",
    loadingMatch: "يقوم وكيل المطابقة الآن بتحليل متغيرات المشروع، والميزانية، ومدى التوافق مع أهداف التنمية المستدامة...",
    modalTitle: "مسودة خطاب التقديم",
    modalSubtitle: "مساعد التقديم الدولي للمنح",
    modalClose: "إغلاق",
    modalCopy: "نسخ النص",
    modalCopied: "تم النسخ!",
    complianceTitle: "شهادة الامتثال الفني",
    complianceText: "تمت مراجعة المسودة واعتمادها من قبل مراقب الامتثال. تم حظر استخدام مصطلح الدفعات المقدمة ('anticipo') وتنسيق الميزانية تحت مسمى رسوم هيكلة Serving الفنية.",
    complianceCorrection: "تعديل مطبق: تم تصحيح المصطلحات المحظورة تلقائيًا في الوقت الفعلي",
    syncText: "تمت المزامنة الفورية: تم تسجيل المعاملة في حالة 'مقدم' وهي تظهر حاليًا على لوحة تحكم الإدارة العليا.",
    step1: "1. تحليل مدى توافق المبادرة الفنية...",
    step2: "2. صياغة خطاب طلب التمويل باللغة الرسمية للجهة المانحة...",
    step3: "3. تشغيل نظام مراقبة الامتثال للتأكد من عدم استخدام الكلمات المحظورة...",
    fundingType_subvencion: "منحة",
    fundingType_fomento: "تمويل تنموي",
    fundingType_credito: "قرض ميسر",
    fundingType_capital_riesgo: "رأس مال استثماري",
    selectProject: "اختر المبادرة",
    fundedBy: "الجهة الممولة"
  },
  ru: {
    title: "Маркетплейс грантов и субсидий",
    subtitle: "Интеллектуальный подбор грантов и субсидий для национальных и международных проектов.",
    badge: "Экосистема продвижения и глобальных фондов",
    projectLabel: "Выбранный проект",
    budgetLabel: "Бюджет проекта",
    languageLabel: "Язык",
    closingDate: "Срок подачи",
    maxFunding: "Максимальное финансирование",
    eligibleSectors: "Целевые сектора",
    keyRequirements: "Ключевые требования",
    scoreLabel: "Показатель совместимости",
    justificationLabel: "Стратегический анализ",
    prePostulateBtn: "Подать предварительную заявку",
    noConvocatorias: "Подходящих грантовых программ не найдено.",
    loadingMatch: "Интеллектуальный агент анализирует спецификации проекта, бюджет и соответствие целям устойчивого развития (ЦУР)...",
    modalTitle: "Черновик заявки",
    modalSubtitle: "Глобальный ассистент подачи заявок",
    modalClose: "Закрыть",
    modalCopy: "Копировать текст",
    modalCopied: "Скопировано!",
    complianceTitle: "Сертификация технического соответствия",
    complianceText: "Черновик прошел проверку комплаенс-контроля. Использование термина 'аванс' ('anticipo') заблокировано, смета структурирована под Гонорар за структурирование Serving.",
    complianceCorrection: "Применено исправление: Запрещенные финансовые термины заменены в реальном времени",
    syncText: "Синхронизация завершена: Эта заявка зарегистрирована в статусе 'Postulado' и уже отображается в панели управления Президента.",
    step1: "1. Анализ соответствия концепции проекта...",
    step2: "2. Составление Письма о намерениях на официальном языке фонда...",
    step3: "3. Запуск контроля соответствия терминологии (проверка на отсутствие запрещенных фраз)...",
    fundingType_subvencion: "грант",
    fundingType_fomento: "развитие",
    fundingType_credito: "кредит",
    fundingType_capital_riesgo: "венчурный капитал",
    selectProject: "Выбрать инициативу",
    fundedBy: "Финансирует"
  }
};

// Lista de idiomas soportados
const IDIOMAS = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' },
  { code: 'ru', name: 'Русский' }
];

// Proyectos mock de fallback
const MOCK_PROYECTOS = [
  {
    id: 'p1',
    nombre_cliente: 'Carlos Mendoza',
    nombre_iniciativa: 'Reforestación Andina SAS',
    monto_solicitado_cop: 250000000,
    sector: 'Reforestación y Restauración Ecológica',
    vertical_asignada: 'Medio Ambiente',
    descripcion: 'Iniciativa de reforestación masiva en la zona andina con especies nativas y medición de impacto.'
  },
  {
    id: 'p2',
    nombre_cliente: 'Mariana Ortiz',
    nombre_iniciativa: 'Micro-SaaS Hub',
    monto_solicitado_cop: 80000000,
    sector: 'Micro-apps y SaaS para PyMEs',
    vertical_asignada: 'Emprendimiento/Empresas',
    descripcion: 'Plataforma para centralizar micro-servicios y software enfocado en la automatización de PyMEs locales.'
  },
  {
    id: 'p3',
    nombre_cliente: 'Jeff Diazgranados',
    nombre_iniciativa: 'Ganadería Regenerativa Pro',
    monto_solicitado_cop: 450000000,
    sector: 'Ganadería Tecnificada (Ganadería Pro)',
    vertical_asignada: 'Agro/Agroindustrial',
    descripcion: 'Proyecto de ganadería tecnificada y rotación inteligente de pastizales con enfoque regenerativo y ecológico.'
  },
  {
    id: 'p4',
    nombre_cliente: 'Yeison Arcia',
    nombre_iniciativa: 'Skin-Tech Dermacare',
    monto_solicitado_cop: 180000000,
    sector: 'Tecnología Dermocosmética (Skin-Tech)',
    vertical_asignada: 'Innovación/Tecnología',
    descripcion: 'Desarrollo de dispositivos portátiles con IA para diagnóstico y monitoreo de la salud dermatológica.'
  },
  {
    id: 'p5',
    nombre_cliente: 'Sofía Restrepo',
    nombre_iniciativa: 'Circular Pack S.A.S.',
    monto_solicitado_cop: 35000000,
    sector: 'Economía Circular y Gestión de Residuos',
    vertical_asignada: 'Medio Ambiente',
    descripcion: 'Optimización de empaques industriales biodegradables basados en residuos orgánicos locales.'
  },
  {
    id: 'p6',
    nombre_cliente: 'Alfonso Beltrán',
    nombre_iniciativa: 'SST Wellness Platform',
    monto_solicitado_cop: 120000000,
    sector: 'Salud y Seguridad en el Trabajo (SST)',
    vertical_asignada: 'Salud Mental',
    descripcion: 'Plataforma de soporte y bienestar mental corporativo para prevención de desgaste laboral.'
  }
];

const MOCK_PROYECTOS_FALLBACK = MOCK_PROYECTOS;

export default function ConvocatoriasMarketplace() {
  const supabase = createClient();
  const [proyectos, setProyectos] = useState<any[]>(MOCK_PROYECTOS_FALLBACK);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('p1');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  
  // Estados para Modal de Pre-postulación
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [prePostulating, setPrePostulating] = useState<boolean>(false);
  const [postulationStep, setPostulationStep] = useState<string>('');
  const [generatedDoc, setGeneratedDoc] = useState<string>('');
  const [copiado, setCopiado] = useState<boolean>(false);
  const [supervisorAlerta, setSupervisorAlerta] = useState<boolean>(false);
  const [expandedHudId, setExpandedHudId] = useState<string | null>(null);

  // Obtener traducción activa
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.es;

  // 1. Cargar proyectos de Supabase con fallback local
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('proyectos_clientes_serving')
          .select('id, nombre_cliente, nombre_iniciativa, monto_solicitado_cop, q3_sector, respuestas_fase2_json, vertical_asignada');

        if (!error && data && data.length > 0) {
          const formatted = data.map(item => ({
            id: item.id,
            nombre_cliente: item.nombre_cliente || 'Cliente',
            nombre_iniciativa: item.nombre_iniciativa || 'Iniciativa',
            monto_solicitado_cop: item.monto_solicitado_cop || 150000000,
            sector: item.q3_sector || 'General',
            vertical_asignada: item.vertical_asignada || 'Subvenciones',
            descripcion: item.respuestas_fase2_json?.q14_descripcion_detallada || 'Proyecto de Consultoría y Estructuración'
          }));
          setProyectos(formatted);
          setSelectedProjectId(formatted[0].id);
        }
      } catch (err) {
        console.warn("Fallo de red consultando proyectos. Usando lista local.");
      }
    };
    fetchProjects();
  }, [supabase]);

  // 2. Ejecutar el emparejamiento con el backend
  const runMatchmaking = async (projId: string, lang: string) => {
    setLoadingMatches(true);
    const activeProject = proyectos.find(p => p.id === projId) || proyectos[0];

    try {
      const response = await fetch('/api/convocatorias/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nota_concepto: {
            nombre_iniciativa: activeProject.nombre_iniciativa,
            sector: activeProject.sector,
            monto_solicitado_cop: activeProject.monto_solicitado_cop,
            descripcion: activeProject.descripcion
          },
          idioma: lang
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConvocatorias(data);
      } else {
        console.error("Matchmaking error status:", response.status);
      }
    } catch (err) {
      console.error("Fallo de red en matchmaking:", err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    if (proyectos.length > 0) {
      runMatchmaking(selectedProjectId, selectedLanguage);
    }
  }, [selectedProjectId, selectedLanguage, proyectos]);

  // 3. Ejecutar pre-postulación del proyecto
  const handlePrePostulate = async (conv: any) => {
    setSelectedConv(conv);
    setIsModalOpen(true);
    setPrePostulating(true);
    setGeneratedDoc('');
    setSupervisorAlerta(false);

    // Simular pasos del Agente de Inteligencia utilizando traducciones de idioma
    setPostulationStep(t.step1);
    await new Promise(r => setTimeout(r, 1200));

    setPostulationStep(t.step2);
    await new Promise(r => setTimeout(r, 1500));

    setPostulationStep(t.step3);
    await new Promise(r => setTimeout(r, 1200));

    const activeProject = proyectos.find(p => p.id === selectedProjectId) || proyectos[0];

    try {
      const res = await fetch('/api/convocatorias/pre-postulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proyectoId: activeProject.id,
          convocatoria: conv
        })
      });

      if (res.ok) {
        const result = await res.json();
        setGeneratedDoc(result.documento_redactado);
        setSupervisorAlerta(result.sanitized);

        // Registrar en local storage de inmediato para sincronizar con Presidencia
        const storedLogsStr = localStorage.getItem('presidencia_demo_logs');
        let currentLogs = [];
        if (storedLogsStr) {
          try {
            currentLogs = JSON.parse(storedLogsStr);
          } catch (e) {}
        }
        
        const newLog = {
          id: 'local_post_' + Date.now(),
          nombre_proyecto: activeProject.nombre_iniciativa,
          convocatoria_nombre: conv.titulo,
          estado: 'Postulado',
          vertical_asignada: activeProject.vertical_asignada || 'Subvenciones',
          canal_fondeo: conv.entidad_otorgante,
          created_at: new Date().toISOString()
        };

        localStorage.setItem('presidencia_demo_logs', JSON.stringify([newLog, ...currentLogs]));

        // Guardar también en un storage específico para convocatorias pre-postuladas
        const prePostulacionesStr = localStorage.getItem('user_pre_postulaciones');
        let prePostulaciones = [];
        if (prePostulacionesStr) {
          try {
            prePostulaciones = JSON.parse(prePostulacionesStr);
          } catch (e) {}
        }
        localStorage.setItem('user_pre_postulaciones', JSON.stringify([
          { proyectoId: activeProject.id, convocatoriaId: conv.id, fecha: new Date().toISOString() },
          ...prePostulaciones
        ]));

      } else {
        setGeneratedDoc('Error in document generation.');
      }
    } catch (err) {
      console.error(err);
      setGeneratedDoc('Connection error.');
    } finally {
      setPrePostulating(false);
      setPostulationStep('');
    }
  };

  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(generatedDoc);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue/10 border border-brand-blue/30 text-cyan-400 text-[10px] uppercase font-black tracking-widest rounded-full mb-3 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <Award className="w-3.5 h-3.5 animate-pulse" /> {t.badge}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">
            {(t.title || '').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-400 glow-text-orange">{(t.title || '').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-gray-400 font-medium mt-1">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Proyecto */}
          <div className="flex items-center gap-2 bg-[#0C1220]/80 px-3 py-1.5 rounded-lg border border-white/10">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-300 uppercase tracking-wider outline-none cursor-pointer"
            >
              {proyectos.map((proj) => (
                <option key={proj.id} value={proj.id} className="bg-gray-900 text-white font-semibold">
                  {proj.nombre_iniciativa.length > 25 ? proj.nombre_iniciativa.substring(0, 25) + '...' : proj.nombre_iniciativa}
                </option>
              ))}
            </select>
          </div>
          
          {/* Selector de Idioma */}
          <div className="flex items-center gap-2 bg-[#0C1220]/80 px-3 py-1.5 rounded-lg border border-white/10">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-xs font-bold text-cyan-400 uppercase tracking-wider outline-none cursor-pointer"
            >
              {IDIOMAS.map((lang: { code: string; name: string }) => (
                <option key={lang.code} value={lang.code} className="bg-gray-900 text-white font-semibold">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cargando Matchmaking */}
      {loadingMatches ? (
        <div className="h-[400px] w-full flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-brand-blue glow-blue" />
          <p className="text-xs font-black uppercase text-gray-500 tracking-widest text-center max-w-md animate-pulse">
            {t.loadingMatch}
          </p>
        </div>
      ) : (
        <>
          {/* Nota de Concepto Activa HUD */}
          <GlassCard className="p-6 border-white/10 bg-[#0C1220]/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">{t.projectLabel}</span>
                <h2 className="text-lg font-black text-white uppercase italic tracking-wider mt-0.5">
                  {proyectos.find(p => p.id === selectedProjectId)?.nombre_iniciativa}
                </h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-2xl">
                  {proyectos.find(p => p.id === selectedProjectId)?.descripcion}
                </p>
              </div>
              <div className="text-right bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl shrink-0">
                <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">{t.budgetLabel}</span>
                <span className="text-xl font-black text-brand-orange">
                  ${proyectos.find(p => p.id === selectedProjectId)?.monto_solicitado_cop.toLocaleString()} COP
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Listado de Convocatorias */}
          {convocatorias.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic">{t.noConvocatorias}</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {convocatorias.map((conv) => {
                const isHighMatch = conv.match_percentage >= 75;
                const isMedMatch = conv.match_percentage >= 50 && conv.match_percentage < 75;
                
                // Mapear el tipo de fondeo traducido
                const tTipo = t['fundingType_' + conv.tipo_fondeo] || conv.tipo_fondeo;

                return (
                  <GlassCard 
                    key={conv.id} 
                    className={`p-6 border-white/10 bg-[#0A0F1D]/85 hover:border-white/20 transition-all duration-300 relative overflow-hidden group`}
                  >
                    {/* Glow de compatibilidad */}
                    <div className={`absolute top-0 left-0 w-2.5 h-full ${isHighMatch ? 'bg-emerald-500' : isMedMatch ? 'bg-amber-500' : 'bg-rose-500'}`} />

                    <div className="flex flex-col lg:flex-row justify-between gap-6 pl-2.5">
                      {/* Información de Convocatoria */}
                      <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded font-black text-[9px] uppercase border
                            ${conv.tipo_fondeo === 'subvencion' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' :
                              conv.tipo_fondeo === 'fomento' ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/20' :
                              conv.tipo_fondeo === 'credito' ? 'bg-amber-950/40 text-brand-orange border-amber-500/20' : 'bg-pink-950/40 text-pink-400 border-pink-500/20'}`}
                          >
                            {tTipo}
                          </span>
                          <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded font-bold text-[9px] uppercase">
                            {t.languageLabel}: {conv.idioma_origen.toUpperCase()}
                          </span>
                          {conv.match_percentage < 90 && (
                            <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded font-black text-[9px] uppercase animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.15)] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                              {selectedLanguage === 'en' ? 'Optimization Recommended' : 'Optimización Recomendada'}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase italic tracking-wide">
                            {conv.titulo}
                          </h3>
                          <p className="text-xs text-gray-400 font-semibold mt-0.5">{t.fundedBy}: <b className="text-white">{conv.entidad_otorgante}</b></p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1 border-t border-white/5">
                          <div>
                            <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">{t.maxFunding}</span>
                            <span className="font-bold text-white">${conv.monto_maximo.toLocaleString()} COP</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">{t.closingDate}</span>
                            <span className="font-bold text-gray-300 flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-500" />
                              {new Date(conv.fecha_cierre).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">{t.eligibleSectors}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {conv.sectores_elegibles.map((sec: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-black/40 border border-white/5 rounded text-[10px] text-gray-400 font-medium">
                                  {sec}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-black/30 border border-white/5 rounded-lg text-xs">
                          <span className="font-bold text-gray-400 block mb-1">{t.keyRequirements}:</span>
                          <p className="text-gray-300 leading-relaxed">{conv.requisitos_clave}</p>
                        </div>
                      </div>

                      {/* Score y Justificación */}
                      <div className="lg:w-80 flex flex-col justify-between items-stretch bg-black/20 p-4 border border-white/5 rounded-xl shrink-0">
                        <div className="text-center pb-3 border-b border-white/5">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t.scoreLabel}</span>
                          <div className="flex items-center justify-center gap-2 mt-1.5">
                            <TrendingUp className={`w-5 h-5 ${isHighMatch ? 'text-emerald-400' : isMedMatch ? 'text-amber-500' : 'text-rose-500'}`} />
                            <span className={`text-3xl font-black tracking-tighter ${isHighMatch ? 'text-emerald-400' : isMedMatch ? 'text-amber-400' : 'text-rose-500'}`}>
                              {conv.match_percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="py-3 flex-1 flex flex-col justify-center">
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">{t.justificationLabel}:</span>
                          <p className="text-xs text-gray-300 italic leading-relaxed">
                            "{conv.justificacion_estrategica}"
                          </p>
                        </div>

                        <GlowButton
                          onClick={() => handlePrePostulate(conv)}
                          className="w-full bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-600 text-white font-bold py-2 text-xs uppercase tracking-wider mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {t.prePostulateBtn} <ArrowRight className="w-3.5 h-3.5" />
                        </GlowButton>

                        {conv.match_percentage < 90 && (
                          <button
                            onClick={() => setExpandedHudId(expandedHudId === conv.id ? null : conv.id)}
                            className="w-full mt-2 py-1.5 px-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-[10px] font-black text-amber-400 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            {expandedHudId === conv.id 
                              ? (selectedLanguage === 'en' ? 'Hide Optimization HUD' : 'Ocultar HUD de Optimización') 
                              : (selectedLanguage === 'en' ? 'View Optimization HUD' : 'Ver HUD de Optimización')}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* HUD de Optimización */}
                    {conv.match_percentage < 90 && expandedHudId === conv.id && (
                      <div className="mt-6 pt-6 border-t border-white/5 space-y-6 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                          
                          {/* Columna A: Gráfico Circular SVG Dinámico */}
                          <div className="w-full md:w-56 shrink-0 flex flex-col items-center justify-center p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl relative overflow-hidden group/hud">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover/hud:opacity-100 transition-opacity duration-500" />
                            
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">
                              {selectedLanguage === 'en' ? 'OPTIMIZATION SCORE' : 'HUD DE OPTIMIZACIÓN'}
                            </span>
                            
                            <div className="relative w-36 h-36 flex items-center justify-center">
                              {/* SVG Circle Graph */}
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <defs>
                                  <linearGradient id={`grad-${conv.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    {conv.match_percentage < 50 ? (
                                      <>
                                        <stop offset="0%" stopColor="#EF4444" />
                                        <stop offset="100%" stopColor="#F59E0B" />
                                      </>
                                    ) : (
                                      <>
                                        <stop offset="0%" stopColor="#F59E0B" />
                                        <stop offset="100%" stopColor="#06B6D4" />
                                      </>
                                    )}
                                  </linearGradient>
                                </defs>
                                {/* Background circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="rgba(255,255,255,0.03)"
                                  strokeWidth="8"
                                  fill="transparent"
                                />
                                {/* Progress circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke={`url(#grad-${conv.id})`}
                                  strokeWidth="8"
                                  fill="transparent"
                                  strokeDasharray="251.2"
                                  strokeDashoffset={251.2 - (251.2 * conv.match_percentage) / 100}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000 ease-out"
                                />
                              </svg>
                              
                              {/* Inner Text */}
                              <div className="absolute text-center">
                                <span className={`text-3xl font-black tracking-tight ${conv.match_percentage < 50 ? 'text-rose-500' : 'text-amber-400'}`}>
                                  {conv.match_percentage}%
                                </span>
                                <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                  {selectedLanguage === 'en' ? 'VIABILITY' : 'VIABILIDAD'}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 text-center">
                              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                {selectedLanguage === 'en' ? 'Target: >90%' : 'Objetivo: >90%'}
                              </span>
                            </div>
                          </div>

                          {/* Columna B: Panel de Sugerencias */}
                          <div className="flex-1 w-full space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                {selectedLanguage === 'en' ? 'RECOMMENDED STRATEGIC ADJUSTMENTS' : 'AJUSTES ESTRATÉGICOS RECOMENDADOS'}
                              </span>
                              <span className="text-[9px] font-bold text-gray-500">
                                {conv.sugerencias_optimizacion?.length || 0} {selectedLanguage === 'en' ? 'items pending' : 'acciones requeridas'}
                              </span>
                            </div>

                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              {selectedLanguage === 'en' 
                                ? "To raise this initiative's compatibility above 90% and secure the fund's specific technical guidelines, implement the following adjustments in your project matrix:"
                                : "Para elevar la compatibilidad de esta iniciativa por encima del 90% y asegurar el cumplimiento de las directrices técnicas del fondo, incorpore los siguientes ajustes en su matriz:"}
                            </p>

                            <div className="grid grid-cols-1 gap-2.5">
                              {conv.sugerencias_optimizacion?.map((sug: string, idx: number) => {
                                const boosts = ["+10%", "+8%", "+6%", "+5%", "+5%"];
                                const boost = boosts[idx] || "+5%";
                                const isCritical = idx === 0 || idx === 1;
                                
                                return (
                                  <div 
                                    key={idx}
                                    className="p-3 bg-white/[0.015] border border-white/[0.04] rounded-xl hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 flex items-start gap-3 group/item"
                                  >
                                    <div className={`mt-0.5 p-1 rounded-md ${isCritical ? 'bg-rose-500/10 text-rose-400' : 'bg-cyan-500/10 text-cyan-400'} shrink-0`}>
                                      {isCritical ? (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <p className="text-xs text-gray-300 leading-relaxed font-medium">
                                        {sug}
                                      </p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase shrink-0 tracking-wider ${
                                      isCritical 
                                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                                        : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                                    }`}>
                                      {boost}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal de Pre-postulación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-3xl p-6 md:p-8 border-cyan-500/20 max-h-[85vh] overflow-y-auto relative flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t.modalSubtitle}</span>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-wider mt-0.5">
                  {t.modalTitle}
                </h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">{t.fundedBy}: <b className="text-white">{selectedConv?.entidad_otorgante}</b></p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white font-bold text-sm bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all"
              >
                {t.modalClose}
              </button>
            </div>

            {/* Progreso del Agente IA */}
            {prePostulating ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-brand-blue glow-blue" />
                <p className="text-xs font-black uppercase text-gray-400 tracking-widest text-center animate-pulse">
                  {postulationStep}
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                
                {/* Alerta de Cumplimiento Técnico */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest">{t.complianceTitle}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {t.complianceText}
                    </p>
                    {supervisorAlerta && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-[9px] font-black text-brand-orange uppercase rounded">
                        {t.complianceCorrection}
                      </span>
                    )}
                  </div>
                </div>

                {/* Texto Documento Redactado */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400 uppercase tracking-wider">{t.modalTitle} (Carta de Intención / LOI)</span>
                    <button
                      onClick={copiarAlPortapapeles}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded font-bold text-gray-300 transition-all"
                    >
                      {copiado ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiado ? t.modalCopied : t.modalCopy}
                    </button>
                  </div>
                  
                  <textarea
                    readOnly
                    value={generatedDoc}
                    className="w-full h-80 bg-black/60 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-200 focus:outline-none leading-relaxed resize-none"
                  />
                </div>

                <div className="p-3 bg-cyan-950/10 border border-cyan-500/20 rounded-lg text-xs text-cyan-300 text-center">
                  💡 {t.syncText}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
