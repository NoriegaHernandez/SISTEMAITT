// src/components/ColorblindFilters.tsx
export default function ColorblindFilters() {
  return (
    <svg className="colorblind-filters" style={{ display: 'none' }}>
      <defs>
        {/* Protanopaía - Ceguera al Rojo */}
        <filter id="protanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0.000 0 0
                    0.558 0.442 0.000 0 0
                    0.000 0.242 0.758 0 0
                    0.000 0.000 0.000 1 0"
          />
        </filter>

        {/* Deuteranopaía - Ceguera al Verde */}
        <filter id="deuteranopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0.000 0 0
                    0.700 0.300 0.000 0 0
                    0.000 0.300 0.700 0 0
                    0.000 0.000 0.000 1 0"
          />
        </filter>

        {/* Tritanopaía - Ceguera al Azul-Amarillo */}
        <filter id="tritanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.950 0.050 0.000 0 0
                    0.000 0.433 0.567 0 0
                    0.000 0.475 0.525 0 0
                    0.000 0.000 0.000 1 0"
          />
        </filter>

        {/* Acromatopsia - Ceguera total al color */}
        <filter id="achromatopsia-filter">
          <feColorMatrix
            type="saturate"
            values="0"
          />
        </filter>

        {/* Mejora de contraste */}
        <filter id="high-contrast-filter">
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 1" />
            <feFuncG type="discrete" tableValues="0 1" />
            <feFuncB type="discrete" tableValues="0 1" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}