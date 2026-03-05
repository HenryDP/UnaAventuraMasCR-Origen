import React from 'react';
import { motion } from 'motion/react';
import { FileText, CreditCard, AlertCircle, User, ShieldCheck, Camera, Scale, MessageCircle } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      icon: <CreditCard className="text-emerald-500" size={24} />,
      title: "1. Reservas y Pagos",
      content: [
        "Confirmación: Toda reserva se considerará formalmente confirmada únicamente tras el pago del 30% del valor total del tour.",
        "Métodos de Pago: Aceptamos pagos mediante Transferencia Bancaria, SINPE Móvil y Tarjetas de Crédito/Débito.",
        "Saldo Pendiente: El saldo restante deberá cancelarse a más tardar 3 días antes de la actividad o al inicio de la misma, según lo acordado previamente con nuestro equipo."
      ]
    },
    {
      icon: <AlertCircle className="text-emerald-500" size={24} />,
      title: "2. Políticas de Cancelación y Reembolsos",
      content: [
        "Cancelaciones por el Cliente (Más de 72 horas): Reembolso del 100% del monto pagado.",
        "Cancelaciones por el Cliente (Entre 48 y 24 horas): Reembolso del 50% del monto pagado.",
        "Cancelaciones por el Cliente (Menos de 24 horas o 'No Show'): No se aplicará ningún tipo de reembolso.",
        "Cancelaciones por el Operador: Nos reservamos el derecho de cancelar o modificar el tour por causas de fuerza mayor (clima extremo, cierres de parques, alertas de seguridad). En estos casos, se ofrecerá una reprogramación o el reembolso total."
      ]
    },
    {
      icon: <User className="text-emerald-500" size={24} />,
      title: "3. Responsabilidades del Cliente",
      content: [
        "Condición Física: El cliente declara estar en condiciones físicas óptimas para la actividad. Es obligatorio informar sobre alergias, lesiones (hombros, rodillas) o condiciones médicas previo al tour.",
        "Equipo y Vestimenta: El cliente es responsable de portar el equipo sugerido (calzado adecuado, protección solar, hidratación). El operador no se hace responsable por daños a objetos personales (celulares, cámaras, drones).",
        "Conducta: Se debe respetar la normativa de las Áreas Silvestres Protegidas. No se permite la extracción de flora/fauna ni el consumo de sustancias ilícitas durante el tour."
      ]
    },
    {
      icon: <ShieldCheck className="text-emerald-500" size={24} />,
      title: "4. Seguros y Exoneración de Responsabilidad",
      content: [
        "Seguros: Contamos con las pólizas de responsabilidad civil exigidas por ley. No obstante, recomendamos a los clientes contar con su propio seguro de gastos médicos adicional.",
        "Exoneración: Al participar, el cliente reconoce los riesgos intrínsecos de las actividades al aire libre y exonera a Una Aventura Más de responsabilidad por incidentes derivados de imprudencia o factores naturales imprevisibles."
      ]
    },
    {
      icon: <Camera className="text-emerald-500" size={24} />,
      title: "5. Uso de Imagen",
      content: [
        "El cliente autoriza el uso de material fotográfico o de video tomado durante el tour para fines promocionales en nuestras redes sociales y sitio web, a menos que indique lo contrario de forma explícita antes de iniciar la actividad."
      ]
    },
    {
      icon: <Scale className="text-emerald-500" size={24} />,
      title: "6. Jurisdicción",
      content: [
        "Cualquier disputa relativa a estos términos será regida y resuelta bajo las leyes vigentes de la República de Costa Rica."
      ]
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
          <div className="bg-stone-900 p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <FileText className="mx-auto mb-6 text-emerald-500" size={48} />
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Términos y Condiciones</h1>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Al contratar nuestros servicios, aceptas los siguientes términos diseñados para garantizar tu seguridad y la mejor calidad en cada aventura.
            </p>
            <div className="mt-8 inline-block bg-stone-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-stone-700">
              Vigente desde: Marzo 2026
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-12">
            <div className="grid grid-cols-1 gap-12">
              {sections.map((section, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center border border-stone-100 shadow-sm">
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-bold text-stone-900">{section.title}</h3>
                  </div>
                  <div className="pl-16 space-y-4">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-stone-600 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 pt-10 border-t border-stone-100 text-center">
              <p className="text-stone-500 mb-6">
                ¿Tienes alguna pregunta sobre nuestras políticas?
              </p>
              <a 
                href="https://wa.me/50687751442" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg"
              >
                <MessageCircle size={20} className="mr-2" />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
