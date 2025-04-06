
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

const Plans = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setIsLoggedIn(true);
      const user = JSON.parse(userData);
      if (user.plan) {
        setSelectedPlan(user.plan);
      }
    }
  }, []);

  const handleSelectPlan = (plan: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Necesitas iniciar sesión",
        description: "Para seleccionar un plan, debes iniciar sesión primero.",
        variant: "destructive",
      });
      return;
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    userData.plan = plan;
    localStorage.setItem('user', JSON.stringify(userData));
    setSelectedPlan(plan);

    toast({
      title: "Plan seleccionado",
      description: `Has seleccionado el plan ${plan} exitosamente.`,
    });
  };

  return (
    <div className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">P L A N E S</h2>
        <p className="text-center text-gray-300 mb-12">
          Contamos con diferentes almacenamientos dependiendo de tus necesidades
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan Bronze */}
          <div className={`plan-card p-8 ${selectedPlan === 'Bronze' ? 'border-2 border-lyra-primary' : ''}`}>
            <h3 className="text-2xl font-bold text-center text-lyra-primary mb-4">BRONZE</h3>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold">$1,200</span>
              <span className="text-gray-400"> / MES</span>
            </div>
            <div className="border-t border-b border-gray-700 py-4 mb-6">
              <div className="mb-2 text-center">Texto a voz</div>
              <div className="mb-2 text-center">1 solo Texto a voz</div>
            </div>
            <button
              onClick={() => handleSelectPlan('Bronze')}
              disabled={selectedPlan === 'Bronze'}
              className={`w-full py-2 rounded-md text-white font-semibold ${
                selectedPlan === 'Bronze'
                  ? 'bg-lyra-primary'
                  : 'bg-transparent border border-lyra-primary hover:bg-lyra-primary hover:bg-opacity-20'
              }`}
            >
              {selectedPlan === 'Bronze' ? 'Plan Actual' : 'Seleccionar'}
            </button>
          </div>
          
          {/* Plan Gold */}
          <div className={`plan-card p-8 ${selectedPlan === 'Gold' ? 'border-2 border-lyra-primary' : ''}`}>
            <h3 className="text-2xl font-bold text-center text-lyra-primary mb-4">GOLD</h3>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold">$1,200</span>
              <span className="text-gray-400"> / MES</span>
            </div>
            <div className="border-t border-b border-gray-700 py-4 mb-6">
              <div className="mb-2 text-center">Texto a voz</div>
              <div className="mb-2 text-center">2 Textos a la vez</div>
              <div className="mb-2 text-center">Soporte técnico</div>
            </div>
            <button
              onClick={() => handleSelectPlan('Gold')}
              disabled={selectedPlan === 'Gold'}
              className={`w-full py-2 rounded-md text-white font-semibold ${
                selectedPlan === 'Gold'
                  ? 'bg-lyra-primary'
                  : 'bg-transparent border border-lyra-primary hover:bg-lyra-primary hover:bg-opacity-20'
              }`}
            >
              {selectedPlan === 'Gold' ? 'Plan Actual' : 'Seleccionar'}
            </button>
          </div>
          
          {/* Plan Diamond */}
          <div className={`plan-card p-8 ${selectedPlan === 'Diamond' ? 'border-2 border-lyra-primary' : ''}`}>
            <h3 className="text-2xl font-bold text-center text-lyra-primary mb-4">DIAMOND</h3>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold">$1,200</span>
              <span className="text-gray-400"> / MES</span>
            </div>
            <div className="border-t border-b border-gray-700 py-4 mb-6">
              <div className="mb-2 text-center">Texto a voz</div>
              <div className="mb-2 text-center">2 Textos a la vez</div>
              <div className="mb-2 text-center">Soporte técnico</div>
              <div className="mb-2 text-center">Soporte técnico</div>
            </div>
            <button
              onClick={() => handleSelectPlan('Diamond')}
              disabled={selectedPlan === 'Diamond'}
              className={`w-full py-2 rounded-md text-white font-semibold ${
                selectedPlan === 'Diamond'
                  ? 'bg-lyra-primary'
                  : 'bg-transparent border border-lyra-primary hover:bg-lyra-primary hover:bg-opacity-20'
              }`}
            >
              {selectedPlan === 'Diamond' ? 'Plan Actual' : 'Seleccionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
