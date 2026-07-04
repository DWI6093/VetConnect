# BOLA — Broken Object Level Authorization

## ¿Qué es BOLA?

BOLA (Broken Object Level Authorization) es la vulnerabilidad **más común en APIs REST**, clasificada como **#1 en el OWASP API Security Top 10**. Ocurre cuando un endpoint expone o modifica un recurso identificado por un parámetro (ej. `:id`) sin verificar que el usuario autenticado tenga permisos sobre **ese recurso específico**.

### Ejemplo clásico

```
GET /api/v1/usuarios/105  ← El usuario autenticado es el 105
GET /api/v1/usuarios/106  ← Cambio manual del ID → Si devuelve datos, hay BOLA
```

Si el backend **solo verifica que el usuario está autenticado** (ej. el JWT es válido), pero **no verifica que el usuario 105 sea el dueño del recurso 106**, cualquier usuario autenticado puede acceder a datos ajenos.

---

## Contexto en VetConnect

### Endpoint vulnerable

| Método | Endpoint | Archivo | Línea |
|--------|----------|---------|-------|
| `GET` | `/colaboradores/:id` | `backend/src/modules/usuarios/colaboradores.controller.ts` | 60 |

### Código actual (vulnerable)

```typescript
@Get(':id')
obtenerPorId(@Param('id', ParseIntPipe) id: number) {
  return this.colaboradoresService.obtenerPorId(id);
}
```

El método `obtenerPorId` en `ColaboradoresController` solo aplica los guards `GuardAutenticacion` y `RolesGuard` (verifica rol COLABORADOR), pero **nunca compara el `id_usuario` del token JWT con el `:id` de la ruta**. Cualquier colaborador autenticado puede leer los datos personales (nombre, apellido, correo, estado) de **cualquier otro colaborador**.

### Endpoints que SÍ están protegidos (contraste)

```typescript
@Patch(':id')
actualizar(@Param('id', ParseIntPipe) id: number, ..., @Req() req: Request) {
  this.validarPropietario(id, req);  // ← Protegido
  return this.colaboradoresService.actualizar(id, actualizarColaboradorDto);
}

@Delete(':id')
eliminar(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
  this.validarPropietario(id, req);  // ← Protegido
  return this.colaboradoresService.eliminar(id);
}
```

El método `validarPropietario` ya existe y funciona correctamente — solo falta aplicarlo en `obtenerPorId`.

---

## Cómo solucionarlo

### Opción 1: Validar propietario en el controlador (mínimo cambio, recomendada)

```typescript
@Get(':id')
obtenerPorId(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
  this.validarPropietario(id, req);
  return this.colaboradoresService.obtenerPorId(id);
}
```

### Opción 2: Validar en el servicio (más robusta, desacoplada)

Pasar el `id_usuario` del token al servicio y validar dentro:

```typescript
// En colaboradores.service.ts
async obtenerPorId(idSolicitado: number, idPropietario: number) {
  if (idSolicitado !== idPropietario) {
    throw new ForbiddenException('No tienes permiso para ver este recurso.');
  }
  // ... lógica existente
}
```

### Opción 3: Decorador personalizado (reutilizable)

Crear un decorador `@Propietario()` que extraiga el `id_usuario` del request y lo compare automáticamente con el parámetro de ruta — útil si el patrón se repite en varios controladores.

---

## Verificación de la corrección

### Prueba manual

```bash
# 1. Obtener token de Colaborador A (id=1)
# 2. Intentar acceder al perfil de Colaborador B (id=2)
curl -X GET http://localhost:3000/colaboradores/2 \
  -H "Cookie: jwt_token=<token_de_A>"

# Debe responder: 403 Forbidden
# Antes respondía: 200 OK con datos de B
```

### Prueba automatizada (e2e)

```typescript
it('no debe permitir a un colaborador ver datos de otro colaborador', async () => {
  const tokenA = await obtenerTokenColaborador(1);
  const { status } = await request(app)
    .get('/colaboradores/2')
    .set('Cookie', `jwt_token=${tokenA}`);
  expect(status).toBe(403);
});
```

---

## Referencias

- [OWASP API Security Top 10 — BOLA #1](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- [OWASP Top 10 — Broken Access Control #1](https://owasp.org/www-project-top-ten/)
- [CWE-639: Authorization Bypass Through User-Controlled Key](https://cwe.mitre.org/data/definitions/639.html)
