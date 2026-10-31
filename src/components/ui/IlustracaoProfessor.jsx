// Professor em pé, apontando com uma varinha para a lousa.
// Ao aparecer, o braço sobe, a varinha acompanha as linhas e o giz vai sendo escrito
// (menos de 5 s, uma vez). Sem animação, a cena já aparece completa.
export default function IlustracaoProfessor() {
  return (
    <>
      {/* Chão */}
      <rect className="ilustracao__base" x="10" y="140" width="220" height="6" rx="3" />

      {/* Lousa */}
      <rect className="ilustracao__quadro" x="104" y="14" width="126" height="94" rx="8" />
      <line
        className="ilustracao__traco ilustracao__escrita ilustracao__atraso-3"
        pathLength="1"
        x1="122"
        y1="38"
        x2="202"
        y2="38"
      />
      <line
        className="ilustracao__traco ilustracao__escrita ilustracao__atraso-5"
        pathLength="1"
        x1="122"
        y1="56"
        x2="186"
        y2="56"
      />
      <line
        className="ilustracao__traco ilustracao__escrita ilustracao__atraso-7"
        pathLength="1"
        x1="122"
        y1="74"
        x2="196"
        y2="74"
      />
      <line
        className="ilustracao__traco ilustracao__traco--destaque ilustracao__escrita ilustracao__atraso-8"
        pathLength="1"
        x1="122"
        y1="92"
        x2="170"
        y2="92"
      />

      {/* Professor */}
      <rect className="ilustracao__pessoa" x="34" y="68" width="44" height="72" rx="16" />
      <circle className="ilustracao__pessoa" cx="56" cy="46" r="19" />
      <path className="ilustracao__cabelo" d="M37 44 a19 19 0 0 1 38 0 q-19 -8 -38 0z" />

      {/* Braço apontando e varinha (giram juntos a partir do ombro) */}
      <g className="ilustracao__braco-apontando">
        <line className="ilustracao__membro" x1="74" y1="84" x2="112" y2="66" />
        <line className="ilustracao__traco ilustracao__traco--destaque" x1="112" y1="66" x2="150" y2="48" />
      </g>
    </>
  )
}