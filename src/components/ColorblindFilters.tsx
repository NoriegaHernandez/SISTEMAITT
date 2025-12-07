// src/components/ColorblindFilters.tsx
import { useEffect } from 'react';

export default function ColorblindFilters() {
  useEffect(() => {
    // Verificar que los filtros se montaron correctamente
    console.log('🎨 ColorblindFilters montado');
    
    const checkFilters = () => {
      const filters = {
        protanopia: document.getElementById('protanopia-filter'),
        deuteranopia: document.getElementById('deuteranopia-filter'),
        tritanopia: document.getElementById('tritanopia-filter'),
      };
      
      console.log('📋 Estado de filtros SVG:', {
        protanopia: !!filters.protanopia,
        deuteranopia: !!filters.deuteranopia,
        tritanopia: !!filters.tritanopia,
      });
      
      // Verificar si todos existen
      const allFiltersExist = Object.values(filters).every(f => f !== null);
      if (!allFiltersExist) {
        console.error('❌ Algunos filtros SVG NO se encontraron en el DOM');
      } else {
        console.log('✅ Todos los filtros SVG están disponibles');
      }
    };
    
    // Verificar inmediatamente y después de un pequeño delay
    checkFilters();
    setTimeout(checkFilters, 100);
  }, []);
  
  return (
    <svg 
      className="colorblind-filters" 
      style={{ 
        position: 'absolute', 
        width: 0, 
        height: 0,
        pointerEvents: 'none',
        visibility: 'hidden'
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Filtro para Protanopia (Ceguera al Rojo) */}
        <filter id="protanopia-filter" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values="0.567, 0.433, 0,     0, 0
                    0.558, 0.442, 0,     0, 0
                    0,     0.242, 0.758, 0, 0
                    0,     0,     0,     1, 0"
          />
        </filter>

        {/* Filtro para Deuteranopia (Ceguera al Verde) */}
        <filter id="deuteranopia-filter" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values="0.625, 0.375, 0,   0, 0
                    0.7,   0.3,   0,   0, 0
                    0,     0.3,   0.7, 0, 0
                    0,     0,     0,   1, 0"
          />
        </filter>

        {/* Filtro para Tritanopia (Ceguera al Azul) */}
        <filter id="tritanopia-filter" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values="0.95, 0.05,  0,     0, 0
                    0,    0.433, 0.567, 0, 0
                    0,    0.475, 0.525, 0, 0
                    0,    0,     0,     1, 0"
          />
        </filter>
      </defs>
    </svg>
  );
}