# Video demo WaltWDK — Paso a paso para grabar y editar

Guía para grabar el video de 2–3 min y luego editarlo con un editor de video con IA.

---

## Parte 1: Antes de grabar

### 1.1 Preparar el entorno

- [ ] Tener el repo clonado y funcionando:
  ```bash
  cd walt-wdk
  npm install && npm run build && npm test
  ```
- [ ] Crear una wallet de prueba (para no mostrar datos reales):
  - En OpenClaw o por código: crear wallet `demo` en red `base`.
- [ ] Opcional: tener un archivo `~/.walt-wdk/config.json` con guard de ejemplo (límites, requireApproval) para la parte de wdk-agent-guard.

### 1.2 Qué tener abierto en pantalla

- **Opción A:** Una ventana de terminal (o dos: una para comandos, otra para salida).
- **Opción B:** Cursor/IDE con el repo abierto + terminal integrada.
- **Opción C:** Navegador con OpenClaw (si ya tienes los skills instalados) + terminal.

### 1.3 Herramienta de grabación

- **macOS:** QuickTime → Archivo → Nueva grabación de pantalla (Cmd+Ctrl+5), o Grabar zona seleccionada.
- **Windows:** Xbox Game Bar (Win+G) o OBS Studio.
- **Alternativa:** Loom, OBS, o la que uses habitualmente.

Graba solo la región de la pantalla donde estés mostrando terminal/IDE (evita ventanas con datos sensibles).

---

## Parte 2: Pasos de grabación (en orden)

Graba **una toma continua** (o por bloques si prefieres cortar después). Sigue este orden.

### Paso 1 — Intro (0:00–0:20)

1. Empieza con el README del repo en pantalla (GitHub o en el IDE).
2. Di en voz alta algo como:  
   *"Este es WaltWDK: tres skills de OpenClaw que integran el Tether WDK oficial. Todo es Apache-2.0 y usa el WDK real, sin mocks."*
3. Muestra la estructura del proyecto: carpeta `src/core`, carpeta `skills` con `wdk-wallet`, `wdk-pay`, `wdk-agent-guard`.

### Paso 2 — wdk-wallet (0:20–0:50)

4. Abre la terminal en la raíz del repo.
5. Ejecuta (o muestra en OpenClaw) la creación de una wallet, por ejemplo:
   - Si tienes CLI/script: comando tipo `create wallet "demo" on base`.
   - Si usas OpenClaw: pide al agente *"Create a wallet called demo on Base"*.
6. Muestra la respuesta: dirección, red, mensaje de backup.
7. Di: *"wdk-wallet genera la seed con el WDK, la guarda cifrada en punto walt-wdk y devuelve la dirección y opcionalmente un QR."*
8. Pide listar wallets y ver balance de `demo` (o el nombre que hayas usado).
9. Muestra la lista y el balance (nativo + USDT/USDC si aplica).
10. Di: *"Exportar pide confirmación explícita para que el agente no filtre la seed por error."*  
    (No hace falta hacer un export real en el video.)

### Paso 3 — wdk-pay (0:50–1:25)

11. Pide un envío de prueba, por ejemplo:  
    *"Send 10 USDC to [una dirección de test] from demo"*  
    (Usa una dirección que controlas o una de test; si no quieres enviar de verdad, di que es demo y corta antes de confirmar, o usa testnet.)
12. Muestra la respuesta: tx hash, enlace al explorer (si se generó).
13. Di: *"wdk-pay usa el mismo store de wallets, comprueba balance y envía con el WDK; devolvemos el hash y el link al explorer."*
14. Pide una payment request:  
    *"Create a payment request for 50 USDT to my demo wallet"*.
15. Muestra el link y el QR que devuelva el skill.
16. Di: *"El historial sale de un ledger local; luego se puede conectar un indexer o API del explorer."*

### Paso 4 — wdk-agent-guard (1:25–2:00)

17. Abre el archivo de config (por ejemplo `~/.walt-wdk/config.json` o el fragmento en el README) donde estén `dailyLimit`, `perTransactionLimit`, `requireApproval` y, si aplica, whitelist/blacklist.
18. Di: *"wdk-agent-guard es el diferenciador: antes de que el agente envíe, puede comprobar límites y reglas de aprobación."*
19. Pide un check de límite, por ejemplo:  
    *"Check if I can send 200 USDC to [dirección] from demo"*.
20. Muestra la respuesta (allowed / requiresApproval / supera límite diario).
21. Di: *"Las decisiones se registran para auditoría; se puede notificar por Telegram o Discord y esperar aprobación humana con timeout."*

### Paso 5 — Cierre (2:00–2:30)

22. Vuelve al README o a la lista de skills.
23. Di: *"En resumen: WDK real de Tether, tres skills — wallet, pay y guard — y el guard te da límites y flujo de aprobación para agentes autónomos."*
24. Opcional: ejecuta `npm test` en la raíz y deja que se vean los tests pasando unos segundos.
25. Di: *"Repo público, INSTALL y ARCHITECTURE en docs, y lo presentamos al Galactica WDK Edition. Gracias."*
26. Para la grabación.

---

## Parte 3: Después de grabar

### 3.1 Revisar el material

- [ ] Ver el video completo y anotar minutos donde hay errores o pausas largas.
- [ ] Decidir si usas una sola toma o varias (por ejemplo: intro + wallet, pay, guard, cierre).

### 3.2 Editar con software con IA

Herramientas que suelen permitir edición rápida con IA (cortes, subtítulos, recorte de silencios):

| Herramienta | Uso típico |
|-------------|------------|
| **Descript** | Editar por texto, quitar “ums”, subtítulos automáticos. |
| **Runway** | Edición con prompts, recortes, efectos. |
| **CapCut** | Cortes, subtítulos automáticos, plantillas. |
| **Adobe Premiere (Sensei)** | Recorte de silencios, transcripción. |
| **DaVinci Resolve** | Edición gratis; subtítulos y corrección. |

Pasos genéricos en cualquier editor:

1. Importar el video grabado.
2. Cortar inicio/fin y pausas largas para acercarte a 2–3 min.
3. Activar subtítulos automáticos (si el editor lo tiene) y revisar.
4. Ajustar volumen si hace falta (voz clara, sin música que tape).
5. Exportar en 1080p (por ejemplo MP4, H.264) para subir a YouTube/Loom/DoraHacks.

### 3.3 Qué entregar

- [ ] Video final de 2–3 min.
- [ ] Subir a YouTube (no listado o público) o Loom.
- [ ] Pegar el link en `docs/HACKATHON_SUBMISSION.md` en la sección **Demo**.

---

## Checklist rápido pre-grabación

- [ ] `npm install && npm run build && npm test` OK.
- [ ] Wallet de demo creada (ej. `demo` en Base).
- [ ] Config de guard de ejemplo (opcional).
- [ ] Grabación de pantalla configurada (zona, micrófono).
- [ ] Guion o este .md a la vista para no olvidar pasos.

---

## Texto para pegar en otra conversación (edición del video)

Puedes copiar esto en un chat con un asistente o en un editor con IA:

```
Tengo un video de pantalla (screen recording) de 2–3 minutos para un hackathon (Galactica WDK Edition). Muestra:

1. Intro: repo WaltWDK, tres skills OpenClaw + Tether WDK, Apache-2.0.
2. wdk-wallet: crear wallet, listar, balance.
3. wdk-pay: enviar USDC, payment request + QR.
4. wdk-agent-guard: config de límites, check limit, audit log.
5. Cierre: resumen y npm test.

Necesito:
- Recortar silencios y errores.
- Dejar duración final entre 2:00 y 3:00 minutos.
- Añadir subtítulos automáticos si es posible.
- Exportar en 1080p para subir a YouTube/Loom.

[Adjunto o enlace al video]
```

Con esto puedes grabar siguiendo el orden del documento y luego usar el bloque de texto en otra conversación o en un editor con IA para la edición.
