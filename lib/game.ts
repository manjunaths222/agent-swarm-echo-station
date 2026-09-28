export type AgentId = 'nova' | 'cipher' | 'atlas' | 'sage';
export type Mode = 'team' | 'single' | 'independent';
export const AGENTS = [
 {id:'nova',name:'Nova',role:'Explorer',room:'Maintenance',color:'#ffba76',symbol:'N'},
 {id:'cipher',name:'Cipher',role:'Decoder',room:'Archive',color:'#a6a0ff',symbol:'C'},
 {id:'atlas',name:'Atlas',role:'Engineer',room:'Control',color:'#67dcf0',symbol:'A'},
 {id:'sage',name:'Sage',role:'Investigator',room:'Laboratory',color:'#87e3ba',symbol:'S'},
] as const;
export type Evidence = {id:string;title:string;text:string;owner:AgentId;kind:string};
export type Action = {type:'inspect'|'share'|'operate'|'wait';target?:string;recipient?:AgentId|'team';evidence?:string[];message?:string};
export type Event = {id:number;tick:number;agent:AgentId|'system';type:'discovery'|'message'|'action'|'failure'|'system';text:string;evidence:string[];recipient?:string};
export type Game = {seed:number;mode:Mode;tick:number;turn:number;phase:'ready'|'running'|'escaped'|'stalled';known:Record<AgentId,string[]>;sent:Record<AgentId,string[]>;events:Event[];cooling:number|null;power:boolean;decoded:boolean;holds:AgentId[];outage:boolean;repaired:boolean;disrupted:boolean;failures:number;calls:number;tokens:number;inputTokens:number;outputTokens:number;lastChange:number;statuses:Record<AgentId,string>};
const ids:AgentId[] = ['nova','cipher','atlas','sage'];
const blank=():Record<AgentId,string[]>=>({nova:[],cipher:[],atlas:[],sage:[]});
export function createGame(mode:Mode='team',seed=1):Game{return {seed,mode,tick:0,turn:0,phase:'ready',known:blank(),sent:blank(),events:[],cooling:null,power:false,decoded:false,holds:[],outage:false,repaired:false,disrupted:false,failures:0,calls:0,tokens:0,inputTokens:0,outputTokens:0,lastChange:0,statuses:{nova:'Awaiting deployment',cipher:'Awaiting deployment',atlas:'Awaiting deployment',sage:'Awaiting deployment'}};}
export function evidenceFor(seed:number):Evidence[]{const code=String(3000+((seed*1379)%6000));return [
 {id:'M-01',owner:'nova',kind:'WIRING',title:'Power-routing schematic',text:'Triangle circuit must activate before circle circuit.'},
 {id:'M-02',owner:'nova',kind:'PROTOCOL',title:'Manual relay procedure',text:'After power and authorization, Nova must hold the maintenance relay while Atlas holds the control relay. Both holds latch until a power failure.'},
 {id:'A-01',owner:'cipher',kind:'TRANSLATION',title:'Station symbol lexicon',text:'Triangle = cooling. Circle = main power. Square = vent. Do not activate the vent.'},
 {id:'A-02',owner:'cipher',kind:'ARCHIVED',title:'Superseded access memo',text:'Old door code 1904. Marked superseded. Use the latest laboratory record, not this code.'},
 {id:'C-01',owner:'atlas',kind:'HARDWARE',title:'Control console',text:'Available operations: cooling, power, vent, authorize:CODE, hold. Starting main power without stable cooling triggers a reset.'},
 {id:'C-02',owner:'atlas',kind:'INTERLOCK',title:'Exit interlock',text:'Sage can operate exit only after power, a valid authorization, and latched maintenance and control relays.'},
 {id:'L-01',owner:'sage',kind:'SAFETY',title:'Thermal stabilization note',text:'Cooling must remain active for at least two simulation ticks before main power starts.'},
 {id:'L-02',owner:'sage',kind:'CURRENT',title:'Latest access record',text:`Current authorization code is ${code}. This record replaces all archived access memos.`},
 {id:'M-03',owner:'nova',kind:'RECOVERY',title:'Emergency bypass',text:'Following a relay failure, Nova must operate repair before cooling and power can be restored.'},
 ];}
export function knowledge(g:Game,id:AgentId){return g.mode==='single'?[...new Set(Object.values(g.known).flat())]:g.known[id];}
export function observations(g:Game,id:AgentId){const k=knowledge(g,id);return evidenceFor(g.seed).filter(e=>k.includes(e.id));}
export function visibleObjects(g:Game,id:AgentId){return evidenceFor(g.seed).filter(e=>e.owner===id&&(e.id!=='M-03'||g.disrupted));}
function emit(g:Game,agent:Event['agent'],type:Event['type'],text:string,evidence:string[]=[],recipient?:string){g.events.push({id:g.events.length,tick:g.tick,agent,type,text,evidence,recipient});if(agent!=='system')g.statuses[agent]=text;}
export function activeAgent(g:Game):AgentId{return ids[g.turn%4];}
export function applyAction(previous:Game,id:AgentId,a:Action):Game{
 const g=structuredClone(previous);if(g.phase==='escaped'||g.phase==='stalled')return g;g.phase='running';g.tick++;g.turn++;
 const before=JSON.stringify([g.known,g.cooling,g.power,g.decoded,g.holds,g.outage]);
 const fail=(text:string)=>{g.failures++;emit(g,id,'failure',text);};
 if(a.type==='inspect'){
  const e=visibleObjects(g,id).find(e=>e.id===a.target);
  if(!e)fail('Inspection rejected: this object is not available in my room.');
  else if(!g.known[id].includes(e.id)){g.known[id].push(e.id);emit(g,id,'discovery',e.text,[e.id]);}
  else emit(g,id,'action','Rechecked '+e.title+'.',[e.id]);
 }else if(a.type==='share'){
  const ev=(a.evidence||[]).filter(e=>knowledge(g,id).includes(e));
  if(g.mode==='independent')fail('Communication is disabled in this experiment.');
  else if(!ev.length)fail('Message rejected: attach evidence you have inspected or received.');
  else {const recipients=a.recipient&&a.recipient!=='team'?[a.recipient]:ids.filter(x=>x!==id);if(recipients.some(r=>!ids.includes(r as AgentId))){fail('Unknown recipient.');return g;}
   recipients.forEach(r=>{g.known[r as AgentId]=[...new Set([...g.known[r as AgentId],...ev])];});g.sent[id]=[...new Set([...g.sent[id],...ev])];emit(g,id,'message',(a.message||'Sharing verified station evidence.').slice(0,420),ev,a.recipient||'team');}
 }else if(a.type==='operate'){
  if(a.target==='repair'&&id==='nova'&&g.outage){g.outage=false;g.repaired=true;emit(g,id,'action','Bypass installed. Atlas, cooling and main power can be restored.');}
  else if(a.target==='cooling'&&id==='atlas'&&!g.outage){g.cooling=g.tick;emit(g,id,'action','Cooling circuit engaged. Waiting for thermal stabilization.');}
  else if(a.target==='power'&&id==='atlas'&&!g.outage){if(g.cooling!==null&&g.tick-g.cooling>=2){g.power=true;emit(g,id,'action','Main power restored. Station systems are online.');}else{g.cooling=null;g.power=false;g.holds=[];fail('Power rejected: cooling is not stable. Circuit reset.');}}
  else if(a.target?.startsWith('authorize:')&&id==='atlas'){const correct=evidenceFor(g.seed).find(e=>e.id==='L-02')!.text.match(/\d{4}/)![0];if(g.power&&a.target===`authorize:${correct}`){g.decoded=true;emit(g,id,'action','Current access code accepted. Exit authorization granted.',['L-02']);}else fail('Authorization rejected: incorrect code or power offline.');}
  else if(a.target==='hold'&&(id==='nova'||id==='atlas')&&g.power&&g.decoded){if(!g.holds.includes(id))g.holds.push(id);emit(g,id,'action',`Relay latched. ${id==='nova'?'Maintenance':'Control'} is ready for the exit sequence.`);}
  else if(a.target==='exit'&&id==='sage'&&g.power&&g.decoded&&g.holds.includes('nova')&&g.holds.includes('atlas')){g.phase='escaped';emit(g,id,'action','Both relays confirmed. Exit unlocked. All four agents are clear.');}
  else fail('Operation rejected: device unavailable or interlock conditions not met.');
 }else if(a.type==='wait') {g.statuses[id]=(a.message||'Waiting for new evidence.').slice(0,160);}
 else fail('Unrecognized action.');
 const after=JSON.stringify([g.known,g.cooling,g.power,g.decoded,g.holds,g.outage]);if(before!==after)g.lastChange=g.tick;
 if(g.phase!=='escaped'&&(g.tick-g.lastChange>=16||g.tick>=100)){g.phase='stalled';emit(g,'system','system','Run stopped: no further progress within the action budget. Review the missing evidence or change experiment mode.');}
 return g;
}
export function policy(g:Game,id:AgentId):Action{
 const known=knowledge(g,id), has=(...xs:string[])=>xs.every(x=>known.includes(x));
 const unseen=visibleObjects(g,id).find(e=>!known.includes(e.id));if(unseen)return {type:'inspect',target:unseen.id};
 const unsent=g.known[id].filter(e=>!g.sent[id].includes(e)&&evidenceFor(g.seed).find(x=>x.id===e)?.owner===id);
 if(g.mode==='team'&&unsent.length){const messages:Record<AgentId,string>={nova:'I mapped the wiring and relay sequence. Atlas, coordinate power with the thermal note; I will handle maintenance.',cipher:'Symbols translated. The archived code is superseded; Sage, we need the current laboratory record.',atlas:'Console and exit interlock mapped. Nova and I must latch the relays before Sage opens the exit.',sage:'Found the cooling delay and current code. Atlas, wait two ticks before power and use the latest record.'};return {type:'share',evidence:unsent,recipient:'team',message:unsent.includes('M-03')?'Emergency bypass found. I will repair the failed relay; Atlas can then restore cooling and power.':messages[id]};}
 if(g.outage){if(id==='nova'&&has('M-03'))return {type:'operate',target:'repair'};return {type:'wait',message:'Power failure. Waiting for Nova to repair the bypass.'};}
 if(id==='atlas'){
  if(!g.power&&has('M-01','A-01','L-01')){if(g.cooling===null)return {type:'operate',target:'cooling'};if(g.tick-g.cooling>=1)return {type:'operate',target:'power'};}
  if(g.power&&!g.decoded&&has('A-02','L-02')){const code=observations(g,id).find(e=>e.id==='L-02')!.text.match(/\d{4}/)![0];return {type:'operate',target:`authorize:${code}`};}
 }
 if((id==='atlas'||id==='nova')&&g.power&&g.decoded&&has('M-02','C-02')&&!g.holds.includes(id))return {type:'operate',target:'hold'};
 if(id==='sage'&&g.power&&g.decoded&&g.holds.length===2&&has('M-02','C-02'))return {type:'operate',target:'exit'};
 return {type:'wait',message:!g.power?'Waiting for the complete power protocol.':!g.decoded?'Cross-checking the current access record.':'Waiting for relay acknowledgements.'};
}
export function disrupt(previous:Game):Game{const g=structuredClone(previous);if(g.disrupted||g.phase==='escaped')return g;g.disrupted=true;g.outage=true;g.power=false;g.cooling=null;g.holds=[];g.lastChange=g.tick;emit(g,'system','system','Injected fault: maintenance relay failed. Power lost; an emergency bypass is now available to inspect.');return g;}
export function agentPacket(g:Game,id:AgentId){return {agent:id,mode:g.mode,tick:g.tick,lastDecision:g.statuses[id],unsharedDiscoveries:visibleObjects(g,id).filter(e=>knowledge(g,id).includes(e.id)&&!g.sent[id].includes(e.id)).map(e=>e.id),evidence:observations(g,id).map(e=>({id:e.id,text:e.text})),inspectable:visibleObjects(g,id).map(e=>({id:e.id,title:e.title,inspected:knowledge(g,id).includes(e.id)})),station:{power:g.power,coolingSince:g.cooling,authorized:g.decoded,relays:g.holds,outage:g.outage},inbox:g.events.filter(e=>e.type==='message'&&(e.recipient==='team'||e.recipient===id)).slice(-2).map(e=>({from:e.agent,text:e.text,evidence:e.evidence})),recentActions:g.events.filter(e=>e.type==='action'||e.type==='failure').slice(-2).map(e=>({agent:e.agent,result:e.text})),operations:id==='atlas'?['cooling','power','authorize:CODE','hold']:id==='nova'?['repair','hold']:id==='sage'?['exit']:[],alreadyShared:g.sent[id]};}
