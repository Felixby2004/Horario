import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import {
  construirErroresFormularioDocente,
  fusionarErroresDocente,
  normalizarTextoSimple,
  validarUnicidadDocente,
  registrarHistorialImportacionDocente
} from '@/lib/docentesIntegridad';
import { normalizarPayloadDocente } from '@/lib/docentes';

type RegistroPreviewDocente = {
  id: string;
  fila: number;
  seleccionado: boolean;
  accion: 'crear' | 'actualizar';
  datos: any;
  errores: string[];
  errores_campo: Record<string, string>;
  advertencias: string[];
  docente_existente?: {
    id_docente: number;
    codigo_docente: string;
    nombres: string;
    apellidos: string;
  } | null;
};

type ResultadoVistaPreviaDocente = {
  nombre_archivo: string;
  formato: string;
  registros: RegistroPreviewDocente[];
  resumen: {
    total: number;
    validos: number;
    con_errores: number;
    seleccionados: number;
  };
};

export class ImportadorDocentes {
  static formatosSoportados = ['xlsx', 'csv', 'ods'];

  static async generarVistaPreviaDesdeArchivo(
    archivoBuffer: Buffer,
    nombreArchivo: string
  ): Promise<ResultadoVistaPreviaDocente> {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    if (!this.formatosSoportados.includes(extension)) {
      throw new Error('Formato no soportado. Usa un archivo .xlsx, .csv o .ods.');
    }

    const workbook = XLSX.read(archivoBuffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const filasCrudas = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: '',
      raw: false
    });

    return this.generarVistaPreviaDesdeRegistros(filasCrudas, nombreArchivo, extension);
  }

  static async generarVistaPreviaDesdeRegistros(
    filasCrudas: Array<Record<string, any>>,
    nombreArchivo: string,
    formato = 'manual'
  ): Promise<ResultadoVistaPreviaDocente> {
    const catalogos = await this.cargarCatalogos();
    const docentesExistentes = await prisma.docente.findMany({
      select: {
        id_docente: true,
        codigo_docente: true,
        correo_electronico: true,
        dni_docente: true,
        nombres: true,
        apellidos: true
      }
    });

    const candidatos = filasCrudas.map((fila, index) =>
      this.normalizarFilaImportada(fila, index + 2, catalogos)
    );

    const duplicados = this.detectarDuplicadosInternos(candidatos);
    const registros: RegistroPreviewDocente[] = [];

    for (const candidato of candidatos) {
      const docenteExistente = docentesExistentes.find(
        (docente) => docente.codigo_docente === candidato.datos.codigo_docente
      );
      const erroresLocal = fusionarErroresDocente(
        construirErroresFormularioDocente(candidato.datos),
        this.construirErroresDuplicados(candidato, duplicados),
        await validarUnicidadDocente(candidato.datos, {
          excludeId: docenteExistente?.id_docente
        })
      );

      const errores = Object.values(erroresLocal).filter(Boolean) as string[];
      const advertencias: string[] = [];

      if (docenteExistente) {
        advertencias.push('El código ya existe. El registro se actualizará al confirmar.');
      }

      registros.push({
        id: `fila-${candidato.fila}`,
        fila: candidato.fila,
        seleccionado: errores.length === 0,
        accion: docenteExistente ? 'actualizar' : 'crear',
        datos: candidato.datos,
        errores,
        errores_campo: erroresLocal as Record<string, string>,
        advertencias,
        docente_existente: docenteExistente
          ? {
              id_docente: docenteExistente.id_docente,
              codigo_docente: docenteExistente.codigo_docente,
              nombres: docenteExistente.nombres,
              apellidos: docenteExistente.apellidos
            }
          : null
      });
    }

    return {
      nombre_archivo: nombreArchivo,
      formato,
      registros,
      resumen: {
        total: registros.length,
        validos: registros.filter((registro) => registro.errores.length === 0).length,
        con_errores: registros.filter((registro) => registro.errores.length > 0).length,
        seleccionados: registros.filter((registro) => registro.seleccionado).length
      }
    };
  }

  static async importarRegistrosConfirmados(params: {
    registros: Array<any>;
    nombreArchivo: string;
    formato: string;
    idUsuarioResponsable?: number | null;
  }) {
    const vistaPrevia = await this.generarVistaPreviaDesdeRegistros(
      params.registros.map((registro) => registro.datos || registro),
      params.nombreArchivo,
      params.formato
    );

    const seleccionados = vistaPrevia.registros.filter((registro) => {
      const original = params.registros.find(
        (item) => (item.id && item.id === registro.id) || item.fila === registro.fila
      );
      return original?.seleccionado !== false;
    });

    const resultados: Array<{
      fila: number;
      exito: boolean;
      accion: 'crear' | 'actualizar';
      mensaje: string;
      docente?: any;
    }> = [];

    for (const registro of seleccionados) {
      if (registro.errores.length > 0) {
        resultados.push({
          fila: registro.fila,
          exito: false,
          accion: registro.accion,
          mensaje: registro.errores.join(' ')
        });
        continue;
      }

      try {
        const payload = registro.datos;
        const dataDocente = {
          codigo_docente: payload.codigo_docente,
          nombres: payload.nombres,
          apellidos: payload.apellidos,
          modalidad: payload.modalidad,
          categoria: payload.categoria,
          categoria_ordinaria: payload.categoria_ordinaria || null,
          tipo_contrato: payload.tipo_contrato || null,
          tipo_extraordinario: payload.tipo_extraordinario || null,
          dedicacion: payload.dedicacion,
          tipo_dedicacion_laboral: payload.tipo_dedicacion_laboral || 'tiempo_completo',
          correo_electronico: payload.correo_electronico || null,
          telefono: payload.telefono || null,
          grado_academico: payload.grado_academico || null,
          especialidad: payload.especialidad || null,
          dni_docente: payload.dni_docente || null,
          horas_maximas_semanales: payload.horas_maximas_semanales || 40,
          fecha_ingreso: payload.fecha_ingreso ? new Date(payload.fecha_ingreso) : null,
          escuela_profesional: payload.escuela_profesional || null,
          id_facultad: payload.id_facultad ? parseInt(String(payload.id_facultad)) : null,
          id_departamento: payload.id_departamento ? parseInt(String(payload.id_departamento)) : null,
          activo: true
        };

        const docente = registro.accion === 'actualizar' && registro.docente_existente
          ? await prisma.docente.update({
              where: { id_docente: registro.docente_existente.id_docente },
              data: dataDocente
            })
          : await prisma.docente.create({
              data: dataDocente
            });

        resultados.push({
          fila: registro.fila,
          exito: true,
          accion: registro.accion,
          mensaje: registro.accion === 'actualizar' ? 'Docente actualizado correctamente.' : 'Docente creado correctamente.',
          docente
        });
      } catch (error: any) {
        resultados.push({
          fila: registro.fila,
          exito: false,
          accion: registro.accion,
          mensaje: error.message || 'No se pudo importar el registro.'
        });
      }
    }

    await registrarHistorialImportacionDocente({
      idUsuarioResponsable: params.idUsuarioResponsable,
      nombreArchivo: params.nombreArchivo,
      formatoArchivo: params.formato,
      totalRegistros: vistaPrevia.resumen.total,
      registrosValidos: vistaPrevia.resumen.validos,
      registrosImportados: resultados.filter((resultado) => resultado.exito).length,
      registrosError: resultados.filter((resultado) => !resultado.exito).length,
      estado: resultados.some((resultado) => !resultado.exito) ? 'parcial' : 'completado',
      detalleResultado: resultados
    });

    return {
      resumen: {
        total: vistaPrevia.resumen.total,
        seleccionados: seleccionados.length,
        exitosos: resultados.filter((resultado) => resultado.exito).length,
        errores: resultados.filter((resultado) => !resultado.exito).length
      },
      resultados
    };
  }

  private static obtenerExtensionArchivo(nombreArchivo: string) {
    const partes = String(nombreArchivo || '').toLowerCase().split('.');
    return partes.length > 1 ? partes[partes.length - 1] : '';
  }

  private static async cargarCatalogos() {
    const [facultades, departamentos] = await Promise.all([
      prisma.facultad.findMany({
        select: { id_facultad: true, nombre: true }
      }),
      prisma.departamentoAcademico.findMany({
        select: { id_departamento: true, nombre: true, id_facultad: true }
      })
    ]);

    return { facultades, departamentos };
  }

  private static normalizarFilaImportada(
    filaCruda: Record<string, any>,
    fila: number,
    catalogos: Awaited<ReturnType<typeof this.cargarCatalogos>>
  ) {
    const valor = (claves: string[]) => {
      for (const clave of claves) {
        const encontrada = Object.keys(filaCruda).find(
          (actual) => this.normalizarClave(actual) === this.normalizarClave(clave)
        );
        if (encontrada) {
          return filaCruda[encontrada];
        }
      }
      return '';
    };

    const modalidad = this.normalizarModalidad(
      valor(['modalidad', 'tipo_docente', 'condicion'])
    );
    const categoriaNormalizada = this.normalizarCategoria(valor(['categoria', 'categoria_ordinaria']));
    const tipoContrato = this.normalizarTipoContrato(
      valor(['tipo_contrato', 'contrato', 'categoria'])
    );
    const tipoExtraordinario = this.normalizarTipoExtraordinario(
      valor(['tipo_extraordinario', 'subtipo_extraordinario'])
    );
    const facultad = this.resolverFacultad(
      valor(['id_facultad', 'facultad', 'nombre_facultad']),
      catalogos
    );
    const departamento = this.resolverDepartamento(
      valor(['id_departamento', 'departamento', 'departamento_academico']),
      facultad?.id_facultad,
      catalogos
    );

    const payload = normalizarPayloadDocente({
      codigo_docente: normalizarTextoSimple(valor(['codigo_docente', 'codigo', 'codigo docente'])),
      nombres: valor(['nombres', 'nombre']),
      apellidos: valor(['apellidos', 'apellido']),
      modalidad,
      categoria_ordinaria: modalidad === 'nombrado' ? categoriaNormalizada : '',
      tipo_contrato: modalidad === 'contratado' ? tipoContrato : '',
      tipo_extraordinario: modalidad === 'extraordinario' ? tipoExtraordinario : '',
      dedicacion: this.normalizarDedicacion(valor(['dedicacion', 'regimen', 'regimen_dedicacion'])),
      correo_electronico: normalizarTextoSimple(valor(['correo_electronico', 'correo', 'email'])).toLowerCase(),
      telefono: normalizarTextoSimple(valor(['telefono', 'celular'])),
      grado_academico: normalizarTextoSimple(valor(['grado_academico', 'grado'])),
      especialidad: normalizarTextoSimple(valor(['especialidad'])),
      dni_docente: normalizarTextoSimple(valor(['dni_docente', 'dni', 'documento'])),
      fecha_ingreso: this.normalizarFecha(valor(['fecha_ingreso', 'fecha ingreso', 'fecha'])),
      escuela_profesional: normalizarTextoSimple(valor(['escuela_profesional', 'escuela'])),
      horas_maximas_semanales: parseInt(String(valor(['horas_maximas_semanales', 'horas'])) || '0', 10) || undefined,
      id_facultad: facultad?.id_facultad ? String(facultad.id_facultad) : '',
      id_departamento: departamento?.id_departamento ? String(departamento.id_departamento) : ''
    });

    return { fila, datos: payload };
  }

  private static normalizarClave(valor: string) {
    return String(valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  private static normalizarModalidad(valor: any) {
    const normalizado = this.normalizarClave(String(valor || ''));
    if (normalizado.includes('extraordinario')) return 'extraordinario';
    if (normalizado.includes('contrat')) return 'contratado';
    if (normalizado.includes('ordinario') || normalizado.includes('nombrado')) return 'nombrado';
    return 'nombrado';
  }

  private static normalizarCategoria(valor: any) {
    const normalizado = this.normalizarClave(String(valor || ''));
    if (normalizado.includes('principal')) return 'principal';
    if (normalizado.includes('asociado')) return 'asociado';
    if (normalizado.includes('auxiliar')) return 'auxiliar';
    return '';
  }

  private static normalizarTipoContrato(valor: any) {
    const normalizado = this.normalizarClave(String(valor || ''));
    if (normalizado.includes('jefepractica')) return 'jefe_practica';
    if (normalizado.includes('a1')) return 'tipo_a1';
    if (normalizado.includes('b1')) return 'tipo_b1';
    if (normalizado.includes('a2')) return 'tipo_a2';
    if (normalizado.includes('b2')) return 'tipo_b2';
    if (normalizado.includes('a3')) return 'tipo_a3';
    if (normalizado.includes('b3')) return 'tipo_b3';
    return '';
  }

  private static normalizarTipoExtraordinario(valor: any) {
    const normalizado = this.normalizarClave(String(valor || ''));
    if (normalizado.includes('cesante')) return 'cesante';
    if (normalizado.includes('experto')) return 'experto';
    if (normalizado.includes('emerito')) return 'emerito';
    if (normalizado.includes('invitado')) return 'invitado_especial';
    return '';
  }

  private static normalizarDedicacion(valor: any) {
    const normalizado = this.normalizarClave(String(valor || ''));
    if (!normalizado) return '';
    if (normalizado === 'de' || normalizado.includes('dedicacionexclusiva')) return 'dedicacion_exclusiva';
    if (normalizado === 'tc' || normalizado.includes('tiempocompleto')) return 'tiempo_completo';
    if (normalizado.includes('docenteinvestigador') || normalizado === 'di') return 'docente_investigador';
    if (normalizado.includes('16')) return 'tiempo_parcial_16';
    if (normalizado.includes('12')) return 'tiempo_parcial_12';
    if (normalizado.includes('10')) return 'tiempo_parcial_10';
    if (normalizado.includes('08') || normalizado.includes('8h')) return 'tiempo_parcial_08';
    if (normalizado.includes('04') || normalizado.includes('4h')) return 'tiempo_parcial_04';
    if (normalizado.includes('20')) return 'tiempo_parcial_20';
    return '';
  }

  private static normalizarFecha(valor: any) {
    if (!valor) return '';
    if (valor instanceof Date) {
      return valor.toISOString().slice(0, 10);
    }

    const texto = String(valor).trim();
    if (!texto) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
      const [dia, mes, anio] = texto.split('/');
      return `${anio}-${mes}-${dia}`;
    }

    const fecha = new Date(texto);
    if (!Number.isNaN(fecha.getTime())) {
      return fecha.toISOString().slice(0, 10);
    }

    return '';
  }

  private static resolverFacultad(
    valor: any,
    catalogos: Awaited<ReturnType<typeof this.cargarCatalogos>>
  ) {
    const texto = String(valor || '').trim();
    if (!texto) return null;

    return (
      catalogos.facultades.find((facultad) => String(facultad.id_facultad) === texto) ||
      catalogos.facultades.find(
        (facultad) => this.normalizarClave(facultad.nombre) === this.normalizarClave(texto)
      ) ||
      null
    );
  }

  private static resolverDepartamento(
    valor: any,
    idFacultad: number | undefined,
    catalogos: Awaited<ReturnType<typeof this.cargarCatalogos>>
  ) {
    const texto = String(valor || '').trim();
    if (!texto) return null;

    const candidatos = idFacultad
      ? catalogos.departamentos.filter((departamento) => departamento.id_facultad === idFacultad)
      : catalogos.departamentos;

    return (
      candidatos.find((departamento) => String(departamento.id_departamento) === texto) ||
      candidatos.find(
        (departamento) => this.normalizarClave(departamento.nombre) === this.normalizarClave(texto)
      ) ||
      null
    );
  }

  private static detectarDuplicadosInternos(candidatos: Array<{ fila: number; datos: any }>) {
    const duplicados = {
      codigo: new Set<string>(),
      correo: new Set<string>(),
      dni: new Set<string>()
    };

    const contar = (selector: (candidato: { fila: number; datos: any }) => string) => {
      const mapa = new Map<string, number>();
      candidatos.forEach((candidato) => {
        const valor = selector(candidato);
        if (!valor) return;
        mapa.set(valor, (mapa.get(valor) || 0) + 1);
      });
      return mapa;
    };

    const codigos = contar((candidato) => candidato.datos.codigo_docente);
    const correos = contar((candidato) => candidato.datos.correo_electronico);
    const dnis = contar((candidato) => candidato.datos.dni_docente);

    codigos.forEach((cantidad, valor) => {
      if (cantidad > 1) duplicados.codigo.add(valor);
    });
    correos.forEach((cantidad, valor) => {
      if (cantidad > 1) duplicados.correo.add(valor);
    });
    dnis.forEach((cantidad, valor) => {
      if (cantidad > 1) duplicados.dni.add(valor);
    });

    return duplicados;
  }

  private static construirErroresDuplicados(
    candidato: { fila: number; datos: any },
    duplicados: ReturnType<typeof this.detectarDuplicadosInternos>
  ) {
    const errores: Record<string, string> = {};

    if (candidato.datos.codigo_docente && duplicados.codigo.has(candidato.datos.codigo_docente)) {
      errores.codigo_docente = 'El código de docente está duplicado dentro del archivo.';
    }
    if (candidato.datos.correo_electronico && duplicados.correo.has(candidato.datos.correo_electronico)) {
      errores.correo_electronico = 'El correo electrónico está duplicado dentro del archivo.';
    }
    if (candidato.datos.dni_docente && duplicados.dni.has(candidato.datos.dni_docente)) {
      errores.dni_docente = 'El documento está duplicado dentro del archivo.';
    }

    return errores;
  }
}

export class ImportadorCursos {
  static async importarDesdeExcel(archivoBuffer: Buffer): Promise<{
    exitosos: number;
    errores: any[];
  }> {
    const workbook = XLSX.read(archivoBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const datos = XLSX.utils.sheet_to_json(worksheet);

    const exitosos: number[] = [];
    const errores: any[] = [];

    for (let i = 0; i < datos.length; i++) {
      const fila: any = datos[i];
      
      try {
        await prisma.curso.create({
          data: {
            codigo: String(fila.codigo || fila.Codigo),
            nombre: String(fila.nombre || fila.Nombre),
            horas_teoria: parseInt(fila.teoria || fila.Teoria || '0'),
            horas_laboratorio: parseInt(fila.laboratorio || fila.Laboratorio || '0'),
            horas_practica: parseInt(fila.practica || fila.Practica || '0'),
            creditos: parseInt(fila.creditos || fila.Creditos || '3'),
            ciclo: parseInt(fila.ciclo || fila.Ciclo || '1')
          }
        });
        
        exitosos.push(i + 1);
      } catch (error: any) {
        errores.push({
          fila: i + 1,
          error: error.message,
          datos: fila
        });
      }
    }

    return {
      exitosos: exitosos.length,
      errores
    };
  }
}
