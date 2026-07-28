// @vitest-environment jsdom
import '@angular/compiler';
import {
  Component, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection,
  RendererFactory2, signal, ViewEncapsulation,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxDocument } from '../lynx-document';
import { setPageElementRef } from '../lynx-document/page-ref';
import { markFirstRenderComplete } from '../lynx-render-lifecycle';
import { LynxRendererFactory2 } from './lynx-renderer-factory2';
import { LYNX_DOCUMENT } from './token';

type FakeEl = { id:number; tag:string; parent:FakeEl|null; children:FakeEl[]; text?:string; attrs:Map<string,unknown>; classes:Set<string>; hasPaintingNode:boolean; };
let nextId=1; let pageRoot:FakeEl; const pend=new Set<FakeEl>();
const makeEl=(tag:string,text?:string):FakeEl=>({id:nextId++,tag,parent:null,children:[],text,attrs:new Map(),classes:new Set(),hasPaintingNode:true});
const detach=(c:FakeEl)=>{const p=c.parent;if(!p)return;const i=p.children.indexOf(c);if(i>=0)p.children.splice(i,1);c.parent=null;};
const install=()=>{nextId=1;pageRoot=makeEl('page');pend.clear();const g=globalThis as any;
 g.__CreatePage=()=>pageRoot;g.__CreateView=()=>makeEl('view');g.__CreateText=()=>makeEl('text');g.__CreateImage=()=>makeEl('image');
 g.__CreateRawText=(t:string)=>makeEl('raw-text',t);g.__CreateElement=(t:string)=>makeEl(t);g.__CreateWrapperElement=()=>makeEl('wrapper');
 g.__GetElementUniqueID=(n:FakeEl)=>n.id;g.__GetTag=(n:FakeEl)=>n.tag;
 g.__AppendElement=(p:FakeEl,c:FakeEl)=>{detach(c);p.children.push(c);c.parent=p;pend.delete(c);return c;};
 g.__InsertElementBefore=(p:FakeEl,c:FakeEl,r:FakeEl)=>{detach(c);const i=p.children.indexOf(r);p.children.splice(i<0?p.children.length:i,0,c);c.parent=p;pend.delete(c);return c;};
 g.__RemoveElement=(p:FakeEl,c:FakeEl)=>{const i=p.children.indexOf(c);if(i>=0)p.children.splice(i,1);c.parent=null;pend.add(c);return c;};
 g.__GetParent=(n:FakeEl)=>n.parent??null;g.__GetChildren=(n:FakeEl)=>n.children.slice();
 g.__FirstElement=(n:FakeEl)=>n.children[0]??null;g.__LastElement=(n:FakeEl)=>n.children[n.children.length-1]??null;
 g.__NextElement=(n:FakeEl)=>{const p=n.parent;if(!p)return null;const i=p.children.indexOf(n);return p.children[i+1]??null;};
 g.__SetClasses=(n:FakeEl,s:string)=>{n.classes=new Set((s??'').split(/\s+/).filter(Boolean));};g.__GetClasses=(n:FakeEl)=>[...n.classes];
 g.__AddClass=(n:FakeEl,x:string)=>n.classes.add(x);g.__SetAttribute=(n:FakeEl,k:string,v:unknown)=>n.attrs.set(k,v);
 g.__GetAttributeByName=(n:FakeEl,k:string)=>n.attrs.get(k);g.__SetID=(n:FakeEl,id:string)=>n.attrs.set('id',id);
 g.__SetDataset=()=>{};g.__AddInlineStyle=()=>{};g.__SetInlineStyles=()=>{};g.__AddEvent=()=>{};g.__ElementAnimate=()=>{};
 g.__FlushElementTree=()=>{const kill=(n:FakeEl)=>{n.hasPaintingNode=false;for(const c of n.children)kill(c);};for(const n of pend)kill(n);pend.clear();};
 setPageElementRef(pageRoot as any);};
const leafText=(el:FakeEl)=>(el.attrs.has('text')?(el.attrs.get('text') as string):(el.text??''))??'';
const desc=()=>{const out:FakeEl[]=[];const w=(n:FakeEl)=>{for(const c of n.children){if(!c.hasPaintingNode)continue;out.push(c);w(c);}};w(pageRoot);return out;};
const rendered=(cls:string)=>{const roots=desc().filter(n=>n.classes.has(cls));if(roots.length!==1)throw new Error('got '+roots.length+' .'+cls);
 const out:string[]=[];const w=(n:FakeEl)=>{for(const c of n.children){if(!c.hasPaintingNode)continue;if(c.tag==='raw-text')out.push(leafText(c));else if(c.tag==='text')w(c);}};w(roots[0]);return out.join('');};
const flush=()=>new Promise<void>(r=>setTimeout(r));

@Component({selector:'prose-slot',standalone:true,encapsulation:ViewEncapsulation.None,schemas:[CUSTOM_ELEMENTS_SCHEMA],
 template:`@if(open()){<text class="slot"><ng-content /></text>}`})
class ProseSlot{readonly open=signal(false);static last:ProseSlot;constructor(){ProseSlot.last=this;}}

/**
 * Projected single prose run needing edge-trim.
 */
@Component({selector:'prose-cycle-host',standalone:true,imports:[ProseSlot],encapsulation:ViewEncapsulation.None,schemas:[CUSTOM_ELEMENTS_SCHEMA],
 template:`<prose-slot> Hello world </prose-slot>`})
class ProseCycleHost{}

/**
 * Outer @if wrapping the projector, toggled together with inner slot.
 */
@Component({selector:'outer-host',standalone:true,imports:[ProseSlot],encapsulation:ViewEncapsulation.None,schemas:[CUSTOM_ELEMENTS_SCHEMA],
 template:`@if(outer()){<prose-slot> Hello world </prose-slot>}`})
class OuterHost{readonly outer=signal(true);}

describe('finding real-angular', ()=>{
 beforeAll(()=>TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting()));
 beforeEach(()=>{vi.stubGlobal('__MAIN_THREAD__',true);install();markFirstRenderComplete();TestBed.resetTestingModule();
  TestBed.configureTestingModule({providers:[provideZonelessChangeDetection(),{provide:LYNX_DOCUMENT,useValue:new LynxDocument()},LynxRendererFactory2,{provide:RendererFactory2,useExisting:LynxRendererFactory2}]});});

 it('R1 prose slot starts closed, then opens -> trimmed', async ()=>{
  const f=TestBed.createComponent(ProseCycleHost);f.detectChanges();await flush();
  ProseSlot.last.open.set(true);f.detectChanges();await flush();
  expect(rendered('slot')).toBe('Hello world');
 });

 it('R2 open, close, reopen -> trimmed', async ()=>{
  const f=TestBed.createComponent(ProseCycleHost);f.detectChanges();await flush();
  ProseSlot.last.open.set(true);f.detectChanges();await flush();
  expect(rendered('slot')).toBe('Hello world');
  ProseSlot.last.open.set(false);f.detectChanges();await flush();
  ProseSlot.last.open.set(true);f.detectChanges();await flush();
  expect(rendered('slot')).toBe('Hello world');
 });
});

// Attempt to force create+remove in ONE cycle via projected content whose slot
// is opened and then closed by an effect within the same flush.
import { effect } from '@angular/core';

@Component({selector:'flip-slot',standalone:true,encapsulation:ViewEncapsulation.None,schemas:[CUSTOM_ELEMENTS_SCHEMA],
 template:`@if(open()){<text class="fslot"><ng-content /></text>}`})
class FlipSlot{readonly open=signal(false);static last:FlipSlot;constructor(){FlipSlot.last=this;}}

describe('finding force-coincide', ()=>{
 beforeAll(()=>{try{TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting());}catch{}});
 beforeEach(()=>{vi.stubGlobal('__MAIN_THREAD__',true);install();markFirstRenderComplete();TestBed.resetTestingModule();
  TestBed.configureTestingModule({providers:[provideZonelessChangeDetection(),{provide:LYNX_DOCUMENT,useValue:new LynxDocument()},LynxRendererFactory2,{provide:RendererFactory2,useExisting:LynxRendererFactory2}]});});

 it('F1 open then reopen after a same-batch flip', async ()=>{
  @Component({selector:'flip-host',standalone:true,imports:[FlipSlot],encapsulation:ViewEncapsulation.None,schemas:[CUSTOM_ELEMENTS_SCHEMA],
   template:`<flip-slot> Hello world </flip-slot>`})
  class FlipHost{}
  const f=TestBed.createComponent(FlipHost);f.detectChanges();await flush();
  // open and close in the SAME synchronous batch, then detectChanges once.
  FlipSlot.last.open.set(true);
  FlipSlot.last.open.set(false);
  f.detectChanges();await flush();
  // now open for real
  FlipSlot.last.open.set(true);
  f.detectChanges();await flush();
  expect(rendered('fslot')).toBe('Hello world');
 });
});
