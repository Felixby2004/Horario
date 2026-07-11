[OPEN] Dashboard layout runtime error

Fecha: 2026-06-10
Session ID: dashboard-layout-runtime

Sintoma:
- En ejecución aparece `TypeError: Cannot read properties of undefined (reading 'call')`
- El stack apunta a `src/app/dashboard/layout.tsx`

Hipotesis:
1. Un import de `dashboard/layout.tsx` resuelve a `undefined` en el bundle cliente.
2. Existe una importación circular entre el layout y uno de sus componentes dependientes.
3. `MenuUsuario` o `ChatBot` usa una exportación default/nombrada incorrecta.
4. Un componente importado depende de APIs incompatibles con cliente/server y rompe el chunk.
5. El artefacto de compilación `.next` quedó inconsistente tras cambios recientes.

Plan:
- Inspeccionar imports directos del layout y sus archivos fuente.
- Reproducir/confirmar con evidencia y revisar diagnósticos.
- Aplicar una corrección mínima basada en evidencia.
- Verificar arranque limpio del proyecto.
