import{t as B,r as p,j as e,B as k,w as D,x as H,y as N,z as w,C as m,a as u,b as x,H as O,c as y,ao as r,I as b,k as R,p as W,ai as J,f as U,o as V}from"./index-Dsch-6rs.js";import{T as S}from"./textarea-dxwQGyzt.js";import{S as I,a as M,b as E,c as $,d as n}from"./select-DXDaqklB.js";import{T as _}from"./textarea-with-copy-CfuLPcBf.js";import{A as z}from"./action-button-_bigQsZt.js";import{T as K}from"./tag-B2mgWGDT.js";import{C as Y}from"./copy-CaaOG6R5.js";import"./Combination-Cg6MJVDY.js";import"./index-CJCVC222.js";import"./ai-Jk9rb3ej.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=B("Bug",[["path",{d:"m8 2 1.88 1.88",key:"fmnt4t"}],["path",{d:"M14.12 3.88 16 2",key:"qol33r"}],["path",{d:"M9 7.13v-1a3.003 3.003 0 1 1 6 0v1",key:"d7y7pr"}],["path",{d:"M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6",key:"xs1cw7"}],["path",{d:"M12 20v-9",key:"1qisl0"}],["path",{d:"M6.53 9C4.6 8.8 3 7.1 3 5",key:"32zzws"}],["path",{d:"M6 13H2",key:"82j7cp"}],["path",{d:"M3 21c0-2.1 1.7-3.9 3.8-4",key:"4p0ekp"}],["path",{d:"M20.97 5c0 2.1-1.6 3.8-3.5 4",key:"18gb23"}],["path",{d:"M22 13h-4",key:"1jl80f"}],["path",{d:"M17.2 17c2.1.1 3.8 1.9 3.8 4",key:"k3fwyw"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=B("WandSparkles",[["path",{d:"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",key:"ul74o6"}],["path",{d:"m14 7 3 3",key:"1r5n42"}],["path",{d:"M5 6v4",key:"ilb8ba"}],["path",{d:"M19 14v4",key:"blhpug"}],["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M7 8H3",key:"zfb6yr"}],["path",{d:"M21 16h-4",key:"1cnmox"}],["path",{d:"M11 3H9",key:"1obp7u"}]]),X="default_key";async function ee(s,i,l="gemini-2.0-flash"){var h,o,g,C,j;try{const d={contents:[{parts:[{text:s}]}]},c=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${l}:generateContent?key=${X}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});if(!c.ok)throw new Error(`Gemini API error: ${c.status} ${c.statusText}`);const f=(j=(C=(g=(o=(h=(await c.json()).candidates)==null?void 0:h[0])==null?void 0:o.content)==null?void 0:g.parts)==null?void 0:C[0])==null?void 0:j.text;if(!f)throw new Error("No response generated from Gemini API");return f}catch(d){throw console.error("Gemini API call failed:",d),d}}const te=[{id:"bug-template",name:"Bug Report",type:"bug",description:"Standard template for reporting software bugs",template:`## Summary
Brief description of the issue

## Environment
- OS: 
- Browser: 
- Version: 

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots/Logs
[Attach any relevant files]

## Additional Context
Any other information that might be helpful`},{id:"feature-template",name:"Feature Request",type:"feature",description:"Template for requesting new features",template:`## Feature Summary
Brief description of the requested feature

## User Story
As a [type of user], I want [some goal] so that [some reason]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Business Value
Why this feature is important

## Technical Considerations
Any technical requirements or constraints

## Design Mockups
[Attach any relevant designs]`},{id:"task-template",name:"Task",type:"task",description:"General task template",template:`## Task Description
What needs to be done

## Objectives
- Objective 1
- Objective 2

## Requirements
- Requirement 1
- Requirement 2

## Definition of Done
- [ ] Task completed
- [ ] Code reviewed
- [ ] Tests written
- [ ] Documentation updated`},{id:"epic-template",name:"Epic",type:"epic",description:"Large feature or initiative template",template:`## Epic Summary
High-level description of the epic

## Business Goals
What business objectives this epic supports

## User Personas
Who will benefit from this epic

## Success Metrics
How we'll measure success

## Stories/Tasks
- [ ] Story 1
- [ ] Story 2
- [ ] Story 3

## Timeline
Estimated duration and milestones

## Dependencies
Other epics or external dependencies`}],se={low:"bg-gray-500",medium:"bg-yellow-500",high:"bg-orange-500",critical:"bg-red-500"},P={bug:Z,feature:J,task:U,epic:V};function me(){const[s,i]=p.useState({title:"",description:"",type:"task",priority:"medium",assignee:"",labels:[],acceptanceCriteria:"",storyPoints:0}),[l,h]=p.useState(""),[o,g]=p.useState(null),[C,j]=p.useState(""),[d,c]=p.useState(!1),[v,f]=p.useState(""),A=()=>{l.trim()&&!s.labels.includes(l.trim())&&(i(t=>({...t,labels:[...t.labels,l.trim()]})),h(""))},L=t=>{i(a=>({...a,labels:a.labels.filter(T=>T!==t)}))},F=t=>{i(a=>({...a,description:t.template,type:t.type})),g(t)},G=async()=>{if(s.title.trim()){c(!0);try{const t=`Generate a detailed Jira ticket for the following:

Title: ${s.title}
Type: ${s.type}
Priority: ${s.priority}
${v?`Additional context: ${v}`:""}

Please create a comprehensive ticket description that includes:
- Clear summary
- Detailed description
- Acceptance criteria (if applicable)
- Technical requirements (if applicable)
- Any relevant sections based on the ticket type

Format the response in Markdown that's suitable for Jira.`,a=await ee(t);a&&(j(a),i(T=>({...T,description:a})))}catch(t){console.error("Failed to generate ticket:",t)}finally{c(!1)}}},q=()=>(P[s.type],`**Ticket Type:** ${s.type.toUpperCase()}
**Priority:** ${s.priority.toUpperCase()}
**Story Points:** ${s.storyPoints}
**Assignee:** ${s.assignee||"Unassigned"}
**Labels:** ${s.labels.join(", ")||"None"}

---

**Title:** ${s.title}

**Description:**
${s.description}

${s.acceptanceCriteria?`**Acceptance Criteria:**
${s.acceptanceCriteria}`:""}

---
*Generated with Client Hub AI - Jira Helper*`);return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("h1",{className:"text-3xl font-bold",children:"Jira Ticket Helper"}),e.jsx(k,{variant:"secondary",className:"text-sm",children:"AI-Powered Ticket Generation"})]}),e.jsxs(D,{defaultValue:"create",className:"space-y-6",children:[e.jsxs(H,{className:"grid w-full grid-cols-3",children:[e.jsx(N,{value:"create",children:"Create Ticket"}),e.jsx(N,{value:"templates",children:"Templates"}),e.jsx(N,{value:"export",children:"Export & Format"})]}),e.jsx(w,{value:"create",className:"space-y-6",children:e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsxs(m,{children:[e.jsx(u,{children:e.jsxs(x,{className:"flex items-center gap-2",children:[e.jsx(O,{className:"h-5 w-5"}),"Ticket Details"]})}),e.jsxs(y,{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(r,{htmlFor:"title",children:"Title"}),e.jsx(b,{id:"title",placeholder:"Enter ticket title...",value:s.title,onChange:t=>i(a=>({...a,title:t.target.value}))})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(r,{children:"Type"}),e.jsxs(I,{value:s.type,onValueChange:t=>i(a=>({...a,type:t})),children:[e.jsx(M,{children:e.jsx(E,{})}),e.jsxs($,{children:[e.jsx(n,{value:"bug",children:"🐛 Bug"}),e.jsx(n,{value:"feature",children:"✨ Feature"}),e.jsx(n,{value:"task",children:"✅ Task"}),e.jsx(n,{value:"epic",children:"🎯 Epic"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(r,{children:"Priority"}),e.jsxs(I,{value:s.priority,onValueChange:t=>i(a=>({...a,priority:t})),children:[e.jsx(M,{children:e.jsx(E,{})}),e.jsxs($,{children:[e.jsx(n,{value:"low",children:"🟢 Low"}),e.jsx(n,{value:"medium",children:"🟡 Medium"}),e.jsx(n,{value:"high",children:"🟠 High"}),e.jsx(n,{value:"critical",children:"🔴 Critical"})]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(r,{htmlFor:"assignee",children:"Assignee"}),e.jsx(b,{id:"assignee",placeholder:"Enter assignee...",value:s.assignee,onChange:t=>i(a=>({...a,assignee:t.target.value}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(r,{htmlFor:"storyPoints",children:"Story Points"}),e.jsx(b,{id:"storyPoints",type:"number",min:"0",max:"100",value:s.storyPoints,onChange:t=>i(a=>({...a,storyPoints:parseInt(t.target.value)||0}))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(r,{children:"Labels"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(b,{placeholder:"Add label...",value:l,onChange:t=>h(t.target.value),onKeyPress:t=>t.key==="Enter"&&A()}),e.jsx(R,{onClick:A,size:"sm",children:e.jsx(K,{className:"h-4 w-4"})})]}),e.jsx("div",{className:"flex flex-wrap gap-1",children:s.labels.map(t=>e.jsxs(k,{variant:"secondary",className:"cursor-pointer hover:bg-destructive hover:text-destructive-foreground",onClick:()=>L(t),children:[t," ×"]},t))})]}),e.jsx(W,{}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(r,{htmlFor:"customPrompt",children:"AI Generation Context (Optional)"}),e.jsx(S,{id:"customPrompt",placeholder:"Provide additional context for AI to generate better ticket content...",value:v,onChange:t=>f(t.target.value),rows:3})]}),e.jsx(z,{onClick:G,disabled:!s.title.trim(),loading:d,icon:Q,className:"w-full",children:"Generate with AI"})]})]}),e.jsxs(m,{children:[e.jsx(u,{children:e.jsx(x,{children:"Description & Acceptance Criteria"})}),e.jsxs(y,{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(r,{htmlFor:"description",children:"Description"}),e.jsx(S,{id:"description",placeholder:"Enter detailed description...",value:s.description,onChange:t=>i(a=>({...a,description:t.target.value})),rows:12})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(r,{htmlFor:"acceptance",children:"Acceptance Criteria"}),e.jsx(S,{id:"acceptance",placeholder:"Define acceptance criteria...",value:s.acceptanceCriteria,onChange:t=>i(a=>({...a,acceptanceCriteria:t.target.value})),rows:6})]})]})]})]})}),e.jsx(w,{value:"templates",className:"space-y-6",children:e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:te.map(t=>{const a=P[t.type];return e.jsxs(m,{className:`cursor-pointer transition-colors hover:bg-accent ${(o==null?void 0:o.id)===t.id?"ring-2 ring-primary":""}`,onClick:()=>F(t),children:[e.jsxs(u,{children:[e.jsxs(x,{className:"flex items-center gap-2",children:[e.jsx(a,{className:"h-5 w-5"}),t.name]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:t.description})]}),e.jsx(y,{children:e.jsx("div",{className:"bg-muted p-3 rounded text-sm font-mono text-xs overflow-x-auto",children:e.jsxs("pre",{children:[t.template.substring(0,200),"..."]})})})]},t.id)})})}),e.jsxs(w,{value:"export",className:"space-y-6",children:[e.jsxs(m,{children:[e.jsx(u,{children:e.jsxs(x,{className:"flex items-center gap-2",children:[e.jsx(Y,{className:"h-5 w-5"}),"Jira-Ready Format"]})}),e.jsx(y,{children:e.jsx(_,{value:q(),readonly:!0,rows:20,placeholder:"Create a ticket to see the formatted output..."})})]}),e.jsxs(m,{children:[e.jsx(u,{children:e.jsx(x,{children:"Ticket Summary"})}),e.jsx(y,{children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[(()=>{const t=P[s.type];return e.jsx(t,{className:"h-5 w-5"})})(),e.jsx("span",{className:"font-medium",children:s.type.toUpperCase()})]}),e.jsx("div",{className:`w-3 h-3 rounded-full ${se[s.priority]}`}),e.jsxs("span",{className:"text-sm",children:[s.priority.toUpperCase()," Priority"]}),s.storyPoints>0&&e.jsxs(k,{variant:"outline",children:[s.storyPoints," SP"]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium text-lg",children:s.title||"Untitled Ticket"}),s.assignee&&e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Assigned to: ",s.assignee]})]}),s.labels.length>0&&e.jsx("div",{className:"flex flex-wrap gap-1",children:s.labels.map(t=>e.jsx(k,{variant:"secondary",children:t},t))})]})})]})]})]})]})}export{me as default};
