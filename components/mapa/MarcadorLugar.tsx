// Marcador SVG clicable para el plano interactivo de Casa Ronald
interface Props {
  x: number;
  y: number;
  icono: string;
  activo: boolean;
  esAqui: boolean;
  onClick: () => void;
  titulo: string;
}

export function MarcadorLugar({ x, y, icono, activo, esAqui, onClick, titulo }: Props) {
  const radio = 14;

  return (
    <g
      onClick={onClick}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label={titulo}
    >
      {/* Anillo de selección */}
      {activo && (
        <circle
          cx={x}
          cy={y}
          r={radio + 5}
          fill="none"
          stroke="#C85A2A"
          strokeWidth={2.5}
          opacity={0.6}
        />
      )}

      {/* Fondo del marcador */}
      <circle
        cx={x}
        cy={y}
        r={radio}
        fill={activo ? "#C85A2A" : "#FFFFFF"}
        stroke={esAqui ? "#15803D" : activo ? "#C85A2A" : "#D1D5DB"}
        strokeWidth={esAqui ? 2.5 : 1.5}
      />

      {/* Indicador "estás aquí" */}
      {esAqui && (
        <circle
          cx={x + radio - 3}
          cy={y - radio + 3}
          r={5}
          fill="#15803D"
          stroke="#FFFFFF"
          strokeWidth={1.5}
        />
      )}

      {/* Emoji del lugar */}
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fontSize={13}
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {icono}
      </text>
    </g>
  );
}
