import { supabase } from '../neosapp/src/context/supabaseClient.js';

async function run() {
  try {
    console.log('Iniciando prueba de creación de cliente y pedido...');

    const timestamp = Date.now();
    const email = `test_cliente_${timestamp}@example.com`;
    const password = 'Test1234!';
    const nombre = `Cliente Prueba ${timestamp}`;
    const cedula = `T${timestamp}`;
    const direccion = 'Calle Falsa 123';
    const telefono = '3000000000';

    // 1) signUp (Auth)
    console.log('1) Registrando en Auth...');
    const { data: signData, error: signError } = await supabase.auth.signUp({ email, password });
    if (signError) {
      console.error('Error en signUp:', signError);
      return process.exitCode = 2;
    }
    console.log('signUp OK, user id:', signData?.user?.id);

    const userId = signData.user?.id;
    if (!userId) {
      console.error('No se obtuvo user.id tras signUp');
      return process.exitCode = 3;
    }

    // 2) Insertar en tabla usuarios
    console.log('2) Insertando fila en tabla usuarios...');
    const { data: usuarioRow, error: usuarioError } = await supabase
      .from('usuarios')
      .insert([{ id: userId, nombre, cedula, email, rol: 'cliente' }])
      .select()
      .single();

    if (usuarioError) {
      console.error('Error insertando usuarios:', usuarioError);
      return process.exitCode = 4;
    }
    console.log('usuarios insertado:', usuarioRow);

    // 3) Insertar en tabla clientes
    console.log('3) Insertando fila en tabla clientes...');
    const { data: clienteRow, error: clienteError } = await supabase
      .from('clientes')
      .insert([{ usuario_id: userId, nombre, cedula, direccion, telefono, correo: email }])
      .select()
      .single();

    if (clienteError) {
      console.error('Error insertando clientes:', clienteError);
      return process.exitCode = 5;
    }
    console.log('cliente insertado:', clienteRow);

    // 4) Crear un pedido
    console.log('4) Creando pedido...');
    const carrito = [
      { id: 1, cantidad: 1, precio: 10000 },
    ];

    const pedidoData = {
      cliente_id: clienteRow.id,
      forma_pago: 'Efectivo',
      estado: 'Pendiente',
      total: carrito.reduce((s, i) => s + (i.precio * (i.cantidad || 1)), 0),
    };

    const { data: pedidoRow, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([pedidoData])
      .select()
      .single();

    if (pedidoError) {
      console.error('Error creando pedido:', pedidoError);
      return process.exitCode = 6;
    }
    console.log('pedido creado:', pedidoRow);

    // 5) Insertar detalles
    console.log('5) Insertando detalles en pedido_detalle...');
    const detalles = carrito.map((item) => ({ pedido_id: pedidoRow.id, producto_id: item.id, cantidad: item.cantidad, precio: item.precio }));
    const { data: detalleRows, error: detalleError } = await supabase
      .from('pedido_detalle')
      .insert(detalles);

    if (detalleError) {
      console.error('Error insertando pedido_detalle:', detalleError);
      return process.exitCode = 7;
    }
    console.log('detalles insertados:', detalleRows);

    console.log('Prueba completada con éxito.');
    process.exitCode = 0;
  } catch (err) {
    console.error('Error inesperado en el script:', err);
    process.exitCode = 99;
  }
}

run();
