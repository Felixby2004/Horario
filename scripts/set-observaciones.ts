
import { PrismaClient } from '../generated/prisma-client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Setting observaciones_generales for carga ID 9');
    const updated = await prisma.cargaAcademica.update({
        where: { id_carga: 9 },
        data: {
            observaciones_generales: "Por favor, agregar más detalles en la sección de actividades no lectivas"
        }
    });
    console.log('✅ Updated carga:', updated.id_carga);
    console.log('✅ Observaciones:', updated.observaciones_generales);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
