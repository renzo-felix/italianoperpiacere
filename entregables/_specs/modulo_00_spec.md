# SPEC — Módulo 0: Come ti chiami?
## Nivel A1 · Color: Amber · Input: Video

---

## Datos del módulo (del CSV)
- **Título:** Come ti chiami?
- **Vocabulario:** Nomi propri italiani, numeri da 1 a 30, espressioni di saluto
- **Gramática:** L'alfabeto, il verbo chiamarsi (io, tu, lui/lei)
- **Comunicación:** Chiedere e dire il nome, salutare, espressioni: Che significa?, Come si scrive?
- **Fonética:** L'alfabeto italiano e lettere straniere
- **Juego Genially sugerido:** Quiz 'Trova l'intruso' con i nomi e i numeri italiani
- **Producción oral/escrita:** Scrivere il proprio nome e dettarlo lettera per lettera; presentarsi ai compagni

---

## Input (Etapa 1)
- **Tipo:** Video YouTube
- **URL:** https://youtu.be/6R_4YRTshIg
- **Embed ID:** 6R_4YRTshIg
- **Título:** L'Alfabeto Italiano – Da A come Ancona a Z come Zara | LearnAmo
- **Duración:** ~5 minutos
- **Idioma del video:** Italiano (auténtico, ritmo pausado — apropiado A1)
- **Contenido del video:**
  - 21 letras del alfabeto italiano con ciudad asociada
  - A=Ancona, B=Bologna, C=Como, D=Domodossola, E=Empoli, F=Firenze, G=Genova, H=Hotel, I=Imola, L=Livorno, M=Milano, N=Napoli, O=Otranto, P=Palermo, Q=Quarto, R=Roma, S=Savona, T=Torino, U=Udine, V=Venezia, Z=Zara
  - 5 letras extranjeras: J=Jersey, K=Kursaal, W=Washington, X=Xilofono, Y=York
  - Pronunciación de cada letra
  - La presentadora (Graziana) se presenta: "Mi chiamo Graziana"

---

## Hilo conductor del módulo
**Pregunta central:** ¿Cómo te presentás y deletreás tu nombre en italiano?

```
Etapa 1: Ver video alfabeto → entender sistema letra-ciudad
Etapa 2: Usar el alfabeto del video → descubrir chiamarsi desde ejemplos del video
Etapa 3: Confirmar reglas → alfabeto completo, chiamarsi, saludos, números 1-30
Etapa 4: Practicar todo con ejercicios del mismo vocabulario
```

---

## Etapa 1 — Exploración ✅ GENERADA
**Archivo:** `etapa1_exploracion.html`
**Actividades:**
1. Motivación (Sofia): ¿Cómo se deletrea tu nombre en italiano?
2. Pre-watch: reflexión sobre cantidad de letras
3. Video embed (YouTube 6R_4YRTshIg)
4. Post-watch:
   - V/F x5: sobre letras del video (Bologna, extranjeras, Roma, muda H, narración en italiano)
   - MC x4: cantidad de letras, F=Firenze, V=Venezia, H muda
   - Asociar letra→ciudad x6 (M,N,T,S,P,G con opciones shuffled)
5. Barra de progreso global
6. CTA → Etapa 2

---

## Etapa 2 — Descubrimiento ✅ GENERADA
**Archivo:** `etapa2_descubrimiento.html`
**Actividades (todas desde el video):**
1. Completar alfabeto: 21 letras, 10 ciudades en blanco, 11 dadas
2. Identificar 5 letras extranjeras: grid de 26 letras, clic en J,K,W,X,Y
3. Deletrear SOFIA: S=Savona, O=Otranto, F=Firenze, I=Imola, A=Ancona (dropdowns)
4. Descubrir chiamarsi:
   - Quote del video: "Mi chiamo Graziana. Come ti chiami?"
   - 4 oraciones con dropdown mi/ti/si/ci/vi
   - Tabla con blancos (se revela sola o con botón)
5. Diálogo Graziana-Marco con Web Speech API:
   - Marco deletrea su nombre: M-A-R-C-O con ciudades
   - Texto borroso hasta escuchar / revelar
   - MC de comprensión sobre el deletreo

---

## Etapa 3 — Gramática ✅ GENERADA
**Archivo:** `etapa3_gramatica.html`
**Secciones:**
1. Alfabeto: tabla 21+5, pronunciación (C/G/CH/GH/SC/GL/GN), H muda
2. Llamarsi: conjugación completa + preguntas/respuestas
3. Saluti: grid formal/informal
4. Numeri 1-30: grid visual
5. Espressioni: 10 frases con botón audio (Web Speech)
**Ejercicios (secciones A-F):**
- A: Completar 5 ciudades (fill-in)
- B: V/F x5 sobre letras
- C: Chiamarsi x6 (partícula reflexiva)
- D: Saludos formal/informal x8
- E: Números x7 (selección múltiple)
- F: Ordenar diálogo (5 líneas, numeración)

---

## Etapa 4 — Ejercicios
**Archivo:** `etapa4_ejercicios.md`
**Estado:** Pendiente de actualizar al nuevo formato
**Contenido esperado:**
- Mínimo 8 ejercicios usando SOLO vocabulario de este módulo
- Tipos: traducir, completar, V/F, crear oración, deletrear nombre propio
- Sección RISPOSTE al final

---

## Colores del módulo
```css
--mc:      #e5ab07;  /* amber */
--mc-dk:   #c8940a;
--mc-text: #7a5500;
--mc-bg:   #fdf3d0;
```

---

## Notas para regeneración futura
- Si se regenera, mantener el hilo: todas las actividades de Etapa 2 deben referenciar el video de LearnAmo
- El diálogo del módulo siempre incluye deletrear un nombre con el alfabeto fonético
- Los números 1-30 son el vocabulario de este módulo (no de otro)
- La H muda es un punto de pronunciación que se enfatiza en este módulo
