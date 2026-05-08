import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  BarChart3, Upload, Loader2, ArrowRight, X, FileText,
  Image as ImageIcon, Link2, CheckCircle2, XCircle,
  ExternalLink, PanelLeftOpen,
  Globe, ChevronDown, User, Star, Info,
  CodeXml, Rocket, Share2, CirclePlay, GraduationCap,
  RefreshCcw, Save, Trash2, Filter, MessageSquare, Send,
  Map, MapPin, PieChart, Table, LineChart, Target, GripHorizontal,
  BarChartHorizontal, Columns
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChartIcon } from './ChartIcons';

// --- Types ---

interface UploadedFile {
  name: string;
  mimeType: string;
  base64: string;
  previewUrl?: string;
  objectUrl?: string;
}

interface AmbiguityState {
  message: string;
  options: string[];
}

interface Proposal {
  title: string;
  intro: string;
  chartType: string;
  explanation: string;
}

type Locale = 'fr' | 'de';
type System = 'tamedia' | 'fuw';

const SYSTEM_CONFIG: Record<System, { label: string; primary: string; primaryDark: string; badgeBg: string }> = {
  tamedia: { label: 'Tamedia', primary: '#D3343F', primaryDark: '#A11B24', badgeBg: '#FBE9EB' },
  fuw:     { label: 'FuW',     primary: '#0E4F7B', primaryDark: '#072B43', badgeBg: '#E2EBF2' },
};

const TRANSLATIONS = {
  fr: {
    name: "Infographic Buddy",
    description: "Transforme n'importe quel jpg, pdf, données en un graphique Datawrapper.",
    language: "Français",
    generate: "Générer",
    reset: "Réinitialiser",
    inputLabel: "Données source (Text, JSON, CSV ou Lien)",
    inputPlaceholder: "Décris ce que tu veux visualiser, colle des données ou un lien url...",
    fileUploadLabel: "Téléchargement de fichier",
    fileUploadHint: "Glisse tes fichiers ici, clique pour télécharger ou colle une image (Ctrl+V)",
    fileUploadTypes: "PNG, JPG, PDF, XLS, CSV, TXT",
    generating: "Génération...",
    resultTitle: "Graphique généré",
    iframeLabel: "Code d'intégration (iframe)",
    copy: "Copier",
    previewTab: "Ouvrir l'aperçu",
    editDw: "Modifier dans Datawrapper",
    adjustMapHint: "Astuce: Pour les cartes (Locator maps), si elle paraît vide ou mal cadrée :\nA) Cliquez sur 'Modifier dans Datawrapper' (étape 2)\nB) Cliquez sur '(1) Ajouter des marqueurs et utiliser'\nC) Puis, sous la liste avec les différents points, cliquez sur le bouton 'Ajuster la vue aux marqueurs'.",
    quickGuide: "Guide Rapide",
    quickGuideText: "Ajoute des données ou un lien. L'IA analysera le contenu et créera automatiquement un graphique Datawrapper respectant les standards Tamedia.",
    quickGuideTip: "Astuce: Vous pouvez aussi uploader des captures d'écran de tableaux ou des PDF complexes.",
    apiStatus: "Statut API",
    active: "Actif",
    error: "Erreur",
    geminiStatus: "IA",
    ready: "Prêt",
    missing: "Manquant",
    invalid: "Invalide",
    placeholder: "Platzhalter",
    savePrompt: "Enregistrer ce prompt",
    bylinePlaceholder: "Tes initiales ou ton nom (pour Datawrapper)",
    bylineError: "Veuillez entrer vos initiales ou votre nom pour le crédit (Byline).",
    chartTypePlaceholder: "Type de graph. (auto)",
    autoPick: "Auto (AI picks)",
    ambiguityTitle: "Quel type de graphique souhaitez-vous créer ?",
    iterationTitle: "Ajustons cela",
    iterationPlaceholder: "Par exemple : change les couleurs en rouge et noir...",
    advancedMode: "Mode avancé",
    proposalsTitle: "Options d'analyse",
    selectProposal: "Créer ce graphique"
  },
  de: {
    name: "Infographic Buddy",
    description: "Verwandelt JPGs, PDFs, Daten in eine Datawrapper-Grafik.",
    language: "Deutsch",
    generate: "Generieren",
    reset: "Zurücksetzen",
    inputLabel: "Quelldaten (Text, JSON, CSV oder Link)",
    inputPlaceholder: "Beschreibe was du visualisieren willst, füge Daten oder einen Link ein...",
    fileUploadLabel: "Datei-Upload",
    fileUploadHint: "Dateien hierher ziehen, klicken zum Hochladen oder Bild einfügen (Strg+V)",
    fileUploadTypes: "PNG, JPG, PDF, XLS, CSV, TXT",
    generating: "Generierung...",
    resultTitle: "Generierte Grafik",
    iframeLabel: "Einbettungscode (iframe)",
    copy: "Kopieren",
    previewTab: "Vorschau öffnen",
    editDw: "In Datawrapper bearbeiten",
    adjustMapHint: "Tipp: Bei Locator Maps kann die Karte leer aussehen.\nA) Klicken Sie auf 'In Datawrapper bearbeiten'\nB) Klicken Sie auf '(1) Marker hinzufügen und verwenden'\nC) Dann, unter dem Fenster mit den verschiedenen Punkten, klicken Sie auf den Button 'Kartenausschnitt auf Marker einpassen'.",
    quickGuide: "Kurzanleitung",
    quickGuideText: "Fügen Sie Daten oder einen Link hinzu. Die KI analysiert den Inhalt und erstellt automatisch eine Datawrapper-Grafik nach Tamedia-Standards.",
    quickGuideTip: "Tipp: Sie können auch Screenshots von Tabellen oder komplexe PDFs hochladen.",
    apiStatus: "API-Status",
    active: "Aktiv",
    error: "Fehler",
    geminiStatus: "KI",
    ready: "Bereit",
    missing: "Fehlt",
    invalid: "Ungültig",
    placeholder: "Platzhalter",
    savePrompt: "Prompt speichern",
    bylinePlaceholder: "Dein Kürzel oder dein Name (für Datawrapper)",
    bylineError: "Bitte gib dein Kürzel oder deinen Namen für die Quellenangabe (Byline) an.",
    chartTypePlaceholder: "Grafiktyp (Auto)",
    autoPick: "Auto (AI picks)",
    ambiguityTitle: "Welchen Diagrammtyp möchten Sie erstellen?",
    iterationTitle: "Lass uns das korrigieren",
    iterationPlaceholder: "Z.B. Ändere die Farben zu Rot und Schwarz...",
    advancedMode: "Erweiterter Modus",
    proposalsTitle: "Analyse-Optionen",
    selectProposal: "Diese Option wählen"
  }
};

// --- Constants ---

const TAMEDIA_PALETTE = {
  blue: "#378EBD",
  petrol: "#2CA29F",
  green: "#479260",
  purple: "#A757A3",
  orange: "#E16D00",
  red: "#D3343F",
  beige: "#F8F7F4"
};

const CHART_TYPES_INFO = [
  { id: "d3-bars", label: "Bar Chart" },
  { id: "d3-bars-split", label: "Split Bars" },
  { id: "d3-bars-stacked", label: "Stacked Bars" },
  { id: "d3-bars-bullet", label: "Bullet Bars" },
  { id: "d3-bars-grouped", label: "Grouped Bars" },
  { id: "d3-dot-plot", label: "Dot Plot" },
  { id: "d3-range-plot", label: "Range Plot" },
  { id: "d3-arrow-plot", label: "Arrow Plot" },
  { id: "column-chart", label: "Column Chart" },
  { id: "grouped-column-chart", label: "Grouped Columns" },
  { id: "stacked-column-chart", label: "Stacked Columns" },
  { id: "d3-area", label: "Area Chart" },
  { id: "d3-lines", label: "Line Chart" },
  { id: "multiple-lines", label: "Multiple Lines" },
  { id: "d3-pies", label: "Pie Chart" },
  { id: "d3-donuts", label: "Donut Chart" },
  { id: "d3-multiple-pies", label: "Multiple Pies" },
  { id: "d3-multiple-donuts", label: "Multiple Donuts" },
  { id: "d3-scatter-plot", label: "Scatter Plot" },
  { id: "election-donut-chart", label: "Election Donut" },
  { id: "tables", label: "Table" },
  { id: "d3-maps-choropleth", label: "Choropleth Map" },
  { id: "d3-maps-symbols", label: "Symbol Map" },
  { id: "locator-map", label: "Locator Map" },
];

// --- Components ---

export default function App() {
  const [locale, setLocale] = useState<Locale>('de');
  const [system, setSystem] = useState<System>(() => {
    if (typeof window === 'undefined') return 'tamedia';
    const saved = window.localStorage.getItem('system');
    return saved === 'fuw' ? 'fuw' : 'tamedia';
  });
  const [text, setText] = useState('');
  const [authorByline, setAuthorByline] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ publicUrl: string; iframeCode: string; chartId: string; publishError?: string; csvData?: string; title?: string; chartType?: string } | null>(null);
  const [error, setError] = useState('');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isChartMenuOpen, setIsChartMenuOpen] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<string>('');
  const [iterationText, setIterationText] = useState("");
  const [isIterating, setIsIterating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [ambiguity, setAmbiguity] = useState<AmbiguityState | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[locale];
  const systemCfg = SYSTEM_CONFIG[system];

  useEffect(() => {
    window.localStorage.setItem('system', system);
    const root = document.documentElement;
    root.style.setProperty('--color-brand-primary', systemCfg.primary);
    root.style.setProperty('--color-brand-primary-dark', systemCfg.primaryDark);
  }, [system, systemCfg.primary, systemCfg.primaryDark]);

  const processFiles = async (fileList: File[]) => {
    const processedFiles = await Promise.all(fileList.map(async (file: File) => {
      return new Promise<UploadedFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const res = reader.result as string;
          let objectUrl;
          if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
             objectUrl = URL.createObjectURL(file);
          }
          resolve({
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            base64: res.split(',')[1],
            previewUrl: file.type.startsWith('image/') ? res : undefined,
            objectUrl
          });
        };
        reader.onerror = err => reject(err);
      });
    }));
    setFiles(prev => [...prev, ...processedFiles]);
  };

  useEffect(() => {
    fetch('/api/diagnostic')
      .then(r => r.json())
      .then(setApiStatus)
      .catch(console.error);

    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    
    const handlePaste = async (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      const pastedFiles: File[] = [];
      for (const item of clipboardItems) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
             const ext = file.type.split('/')[1] || 'png';
             const pastedFile = new File([file], `Pasted-Image-${Date.now()}.${ext}`, { type: file.type });
             pastedFiles.push(pastedFile);
          }
        }
      }

      if (pastedFiles.length > 0) {
        processFiles(pastedFiles);
      }
    };

    document.addEventListener('paste', handlePaste);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    await processFiles(Array.from(e.target.files));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateChart = async (isIteration = false, forcedChartType?: string, selectedProposal?: Proposal) => {
    setIsLoading(true);
    setError('');
    if (isIteration && !forcedChartType) setIsIterating(true);

    if (!authorByline.trim()) {
      setError(t.bylineError);
      setIsLoading(false);
      setIsIterating(false);
      return;
    }

    try {
      const parts: any[] = [];
      let processedText = text;

      if (processedText && processedText.trim().match(/^https?:\/\/[^\s]+$/)) {
        try {
          const linkRes = await fetch(processedText.trim());
          if (linkRes.ok) {
            const contentType = linkRes.headers.get("content-type") || "";
            if (contentType.includes("json") || contentType.includes("csv") || contentType.includes("text")) {
               const fetchedText = await linkRes.text();
               processedText = `Data from ${processedText.trim()}:\n\n${fetchedText.substring(0, 100000)}`;
            }
          }
        } catch (e) { /* Fallback to Gemini if CORS occurs */ }
      }

      if (processedText) parts.push({ text: `Context/Data: ${processedText}` });
      for (const f of files) {
         parts.push({ inlineData: { mimeType: f.mimeType, data: f.base64 } });
      }

      let wantsProposals = advancedMode && !selectedProposal && !isIteration;

      if (wantsProposals) {
         parts.push({ text: `GENERATE_ADVANCED_PROPOSALS` });
         if (forcedChartType) {
             parts.push({ text: `USER SELECTED THIS CHART TYPE: ${forcedChartType}. You MUST use this exact chartType for ALL 3 proposals, but offer different variations (different angles, titles, or ways to represent the data within that chart type). Do NOT output CSV data yet.` });
         }
      } else {
         if (forcedChartType) {
             parts.push({ text: `USER SELECTED THIS CHART TYPE: ${forcedChartType}. Do NOT return ambiguity, simply use this exact chartType and do your best to structure the data for it.` });
         }
      }

      if (selectedProposal) {
         parts.push({ text: `USER SELECTED THE FOLLOWING PROPOSAL:\nTitle: ${selectedProposal.title}\nIntro: ${selectedProposal.intro}\nChart Type: ${selectedProposal.chartType}\n\nPlease generate the exact CSV data for this proposal and output the final JSON.` });
      }

      // Context for iteration
      if (isIteration && result && !forcedChartType) {
         parts.push({ text: `PREVIOUS CHART TITLE: ${result.title}\nPREVIOUS CSV DATA:\n${result.csvData}` });
         parts.push({ text: `USER REQUEST FOR CHANGES: ${iterationText}` });
      }

      // Call Gemini for structuring
      const { GoogleGenAI, Type } = await import('@google/genai');
      
      const configRes = await fetch('/api/config');
      const configData = await configRes.json();
      const apiKey = configData.geminiApiKey;
      
      if (!apiKey) {
        throw new Error("Missing Gemini API Key. Please configure it in settings (click the ⚙️ icon > Secrets).");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const aiRes = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: `You are a chart expert for Tamedia. Your goal is to transform any data into a clean structure for Datawrapper.
          
          GUIDELINES & TAMEDIA STANDARDS:
          1. Purpose: Only make a chart if it adds value. It should clarify information or make numbers more readable.
          2. Clear Message: The title must state what the chart ACTUALLY shows, not just describe the content. Example: "SMI reaches all-time high", NOT "Evolution of SMI".
          3. Mobile First: Keep charts narrow and limit height. If a chart gets too tall, reduce visible elements.
          4. Simple Language: Titles, subtitles (intro), units, notes, and legends must be short and precise.
          5. Data Preparation: Clean, sort, and group data before outputting to CSV. Datawrapper should only visualize.
          6. Source & Author: Always indicate the data source and the initials/name (byline) of the person who made it.
          7. Chart Type Selection:
             - Use the following exact IDs for chartType:
               * Bar Chart: "d3-bars"
               * Split Bars: "d3-bars-split"
               * Stacked Bars: "d3-bars-stacked"
               * Bullet Bars: "d3-bars-bullet"
               * Grouped Bars: "d3-bars-grouped"
               * Dot Plot: "d3-dot-plot"
               * Range Plot: "d3-range-plot"
               * Arrow Plot: "d3-arrow-plot"
               * Column Chart: "column-chart"
               * Grouped Column Chart: "grouped-column-chart"
               * Stacked Column Chart: "stacked-column-chart"
               * Area Chart: "d3-area"
               * Line Chart: "d3-lines"
               * Multiple Lines Chart: "multiple-lines"
               * Pie Chart: "d3-pies"
               * Donut Chart: "d3-donuts"
               * Multiple Pies: "d3-multiple-pies"
               * Multiple Donuts: "d3-multiple-donuts"
               * Scatter Plot: "d3-scatter-plot"
               * Election Donut: "election-donut-chart"
               * Table: "tables"
               * Choropleth Map: "d3-maps-choropleth"
               * Symbol Map: "d3-maps-symbols"
               * Locator Map: "locator-map"

          8. Structure & Sorting:
             - Pie/Donut: Max 5 segments. Largest segment top-right, clockwise descending. Unspecific values ("Other") ALWAYS at the end.
             - Grouped Columns/Bars: Max 4 categories. If comparing 2 years, newer year at the bottom (bars) and highlighted.
             - Bars/Columns: Sort descending by value unless chronological.
             - Lines: Ideal 4 lines, max 5 lines. Most important line highlighted.
             - Maps (Choropleth): Do NOT use absolute numbers, use ratio/percentages. Stepped scales.
             - Locator Maps:
               * Zoom must show all points.
               * Use precise GPS coordinates for exact addresses/cities.
               * Do not shrink fonts, just hide labels if too crowded.
               * Main location: pennant/circle. ALL secondary locations (other cities, lakes, countries): Hide the datapoint icon so ONLY the text label is visible (set "icon": false or omit the icon property).
               * Country: UPPERCASE & BOLD. Province: SMALL CAPS. Cities: Normal case. Water/Mountains: Italics.
               * FORMATTING REQUIREMENT for the MAIN location text (e.g. "Château de Coudrée") in the marker\'s \`title\`:
                 You MUST use this HTML:
                 <b style="background:#d3343f ; padding:1px 6px ; color:#ffffff ; font-weight:700 ; box-shadow:0px 0px 7px 2px rgba(0,0,0,0.07) ; display : inline-block ; width : max-content ; ">Name of Location</b>
                 And you MUST set "text": { "halo": "#ffffff00" }, "markerColor": "#D3343F", and "connectorLine": { "enabled": true, "type": "straight", "arrowHead": "none" } inside the marker\'s JSON for this main location. Make sure to offset the text slightly (e.g., "offsetY": 20) so the line is visible as a straight line without an arrow head.
               * Main country should be highlighted with a lighter color if possible.
               * Add local landmarks (stations, monuments). ALWAYS show the scale bar.
               * Include an overview map (Globe or CH) only if it adds real value (avoid if target location is very obvious).
          9. Language: Determine if the context is French or German, and set language to 'fr-FR' or 'de-DE'.
          10. Rules for German texts:
              - Use angled quotes («») for quotations instead of straight quotes ("").
              - Apply gender-neutral language throughout the text, avoiding gender-specific pronouns or assumptions.
              - Use well known helvetisms.
              - Never use the character 'ß', use 'ss' instead.

          IMPORTANT: If there is ambiguity in the prompt, or multiple equally good ways to visualize the data, and the user hasn't specified one, you MUST return:
          {
            "isAmbiguous": true,
            "ambiguityMessage": "Question asking the user what type of chart or map they prefer (IN THE SAME LANGUAGE AS THEIR REQUEST)",
            "suggestedChartTypes": ["d3-bars", "d3-lines"], // up to 6 relevant IDs from the list
            "title": "", "intro": "", "source": "", "byline": "", "language": "", "chartType": "", "csvData": ""
          }

          ADVANCED MODE:
          If the prompt contains "GENERATE_ADVANCED_PROPOSALS", you MUST NOT output CSV data. Instead, analyze the input and return EXACTLY 3 proposals for charts/maps in this JSON format:
          {
            "isAdvancedProposals": true,
            "proposals": [
              {
                "title": "Clear Title",
                "intro": "Clear Lead/Subtitle",
                "chartType": "d3-bars", // One of the valid chart types
                "explanation": "Why this type of graphic is relevant for this data"
              }
            ],
            // fill other required fields with empty strings
            "isAmbiguous": false, "title": "", "intro": "", "source": "", "byline": "", "language": "", "chartType": "", "csvData": ""
          }

          Otherwise, if the chart type is clear, output exactly this JSON and you MUST INCLUDE ALL FIELDS:
          - isAmbiguous: false
          - title: Clear message title.
          - intro: Simple subtitle/intro.
          - source: Source of the data.
          - byline: Initials or name of the creator (you).
          - language: 'fr-FR' or 'de-DE'.
          - chartType: One of the Datawrapper keys above. If creating a Table, use "tables".
          - csvData: A raw CSV string with headers. For tables, limit data to a maximum of 50 rows (summarize or pick top rows) to avoid timeouts.
                     ★ EXCEPTION: For 'locator-map', csvData MUST be a JSON string of markers. Example: '{"markers":[{"type":"point","title":"Paris","coordinates":[2.35,48.85]}]}'
          `,
          responseMimeType: "application/json",
          responseSchema: {
            // @ts-ignore
            type: Type.OBJECT,
            properties: {
              isAmbiguous: { type: Type.BOOLEAN },
              ambiguityMessage: { type: Type.STRING },
              suggestedChartTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
              isAdvancedProposals: { type: Type.BOOLEAN },
              proposals: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    intro: { type: Type.STRING },
                    chartType: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  }
                } 
              },
              title: { type: Type.STRING },
              intro: { type: Type.STRING },
              source: { type: Type.STRING },
              byline: { type: Type.STRING },
              language: { type: Type.STRING },
              chartType: { type: Type.STRING },
              csvData: { type: Type.STRING },
            },
            required: ["isAmbiguous", "title", "intro", "source", "byline", "language", "chartType", "csvData"],
          },
        },
      });

      const textResult = aiRes.text;
      if (!textResult) throw new Error("Empty response from AI");
      const generated = JSON.parse(textResult);

      if (generated.isAmbiguous) {
        setAmbiguity({
          message: generated.ambiguityMessage,
          options: generated.suggestedChartTypes || []
        });
        setIsLoading(false);
        setIsIterating(false);
        return;
      }
      
      if (generated.isAdvancedProposals && generated.proposals) {
        setProposals(generated.proposals);
        setIsLoading(false);
        setIsIterating(false);
        return;
      }

      // If we reach here, no ambiguity.
      setAmbiguity(null);

      // Send to backend. On iteration, reuse the existing Datawrapper chart
      // so the same embed/URL keeps getting updated instead of generating
      // a new chart for every change.
      const reuseChartId = isIteration && result?.chartId ? result.chartId : undefined;
      const res = await fetch('/api/create-dw-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generated.title,
          chartType: generated.chartType,
          csvData: generated.csvData,
          intro: generated.intro,
          source: generated.source,
          byline: authorByline,
          language: generated.language,
          chartId: reuseChartId,
          system,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Backend Error');
      setResult({ ...data, csvData: generated.csvData, title: generated.title, chartType: generated.chartType });
      if (isIteration && !forcedChartType) setIterationText("");

      try {
        const msg = new SpeechSynthesisUtterance("Ready");
        msg.lang = "en-US";
        window.speechSynthesis.speak(msg);
      } catch (e) {
        console.error("Speech play failed:", e);
      }
    } catch (err: any) {
      let errorMessage = err.message || "Unknown error";
      if (!errorMessage.includes("⚙️") && (errorMessage.toLowerCase().includes("api key not valid") || errorMessage.toLowerCase().includes("api key is invalid"))) {
         errorMessage = "Invalid Gemini API key. Please configure it in settings (click the ⚙️ icon > Secrets).";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsIterating(false);
    }
  };

  const handleCopyCode = () => {
    if (result) {
      navigator.clipboard.writeText(result.iframeCode);
    }
  };

  return (
    <div className="flex h-screen w-full bg-secondary font-sans text-gray-900 overflow-hidden">
      
      {/* --- Main Area --- */}
      <main className="flex-1 flex flex-col h-full bg-secondary">
        
        {/* Header */}
        <header className="flex items-center justify-between px-12 py-3 bg-secondary border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center gap-4">
          </div>

          <div className="flex items-center gap-6">
            {/* System Toggle */}
            <div
              role="radiogroup"
              aria-label="System"
              className="flex items-center bg-gray-100 rounded-md p-0.5 text-sm"
            >
              {(['tamedia', 'fuw'] as System[]).map((s) => {
                const active = system === s;
                return (
                  <button
                    key={s}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSystem(s)}
                    className={`px-3 py-1 rounded-[5px] font-medium transition-colors ${
                      active ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {SYSTEM_CONFIG[s].label}
                  </button>
                );
              })}
            </div>

            {/* Language Switcher */}
            <div className="relative" ref={langMenuRef}>
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-base font-light ${isLangMenuOpen ? 'bg-gray-100' : 'hover:bg-white'}`}
              >
                <Globe className="w-4 h-4" />
                <span>{t.language}</span>
                <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl py-1 w-40 z-50 overflow-hidden"
                  >
                    <button 
                      onClick={() => { setLocale('fr'); setIsLangMenuOpen(false); }} 
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${locale === 'fr' ? 'text-brand-primary font-medium bg-gray-50/50' : 'text-gray-700'}`}
                    >
                      Français {locale === 'fr' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => { setLocale('de'); setIsLangMenuOpen(false); }} 
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${locale === 'de' ? 'text-brand-primary font-medium bg-gray-50/50' : 'text-gray-700'}`}
                    >
                      Deutsch {locale === 'de' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400">
              <User className="w-6 h-6" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto px-12 py-10">
          <div className="max-w-3xl mx-auto w-full space-y-8">
            
            {/* Title & Description */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-start gap-4">
                  <h1 className="text-3xl font-semibold text-brand-primary">{t.name}</h1>
                  <span
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-brand-primary border border-brand-primary"
                    style={{ backgroundColor: systemCfg.badgeBg }}
                    title={`Active system: ${systemCfg.label}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                    {systemCfg.label}
                  </span>
                  <div className="-rotate-[10deg] bg-yellow-400 text-black font-bold text-[10px] uppercase px-3 py-1 shadow-sm mt-2 ml-1 origin-center">
                    BETA
                  </div>
                </div>
                <p className="text-lg text-gray-700">{t.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-600 hover:text-yellow-500 transition-colors">
                  <Star className="w-6 h-6" />
                </button>
                <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <PanelLeftOpen className={`w-6 h-6 transition-transform ${isRightSidebarOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Input Form */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-base font-medium text-gray-900">{t.inputLabel}</label>
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t.inputPlaceholder}
                    className="w-full h-40 bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none transition-shadow"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-base font-medium text-gray-900">{t.fileUploadLabel}</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                      isDragging ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:bg-gray-50 hover:border-red-200'
                    }`}
                  >
                    <Upload className={`w-10 h-10 mb-2 transition-colors ${
                      isDragging ? 'text-red-500' : 'text-gray-400 group-hover:text-red-400'
                    }`} />
                    <span className="text-sm font-medium text-gray-700">{t.fileUploadHint}</span>
                    <span className="text-xs text-gray-500 mt-1">{t.fileUploadTypes}</span>
                  </div>
                  <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf,.xls,.xlsx,.csv,.txt,.doc,.docx,.ppt,.pptx" />

                  {/* File List */}
                  <AnimatePresence>
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {files.map((f, i) => (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={i} 
                            onClick={() => setPreviewFile(f)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 group cursor-pointer hover:border-[#378EBD] hover:bg-blue-50/30 transition-all"
                          >
                            {f.previewUrl ? <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-[#378EBD]" /> : <FileText className="w-4 h-4 text-gray-400 group-hover:text-[#378EBD]" />}
                            <span className="text-xs text-gray-600 truncate max-w-[120px] group-hover:text-gray-900">{f.name}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="p-0.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-base font-medium text-gray-900">Byline</label>
                    <input 
                      type="text"
                      value={authorByline}
                      onChange={(e) => setAuthorByline(e.target.value)}
                      placeholder={t.bylinePlaceholder}
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-shadow"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="relative flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={advancedMode} 
                        onChange={(e) => setAdvancedMode(e.target.checked)} 
                      />
                      <div className="w-9 h-5 bg-gray-200 hover:bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#378EBD]"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">{t.advancedMode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => generateChart(false, selectedChartType || undefined)}
                    disabled={isLoading || (!text.trim() && files.length === 0)}
                    className="bg-linear-to-r from-brand-primary to-brand-primary-dark text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-normal hover:brightness-110 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {isLoading && !isIterating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                    {isLoading && !isIterating ? t.generating : t.generate}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setIsChartMenuOpen(!isChartMenuOpen)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 px-3 py-2 text-sm rounded-lg flex items-center gap-1 transition-colors font-medium whitespace-nowrap shadow-sm"
                    >
                      {selectedChartType ? CHART_TYPES_INFO.find(c => c.id === selectedChartType)?.label : t.chartTypePlaceholder} <ChevronDown className="w-4 h-4 opacity-70" />
                    </button>
                    {isChartMenuOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 max-h-[300px] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2">
                        <button 
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedChartType ? 'bg-amber-50 text-amber-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => { setSelectedChartType(''); setIsChartMenuOpen(false); }}
                        >
                          {t.autoPick}
                        </button>
                        <div className="h-px bg-gray-100 my-1"></div>
                        {CHART_TYPES_INFO.map(c => {
                          return (
                            <button
                              key={c.id}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedChartType === c.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                              onClick={() => { setSelectedChartType(c.id); setIsChartMenuOpen(false); }}
                            >
                              <ChartIcon type={c.id} className="w-6 h-6 opacity-80" />
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => { setText(''); setFiles([]); setResult(null); setError(''); setAmbiguity(null); setSelectedChartType(''); }}
                    className="text-brand-primary hover:text-brand-primary-dark underline underline-offset-4 transition-colors text-sm ml-2"
                  >
                    {t.reset}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 mt-4 animate-in fade-in zoom-in duration-300">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
            </div>

            {/* Ambiguity Selection Card */}
            <AnimatePresence>
              {ambiguity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-8"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.ambiguityTitle}</h3>
                  <p className="text-gray-600 mb-6">{ambiguity.message}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {ambiguity.options.map((optId) => {
                      const chartConf = CHART_TYPES_INFO.find(c => c.id === optId);
                      const label = chartConf ? chartConf.label : optId;
                      
                      return (
                        <button
                          key={optId}
                          onClick={() => {
                            setAmbiguity(null);
                            generateChart(false, optId);
                          }}
                          className="flex flex-col items-center justify-center p-[10px] border border-gray-200 rounded-lg hover:border-[#378EBD] hover:bg-blue-50/30 transition-all gap-4 bg-white shadow-sm hover:shadow"
                        >
                          <ChartIcon type={optId} className="w-12 h-12 sm:w-16 sm:h-16 shrink-0" />
                          <span className="text-sm font-medium text-gray-800 text-center line-clamp-3 leading-tight w-full break-words">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Proposals Selection Card */}
            <AnimatePresence>
              {proposals && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-8"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">{t.proposalsTitle}</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {proposals.map((proposal, idx) => {
                      const chartConf = CHART_TYPES_INFO.find(c => c.id === proposal.chartType);
                      const chartLabel = chartConf ? chartConf.label : proposal.chartType;

                      return (
                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col hover:border-[#378EBD] hover:shadow-md transition-all">
                          <div className="flex items-center gap-3 mb-4 text-[#378EBD]">
                            <ChartIcon type={proposal.chartType} className="w-8 h-8 shrink-0" />
                            <span className="font-semibold text-sm bg-blue-50 px-2 py-1 rounded">{chartLabel}</span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{proposal.title}</h4>
                          <p className="text-sm text-gray-600 italic mb-4 leading-relaxed line-clamp-3">{proposal.intro}</p>
                          <div className="bg-gray-50 p-4 rounded-lg mb-6 flex-1 text-sm text-gray-700">
                            <strong>{locale === 'de' ? 'Warum :' : 'Pourquoi :'}</strong> {proposal.explanation}
                          </div>
                          
                          <button
                            onClick={() => {
                              setProposals(null);
                              generateChart(false, proposal.chartType, proposal);
                            }}
                            className="w-full bg-[#378EBD] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#296a8d] transition-colors flex items-center justify-center gap-2"
                          >
                            {t.selectProposal}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Result Card */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-medium">{t.resultTitle}</h2>
                    <div className="flex gap-3">
                      <a href={result.publicUrl} target="_blank" className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-red-500 border border-transparent hover:border-gray-200 transition-all shadow-xs" title={t.previewTab}>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="w-full aspect-[4/3] bg-gray-50 border border-gray-100 rounded-lg overflow-hidden relative shadow-inner">
                      <iframe 
                        src={result.publicUrl} 
                        className="w-full h-full border-none" 
                        title="Result Chart"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-900">{t.iframeLabel}</label>
                      <div className="relative">
                        <textarea 
                          readOnly 
                          value={result.iframeCode} 
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-600 h-24 focus:outline-none"
                        />
                        <button 
                          onClick={handleCopyCode}
                          className="absolute right-2 top-2 bg-white border border-gray-200 px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-xs"
                        >
                          {t.copy}
                        </button>
                      </div>
                    </div>

                    {result.publishError && (
                       <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
                          <Info className="w-4 h-4 shrink-0" />
                          <span>{result.publishError}</span>
                       </div>
                    )}

                    <div className="pt-4 flex flex-col gap-2 border-t border-gray-100">
                      <a href={`https://app.datawrapper.de/chart/${result.chartId}/visualize`} target="_blank" className="text-red-600 font-medium hover:underline flex items-center gap-1.5 w-max">
                        {t.editDw} <ExternalLink className="w-4 h-4" />
                      </a>
                      {result.chartType === 'locator-map' && (
                        <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200 mt-2 whitespace-pre-line leading-relaxed">
                          {t.adjustMapHint}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Iteration Chat */}
                  <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                       <MessageSquare className="w-4 h-4" />
                       {t.iterationTitle}
                    </h3>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={iterationText}
                        onChange={(e) => setIterationText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && iterationText.trim() && !isLoading) generateChart(true);
                        }}
                        placeholder={t.iterationPlaceholder}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        disabled={isLoading}
                      />
                      <button 
                        onClick={() => generateChart(true)}
                        disabled={isLoading || !iterationText.trim()}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isIterating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {isIterating ? 'Iteration...' : 'OK'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
              {previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                     onClick={() => setPreviewFile(null)}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 truncate pr-8">{previewFile.name}</h3>
                      <button 
                        onClick={() => setPreviewFile(null)}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4 overflow-auto flex-1 flex flex-col items-center justify-center bg-gray-50/50 rounded-b-xl min-h-[50vh]">
                      {previewFile.previewUrl ? (
                        <img 
                          src={previewFile.previewUrl} 
                          alt={previewFile.name} 
                          className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                        />
                      ) : previewFile.mimeType === 'application/pdf' || previewFile.name.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                          src={previewFile.objectUrl || `data:application/pdf;base64,${previewFile.base64}`} 
                          className="w-full h-full min-h-[60vh] rounded-lg shadow-sm border border-gray-200" 
                          title={previewFile.name}
                        />
                      ) : previewFile.mimeType.includes('text') || previewFile.mimeType.includes('csv') || previewFile.name.toLowerCase().endsWith('.csv') || previewFile.name.toLowerCase().endsWith('.txt') ? (
                        <div className="w-full h-full text-left bg-white p-4 border border-gray-200 rounded-lg shadow-inner overflow-auto">
                           <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                             {(() => {
                               try {
                                 const decoded = atob(previewFile.base64);
                                 // utf8 handling
                                 const bytes = new Uint8Array(decoded.length);
                                 for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
                                 const text = new TextDecoder('utf-8').decode(bytes);
                                 // truncate if too long
                                 return text.length > 50000 ? text.substring(0, 50000) + '\n\n... (preview truncated)' : text;
                               } catch (e) {
                                 return "Could not decode text file for preview.";
                               }
                             })()}
                           </pre>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-gray-500">
                          <FileText className="w-16 h-16 mb-4 text-gray-300" />
                          <p>Aperçu non disponible pour ce type de fichier.</p>
                          <p className="text-xs mt-1">({previewFile.mimeType})</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>

      {/* --- Right Sidebar (Toolbox Style) --- */}
      <aside className={`h-full bg-white border-l border-gray-200 transition-all duration-300 ${isRightSidebarOpen ? 'w-[350px]' : 'w-0 overflow-hidden'}`}>
        <div className="p-5 h-full flex flex-col gap-5 overflow-y-auto">
          
          <div className="rounded-xl border-l-[6px] border-brand-primary bg-white border p-5 shadow-xs">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-primary" />
              {t.quickGuide}
            </h3>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <p>{t.quickGuideText}</p>
              <div className="bg-gray-50 p-3 rounded-lg border-l-2 border-brand-primary italic text-brand-primary">
                {t.quickGuideTip}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wider">System Status</h2>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
             </div>
             <div className="space-y-3">
                <StatusItem label="Datawrapper" active={apiStatus?.datawrapperStatus === "ok"} />
                <StatusItem label="Gemini AI" active={apiStatus?.geminiKeySet} />
             </div>
          </div>

        </div>
      </aside>

    </div>
  );
}


function StatusItem({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className={`flex items-center text-xs font-semibold ${active ? 'text-emerald-600' : 'text-red-600'}`}>
        {active ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
        {active ? 'Actif' : 'Erreur'}
      </span>
    </div>
  );
}
