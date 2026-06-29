const tableBaseClass = 'w-full border-collapse border border-gray-900 table-fixed';
const tableHeadCellClass = 'border border-gray-900 px-2 py-1.5 text-center align-middle font-semibold leading-tight break-words whitespace-normal';
const tableBodyCellClass = 'border border-gray-900 px-2 py-1.5 align-top leading-snug break-words whitespace-normal overflow-hidden';
const tableBodyCellCenterClass = `${tableBodyCellClass} text-center`;

// Helper to normalize text: first letter uppercase, rest lowercase
const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  const normalized = String(text).toLowerCase().replace(/_/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

// Helper to format date in Spanish: "29 de junio de 2026"
const formatDateSpanish = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month} de ${year}`;
};

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
    <div className="p-8 max-w-6xl mx-auto bg-white" style={{ fontFamily: 'Times New Roman, serif', hyphens: 'auto' }}>
      <div className="text-center mb-4">
        <h1 className="text-base font-bold text-gray-900 uppercase tracking-wider break-words">HORARIO SEMANAL DE LA CARGA ACADÉMICA DOCENTE (F03-CAD)</h1>
      </div>

      {/* Header Info */}
      <div className="mb-4 text-xs">
        <div className="grid grid-cols-12 gap-1 mb-2">
          <div className="col-span-4 break-words">
            <span className="font-semibold">Facultad / Filial:</span> {docente?.facultad?.nombre || 'Ingeniería'}
          </div>
          <div className="col-span-4"></div>
          <div className="col-span-4 break-words">
            <span className="font-semibold">Dpto. Académico:</span> {docente?.departamento?.nombre || 'Ingeniería de Sistemas'}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-1 mb-2">
          <div className="col-span-3 break-words">
            <span className="font-semibold">DNI:</span> {docente?.dni_docente || ''}
          </div>
          <div className="col-span-5 break-words">
            <span className="font-semibold">Docente:</span> {docente?.apellidos}, {docente?.nombres}
          </div>
          <div className="col-span-4 break-words">
            <span className="font-semibold">A SOCIADO TC:</span>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-1">
          <div className="col-span-3 break-words">
            <span className="font-semibold">AÑO ACADÉMICO:</span> {periodo?.anio || new Date().getFullYear()}
          </div>
          <div className="col-span-2 break-words">
            <span className="font-semibold">SEMESTRE:</span> {periodo?.nombre || 'I'}
          </div>
          <div className="col-span-3 break-words">
            <span className="font-semibold">Fecha de Inicio:</span> {formatDate(periodo?.fecha_inicio)}
          </div>
          <div className="col-span-4 break-words">
            <span className="font-semibold">Fecha de Término:</span> {formatDate(periodo?.fecha_fin)}
          </div>
        </div>
      </div>

      {/* CHL Table */}
      <table className={`${tableBaseClass} mb-2 text-[11px]`} style={{ tableLayout: 'fixed', wordBreak: 'break-word', hyphens: 'auto' }}>
        <colgroup>
          <col style={{ width: '23%' }} />
          <col style={{ width: '45%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '8%' }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-100">
            <th className={tableHeadCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>HORARIO</th>
            <th className={tableHeadCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>CARGA HORARIA LECTIVA (CHL)</th>
            <th className={tableHeadCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>LUGAR</th>
            <th className={tableHeadCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>AULA</th>
            <th className={tableHeadCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {chlRows.map((row, idx) => (
            <tr key={idx}>
              <td className={`${tableBodyCellClass} whitespace-pre-line`} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>
                {row.horario.map((h: string, i: number) => (
                  <span key={i}>
                    {h}
                    <br />
                  </span>
                ))}
              </td>
              <td className={tableBodyCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>{row.curso}</td>
              <td className={tableBodyCellCenterClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>{row.lugar}</td>
              <td className={tableBodyCellCenterClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>{row.aula}</td>
              <td className={tableBodyCellCenterClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>{row.horas}</td>
            </tr>
          ))}
          {/* Total CHL Row */}
          <tr className="bg-gray-100">
            <td className={`${tableBodyCellClass} font-semibold`} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>T:</td>
            <td className={tableBodyCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}></td>
            <td className={tableBodyCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}></td>
            <td className={tableBodyCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}></td>
            <td className={`${tableBodyCellCenterClass} font-semibold`} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>{totalCHL}</td>
          </tr>
        </tbody>
      </table>

      {/* CHNL Table */}
      <table className={`${tableBaseClass} mb-2 text-[11px]`} style={{ tableLayout: 'fixed', wordBreak: 'break-word', hyphens: 'auto' }}>
        <colgroup>
          <col style={{ width: '23%' }} />
          <col style={{ width: '45%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '8%' }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-100">
            <th className={tableHeadCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>HORARIO</th>
            <th className={tableHeadCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>CARGA HORARIA NO LECTIVA (CHNL)</th>
            <th className={tableHeadCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>LUGAR</th>
            <th className={tableHeadCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>AULA</th>
            <th className={tableHeadCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {chnlRows.map((row, idx) => (
            <tr key={idx}>
              <td className={`${tableBodyCellClass} whitespace-pre-line`} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>
                {row.horario.map((h: string, i: number) => (
                  <span key={i}>
                    {h}
                    <br />
                  </span>
                ))}
              </td>
              <td className={tableBodyCellClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>{row.actividad}</td>
              <td className={tableBodyCellCenterClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>{row.lugar}</td>
              <td className={tableBodyCellCenterClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>{row.aula}</td>
              <td className={tableBodyCellCenterClass} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>{row.horas}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Row */}
      <table className={`${tableBaseClass} text-[11px]`} style={{ tableLayout: 'fixed', wordBreak: 'break-word', hyphens: 'auto' }}>
        <tbody>
          <tr className="bg-gray-200 font-bold">
            <td className="border border-gray-900 px-2 py-2 text-center" colSpan={4} style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>TOTAL HORAS CARGA ACADÉMICA</td>
            <td className="border border-gray-900 px-2 py-2 text-center" style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>{totalHoras}</td>
          </tr>
        </tbody>
      </table>

      {/* Notes */}
      <div className="mt-2 text-[10px] text-gray-700 space-y-1" style={{ wordBreak: 'break-word', hyphens: 'auto', overflowWrap: 'break-word' }}>
        <p className="break-words"><strong>T:</strong> TEORÍA, <strong>P:</strong> PRÁCTICA</p>
        <p className="break-words"><strong>LU (LUNES),</strong> <strong>MA (MARTES),</strong> <strong>MI (MIÉRCOLES),</strong> <strong>JU (JUEVES),</strong> <strong>VI (VIERNES),</strong> <strong>SA (SÁBADO).</strong> TIEMPO EN FORMATO DE 24 HORAS.</p>
        <p className="break-words"><strong>LUGAR:</strong> FC1: FIC - Ciencias - Atmosféricas; FC2: FC - Biológicas; FC3: FC - Económicas; FCS: Ciencias y Matemáticas; FCQ: FC - Químicas; FIA: FIA - Contabilidad y Ciencias Administrativas; FIC: FIC - Civil; FIE: FIE - Electrónica y Eléctrica; FIM: FIM - Mecánica; FIS: FIS - Sistemas; FIT: FIT - Textil; FIZ: FIZ - Zootecnia; 01: Plazoleta Jequetepeque; F16: Fial Santiago de Chuco; CA: Oficina Administrativa; SC: Salón de Consejo;</p>
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
  // Helper function to format date as dd/mm/yyyy (for period dates)
  const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '[dd/mm/aaaa]';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '[dd/mm/aaaa]';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fechaEmision = formatDateSpanish(new Date());

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
    if (acts.length === 0) return '';

    const formatKey = (key: string) => {
      const keyMap: Record<string, string> = {
        'ciclos_academicos': 'Ciclos Académicos',
        'ciclo_academico': 'Ciclo Académico',
        'cantidad_alumnos': 'Cantidad de Alumnos',
        'numero_inscripcion': 'Número de Inscripción',
        'codigo_proyecto': 'Código del Proyecto',
        'nombre_proyecto': 'Nombre del Proyecto',
        'duracion': 'Duración',
        'resolucion_decenal': 'Resolución Decenal',
        'resolucion_autorizativa': 'Resolución Autorizativa',
        'cargo': 'Cargo',
        'cargo_indique': 'Cargo',
        'numero_resolucion': 'Número de Resolución',
        'titulo': 'Título del Proyecto',
        'titulo_tesis': 'Título de la Tesis',
        'nombre_estudiante': 'Nombre del Estudiante',
        'titulo_programa': 'Título del Programa',
        'institucion': 'Institución',
        'numero_horas_total': 'Número de Horas Total',
        'descripcion_actividad': 'Descripción de la Actividad',
        'detalle_proceso': 'Detalle del Proceso',
        'autoevaluacion_acreditacion_aprobada': 'Proceso Aprobado',
        'actividad': 'Actividad',
        'proyecto_programa': 'Proyecto/Programa',
        'comunidades': 'Comunidades',
        'referencia_curso': 'Referencia del Curso',
        'lugar': 'Lugar',
        'aula_total': 'Aula Total'
      };
      return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    };

    return acts.map((a: any) => {
      const parts: string[] = [];

      // Add the main name of the activity
      if (a.nombre) {
        parts.push(`<strong>${a.nombre}</strong>`);
      }

      // Add the description if it exists
      if (a.descripcion) {
        parts.push(a.descripcion);
      }

      // Add all relevant datos_sustento with clear labels, except unwanted ones
      const keysToSkip = ['id_ambiente', 'numero_horas_total'];
      if (a.datos_sustento) {
        Object.entries(a.datos_sustento).forEach(([key, value]) => {
          if (!value || keysToSkip.includes(key)) return;

          let formattedValue = '';
          
          if (key === 'ciclos_academicos' && Array.isArray(value)) {
            formattedValue = value.map((c: any) => 
              typeof c === 'string' ? `Ciclo ${c}` : `Ciclo ${c.ciclo}`
            ).join(', ');
          } else if (key === 'ciclo_academico') {
            formattedValue = `Ciclo ${value}`;
          } else if (typeof value === 'string' || typeof value === 'number') {
            formattedValue = String(value);
          } else if (typeof value === 'boolean') {
            formattedValue = value ? 'Sí' : 'No';
          }

          if (formattedValue) {
            parts.push(`${formatKey(key)}: ${formattedValue}`);
          }
        });
      }

      return parts.join(' • ');
    }).join('; ');
  };

  const getActividadHoras = (tipo: string) => {
    const acts = actividades?.filter((a: any) => a.tipo_actividad === tipo) || [];
    return acts.reduce((sum: number, a: any) => sum + (a.horas_asignadas || a.horas_semanales || 0), 0);
  };

  const uniqueCursos = getUniqueCursosFromHorarios();

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">FORMATO N° 1</h1>
        <h2 className="text-lg font-semibold mt-2 text-gray-800">
          DECLARACIÓN DE CARGA HORARIA ASIGNADA
        </h2>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">I. DATOS SOBRE LA SITUACIÓN DEL PROFESOR:</h3>
        <table className={`${tableBaseClass} text-sm`}>
          <tbody>
            <tr>
              <td className="border border-gray-900 px-3 py-2 w-1/5 font-medium align-top">FACULTAD:</td>
              <td className="border border-gray-900 px-3 py-2 w-4/5">{docente?.facultad?.nombre || '[Ingrese Nombre de Facultad]'}</td>
            </tr>
            <tr>
              <td className="border border-gray-900 px-3 py-2 font-medium align-top">DPTO. ACADÉMICO:</td>
              <td className="border border-gray-900 px-3 py-2">{docente?.departamento?.nombre || '[Ingrese Departamento Académico]'}</td>
            </tr>
          </tbody>
        </table>
        <table className={`${tableBaseClass} mt-2 text-xs`}>
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-900 px-3 py-2 text-xs leading-tight">NOMBRE COMPLETO</th>
              <th className="border border-gray-900 px-3 py-2 text-xs leading-tight">CONDICIÓN</th>
              <th className="border border-gray-900 px-3 py-2 text-xs leading-tight">CATEGORÍA</th>
              <th className="border border-gray-900 px-3 py-2 text-xs leading-tight">MODALIDAD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-900 px-3 py-2 text-xs leading-snug">{docente?.apellidos}, {docente?.nombres}</td>
              <td className="border border-gray-900 px-3 py-2 text-xs text-center leading-snug">{normalizeText(docente?.modalidad || docente?.categoria) || 'Nombrado'}</td>
              <td className="border border-gray-900 px-3 py-2 text-xs text-center leading-snug">{normalizeText(docente?.categoria) || 'Principal'}</td>
              <td className="border border-gray-900 px-3 py-2 text-xs text-center leading-snug">
                {normalizeText(docente?.dedicacion || docente?.tipo_dedicacion_laboral) || 'Tiempo Completo'}
              </td>
            </tr>
          </tbody>
        </table>
        <table className={`${tableBaseClass} mt-2 text-xs`}>
          <tbody>
            <tr>
              <td className="border border-gray-900 px-3 py-2 w-1/4 font-medium text-xs">AÑO ACADÉMICO:</td>
              <td className="border border-gray-900 px-3 py-2 w-1/4 text-xs">{periodo?.anio || '[Ingrese Año]'}</td>
              <td className="border border-gray-900 px-3 py-2 w-1/4 font-medium text-xs">CICLO:</td>
              <td className="border border-gray-900 px-3 py-2 w-1/4 text-xs">{periodo?.nombre || '[Ingrese Ciclo]'}</td>
            </tr>
            <tr>
              <td className="border border-gray-900 px-3 py-2 font-medium text-xs">INICIO:</td>
              <td className="border border-gray-900 px-3 py-2 text-xs">{formatDate(periodo?.fecha_inicio)}</td>
              <td className="border border-gray-900 px-3 py-2 font-medium text-xs">FINAL:</td>
              <td className="border border-gray-900 px-3 py-2 text-xs">{formatDate(periodo?.fecha_fin)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2 text-sm">1. TRABAJO LECTIVO. Datos completos y con claridad</h3>
        <table className={`${tableBaseClass} text-[11px]`}>
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '7%' }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-200">
              <th className={tableHeadCellClass}>CÓDIGO</th>
              <th className={tableHeadCellClass}>NOMBRE DEL CURSO</th>
              <th className={tableHeadCellClass}>CUR.</th>
              <th className={tableHeadCellClass}>ESCUELA PROF.</th>
              <th className={tableHeadCellClass}>CIC.</th>
              <th className={tableHeadCellClass}>SEC.</th>
              <th className={tableHeadCellClass}>N° AL.</th>
              <th className={tableHeadCellClass}>HT</th>
              <th className={tableHeadCellClass}>HP</th>
              <th className={tableHeadCellClass}>HL</th>
              <th className={tableHeadCellClass}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {uniqueCursos.map((h: any, idx: number) => {
              const { ht, hp, hl } = calculateHorasPorTipo(h.id_curso, h.id_grupo);
              const total = ht + hp + hl;
              return (
                <tr key={idx}>
                  <td className={tableBodyCellCenterClass}>{h.curso?.codigo || '-'}</td>
                  <td className={tableBodyCellClass}>{h.curso?.nombre || '-'}</td>
                  <td className={tableBodyCellCenterClass}>-</td>
                  <td className={tableBodyCellCenterClass}>{docente?.escuela_profesional || '-'}</td>
                  <td className={tableBodyCellCenterClass}>{h.curso?.ciclo || '-'}</td>
                  <td className={tableBodyCellCenterClass}>{h.grupo?.codigo_grupo || '-'}</td>
                  <td className={tableBodyCellCenterClass}>{h.grupo?.cantidad_matriculados || '-'}</td>
                  <td className={tableBodyCellCenterClass}>{ht}</td>
                  <td className={tableBodyCellCenterClass}>{hp}</td>
                  <td className={tableBodyCellCenterClass}>{hl}</td>
                  <td className={tableBodyCellCenterClass}>{total}</td>
                </tr>
              );
            })}
            {(!uniqueCursos || uniqueCursos.length === 0) && (
              <tr>
                <td colSpan={11} className="border border-gray-900 px-3 py-3 text-center text-xs">
                  No hay cursos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <table className={`${tableBaseClass} text-[11px]`}>
        <colgroup>
          <col style={{ width: '33%' }} />
          <col style={{ width: '57%' }} />
          <col style={{ width: '10%' }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-200">
            <th className={tableHeadCellClass}>DETALLE</th>
            <th className={tableHeadCellClass}>SUSTENTO / DESCRIPCIÓN</th>
            <th className={tableHeadCellClass}>HORAS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={`${tableBodyCellClass} font-medium`}>2. PREPARACIÓN Y EVALUACIÓN (Max 50% del Trabajo Lectivo)</td>
            <td className={tableBodyCellClass}></td>
            <td className={tableBodyCellCenterClass}>{carga?.horas_preparacion || carga?.horas_preparacion_evaluacion || 0}</td>
          </tr>
          <tr>
            <td className={`${tableBodyCellClass} font-medium`}>3. TUTORÍA / CONSEJERÍA: Señalar número de alumnos y el ciclo académico en el que se desempeña:</td>
            <td className={tableBodyCellClass} dangerouslySetInnerHTML={{ __html: getActividadText('tutoria_consejeria') }}></td>
            <td className={tableBodyCellCenterClass}>{getActividadHoras('tutoria_consejeria')}</td>
          </tr>
          <tr>
            <td className={`${tableBodyCellClass} font-medium`}>4. INVESTIGACIÓN: Consignar el N° de inscripción, código, nombre y duración del proyecto. (Como máximo 04 y 05 horas semanales), según modalidad de trabajo docente:</td>
            <td className={tableBodyCellClass} dangerouslySetInnerHTML={{ __html: getActividadText('investigacion') }}></td>
            <td className={tableBodyCellCenterClass}>{getActividadHoras('investigacion')}</td>
          </tr>
          <tr>
            <td className={`${tableBodyCellClass} font-medium`}>5. CAPACITACIÓN: Señalar la referencia a este curso en el marco de los planes de cada Facultad (como máximo 05 semanas.):</td>
            <td className={tableBodyCellClass} dangerouslySetInnerHTML={{ __html: getActividadText('perfeccionamiento') }}></td>
            <td className={tableBodyCellCenterClass}>{getActividadHoras('perfeccionamiento')}</td>
          </tr>
          <tr>
            <td className={`${tableBodyCellClass} font-medium`}>6. ACTIVIDADES DE GOBIERNO: Sí desempeña cargo indique.</td>
            <td className={tableBodyCellClass} dangerouslySetInnerHTML={{ __html: getActividadText('gestion_gobierno') }}></td>
            <td className={tableBodyCellCenterClass}>{getActividadHoras('gestion_gobierno')}</td>
          </tr>
          <tr>
            <td className={`${tableBodyCellClass} font-medium`}>7. ASESORÍA DE TESIS, EXÁMENES PROFESIONALES Y EXPERIENCIA DECENCIAL, profesional: Indicar el número de Resolución Decenal, proyectos y la duración de la actividad programada:</td>
            <td className={tableBodyCellClass} dangerouslySetInnerHTML={{ __html: getActividadText('asesoria_tesis_jurado') }}></td>
            <td className={tableBodyCellCenterClass}>{getActividadHoras('asesoria_tesis_jurado')}</td>
          </tr>
          <tr>
            <td className={`${tableBodyCellClass} font-medium`}>8. RESPONSABILIDAD SOCIAL UNIVERSITARIA: Señalar actividad, proyecto programas a ejecutarse y comunidades de las cuales se ocupa: (Como máximo 02 horas semanales)</td>
            <td className={tableBodyCellClass} dangerouslySetInnerHTML={{ __html: getActividadText('responsabilidad_social') }}></td>
            <td className={tableBodyCellCenterClass}>{getActividadHoras('responsabilidad_social')}</td>
          </tr>
          <tr>
            <td className={`${tableBodyCellClass} font-medium`}>9. COMITÉS TÉCNICOS Y COMISIONES: Consignar el número de Resolución autorizativa indicando el cargo de vigencia.</td>
            <td className={tableBodyCellClass} dangerouslySetInnerHTML={{ __html: getActividadText('comites_comisiones') }}></td>
            <td className={tableBodyCellCenterClass}>{getActividadHoras('comites_comisiones')}</td>
          </tr>
          <tr className="bg-gray-200 font-bold">
            <td className="border border-gray-900 px-2 py-2 text-right" colSpan={2}>TOTAL</td>
            <td className="border border-gray-900 px-2 py-2 text-center">{carga?.horas_totales || 0}</td>
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
  const fechaActual = formatDateSpanish(new Date());

  // Obtener condición (Nombrado / Contratado)
  const condicion =
    docente?.modalidad === 'nombrado'
      ? 'Ordinario'
      : docente?.modalidad === 'extraordinario'
        ? 'Extraordinario'
        : 'Contratado';
  
  // Obtener dedicación y texto correspondiente
  let dedicacionTexto = '';
  let articulosTexto = '';
  
  switch(docente?.dedicacion || docente?.tipo_dedicacion_laboral) {
    case 'dedicacion_exclusiva':
      dedicacionTexto = 'Dedicación Exclusiva';
      articulosTexto = 'y me conformo con los Artículos 21° y 22° del Estatuto Institucional vigente';
      break;
    case 'tiempo_completo':
      dedicacionTexto = 'Tiempo Completo 40 H';
      articulosTexto = '(De conformidad con los artículos 270° y 277° del Estatuto Institucional vigente)';
      break;
    case 'tiempo_parcial_20':
      dedicacionTexto = 'Tiempo Parcial 20 H';
      articulosTexto = '';
      break;
    case 'tiempo_parcial_16':
      dedicacionTexto = 'Tiempo Parcial 16 H';
      articulosTexto = '';
      break;
    case 'tiempo_parcial_12':
      dedicacionTexto = 'Tiempo Parcial 12 H';
      articulosTexto = '';
      break;
    case 'tiempo_parcial_10':
      dedicacionTexto = 'Tiempo Parcial 10 H';
      articulosTexto = '';
      break;
    case 'tiempo_parcial_08':
      dedicacionTexto = 'Tiempo Parcial 08 H';
      articulosTexto = '';
      break;
    case 'tiempo_parcial_04':
      dedicacionTexto = 'Tiempo Parcial 04 H';
      articulosTexto = '';
      break;
    case 'por_horas':
      dedicacionTexto = 'Por Horas';
      articulosTexto = '';
      break;
    case 'docente_investigador':
      dedicacionTexto = 'Docente Investigador';
      articulosTexto = '';
      break;
    default:
      dedicacionTexto = docente?.dedicacion?.replace(/_/g, ' ') || 'Tiempo Completo';
      articulosTexto = '';
  }

  return (
    <div className="p-10 max-w-4xl mx-auto bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Encabezado oficial */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
          Universidad Nacional de Trujillo
        </h1>
        <h2 className="text-xl font-bold text-gray-900 mt-4 uppercase">
          DECLARACIÓN JURADA DE NO ESTAR INCLUSO EN CAUSALES DE INCOMPATIBILIDAD
        </h2>
        <p className="text-sm text-gray-600 mt-2">(Modificado R.R. N° 643-2011-UNT)</p>
      </div>

      <div className="space-y-6 leading-relaxed text-base">
        <p className="text-justify indent-8">
          Yo, <span className="font-semibold">{docente?.apellidos}, {docente?.nombres}</span>, identificado
          con D.N.I. N° <span className="font-semibold">{docente?.dni_docente || docente?.dni || '-'}</span>, con Código Docente N°
          <span className="font-semibold"> {docente?.codigo_docente || '-'}</span>, del Departamento Académico de <span className="font-semibold"> {docente?.departamento?.nombre || '[Ingrese Dpto.]'}</span> de la Facultad de <span className="font-semibold">{docente?.facultad?.nombre || '[Ingrese Facultad]'}</span> de la Universidad Nacional de Trujillo, en el marco del programa de homologación de la remuneración de los docentes nombrados y contratados, dispuesto por la D.S. N° 033-2006-ED y D.S. N° 019-2007-ED;
        </p>

        <p className="text-justify font-semibold uppercase">
          DECLARO BAJO JURAMENTO:
        </p>

        <div className="pl-8">
          <p className="text-justify indent-8">
            Soy docente <span className="font-semibold">{condicion}</span>, a <span className="font-semibold">{dedicacionTexto}</span> y NO desempeño cargo público o privado, remunerado o no, en horas que coinciden con el horario establecido en la Universidad Nacional de Trujillo {articulosTexto}.
          </p>
        </div>

        <p className="text-justify indent-8">
          En caso de faltar a la verdad, me someto a las sanciones que sean aplicables de acuerdo a la normatividad vigente, asimismo, de encontrarme incurso en situación de incompatibilidad, renuncio expresa y anticipadamente la facultad para que la autoridad competente disponga el descuento por horas de funcionamiento de la unidad académica y la retención o devolución de los pagos cobrados indebidamente durante el lapso de tiempo laborado ilegalmente.
        </p>

        <div className="text-center mt-16">
          <p>Se expide la presente declaración en la ciudad de Trujillo, a {fechaActual}.</p>
        </div>

        {/* Espacio para firma */}
        <div className="mt-64 flex flex-col items-center">
          {/* Espacio para firma física/digital - 80px de alto */}
          <div className="w-80 h-24 flex items-end justify-center">
            <div className="w-full border-t-2 border-gray-800"></div>
          </div>
          {/* Etiqueta y datos del declarante */}
          <div className="text-center mt-2">
            <p className="text-sm font-semibold uppercase">FIRMA DEL DECLARANTE</p>
            <p className="text-sm font-medium mt-4">{docente?.apellidos}, {docente?.nombres}</p>
            <p className="text-sm text-gray-700 mt-1">D.N.I.: {docente?.dni_docente || docente?.dni || '-'}</p>
          </div>
        </div>

        <div className="mt-16 text-xs text-gray-600 border-t border-gray-400 pt-4">
          <p><strong>Nota:</strong> Los docentes deben suscribir dos copias del presente formulario en cada Semestre Académico, en el evento de la Declaración de Carga Académica.</p>
        </div>
      </div>
    </div>
  );
}
