import './GrupoOpcoes.css'

// Grupo de botões de opção (radio) em um fieldset, para escolher uma entre poucas.
// Cada opção pode ter um ícone (Icone), que é só decorativo.
export default function GrupoOpcoes({ legenda, opcoes, name, ref, ...props }) {
  return (
    <fieldset className="grupo-opcoes">
      <legend className="grupo-opcoes__legenda">{legenda}</legend>
      <div className="grupo-opcoes__lista">
        {opcoes.map(({ valor, texto, Icone }) => (
          <label key={valor} className="grupo-opcoes__opcao">
            <input
              className="grupo-opcoes__entrada"
              type="radio"
              name={name}
              value={valor}
              ref={ref}
              {...props}
            />
            <span className="grupo-opcoes__cartao">
              {Icone && (
                <span className="grupo-opcoes__icone" aria-hidden="true">
                  <Icone size="1.25rem" />
                </span>
              )}
              <span className="grupo-opcoes__texto">{texto}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}