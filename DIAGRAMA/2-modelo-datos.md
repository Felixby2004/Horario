# Diagrama de Modelo de Datos (ERD)

```mermaid
erDiagram
    Facultad ||--o{ DepartamentoAcademico : tiene
    DepartamentoAcademico ||--o{ Docente : pertenece_a
    DepartamentoAcademico ||--o{ Curso : imparte
    DepartamentoAcademico ||--o{ PlanEstudio : gestiona

    Usuario ||--o{ Docente : es
    Usuario ||--o{ HorarioAsignado : crea
    Usuario ||--o{ CargaAcademica : aprueba

    PlanEstudio ||--o{ HistorialVersionPlanEstudio : tiene

    PeriodoAcademico ||--o{ Grupo : contiene
    PeriodoAcademico ||--o{ HorarioAsignado : tiene
    PeriodoAcademico ||--o{ DisponibilidadDocente : registra
    PeriodoAcademico ||--o{ VentanaAtencion : organiza
    PeriodoAcademico ||--o{ CargaAcademica : tiene

    Docente ||--o{ DocenteCurso : imparte
    Docente ||--o{ DocenteGrupo : asignado_a
    Docente ||--o{ HorarioAsignado : dicta
    Docente ||--o{ DisponibilidadDocente : registra
    Docente ||--o{ CargaAcademica : tiene

    Curso ||--o{ DocenteCurso : tiene
    Curso ||--o{ Grupo : tiene
    Curso ||--o{ HorarioAsignado : se_dicta
    Curso ||--o{ CursoPrerequisito : tiene_prerrequisitos

    Grupo ||--o{ DocenteGrupo : tiene
    Grupo ||--o{ HorarioAsignado : se_dicta_en

    Ambiente ||--o{ CursoAmbiente : compatible_con
    Ambiente ||--o{ HorarioAsignado : utilizado_en

    CargaAcademica ||--o{ ActividadNoLectiva : incluye
    CargaAcademica ||--o{ HistorialCargaAcademica : registra

    VentanaAtencion ||--o{ CitacionDocente : genera

    Facultad {
        int id_facultad PK
        string codigo
        string nombre
    }

    DepartamentoAcademico {
        int id_departamento PK
        int id_facultad FK
        string codigo
        string nombre
    }

    Usuario {
        int id_usuario PK
        string codigo
        string nombres
        string apellidos
        string correo_electronico
        enum TipoRol rol
    }

    Docente {
        int id_docente PK
        int id_usuario FK
        int id_departamento FK
        string codigo_docente
        string dni_docente
        string nombres
        string apellidos
        enum TipoModalidad modalidad
        enum TipoCategoria categoria
        enum TipoDedicacionLaboral tipo_dedicacion_laboral
        int horas_maximas_semanales
    }

    Curso {
        int id_curso PK
        int id_departamento FK
        string codigo
        string nombre
        int horas_teoria
        int horas_laboratorio
        int horas_practica
        int creditos
    }

    Grupo {
        int id_grupo PK
        int id_curso FK
        int id_periodo FK
        string codigo_grupo
        int capacidad_maxima
    }

    PeriodoAcademico {
        int id_periodo PK
        string codigo
        string nombre
        int anio
        int semestre
        date fecha_inicio
        date fecha_fin
        enum EstadoPeriodo estado
    }

    Ambiente {
        int id_ambiente PK
        string codigo
        string nombre
        enum TipoAmbiente tipo
        int capacidad
    }

    HorarioAsignado {
        int id_asignacion PK
        int id_docente FK
        int id_curso FK
        int id_grupo FK
        int id_ambiente FK
        int id_periodo FK
        enum TipoClase tipo_clase
        int dia_semana
        string hora_inicio
        string hora_fin
        enum EstadoHorario estado
    }

    CargaAcademica {
        int id_carga PK
        int id_docente FK
        int id_periodo FK
        enum EstadoCargaAcademica estado
        int horas_lectivas
        int horas_no_lectivas
        int horas_preparacion
        int horas_totales
        int horas_meta
    }

    ActividadNoLectiva {
        int id_actividad PK
        int id_carga FK
        enum TipoActividadNoLectiva tipo_actividad
        string nombre
        int horas_semanales
    }
```
