const {
  construirTextoPrerequisitos,
  evaluarCumplimientoPrerequisitos,
  validarMultiplesPrerequisitos
} = require('@/lib/cursos');

describe('Lógica de múltiples prerrequisitos', () => {
  it('construye el texto derivado de varios prerrequisitos', () => {
    const texto = construirTextoPrerequisitos([
      { id_curso: 2, codigo: 'MAT101', nombre: 'Matemática' },
      { id_curso: 3, codigo: 'CS100', nombre: 'Introducción a la programación' }
    ]);

    expect(texto).toBe('MAT101 - Matemática, CS100 - Introducción a la programación');
  });

  it('rechaza prerrequisitos repetidos o el mismo curso', () => {
    const repetidos = validarMultiplesPrerequisitos({
      idCursoActual: 10,
      prerequisitoIds: [2, 2],
      cursosDisponibles: [
        { id_curso: 2, codigo: 'MAT101', nombre: 'Matemática', activo: true }
      ]
    });

    const mismoCurso = validarMultiplesPrerequisitos({
      idCursoActual: 10,
      prerequisitoIds: [10],
      cursosDisponibles: [
        { id_curso: 10, codigo: 'CS200', nombre: 'Estructuras de datos', activo: true }
      ]
    });

    expect(repetidos.valido).toBe(false);
    expect(repetidos.error).toMatch(/repetir/i);
    expect(mismoCurso.valido).toBe(false);
    expect(mismoCurso.error).toMatch(/sí mismo|mismo/i);
  });

  it('verifica si un estudiante cumple todos los prerrequisitos', () => {
    const cumple = evaluarCumplimientoPrerequisitos({
      prerequisitoIds: [2, 3, 4],
      cursosAprobadosIds: [1, 2, 3, 4, 8]
    });

    const noCumple = evaluarCumplimientoPrerequisitos({
      prerequisitoIds: [2, 3, 4],
      cursosAprobadosIds: [2]
    });

    expect(cumple.cumple).toBe(true);
    expect(cumple.faltantes).toEqual([]);
    expect(noCumple.cumple).toBe(false);
    expect(noCumple.faltantes).toEqual([3, 4]);
  });
});
