import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrearClienteDto } from './crear-cliente.dto';

describe('CrearClienteDto', () => {
  const datosValidos = {
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan@example.com',
    password: '123456',
    aceptoAviso: true,
  };

  it('no debe arrojar errores cuando todos los campos son válidos', async () => {
    const dto = plainToInstance(CrearClienteDto, datosValidos);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
  });

  it('debe fallar si falta el nombre', async () => {
    const { nombre, ...datosSinNombre } = datosValidos;
    const dto = plainToInstance(CrearClienteDto, datosSinNombre);
    const errores = await validate(dto);

    const errorNombre = errores.find((e) => e.property === 'nombre');
    expect(errorNombre).toBeDefined();
    expect(errorNombre?.constraints).toHaveProperty('isNotEmpty');
  });

  it('debe fallar si falta el correo', async () => {
    const { correo, ...datosSinCorreo } = datosValidos;
    const dto = plainToInstance(CrearClienteDto, datosSinCorreo);
    const errores = await validate(dto);

    const errorCorreo = errores.find((e) => e.property === 'correo');
    expect(errorCorreo).toBeDefined();
    expect(errorCorreo?.constraints).toHaveProperty('isNotEmpty');
  });

  it('debe fallar si falta el password', async () => {
    const { password, ...datosSinPassword } = datosValidos;
    const dto = plainToInstance(CrearClienteDto, datosSinPassword);
    const errores = await validate(dto);

    const errorPassword = errores.find((e) => e.property === 'password');
    expect(errorPassword).toBeDefined();
    expect(errorPassword?.constraints).toHaveProperty('isNotEmpty');
  });
});