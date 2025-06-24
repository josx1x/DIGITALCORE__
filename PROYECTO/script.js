let carrito = [];

// Recuperar carrito del localStorage si ya existe
if (localStorage.getItem("carrito")) {
  carrito = JSON.parse(localStorage.getItem("carrito"));
}

// Función para cerrar el modal
function cerrarModal() {
  document.getElementById("modalCarrito").classList.remove("mostrar");
}

document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll(".btn-agregar");

  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      const producto = btn.closest(".producto") || btn.closest(".detalle-producto");

      const nombre = btn.dataset.nombre || producto.querySelector("h2, h3").textContent;
      const precio = btn.dataset.precio
        ? parseFloat(btn.dataset.precio)
        : parseFloat(producto.querySelector("strong, .precio-descuento").textContent.replace(/[^\d.]/g, ""));
      const imgSrc = producto.querySelector("img")?.src || "";
      const cantidadInput = producto.querySelector("input[type='number']");
      const cantidad = cantidadInput ? parseInt(cantidadInput.value) : 1;

      const nuevoProducto = {
        nombre,
        precio,
        cantidad,
        imagen: imgSrc
      };

      const existente = carrito.find(item => item.nombre === nombre);
      if (existente) {
        existente.cantidad += cantidad;
      } else {
        carrito.push(nuevoProducto);
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));

      document.getElementById("modal-nombre").textContent = nombre;
      document.getElementById("modal-precio").textContent = `Precio unitario: S/ ${precio.toFixed(2)}`;
      document.getElementById("modal-img").src = imgSrc;
      document.getElementById("modal-cantidad-texto").textContent = `Cantidad: ${cantidad}`;

      const totalFinal = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
      const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

      document.getElementById("modal-total").textContent = `S/ ${totalFinal.toFixed(2)}`;
      document.getElementById("modal-items").textContent = `${totalItems} artículo${totalItems > 1 ? 's' : ''}`;

      const modal = document.getElementById("modalCarrito");
      modal.classList.add("mostrar");
    });
  });
});

function cerrarBanner() {
  const banner = document.getElementById("banner-descuento");
  if (banner) {
    banner.classList.add("oculto");
  }
}

let indiceSlide = 0;
function mostrarSlide(n) {
  const slides = document.querySelectorAll(".slide");
  const puntos = document.querySelectorAll(".punto");

  if (n >= slides.length) indiceSlide = 0;
  if (n < 0) indiceSlide = slides.length - 1;

  slides.forEach((slide, i) => {
    slide.classList.toggle("activo", i === indiceSlide);
  });
  puntos.forEach((punto, i) => {
    punto.classList.toggle("activo", i === indiceSlide);
  });
}
function cambiarSlide(n) {
  mostrarSlide(indiceSlide += n);
}
function irASlide(n) {
  indiceSlide = n;
  mostrarSlide(indiceSlide);
}
document.addEventListener("DOMContentLoaded", () => {
  mostrarSlide(indiceSlide);
  setInterval(() => cambiarSlide(1), 10000);
});

class Producto {
  constructor(nombre, precio, imagen, cantidad) {
    this.nombre = nombre;
    this.precio = precio;
    this.imagen = imagen;
    this.cantidad = cantidad;
  }
  subtotal() {
    return this.precio * this.cantidad;
  }
}
Producto.prototype.descripcion = function () {
  return `${this.nombre} x${this.cantidad} = S/ ${this.subtotal().toFixed(2)}`;
};

class ProductoDescuento extends Producto {
  constructor(nombre, precio, imagen, cantidad, descuento) {
    super(nombre, precio, imagen, cantidad);
    this.descuento = descuento;
  }
  subtotal() {
    const total = super.subtotal();
    return total - (total * this.descuento);
  }
}

const productoEjemplo = new ProductoDescuento("Mouse Gamer", 100, "img/mouse.jpg", 2, 0.2);
console.log(productoEjemplo.descripcion());

function cuentaRegresiva(n) {
  if (n <= 0) {
    console.log("¡La promoción ha terminado!");
    return;
  }
  console.log(`Faltan ${n} segundos...`);
  setTimeout(() => cuentaRegresiva(n - 1), 1000);
}

function calcularTotal(precio, cantidad) {
  return precio * cantidad;
}

const totalPrueba = calcularTotal(45, 3);
console.log("Total prueba:", totalPrueba);

const resumenCarrito = new Map();
carrito.forEach(producto => {
  resumenCarrito.set(producto.nombre, producto.cantidad);
});
resumenCarrito.forEach((cantidad, nombre) => {
  console.log(`🛒 ${nombre}: ${cantidad}`);
});

document.getElementById("finalizar-compra").addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const resumenDiv = document.getElementById("resumen-factura");
  const botonesFactura = document.getElementById("botones-factura");
  resumenDiv.innerHTML = "<h2>Resumen de Factura</h2>";

  let contenido = "<table style='width:100%; border-collapse:collapse;'><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>";
  let total = 0;

  carrito.forEach(p => {
    const subtotal = p.precio * p.cantidad;
    total += subtotal;
    contenido += `
      <tr>
        <td>${p.nombre}</td>
        <td>S/ ${p.precio.toFixed(2)}</td>
        <td>${p.cantidad}</td>
        <td>S/ ${subtotal.toFixed(2)}</td>
      </tr>`;
  });

  contenido += `</tbody></table><p style="text-align:right; font-size:1.2rem;"><strong>Total: S/ ${total.toFixed(2)}</strong></p>`;
  resumenDiv.innerHTML += contenido;
  resumenDiv.classList.remove("oculto");
  botonesFactura.classList.remove("oculto");
});

// ✅ NUEVA FUNCIÓN CON LOGO Y DESCARGA CORRECTA
function descargarPDF() {
  const { jsPDF } = window.jspdf;
  const resumen = document.getElementById("resumen-factura");

  if (!resumen || resumen.innerText.trim() === "") {
    alert("El resumen está vacío. Asegúrate de haber finalizado la compra.");
    return;
  }

  const tabla = resumen.querySelector("table");
  if (!tabla) {
    alert("No se encontró la tabla en el resumen.");
    return;
  }

  // Calcular subtotal
  let subtotal = 0;
  const filas = tabla.querySelectorAll("tbody tr");
  filas.forEach(fila => {
    const celdas = fila.querySelectorAll("td");
    if (celdas.length > 0) {
      let valorTexto = celdas[celdas.length - 1].innerText.replace(/[^\d.,]/g, '');
      valorTexto = valorTexto.replace(',', '.');
      const valorNum = parseFloat(valorTexto);
      if (!isNaN(valorNum)) subtotal += valorNum;
    }
  });

  const pdf = new jsPDF('p', 'pt', 'letter');
  const pageWidth = pdf.internal.pageSize.getWidth();

  const logo = new Image();
  logo.src = '/img/logodigitalcore.png'; // Asegúrate de que exista

  logo.onload = () => generarPDF(pdf, pageWidth, tabla, subtotal, logo);
  logo.onerror = () => {
    console.warn("Logo no cargó. Se generará el PDF sin logo.");
    generarPDF(pdf, pageWidth, tabla, subtotal, null);
  };
}

function generarPDF(pdf, pageWidth, tabla, subtotal, logo) {
// Insertar logo más grande en esquina superior derecha
if (logo) {
  const logoWidth = 120;
  const logoHeight = 120;
  const marginRight = 50;
  const x = pageWidth - logoWidth - marginRight;
  const y = 20;
  pdf.addImage(logo, 'PNG', x, y, logoWidth, logoHeight);
}


  // Título y fecha
  pdf.setFontSize(18);
  pdf.text("Factura DigitalCore", pageWidth / 2, 50, { align: "center" });

  const fecha = new Date();
  const fechaFormateada = fecha.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  pdf.setFontSize(12);
  pdf.text(`Fecha: ${fechaFormateada}`, pageWidth / 2, 70, { align: "center" });

  const startY = 120;

  // Dibujar tabla con productos
  pdf.autoTable({
    html: tabla,
    startY: startY,
    margin: { left: 40, right: 40 },
    styles: { fontSize: 10, halign: 'center' },
    headStyles: { fillColor: '#5ec8f1', textColor: '#fff' },
    alternateRowStyles: { fillColor: '#f9f9f9' },
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.3,
  });

  const finalY = pdf.lastAutoTable.finalY + 20;

  // Subtotal
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Subtotal: S/ ${subtotal.toFixed(2)}`, pageWidth - 60, finalY, { align: "right" });

  // Pie de página decorado
  const yStartFooter = finalY + 60;

  pdf.setDrawColor(200);
  pdf.line(40, yStartFooter - 20, pageWidth - 40, yStartFooter - 20); // línea superior

  pdf.setFontSize(11);
  pdf.setTextColor(50);
  pdf.text("Contacto: 957083910", 40, yStartFooter);
  pdf.text("Correo: ventas@digitalcore.com", 40, yStartFooter + 20);
  pdf.text("Ubicación: Jr. Bellavista Nº 280", 40, yStartFooter + 40);

  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text("DigitalCore © 2025 – Todos los derechos reservados", pageWidth / 2, yStartFooter + 70, {
    align: "center"
  });

  pdf.line(40, yStartFooter + 80, pageWidth - 40, yStartFooter + 80); // línea inferior

  pdf.save("factura-digitalcore.pdf");
}










function cerrarModalFactura() {
  document.getElementById("modalFactura").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const finalizarBtn = document.getElementById("finalizar-compra");
  if (!finalizarBtn) return;

  finalizarBtn.addEventListener("click", () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const resumenDiv = document.getElementById("resumen-factura");
    const modal = document.getElementById("modalFactura");

    resumenDiv.innerHTML = "<h2>Resumen de Factura</h2>";

    let contenido = `
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr>
            <th style="border:1px solid #ccc;">Producto</th>
            <th style="border:1px solid #ccc;">Cantidad</th>
            <th style="border:1px solid #ccc;">Subtotal</th>
          </tr>
        </thead>
        <tbody>`;

    let total = 0;
    carrito.forEach(p => {
      const subtotal = p.precio * p.cantidad;
      total += subtotal;
      contenido += `
        <tr>
          <td style="border:1px solid #ccc;">${p.nombre}</td>
          <td style="border:1px solid #ccc;">${p.cantidad}</td>
          <td style="border:1px solid #ccc;">S/ ${subtotal.toFixed(2)}</td>
        </tr>`;
    });

    contenido += `
        </tbody>
      </table>
      <p style="text-align:right; font-size:1.2rem;"><strong>Total: S/ ${total.toFixed(2)}</strong></p>`;

    resumenDiv.innerHTML += contenido;
    modal.style.display = "block";
  });
});

window.addEventListener("click", function (e) {
  const modal = document.getElementById("modalFactura");
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
