export function DocumentoCargaAcademica({ carga, docente, periodo, horarios, actividades }: any) {
  // Helper function to format date as dd/mm/yyyy
  const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '[dd/mm/aaaa]';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '[dd/mm/aaaa]';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fechaEmision = formatDate(new Date());

  // Get unique courses from docente.cursos
  const getUniqueCursos = () => {
    const cursos: any[] = docente?.cursos || [];
    // Group by curso id to avoid duplicates
    const unique: any[] = [];
    const seen = new Set();
    for (const dc of cursos) {
      if (!seen.has(dc.id_curso)) {
        seen.add(dc.id_curso);
        unique.push(dc);
      }
    }
    return unique;
  };

  const getActividadText = (tipo: string) => {
    const acts = actividades?.filter((a: any) => a.tipo_actividad === tipo) || [];
    return acts.map((a: any) => {
      let text = a.nombre || '';
      if (a.datos_sustento) {
        Object.entries(a.datos_sustento).forEach(([key, value]) => {
          if (value && !['ciclo_academico', 'cantidad_alumnos'].includes(key)) {
            text += (text ? ' ' : '') + value;
          }
        });
      }
      return text;
    }).join('; ');
  };

  const getActividadHoras = (tipo: string) => {
    const acts = actividades?.filter((a: any) => a.tipo_actividad === tipo) || [];
    return acts.reduce((sum: number, a: any) => sum + (a.horas_asignadas || a.horas_semanales || 0), 0);
  };

  const uniqueCursos = getUniqueCursos();

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">FORMATO N° 1</h1>
        <h2 className="text-lg font-semibold mt-2 text-gray-800">
          DECLARACIÓN DE CARGA HORARIA ASIGNADA
        </h2>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">I. DATOS SOBRE LA SITUACIÓN DEL PROFESOR:</h3>
        <table className="w-full border-collapse border border-gray-900">
          <tbody>
            <tr>
              <td className="border border-gray-900 p-2 w-1/5 font-medium">FACULTAD:</td>
              <td className="border border-gray-900 p-2 w-4/5">{docente?.facultad?.nombre || '[Ingrese Nombre de Facultad]'}</td>
            </tr>
            <tr>
              <td className="border border-gray-900 p-2 font-medium">DPTO. ACADÉMICO:</td>
              <td className="border border-gray-900 p-2">{docente?.departamento?.nombre || '[Ingrese Departamento Académico]'}</td>
            </tr>
          </tbody>
        </table>
        <table className="w-full border-collapse border border-gray-900 mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-900 p-2 text-xs">NOMBRE COMPLETO</th>
              <th className="border border-gray-900 p-2 text-xs">CONDICIÓN</th>
              <th className="border border-gray-900 p-2 text-xs">CATEGORÍA</th>
              <th className="border border-gray-900 p-2 text-xs">MODALIDAD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-900 p-2 text-xs">{docente?.apellidos}, {docente?.nombres}</td>
              <td className="border border-gray-900 p-2 text-xs">{docente?.modalidad || docente?.categoria || 'Nombrado'}</td>
              <td className="border border-gray-900 p-2 text-xs">{docente?.categoria || 'Principal'}</td>
              <td className="border border-gray-900 p-2 text-xs">
                {docente?.tipo_dedicacion_laboral?.replace(/_/g, ' ') ||
                  docente?.dedicacion?.replace(/_/g, ' ') ||
                  'Tiempo Completo'}
              </td>
            </tr>
          </tbody>
        </table>
        <table className="w-full border-collapse border border-gray-900 mt-2">
          <tbody>
            <tr>
              <td className="border border-gray-900 p-2 w-1/4 font-medium text-xs">AÑO ACADÉMICO:</td>
              <td className="border border-gray-900 p-2 w-1/4 text-xs">{periodo?.anio || '[Ingrese Año]'}</td>
              <td className="border border-gray-900 p-2 w-1/4 font-medium text-xs">CICLO:</td>
              <td className="border border-gray-900 p-2 w-1/4 text-xs">{periodo?.nombre || '[Ingrese Ciclo]'}</td>
            </tr>
            <tr>
              <td className="border border-gray-900 p-2 font-medium text-xs">INICIO:</td>
              <td className="border border-gray-900 p-2 text-xs">{formatDate(periodo?.fecha_inicio)}</td>
              <td className="border border-gray-900 p-2 font-medium text-xs">FINAL:</td>
              <td className="border border-gray-900 p-2 text-xs">{formatDate(periodo?.fecha_fin)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2 text-sm">1. TRABAJO LECTIVO. Datos completos y con claridad</h3>
        <table className="w-full border-collapse border border-gray-900 text-xs">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-900 p-1">CÓDIGO</th>
              <th className="border border-gray-900 p-1">NOMBRE DEL CURSO</th>
              <th className="border border-gray-900 p-1">CUR.</th>
              <th className="border border-gray-900 p-1">ESCUELA PROF.</th>
              <th className="border border-gray-900 p-1">CIC.</th>
              <th className="border border-gray-900 p-1">SEC.</th>
              <th className="border border-gray-900 p-1">N° AL.</th>
              <th className="border border-gray-900 p-1">HT</th>
              <th className="border border-gray-900 p-1">HP</th>
              <th className="border border-gray-900 p-1">HL</th>
              <th className="border border-gray-900 p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {uniqueCursos.map((dc: any, idx: number) => {
              const ht = dc.curso?.horas_teoria || 0;
              const hp = dc.curso?.horas_practica || 0;
              const hl = dc.curso?.horas_laboratorio || 0;
              const total = ht + hp + hl;
              return (
                <tr key={idx}>
                  <td className="border border-gray-900 p-1 text-center">{dc.curso?.codigo || '-'}</td>
                  <td className="border border-gray-900 p-1">{dc.curso?.nombre || '-'}</td>
                  <td className="border border-gray-900 p-1 text-center">-</td>
                  <td className="border border-gray-900 p-1 text-center">{docente?.escuela_profesional || '-'}</td>
                  <td className="border border-gray-900 p-1 text-center">{dc.curso?.ciclo || '-'}</td>
                  <td className="border border-gray-900 p-1 text-center">-</td>
                  <td className="border border-gray-900 p-1 text-center">-</td>
                  <td className="border border-gray-900 p-1 text-center">{ht}</td>
                  <td className="border border-gray-900 p-1 text-center">{hp}</td>
                  <td className="border border-gray-900 p-1 text-center">{hl}</td>
                  <td className="border border-gray-900 p-1 text-center">{total}</td>
                </tr>
              );
            })}
            {(!uniqueCursos || uniqueCursos.length === 0) && (
              <tr>
                <td colSpan={11} className="border border-gray-900 p-2 text-center text-xs">
                  No hay cursos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <table className="w-full border-collapse border border-gray-900 text-xs">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-900 p-1 w-1/3">DESCRIPCIÓN</th>
            <th className="border border-gray-900 p-1 w-2/3">DESCRIPCIÓN</th>
            <th className="border border-gray-900 p-1 w-16 text-center">HORAS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">2. PREPARACIÓN Y EVALUACIÓN (Max 50% del Trabajo Lectivo)</td>
            <td className="border border-gray-900 p-1"></td>
            <td className="border border-gray-900 p-1 text-center">{carga?.horas_preparacion || carga?.horas_preparacion_evaluacion || 0}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">3. TUTORÍA / CONSEJERÍA: Señalar número de alumnos y el ciclo académico en el que se desempeña:</td>
            <td className="border border-gray-900 p-1">{getActividadText('tutoria_consejeria')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('tutoria_consejeria')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">4. INVESTIGACIÓN: Consignar el N° de inscripción, código, nombre y duración del proyecto. (Como máximo 04 y 05 horas semanales), según modalidad de trabajo docente:</td>
            <td className="border border-gray-900 p-1">{getActividadText('investigacion')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('investigacion')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">5. CAPACITACIÓN: Señalar la referencia a este curso en el marco de los planes de cada Facultad (como máximo 05 semanas.):</td>
            <td className="border border-gray-900 p-1">{getActividadText('perfeccionamiento')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('perfeccionamiento')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">6. ACTIVIDADES DE GOBIERNO: Sí desempeña cargo indique.</td>
            <td className="border border-gray-900 p-1">{getActividadText('gestion_gobierno')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('gestion_gobierno')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">7. ASESORÍA DE TESIS, EXÁMENES PROFESIONALES Y EXPERIENCIA DECENCIAL, profesional: Indicar el número de Resolución Decenal, proyectos y la duración de la actividad programada:</td>
            <td className="border border-gray-900 p-1">{getActividadText('asesoria_tesis_jurado')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('asesoria_tesis_jurado')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">8. RESPONSABILIDAD SOCIAL UNIVERSITARIA: Señalar actividad, proyecto programas a ejecutarse y comunidades de las cuales se ocupa: (Como máximo 02 horas semanales)</td>
            <td className="border border-gray-900 p-1">{getActividadText('responsabilidad_social')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('responsabilidad_social')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">9. COMITÉS TÉCNICOS Y COMISIONES: Consignar el número de Resolución autorizativa indicando el cargo de vigencia.</td>
            <td className="border border-gray-900 p-1"></td>
            <td className="border border-gray-900 p-1 text-center">0</td>
          </tr>
          <tr className="bg-gray-200 font-bold">
            <td className="border border-gray-900 p-1 text-right" colSpan={2}>TOTAL</td>
            <td className="border border-gray-900 p-1 text-center">{carga?.horas_totales || 0}</td>
          </tr>
        </tbody>
      </table>

      <div className="text-right mt-6 mb-8 text-sm">
        <p>Trujillo, {fechaEmision}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="text-center">
          <div className="border-t border-gray-900 pt-2 mt-4">
            <p className="text-sm">Firma del Profesor</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-900 pt-2 mt-4">
            <p className="text-sm">Firma del Director de Dpto.</p>
          </div>
        </div>
      </div>

      <div className="text-right mt-8 text-sm">
        <p className="font-bold">V° B° DECANO FAC.</p>
      </div>
    </div>
  );
}

export function DocumentoDeclaracionJurada({ docente }: any) {
  const fechaActual = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">
          DECLARACIÓN JURADA DE NO ESTAR INCLUSO EN CAUSALES
        </h1>
        <p className="text-sm text-gray-600 mt-2">(Modificado R.R. N° 643-2011-UNT)</p>
      </div>

      <div className="space-y-4 leading-relaxed">
        <p className="text-justify">
          Yo, <span className="font-semibold">{docente?.apellidos}, {docente?.nombres}</span>, identificado
          con D.N.I. N° <span className="font-semibold">{docente?.dni_docente || '-'}</span>, con Código N°
          <span className="font-semibold"> {docente?.codigo_docente || '-'}</span> del Departamento Académico
          <span className="font-semibold"> [Ingrese Dpto.]</span> de la Facultad de <span className="font-semibold">[Ingrese Facultad]</span>
          de la Universidad Nacional de Trujillo, en el marco del programa de homologación de la
          remuneración de los docentes nombrados y contrato, dispuesto por la D.S. N° 033-2006-ED y
          D.S. N° 019-2007-ED;
        </p>

        <p className="text-justify font-semibold">
          DECLARO BAJO JURAMENTO EN LOS CASOS A APLICAR:
        </p>

        <div className="pl-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-1">□</span>
            <p className="text-justify">
              No estoy inscrito en universidades de la UNT, o de la provincia y no tengo impedimento para ejercer la docencia y estoy en condiciones de cumplir cabalmente con el Estatuto vigente;
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg mt-1">□</span>
            <p className="text-justify">
              Soy docente nombrado ( ) / contratado ( ), a Dedicación Exclusiva y no desempeño otro cargo público o privado en horas que coinciden con el horario establecido en la Universidad Nacional de Trujillo y me conformo con los Artículos 21° y 22° del Estatuto vigente;
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg mt-1">□</span>
            <p className="text-justify">
              Soy docente nombrado ( ) / contratado ( ) a Tiempo Completo 40h, y no desempeño cargo público o privado en horas que coinciden con el horario establecido en la Universidad Nacional de Trujillo y me conformo con los Artículos 21° y 22° del Estatuto vigente;
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg mt-1">□</span>
            <p className="text-justify">
              Soy docente nombrado ( ) / contratado ( ) a Tiempo Parcial 27h / 20h y no desempeño cargo público o privado en horas que coinciden con el horario establecido en la Universidad Nacional de Trujillo.
            </p>
          </div>
        </div>

        <p className="text-justify mt-6">
          En caso de faltar a la verdad, me someto a las sanciones que sean aplicables de acuerdo a ley, asimismo, de encontrar incurso en situación de incompatibilidad, renuncio la facultad del MONTO COMPETENTE DISPONGA EL DESCUENTO POR HORAS DE FUNCIONAMIENTO DE LA UNIDAD DE LA UNIVERSIDAD LIQUIDE COBROS INDEBIDOS POR EL LAPSO DE TIEMPO LABORADO ILLEGALMENTE.
        </p>

        <div className="text-center mt-12">
          <p>Trujillo, {fechaActual}</p>
        </div>

        <div className="text-center mt-12">
          <div className="border-t-2 border-gray-700 pt-4 mx-auto w-64">
            <p className="text-sm font-medium">FIRMA DEL DECLARANTE</p>
            <p className="text-sm text-gray-600">D.N.I.: {docente?.dni_docente || '-'}</p>
          </div>
        </div>

        <div className="mt-12 text-xs text-gray-500 border-t border-gray-300 pt-4">
          <p><strong>Nota:</strong> Los docentes deben suscribir dos copias del presente formulario en cada Semestre Académico, en el evento de la Declaración de Carga Académica.</p>
        </div>
      </div>
    </div>
  );
}
