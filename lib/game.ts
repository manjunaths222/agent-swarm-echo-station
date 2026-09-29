export type AgentId = 'nova' | 'cipher' | 'atlas' | 'sage';
export type Mode = 'team' | 'single' | 'independent';
export type ScenarioId = 'last-signal' | 'cryo-breach' | 'solar-blackout';

export const AGENTS = [
 {id:'nova',name:'Nova',role:'Explorer',room:'Maintenance',color:'#ffba76',symbol:'N'},
 {id:'cipher',name:'Cipher',role:'Decoder',room:'Archive',color:'#a6a0ff',symbol:'C'},
 {id:'atlas',name:'Atlas',role:'Engineer',room:'Control',color:'#67dcf0',symbol:'A'},
 {id:'sage',name:'Sage',role:'Investigator',room:'Laboratory',color:'#87e3ba',symbol:'S'},
] as const;

export type Evidence = {id:string;title:string;text:string;owner:AgentId;kind:string};
export type Action = {type:'inspect'|'share'|'operate'|'wait';target?:string;recipient?:AgentId|'team';evidence?:string[];message?:string};
export type Event = {id:number;tick:number;agent:AgentId|'system';type:'discovery'|'message'|'action'|'failure'|'system';text:string;evidence:string[];recipient?:string};
type Objective = {title:string;pending:string;complete:string};
type ScenarioCopy = {cooling:string;power:string;authorized:string;repair:string;outageWait:string;exit:string;fault:string};
export type MissionScenario = {
 id:ScenarioId;number:string;title:string;tagline:string;location:string;sector:string;coordinates:string;
 briefTitle:string;brief:string;success:string;stabilizationTicks:number;decoyCode:string;accent:string;
 objectives:[Objective,Objective,Objective];messages:Record<AgentId,string>;copy:ScenarioCopy;
};

export const SCENARIOS:MissionScenario[] = [
 {
  id:'last-signal',number:'01',title:'The last signal',tagline:'Four agents. Scattered evidence. One way out.',location:'Research station 07',sector:'ECHO / SECTOR 07',coordinates:'28° 14′ N   082° 06′ E',accent:'#c3f593',stabilizationTicks:2,decoyCode:'1904',
  briefTitle:'Get everyone out.',brief:'The station is sealed. Every agent holds a piece of the solution. Let them find it together.',success:'All four agents are clear.',
  objectives:[
   {title:'Restore main power',pending:'Combine wiring + thermal evidence',complete:'Station systems online'},
   {title:'Recover the access code',pending:'Resolve conflicting access records',complete:'Current record verified'},
   {title:'Coordinate the escape',pending:'Latch both relays. Open the exit.',complete:'All four agents evacuated'},
  ],
  messages:{nova:'I mapped the wiring and relay sequence. Atlas, coordinate power with the thermal note; I will handle maintenance.',cipher:'Symbols translated. The archived code is superseded; Sage, we need the current laboratory record.',atlas:'Console and exit interlock mapped. Nova and I must latch the relays before Sage opens the exit.',sage:'Found the cooling delay and current code. Atlas, wait two ticks before power and use the latest record.'},
  copy:{cooling:'Cooling circuit engaged. Waiting for thermal stabilization.',power:'Main power restored. Station systems are online.',authorized:'Current access code accepted. Exit authorization granted.',repair:'Bypass installed. Atlas, cooling and main power can be restored.',outageWait:'Power failure. Waiting for Nova to repair the bypass.',exit:'Both relays confirmed. Exit unlocked. All four agents are clear.',fault:'Injected fault: maintenance relay failed. Power lost; an emergency bypass is now available to inspect.'},
 },
 {
  id:'cryo-breach',number:'02',title:'Cryo breach',tagline:'A failing vault. A hidden protocol. Minutes to containment.',location:'Cryogenic vault 12',sector:'ECHO / CRYO 12',coordinates:'71° 18′ N   156° 44′ W',accent:'#72d8ff',stabilizationTicks:3,decoyCode:'6621',
  briefTitle:'Contain the breach.',brief:'The specimen vault is warming. The team must reconstruct the containment sequence before the failsafe releases.',success:'The vault is stable and sealed.',
  objectives:[
   {title:'Stabilize the coolant loop',pending:'Combine valve routing + ice-core data',complete:'Containment temperature stable'},
   {title:'Verify the purge key',pending:'Reject the retired quarantine record',complete:'Current purge key accepted'},
   {title:'Seal the cryogenic vault',pending:'Latch both pressure locks. Seal vault.',complete:'Cryogenic vault secured'},
  ],
  messages:{nova:'I found the valve order and manual pressure lock. Atlas, pair it with the ice-core timing.',cipher:'Quarantine symbols decoded. The archived purge key is retired; we need Sage’s current assay record.',atlas:'Containment console mapped. Nova and I must hold both pressure locks before Sage seals the vault.',sage:'Ice-core timing and the live purge key recovered. Hold the coolant loop for three ticks before containment power.'},
  copy:{cooling:'Coolant loop engaged. Waiting for the ice core to stabilize.',power:'Containment grid online. Vault temperature is holding.',authorized:'Current purge key accepted. Seal controls unlocked.',repair:'Manual shunt installed. Atlas can restart coolant and containment power.',outageWait:'Containment fault. Waiting for Nova to install the manual shunt.',exit:'Pressure locks synchronized. Cryogenic vault sealed and stable.',fault:'Injected fault: coolant manifold failed. Containment power dropped; a manual shunt is now available to inspect.'},
 },
 {
  id:'solar-blackout',number:'03',title:'Solar blackout',tagline:'A charged sky. A silent array. One narrow transmission window.',location:'Helios relay outpost',sector:'ECHO / HELIOS 03',coordinates:'18° 31′ S   146° 49′ E',accent:'#ffb45f',stabilizationTicks:4,decoyCode:'4510',
  briefTitle:'Send the distress signal.',brief:'A solar storm has silenced the long-range array. Rebuild the shield sequence, tune the live frequency, and align both antenna relays.',success:'The distress signal cleared the storm.',
  objectives:[
   {title:'Charge the storm shield',pending:'Combine bus routing + flare timing',complete:'Storm shield fully charged'},
   {title:'Tune the live frequency',pending:'Resolve conflicting frequency logs',complete:'Live carrier frequency locked'},
   {title:'Transmit beyond the storm',pending:'Align both relays. Send the burst.',complete:'Distress signal transmitted'},
  ],
  messages:{nova:'Power-bus route and antenna relay procedure recovered. Atlas, use Sage’s flare timing before charging the shield.',cipher:'Carrier notation decoded. The archived frequency is obsolete; Sage has the current solar-window record.',atlas:'Array console mapped. Nova and I must align both antenna relays before Sage sends the burst.',sage:'Flare timing and live carrier recovered. The shield must charge for four ticks before the array comes online.'},
  copy:{cooling:'Storm shield charging. Holding through the flare peak.',power:'Array power restored. The storm shield is stable.',authorized:'Live carrier frequency accepted. Transmitter armed.',repair:'Surge bridge installed. Atlas can recharge the shield and array.',outageWait:'Array surge detected. Waiting for Nova to install the bridge.',exit:'Both antenna relays aligned. Distress burst transmitted beyond the storm.',fault:'Injected fault: solar surge disabled the array bus. A surge bridge is now available to inspect.'},
 },
];

export const scenarioFor=(id:ScenarioId)=>SCENARIOS.find(s=>s.id===id) || SCENARIOS[0];
const codeFor=(seed:number,scenario:ScenarioId)=>{
 const index=SCENARIOS.findIndex(s=>s.id===scenario),base=[3000,2000,1000][index],step=[1379,1877,2089][index],span=[6000,7000,8000][index];
 return String(base+((seed*step)%span)).padStart(4,'0');
};

export type Game = {scenario:ScenarioId;seed:number;mode:Mode;tick:number;turn:number;phase:'ready'|'running'|'escaped'|'stalled';known:Record<AgentId,string[]>;sent:Record<AgentId,string[]>;events:Event[];cooling:number|null;power:boolean;decoded:boolean;holds:AgentId[];outage:boolean;repaired:boolean;disrupted:boolean;failures:number;calls:number;tokens:number;inputTokens:number;outputTokens:number;lastChange:number;statuses:Record<AgentId,string>};
const ids:AgentId[] = ['nova','cipher','atlas','sage'];
const blank=():Record<AgentId,string[]>=>({nova:[],cipher:[],atlas:[],sage:[]});

export function createGame(mode:Mode='team',seed=1,scenario:ScenarioId='last-signal'):Game{return {scenario,seed,mode,tick:0,turn:0,phase:'ready',known:blank(),sent:blank(),events:[],cooling:null,power:false,decoded:false,holds:[],outage:false,repaired:false,disrupted:false,failures:0,calls:0,tokens:0,inputTokens:0,outputTokens:0,lastChange:0,statuses:{nova:'Awaiting deployment',cipher:'Awaiting deployment',atlas:'Awaiting deployment',sage:'Awaiting deployment'}};}

export function evidenceFor(seed:number,scenario:ScenarioId='last-signal'):Evidence[]{
 const mission=scenarioFor(scenario),code=codeFor(seed,scenario);
 if(scenario==='cryo-breach')return [
  {id:'M-01',owner:'nova',kind:'VALVES',title:'Coolant valve schematic',text:'Intake loop must activate before the containment grid.'},
  {id:'M-02',owner:'nova',kind:'PROTOCOL',title:'Manual pressure-lock procedure',text:'After containment power and purge verification, Nova must hold the service lock while Atlas holds the control lock. Both locks release after a power failure.'},
  {id:'A-01',owner:'cipher',kind:'TRANSLATION',title:'Quarantine symbol lexicon',text:'Triangle = coolant intake. Circle = containment power. Square = emergency vent. Do not vent the specimen vault.'},
  {id:'A-02',owner:'cipher',kind:'ARCHIVED',title:'Retired quarantine memo',text:`Old purge key ${mission.decoyCode}. Marked retired. Use the current laboratory assay record.`},
  {id:'C-01',owner:'atlas',kind:'HARDWARE',title:'Containment console',text:'Available operations: coolant, containment power, vent, verify:KEY, pressure lock. Powering the grid before the ice core stabilizes resets the loop.'},
  {id:'C-02',owner:'atlas',kind:'INTERLOCK',title:'Vault seal interlock',text:'Sage can seal the vault only after stable containment power, a valid purge key, and both pressure locks.'},
  {id:'L-01',owner:'sage',kind:'SAFETY',title:'Ice-core stabilization report',text:`The coolant loop must run for at least ${mission.stabilizationTicks} simulation ticks before containment power starts.`},
  {id:'L-02',owner:'sage',kind:'CURRENT',title:'Current assay record',text:`Current purge key is ${code}. This assay replaces all archived quarantine memos.`},
  {id:'M-03',owner:'nova',kind:'RECOVERY',title:'Manual coolant shunt',text:'Following a manifold failure, Nova must operate repair before coolant and containment power can restart.'},
 ];
 if(scenario==='solar-blackout')return [
  {id:'M-01',owner:'nova',kind:'POWER BUS',title:'Shield bus routing map',text:'The storm-shield circuit must charge before the transmitter array comes online.'},
  {id:'M-02',owner:'nova',kind:'PROTOCOL',title:'Dual-antenna alignment procedure',text:'After shield power and carrier lock, Nova must hold the field relay while Atlas holds the control relay. Both alignments are lost after a power surge.'},
  {id:'A-01',owner:'cipher',kind:'TRANSLATION',title:'Helios carrier notation',text:'Triangle = shield charge. Circle = array power. Square = ground dump. Do not trigger the ground dump.'},
  {id:'A-02',owner:'cipher',kind:'ARCHIVED',title:'Obsolete frequency log',text:`Archived carrier ${mission.decoyCode}. Marked invalid after the last flare. Use the current solar-window record.`},
  {id:'C-01',owner:'atlas',kind:'HARDWARE',title:'Array control deck',text:'Available operations: shield charge, array power, ground dump, tune:FREQ, relay align. Starting the array before shield stabilization trips the bus.'},
  {id:'C-02',owner:'atlas',kind:'INTERLOCK',title:'Transmission interlock',text:'Sage can transmit only after stable array power, a valid carrier, and aligned field and control relays.'},
  {id:'L-01',owner:'sage',kind:'FORECAST',title:'Solar flare timing model',text:`The storm shield must charge for at least ${mission.stabilizationTicks} simulation ticks before array power starts.`},
  {id:'L-02',owner:'sage',kind:'CURRENT',title:'Live solar-window record',text:`Current carrier frequency is ${code}. This record replaces all archived frequency logs.`},
  {id:'M-03',owner:'nova',kind:'RECOVERY',title:'Surge bridge',text:'Following a solar surge, Nova must operate repair before the shield and array can recharge.'},
 ];
 return [
  {id:'M-01',owner:'nova',kind:'WIRING',title:'Power-routing schematic',text:'Triangle circuit must activate before circle circuit.'},
  {id:'M-02',owner:'nova',kind:'PROTOCOL',title:'Manual relay procedure',text:'After power and authorization, Nova must hold the maintenance relay while Atlas holds the control relay. Both holds latch until a power failure.'},
  {id:'A-01',owner:'cipher',kind:'TRANSLATION',title:'Station symbol lexicon',text:'Triangle = cooling. Circle = main power. Square = vent. Do not activate the vent.'},
  {id:'A-02',owner:'cipher',kind:'ARCHIVED',title:'Superseded access memo',text:`Old door code ${mission.decoyCode}. Marked superseded. Use the latest laboratory record, not this code.`},
  {id:'C-01',owner:'atlas',kind:'HARDWARE',title:'Control console',text:'Available operations: cooling, power, vent, authorize:CODE, hold. Starting main power without stable cooling triggers a reset.'},
  {id:'C-02',owner:'atlas',kind:'INTERLOCK',title:'Exit interlock',text:'Sage can operate exit only after power, a valid authorization, and latched maintenance and control relays.'},
  {id:'L-01',owner:'sage',kind:'SAFETY',title:'Thermal stabilization note',text:`Cooling must remain active for at least ${mission.stabilizationTicks} simulation ticks before main power starts.`},
  {id:'L-02',owner:'sage',kind:'CURRENT',title:'Latest access record',text:`Current authorization code is ${code}. This record replaces all archived access memos.`},
  {id:'M-03',owner:'nova',kind:'RECOVERY',title:'Emergency bypass',text:'Following a relay failure, Nova must operate repair before cooling and power can be restored.'},
 ];
}

export function knowledge(g:Game,id:AgentId){return g.mode==='single'?[...new Set(Object.values(g.known).flat())]:g.known[id];}
export function observations(g:Game,id:AgentId){const k=knowledge(g,id);return evidenceFor(g.seed,g.scenario).filter(e=>k.includes(e.id));}
export function visibleObjects(g:Game,id:AgentId){return evidenceFor(g.seed,g.scenario).filter(e=>e.owner===id&&(e.id!=='M-03'||g.disrupted));}
function emit(g:Game,agent:Event['agent'],type:Event['type'],text:string,evidence:string[]=[],recipient?:string){g.events.push({id:g.events.length,tick:g.tick,agent,type,text,evidence,recipient});if(agent!=='system')g.statuses[agent]=text;}
export function activeAgent(g:Game):AgentId{return ids[g.turn%4];}

export function applyAction(previous:Game,id:AgentId,a:Action):Game{
 const g=structuredClone(previous);if(g.phase==='escaped'||g.phase==='stalled')return g;g.phase='running';g.tick++;g.turn++;
 const mission=scenarioFor(g.scenario),before=JSON.stringify([g.known,g.cooling,g.power,g.decoded,g.holds,g.outage]);
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
   recipients.forEach(r=>{g.known[r as AgentId]=[...new Set([...g.known[r as AgentId],...ev])];});g.sent[id]=[...new Set([...g.sent[id],...ev])];emit(g,id,'message',(a.message||'Sharing verified mission evidence.').slice(0,420),ev,a.recipient||'team');}
 }else if(a.type==='operate'){
  if(a.target==='repair'&&id==='nova'&&g.outage){g.outage=false;g.repaired=true;emit(g,id,'action',mission.copy.repair);}
  else if(a.target==='cooling'&&id==='atlas'&&!g.outage){g.cooling=g.tick;emit(g,id,'action',mission.copy.cooling);}
  else if(a.target==='power'&&id==='atlas'&&!g.outage){if(g.cooling!==null&&g.tick-g.cooling>=mission.stabilizationTicks){g.power=true;emit(g,id,'action',mission.copy.power);}else{g.cooling=null;g.power=false;g.holds=[];fail('Power rejected: the stabilization interval is incomplete. Circuit reset.');}}
  else if(a.target?.startsWith('authorize:')&&id==='atlas'){const correct=evidenceFor(g.seed,g.scenario).find(e=>e.id==='L-02')!.text.match(/\d{4}/)![0];if(g.power&&a.target===`authorize:${correct}`){g.decoded=true;emit(g,id,'action',mission.copy.authorized,['L-02']);}else fail('Authorization rejected: incorrect code or power offline.');}
  else if(a.target==='hold'&&(id==='nova'||id==='atlas')&&g.power&&g.decoded){if(!g.holds.includes(id))g.holds.push(id);emit(g,id,'action',`Relay latched. ${id==='nova'?'Maintenance':'Control'} is ready for the final sequence.`);}
  else if(a.target==='exit'&&id==='sage'&&g.power&&g.decoded&&g.holds.includes('nova')&&g.holds.includes('atlas')){g.phase='escaped';emit(g,id,'action',mission.copy.exit);}
  else fail('Operation rejected: device unavailable or interlock conditions not met.');
 }else if(a.type==='wait'){g.statuses[id]=(a.message||'Waiting for new evidence.').slice(0,160);}
 else fail('Unrecognized action.');
 const after=JSON.stringify([g.known,g.cooling,g.power,g.decoded,g.holds,g.outage]);if(before!==after)g.lastChange=g.tick;
 if(g.phase!=='escaped'&&(g.tick-g.lastChange>=16||g.tick>=100)){g.phase='stalled';emit(g,'system','system','Run stopped: no further progress within the action budget. Review the missing evidence or change experiment mode.');}
 return g;
}

export function policy(g:Game,id:AgentId):Action{
 const mission=scenarioFor(g.scenario),known=knowledge(g,id),has=(...xs:string[])=>xs.every(x=>known.includes(x));
 const unseen=visibleObjects(g,id).find(e=>!known.includes(e.id));if(unseen)return {type:'inspect',target:unseen.id};
 const unsent=g.known[id].filter(e=>!g.sent[id].includes(e)&&evidenceFor(g.seed,g.scenario).find(x=>x.id===e)?.owner===id);
 if(g.mode==='team'&&unsent.length)return {type:'share',evidence:unsent,recipient:'team',message:unsent.includes('M-03')?'Recovery hardware found. I will repair the failed circuit; Atlas can then restart the sequence.':mission.messages[id]};
 if(g.outage){if(id==='nova'&&has('M-03'))return {type:'operate',target:'repair'};return {type:'wait',message:mission.copy.outageWait};}
 if(id==='atlas'){
  if(!g.power&&has('M-01','A-01','L-01')){if(g.cooling===null)return {type:'operate',target:'cooling'};if(g.tick-g.cooling>=mission.stabilizationTicks-1)return {type:'operate',target:'power'};}
  if(g.power&&!g.decoded&&has('A-02','L-02')){const code=observations(g,id).find(e=>e.id==='L-02')!.text.match(/\d{4}/)![0];return {type:'operate',target:`authorize:${code}`};}
 }
 if((id==='atlas'||id==='nova')&&g.power&&g.decoded&&has('M-02','C-02')&&!g.holds.includes(id))return {type:'operate',target:'hold'};
 if(id==='sage'&&g.power&&g.decoded&&g.holds.length===2&&has('M-02','C-02'))return {type:'operate',target:'exit'};
 return {type:'wait',message:!g.power?'Waiting for the complete stabilization protocol.':!g.decoded?'Cross-checking the current authorization record.':'Waiting for relay acknowledgements.'};
}

export function disrupt(previous:Game):Game{const g=structuredClone(previous);if(g.disrupted||g.phase==='escaped')return g;g.disrupted=true;g.outage=true;g.power=false;g.cooling=null;g.holds=[];g.lastChange=g.tick;emit(g,'system','system',scenarioFor(g.scenario).copy.fault);return g;}
export function agentPacket(g:Game,id:AgentId){const mission=scenarioFor(g.scenario);return {agent:id,mode:g.mode,scenario:{id:mission.id,title:mission.title,brief:mission.brief},tick:g.tick,lastDecision:g.statuses[id],unsharedDiscoveries:visibleObjects(g,id).filter(e=>knowledge(g,id).includes(e.id)&&!g.sent[id].includes(e.id)).map(e=>e.id),evidence:observations(g,id).map(e=>({id:e.id,text:e.text})),inspectable:visibleObjects(g,id).map(e=>({id:e.id,title:e.title,inspected:knowledge(g,id).includes(e.id)})),station:{power:g.power,coolingSince:g.cooling,stabilizationTicks:mission.stabilizationTicks,authorized:g.decoded,relays:g.holds,outage:g.outage},inbox:g.events.filter(e=>e.type==='message'&&(e.recipient==='team'||e.recipient===id)).slice(-2).map(e=>({from:e.agent,text:e.text,evidence:e.evidence})),recentActions:g.events.filter(e=>e.type==='action'||e.type==='failure').slice(-2).map(e=>({agent:e.agent,result:e.text})),operations:id==='atlas'?['cooling','power','authorize:CODE','hold']:id==='nova'?['repair','hold']:id==='sage'?['exit']:[],alreadyShared:g.sent[id]};}
