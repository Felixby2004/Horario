
import { PrismaClient } from '../generated/prisma-client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking historial for carga 9');
    const historial = await prisma.historialCargaAcademica.findMany({
        where: { id_carga: 9 },
        orderBy: { fecha_creacion: 'desc' },
        include: { usuario: true }
    });

    for (const entry of historial) {
        console.log(`Historial ID: ${entry.id_historial}`);
        console.log('Estado anterior:', entry.estado_anterior);
        console.log('Estado nuevo:', entry.estado_nuevo);
        console.log('Observaciones:', entry.observaciones);
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
