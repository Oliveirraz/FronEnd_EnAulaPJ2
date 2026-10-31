import './CabecalhoTela.css'

// Abertura de uma tela: selo com ícone (decorativo), título e frase de apoio.
export default function CabecalhoTela({ Icone, titulo, subtitulo }) {
  return (
    <div className="cabecalho-tela">
      <span className="cabecalho-tela__selo" aria-hidden="true">
        <Icone size="1.75rem" />
      </span>
      <h1 className="cabecalho-tela__titulo">{titulo}</h1>
      {subtitulo && <p className="cabecalho-tela__subtitulo">{subtitulo}</p>}
    </div>
  )
}