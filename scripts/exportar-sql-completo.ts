
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const RUTA_ARCHIVO = path.join(__dirname, '..', 'backup-completo.sql');

async function exportarSQL() {
  console.log('📦 Iniciando exportación completa a SQL...');

  const lineas: string[] = [];
  
  lineas.push('-- =============================================');
  lineas.push('-- BACKUP COMPLETO DE LA BASE DE DATOS');
  lineas.push('-- Sistema de Horarios UNT');
  lineas.push(`-- Generado: ${new Date().toLocaleString()}`);
  lineas.push('-- =============================================');
  lineas.push('');
  lineas.push('SET statement_timeout = 0;');
  lineas.push('SET lock_timeout = 0;');
  lineas.push('SET idle_in_transaction_session_timeout = 0;');
  lineas.push('SET client_encoding = \'UTF8\';');
  lineas.push('SET standard_conforming_strings = on;');
  lineas.push('SET check_function_bodies = false;');
  lineas.push('SET xmloption = content;');
  lineas.push('SET client_min_messages = warning;');
  lineas.push('SET row_security = off;');
  lineas.push('');

  console.log('1. Exportando Periodos Académicos...');
  const periodos = await prisma.periodoAcademico.findMany();
  if (periodos.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: periodo_academico');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "periodo_academico" ("id_periodo", "codigo", "nombre", "anio", "semestre", "fecha_inicio", "fecha_fin", "fecha_inicio_clases", "fecha_fin_clases", "activo", "estado", "fecha_creacion") VALUES');
    periodos.forEach((p, idx) => {
      const valores = [
        p.id_periodo,
        `'${p.codigo}'`,
        `'${p.nombre.replace(/'/g, "''")}'`,
        p.anio,
        p.semestre,
        `'${p.fecha_inicio.toISOString().split('T')[0]}'`,
        `'${p.fecha_fin.toISOString().split('T')[0]}'`,
        p.fecha_inicio_clases ? `'${p.fecha_inicio_clases.toISOString().split('T')[0]}'` : 'NULL',
        p.fecha_fin_clases ? `'${p.fecha_fin_clases.toISOString().split('T')[0]}'` : 'NULL',
        p.activo,
        `'${p.estado}'`,
        `'${p.fecha_creacion.toISOString()}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === periodos.length - 1 ? ';' : ','}`);
    });
  }

  console.log('2. Exportando Usuarios...');
  const usuarios = await prisma.usuario.findMany();
  if (usuarios.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: usuario');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "usuario" ("id_usuario", "codigo", "nombres", "apellidos", "correo_electronico", "contrasena_hash", "rol", "activo", "ultimo_acceso", "fecha_creacion", "fecha_actualizacion") VALUES');
    usuarios.forEach((u, idx) => {
      const valores = [
        u.id_usuario,
        `'${u.codigo}'`,
        `'${u.nombres.replace(/'/g, "''")}'`,
        `'${u.apellidos.replace(/'/g, "''")}'`,
        u.correo_electronico ? `'${u.correo_electronico}'` : 'NULL',
        `'${u.contrasena_hash}'`,
        `'${u.rol}'`,
        u.activo,
        u.ultimo_acceso ? `'${u.ultimo_acceso.toISOString()}'` : 'NULL',
        `'${u.fecha_creacion.toISOString()}'`,
        `'${u.fecha_actualizacion.toISOString()}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === usuarios.length - 1 ? ';' : ','}`);
    });
  }

  console.log('3. Exportando Docentes...');
  const docentes = await prisma.docente.findMany();
  if (docentes.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: docente');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "docente" ("id_docente", "id_usuario", "codigo_docente", "nombres", "apellidos", "modalidad", "categoria", "dedicacion", "antiguedad", "fecha_ingreso", "correo_electronico", "telefono", "grado_academico", "especialidad", "horas_maximas_semanales", "activo", "fecha_creacion", "fecha_actualizacion", "direccion", "disponibilidad", "escuela_profesional", "foto_perfil", "perfil_completo", "horas_totales_asignadas") VALUES');
    docentes.forEach((d, idx) => {
      const valores = [
        d.id_docente,
        d.id_usuario || 'NULL',
        `'${d.codigo_docente}'`,
        `'${d.nombres.replace(/'/g, "''")}'`,
        `'${d.apellidos.replace(/'/g, "''")}'`,
        `'${d.modalidad}'`,
        `'${d.categoria}'`,
        d.dedicacion ? `'${d.dedicacion}'` : 'NULL',
        d.antiguedad,
        d.fecha_ingreso ? `'${d.fecha_ingreso.toISOString().split('T')[0]}'` : 'NULL',
        d.correo_electronico ? `'${d.correo_electronico}'` : 'NULL',
        d.telefono ? `'${d.telefono}'` : 'NULL',
        d.grado_academico ? `'${d.grado_academico}'` : 'NULL',
        d.especialidad ? `'${d.especialidad}'` : 'NULL',
        d.horas_maximas_semanales,
        d.activo,
        `'${d.fecha_creacion.toISOString()}'`,
        `'${d.fecha_actualizacion.toISOString()}'`,
        d.direccion ? `'${d.direccion.replace(/'/g, "''")}'` : 'NULL',
        d.disponibilidad ? `'${d.disponibilidad}'` : 'NULL',
        d.escuela_profesional ? `'${d.escuela_profesional}'` : 'NULL',
        d.foto_perfil ? `'${d.foto_perfil}'` : 'NULL',
        d.perfil_completo,
        d.horas_totales_asignadas
      ].join(', ');
      lineas.push(`  (${valores})${idx === docentes.length - 1 ? ';' : ','}`);
    });
  }

  console.log('4. Exportando Cursos...');
  const cursos = await prisma.curso.findMany();
  if (cursos.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: curso');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "curso" ("id_curso", "codigo", "nombre", "horas_teoria", "horas_laboratorio", "horas_practica", "creditos", "ciclo", "plan_estudios", "prerequisitos", "activo", "fecha_creacion") VALUES');
    cursos.forEach((c, idx) => {
      const valores = [
        c.id_curso,
        `'${c.codigo}'`,
        `'${c.nombre.replace(/'/g, "''")}'`,
        c.horas_teoria,
        c.horas_laboratorio,
        c.horas_practica,
        c.creditos,
        c.ciclo || 'NULL',
        c.plan_estudios ? `'${c.plan_estudios}'` : 'NULL',
        c.prerequisitos ? `'${c.prerequisitos}'` : 'NULL',
        c.activo,
        `'${c.fecha_creacion.toISOString()}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === cursos.length - 1 ? ';' : ','}`);
    });
  }

  console.log('5. Exportando Grupos...');
  const grupos = await prisma.grupo.findMany();
  if (grupos.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: grupo');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "grupo" ("id_grupo", "id_curso", "id_periodo", "codigo_grupo", "capacidad_maxima", "cantidad_matriculados", "activo", "observaciones", "fecha_creacion") VALUES');
    grupos.forEach((g, idx) => {
      const valores = [
        g.id_grupo,
        g.id_curso,
        g.id_periodo,
        `'${g.codigo_grupo}'`,
        g.capacidad_maxima,
        g.cantidad_matriculados || 0,
        g.activo,
        g.observaciones ? `'${g.observaciones.replace(/'/g, "''")}'` : 'NULL',
        `'${g.fecha_creacion.toISOString()}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === grupos.length - 1 ? ';' : ','}`);
    });
  }

  console.log('6. Exportando Ambientes...');
  const ambientes = await prisma.ambiente.findMany();
  if (ambientes.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: ambiente');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "ambiente" ("id_ambiente", "codigo", "nombre", "tipo", "capacidad", "piso", "pabellon", "equipamiento", "activo", "requiere_mantenimiento", "observaciones", "fecha_creacion", "fecha_actualizacion") VALUES');
    ambientes.forEach((a, idx) => {
      const valores = [
        a.id_ambiente,
        `'${a.codigo}'`,
        `'${a.nombre.replace(/'/g, "''")}'`,
        `'${a.tipo}'`,
        a.capacidad,
        a.piso ? `'${a.piso}'` : 'NULL',
        a.pabellon ? `'${a.pabellon}'` : 'NULL',
        a.equipamiento ? `'${a.equipamiento}'` : 'NULL',
        a.activo,
        a.requiere_mantenimiento,
        a.observaciones ? `'${a.observaciones.replace(/'/g, "''")}'` : 'NULL',
        `'${a.fecha_creacion.toISOString()}'`,
        `'${a.fecha_actualizacion.toISOString()}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === ambientes.length - 1 ? ';' : ','}`);
    });
  }

  console.log('7. Exportando DocenteCurso...');
  const docenteCursos = await prisma.docenteCurso.findMany();
  if (docenteCursos.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: docente_curso');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "docente_curso" ("id_docente_curso", "id_docente", "id_curso", "tipo_clase", "experiencia_anios", "prioridad", "activo", "fecha_asignacion", "horas_asignadas") VALUES');
    docenteCursos.forEach((dc, idx) => {
      const valores = [
        dc.id_docente_curso,
        dc.id_docente,
        dc.id_curso,
        `'${dc.tipo_clase}'`,
        dc.experiencia_anios || 0,
        dc.prioridad,
        dc.activo,
        `'${dc.fecha_asignacion.toISOString()}'`,
        dc.horas_asignadas
      ].join(', ');
      lineas.push(`  (${valores})${idx === docenteCursos.length - 1 ? ';' : ','}`);
    });
  }

  console.log('8. Exportando DocenteGrupo...');
  const docenteGrupos = await prisma.docenteGrupo.findMany();
  if (docenteGrupos.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: docente_grupo');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "docente_grupo" ("id_docente_grupo", "id_docente", "id_grupo", "activo", "fecha_asignacion") VALUES');
    docenteGrupos.forEach((dg, idx) => {
      const valores = [
        dg.id_docente_grupo,
        dg.id_docente,
        dg.id_grupo,
        dg.activo,
        `'${dg.fecha_asignacion.toISOString()}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === docenteGrupos.length - 1 ? ';' : ','}`);
    });
  }

  console.log('9. Exportando CursoAmbiente...');
  const cursoAmbientes = await prisma.cursoAmbiente.findMany();
  if (cursoAmbientes.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: curso_ambiente');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "curso_ambiente" ("id_curso_ambiente", "id_curso", "id_ambiente", "tipo_clase") VALUES');
    cursoAmbientes.forEach((ca, idx) => {
      const valores = [
        ca.id_curso_ambiente,
        ca.id_curso,
        ca.id_ambiente,
        `'${ca.tipo_clase}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === cursoAmbientes.length - 1 ? ';' : ','}`);
    });
  }

  console.log('10. Exportando Ventanas de Atención...');
  const ventanas = await prisma.ventanaAtencion.findMany();
  if (ventanas.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: ventana_atencion');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "ventana_atencion" ("id_ventana", "id_periodo", "fecha", "orden_prioridad", "modalidad", "categoria", "hora_inicio", "hora_fin", "intervalo_minutos", "cantidad_docentes", "cantidad_atendidos", "completado", "activo", "fecha_creacion") VALUES');
    ventanas.forEach((v, idx) => {
      const valores = [
        v.id_ventana,
        v.id_periodo,
        `'${v.fecha.toISOString().split('T')[0]}'`,
        v.orden_prioridad,
        `'${v.modalidad}'`,
        `'${v.categoria}'`,
        `'${v.hora_inicio}'`,
        `'${v.hora_fin}'`,
        v.intervalo_minutos,
        v.cantidad_docentes || 0,
        v.cantidad_atendidos || 0,
        v.completado,
        v.activo,
        `'${v.fecha_creacion.toISOString()}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === ventanas.length - 1 ? ';' : ','}`);
    });
  }

  console.log('11. Exportando Horarios Asignados...');
  const horarios = await prisma.horarioAsignado.findMany();
  if (horarios.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: horario_asignado');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "horario_asignado" ("id_asignacion", "id_docente", "id_curso", "id_grupo", "tipo_clase", "id_ambiente", "dia_semana", "hora_inicio", "hora_fin", "id_periodo", "id_ventana", "estado", "observaciones", "creado_por", "fecha_creacion", "fecha_actualizacion") VALUES');
    horarios.forEach((h, idx) => {
      const valores = [
        h.id_asignacion,
        h.id_docente,
        h.id_curso,
        h.id_grupo,
        `'${h.tipo_clase}'`,
        h.id_ambiente,
        h.dia_semana,
        `'${h.hora_inicio}'`,
        `'${h.hora_fin}'`,
        h.id_periodo,
        h.id_ventana || 'NULL',
        `'${h.estado}'`,
        h.observaciones ? `'${h.observaciones.replace(/'/g, "''")}'` : 'NULL',
        h.creado_por || 'NULL',
        `'${h.fecha_creacion.toISOString()}'`,
        `'${h.fecha_actualizacion.toISOString()}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === horarios.length - 1 ? ';' : ','}`);
    });
  }

  console.log('12. Exportando Días No Laborables...');
  const diasNoLaborables = await prisma.diaNoLaborable.findMany();
  if (diasNoLaborables.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: dia_no_laborable');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "dia_no_laborable" ("id_dia_no_laborable", "fecha", "descripcion", "tipo", "afecta_clases", "id_periodo") VALUES');
    diasNoLaborables.forEach((dnl, idx) => {
      const valores = [
        dnl.id_dia_no_laborable,
        `'${dnl.fecha.toISOString().split('T')[0]}'`,
        `'${dnl.descripcion.replace(/'/g, "''")}'`,
        `'${dnl.tipo}'`,
        dnl.afecta_clases,
        dnl.id_periodo || 'NULL'
      ].join(', ');
      lineas.push(`  (${valores})${idx === diasNoLaborables.length - 1 ? ';' : ','}`);
    });
  }

  console.log('13. Exportando Restricciones Institucionales...');
  const restricciones = await prisma.restriccionInstitucional.findMany();
  if (restricciones.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: restriccion_institucional');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "restriccion_institucional" ("id_restriccion", "tipo_restriccion", "nombre", "configuracion", "id_periodo", "activo", "fecha_creacion") VALUES');
    restricciones.forEach((r, idx) => {
      const valores = [
        r.id_restriccion,
        `'${r.tipo_restriccion}'`,
        `'${r.nombre.replace(/'/g, "''")}'`,
        r.configuracion ? `'${JSON.stringify(r.configuracion).replace(/'/g, "''")}'` : 'NULL',
        r.id_periodo || 'NULL',
        r.activo,
        `'${r.fecha_creacion.toISOString()}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === restricciones.length - 1 ? ';' : ','}`);
    });
  }

  console.log('14. Exportando Disponibilidad Docente...');
  const disponibilidad = await prisma.disponibilidadDocente.findMany();
  if (disponibilidad.length > 0) {
    lineas.push('');
    lineas.push('-- =============================================');
    lineas.push('-- TABLA: disponibilidad_docente');
    lineas.push('-- =============================================');
    lineas.push('');
    lineas.push('INSERT INTO "disponibilidad_docente" ("id_disponibilidad", "id_docente", "id_periodo", "dia_semana", "hora_inicio", "hora_fin", "disponible", "es_restriccion", "motivo_restriccion", "fecha_registro") VALUES');
    disponibilidad.forEach((d, idx) => {
      const valores = [
        d.id_disponibilidad,
        d.id_docente,
        d.id_periodo,
        d.dia_semana,
        `'${d.hora_inicio}'`,
        `'${d.hora_fin}'`,
        d.disponible,
        d.es_restriccion,
        d.motivo_restriccion ? `'${d.motivo_restriccion.replace(/'/g, "''")}'` : 'NULL',
        `'${d.fecha_registro.toISOString()}'`
      ].join(', ');
      lineas.push(`  (${valores})${idx === disponibilidad.length - 1 ? ';' : ','}`);
    });
  }

  console.log('\n📝 Escribiendo archivo SQL...');
  fs.writeFileSync(RUTA_ARCHIVO, lineas.join('\n'));

  console.log(`✅ Exportación completada exitosamente!`);
  console.log(`📁 Archivo guardado en: ${RUTA_ARCHIVO}`);
}

exportarSQL()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
