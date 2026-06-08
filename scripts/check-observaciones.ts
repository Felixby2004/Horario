
import { PrismaClient } from '../generated/prisma-client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking carga academica with observaciones_generales');
    const cargas = await prisma.cargaAcademica.findMany({
        take: 5,
        include: {
            docente: true
        }
    });

    for (const carga of cargas) {
        console.log(`Carga ID: ${carga.id_carga} (Docente: ${carga.id_docente})`);
        console.log('Estado:', carga.estado);
        console.log('Observaciones generales:', carga.observaciones_generales);
        console.log('---');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
