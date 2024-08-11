document.addEventListener('DOMContentLoaded', () => {
  const nombreInput = document.getElementById('nombre');
  const apellidoInput = document.getElementById('apellido');
  const submitUserInfoButton = document.getElementById('submit-user-info');
  const mensajeBienvenidaDiv = document.getElementById('mensaje-bienvenida');

  if (document.getElementById('user-info')) {
    submitUserInfoButton.addEventListener('click', () => {
      console.log('Botón de inicio clickeado'); // Agregado para depuración

      const nombre = nombreInput.value.trim().toUpperCase();
      const apellido = apellidoInput.value.trim().toUpperCase();

      if (nombre && apellido) {
        localStorage.setItem('nombre', nombre);
        localStorage.setItem('apellido', apellido);

        mensajeBienvenidaDiv.textContent = `¡Hola ${nombre}! Bienvenido a la tienda Yonkys`;
        mensajeBienvenidaDiv.classList.remove('d-none');

        setTimeout(() => {
          window.location.href = 'pages/carrito.html'; // Verifica la ruta
        }, 2000); // Espera 2 segundos antes de redirigir

      } else {
        mostrarMensaje('Por favor, ingrese su nombre y apellido.', 'error');
      }
    });
  } else {
    fetch('productos.json')
      .then(response => response.json())
      .then(productos => {
        const productosDiv = document.getElementById('productos');
        const listaProductosDiv = document.getElementById('lista-productos');
        const detalleCompraDiv = document.getElementById('detalle-compra');
        const detalleProductosDiv = document.getElementById('detalle-productos');
        const totalCompraDiv = document.getElementById('total-compra');
        const finalizarCompraButton = document.getElementById('finalizar-compra');

        let productosSeleccionados = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];

        const actualizarDetalleCompra = () => {
          const totalCantidadProductos = productosSeleccionados.reduce((total, { cantidad }) => total + cantidad, 0);
          const totalProductosSinDescuento = productosSeleccionados.reduce((total, { totalSinDescuento }) => total + totalSinDescuento, 0);
          const descuentoAplicado = totalCantidadProductos >= 3;
          
          const totalConDescuento = descuentoAplicado
            ? aplicarDescuento(totalProductosSinDescuento, 10)
            : totalProductosSinDescuento;

          detalleProductosDiv.innerHTML = productosSeleccionados.map(({ producto, cantidad, totalSinDescuento }, index) => `
            Producto ${index + 1}: ${producto} - Cantidad: ${cantidad} - Total: ${totalSinDescuento} pesos argentinos
            <button class="btn btn-danger btn-sm" data-index="${index}">Eliminar</button>
          `).join('');

          totalCompraDiv.innerHTML = `
            Total de Productos Seleccionados: ${totalCantidadProductos}<br>
            Total Sin Descuento: ${totalProductosSinDescuento} pesos argentinos<br>
            Total a Pagar${descuentoAplicado ? ' (Se aplicó un descuento del 10%)' : ''}: ${totalConDescuento} pesos argentinos
          `;
        };

        const mostrarOpcionesProductos = () => {
          listaProductosDiv.innerHTML = productos.map(({ nombre, precio, imagen }, index) => `
            <div class="card product-card" style="width: 16rem;">
              <img src="${imagen}" class="card-img-top" alt="${nombre}">
              <div class="card-body">
                <h5 class="card-title">${nombre}</h5>
                <p class="card-text">Precio: ${precio}$</p>
                <input type="number" min="1" class="form-control mb-2" placeholder="Cantidad" id="cantidad-${index}">
                <button class="btn btn-primary" data-index="${index}">Agregar al carrito</button>
              </div>
            </div>
          `).join('');

          listaProductosDiv.querySelectorAll('.btn-primary').forEach(button => {
            button.addEventListener('click', () => {
              const index = button.getAttribute('data-index');
              const cantidadInput = document.getElementById(`cantidad-${index}`);
              const cantidad = parseInt(cantidadInput.value);

              if (!isNaN(cantidad) && cantidad > 0) {
                seleccionarProducto(productos[index], cantidad);
                cantidadInput.value = ''; // Limpiar el input después de agregar el producto
              } else {
                mostrarMensaje('Error: La cantidad ingresada no es válida.', 'error');
              }
            });
          });
        };

        const seleccionarProducto = (producto, cantidad) => {
          const totalSinDescuento = calcularTotal(producto, cantidad);
          productosSeleccionados.push({ producto: producto.nombre, cantidad, totalSinDescuento });

          localStorage.setItem('productosSeleccionados', JSON.stringify(productosSeleccionados));
          actualizarDetalleCompra();
        };

        const calcularTotal = (producto, cantidad) => producto.precio * cantidad;

        const aplicarDescuento = (total, porcentajeDescuento) => total * (1 - porcentajeDescuento / 100);

        const eliminarProducto = (index) => {
          productosSeleccionados.splice(index, 1);
          localStorage.setItem('productosSeleccionados', JSON.stringify(productosSeleccionados));
          actualizarDetalleCompra();
        };

        detalleProductosDiv.addEventListener('click', (event) => {
          if (event.target.classList.contains('btn-danger')) {
            eliminarProducto(event.target.getAttribute('data-index'));
          }
        });

        finalizarCompraButton.addEventListener('click', () => {
          const totalConDescuento = productosSeleccionados.reduce((total, { cantidad, totalSinDescuento }) => total + (totalSinDescuento * (1 - (productosSeleccionados.reduce((total, { cantidad }) => total + cantidad, 0) >= 3 ? 0.1 : 0))), 0);

          mostrarMensaje(`Compra finalizada. Total a pagar: ${totalConDescuento} pesos argentinos.`, 'success');
          localStorage.removeItem('productosSeleccionados');
          productosSeleccionados = [];
          actualizarDetalleCompra();
        });

        mostrarOpcionesProductos();
        actualizarDetalleCompra();
      })
      .catch(error => console.error('Error al cargar los productos:', error));
  }

  const mostrarMensaje = (mensaje, tipo) => {
    Swal.fire({
      title: tipo === 'error' ? 'Error' : 'Éxito',
      text: mensaje,
      icon: tipo === 'error' ? 'error' : 'success',
      confirmButtonText: 'OK'
    });
  };
});
