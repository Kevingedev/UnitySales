
import React from 'react';

/**
 * Componente de Ticket de Venta optimizado para impresoras térmicas (58mm/80mm)
 * Sigue el patrón Z-Pattern y estilos monocromáticos.
 */
export const TicketTemplate = React.forwardRef(({ sale, items, companyInfo }, ref) => {
    // Valores por defecto si no se pasan props
    const company = companyInfo || {
        name: "UNITY SALES STORE",
        legalName: "UNITY RETAIL S.L.",
        nif: "B-12345678",
        address: "Gran Vía 45, 48011 Bilbao, Bizkaia",
        phone: "+34 944 000 000"
    };

    const date = sale?.created_at ? new Date(sale.created_at) : new Date();
    const formattedDate = date.toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('es-ES', {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div ref={ref} className="ticket-container bg-white text-black p-2 font-mono text-[10px] uppercase leading-tight max-w-[80mm] mx-auto">
            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body * { visibility: hidden; }
                    .ticket-container, .ticket-container * { visibility: visible; }
                    .ticket-container { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        padding: 10px; // Margen de seguridad para impresoras
                    }
                }
            `}</style>

            {/* 1. ENCABEZADO (Identidad y Validez Legal) */}
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold mb-1">{company.name}</h1>
                <p className="text-[10px]">{company.address}</p>
                <p className="text-[10px]">NIF: {company.nif}</p>
                <p className="text-[10px] mt-1">Tlf: {company.phone}</p>
            </div>

            {/* Metadatos de Seguimiento */}
            <div className="border-b-2 border-dashed border-black pb-2 mb-2 flex justify-between">
                <div>
                    <p>Fecha: {formattedDate} {formattedTime}</p>
                    <p>Ticket: #{sale?.id?.slice(0, 8).toUpperCase() || 'PTE'}</p>
                </div>
                <div className="text-right">
                    <p>Term: TPV-01</p>
                    <p>Vend: {sale?.profile_id ? 'EMP-' + sale.profile_id.substring(0, 4).toUpperCase() : 'General'}</p>
                </div>
            </div>

            {/* 2. CUERPO DEL TICKET (Detalle de Venta) */}
            <div className="mb-2">
                {/* Encabezados de Columna */}
                <div className="flex font-bold border-b border-black pb-1 mb-1">
                    <span className="w-8">CANT</span>
                    <span className="flex-1">DESCRIPCION</span>
                    <span className="w-12 text-right">PRECIO</span>
                    <span className="w-12 text-right">TOTAL</span>
                </div>

                {/* Lista de Items */}
                <div className="space-y-1">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-start">
                            <span className="w-8">{item.quantity}</span>
                            <span className="flex-1 truncate pr-1">
                                {item.product_name_at_sale || item.name} {/* Snapshot name */}
                            </span>
                            <span className="w-12 text-right">
                                {parseFloat(item.unit_price || item.base_price).toFixed(2)}
                            </span>
                            <span className="w-12 text-right font-bold">
                                {(item.quantity * parseFloat(item.unit_price || item.base_price)).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-black my-2"></div>

            {/* 3. BLOQUE FINANCIERO (Totales e Impuestos) */}
            <div className="flex flex-col items-end mb-4 font-mono">
                {/* Breakdown opcional */}
                <div className="w-full flex justify-between mb-1">
                    <span>Base Imponible:</span>
                    <span>{((sale?.total_amount || 0) / 1.21).toFixed(2)}€</span>
                </div>
                <div className="w-full flex justify-between mb-2">
                    <span>IVA (21%):</span>
                    <span>{((sale?.total_amount || 0) - ((sale?.total_amount || 0) / 1.21)).toFixed(2)}€</span>
                </div>

                {/* GRAN TOTAL */}
                <div className="w-full flex justify-between text-lg font-bold border-t border-black pt-1 mt-1">
                    <span>TOTAL A PAGAR</span>
                    <span>{parseFloat(sale?.total_amount || 0).toFixed(2)}€</span>
                </div>
            </div>

            {/* Método de Pago */}
            <div className="mb-4 text-center border border-black p-1 font-bold">
                PAGO: {sale?.payment_method?.toUpperCase() || 'EFECTIVO'}
            </div>

            {/* 4. CIERRE (TicketBAI y Pie) */}
            <div className="text-center space-y-2">
                {/* Espacio TicketBAI (Simulado por ahora) */}
                <div className="mb-2">
                    <p className="font-bold mb-1">TICKETBAI</p>
                    <div className="w-32 h-32 bg-white border border-black mx-auto flex items-center justify-center">
                        <span className="text-[8px] text-center">QR CODE<br />SPACE</span>
                    </div>
                    <p className="text-[8px] mt-1 break-all">
                        TBAI-{sale?.id || 'ID'}-ABC-123
                    </p>
                </div>

                {/* Mensaje de Cortesía */}
                <div className="text-[9px] mt-4">
                    <p>¡GRACIAS POR SU VISITA!</p>
                    <p>Conserve este ticket para cualquier cambio o devolución. Plazo máximo 15 días.</p>
                </div>
            </div>
        </div>
    );
});

TicketTemplate.displayName = "TicketTemplate";
