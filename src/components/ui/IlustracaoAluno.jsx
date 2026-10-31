// Estudante sentado, com fones, mão levantada e a aula aberta no notebook.
// Ao aparecer, a aula começa no notebook, a cabeça balança no ritmo, a mão sobe e
// acena e os riscos amarelos surgem (menos de 5 s, uma vez).
// Sem animação, a cena já aparece completa.
export default function IlustracaoAluno() {
  return (
    <>
      {/* Mesa */}
      <rect className="ilustracao__base" x="14" y="118" width="212" height="8" rx="4" />
      <line className="ilustracao__apoio" x1="36" y1="126" x2="30" y2="154" />
      <line className="ilustracao__apoio" x1="204" y1="126" x2="210" y2="154" />

      {/* Livros */}
      <rect className="ilustracao__livro" x="18" y="106" width="32" height="12" rx="2" />
      <rect className="ilustracao__livro ilustracao__livro--claro" x="22" y="96" width="26" height="10" rx="2" />

      {/* Estudante: braço apoiado e tronco */}
      <line className="ilustracao__membro" x1="76" y1="98" x2="62" y2="114" />
      <rect className="ilustracao__pessoa" x="66" y="72" width="50" height="46" rx="16" />

      {/* Cabeça com fones de ouvido (balança no ritmo da aula) */}
      <g className="ilustracao__cabeca-ouvindo">
        <circle className="ilustracao__pessoa" cx="91" cy="50" r="19" />
        <path className="ilustracao__cabelo" d="M72 48 a19 19 0 0 1 38 0 q-19 -8 -38 0z" />
        <path className="ilustracao__fone-banda" d="M71 50 a20 20 0 0 1 40 0" />
        <rect className="ilustracao__fone-concha" x="65" y="44" width="9" height="17" rx="4.5" />
        <rect className="ilustracao__fone-concha" x="108" y="44" width="9" height="17" rx="4.5" />
      </g>

      {/* Notebook com a aula */}
      <rect className="ilustracao__quadro" x="146" y="62" width="64" height="49" rx="6" />
      <g className="ilustracao__surge ilustracao__atraso-1">
        <circle className="ilustracao__play" cx="178" cy="86" r="11" />
        <polygon className="ilustracao__triangulo" points="174,80 174,92 185,86" />
      </g>
      <rect className="ilustracao__base" x="138" y="111" width="80" height="7" rx="3.5" />

      {/* Mão levantada: gira a partir do ombro, acenando */}
      <line className="ilustracao__membro ilustracao__mao-levantada" x1="110" y1="88" x2="130" y2="42" />

      {/* Riscos de destaque ao lado da mão */}
      <line
        className="ilustracao__traco ilustracao__traco--destaque ilustracao__escrita ilustracao__atraso-5"
        pathLength="1"
        x1="142"
        y1="30"
        x2="150"
        y2="22"
      />
      <line
        className="ilustracao__traco ilustracao__traco--destaque ilustracao__escrita ilustracao__atraso-6"
        pathLength="1"
        x1="146"
        y1="42"
        x2="156"
        y2="40"
      />
      <line
        className="ilustracao__traco ilustracao__traco--destaque ilustracao__escrita ilustracao__atraso-7"
        pathLength="1"
        x1="136"
        y1="24"
        x2="136"
        y2="14"
      />
    </>
  )
}