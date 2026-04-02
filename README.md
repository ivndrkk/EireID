# EireID

---

## How to Run

1. Option 1: Run from ZIP File
    - Download and extract the ZIP file titled EireID.zip
    - Open the extracted file
    - Find the index.html file and open it in a web browser
2. Option 2: [Open with GitHub link](https://ivndrkk.github.io/EireID/)
3. Option 3: [DCU Student Server Link]()

---

## About EireID

EireID is a unified, mobile-first digital identity platform for Irish residents - citizens and non-citizens alike. It provides a government-verified space to securely store all of your official Irish documents, such as passports, drivers license, medical cards, and more - all stored simply and conveniently in one app. EireID makes legal and administrative processes simpler to residents by making their resources more efficient and readily available. EireID also provides assistance via the AI-powered digital mascot, Rua, who can offer guidance to users and answer any questions they may have.

EireID is both a digital service and process innovation, as it creates a new way for residents to interact with public services. It doesn’t just digitise documents, but instead it provides an entirely new service by having everything accessible on one, singular platform, and allowing processes related to these documents to be done entirely online. Services traditionally delivered through Revenue or other agencies become streamlined within EireID, as tasks can be completed within two or fewer interactions. What makes it especially different to other online services such as MyGov is the inclusion of an AI-powered, user-friendly mascot, made to help all users by providing explanations and step-by-step assistance for any help they require. This feature aims to make the platform more user-friendly, especially for those who may not have as much experience with such technologies or services, such as, elderly users, immigrants, and first-time residents.

---

## References

#### Animations:
- Locomotive Scroll - Used across the website, integrated with GSAP ScrollTrigger
via a scroll proxy.
- GSAP — GreenSock Animation Platform - Core animation engine driving all timeline-based transitions across the site
- GSAP ScrollTrigger - Scroll-based animation plugin. Acts as a proxy receiver for Locomotive Scroll events.
#### AI and backend
- Groq API - LLM inference backend powering the Rua AI assistant chatbot.
- Rua Chatbot: RAG Pipeline - Custom Retrieval-Augmented Generation backend built in Node.js and deployed to Heroku.
- Node.js - Server runtime for the Rua chatbot backend. Handles API routing, Groq inference calls,and static knowledge base retrieval logic.
#### AI Agents - Jules (Google AI Pro)
- Accessibility Audit Agent - Automated daily agent running accessibility checks across all EireID pages.
- Performance Optimisation Agent - Automated daily agent auditing Core Web Vitals, asset sizes, and render-blocking resources across the EireID codebase.
#### Hosting and Infrastructure
- GitHub Pages - Primary hosting for the EireID static frontend.
- Heroku - Cloud platform hosting the Rua chatbot Node.js backend.
- Git / GitHub - Source control for the full EireID codebase — HTML pages, modular CSS components, JS scripts, static assets, and the chatbot backend.
#### Typography
- Lato - Primary typeface used across all EireID pages. Served via Google Fonts CDN.
- Courier / Monospace Stack - Monospaced fallback stack used in the Genesis Protocol modal and security terminal UI panels
#### Icons and Graphics
- Lucide Icons - Open-source icon library providing consistent, minimal line icons used throughout the EireID interface
- Custom SVG Assets - Bespoke SVG files designed in Figma: EireID logo, Irish Harp mark, EIRE GENESIS trefoil sigil, UI document card illustrations, and the Rua mascot.
#### Design and Prototyping
- Figma - All EireID UI screens and component layouts prototyped in Figma prior to
development.

---


