import {test} from 'node:test';
import assert from 'node:assert/strict';
import {actionMenu,normalizeDecision} from '../lib/agent-actions.ts';
import {createGame,agentPacket,applyAction} from '../lib/game.ts';
test('action menu excludes already inspected and other-room objects',()=>{let g=createGame();g=applyAction(g,'nova',{type:'inspect',target:'M-01'});const menu=actionMenu(agentPacket(g,'nova'));assert(!menu.choices.includes('inspect:M-01'));assert(menu.choices.includes('inspect:M-02'));assert(!menu.choices.includes('inspect:L-02'));});
test('normalization rejects an action outside the actual affordance menu',()=>{const menu=actionMenu(agentPacket(createGame(),'nova'));assert.throws(()=>normalizeDecision({choice:'exit'},menu));});
test('sharing attaches only the actual unshared discoveries',()=>{const g=applyAction(createGame(),'nova',{type:'inspect',target:'M-01'});const menu=actionMenu(agentPacket(g,'nova'));assert.deepEqual(normalizeDecision({choice:'share',message:'Found wiring'},menu),{type:'share',recipient:'team',evidence:['M-01'],message:'Found wiring'});});
test('available actions never expose the hidden access code',()=>{const g=createGame();g.power=true;const menu=actionMenu(agentPacket(g,'atlas'));assert(menu.choices.includes('authorize'));assert(!JSON.stringify(menu).includes('4379'));assert.throws(()=>normalizeDecision({choice:'authorize'},menu));assert.deepEqual(normalizeDecision({choice:'authorize',code:'1234'},menu),{type:'operate',target:'authorize:1234'});});
