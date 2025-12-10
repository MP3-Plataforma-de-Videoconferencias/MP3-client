import { useRef } from 'react';

export function UserManual(): JSX.Element {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!contentRef.current) return;

    // Crear una ventana de impresión con estilos específicos para PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = `
      <style>
        @media print {
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
          }
          h1 { 
            color: #0ea5a4; 
            font-size: 28px; 
            margin-bottom: 10px;
            border-bottom: 3px solid #0ea5a4;
            padding-bottom: 10px;
          }
          h2 { 
            color: #0ea5a4; 
            font-size: 22px; 
            margin-top: 30px; 
            margin-bottom: 15px;
            border-left: 5px solid #0ea5a4;
            padding-left: 15px;
          }
          h3 { 
            color: #555; 
            font-size: 18px; 
            margin-top: 20px; 
            margin-bottom: 10px;
          }
          p, li { 
            margin-bottom: 10px; 
            font-size: 12px;
          }
          ul, ol { 
            margin-left: 20px; 
            margin-bottom: 15px;
          }
          .step-box {
            background: #f5f5f5;
            border-left: 4px solid #0ea5a4;
            padding: 15px;
            margin: 15px 0;
            page-break-inside: avoid;
          }
          .important-note {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 12px;
            margin: 15px 0;
            border-radius: 4px;
            page-break-inside: avoid;
          }
          .tip {
            background: #d1ecf1;
            border-left: 4px solid #17a2b8;
            padding: 12px;
            margin: 15px 0;
            page-break-inside: avoid;
          }
          button { display: none; }
          .no-print { display: none; }
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Manual de Usuario - Plataforma de Videoconferencias</title>
          ${styles}
        </head>
        <body>
          ${contentRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Esperar a que se cargue el contenido antes de imprimir
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Botón de descarga */}
        <div className="flex justify-end mb-6 no-print">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-[#0ea5a4] text-white px-6 py-3 rounded-lg hover:bg-[#0d8f8e] transition font-medium shadow-md"
          >
            <span className="material-symbols-outlined">download</span>
            Descargar PDF
          </button>
        </div>

        {/* Contenido del manual */}
        <div ref={contentRef}>
          <h1 className="text-3xl font-bold text-[#0ea5a4] mb-2 border-b-4 border-[#0ea5a4] pb-3">
            Manual de Usuario
          </h1>
          <p className="text-gray-600 mb-8">Plataforma de Videoconferencias</p>

          {/* Introducción */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0ea5a4] mb-4 border-l-4 border-[#0ea5a4] pl-4">
              Introducción
            </h2>
            <p className="text-gray-700 mb-4">
              Bienvenido a nuestra plataforma de videoconferencias. Este manual te guiará paso a paso
              para que puedas aprovechar al máximo todas las funcionalidades de la aplicación.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Consejo:</strong> Te recomendamos leer este manual completo antes de usar 
                la plataforma por primera vez para familiarizarte con todas las opciones disponibles.
              </p>
            </div>
          </section>

          {/* 1. Registro */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0ea5a4] mb-4 border-l-4 border-[#0ea5a4] pl-4">
              1. Registro de Usuario
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              1.1 Registro con Correo Electrónico
            </h3>
            
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Accede a la página principal y haz clic en <strong>"Regístrate aquí"</strong></li>
                <li>Completa el formulario con la siguiente información:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><strong>Nombre:</strong> Tu nombre completo</li>
                    <li><strong>Apellido:</strong> Tu apellido</li>
                    <li><strong>Fecha de Nacimiento:</strong> Selecciona tu fecha de nacimiento</li>
                    <li><strong>Correo electrónico:</strong> Ingresa un correo válido</li>
                    <li><strong>Contraseña:</strong> Debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales</li>
                    <li><strong>Confirmar Contraseña:</strong> Repite la contraseña ingresada</li>
                  </ul>
                </li>
                <li>Haz clic en <strong>"Crear Cuenta"</strong></li>
                <li>Serás redirigido automáticamente a la página principal de reuniones</li>
              </ol>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              1.2 Registro con Google
            </h3>
            
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>En la página de registro, haz clic en el botón <strong>"Google"</strong></li>
                <li>Selecciona tu cuenta de Google en la ventana emergente</li>
                <li>Autoriza el acceso a la aplicación</li>
                <li>Completa tu <strong>Fecha de Nacimiento</strong> (único dato requerido)</li>
                <li>Haz clic en <strong>"Completar Registro"</strong></li>
                <li>Serás redirigido a la página principal</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-400 p-4 my-4 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> La contraseña debe cumplir con los requisitos de seguridad 
                para garantizar la protección de tu cuenta.
              </p>
            </div>
          </section>

          {/* 2. Inicio de Sesión */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0ea5a4] mb-4 border-l-4 border-[#0ea5a4] pl-4">
              2. Iniciar Sesión
            </h2>

            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              2.1 Inicio de Sesión con Correo
            </h3>
            
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>En la página de inicio, haz clic en <strong>"Iniciar Sesión"</strong></li>
                <li>Ingresa tu <strong>correo electrónico</strong></li>
                <li>Ingresa tu <strong>contraseña</strong></li>
                <li>Haz clic en <strong>"Iniciar Sesión"</strong></li>
                <li>Serás redirigido a la página de reuniones</li>
              </ol>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              2.2 Inicio de Sesión con Google
            </h3>
            
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>En la página de inicio de sesión, haz clic en el botón <strong>"Google"</strong></li>
                <li>Selecciona tu cuenta de Google</li>
                <li>Serás redirigido automáticamente a la aplicación</li>
              </ol>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              2.3 Recuperar Contraseña
            </h3>
            
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>En la página de inicio de sesión, haz clic en <strong>"¿Olvidaste tu contraseña?"</strong></li>
                <li>Ingresa tu correo electrónico registrado</li>
                <li>Haz clic en <strong>"Enviar enlace de recuperación"</strong></li>
                <li>Revisa tu correo y sigue las instrucciones del enlace recibido</li>
              </ol>
            </div>
          </section>

          {/* 3. Crear Reunión */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0ea5a4] mb-4 border-l-4 border-[#0ea5a4] pl-4">
              3. Crear una Reunión
            </h2>

            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Una vez iniciada la sesión, llegarás a la página principal de reuniones</li>
                <li>En la sección <strong>"Crear tu propia reunión"</strong>, haz clic en <strong>"Crear reunión"</strong></li>
                <li>El sistema generará automáticamente un código único para tu reunión</li>
                <li>Serás redirigido a la sala de videoconferencia</li>
                <li>Comparte el código de reunión con los participantes que desees invitar</li>
              </ol>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
              <p className="text-sm text-blue-800">
                <strong> Consejo:</strong> Guarda el código de reunión en un lugar seguro para poder 
                compartirlo fácilmente con los participantes.
              </p>
            </div>
          </section>

          {/* 4. Unirse a una Reunión */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0ea5a4] mb-4 border-l-4 border-[#0ea5a4] pl-4">
              4. Unirse a una Reunión
            </h2>

            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>En la página principal, localiza la sección <strong>"Unirse a una reunión"</strong></li>
                <li>En el campo <strong>"Código de reunión"</strong>, ingresa el código que te compartió el anfitrión</li>
                <li>Haz clic en <strong>"Ingresar"</strong></li>
                <li>Serás redirigido a la sala de videoconferencia</li>
                <li>Podrás ver a los demás participantes y activar tu cámara y micrófono</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-400 p-4 my-4 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Asegúrate de ingresar el código correctamente. 
                Si el código es incorrecto, no podrás acceder a la reunión.
              </p>
            </div>
          </section>

          {/* 5. Controles de la Reunión */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0ea5a4] mb-4 border-l-4 border-[#0ea5a4] pl-4">
              5. Controles Durante la Reunión
            </h2>

            <p className="text-gray-700 mb-4">
              Una vez dentro de la sala de videoconferencia, encontrarás varios controles en la parte 
              inferior de la pantalla:
            </p>

            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              5.1 Control de Micrófono
            </h3>
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Haz clic en el icono del micrófono para <strong>activar/desactivar</strong> tu audio</li>
                <li>Cuando está activado, el icono aparece en color normal</li>
                <li>Cuando está desactivado (silenciado), el icono aparece tachado</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              5.2 Control de Cámara
            </h3>
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Haz clic en el icono de la cámara para <strong>encender/apagar</strong> tu video</li>
                <li>Cuando está encendida, se mostrará tu video en vivo</li>
                <li>Cuando está apagada, se mostrará tu avatar con tus iniciales</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              5.3 Chat (en dispositivos móviles)
            </h3>
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>En pantallas pequeñas, haz clic en el icono de chat para abrir el panel de mensajes</li>
                <li>Escribe tu mensaje y presiona Enter o haz clic en enviar</li>
                <li>Cierra el chat haciendo clic nuevamente en el icono</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              5.4 Finalizar Reunión
            </h3>
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Haz clic en el botón rojo de <strong>"Colgar"</strong></li>
                <li>Serás redirigido a la página principal</li>
                <li>La reunión se marcará como finalizada en el sistema</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
              <p className="text-sm text-blue-800">
                <strong>Consejo:</strong> Asegúrate de tener buena iluminación y una conexión a 
                internet estable para una mejor experiencia de videoconferencia.
              </p>
            </div>
          </section>

          {/* 6. Visualización de Participantes */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0ea5a4] mb-4 border-l-4 border-[#0ea5a4] pl-4">
              6. Visualización de Participantes
            </h2>

            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Todos los participantes se muestran en una cuadrícula en la pantalla principal</li>
                <li>Tu video aparece marcado con un borde especial y la etiqueta <strong>"(Tú)"</strong></li>
                <li>Cuando un participante tiene la cámara apagada, se muestra su avatar con iniciales</li>
                <li>El nombre de cada participante aparece en su recuadro de video</li>
                <li>La cuadrícula se ajusta automáticamente según el número de participantes</li>
              </ul>
            </div>
          </section>

          {/* 7. Solución de Problemas */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0ea5a4] mb-4 border-l-4 border-[#0ea5a4] pl-4">
              7. Solución de Problemas Comunes
            </h2>

            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              7.1 No puedo ver mi video
            </h3>
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Verifica que tu cámara esté conectada y funcionando correctamente</li>
                <li>Asegúrate de haber dado permisos de cámara al navegador</li>
                <li>Verifica que el botón de cámara no esté desactivado (icono tachado)</li>
                <li>Intenta recargar la página</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              7.2 No puedo escuchar a otros participantes
            </h3>
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Verifica el volumen de tu dispositivo</li>
                <li>Asegúrate de haber dado permisos de audio al navegador</li>
                <li>Comprueba que tus altavoces o auriculares estén conectados correctamente</li>
                <li>Verifica que otros participantes tengan sus micrófonos activados</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              7.3 El código de reunión no funciona
            </h3>
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Verifica que hayas ingresado el código correctamente</li>
                <li>Asegúrate de que el código no tenga espacios adicionales</li>
                <li>Confirma con el anfitrión que el código sea correcto</li>
                <li>Verifica que la reunión no haya finalizado</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              7.4 Problemas de conexión
            </h3>
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Verifica tu conexión a internet</li>
                <li>Cierra otras aplicaciones que puedan estar consumiendo ancho de banda</li>
                <li>Intenta acercarte al router WiFi</li>
                <li>Considera usar una conexión por cable si es posible</li>
              </ul>
            </div>
          </section>

          {/* 8. Consejos y Mejores Prácticas */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0ea5a4] mb-4 border-l-4 border-[#0ea5a4] pl-4">
              8. Consejos y Mejores Prácticas
            </h2>

            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Iluminación:</strong> Asegúrate de tener buena iluminación frontal</li>
                <li><strong>Fondo:</strong> Elige un fondo neutro y profesional</li>
                <li><strong>Auriculares:</strong> Usa auriculares para evitar eco y mejorar la calidad del audio</li>
                <li><strong>Micrófono:</strong> Silencia tu micrófono cuando no estés hablando</li>
                <li><strong>Internet:</strong> Usa una conexión estable, preferiblemente por cable</li>
                <li><strong>Actualizaciones:</strong> Mantén tu navegador actualizado</li>
                <li><strong>Privacidad:</strong> No compartas tu código de reunión públicamente</li>
              </ul>
            </div>
          </section>

          {/* 9. Requisitos del Sistema */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0ea5a4] mb-4 border-l-4 border-[#0ea5a4] pl-4">
              9. Requisitos del Sistema
            </h2>

            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Navegadores Compatibles
            </h3>
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Google Chrome (versión 90 o superior) - Recomendado</li>
                <li>Mozilla Firefox (versión 88 o superior)</li>
                <li>Microsoft Edge (versión 90 o superior)</li>
                <li>Safari (versión 14 o superior)</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              Requisitos de Hardware
            </h3>
            <div className="bg-gray-50 border-l-4 border-[#0ea5a4] p-4 my-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Cámara web (opcional, pero recomendada)</li>
                <li>Micrófono</li>
                <li>Altavoces o auriculares</li>
                <li>Conexión a internet de al menos 2 Mbps</li>
              </ul>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-gray-300">
            <p className="text-center text-gray-600 text-sm">
              © 2024 Plataforma de Videoconferencias. Todos los derechos reservados.
            </p>
            <p className="text-center text-gray-500 text-xs mt-2">
              Para soporte técnico o consultas adicionales, contacta a tu administrador.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}