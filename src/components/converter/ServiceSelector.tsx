
import { ConversionService } from "./ConversionServices";

type ServiceSelectorProps = {
  services: ConversionService[];
  activeService: string;
  onSelectService: (id: string) => void;
};

const ServiceSelector = ({ 
  services, 
  activeService, 
  onSelectService 
}: ServiceSelectorProps) => {
  return (
    <div className="mt-8 bg-gray-900 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Servicios de Conversión</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service.id)}
            className={`bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition-all cursor-pointer ${
              activeService === service.id ? "ring-2 ring-lyra-primary" : ""
            }`}
            type="button"
          >
            <div className={`${service.color} w-12 h-12 mx-auto rounded-md flex items-center justify-center mb-3`}>
              {service.icon}
            </div>
            <h4 className="font-medium mb-1">{service.title}</h4>
            <p className="text-sm text-gray-400">{service.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceSelector;
