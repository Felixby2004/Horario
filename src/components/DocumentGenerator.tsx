export function DocumentoHorarioSemanal({ carga, docente, periodo, horarios, actividades }: any) {
  console.log('DocumentoHorarioSemanal props:', { carga, docente, periodo, horarios, actividades });
  const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '[dd/mm/aaaa]';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '[dd/mm/aaaa]';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const diasSemanaLetras: Record<number, string> = {
    0: 'LU',
    1: 'MA',
    2: 'MI',
    3: 'JU',
    4: 'VI',
    5: 'SA'
  };

  // Group all horarios by course (id_curso + id_grupo)
  const chlRows: any[] = [];
  const tempCursos: Record<string, any> = {};
  
  // Filter horarios to only those in the current period
  const horariosFiltrados = (horarios || []).filter((h: any) => 
    !periodo || h.id_periodo === periodo.id_periodo
  );
  
  // First process all horarios to build tempCursos
  horariosFiltrados.forEach((h: any) => {
    const key = `${h.id_curso}-${h.id_grupo}`;
    console.log('Processing horario:', { h, key });
    if (!tempCursos[key]) {
      tempCursos[key] = {
        curso: h.curso || h.grupo?.curso,
        grupo: h.grupo,
        ambiente: h.ambiente,
        horarios: [],
        totalMinutos: 0
      };
    }
    
    const tipo = h.tipo_clase === 'teoria' ? 'T' : h.tipo_clase === 'practica' ? 'P' : 'LAB';
    const diaLetra = diasSemanaLetras[h.dia_semana];
    tempCursos[key].horarios.push(`${tipo}: ${diaLetra}(${h.hora_inicio}-${h.hora_fin})`);
    
    const [hi, mi] = h.hora_inicio.split(':').map(Number);
    const [hf, mf] = h.hora_fin.split(':').map(Number);
    tempCursos[key].totalMinutos += (hf * 60 + mf) - (hi * 60 + mi);
  });
  
  // Now process docente.cursos to add any cursos that don't have horarios yet!
  console.log('docente.cursos:', docente.cursos);
  if (docente?.cursos) {
    // First get all docente grupos from periodo? Or maybe we need to get all grupos for periodo?
    // Wait, let's get all grupos for the current periodo, then check if they are assigned to the docente
    // For now, let's first add all docente.cursos even if they have no grupos/horarios
    // But let's check if the curso is already in tempCursos!
    docente.cursos.forEach((dc: any) => {
      const curso = dc.curso;
      // Check if this curso is already in tempCursos
      const alreadyAdded = Object.values(tempCursos).some((c: any) => c.curso?.id_curso === curso.id_curso);
      if (!alreadyAdded) {
        // If not, add it with empty horarios!
        // But we need grupo? Let's try to find any grupo for this curso and periodo!
        // For now, let's just add the curso without grupo
        const key = `${curso.id_curso}-nogrupo`;
        tempCursos[key] = {
          curso: curso,
          grupo: null,
          ambiente: null,
          horarios: [],
          totalMinutos: 0
        };
      }
    });
  }
  
  // Convert to array for the table
  console.log('tempCursos:', tempCursos);
  Object.values(tempCursos).forEach((cursoData: any) => {
    chlRows.push({
      horario: cursoData.horarios, // Pass as array to use .map
      curso: cursoData.grupo 
        ? `${cursoData.curso?.nombre || ''} - ${cursoData.grupo?.codigo_grupo || ''}` 
        : cursoData.curso?.nombre || '',
      lugar: cursoData.ambiente?.pabellon || cursoData.ambiente?.codigo || '-',
      aula: cursoData.ambiente?.nombre || cursoData.ambiente?.codigo || '-',
      horas: String(cursoData.totalMinutos / 60)
    });
  });
  console.log('chlRows:', chlRows);

  // Calculate CHL total
  const totalCHL = horariosFiltrados.reduce((sum: number, h: any) => {
    const [hi, mi] = h.hora_inicio.split(':').map(Number);
    const [hf, mf] = h.hora_fin.split(':').map(Number);
    return sum + ((hf * 60 + mf) - (hi * 60 + mi));
  }, 0) / 60;

  // Build CHNL rows, including horarios for activities that have them
  const chnlRows: any[] = [];
  
  // Helper to format activity horarios
  const formatActivityHorarios = (horarios: any[]) => {
    const diaLetra: Record<string, string> = { 'Lunes': 'LU', 'Martes': 'MA', 'Miércoles': 'MI', 'Jueves': 'JU', 'Viernes': 'VI', 'Sábado': 'SA' };
    return (horarios || []).map((h: any) => `${diaLetra[h.dia]}(${h.inicio}-${h.fin})`);
  };
  
  // Preparación y Evaluación
  const prepEvalActivity = actividades?.find((a: any) => a.tipo_actividad === 'preparacion_evaluacion');
  if (prepEvalActivity) {
    const horarioArray = formatActivityHorarios(prepEvalActivity.horarios_actividad);
    const lugarStr = prepEvalActivity.datos_sustento?.lugar || '';
    const aulaStr = prepEvalActivity.datos_sustento?.aula_total || '';
    
    chnlRows.push({
      horario: horarioArray,
      actividad: 'PREPARACIÓN Y EVALUACIÓN',
      lugar: lugarStr,
      aula: aulaStr,
      horas: prepEvalActivity.horas_semanales || carga?.horas_preparacion || 0
    });
  } else {
    chnlRows.push({
      horario: [],
      actividad: 'PREPARACIÓN Y EVALUACIÓN',
      lugar: '',
      aula: '',
      horas: carga?.horas_preparacion || 0
    });
  }

  // Tutoría y Consejería
  const tutorias = actividades?.filter((a: any) => a.tipo_actividad === 'tutoria_consejeria') || [];
  tutorias.forEach((a: any) => {
    const horarioArray = formatActivityHorarios(a.horarios_actividad);
    const lugarStr = a.datos_sustento?.lugar || '';
    const aulaStr = a.datos_sustento?.aula_total || '';
    
    chnlRows.push({
      horario: horarioArray,
      actividad: 'TUTORÍA Y CONSEJERÍA',
      lugar: lugarStr,
      aula: aulaStr,
      horas: a.horas_semanales || a.horas_asignadas || 0
    });
  });
  if (tutorias.length === 0) {
    chnlRows.push({
      horario: [],
      actividad: 'TUTORÍA Y CONSEJERÍA',
      lugar: '',
      aula: '',
      horas: 0
    });
  }

  // Investigación
  const investigaciones = actividades?.filter((a: any) => a.tipo_actividad === 'investigacion') || [];
  investigaciones.forEach((a: any) => {
    const horarioArray = formatActivityHorarios(a.horarios_actividad);
    const lugarStr = a.datos_sustento?.lugar || '';
    const aulaStr = a.datos_sustento?.aula_total || '';
    
    chnlRows.push({
      horario: horarioArray,
      actividad: 'INVESTIGACIÓN',
      lugar: lugarStr,
      aula: aulaStr,
      horas: a.horas_semanales || a.horas_asignadas || 0
    });
  });
  if (investigaciones.length === 0) {
    chnlRows.push({
      horario: [],
      actividad: 'INVESTIGACIÓN',
      lugar: '',
      aula: '',
      horas: 0
    });
  }

  // Responsabilidad Social
  const rs = actividades?.filter((a: any) => a.tipo_actividad === 'responsabilidad_social') || [];
  rs.forEach((a: any) => {
    const horarioArray = formatActivityHorarios(a.horarios_actividad);
    const lugarStr = a.datos_sustento?.lugar || '';
    const aulaStr = a.datos_sustento?.aula_total || '';
    
    chnlRows.push({
      horario: horarioArray,
      actividad: 'RESPONSABILIDAD SOCIAL UNIVERSITARIA',
      lugar: lugarStr,
      aula: aulaStr,
      horas: a.horas_semanales || a.horas_asignadas || 0
    });
  });
  if (rs.length === 0) {
    chnlRows.push({
      horario: [],
      actividad: 'RESPONSABILIDAD SOCIAL UNIVERSITARIA',
      lugar: '',
      aula: '',
      horas: 0
    });
  }

  // Asesoría de Tesis
  const tesis = actividades?.filter((a: any) => a.tipo_actividad === 'asesoria_tesis_jurado') || [];
  tesis.forEach((a: any) => {
    const horarioArray = formatActivityHorarios(a.horarios_actividad);
    const lugarStr = a.datos_sustento?.lugar || '';
    const aulaStr = a.datos_sustento?.aula_total || '';
    
    chnlRows.push({
      horario: horarioArray,
      actividad: 'ASESORÍA DE TESIS Y EXÁMENES PROFESIONALES',
      lugar: lugarStr,
      aula: aulaStr,
      horas: a.horas_semanales || a.horas_asignadas || 0
    });
  });
  if (tesis.length === 0) {
    chnlRows.push({
      horario: [],
      actividad: 'ASESORÍA DE TESIS Y EXÁMENES PROFESIONALES',
      lugar: '',
      aula: '',
      horas: 0
    });
  }

  // Formación Académica
  const formacion = actividades?.filter((a: any) => a.tipo_actividad === 'perfeccionamiento') || [];
  formacion.forEach((a: any) => {
    const horarioArray = formatActivityHorarios(a.horarios_actividad);
    const lugarStr = a.datos_sustento?.lugar || '';
    const aulaStr = a.datos_sustento?.aula_total || '';
    
    chnlRows.push({
      horario: horarioArray,
      actividad: 'FORMACIÓN ACADÉMICA Y CAPACITACIÓN',
      lugar: lugarStr,
      aula: aulaStr,
      horas: a.horas_semanales || a.horas_asignadas || 0
    });
  });
  if (formacion.length === 0) {
    chnlRows.push({
      horario: [],
      actividad: 'FORMACIÓN ACADÉMICA Y CAPACITACIÓN',
      lugar: '',
      aula: '',
      horas: 0
    });
  }

  // Autoevaluación y Acreditación
  chnlRows.push({
    horario: [],
    actividad: 'AUTOEVALUACIÓN Y ACREDITACIÓN DE LA ESCUELA PROFESIONAL',
    lugar: '',
    aula: '',
    horas: 0
  });

  // Comités Técnicos
  chnlRows.push({
    horario: [],
    actividad: 'COMITÉS TÉCNICOS Y COMISIONES ESPECIALES',
    lugar: '',
    aula: '',
    horas: 0
  });

  // Actividades de Gobierno
  const gobierno = actividades?.filter((a: any) => a.tipo_actividad === 'gestion_gobierno') || [];
  gobierno.forEach((a: any) => {
    const horarioArray = formatActivityHorarios(a.horarios_actividad);
    const lugarStr = a.datos_sustento?.lugar || '';
    const aulaStr = a.datos_sustento?.aula_total || '';
    
    chnlRows.push({
      horario: horarioArray,
      actividad: 'ACTIVIDADES DE GOBIERNO Y/O GESTIÓN INSTITUCIONAL',
      lugar: lugarStr,
      aula: aulaStr,
      horas: a.horas_semanales || a.horas_asignadas || 0
    });
  });
  if (gobierno.length === 0) {
    chnlRows.push({
      horario: [],
      actividad: 'ACTIVIDADES DE GOBIERNO Y/O GESTIÓN INSTITUCIONAL',
      lugar: '',
      aula: '',
      horas: 0
    });
  }

  // Calculate totals
  const totalCHNL = chnlRows.reduce((sum: number, r: any) => sum + (Number(r.horas) || 0), 0);
  const totalHoras = totalCHL + totalCHNL;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="text-center mb-4">
        <h1 className="text-base font-bold text-gray-900 uppercase tracking-wider">HORARIO SEMANAL DE LA CARGA ACADÉMICA DOCENTE (F03-CAD)</h1>
      </div>

      {/* Header Info */}
      <div className="mb-4 text-xs">
        <div className="grid grid-cols-12 gap-1 mb-2">
          <div className="col-span-4">
            <span className="font-semibold">Facultad / Filial:</span> {docente?.facultad?.nombre || 'Ingeniería'}
          </div>
          <div className="col-span-4"></div>
          <div className="col-span-4">
            <span className="font-semibold">Dpto. Académico:</span> {docente?.departamento?.nombre || 'Ingeniería de Sistemas'}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-1 mb-2">
          <div className="col-span-3">
            <span className="font-semibold">DNI:</span> {docente?.dni_docente || ''}
          </div>
          <div className="col-span-5">
            <span className="font-semibold">Docente:</span> {docente?.apellidos}, {docente?.nombres}
          </div>
          <div className="col-span-4">
            <span className="font-semibold">A SOCIADO TC:</span>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-1">
          <div className="col-span-3">
            <span className="font-semibold">AÑO ACADÉMICO:</span> {periodo?.anio || new Date().getFullYear()}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">SEMESTRE:</span> {periodo?.nombre || 'I'}
          </div>
          <div className="col-span-3">
            <span className="font-semibold">Fecha de Inicio:</span> {formatDate(periodo?.fecha_inicio)}
          </div>
          <div className="col-span-4">
            <span className="font-semibold">Fecha de Término:</span> {formatDate(periodo?.fecha_fin)}
          </div>
        </div>
      </div>

      {/* CHL Table */}
      <table className="w-full border-collapse border border-gray-900 mb-1 text-xs" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-900 p-1 text-center">HORARIO</th>
            <th className="border border-gray-900 p-1 text-center">CARGA HORARIA LECTIVA (CHL)</th>
            <th className="border border-gray-900 p-1 text-center">LUGAR</th>
            <th className="border border-gray-900 p-1 text-center">AULA</th>
            <th className="border border-gray-900 p-1 text-center">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {chlRows.map((row, idx) => (
            <tr key={idx}>
              <td className="border border-gray-900 p-1">
                {row.horario.map((h: string, i: number) => (
                  <span key={i}>
                    {h}
                    <br />
                  </span>
                ))}
              </td>
              <td className="border border-gray-900 p-1">{row.curso}</td>
              <td className="border border-gray-900 p-1 text-center">{row.lugar}</td>
              <td className="border border-gray-900 p-1 text-center">{row.aula}</td>
              <td className="border border-gray-900 p-1 text-center">{row.horas}</td>
            </tr>
          ))}
          {/* Total CHL Row */}
          <tr className="bg-gray-100">
            <td className="border border-gray-900 p-1 font-semibold">T:</td>
            <td className="border border-gray-900 p-1"></td>
            <td className="border border-gray-900 p-1"></td>
            <td className="border border-gray-900 p-1"></td>
            <td className="border border-gray-900 p-1 text-center font-semibold">{totalCHL}</td>
          </tr>
        </tbody>
      </table>

      {/* CHNL Table */}
      <table className="w-full border-collapse border border-gray-900 mb-1 text-xs" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-900 p-1 text-center">HORARIO</th>
            <th className="border border-gray-900 p-1 text-center">CARGA HORARIA NO LECTIVA (CHNL)</th>
            <th className="border border-gray-900 p-1 text-center">LUGAR</th>
            <th className="border border-gray-900 p-1 text-center">AULA</th>
            <th className="border border-gray-900 p-1 text-center">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {chnlRows.map((row, idx) => (
            <tr key={idx}>
              <td className="border border-gray-900 p-1">
                {row.horario.map((h: string, i: number) => (
                  <span key={i}>
                    {h}
                    <br />
                  </span>
                ))}
              </td>
              <td className="border border-gray-900 p-1">{row.actividad}</td>
              <td className="border border-gray-900 p-1 text-center">{row.lugar}</td>
              <td className="border border-gray-900 p-1 text-center">{row.aula}</td>
              <td className="border border-gray-900 p-1 text-center">{row.horas}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Row */}
      <table className="w-full border-collapse border border-gray-900 text-xs" style={{ tableLayout: 'fixed' }}>
        <tbody>
          <tr className="bg-gray-200 font-bold">
            <td className="border border-gray-900 p-1 text-center" colSpan={4}>TOTAL HORAS CARGA ACADÉMICA</td>
            <td className="border border-gray-900 p-1 text-center">{totalHoras}</td>
          </tr>
        </tbody>
      </table>

      {/* Notes */}
      <div className="mt-2 text-[10px] text-gray-700 space-y-1">
        <p><strong>T:</strong> TEORÍA, <strong>P:</strong> PRÁCTICA</p>
        <p><strong>LU (LUNES),</strong> <strong>MA (MARTES),</strong> <strong>MI (MIÉRCOLES),</strong> <strong>JU (JUEVES),</strong> <strong>VI (VIERNES),</strong> <strong>SA (SÁBADO).</strong> TIEMPO EN FORMATO DE 24 HORAS.</p>
        <p><strong>LUGAR:</strong> FC1: FIC - Ciencias - Atmosféricas; FC2: FC - Biológicas; FC3: FC - Económicas; FCS: Ciencias y Matemáticas; FCQ: FC - Químicas; FIA: FIA - Contabilidad y Ciencias Administrativas; FIC: FIC - Civil; FIE: FIE - Electrónica y Eléctrica; FIM: FIM - Mecánica; FIS: FIS - Sistemas; FIT: FIT - Textil; FIZ: FIZ - Zootecnia; 01: Plazoleta Jequetepeque; F16: Fial Santiago de Chuco; CA: Oficina Administrativa; SC: Salón de Consejo";</p>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-8 mt-8 text-[10px]">
        <div className="text-center">
          <div className="border-t border-gray-900 pt-2">
            <p className="font-semibold">FIRMA DEL DOCENTE</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-900 pt-2">
            <p className="font-semibold">FIRMA Y SELLO DEL DIRECTOR DE DPTO.ACADÉMICO</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-900 pt-2">
            <p className="font-semibold">V°B° DECANO</p>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // Get unique course-group combinations from horarios and docente.cursos
  const getUniqueCursosFromHorarios = () => {
    const unique: any[] = [];
    const seen = new Set();
    
    // First add all from horarios
    (horarios || []).forEach((h: any) => {
      const key = `${h.id_curso}-${h.id_grupo}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(h);
      }
    });
    
    // Then add all from docente.cursos that aren't already there
    if (docente?.cursos) {
      docente.cursos.forEach((dc: any) => {
        const curso = dc.curso;
        const key = `${curso.id_curso}-no-group`;
        // Check if this curso is already in unique
        const alreadyAdded = unique.some((u: any) => u.curso?.id_curso === curso.id_curso || u.id_curso === curso.id_curso);
        if (!alreadyAdded) {
          // Add a dummy entry
          unique.push({
            curso: curso,
            grupo: null,
            id_curso: curso.id_curso,
            id_grupo: null
          });
        }
      });
    }
    
    return unique;
  };

  // Calculate hours per type (teoria, practica, laboratorio) for each course-group
  const calculateHorasPorTipo = (id_curso: number, id_grupo: number) => {
    const courseHorarios = (horarios || []).filter(
      (h: any) => h.id_curso === id_curso && h.id_grupo === id_grupo
    );
    
    let ht = 0;
    let hp = 0;
    let hl = 0;
    
    courseHorarios.forEach((h: any) => {
      // Calculate duration in hours
      const [hi, mi] = h.hora_inicio.split(':').map(Number);
      const [hf, mf] = h.hora_fin.split(':').map(Number);
      const duration = (hf * 60 + mf - hi * 60 - mi) / 60;
      
      if (h.tipo_clase === 'teoria') {
        ht += duration;
      } else if (h.tipo_clase === 'practica') {
        hp += duration;
      } else if (h.tipo_clase === 'laboratorio') {
        hl += duration;
      }
    });
    
    return { ht, hp, hl };
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

  const uniqueCursos = getUniqueCursosFromHorarios();

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white">
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
            {uniqueCursos.map((h: any, idx: number) => {
              const { ht, hp, hl } = calculateHorasPorTipo(h.id_curso, h.id_grupo);
              const total = ht + hp + hl;
              return (
                <tr key={idx}>
                  <td className="border border-gray-900 p-1 text-center">{h.curso?.codigo || '-'}</td>
                  <td className="border border-gray-900 p-1">{h.curso?.nombre || '-'}</td>
                  <td className="border border-gray-900 p-1 text-center">-</td>
                  <td className="border border-gray-900 p-1 text-center">{docente?.escuela_profesional || '-'}</td>
                  <td className="border border-gray-900 p-1 text-center">{h.curso?.ciclo || '-'}</td>
                  <td className="border border-gray-900 p-1 text-center">{h.grupo?.codigo_grupo || '-'}</td>
                  <td className="border border-gray-900 p-1 text-center">{h.grupo?.cantidad_matriculados || '-'}</td>
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
    <div className="p-8 max-w-5xl mx-auto bg-white">
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
          <span className="font-semibold"> {docente?.codigo_docente || '-'}</span> del <span className="font-semibold"> {docente?.departamento?.nombre || '[Ingrese Dpto.]'}</span> de la <span className="font-semibold">{docente?.facultad?.nombre || '[Ingrese Facultad]'}</span> de la Universidad Nacional de Trujillo, en el marco del programa de homologación de la remuneración de los docentes nombrados y contrato, dispuesto por la D.S. N° 033-2006-ED y D.S. N° 019-2007-ED;
        </p>

        <p className="text-justify font-semibold">
          DECLARO BAJO JURAMENTO EN LOS CASOS A APLICAR:
        </p>

        <div className="pl-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-1">☐</span>
            <p className="text-justify">
              No estoy inscrito en universidades de la UNT, o de la provincia y no tengo impedimento para ejercer la docencia y estoy en condiciones de cumplir cabalmente con el Estatuto vigente;
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg mt-1">
              {(docente?.tipo_dedicacion_laboral === 'dedicacion_exclusiva') ? '☑' : '☐'}
            </span>
            <p className="text-justify">
              Soy docente {(docente?.modalidad === 'nombrado') ? '(☑)' : '( )'} / contratado {(docente?.modalidad === 'contratado') ? '(☑)' : '( )'}, a Dedicación Exclusiva y no desempeño otro cargo público o privado en horas que coinciden con el horario establecido en la Universidad Nacional de Trujillo y me conformo con los Artículos 21° y 22° del Estatuto vigente;
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg mt-1">
              {(docente?.tipo_dedicacion_laboral === 'tiempo_completo') ? '☑' : '☐'}
            </span>
            <p className="text-justify">
              Soy docente {(docente?.modalidad === 'nombrado') ? '(☑)' : '( )'} / contratado {(docente?.modalidad === 'contratado') ? '(☑)' : '( )'}, a Tiempo Completo 40h, y no desempeño cargo público o privado en horas que coinciden con el horario establecido en la Universidad Nacional de Trujillo y me conformo con los Artículos 21° y 22° del Estatuto vigente;
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg mt-1">
              {(docente?.tipo_dedicacion_laboral === 'tiempo_parcial_20' || docente?.tipo_dedicacion_laboral === 'por_horas') ? '☑' : '☐'}
            </span>
            <p className="text-justify">
              Soy docente {(docente?.modalidad === 'nombrado') ? '(☑)' : '( )'} / contratado {(docente?.modalidad === 'contratado') ? '(☑)' : '( )'}, a Tiempo Parcial 27h / 20h y no desempeño cargo público o privado en horas que coinciden con el horario establecido en la Universidad Nacional de Trujillo.
            </p>
          </div>
        </div>

        <p className="text-justify mt-6">
          En caso de faltar a la verdad, me someto a las sanciones que sean aplicables de acuerdo a ley, asimismo, de encontrar incurso en situación de incompatibilidad, renuncio la facultad del MONTO COMPETENTE DISPONGA EL DESCUENTO POR HORAS DE FUNCIONAMIENTO DE LA UNIDAD DE LA UNIVERSIDAD LIQUIDEZ COBROS INDEBIDOS POR EL LAPSO DE TIEMPO LABORADO ILLEGALMENTE.
        </p>

        <div className="text-center mt-12">
          <p>Trujillo, {fechaActual}</p>
        </div>

        <div className="text-center mt-30">
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
