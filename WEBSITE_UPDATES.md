# Checklist: qué actualizar en walt-wdk.com

Lista de cambios recomendados en la **página** para que coincida con el repo y evite confusión.

---

## 1. Redes / multi-chain

- **Hoy en la web:** suele decir "Ethereum · Tron · TON" (o similar).
- **En el repo:** el código soporta **Ethereum, Base, Polygon y Tron**. TON no está implementado.
- **Acción:** En todos los textos (hero, skills, diagramas), reemplazar "TON" por **Base** y **Polygon**, o usar algo como:  
  **"Ethereum · Base · Polygon · Tron"**.

---

## 2. Comandos de instalación

- **Web:** `clawhub install walt-wdk` y `openclaw skills install wdk-wallet wdk-pay wdk-agent-guard`.
- **Repo:** el quick start del README usa `git clone` + `npm install` (desarrollo). Para usuarios finales que instalan el pack, los comandos de la web están bien si son los oficiales de OpenClaw/ClawHub.
- **Acción:** Solo comprobar que esos comandos sigan siendo los que recomienda OpenClaw. Si ClawHub usa otro nombre (ej. `walt-wdk` vs `@walt-wdk/wdk-wallet`), unificar con la doc oficial.

---

## 3. Skills “Coming soon”

- **Web:** wdk-cron-payments y wdk-onramp aparecen como "Coming Soon".
- **Repo:** no existen aún; solo están wdk-wallet, wdk-pay, wdk-agent-guard.
- **Acción:** Dejar "Coming Soon" tal cual; está alineado con el repo. Cuando existan en el repo, quitar el cartel y enlazar a GitHub/docs.

---

## 4. Enlace a GitHub

- **Web:** "View on GitHub" → `https://github.com/fran011245/walt-wdk`.
- **Repo:** ya tiene ese mismo URL en README y `package.json`.
- **Acción:** Ninguna; está correcto.

---

## 5. Descripción de skills (opcional)

Para que la web refleje exactamente lo que hace el código:

| Skill           | En la web (resumen)     | En el repo (resumen) |
|----------------|--------------------------|----------------------|
| wdk-wallet     | Create, recover, manage  | create, balance, list, export (seed con confirmación) |
| wdk-pay        | Send USDT, approval, QR  | send, request + QR, history |
| wdk-agent-guard| Limits, whitelist, caps  | daily/per-tx limits, whitelist/blacklist, approval flow, audit log |

Si en la web usáis “recover” para wdk-wallet: en el repo no hay flujo de “recover” explícito, solo export de seed. Podéis cambiar a “export (backup)” o mantener “recover” si planeáis añadirlo.

---

## Resumen rápido

| Dónde en la web | Qué hacer |
|-----------------|-----------|
| Cualquier mención de **TON** | Cambiar a **Base · Polygon** (o listar Ethereum, Base, Polygon, Tron). |
| Comandos de instalación      | Verificar con doc OpenClaw/ClawHub. |
| “View on GitHub”             | Dejar como está (fran011245/walt-wdk). |
| Skills “Coming soon”         | Dejar como está. |
| Texto “recover” en wdk-wallet| Ajustar a “export/backup” si queréis ser fieles al repo hoy. |

Cuando actualicéis la página, podéis ir tachando estos puntos. Si el repo cambia (nuevas redes o skills), conviene volver a revisar esta lista.
