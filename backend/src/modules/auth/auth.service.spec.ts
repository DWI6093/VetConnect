import * as bcrypt from 'bcrypt';

jest.mock('../../database/prisma.service', () => ({
  PrismaService: class PrismaServiceMock {},
}));

import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogService } from '../../util/log-audit.service';
import { ErrorLogService } from '../../util/log-error.service';
import { CrearClienteDto } from '../usuarios/dto/crear-cliente.dto';

describe('AuthService - registrarCliente (hasheo de contraseña)', () => {
  let authService: AuthService;
  let prismaMock: any;

  beforeAll(() => {
    process.env.JWT_SECRET = 'clave_prueba_jwt';
    process.env.REFRESH_SECRET = 'clave_prueba_refresh';
  });

  beforeEach(() => {
    prismaMock = {
      usuario: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id_usuario: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          correo: 'juan@example.com',
          rol: 'CLIENTE',
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      aceptacion_terminos: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const auditLogMock = { logAudit: jest.fn() } as unknown as AuditLogService;
    const errorLogMock = { logError: jest.fn() } as unknown as ErrorLogService;

    authService = new AuthService(
      prismaMock as unknown as PrismaService,
      auditLogMock,
      errorLogMock,
    );
  });

  it('debe guardar la contraseña hasheada, nunca en texto plano', async () => {
    const passwordPlano = 'MiPassword123';
    const dto: CrearClienteDto = {
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@example.com',
      password: passwordPlano,
      aceptoAviso: true,
    };

    await authService.registrarCliente(dto, '127.0.0.1');

    // Capturamos el objeto "data" con el que se llamó a usuario.create
    const dataCreada = prismaMock.usuario.create.mock.calls[0][0].data;

    // 1. El hash guardado nunca debe ser igual al password en texto plano
    expect(dataCreada.password_hash).toBeDefined();
    expect(dataCreada.password_hash).not.toBe(passwordPlano);

    // 2. Debe tener forma de hash bcrypt (empieza con $2a$, $2b$ o $2y$)
    expect(dataCreada.password_hash).toMatch(/^\$2[aby]\$/);

    // 3. El hash debe corresponder realmente al password original
    const coincide = await bcrypt.compare(
      passwordPlano,
      dataCreada.password_hash,
    );
    expect(coincide).toBe(true);
  });
});