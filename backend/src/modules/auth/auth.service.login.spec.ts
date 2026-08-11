import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('../../database/prisma.service', () => ({
  PrismaService: class PrismaServiceMock {},
}));

import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogService } from '../../util/log-audit.service';
import { ErrorLogService } from '../../util/log-error.service';
import { InicioSesionDto } from '../usuarios/dto/inicio-sesion.dto';

describe('AuthService - iniciarSesion (login con credenciales inválidas)', () => {
  let authService: AuthService;
  let prismaMock: any;
  const reqMock: any = {}; // no se usa cuando el login falla

  beforeAll(() => {
    process.env.JWT_SECRET = 'clave_prueba_jwt';
    process.env.REFRESH_SECRET = 'clave_prueba_refresh';
  });

  beforeEach(() => {
    prismaMock = {
      usuario: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
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

  it('A) debe fallar si el correo no existe', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(null);

    const dto: InicioSesionDto = {
      correo: 'noexiste@example.com',
      password: 'cualquierpassword',
    };

    await expect(authService.iniciarSesion(reqMock, dto)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(prismaMock.usuario.update).not.toHaveBeenCalled();
  });

  it('B) debe fallar si el usuario está BLOQUEADO', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue({
      id_usuario: 1,
      correo: 'bloqueado@example.com',
      estado: 'BLOQUEADO',
      password_hash: 'hash_irrelevante',
    });

    const dto: InicioSesionDto = {
      correo: 'bloqueado@example.com',
      password: 'cualquierpassword',
    };

    await expect(authService.iniciarSesion(reqMock, dto)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(prismaMock.usuario.update).not.toHaveBeenCalled();
  });

  it('C) debe fallar si el password es incorrecto', async () => {
    const passwordReal = 'PasswordCorrecto123';
    const hashReal = await bcrypt.hash(passwordReal, 10);

    prismaMock.usuario.findUnique.mockResolvedValue({
      id_usuario: 1,
      correo: 'activo@example.com',
      estado: 'ACTIVO',
      password_hash: hashReal,
      rol: 'CLIENTE',
      nombre: 'Juan',
      apellido: 'Pérez',
    });

    const dto: InicioSesionDto = {
      correo: 'activo@example.com',
      password: 'PasswordIncorrecto999',
    };

    await expect(authService.iniciarSesion(reqMock, dto)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(prismaMock.usuario.update).not.toHaveBeenCalled();
  });
});
