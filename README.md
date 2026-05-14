# Ricamo

Ecommerce de camisetas temáticas para festivales y eventos culturales de Colombia. Personalizadas y pre-diseñadas. Construido con Next.js + Supabase + Wompi.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Copiar `.env.local.example` a `.env.local` y completar:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=
WOMPI_INTEGRITY_SECRET=
WOMPI_EVENTS_SECRET=
RESEND_API_KEY=
EMAIL_FROM=Ricamo <hola@ricamo.co>
ADMIN_EMAILS=juancamilo965@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Documentación

- `CLAUDE.md` — guía de desarrollo para Claude Code (leer antes de tocar código)
- `../Ricamo_Levantamiento_Requerimientos_v1.0.md` — requerimientos funcionales completos
- `PENDIENTES.md` — tareas pendientes y decisiones abiertas
