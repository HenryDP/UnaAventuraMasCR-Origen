import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, MessageCircle, Clock, Share2, UserCheck, RefreshCw } from 'lucide-react';

export default function Privacy() {
  const sections = [
    {
      icon: <Eye className="text-emerald-500" size={24} />,
      title: "1. Información que Recopilamos",
      content: "Recopilamos únicamente los datos necesarios para brindarte una experiencia personalizada: datos de contacto que nos compartes voluntariamente (nombre, teléfono), el contenido de tus consultas (destinos, fechas aproximadas, preferencias de viaje) e información técnica básica de navegación para garantizar la seguridad y el correcto funcionamiento del sitio."
    },
    {
      icon: <UserCheck className="text-emerald-500" size={24} />,
      title: "2. Finalidad del Tratamiento",
      content: "Utilizamos tu información exclusivamente para: responder a tus consultas con detalles precisos de nuestros paquetes, coordinar la logística necesaria para confirmar tus servicios, mejorar la calidad de nuestra atención al cliente y mantenerte informado sobre actualizaciones relevantes de tus viajes."
    },
    {
      icon: <MessageCircle className="text-emerald-500" size={24} />,
      title: "3. WhatsApp y Redes Sociales",
      content: "Al elegir contactarnos por WhatsApp o redes sociales, la interacción ocurre en plataformas externas sujetas a sus propios términos de privacidad. Te recomendamos revisar las configuraciones de privacidad de dichas aplicaciones para tener un control total sobre tu información en esos canales."
    },
    {
      icon: <Clock className="text-emerald-500" size={24} />,
      title: "4. Conservación de Datos",
      content: "Mantenemos tu información únicamente durante el tiempo razonablemente necesario para completar tu solicitud, gestionar tu viaje y realizar el seguimiento post-servicio, cumpliendo siempre con las obligaciones legales aplicables en Costa Rica."
    },
    {
      icon: <Share2 className="text-emerald-500" size={24} />,
      title: "5. Confidencialidad y Compartición",
      content: "Tu privacidad no está a la venta. No comercializamos tus datos personales con terceros. Solo compartiremos información específica con proveedores directamente vinculados a tu servicio (como hoteles o transportistas) cuando sea estrictamente necesario para la ejecución del viaje, o por requerimiento de autoridades legales."
    },
    {
      icon: <Lock className="text-emerald-500" size={24} />,
      title: "6. Seguridad de la Información",
      content: "Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos contra accesos no autorizados o alteraciones. Aunque ningún sistema en internet es infalible, trabajamos constantemente para mantener los más altos estándares de protección."
    },
    {
      icon: <Shield className="text-emerald-500" size={24} />,
      title: "7. Tus Derechos",
      content: "Tienes derecho a conocer, actualizar, rectificar o solicitar la eliminación de tus datos personales en cualquier momento. Para ejercer estos derechos, simplemente escríbenos a través de nuestro canal oficial de WhatsApp y te guiaremos en el proceso de forma ágil."
    },
    {
      icon: <RefreshCw className="text-emerald-500" size={24} />,
      title: "8. Actualizaciones de la Política",
      content: "Podemos actualizar esta política periódicamente para reflejar cambios operativos o mejoras en la protección de datos. Cualquier modificación será publicada inmediatamente en esta página, indicando la fecha de la última actualización."
    }
  ];

  return (
    <div className="bg-stone-50 min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100"
        >
          {/* Header */}
          <div className="bg-emerald-900 p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-800/30 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            
            <Shield className="mx-auto mb-6 text-emerald-400" size={48} />
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Política de Privacidad</h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto leading-relaxed">
              En Una Aventura Más (Costa Rica) valoramos tu privacidad. Esta política explica cómo tratamos la información cuando solicitas información, consultas disponibilidad o te comunicas con nosotros.
            </p>
            <div className="mt-8 inline-block bg-emerald-800/50 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-emerald-700/50">
              Última actualización: Marzo 2026
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-12">
            <div className="grid grid-cols-1 gap-10">
              {sections.map((section, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="shrink-0 w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-3">{section.title}</h3>
                    <p className="text-stone-600 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 pt-10 border-t border-stone-100 text-center">
              <p className="text-stone-500 mb-6">
                ¿Tienes alguna duda sobre cómo manejamos tus datos?
              </p>
              <a 
                href="https://wa.me/50687751442" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg"
              >
                <MessageCircle size={20} className="mr-2" />
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
