const {
  construirErroresFormularioDocenteCliente,
  resumirCambiosFormularioDocente
} = require('@/lib/docentesFormulario');

describe('docentesFormulario', () => {
  it('marca errores de integridad en campos obligatorios', () => {
    const errores = construirErroresFormularioDocenteCliente({
      codigo_docente: '',
      nombres: '',
      apellidos: '',
      correo_electronico: 'correo-invalido',
      dni_docente: '12',
      fecha_ingreso: '',
      id_facultad: '',
      id_departamento: '',
      dedicacion: ''
    });

    expect(errores.codigo_docente).toBeDefined();
    expect(errores.nombres).toBeDefined();
    expect(errores.apellidos).toBeDefined();
    expect(errores.correo_electronico).toBeDefined();
    expect(errores.dni_docente).toBeDefined();
    expect(errores.fecha_ingreso).toBeDefined();
    expect(errores.id_facultad).toBeDefined();
    expect(errores.id_departamento).toBeDefined();
    expect(errores.dedicacion).toBeDefined();
  });

  it('resume cambios relevantes del formulario', () => {
    const anterior = {
      nombres: 'JUAN',
      apellidos: 'PEREZ',
      modalidad: 'nombrado',
      categoria_ordinaria: 'principal',
      dedicacion: 'tiempo_completo',
      fecha_ingreso: '2024-01-01'
    };

    const siguiente = {
      nombres: 'JUAN CARLOS',
      apellidos: 'PEREZ',
      modalidad: 'extraordinario',
      tipo_extraordinario: 'experto',
      dedicacion: 'tiempo_parcial_10',
      fecha_ingreso: '2024-02-01'
    };

    const cambios = resumirCambiosFormularioDocente(anterior, siguiente);
    const campos = cambios.map((item) => item.campo);

    expect(campos).toContain('nombres');
    expect(campos).toContain('modalidad');
    expect(campos).toContain('dedicacion');
    expect(campos).toContain('fecha_ingreso');
  });
});
