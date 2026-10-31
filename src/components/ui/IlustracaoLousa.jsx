// Lousa com videoaula e lista de materiais: "aulas e materiais em um só lugar".
// Usada na escolha de perfil. Ao aparecer, a lousa "se monta" em menos de 5 segundos
// (veja as classes ilustracao__escrita, __surge, __pulso e __atraso-N no CSS).
// Sem animação, ela já aparece completa.
export default function IlustracaoLousa() {
  return (
    <>
      <rect className="ilustracao__quadro" x="10" y="8" width="220" height="116" rx="10" />

      {/* Videoaula com barra de progresso */}
      <rect className="ilustracao__tela" x="26" y="24" width="94" height="60" rx="6" />
      <circle className="ilustracao__pulso" cx="73" cy="54" r="14" />
      <g className="ilustracao__surge ilustracao__atraso-1">
        <circle className="ilustracao__play" cx="73" cy="54" r="14" />
        <polygon className="ilustracao__triangulo" points="68,47 68,61 81,54" />
      </g>
      <line className="ilustracao__barra" x1="26" y1="100" x2="120" y2="100" />
      <line
        className="ilustracao__barra ilustracao__barra--progresso ilustracao__escrita ilustracao__escrita--longa ilustracao__atraso-2"
        pathLength="1"
        x1="26"
        y1="100"
        x2="84"
        y2="100"
      />

      {/* Lista de materiais */}
      <rect className="ilustracao__caixa" x="136" y="27" width="14" height="14" rx="3" />
      <path
        className="ilustracao__visto ilustracao__escrita ilustracao__atraso-4"
        pathLength="1"
        d="M139 34 l3.5 3.5 l6 -7"
      />
      <line
        className="ilustracao__traco ilustracao__escrita ilustracao__atraso-3"
        pathLength="1"
        x1="158"
        y1="34"
        x2="212"
        y2="34"
      />

      <rect className="ilustracao__caixa" x="136" y="49" width="14" height="14" rx="3" />
      <path
        className="ilustracao__visto ilustracao__escrita ilustracao__atraso-6"
        pathLength="1"
        d="M139 56 l3.5 3.5 l6 -7"
      />
      <line
        className="ilustracao__traco ilustracao__escrita ilustracao__atraso-5"
        pathLength="1"
        x1="158"
        y1="56"
        x2="200"
        y2="56"
      />

      <rect className="ilustracao__caixa ilustracao__caixa--suave" x="136" y="71" width="14" height="14" rx="3" />
      <line
        className="ilustracao__traco ilustracao__traco--suave ilustracao__escrita ilustracao__atraso-7"
        pathLength="1"
        x1="158"
        y1="78"
        x2="206"
        y2="78"
      />

      <rect
        className="ilustracao__botao ilustracao__surge ilustracao__surge--esquerda ilustracao__atraso-8"
        x="136"
        y="96"
        width="76"
        height="12"
        rx="6"
      />

      {/* Bandeja e pés */}
      <rect className="ilustracao__base" x="36" y="124" width="168" height="8" rx="4" />
      <rect className="ilustracao__giz" x="60" y="116" width="20" height="8" rx="3" />
      <line className="ilustracao__apoio" x1="120" y1="132" x2="96" y2="156" />
      <line className="ilustracao__apoio" x1="120" y1="132" x2="144" y2="156" />
    </>
  )
}