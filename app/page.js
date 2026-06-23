'use client';

import { useState, useRef, useEffect } from 'react';

// ── Brand kleuren ─────────────────────────────────────────────────────────────
const B = {
  paars:      '#4B2068', paarsDark: '#361550', paarsLight: '#F0EAF6', paarsMid: '#7B4FA0',
  goud:       '#B8975A', goudLight: '#F5EDD9', goudDark:  '#8C6E38',
  zwart:      '#1E1E1E', grijs:     '#F6F6F8', grijsMid:  '#E2E2E8', grijsTekst:'#6B6B80',
  wit:        '#FFFFFF', groen:     '#1B6B3A', rood:      '#B91C1C',
  whatsapp:   '#25D366', n8n:       '#EA4B71', outlook:   '#0078D4',
};

const STATUS = {
  gepland:     { label:'Gepland',     bg:'#EDE9F6', clr:'#4B2068' },
  onderweg:    { label:'Onderweg',    bg:'#F5EDD9', clr:'#8C6E38' },
  voltooid:    { label:'Voltooid',    bg:'#DCFCE7', clr:'#166534' },
  geannuleerd: { label:'Geannuleerd', bg:'#FEE2E2', clr:'#991B1B' },
};

const TICKET_STATUS = {
  nieuw:     { label:'Nieuw',     bg:'#EDE9F6', clr:'#4B2068' },
  open:      { label:'Open',      bg:'#FEF3C7', clr:'#92400E' },
  behandeld: { label:'Behandeld', bg:'#DCFCE7', clr:'#166534' },
  gesloten:  { label:'Gesloten',  bg:'#F1F5F9', clr:'#475569' },
};

const BRON_ICOON = { email:'📧', whatsapp:'💬', n8n:'⚡', handmatig:'✏️', contactformulier:'🌐', telefoon:'📞' };

let _nid = 5;
const DEMO_OPDRACHTEN = [
  { id:1, nummer:'GVE-2026-001', naam:'Bakker Metaal BV', type:'ophaal', datum:'2026-06-24',
    adres:'Industrieweg 14, Veenendaal', contactpersoon:'Jan Bakker', telefoon:'0318-123456',
    email:'jan@bakker.nl', extraEmails:['info@bakker.nl'], materiaal:'IJzer / Knip', gewicht:'450 kg',
    status:'gepland', notities:'Toegang via zij-ingang.', fotos:[], bron:'handmatig' },
  { id:2, nummer:'GVE-2026-002', naam:'Smit Constructie', type:'breng', datum:'2026-06-23',
    adres:'Havenstraat 88, Rhenen', contactpersoon:'Lisa Smit', telefoon:'0317-654321',
    email:'lisa@smit.nl', extraEmails:[], materiaal:'Aluminium / Profiel', gewicht:'1.200 kg',
    status:'onderweg', notities:'', fotos:[], bron:'email' },
  { id:3, nummer:'GVE-2026-003', naam:'De Vries Sloop', type:'ophaal', datum:'2026-06-22',
    adres:'Kerkstraat 5, Ede', contactpersoon:'Peter de Vries', telefoon:'06-12345678',
    email:'peter@devries.nl', extraEmails:[], materiaal:'Koper / Rood', gewicht:'80 kg',
    status:'voltooid', notities:'Factuur verzonden.', fotos:[], bron:'whatsapp' },
  { id:4, nummer:'GVE-2026-004', naam:'Van Dijk Industrie', type:'breng', datum:'2026-06-25',
    adres:'Nijverheidsweg 22, Veenendaal', contactpersoon:'Mark van Dijk', telefoon:'0318-998877',
    email:'mark@vandijk.nl', extraEmails:[], materiaal:'RVS 304', gewicht:'320 kg',
    status:'gepland', notities:'', fotos:[], bron:'n8n' },
];

const DEMO_TICKETS = [
  { id:1, ticketNr:'TKT-001', van:'h.janssen@gmail.com', naam:'Henk Janssen', telefoon:'06-99887766',
    onderwerp:'Container aanvragen - 2 ton ijzer', bericht:'Goedemiddag,\n\nIk heb een container nodig voor circa 2 ton ijzer en staal van een sloopproject. Kunt u contact met mij opnemen?\n\nMet vriendelijke groet,\nHenk Janssen',
    status:'nieuw', bron:'email', datum:'2026-06-23 09:14', opdracht_id:null,
    reacties:[] },
  { id:2, ticketNr:'TKT-002', van:'+31612345678', naam:'Mohamed Al-Rashid', telefoon:'+31612345678',
    onderwerp:'WhatsApp: Container huren', bericht:'Hallo, ik wil graag een container huren voor oud ijzer. Hoeveel kost dat?',
    status:'open', bron:'whatsapp', datum:'2026-06-23 11:32', opdracht_id:null,
    reacties:[{auteur:'GVE', tekst:'Goedemiddag! Wij bieden gratis containerservice. Kunt u aangeven hoeveel kg het ongeveer is?', datum:'2026-06-23 11:45'}] },
  { id:3, ticketNr:'TKT-003', van:'info@sloopbedrijf.nl', naam:'Sloopbedrijf Veenendaal', telefoon:'0318-445566',
    onderwerp:'Prijsopgave aluminium profielen', bericht:'Beste,\n\nWij hebben maandelijks circa 800 kg aluminium profielen beschikbaar. Wat zijn uw inkoopprijzen?\n\nMet vriendelijke groet',
    status:'behandeld', bron:'email', datum:'2026-06-22 14:20', opdracht_id:3,
    reacties:[{auteur:'GVE', tekst:'Bedankt voor uw bericht. De huidige dagprijs voor aluminium profiel is €0,85/kg. Zullen we een afspraak inplannen?', datum:'2026-06-22 15:00'}] },
];

const DEMO_API_KEYS = [
  { id:1, naam:'n8n Workflow', sleutel:'gve_n8n_a1b2c3d4e5f6789012345678', aangemaakt:'2026-06-01', gebruik:142, actief:true },
  { id:2, naam:'WhatsApp Bot', sleutel:'gve_wa_x9y8z7w6v5u4321098765432', aangemaakt:'2026-06-15', gebruik:38,  actief:true },
];

const DEMO_WEBHOOKS = [
  { id:1, naam:'n8n Inkomend', url:'https://n8n.jouwdomein.nl/webhook/gve-tickets', events:['ticket.nieuw','opdracht.aangemaakt'], actief:true, laatste:'2026-06-23 09:14' },
  { id:2, naam:'WhatsApp Notificatie', url:'https://n8n.jouwdomein.nl/webhook/gve-status', events:['opdracht.status_gewijzigd'], actief:true, laatste:'2026-06-23 08:55' },
];

const LEEG = { naam:'', type:'ophaal', datum:'', adres:'', contactpersoon:'', telefoon:'',
  email:'', extraEmails:[], materiaal:'', gewicht:'', status:'gepland', notities:'' };

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// ── Kleine UI componenten ─────────────────────────────────────────────────────
const LogoIcon = ({ size=36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 5 L90 22 L90 55 C90 75 70 90 50 97 C30 90 10 75 10 55 L10 22 Z" fill={B.paars} opacity="0.12"/>
    <path d="M50 10 L85 25 L85 55 C85 73 67 87 50 94 C33 87 15 73 15 55 L15 25 Z" fill="none" stroke={B.paars} strokeWidth="5"/>
    <text x="50" y="67" textAnchor="middle" fill={B.paars} fontSize="46" fontWeight="900" fontFamily="Georgia,serif">G</text>
  </svg>
);

const Badge = ({ status }) => { const s=STATUS[status]||STATUS.gepland; return <span style={{background:s.bg,color:s.clr,fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20,whiteSpace:'nowrap'}}>{s.label}</span>; };
const TicketBadge = ({ status }) => { const s=TICKET_STATUS[status]||TICKET_STATUS.nieuw; return <span style={{background:s.bg,color:s.clr,fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20,whiteSpace:'nowrap'}}>{s.label}</span>; };
const TypeBadge = ({ type }) => <span style={{background:type==='ophaal'?B.paarsLight:B.goudLight,color:type==='ophaal'?B.paars:B.goudDark,fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20,whiteSpace:'nowrap'}}>{type==='ophaal'?'↑ Ophaal':'↓ Breng'}</span>;
const BronBadge = ({ bron }) => {
  const cfg = { email:{bg:'#EFF6FF',clr:'#1D4ED8'}, whatsapp:{bg:'#F0FDF4',clr:'#15803D'}, n8n:{bg:'#FFF1F2',clr:'#BE185D'}, handmatig:{bg:B.grijs,clr:B.grijsTekst}, contactformulier:{bg:'#F0F9FF',clr:'#0369A1'}, telefoon:{bg:'#FFF7ED',clr:'#C2410C'} };
  const c = cfg[bron]||cfg.handmatig;
  return <span style={{background:c.bg,color:c.clr,fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,whiteSpace:'nowrap'}}>{BRON_ICOON[bron]||'?'} {bron}</span>;
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const w = useWindowWidth();
  const isMobile = w < 768;

  const [opdrachten,    setOpdrachten]    = useState(DEMO_OPDRACHTEN);
  const [tickets,       setTickets]       = useState(DEMO_TICKETS);
  const [apiKeys,       setApiKeys]       = useState(DEMO_API_KEYS);
  const [webhooks,      setWebhooks]      = useState(DEMO_WEBHOOKS);
  const [pagina,        setPagina]        = useState('dashboard');
  const [gesTicket,     setGesTicket]     = useState(null);
  const [gesOpdracht,   setGesOpdracht]   = useState(null);
  const [zoek,          setZoek]          = useState('');
  const [filterStatus,  setFilterStatus]  = useState('alle');
  const [filterBron,    setFilterBron]    = useState('alle');
  const [form,          setForm]          = useState(LEEG);
  const [emailInvoer,   setEmailInvoer]   = useState('');
  const [opgeslagen,    setOpgeslagen]    = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [collapsed,     setCollapsed]     = useState(false);
  const [fotoPreview,   setFotoPreview]   = useState([]);
  const [reactieTekst,  setReactieTekst]  = useState('');
  const [gesMailTab,    setGesMailTab]    = useState('imap'); // imap|smtp|test
  const [mailConfig,    setMailConfig]    = useState({ host:'imap.outlook.com', port:'993', user:'h.geven@outlook.com', pass:'', ssl:true, pollingMin:5 });
  const [smtpConfig,    setSmtpConfig]    = useState({ host:'smtp.office365.com', port:'587', user:'h.geven@outlook.com', pass:'', tls:true });
  const [nNieuweKey,    setNNieuweKey]    = useState('');
  const [nieuweKeyNaam, setNieuweKeyNaam] = useState('');
  const [webhookNieuw,  setWebhookNieuw]  = useState({ naam:'', url:'', events:[] });
  const [toastMsg,      setToastMsg]      = useState('');
  const [showApiDocs,   setShowApiDocs]   = useState(false);

  const toast = (msg) => { setToastMsg(msg); setTimeout(()=>setToastMsg(''),3000); };

  const stats = {
    totaal:       opdrachten.length,
    ophaal:       opdrachten.filter(o=>o.type==='ophaal').length,
    breng:        opdrachten.filter(o=>o.type==='breng').length,
    vandaag:      opdrachten.filter(o=>o.datum==='2026-06-24').length,
    nieuwTickets: tickets.filter(t=>t.status==='nieuw').length,
    openTickets:  tickets.filter(t=>['nieuw','open'].includes(t.status)).length,
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const ga = (p) => { setPagina(p); setSidebarOpen(false); };
  const nieuwOpdracht = () => { setForm(LEEG); setGesOpdracht(null); setFotoPreview([]); ga('formulier'); };

  const ticketNaarOpdracht = (tid) => {
    const t = tickets.find(x=>x.id===tid);
    if (!t) return;
    setForm({...LEEG, naam:t.naam||'', email:t.van, telefoon:t.telefoon||'', notities:t.bericht});
    setGesOpdracht(null); setFotoPreview([]);
    setTickets(p=>p.map(x=>x.id===tid?{...x,status:'behandeld'}:x));
    ga('formulier');
  };

  const opslaan = () => {
    if (!form.naam||!form.datum||!form.adres) { toast('⚠️ Vul naam, datum en adres in'); return; }
    if (gesOpdracht) {
      setOpdrachten(p=>p.map(o=>o.id===gesOpdracht?{...form,id:gesOpdracht,nummer:o.nummer,fotos:o.fotos||[],bron:o.bron}:o));
    } else {
      const nummer=`GVE-2026-${String(_nid++).padStart(3,'0')}`;
      setOpdrachten(p=>[{...form,id:_nid,nummer,fotos:fotoPreview,bron:'handmatig'},...p]);
    }
    setOpgeslagen(true);
    setTimeout(()=>{setOpgeslagen(false);ga('opdrachten');},1300);
  };

  const statusWijzigen = (id,st) => { setOpdrachten(p=>p.map(o=>o.id===id?{...o,status:st}:o)); toast(`✓ Status gewijzigd naar "${STATUS[st].label}"`); };
  const ticketStatusWijzigen = (id,st) => { setTickets(p=>p.map(t=>t.id===id?{...t,status:st}:t)); toast(`✓ Ticket "${TICKET_STATUS[st].label}"`); };

  const reactieVersturen = (tid) => {
    if (!reactieTekst.trim()) return;
    setTickets(p=>p.map(t=>t.id===tid?{...t,reacties:[...t.reacties,{auteur:'GVE',tekst:reactieTekst,datum:new Date().toLocaleString('nl-NL')}],status:'open'}:t));
    setReactieTekst(''); toast('✓ Reactie verstuurd');
  };

  const generateApiKey = () => {
    if (!nieuweKeyNaam.trim()) { toast('⚠️ Geef de sleutel een naam'); return; }
    const key = 'gve_' + Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,18);
    setApiKeys(p=>[...p,{id:Date.now(),naam:nieuweKeyNaam,sleutel:key,aangemaakt:new Date().toISOString().slice(0,10),gebruik:0,actief:true}]);
    setNNieuweKey(key); setNieuweKeyNaam(''); toast('✓ API-sleutel aangemaakt');
  };

  const kopieer = (tekst) => { navigator.clipboard?.writeText(tekst); toast('✓ Gekopieerd!'); };

  const toggleEvent = (ev) => setWebhookNieuw(w=>({...w,events:w.events.includes(ev)?w.events.filter(e=>e!==ev):[...w.events,ev]}));

  const addWebhook = () => {
    if (!webhookNieuw.naam||!webhookNieuw.url) { toast('⚠️ Vul naam en URL in'); return; }
    setWebhooks(p=>[...p,{id:Date.now(),...webhookNieuw,actief:true,laatste:'—'}]);
    setWebhookNieuw({naam:'',url:'',events:[]}); toast('✓ Webhook toegevoegd');
  };

  // ── Styles ───────────────────────────────────────────────────────────────────
  const sidebarW = collapsed ? 68 : 240;
  const card  = { background:B.wit, borderRadius:10, boxShadow:'0 1px 6px rgba(75,32,104,.09)', padding:isMobile?14:20 };
  const inp   = { width:'100%', padding:'10px 12px', borderRadius:7, border:`1.5px solid ${B.grijsMid}`,
                  fontSize:14, outline:'none', background:B.grijs, boxSizing:'border-box', fontFamily:'inherit', color:B.zwart };
  const lbl   = { fontSize:12, fontWeight:700, color:B.grijsTekst, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.4 };
  const btn   = (v='primary',sm=false) => ({
    padding: sm ? '7px 12px' : isMobile ? '11px 14px' : '9px 16px',
    borderRadius:7, border:'none', cursor:'pointer', fontWeight:600, fontSize:sm?12:13,
    display:'inline-flex', alignItems:'center', gap:6, transition:'all .15s',
    ...(v==='primary'   ? {background:B.paars,    color:B.wit}            :
        v==='secondary' ? {background:B.paarsLight,color:B.paars}         :
        v==='groen'     ? {background:B.groen,    color:B.wit}            :
        v==='whatsapp'  ? {background:B.whatsapp, color:B.wit}            :
        v==='n8n'       ? {background:B.n8n,      color:B.wit}            :
        v==='outlook'   ? {background:B.outlook,  color:B.wit}            :
        v==='danger'    ? {background:'#FEE2E2',   color:B.rood}          :
                          {background:'transparent',color:B.grijsTekst}),
  });

  const navItems = [
    {key:'dashboard',   label:'Dashboard',    emoji:'⊞'},
    {key:'tickets',     label:'Tickets',      emoji:'🎫', badge:stats.openTickets},
    {key:'opdrachten',  label:'Opdrachten',   emoji:'📋'},
    {key:'ophaal',      label:'Ophalen',      emoji:'↑'},
    {key:'breng',       label:'Brengen',      emoji:'↓'},
    {key:'integraties', label:'Integraties',  emoji:'🔌'},
    {key:'formulier',   label:'Nieuw',        emoji:'＋'},
  ];

  const navBtnStyle = (active) => ({
    display:'flex', alignItems:'center', gap:11, padding:'11px 16px',
    cursor:'pointer', width:'100%', textAlign:'left', border:'none',
    background: active ? 'rgba(184,151,90,.18)' : 'transparent',
    color: active ? B.goud : 'rgba(255,255,255,.75)',
    fontWeight: active ? 700 : 500, fontSize:13,
    borderLeft:`3px solid ${active?B.goud:'transparent'}`,
    transition:'all .15s', whiteSpace:'nowrap',
  });

  const titels = { dashboard:'Dashboard', tickets:'Tickets & Berichten', opdrachten:'Alle opdrachten',
    ophaal:'Ophalen', breng:'Brengen', integraties:'Integraties', formulier:gesOpdracht?'Bewerken':'Nieuwe opdracht',
    detail: opdrachten.find(o=>o.id===gesOpdracht)?.naam||'Detail' };

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      <div style={{padding:(collapsed&&!isMobile)?'16px 12px':'16px 18px',borderBottom:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',gap:12,minHeight:76}}>
        <div style={{flexShrink:0,width:40,height:40,background:B.wit,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
          <LogoIcon size={36}/>
        </div>
        {(!collapsed||isMobile) && <div><div style={{color:B.wit,fontWeight:900,fontSize:13,letterSpacing:1.5,whiteSpace:'nowrap'}}>GEVEN VAN ETTEN</div><div style={{color:B.goud,fontWeight:600,fontSize:10,letterSpacing:3,whiteSpace:'nowrap'}}>RECYCLING</div></div>}
        {isMobile && <button onClick={()=>setSidebarOpen(false)} style={{marginLeft:'auto',background:'none',border:'none',color:'rgba(255,255,255,.7)',cursor:'pointer',fontSize:24,lineHeight:1}}>×</button>}
      </div>
      <nav style={{flex:1,paddingTop:8,overflowY:'auto'}}>
        {navItems.map(item=>(
          <button key={item.key} style={navBtnStyle(pagina===item.key)}
            onClick={()=>{ item.key==='formulier'?nieuwOpdracht():ga(item.key); }}>
            <span style={{flexShrink:0,fontSize:17,width:22,textAlign:'center'}}>{item.emoji}</span>
            {(!collapsed||isMobile) && <span>{item.label}</span>}
            {(!collapsed||isMobile) && item.badge>0 && (
              <span style={{background:B.goud,color:B.wit,fontSize:10,fontWeight:800,padding:'1px 7px',borderRadius:10,marginLeft:'auto'}}>{item.badge}</span>
            )}
          </button>
        ))}
      </nav>
      {!isMobile && (
        <div style={{padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,.08)'}}>
          <button style={{...navBtnStyle(false),justifyContent:collapsed?'center':'flex-start'}} onClick={()=>setCollapsed(v=>!v)}>
            <span style={{fontSize:15}}>{collapsed?'›':'‹'}</span>
            {!collapsed&&<span style={{fontSize:12}}>Inklappen</span>}
          </button>
        </div>
      )}
    </>
  );

  // ── Pagina: Dashboard ────────────────────────────────────────────────────────
  const PaginaDashboard = () => (
    <div>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(6,1fr)',gap:12,marginBottom:18}}>
        {[
          {label:'Opdrachten', val:stats.totaal,       top:B.paars,    emoji:'📦'},
          {label:'Ophalen',    val:stats.ophaal,       top:B.paars,    emoji:'↑'},
          {label:'Brengen',    val:stats.breng,        top:B.goud,     emoji:'↓'},
          {label:'Vandaag',    val:stats.vandaag,      top:B.groen,    emoji:'📅'},
          {label:'Openstaand', val:stats.openTickets,  top:B.rood,     emoji:'🎫'},
          {label:'Nieuwe mails',val:stats.nieuwTickets,top:B.outlook,  emoji:'📧'},
        ].map((s,i)=>(
          <div key={i} style={{...card,borderTop:`4px solid ${s.top}`,padding:'13px 15px',
            gridColumn:isMobile&&i>=4?'1 / -1':undefined, cursor:'pointer'}}
            onClick={()=>i>=4?ga('tickets'):i<=3?ga('opdrachten'):null}>
            <div style={{fontSize:18,marginBottom:3}}>{s.emoji}</div>
            <div style={{fontSize:26,fontWeight:900,color:B.zwart,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:11,color:B.grijsTekst,marginTop:3,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1.5fr 1fr',gap:14}}>
        <div style={card}>
          <div style={{fontWeight:800,fontSize:14,marginBottom:12,display:'flex',justifyContent:'space-between'}}>
            <span>Recente opdrachten</span>
            <button style={{...btn('ghost',true),color:B.goud}} onClick={()=>ga('opdrachten')}>Alle →</button>
          </div>
          {opdrachten.slice(0,5).map(o=>(
            <div key={o.id} onClick={()=>{setGesOpdracht(o.id);ga('detail');}}
              style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:`1px solid ${B.grijs}`,cursor:'pointer',gap:8}}>
              <div style={{minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.naam}</div>
                <div style={{fontSize:11,color:B.grijsTekst,display:'flex',gap:6,marginTop:2,flexWrap:'wrap'}}>
                  <span>{o.nummer}</span><BronBadge bron={o.bron}/>
                </div>
              </div>
              <div style={{display:'flex',gap:5,flexShrink:0}}><TypeBadge type={o.type}/></div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Open tickets */}
          <div style={{...card,borderLeft:`4px solid ${B.rood}`}}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:10,display:'flex',justifyContent:'space-between'}}>
              <span>🎫 Open tickets</span>
              <button style={{...btn('ghost',true),color:B.rood}} onClick={()=>ga('tickets')}>Alle →</button>
            </div>
            {tickets.filter(t=>['nieuw','open'].includes(t.status)).slice(0,4).map(t=>(
              <div key={t.id} onClick={()=>{setGesTicket(t.id);ga('tickets');}}
                style={{padding:'7px 0',borderBottom:`1px solid ${B.grijs}`,cursor:'pointer'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6}}>
                  <div style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.naam}</div>
                  <BronBadge bron={t.bron}/>
                </div>
                <div style={{fontSize:11,color:B.grijsTekst,marginTop:2}}>{t.onderwerp}</div>
              </div>
            ))}
            {tickets.filter(t=>['nieuw','open'].includes(t.status)).length===0&&<div style={{color:B.grijsTekst,fontSize:13}}>Geen open tickets 🎉</div>}
          </div>

          {/* Integratie status */}
          <div style={card}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:10}}>🔌 Integraties</div>
            {[
              {naam:'E-mail (Outlook)', actief:true, kleur:B.outlook, emoji:'📧'},
              {naam:'WhatsApp',         actief:true, kleur:B.whatsapp,emoji:'💬'},
              {naam:'n8n Workflows',    actief:true, kleur:B.n8n,     emoji:'⚡'},
            ].map((i,idx)=>(
              <div key={idx} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:`1px solid ${B.grijs}`}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:16}}>{i.emoji}</span>
                  <span style={{fontSize:13,fontWeight:500}}>{i.naam}</span>
                </div>
                <span style={{background:i.actief?'#DCFCE7':'#FEE2E2',color:i.actief?B.groen:B.rood,
                  fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10}}>
                  {i.actief?'● Actief':'○ Inactief'}
                </span>
              </div>
            ))}
            <button style={{...btn('secondary'),width:'100%',justifyContent:'center',marginTop:10}} onClick={()=>ga('integraties')}>
              Beheer integraties →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Pagina: Tickets ──────────────────────────────────────────────────────────
  const PaginaTickets = () => {
    const sel = tickets.find(t=>t.id===gesTicket);
    const gefilterd = tickets.filter(t=>{
      const z=zoek.toLowerCase();
      return (!z||t.naam?.toLowerCase().includes(z)||t.onderwerp?.toLowerCase().includes(z)||t.van?.toLowerCase().includes(z))
        && (filterStatus==='alle'||t.status===filterStatus)
        && (filterBron==='alle'||t.bron===filterBron);
    });

    const Lijst = () => (
      <div style={card}>
        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
          <input value={zoek} onChange={e=>setZoek(e.target.value)} placeholder="Zoek tickets…" style={{...inp,flex:1,maxWidth:260}}/>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...inp,width:'auto'}}>
            <option value="alle">Alle statussen</option>
            {Object.entries(TICKET_STATUS).map(([k,c])=><option key={k} value={k}>{c.label}</option>)}
          </select>
          <select value={filterBron} onChange={e=>setFilterBron(e.target.value)} style={{...inp,width:'auto'}}>
            <option value="alle">Alle bronnen</option>
            {['email','whatsapp','n8n','handmatig','contactformulier','telefoon'].map(b=><option key={b} value={b}>{BRON_ICOON[b]} {b}</option>)}
          </select>
        </div>
        {gefilterd.map(t=>(
          <div key={t.id} onClick={()=>setGesTicket(t.id)}
            style={{padding:isMobile?'12px 0':'11px 0',borderBottom:`1px solid ${B.grijs}`,cursor:'pointer',
              background:gesTicket===t.id?B.paarsLight:'transparent',borderRadius:gesTicket===t.id?6:0,
              paddingLeft:gesTicket===t.id?8:0,transition:'all .1s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:4}}>
              <div style={{minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                  <span style={{color:B.grijsTekst,fontSize:11}}>{t.ticketNr}</span>
                  <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.naam}</span>
                </div>
                <div style={{fontSize:12,color:B.grijsTekst,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.onderwerp}</div>
              </div>
              <div style={{display:'flex',gap:5,flexShrink:0,flexWrap:'wrap',justifyContent:'flex-end'}}>
                <BronBadge bron={t.bron}/><TicketBadge status={t.status}/>
              </div>
            </div>
            <div style={{fontSize:11,color:B.grijsMid}}>{t.datum} {t.reacties?.length>0&&`· ${t.reacties.length} reactie${t.reacties.length>1?'s':''}`}</div>
          </div>
        ))}
        {gefilterd.length===0&&<div style={{padding:30,textAlign:'center',color:B.grijsTekst}}>Geen tickets gevonden.</div>}
      </div>
    );

    const Detail = () => {
      if (!sel) return <div style={{...card,display:'flex',alignItems:'center',justifyContent:'center',color:B.grijsTekst,flexDirection:'column',gap:10,minHeight:300}}><div style={{fontSize:36}}>🎫</div><div>Selecteer een ticket</div></div>;
      return (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14,gap:10}}>
              <div>
                <div style={{fontSize:11,color:B.grijsTekst,fontWeight:700}}>{sel.ticketNr} · {sel.datum}</div>
                <div style={{fontSize:isMobile?16:19,fontWeight:900,marginTop:2}}>{sel.onderwerp}</div>
                <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                  <BronBadge bron={sel.bron}/><TicketBadge status={sel.status}/>
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <button style={btn('primary',true)} onClick={()=>ticketNaarOpdracht(sel.id)}>→ Opdracht</button>
              </div>
            </div>

            {/* Klantinfo */}
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:10,padding:12,background:B.grijs,borderRadius:8,marginBottom:14}}>
              {[['Naam',sel.naam],['Van',sel.van],['Telefoon',sel.telefoon]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k}>
                  <div style={{fontSize:11,color:B.grijsTekst,fontWeight:700,textTransform:'uppercase',letterSpacing:0.4}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:500,marginTop:1}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Bericht */}
            <div style={{background:sel.bron==='whatsapp'?'#F0FDF4':B.paarsLight,borderRadius:8,padding:14,
              fontSize:14,lineHeight:1.75,whiteSpace:'pre-wrap',borderLeft:`3px solid ${sel.bron==='whatsapp'?B.whatsapp:B.paars}`,marginBottom:14}}>
              {sel.bericht}
            </div>

            {/* Reacties */}
            {sel.reacties?.map((r,i)=>(
              <div key={i} style={{background:'#F0FDF4',borderRadius:8,padding:12,marginBottom:8,borderLeft:`3px solid ${B.groen}`}}>
                <div style={{fontSize:11,color:B.grijsTekst,marginBottom:4,fontWeight:700}}>{r.auteur} · {r.datum}</div>
                <div style={{fontSize:13,lineHeight:1.6}}>{r.tekst}</div>
              </div>
            ))}

            {/* Antwoord */}
            {!['gesloten','behandeld'].includes(sel.status) && (
              <div style={{marginTop:10}}>
                <label style={lbl}>Antwoord versturen</label>
                <textarea value={reactieTekst} onChange={e=>setReactieTekst(e.target.value)}
                  rows={3} placeholder={sel.bron==='whatsapp'?'WhatsApp-bericht typen…':'E-mail antwoord typen…'}
                  style={{...inp,resize:'vertical',marginBottom:8}}/>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button style={btn(sel.bron==='whatsapp'?'whatsapp':'outlook')} onClick={()=>reactieVersturen(sel.id)}>
                    {sel.bron==='whatsapp'?'💬 Via WhatsApp':'📧 Via E-mail'} versturen
                  </button>
                  <button style={btn('ghost',true)} onClick={()=>ticketStatusWijzigen(sel.id,'behandeld')}>✓ Markeer behandeld</button>
                  <button style={btn('ghost',true)} onClick={()=>ticketStatusWijzigen(sel.id,'gesloten')}>Sluit ticket</button>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div style={card}>
            <div style={{fontWeight:800,fontSize:13,marginBottom:10}}>Status wijzigen</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
              {Object.entries(TICKET_STATUS).map(([k,c])=>(
                <button key={k} onClick={()=>ticketStatusWijzigen(sel.id,k)}
                  style={{...btn('ghost',true),justifyContent:'center',background:sel.status===k?B.paars:B.grijs,
                    color:sel.status===k?B.wit:B.grijsTekst,fontWeight:sel.status===k?800:500}}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    };

    if (isMobile && !gesTicket) return <Lijst/>;
    if (isMobile && gesTicket) return (
      <div>
        <button style={{...btn('ghost'),marginBottom:12}} onClick={()=>setGesTicket(null)}>← Terug</button>
        <Detail/>
      </div>
    );

    return (
      <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:16,alignItems:'start'}}>
        <Lijst/><Detail/>
      </div>
    );
  };

  // ── Pagina: Opdrachten ───────────────────────────────────────────────────────
  const PaginaOpdrachten = ({typeFilter}) => {
    const lijst = opdrachten.filter(o=>(!typeFilter||o.type===typeFilter)&&(!zoek||(o.naam+o.nummer+(o.contactpersoon||'')).toLowerCase().includes(zoek.toLowerCase())));
    return (
      <div style={card}>
        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
          <input value={zoek} onChange={e=>setZoek(e.target.value)} placeholder="Zoek…" style={{...inp,maxWidth:260,flex:isMobile?1:undefined}}/>
          {!isMobile&&!typeFilter&&<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...inp,width:'auto'}}>
            <option value="alle">Alle statussen</option>
            {Object.entries(STATUS).map(([k,c])=><option key={k} value={k}>{c.label}</option>)}
          </select>}
          {!isMobile&&<select value={filterBron} onChange={e=>setFilterBron(e.target.value)} style={{...inp,width:'auto'}}>
            <option value="alle">Alle bronnen</option>
            {['email','whatsapp','n8n','handmatig','contactformulier'].map(b=><option key={b} value={b}>{BRON_ICOON[b]} {b}</option>)}
          </select>}
          <button style={{...btn('primary'),flexShrink:0}} onClick={nieuwOpdracht}>+ Nieuw</button>
        </div>
        {isMobile ? lijst.map(o=>(
          <div key={o.id} onClick={()=>{setGesOpdracht(o.id);ga('detail');}}
            style={{background:B.grijs,borderRadius:9,padding:14,marginBottom:10,cursor:'pointer',borderLeft:`4px solid ${o.type==='ophaal'?B.paars:B.goud}`}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <div><div style={{fontWeight:700,fontSize:13}}>{o.naam}</div><div style={{fontSize:11,color:B.grijsTekst}}>{o.nummer}</div></div>
              <Badge status={o.status}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',gap:5}}><BronBadge bron={o.bron}/></div>
              <TypeBadge type={o.type}/>
            </div>
          </div>
        )) : (
          <>
            <div style={{display:'grid',gridTemplateColumns:'2fr 80px 90px 100px 90px 100px 100px',gap:10,
              padding:'8px 14px',background:B.paarsLight,borderRadius:7,marginBottom:4}}>
              {['Klant','Type','Datum','Status','Bron','Materiaal','Acties'].map(h=>(
                <span key={h} style={{fontSize:11,fontWeight:700,color:B.paars,textTransform:'uppercase',letterSpacing:0.4}}>{h}</span>
              ))}
            </div>
            {lijst.map(o=>(
              <div key={o.id} onClick={()=>{setGesOpdracht(o.id);ga('detail');}}
                style={{display:'grid',gridTemplateColumns:'2fr 80px 90px 100px 90px 100px 100px',gap:10,
                  padding:'10px 14px',borderBottom:`1px solid ${B.grijs}`,alignItems:'center',cursor:'pointer',
                  background:gesOpdracht===o.id?B.paarsLight:'transparent',transition:'background .1s'}}>
                <div><div style={{fontWeight:600,fontSize:13}}>{o.naam}</div><div style={{fontSize:11,color:B.grijsTekst}}>{o.nummer}</div></div>
                <TypeBadge type={o.type}/>
                <span style={{fontSize:12}}>{o.datum}</span>
                <Badge status={o.status}/>
                <BronBadge bron={o.bron}/>
                <span style={{fontSize:12,color:B.grijsTekst}}>{o.materiaal||'—'}</span>
                <div style={{display:'flex',gap:5}} onClick={e=>e.stopPropagation()}>
                  <button style={btn('secondary',true)} onClick={()=>{setForm({...o,extraEmails:o.extraEmails||[]});setGesOpdracht(o.id);ga('formulier');}}>✏️</button>
                  <button style={btn('danger',true)} onClick={()=>setOpdrachten(p=>p.filter(x=>x.id!==o.id))}>🗑</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  // ── Pagina: Detail opdracht ──────────────────────────────────────────────────
  const PaginaDetail = () => {
    const o = opdrachten.find(x=>x.id===gesOpdracht);
    if (!o) return null;
    const fRef = useRef(null);
    return (
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 280px',gap:16}}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,gap:10}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11,color:B.grijsTekst,fontWeight:700}}>{o.nummer}</div>
                <div style={{fontSize:isMobile?17:20,fontWeight:900,marginTop:2}}>{o.naam}</div>
                <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                  <TypeBadge type={o.type}/><Badge status={o.status}/><BronBadge bron={o.bron}/>
                </div>
              </div>
              <button style={{...btn('secondary',true),flexShrink:0}} onClick={()=>{setForm({...o,extraEmails:o.extraEmails||[]});ga('formulier');}}>✏️</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12}}>
              {[['Datum',o.datum],['Adres',o.adres],['Contactpersoon',o.contactpersoon],['Telefoon',o.telefoon],['E-mail',o.email],['Materiaal',o.materiaal],['Gewicht',o.gewicht]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k}><div style={{fontSize:11,color:B.grijsTekst,fontWeight:700,textTransform:'uppercase',letterSpacing:0.4}}>{k}</div><div style={{fontSize:13,fontWeight:500,marginTop:2}}>{v}</div></div>
              ))}
            </div>
            {o.notities&&<div style={{marginTop:14,padding:12,background:B.paarsLight,borderRadius:8,fontSize:13,borderLeft:`3px solid ${B.paars}`}}><strong>Notities:</strong> {o.notities}</div>}
          </div>
          <div style={card}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>📷 Foto's</div>
            {(o.fotos||[]).length>0&&<div style={{display:'grid',gridTemplateColumns:`repeat(${isMobile?2:3},1fr)`,gap:10,marginBottom:12}}>
              {(o.fotos||[]).map((f,i)=>(
                <div key={i} style={{borderRadius:8,overflow:'hidden',aspectRatio:'4/3',position:'relative',background:B.grijs}}>
                  <img src={f.url||f.pad} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <button onClick={()=>setOpdrachten(p=>p.map(x=>x.id===o.id?{...x,fotos:(x.fotos||[]).filter((_,j)=>j!==i)}:x))} style={{position:'absolute',top:5,right:5,background:'rgba(75,32,104,.85)',border:'none',color:'#fff',borderRadius:'50%',width:26,height:26,cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                </div>
              ))}
            </div>}
            <div onClick={()=>fRef.current?.click()} onDragOver={e=>e.preventDefault()}
              onDrop={e=>{e.preventDefault();const nF=Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/')).map(f=>({file:f,url:URL.createObjectURL(f)}));setOpdrachten(p=>p.map(x=>x.id===o.id?{...x,fotos:[...(x.fotos||[]),...nF]}:x));}}
              style={{border:`2px dashed ${B.paars}55`,borderRadius:9,padding:'18px 14px',textAlign:'center',cursor:'pointer',background:B.paarsLight}}>
              <div style={{fontSize:24,marginBottom:4}}>📎</div>
              <div style={{fontWeight:600,fontSize:13,color:B.paars}}>{isMobile?'Tik om foto te kiezen':'Sleep foto\'s of klik'}</div>
            </div>
            <input ref={fRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{const nF=Array.from(e.target.files).map(f=>({file:f,url:URL.createObjectURL(f)}));setOpdrachten(p=>p.map(x=>x.id===o.id?{...x,fotos:[...(x.fotos||[]),...nF]}:x));}}/>
          </div>
        </div>
        {!isMobile&&(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={card}>
              <div style={{fontWeight:800,fontSize:14,marginBottom:10}}>Status</div>
              {Object.entries(STATUS).map(([k,c])=>(
                <button key={k} onClick={()=>statusWijzigen(o.id,k)} style={{...btn('ghost'),width:'100%',justifyContent:'center',marginBottom:6,background:o.status===k?B.paars:B.grijs,color:o.status===k?B.wit:B.grijsTekst,fontWeight:o.status===k?800:500}}>{c.label}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Pagina: Formulier ────────────────────────────────────────────────────────
  const PaginaFormulier = () => {
    const [lF,setLF]=useState(fotoPreview);
    const fRef=useRef(null);
    const voegFotoToe=files=>{const nF=Array.from(files).filter(f=>f.type.startsWith('image/')).map(f=>({file:f,url:URL.createObjectURL(f)}));setLF(p=>[...p,...nF]);setFotoPreview(p=>[...p,...nF]);};
    const velden=[{l:'Naam klant / bedrijf *',k:'naam',p:'bijv. Bakker Metaal BV'},{l:'Contactpersoon',k:'contactpersoon',p:'Volledige naam'},{l:'Telefoon',k:'telefoon',p:'06-12345678'},{l:'Primaire e-mail',k:'email',p:'klant@bedrijf.nl',t:'email'},{l:'Adres *',k:'adres',p:'Straat 1, Stad',full:true},{l:'Datum *',k:'datum',t:'date'},{l:'Materiaal',k:'materiaal',p:'bijv. IJzer / Knip'},{l:'Gewicht',k:'gewicht',p:'bijv. 500 kg'}];
    return (
      <div style={{maxWidth:760}}>
        <div style={card}>
          <div style={{fontWeight:900,fontSize:16,marginBottom:18,color:B.paars,borderBottom:`2px solid ${B.paarsLight}`,paddingBottom:12}}>{gesOpdracht?'✏️ Bewerken':'+ Nieuwe opdracht'}</div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:13,marginBottom:14}}>
            {velden.map(f=>(
              <div key={f.k} style={{gridColumn:f.full?'1 / -1':undefined}}>
                <label style={lbl}>{f.l}</label>
                <input type={f.t||'text'} value={form[f.k]} placeholder={f.p||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={inp}/>
              </div>
            ))}
            <div><label style={lbl}>Type</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={inp}><option value="ophaal">↑ Ophalen</option><option value="breng">↓ Brengen</option></select></div>
            <div><label style={lbl}>Status</label><select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={inp}>{Object.entries(STATUS).map(([k,c])=><option key={k} value={k}>{c.label}</option>)}</select></div>
            <div style={{gridColumn:'1 / -1'}}><label style={lbl}>Notities</label><textarea value={form.notities} onChange={e=>setForm(p=>({...p,notities:e.target.value}))} rows={3} style={{...inp,resize:'vertical'}} placeholder="Aanvullende informatie…"/></div>
          </div>
          <div style={{borderTop:`1px solid ${B.grijsMid}`,paddingTop:14,marginBottom:16}}>
            <label style={lbl}>Extra e-mailadressen</label>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <input type="email" value={emailInvoer} onChange={e=>setEmailInvoer(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){const ev=emailInvoer.trim();if(ev&&!form.extraEmails.includes(ev))setForm(f=>({...f,extraEmails:[...f.extraEmails,ev]}));setEmailInvoer('');}}} placeholder="extra@bedrijf.nl" style={{...inp,flex:1}}/>
              <button style={{...btn('secondary'),flexShrink:0}} onClick={()=>{const e=emailInvoer.trim();if(e&&!form.extraEmails.includes(e))setForm(f=>({...f,extraEmails:[...f.extraEmails,e]}));setEmailInvoer('');}}>+ Voeg toe</button>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:7}}>{form.extraEmails.map(e=><span key={e} style={{background:B.paarsLight,color:B.paars,padding:'5px 10px',borderRadius:20,fontSize:12,fontWeight:600,display:'inline-flex',alignItems:'center',gap:5}}>📧 {e}<span style={{cursor:'pointer',fontWeight:900}} onClick={()=>setForm(f=>({...f,extraEmails:f.extraEmails.filter(x=>x!==e)}))}>×</span></span>)}</div>
          </div>
          <div style={{borderTop:`1px solid ${B.grijsMid}`,paddingTop:14,marginBottom:20}}>
            <label style={lbl}>📷 Foto's</label>
            <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();voegFotoToe(e.dataTransfer.files);}} onClick={()=>fRef.current?.click()}
              style={{border:`2px dashed ${B.paars}55`,borderRadius:9,padding:'18px 14px',textAlign:'center',cursor:'pointer',background:B.paarsLight}}>
              <div style={{fontSize:26,marginBottom:4}}>📎</div>
              <div style={{fontWeight:600,fontSize:13,color:B.paars}}>{isMobile?'Tik om foto\'s te kiezen':'Sleep foto\'s of klik'}</div>
            </div>
            <input ref={fRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>voegFotoToe(e.target.files)}/>
            {lF.length>0&&<div style={{display:'grid',gridTemplateColumns:`repeat(${isMobile?2:4},1fr)`,gap:10,marginTop:12}}>{lF.map((f,i)=><div key={i} style={{borderRadius:8,overflow:'hidden',aspectRatio:'4/3',position:'relative',background:B.grijs}}><img src={f.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/><button onClick={()=>{setLF(p=>p.filter((_,j)=>j!==i));setFotoPreview(p=>p.filter((_,j)=>j!==i));}} style={{position:'absolute',top:4,right:4,background:'rgba(75,32,104,.85)',border:'none',color:'#fff',borderRadius:'50%',width:26,height:26,cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button></div>)}</div>}
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <button style={{...btn('primary'),padding:'12px 22px',flex:isMobile?1:undefined,justifyContent:'center'}} onClick={opslaan}>
              {opgeslagen?'✓ Opgeslagen!':gesOpdracht?'Opslaan':'Aanmaken'}
            </button>
            <button style={btn('ghost')} onClick={()=>{ga('opdrachten');setGesOpdracht(null);}}>Annuleren</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Pagina: Integraties ──────────────────────────────────────────────────────
  const PaginaIntegraties = () => {
    const [tab, setTab] = useState('overzicht');

    // ── Lokale instellingen state ──────────────────────────────────────────────
    const [imap, setImap] = useState({ host:'imap.outlook.com', port:'993', user:'h.geven@outlook.com', pass:'', ssl:true, polling:5, actief:false, status:null });
    const [smtp, setSmtp] = useState({ host:'smtp.office365.com', port:'587', user:'h.geven@outlook.com', pass:'', tls:true, actief:false, status:null });
    const [wa,   setWa]   = useState({ phoneId:'', token:'', verifyToken:'gve_webhook_geheim', methode:'n8n', actief:false, status:null });
    const [n8nCfg, setN8nCfg] = useState({ url:'', apiToken:'', actief:false, status:null });
    const [contactWh, setContactWh] = useState({ secret:'gve_contact_geheim', actief:true });
    const [bezig, setBezig] = useState('');

    // Simuleer verbinding testen
    const testVerbinding = async (type) => {
      setBezig(type);
      await new Promise(r => setTimeout(r, 1800));
      if (type === 'imap') setImap(p => ({...p, actief:true, status:'ok'}));
      if (type === 'smtp') setSmtp(p => ({...p, actief:true, status:'ok'}));
      if (type === 'wa')   setWa(p   => ({...p, actief:true, status:'ok'}));
      if (type === 'n8n')  setN8nCfg(p => ({...p, actief:true, status:'ok'}));
      setBezig('');
      toast('✓ Verbinding succesvol!');
    };

    const slaOp = (type, extra) => { toast(`✓ ${type} instellingen opgeslagen`); if (extra) extra(); };

    const StatusDot = ({ok, bezig:b}) => (
      <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,fontWeight:700,
        color: b ? B.goudDark : ok ? B.groen : B.grijsTekst}}>
        <span style={{width:8,height:8,borderRadius:'50%',display:'inline-block',
          background: b ? B.goud : ok ? B.groen : B.grijsMid,
          animation: b ? 'pulse 1s infinite' : 'none'}}/>
        {b ? 'Testen…' : ok ? 'Verbonden' : 'Niet verbonden'}
      </span>
    );

    const Sectie = ({titel, sub, children}) => (
      <div style={{...card, marginBottom:0}}>
        <div style={{fontWeight:800, fontSize:15, color:B.zwart, marginBottom:3}}>{titel}</div>
        {sub && <div style={{fontSize:12, color:B.grijsTekst, marginBottom:16, lineHeight:1.6}}>{sub}</div>}
        {children}
      </div>
    );

    const Veld = ({label, hint, children}) => (
      <div style={{marginBottom:14}}>
        <label style={lbl}>{label}</label>
        {hint && <div style={{fontSize:11, color:B.grijsTekst, marginBottom:5}}>{hint}</div>}
        {children}
      </div>
    );

    const InpRow = ({label, hint, ...props}) => (
      <Veld label={label} hint={hint}>
        <input {...props} style={inp}/>
      </Veld>
    );

    const Info = ({kleur='blauw', children}) => {
      const kl = {blauw:{bg:'#EFF6FF',clr:'#1D4ED8',border:'#1D4ED8'}, groen:{bg:'#F0FDF4',clr:B.groen,border:B.groen}, oranje:{bg:'#FFF7ED',clr:'#92400E',border:'#F59E0B'}};
      const c = kl[kleur]||kl.blauw;
      return <div style={{padding:12, background:c.bg, borderRadius:8, fontSize:12, color:c.clr, borderLeft:`3px solid ${c.border}`, lineHeight:1.7, marginTop:14}}>{children}</div>;
    };

    const tabs = [
      {key:'overzicht',label:'⊞ Overzicht'},
      {key:'mail',     label:'📧 E-mail'},
      {key:'whatsapp', label:'💬 WhatsApp'},
      {key:'n8n',      label:'⚡ n8n'},
      {key:'api',      label:'🔑 API-sleutels'},
      {key:'webhooks', label:'🔗 Webhooks'},
    ];
    return (
      <div>
        {/* ── Tab bar ── */}
        <div style={{display:'flex',gap:2,marginBottom:18,overflowX:'auto',paddingBottom:2,borderBottom:`2px solid ${B.grijsMid}`}}>
          {tabs.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{flexShrink:0,padding:'9px 16px',fontSize:13,fontWeight:tab===t.key?700:500,
                border:'none',cursor:'pointer',whiteSpace:'nowrap',
                background: tab===t.key ? B.paarsLight : 'transparent',
                color: tab===t.key ? B.paars : B.grijsTekst,
                borderBottom: tab===t.key ? `3px solid ${B.paars}` : '3px solid transparent',
                borderRadius:'6px 6px 0 0', transition:'all .15s'}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: OVERZICHT
        ══════════════════════════════════════════════════════════════════════ */}
        {tab==='overzicht' && (
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)',gap:14}}>
            {[
              { emoji:'📧', titel:'E-mail (IMAP/SMTP)', ok:imap.actief&&smtp.actief, tab:'mail',
                lijnen:[ imap.actief ? `✓ IMAP: ${imap.user}` : '✗ IMAP niet verbonden', smtp.actief ? `✓ SMTP: ${smtp.user}` : '✗ SMTP niet verbonden', `Polling: elke ${imap.polling} min` ] },
              { emoji:'💬', titel:'WhatsApp Business', ok:wa.actief, tab:'whatsapp',
                lijnen:[ wa.actief ? '✓ Verbonden' : '✗ Niet verbonden', `Methode: ${wa.methode==='meta'?'Meta Cloud API':'Via n8n'}`, wa.phoneId ? `Tel ID: ${wa.phoneId.slice(0,8)}…` : 'Phone ID niet ingesteld' ] },
              { emoji:'⚡', titel:'n8n Workflows', ok:n8nCfg.actief, tab:'n8n',
                lijnen:[ n8nCfg.actief ? '✓ Verbonden' : '✗ Niet verbonden', n8nCfg.url || 'URL niet ingesteld', `${webhooks.filter(w=>w.actief).length} actieve webhooks` ] },
              { emoji:'🌐', titel:'Contactformulier', ok:contactWh.actief, tab:'webhooks',
                lijnen:[ contactWh.actief ? '✓ Webhook actief' : '✗ Niet actief', 'POST /api/webhooks/contact', `Token: ${contactWh.secret.slice(0,12)}…` ] },
              { emoji:'🔑', titel:'API-sleutels', ok:apiKeys.length>0, tab:'api',
                lijnen:[ `${apiKeys.filter(k=>k.actief).length} actieve sleutels`, `${apiKeys.reduce((s,k)=>s+k.gebruik,0)} totale API-verzoeken`, 'Klik om te beheren' ] },
              { emoji:'🔗', titel:'Webhooks (uitgaand)', ok:webhooks.filter(w=>w.actief).length>0, tab:'webhooks',
                lijnen:[ `${webhooks.filter(w=>w.actief).length} van ${webhooks.length} actief`, ...webhooks.slice(0,2).map(w=>`→ ${w.naam}`) ] },
            ].map((blok,i)=>(
              <div key={i} onClick={()=>setTab(blok.tab)}
                style={{...card, cursor:'pointer', borderTop:`4px solid ${blok.ok ? B.groen : B.grijsMid}`,
                  transition:'box-shadow .15s'}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(75,32,104,.15)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 6px rgba(75,32,104,.09)'}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:22}}>{blok.emoji}</span>
                    <span style={{fontWeight:800,fontSize:13}}>{blok.titel}</span>
                  </div>
                  <span style={{background:blok.ok?'#DCFCE7':'#F1F5F9',color:blok.ok?B.groen:B.grijsTekst,
                    fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,whiteSpace:'nowrap'}}>
                    {blok.ok?'● Actief':'○ Inactief'}
                  </span>
                </div>
                {blok.lijnen.map((l,j)=><div key={j} style={{fontSize:12,color:B.grijsTekst,padding:'3px 0',borderBottom:j<blok.lijnen.length-1?`1px solid ${B.grijs}`:'none'}}>{l}</div>)}
                <div style={{marginTop:10,fontSize:12,color:B.paars,fontWeight:600}}>Instellingen wijzigen →</div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: E-MAIL
        ══════════════════════════════════════════════════════════════════════ */}
        {tab==='mail' && (
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16}}>

            {/* IMAP */}
            <Sectie
              titel="📥 Inkomende e-mail (IMAP)"
              sub="Ongelezen e-mails worden automatisch opgehaald en als ticket aangemaakt in het dashboard.">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <StatusDot ok={imap.actief} bezig={bezig==='imap'}/>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
                  <span style={{fontSize:12,color:B.grijsTekst}}>Actief</span>
                  <div onClick={()=>setImap(p=>({...p,actief:!p.actief}))}
                    style={{width:40,height:22,borderRadius:11,background:imap.actief?B.paars:B.grijsMid,
                      position:'relative',cursor:'pointer',transition:'background .2s'}}>
                    <div style={{position:'absolute',top:3,left:imap.actief?20:3,width:16,height:16,
                      borderRadius:'50%',background:B.wit,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
                  </div>
                </label>
              </div>

              <InpRow label="E-mailadres" placeholder="h.geven@outlook.com" type="email" value={imap.user} onChange={e=>setImap(p=>({...p,user:e.target.value}))} hint="Het e-mailadres dat gescand wordt voor inkomende berichten"/>
              <InpRow label="Wachtwoord / App-wachtwoord" placeholder="Uw app-wachtwoord" type="password" value={imap.pass} onChange={e=>setImap(p=>({...p,pass:e.target.value}))} hint="Gebruik een App-wachtwoord, niet uw normale wachtwoord"/>

              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:10,marginBottom:14}}>
                <div>
                  <label style={lbl}>IMAP Server</label>
                  <input value={imap.host} onChange={e=>setImap(p=>({...p,host:e.target.value}))} placeholder="imap.outlook.com" style={inp}/>
                </div>
                <div>
                  <label style={lbl}>Poort</label>
                  <input value={imap.port} onChange={e=>setImap(p=>({...p,port:e.target.value}))} placeholder="993" style={inp}/>
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                <div>
                  <label style={lbl}>Polling interval</label>
                  <select value={imap.polling} onChange={e=>setImap(p=>({...p,polling:+e.target.value}))} style={inp}>
                    {[1,2,5,10,15,30].map(m=><option key={m} value={m}>Elke {m} min</option>)}
                  </select>
                </div>
                <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
                  <label style={lbl}>SSL/TLS</label>
                  <select value={imap.ssl?'1':'0'} onChange={e=>setImap(p=>({...p,ssl:e.target.value==='1'}))} style={inp}>
                    <option value="1">SSL aan (aanbevolen)</option>
                    <option value="0">Geen SSL</option>
                  </select>
                </div>
              </div>

              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button style={{...btn('outlook'),flex:1,justifyContent:'center'}}
                  onClick={()=>testVerbinding('imap')} disabled={bezig==='imap'}>
                  {bezig==='imap'?'Bezig…':'🔗 Verbinding testen'}
                </button>
                <button style={{...btn('primary'),flex:1,justifyContent:'center'}}
                  onClick={()=>slaOp('IMAP', ()=>setImap(p=>({...p,actief:true})))}>
                  Instellingen opslaan
                </button>
              </div>

              <Info kleur="blauw">
                <strong>Outlook / Office 365:</strong> Ga naar <strong>account.microsoft.com</strong> → Beveiliging → Geavanceerde beveiliging → App-wachtwoorden.<br/>
                <strong>Gmail:</strong> Zet IMAP aan via Gmail-instellingen en maak een App-wachtwoord aan onder je Google-account.
              </Info>
            </Sectie>

            {/* SMTP */}
            <Sectie
              titel="📤 Uitgaande e-mail (SMTP)"
              sub="Voor het versturen van reacties op tickets en statusmeldingen naar klanten vanuit het dashboard.">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <StatusDot ok={smtp.actief} bezig={bezig==='smtp'}/>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
                  <span style={{fontSize:12,color:B.grijsTekst}}>Actief</span>
                  <div onClick={()=>setSmtp(p=>({...p,actief:!p.actief}))}
                    style={{width:40,height:22,borderRadius:11,background:smtp.actief?B.paars:B.grijsMid,
                      position:'relative',cursor:'pointer',transition:'background .2s'}}>
                    <div style={{position:'absolute',top:3,left:smtp.actief?20:3,width:16,height:16,
                      borderRadius:'50%',background:B.wit,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
                  </div>
                </label>
              </div>

              <InpRow label="Afzender e-mailadres" placeholder="h.geven@outlook.com" type="email" value={smtp.user} onChange={e=>setSmtp(p=>({...p,user:e.target.value}))}/>
              <InpRow label="Wachtwoord / App-wachtwoord" placeholder="Uw app-wachtwoord" type="password" value={smtp.pass} onChange={e=>setSmtp(p=>({...p,pass:e.target.value}))}/>

              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:10,marginBottom:14}}>
                <div>
                  <label style={lbl}>SMTP Server</label>
                  <input value={smtp.host} onChange={e=>setSmtp(p=>({...p,host:e.target.value}))} placeholder="smtp.office365.com" style={inp}/>
                </div>
                <div>
                  <label style={lbl}>Poort</label>
                  <input value={smtp.port} onChange={e=>setSmtp(p=>({...p,port:e.target.value}))} placeholder="587" style={inp}/>
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <label style={lbl}>Versleuteling</label>
                <select value={smtp.tls?'starttls':'none'} onChange={e=>setSmtp(p=>({...p,tls:e.target.value==='starttls'}))} style={inp}>
                  <option value="starttls">STARTTLS — poort 587 (aanbevolen)</option>
                  <option value="ssl">SSL/TLS — poort 465</option>
                  <option value="none">Geen — poort 25 (niet aanbevolen)</option>
                </select>
              </div>

              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button style={{...btn('outlook'),flex:1,justifyContent:'center'}}
                  onClick={()=>testVerbinding('smtp')} disabled={bezig==='smtp'}>
                  {bezig==='smtp'?'Bezig…':'📨 Test e-mail sturen'}
                </button>
                <button style={{...btn('primary'),flex:1,justifyContent:'center'}}
                  onClick={()=>slaOp('SMTP', ()=>setSmtp(p=>({...p,actief:true})))}>
                  Instellingen opslaan
                </button>
              </div>

              <Info kleur="groen">
                ✓ Zodra IMAP en SMTP zijn ingesteld, worden inkomende e-mails elke <strong>{imap.polling} minuten</strong> opgehaald. Reacties vanuit het dashboard worden verstuurd via uw eigen e-mailadres.
              </Info>
            </Sectie>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: WHATSAPP
        ══════════════════════════════════════════════════════════════════════ */}
        {tab==='whatsapp' && (
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16}}>
            <Sectie
              titel="💬 WhatsApp Business koppelen"
              sub="Inkomende WhatsApp-berichten worden automatisch als ticket aangemaakt. Kies uw koppelingsmethode.">

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <StatusDot ok={wa.actief} bezig={bezig==='wa'}/>
              </div>

              {/* Methode keuze */}
              <div style={{marginBottom:16}}>
                <label style={lbl}>Koppelingsmethode</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:4}}>
                  {[{v:'n8n',label:'⚡ Via n8n',sub:'Aanbevolen — eenvoudigst'},{v:'meta',label:'🌐 Meta Cloud API',sub:'Direct — meer controle'}].map(m=>(
                    <div key={m.v} onClick={()=>setWa(p=>({...p,methode:m.v}))}
                      style={{padding:'10px 12px',borderRadius:8,cursor:'pointer',border:`2px solid ${wa.methode===m.v?B.paars:B.grijsMid}`,background:wa.methode===m.v?B.paarsLight:B.wit,transition:'all .15s'}}>
                      <div style={{fontWeight:700,fontSize:13,color:wa.methode===m.v?B.paars:B.zwart}}>{m.label}</div>
                      <div style={{fontSize:11,color:B.grijsTekst,marginTop:2}}>{m.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Via n8n */}
              {wa.methode==='n8n' && (
                <>
                  <div style={{padding:14,background:'#F0FDF4',borderRadius:8,marginBottom:14,borderLeft:`3px solid ${B.whatsapp}`}}>
                    <div style={{fontWeight:700,fontSize:12,marginBottom:6,color:B.groen}}>Hoe werkt het?</div>
                    <div style={{fontSize:12,color:B.grijsTekst,lineHeight:1.7}}>
                      1. Stel in n8n een <strong>WhatsApp trigger</strong> in<br/>
                      2. n8n stuurt het bericht door naar dit dashboard<br/>
                      3. Het bericht wordt automatisch een ticket
                    </div>
                  </div>
                  <div style={{marginBottom:14}}>
                    <label style={lbl}>Webhook URL (kopieer naar n8n)</label>
                    <div style={{display:'flex',gap:6}}>
                      <input readOnly value="https://uw-dashboard.nl/api/webhooks/whatsapp" style={{...inp,color:B.paars,background:B.paarsLight,cursor:'text'}}/>
                      <button style={{...btn('secondary'),flexShrink:0}} onClick={()=>kopieer('https://uw-dashboard.nl/api/webhooks/whatsapp')}>📋</button>
                    </div>
                  </div>
                  <InpRow label="API-sleutel (kies uit uw sleutels)" placeholder="gve_wa_xxxx" value={wa.token} onChange={e=>setWa(p=>({...p,token:e.target.value}))} hint="Maak een sleutel aan onder het tabblad API-sleutels"/>
                  <Info kleur="blauw">
                    Ga naar het tabblad <strong>n8n</strong> om de volledige workflow te bekijken en te importeren.
                  </Info>
                </>
              )}

              {/* Via Meta */}
              {wa.methode==='meta' && (
                <>
                  <div style={{padding:12,background:'#FFF7ED',borderRadius:8,marginBottom:14,borderLeft:'3px solid #F59E0B',fontSize:12,color:'#92400E'}}>
                    ⚠️ Vereist een <strong>Meta Business Account</strong> en goedgekeurd WhatsApp Business nummer.
                  </div>
                  <InpRow label="WhatsApp Phone Number ID" placeholder="123456789012345" value={wa.phoneId} onChange={e=>setWa(p=>({...p,phoneId:e.target.value}))} hint="Te vinden op developers.facebook.com → uw app → WhatsApp → API Setup"/>
                  <InpRow label="Permanent Access Token (Meta)" placeholder="EAABsbCS4..." type="password" value={wa.token} onChange={e=>setWa(p=>({...p,token:e.target.value}))} hint="Genereer via een System User in Meta Business Manager"/>
                  <div style={{marginBottom:14}}>
                    <label style={lbl}>Webhook Verify Token</label>
                    <div style={{display:'flex',gap:6}}>
                      <input value={wa.verifyToken} onChange={e=>setWa(p=>({...p,verifyToken:e.target.value}))} style={inp}/>
                      <button style={{...btn('secondary'),flexShrink:0}} onClick={()=>kopieer(wa.verifyToken)}>📋</button>
                    </div>
                    <div style={{fontSize:11,color:B.grijsTekst,marginTop:4}}>Vul dit token ook in bij Meta → Webhook → Verify Token</div>
                  </div>
                  <div style={{marginBottom:14}}>
                    <label style={lbl}>Webhook Callback URL (kopieer naar Meta)</label>
                    <div style={{display:'flex',gap:6}}>
                      <input readOnly value="https://uw-dashboard.nl/api/webhooks/whatsapp" style={{...inp,color:B.paars,background:B.paarsLight}}/>
                      <button style={{...btn('secondary'),flexShrink:0}} onClick={()=>kopieer('https://uw-dashboard.nl/api/webhooks/whatsapp')}>📋</button>
                    </div>
                  </div>
                </>
              )}

              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
                <button style={{...btn('whatsapp'),flex:1,justifyContent:'center'}}
                  onClick={()=>testVerbinding('wa')} disabled={bezig==='wa'}>
                  {bezig==='wa'?'Bezig…':'💬 Verbinding testen'}
                </button>
                <button style={{...btn('primary'),flex:1,justifyContent:'center'}}
                  onClick={()=>slaOp('WhatsApp', ()=>setWa(p=>({...p,actief:true})))}>
                  Instellingen opslaan
                </button>
              </div>
            </Sectie>

            {/* Rechterkolom: stap-voor-stap */}
            <Sectie titel="📋 Instapgids WhatsApp">
              {[
                {stap:'1',titel:'Meta Business Account',tekst:'Ga naar business.facebook.com en maak een account aan of log in. Voeg uw bedrijf "Geven van Etten Recycling" toe.'},
                {stap:'2',titel:'WhatsApp Business API activeren',tekst:'Ga in Meta Business naar WhatsApp → Aan de slag. Koppel uw telefoonnummer +31622623937.'},
                {stap:'3',titel:'App en Token aanmaken',tekst:'Ga naar developers.facebook.com → Mijn apps → Nieuwe app → Business. Voeg WhatsApp product toe en genereer een permanent token via een System User.'},
                {stap:'4',titel:'Webhook instellen',tekst:'Kopieer de Callback URL en Verify Token uit dit dashboard en plak ze in de Meta Webhook-instellingen. Abonneer op het bericht "messages".'},
                {stap:'5',titel:'Testen',tekst:'Stuur een WhatsApp-bericht naar uw nummer. Het verschijnt binnen seconden als ticket in het dashboard.'},
              ].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:`1px solid ${B.grijs}`}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:B.paars,color:B.wit,fontWeight:800,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{s.stap}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{s.titel}</div>
                    <div style={{fontSize:12,color:B.grijsTekst,lineHeight:1.6}}>{s.tekst}</div>
                  </div>
                </div>
              ))}
            </Sectie>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: N8N
        ══════════════════════════════════════════════════════════════════════ */}
        {tab==='n8n' && (
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16}}>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <Sectie titel="⚡ n8n verbindingsinstellingen" sub="Verbind uw eigen n8n instantie of n8n.cloud om workflows te automatiseren.">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <StatusDot ok={n8nCfg.actief} bezig={bezig==='n8n'}/>
                </div>
                <InpRow label="n8n URL" placeholder="https://n8n.jouwdomein.nl" value={n8nCfg.url} onChange={e=>setN8nCfg(p=>({...p,url:e.target.value}))} hint="Uw n8n instantie URL (inclusief https://)"/>
                <InpRow label="n8n API Token" placeholder="eyJhbGciOiJIUzI1NiJ9…" type="password" value={n8nCfg.apiToken} onChange={e=>setN8nCfg(p=>({...p,apiToken:e.target.value}))} hint="Te vinden in n8n → Instellingen → API → Personal Access Tokens"/>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button style={{...btn('n8n'),flex:1,justifyContent:'center'}} onClick={()=>testVerbinding('n8n')} disabled={bezig==='n8n'}>
                    {bezig==='n8n'?'Bezig…':'⚡ Verbinding testen'}
                  </button>
                  <button style={{...btn('primary'),flex:1,justifyContent:'center'}} onClick={()=>slaOp('n8n', ()=>setN8nCfg(p=>({...p,actief:true})))}>
                    Opslaan
                  </button>
                </div>
              </Sectie>

              <Sectie titel="📌 Uw API-eindpunten voor n8n">
                <div style={{fontSize:12,color:B.grijsTekst,marginBottom:12}}>Gebruik deze eindpunten in n8n HTTP Request nodes:</div>
                {[
                  {m:'POST', p:'/api/tickets',                   d:'Nieuw ticket aanmaken'},
                  {m:'POST', p:'/api/opdrachten',                d:'Nieuwe opdracht'},
                  {m:'PATCH',p:'/api/opdrachten/{id}/status',    d:'Status wijzigen'},
                  {m:'GET',  p:'/api/opdrachten',                d:'Alle opdrachten ophalen'},
                  {m:'GET',  p:'/api/tickets',                   d:'Alle tickets ophalen'},
                  {m:'POST', p:'/api/webhooks/whatsapp',         d:'WhatsApp bericht sturen'},
                  {m:'POST', p:'/api/webhooks/contact',          d:'Contactformulier'},
                ].map((e,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:`1px solid ${B.grijs}`}}>
                    <span style={{background:e.m==='GET'?'#DCFCE7':'#EDE9F6',color:e.m==='GET'?B.groen:B.paars,fontSize:10,fontWeight:800,padding:'2px 7px',borderRadius:4,fontFamily:'monospace',width:44,textAlign:'center',flexShrink:0}}>{e.m}</span>
                    <span style={{fontFamily:'monospace',fontSize:11,color:'#1D4ED8',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.p}</span>
                    <button style={{...btn('ghost',true),padding:'3px 6px',flexShrink:0}} onClick={()=>kopieer(`https://uw-dashboard.nl${e.p}`)}>📋</button>
                  </div>
                ))}
                <Info kleur="blauw">Voeg de header <code style={{background:B.grijs,padding:'1px 5px',borderRadius:4}}>Authorization: Bearer [uw-api-sleutel]</code> toe aan elk n8n HTTP Request.</Info>
              </Sectie>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <Sectie titel="🔄 Kant-en-klare n8n workflows">
                <div style={{fontSize:12,color:B.grijsTekst,marginBottom:12}}>Download en importeer direct in n8n:</div>
                {[
                  {emoji:'📧',titel:'E-mail → Ticket',sub:'IMAP polling elke 5 min + WhatsApp notificatie'},
                  {emoji:'💬',titel:'WhatsApp → Ticket',sub:'Meta webhook verwerken naar ticket'},
                  {emoji:'✅',titel:'Status → Klant notificeren',sub:'E-mail + WhatsApp bij statuswijziging'},
                  {emoji:'📋',titel:'Ticket → Opdracht',sub:'Automatisch opdracht bij behandeld ticket'},
                ].map((wf,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${B.grijs}`}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>{wf.emoji} {wf.titel}</div>
                      <div style={{fontSize:11,color:B.grijsTekst,marginTop:2}}>{wf.sub}</div>
                    </div>
                    <button style={{...btn('n8n',true),flexShrink:0}} onClick={()=>toast(`✓ "${wf.titel}" template gekopieerd`)}>📋 Template</button>
                  </div>
                ))}
                <button style={{...btn('n8n'),width:'100%',justifyContent:'center',marginTop:12}} onClick={()=>toast('✓ Alle workflows gedownload als gve-workflows.json')}>
                  ⬇️ Alle workflows downloaden (JSON)
                </button>
              </Sectie>

              <Sectie titel="🔐 Authenticatie in n8n instellen">
                <div style={{fontSize:12,color:B.grijsTekst,marginBottom:12}}>Voeg dit in elke n8n HTTP Request node toe:</div>
                <div style={{marginBottom:10}}>
                  <label style={lbl}>Header naam</label>
                  <div style={{display:'flex',gap:6}}><input readOnly value="Authorization" style={{...inp,fontFamily:'monospace',fontSize:12}}/><button style={btn('secondary',true)} onClick={()=>kopieer('Authorization')}>📋</button></div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={lbl}>Header waarde</label>
                  <div style={{display:'flex',gap:6}}><input readOnly value={`Bearer ${apiKeys[0]?.sleutel||'gve_uw_sleutel_hier'}`} style={{...inp,fontFamily:'monospace',fontSize:11,color:B.paars}}/><button style={btn('secondary',true)} onClick={()=>kopieer(`Bearer ${apiKeys[0]?.sleutel||''}`)}>📋</button></div>
                </div>
                <button style={{...btn('secondary'),fontSize:12}} onClick={()=>setTab('api')}>🔑 Beheer API-sleutels →</button>
              </Sectie>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: API-SLEUTELS
        ══════════════════════════════════════════════════════════════════════ */}
        {tab==='api' && (
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr',gap:16}}>
            <Sectie titel="🔑 API-sleutels beheren" sub="Gebruik API-sleutels om n8n, WhatsApp-bots of andere diensten toegang te geven tot uw dashboard.">
              {apiKeys.length===0 && <div style={{color:B.grijsTekst,fontSize:13,marginBottom:14}}>Nog geen API-sleutels aangemaakt.</div>}
              {apiKeys.map(k=>(
                <div key={k.id} style={{padding:'13px 0',borderBottom:`1px solid ${B.grijs}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8,gap:8}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:14}}>{k.naam}</div>
                      <div style={{fontSize:11,color:B.grijsTekst,marginTop:2}}>Aangemaakt: {k.aangemaakt} · {k.gebruik} verzoeken</div>
                    </div>
                    <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
                      <button onClick={()=>setApiKeys(p=>p.map(x=>x.id===k.id?{...x,actief:!x.actief}:x))}
                        style={{...btn(k.actief?'groen':'ghost',true),fontSize:11}}>
                        {k.actief?'● Actief':'○ Pauzeer'}
                      </button>
                      <button style={btn('danger',true)} onClick={()=>{setApiKeys(p=>p.filter(x=>x.id!==k.id));toast('✓ Sleutel verwijderd');}}>🗑</button>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <code style={{fontSize:11,background:B.grijs,padding:'6px 10px',borderRadius:6,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block',color:k.actief?B.paars:B.grijsTekst}}>{k.sleutel}</code>
                    <button style={btn('secondary',true)} onClick={()=>kopieer(k.sleutel)} title="Kopieer">📋</button>
                  </div>
                </div>
              ))}

              <div style={{marginTop:16,padding:14,background:B.paarsLight,borderRadius:8,border:`1px solid ${B.paars}30`}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:B.paars}}>+ Nieuwe API-sleutel genereren</div>
                <div style={{display:'flex',gap:8}}>
                  <input value={nieuweKeyNaam} onChange={e=>setNieuweKeyNaam(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&generateApiKey()}
                    placeholder="Naam bijv. n8n Workflow, WhatsApp Bot…" style={{...inp,flex:1}}/>
                  <button style={{...btn('primary'),flexShrink:0}} onClick={generateApiKey}>Genereer</button>
                </div>
              </div>

              {nNieuweKey && (
                <div style={{marginTop:12,padding:14,background:'#F0FDF4',borderRadius:8,borderLeft:`3px solid ${B.groen}`}}>
                  <div style={{fontWeight:700,fontSize:12,marginBottom:8,color:B.groen}}>✓ Kopieer nu — wordt daarna verborgen</div>
                  <div style={{display:'flex',gap:6}}>
                    <code style={{fontSize:11,background:B.wit,padding:'8px 12px',borderRadius:6,flex:1,wordBreak:'break-all',border:`1px solid ${B.grijsMid}`}}>{nNieuweKey}</code>
                    <button style={{...btn('groen'),flexShrink:0}} onClick={()=>kopieer(nNieuweKey)}>📋 Kopieer</button>
                  </div>
                </div>
              )}
            </Sectie>

            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <Sectie titel="📖 Hoe gebruik ik de sleutel?">
                <div style={{fontSize:12,color:B.grijsTekst,marginBottom:12,lineHeight:1.7}}>Voeg de sleutel toe als header bij elk API-verzoek vanuit n8n of uw eigen applicatie:</div>
                <div style={{marginBottom:10}}>
                  <label style={lbl}>In n8n HTTP Request → Headers</label>
                  <div style={{display:'flex',gap:6,marginBottom:6}}>
                    <input readOnly value="Authorization" style={{...inp,fontFamily:'monospace',fontSize:12,width:140,flexShrink:0}}/>
                    <input readOnly value={`Bearer ${apiKeys[0]?.sleutel||'gve_uw_sleutel'}`} style={{...inp,fontFamily:'monospace',fontSize:11,color:B.paars,flex:1}}/>
                    <button style={btn('secondary',true)} onClick={()=>kopieer(`Bearer ${apiKeys[0]?.sleutel||''}`)}>📋</button>
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={lbl}>Of als query parameter</label>
                  <div style={{display:'flex',gap:6}}>
                    <input readOnly value={`?api_key=${apiKeys[0]?.sleutel||'gve_uw_sleutel'}`} style={{...inp,fontFamily:'monospace',fontSize:11,color:B.paars,flex:1}}/>
                    <button style={btn('secondary',true)} onClick={()=>kopieer(`?api_key=${apiKeys[0]?.sleutel||''}`)}>📋</button>
                  </div>
                </div>
              </Sectie>

              <Sectie titel="⚡ Snel testen (curl)">
                <pre style={{background:'#1E1E1E',color:'#A3E635',padding:12,borderRadius:8,fontSize:10,overflow:'auto',lineHeight:1.8,marginBottom:10}}>{`curl -X POST \\
  https://uw-dashboard.nl/api/tickets \\
  -H "Authorization: Bearer ${apiKeys[0]?.sleutel||'gve_...'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "naam": "Jan Jansen",
    "van": "jan@email.nl",
    "telefoon": "06-12345678",
    "onderwerp": "Container aanvragen",
    "bericht": "Ik heb een container nodig",
    "bron": "n8n"
  }'`}</pre>
                <button style={{...btn('secondary',true),fontSize:11}} onClick={()=>kopieer(`curl -X POST https://uw-dashboard.nl/api/tickets -H "Authorization: Bearer ${apiKeys[0]?.sleutel||'gve_...'}" -H "Content-Type: application/json" -d '{"naam":"Test","van":"test@test.nl","bericht":"Test","bron":"n8n"}' `)}>📋 Kopieer curl commando</button>
              </Sectie>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: WEBHOOKS
        ══════════════════════════════════════════════════════════════════════ */}
        {tab==='webhooks' && (
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr',gap:16}}>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <Sectie titel="🔗 Uitgaande webhooks" sub="Het dashboard stuurt automatisch een bericht naar uw n8n of andere dienst bij bepaalde events.">
                {webhooks.length===0 && <div style={{color:B.grijsTekst,fontSize:13,marginBottom:14}}>Nog geen webhooks ingesteld.</div>}
                {webhooks.map(wh=>(
                  <div key={wh.id} style={{padding:'12px 0',borderBottom:`1px solid ${B.grijs}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8,gap:8}}>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13}}>{wh.naam}</div>
                        <div style={{fontSize:11,color:B.grijsTekst,marginTop:1}}>Laatste trigger: {wh.laatste}</div>
                      </div>
                      <div style={{display:'flex',gap:6,flexShrink:0}}>
                        <button onClick={()=>setWebhooks(p=>p.map(x=>x.id===wh.id?{...x,actief:!x.actief}:x))}
                          style={{...btn(wh.actief?'groen':'ghost',true),fontSize:11}}>
                          {wh.actief?'● Actief':'Pauzeer'}
                        </button>
                        <button style={btn('danger',true)} onClick={()=>{setWebhooks(p=>p.filter(x=>x.id!==wh.id));toast('✓ Webhook verwijderd');}}>🗑</button>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:6,marginBottom:7}}>
                      <code style={{fontSize:11,background:B.grijs,padding:'4px 8px',borderRadius:5,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{wh.url}</code>
                      <button style={btn('secondary',true)} onClick={()=>kopieer(wh.url)}>📋</button>
                    </div>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                      {wh.events.map(ev=><span key={ev} style={{background:B.paarsLight,color:B.paars,fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:10}}>{ev}</span>)}
                    </div>
                  </div>
                ))}

                <div style={{marginTop:14,padding:14,background:B.grijs,borderRadius:8}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:B.paars}}>+ Nieuwe webhook toevoegen</div>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    <div>
                      <label style={lbl}>Naam</label>
                      <input value={webhookNieuw.naam} onChange={e=>setWebhookNieuw(p=>({...p,naam:e.target.value}))} placeholder="bijv. n8n Status Update" style={inp}/>
                    </div>
                    <div>
                      <label style={lbl}>Webhook URL</label>
                      <input value={webhookNieuw.url} onChange={e=>setWebhookNieuw(p=>({...p,url:e.target.value}))} placeholder="https://n8n.jouwdomein.nl/webhook/gve-events" style={inp}/>
                    </div>
                    <div>
                      <label style={lbl}>Kies events om te ontvangen</label>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:4}}>
                        {['ticket.nieuw','ticket.behandeld','ticket.gesloten','opdracht.aangemaakt','opdracht.status_gewijzigd','opdracht.voltooid'].map(ev=>(
                          <button key={ev} onClick={()=>toggleEvent(ev)}
                            style={{padding:'5px 10px',borderRadius:20,border:`1.5px solid ${webhookNieuw.events.includes(ev)?B.paars:B.grijsMid}`,
                              cursor:'pointer',fontSize:11,fontWeight:600,transition:'all .15s',
                              background:webhookNieuw.events.includes(ev)?B.paars:B.wit,
                              color:webhookNieuw.events.includes(ev)?B.wit:B.grijsTekst}}>
                            {webhookNieuw.events.includes(ev)?'✓ ':''}{ev}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button style={{...btn('primary'),justifyContent:'center'}} onClick={addWebhook}>+ Webhook toevoegen</button>
                  </div>
                </div>
              </Sectie>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <Sectie titel="📦 Payload voorbeeld">
                <div style={{fontSize:12,color:B.grijsTekst,marginBottom:10}}>Dit ontvangt uw n8n bij elk event:</div>
                <pre style={{background:'#1E1E1E',color:'#A3E635',padding:12,borderRadius:8,fontSize:11,overflow:'auto',lineHeight:1.8,marginBottom:10}}>{`{
  "event": "opdracht.status_gewijzigd",
  "timestamp": "2026-06-23T09:14:00Z",
  "data": {
    "id": 2,
    "nummer": "GVE-2026-002",
    "naam": "Smit Constructie",
    "status": "voltooid",
    "type": "breng",
    "email": "lisa@smit.nl",
    "telefoon": "0317-654321"
  }
}`}</pre>
                <Info kleur="oranje">
                  💡 Gebruik <strong>opdracht.status_gewijzigd</strong> in n8n om automatisch een WhatsApp of e-mail te sturen naar de klant bij statuswijziging.
                </Info>
              </Sectie>

              <Sectie titel="🌐 Contactformulier webhook">
                <div style={{fontSize:12,color:B.grijsTekst,marginBottom:12}}>Koppel het contactformulier van uw website door berichten naar dit endpoint te sturen:</div>
                <div style={{marginBottom:10}}>
                  <label style={lbl}>Endpoint URL</label>
                  <div style={{display:'flex',gap:6}}>
                    <input readOnly value="https://uw-dashboard.nl/api/webhooks/contact" style={{...inp,fontFamily:'monospace',fontSize:11,color:B.paars,flex:1}}/>
                    <button style={btn('secondary',true)} onClick={()=>kopieer('https://uw-dashboard.nl/api/webhooks/contact')}>📋</button>
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={lbl}>Beveiligingstoken (stuur als header)</label>
                  <div style={{display:'flex',gap:6}}>
                    <input value={contactWh.secret} onChange={e=>setContactWh(p=>({...p,secret:e.target.value}))} style={{...inp,fontFamily:'monospace',fontSize:11,flex:1}}/>
                    <button style={btn('secondary',true)} onClick={()=>kopieer(contactWh.secret)}>📋</button>
                  </div>
                  <div style={{fontSize:11,color:B.grijsTekst,marginTop:4}}>Stuur als header: <code style={{background:B.grijs,padding:'1px 5px',borderRadius:3}}>X-Webhook-Token: {contactWh.secret}</code></div>
                </div>
                <button style={{...btn('primary'),width:'100%',justifyContent:'center'}} onClick={()=>toast('✓ Contactformulier webhook opgeslagen')}>Opslaan</button>
              </Sectie>
            </div>
          </div>
        )}

        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    );
  };

  // ── Bottom nav (mobile) ──────────────────────────────────────────────────────
  const BottomNav = () => (
    <div style={{position:'fixed',bottom:0,left:0,right:0,height:62,background:B.paarsDark,
      display:'flex',alignItems:'stretch',boxShadow:'0 -2px 12px rgba(54,21,80,.35)',zIndex:200,
      borderTop:'1px solid rgba(255,255,255,.08)'}}>
      {navItems.slice(0,6).map(item=>(
        <button key={item.key} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,border:'none',cursor:'pointer',position:'relative',background:pagina===item.key?'rgba(184,151,90,.2)':'transparent',color:pagina===item.key?B.goud:'rgba(255,255,255,.6)',borderTop:`2px solid ${pagina===item.key?B.goud:'transparent'}`,transition:'all .15s'}}
          onClick={()=>item.key==='formulier'?nieuwOpdracht():ga(item.key)}>
          <span style={{fontSize:17}}>{item.emoji}</span>
          <span style={{fontSize:9,fontWeight:600,letterSpacing:0.3}}>{item.label}</span>
          {item.badge>0&&<span style={{position:'absolute',top:5,right:'calc(50% - 20px)',background:B.paars,color:B.wit,fontSize:9,fontWeight:800,padding:'1px 5px',borderRadius:10}}>{item.badge}</span>}
        </button>
      ))}
    </div>
  );

  // ── Toast ────────────────────────────────────────────────────────────────────
  const Toast = () => toastMsg ? (
    <div style={{position:'fixed',bottom:isMobile?74:24,left:'50%',transform:'translateX(-50%)',
      background:B.zwart,color:B.wit,padding:'10px 20px',borderRadius:24,fontSize:13,fontWeight:600,
      boxShadow:'0 4px 20px rgba(0,0,0,.3)',zIndex:999,whiteSpace:'nowrap',transition:'all .3s'}}>
      {toastMsg}
    </div>
  ) : null;

  // ── Root ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{display:'flex',height:'100vh',background:'#F2EFF7',fontFamily:"'Inter',system-ui,sans-serif",color:B.zwart,overflow:'hidden'}}>
      {isMobile&&sidebarOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:300,display:'flex'}}>
          <div style={{width:260,background:B.paarsDark,display:'flex',flexDirection:'column',height:'100%',boxShadow:'4px 0 24px rgba(54,21,80,.5)'}}><SidebarContent/></div>
          <div style={{flex:1,background:'rgba(0,0,0,.5)'}} onClick={()=>setSidebarOpen(false)}/>
        </div>
      )}
      {!isMobile&&(
        <div style={{width:sidebarW,background:B.paarsDark,display:'flex',flexDirection:'column',transition:'width .22s ease',flexShrink:0,boxShadow:'3px 0 20px rgba(54,21,80,.3)',overflow:'hidden'}}>
          <SidebarContent/>
        </div>
      )}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',paddingBottom:isMobile?62:0}}>
        <div style={{background:B.wit,borderBottom:`1px solid ${B.grijsMid}`,padding:isMobile?'12px 16px':'13px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 1px 4px rgba(75,32,104,.08)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {isMobile&&<button onClick={()=>setSidebarOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:'4px 2px',display:'flex',flexDirection:'column',gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:20,height:2,background:B.paars,borderRadius:2}}/>)}</button>}
            {['detail','formulier'].includes(pagina)&&<button style={{...btn('ghost'),padding:'6px 8px',fontSize:16}} onClick={()=>{ga('opdrachten');setGesOpdracht(null);}}>←</button>}
            <div style={{fontSize:isMobile?15:18,fontWeight:900,color:B.zwart}}>{titels[pagina]||pagina}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {stats.openTickets>0&&!isMobile&&<button style={{...btn('ghost'),position:'relative',padding:'8px 10px'}} onClick={()=>ga('tickets')}>🎫<span style={{position:'absolute',top:-3,right:-3,background:B.rood,color:B.wit,fontSize:9,fontWeight:900,padding:'1px 5px',borderRadius:10}}>{stats.openTickets}</span></button>}
            {!isMobile&&<button style={btn('primary')} onClick={nieuwOpdracht}>+ Nieuwe opdracht</button>}
            <div style={{width:34,height:34,background:`linear-gradient(135deg,${B.paars},${B.paarsMid})`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:B.wit,fontWeight:900,fontSize:11,flexShrink:0}}>GE</div>
          </div>
        </div>
        <div style={{flex:1,overflow:'auto',padding:isMobile?'14px 14px 0':'20px 24px'}}>
          {pagina==='dashboard'    && <PaginaDashboard/>}
          {pagina==='tickets'      && <PaginaTickets/>}
          {pagina==='opdrachten'   && <PaginaOpdrachten/>}
          {pagina==='ophaal'       && <PaginaOpdrachten typeFilter="ophaal"/>}
          {pagina==='breng'        && <PaginaOpdrachten typeFilter="breng"/>}
          {pagina==='integraties'  && <PaginaIntegraties/>}
          {pagina==='formulier'    && <PaginaFormulier/>}
          {pagina==='detail'       && <PaginaDetail/>}
        </div>
      </div>
      {isMobile&&<BottomNav/>}
      <Toast/>
      <style>{`
        *{box-sizing:border-box;margin:0;}
        input:focus,select:focus,textarea:focus{border-color:${B.paars}!important;box-shadow:0 0 0 3px ${B.paars}22;outline:none;}
        button:hover{opacity:.87;}
        pre{margin:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${B.grijs};}
        ::-webkit-scrollbar-thumb{background:${B.paars}40;border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:${B.paars}80;}
        @media(max-width:767px){input,select,textarea{font-size:16px!important;}}
      `}</style>
    </div>
  );
}
