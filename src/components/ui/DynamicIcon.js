import * as Icons from "lucide-react";

/**
 * Función para renderizar el icono dinámicamente
 */
const DynamicIcon = ({ name, size = 20, ...props }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <Icons.HelpCircle size={size} />; // Icono por defecto si falla
  return <IconComponent size={size} {...props} />;
};