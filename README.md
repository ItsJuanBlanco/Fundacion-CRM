# CRM Fundación — Fase 1: Donantes

## Rutas
- `/` — Formulario público de registro de donantes (compártelo con las 400 personas)
- `/admin` — Panel privado para el equipo (requiere login)

## Cómo correr localmente
```
npm install
npm run dev
```

## Cómo desplegar en Vercel
1. Sube esta carpeta a un repo de GitHub (o usa `vercel` CLI directo).
2. Conecta el repo en vercel.com → New Project.
3. Deploy. No requiere variables de entorno adicionales (las credenciales de Supabase ya están en `src/supabaseClient.js` porque son públicas/anon-safe).

## Crear tu usuario de acceso al panel
En Supabase Dashboard → Authentication → Users → Add user → Create new user.
Marca "Auto Confirm User". Usa ese correo/contraseña en `/admin`.

## Próximas fases
- Fase 2: Cobro recurrente con Wompi
- Fase 3: Beneficiarios (geografía completa), fundaciones aliadas, desembolsos
