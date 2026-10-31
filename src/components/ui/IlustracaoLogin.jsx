// Tela de login com avatar e campos, ao lado de uma chave: acessar a conta.
// Ao aparecer, o avatar surge, o e-mail é "digitado", a senha ganha pontinhos, o botão
// é apertado, um selo de confirmação aparece e a chave gira, como se destrancasse
// (menos de 5 s, uma vez). Sem animação, a cena já aparece completa.
export default function IlustracaoLogin() {
  return (
    <>
      {/* Tela */}
      <rect className="ilustracao__quadro" x="40" y="10" width="130" height="108" rx="8" />

      {/* Avatar */}
      <g className="ilustracao__surge ilustracao__atraso-1">
        <circle className="ilustracao__pessoa" cx="105" cy="38" r="12" />
        <path className="ilustracao__pessoa" d="M84 70 q0 -14 21 -14 q21 0 21 14 z" />
      </g>

      {/* Selo de confirmação */}
      <g className="ilustracao__surge ilustracao__atraso-9">
        <circle className="ilustracao__selo" cx="126" cy="52" r="8" />
        <path className="ilustracao__selo-visto" d="M122 52 l3 3 l5 -6" />
      </g>

      {/* Campo de e-mail, com o texto "digitado" */}
      <rect className="ilustracao__campo" x="62" y="76" width="86" height="9" rx="4.5" />
      <line
        className="ilustracao__texto-campo ilustracao__digitar"
        pathLength="1"
        x1="68"
        y1="80.5"
        x2="122"
        y2="80.5"
      />

      {/* Campo de senha, com os pontinhos */}
      <rect className="ilustracao__campo" x="62" y="90" width="86" height="9" rx="4.5" />
      <g className="ilustracao__pontos">
        <circle className="ilustracao__ponto" cx="70" cy="94.5" r="2" />
        <circle className="ilustracao__ponto" cx="78" cy="94.5" r="2" />
        <circle className="ilustracao__ponto" cx="86" cy="94.5" r="2" />
        <circle className="ilustracao__ponto" cx="94" cy="94.5" r="2" />
        <circle className="ilustracao__ponto" cx="102" cy="94.5" r="2" />
      </g>

      {/* Botão (é apertado) */}
      <rect className="ilustracao__botao ilustracao__apertar" x="62" y="104" width="86" height="9" rx="4.5" />

      {/* Suporte */}
      <rect className="ilustracao__base" x="96" y="118" width="18" height="12" />
      <rect className="ilustracao__base" x="72" y="130" width="66" height="7" rx="3.5" />

      {/* Chave (gira a partir do centro) */}
      <g className="ilustracao__chave-girando">
        <circle className="ilustracao__chave" cx="204" cy="52" r="15" />
        <line className="ilustracao__chave" x1="204" y1="67" x2="204" y2="128" />
        <line className="ilustracao__chave" x1="204" y1="108" x2="218" y2="108" />
        <line className="ilustracao__chave" x1="204" y1="122" x2="214" y2="122" />
      </g>
    </>
  )
}