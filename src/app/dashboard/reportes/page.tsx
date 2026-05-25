'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReportesPage() {
  const tiposReporte = [
    {
      id: 'aula',
      titulo: 'Reporte por aula',
      descripcion: 'Horario semanal completo de una aula específica',
      icono: '🏫',
      color: 'bg-blue-500',
      ruta: '/dashboard/reportes/aula',
      caracteristicas: ['Horario semanal', 'Cursos y grupos', 'Docentes asignados']
    },
    {
      id: 'laboratorio',
      titulo: 'Reporte por laboratorio',
      descripcion: 'Horario semanal completo de un laboratorio',
      icono: '💻',
      color: 'bg-purple-500',
      ruta: '/dashboard/reportes/laboratorio',
      caracteristicas: ['Horario semanal', 'Prácticas de laboratorio', 'Capacidad']
    },
    {
      id: 'docente',
      titulo: 'Reporte por docente',
      descripcion: 'Horario semanal o carga horaria de un docente',
      icono: '👨‍🏫',
      color: 'bg-green-500',
      ruta: '/dashboard/reportes/docente',
      caracteristicas: ['Horario semanal', 'Carga horaria', 'Resumen de cursos']
    },
    {
      id: 'ciclo',
      titulo: 'Reporte por ciclo',
      descripcion: 'Todos los cursos y horarios asignados de un ciclo académico',
      icono: '🎓',
      color: 'bg-indigo-500',
      ruta: '/dashboard/reportes/ciclo',
      caracteristicas: ['Todos los horarios', 'Resumen por curso', 'Vista por ciclo']
    },
    {
      id: 'gestion',
      titulo: 'Reporte de gestión',
      descripcion: 'Estadísticas y análisis general del sistema',
      icono: '📊',
      color: 'bg-orange-500',
      ruta: '/dashboard/reportes/gestion',
      caracteristicas: ['Estadísticas globales', 'Carga por docente', 'Ratios y promedios']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📋 Centro de reportes</h1>
        <p className="text-gray-600 text-lg">
          Genera reportes detallados en PDF y Excel del sistema de horarios
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiposReporte.map((tipo) => (
          <Link key={tipo.id} href={tipo.ruta}>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-2xl hover:scale-105 transition-all cursor-pointer h-full border-t-4"
              style={{ borderTopColor: tipo.color === 'bg-blue-500' ? '#3b82f6' : tipo.color === 'bg-purple-500' ? '#a855f7' : tipo.color === 'bg-green-500' ? '#22c55e' : '#f97316' }}>
              <div className={`${tipo.color} w-16 h-16 rounded-lg flex items-center justify-center text-3xl mb-4`}>
                {tipo.icono}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{tipo.titulo}</h3>
              <p className="text-gray-600 mb-4">{tipo.descripcion}</p>
              <div className="space-y-1">
                {tipo.caracteristicas.map((carac, idx) => (
                  <p key={idx} className="text-sm text-gray-500 flex items-center">
                    <span className="mr-2">✓</span> {carac}
                  </p>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">📝</span> Información sobre reportes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">📄</span>
            <div>
              <p className="font-semibold text-blue-900">Múltiples formatos</p>
              <p className="text-sm text-blue-800">PDF de alta calidad y Excel para análisis</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🎨</span>
            <div>
              <p className="font-semibold text-blue-900">Diseño profesional</p>
              <p className="text-sm text-blue-800">Incluyen logo y datos institucionales</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚡</span>
            <div>
              <p className="font-semibold text-blue-900">Descarga rápida</p>
              <p className="text-sm text-blue-800">Generación instantánea de reportes</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🎓</span>
            <div>
              <p className="font-semibold text-blue-900">Reporte por ciclo</p>
              <p className="text-sm text-blue-800">Agrupa todos los cursos y bloques asignados por ciclo académico</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <p className="font-semibold text-blue-900">Datos actualizados</p>
              <p className="text-sm text-blue-800">Información en tiempo real del sistema</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
        <h3 className="text-lg font-bold mb-4 text-gray-900">✨ Características principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Reportes por aula y laboratorio</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Horario semanal completo</li>
              <li>✓ Listado de cursos y grupos</li>
              <li>✓ Docentes asignados</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Reportes por docente</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Horario semanal personal</li>
              <li>✓ Carga horaria total</li>
              <li>✓ Resumen de cursos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Reporte por ciclo</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Todos los horarios del ciclo</li>
              <li>✓ Resumen de cursos asignados</li>
              <li>✓ Vista consolidada por bloque</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Reporte de gestión</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Estadísticas globales</li>
              <li>✓ Carga por docente</li>
              <li>✓ Análisis de ratios</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Formatos de descarga</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ PDF de alta calidad</li>
              <li>✓ Excel para análisis</li>
              <li>✓ Descarga directa</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6">
        <p className="text-sm text-amber-800">
          <strong>💡 Tip:</strong> Selecciona el período académico y la entidad (aula, laboratorio o docente) para generar el reporte. Los reportes incluyen el formato institucional de la Universidad Nacional de Trujillo.
        </p>
      </div>
    </div>
  );
}
