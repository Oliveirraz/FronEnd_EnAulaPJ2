import './ListaDados.css'

// Pares "rótulo: valor" para mostrar dados somente para leitura.
// Valor vazio aparece como um traço.
export default function ListaDados({ itens }) {
  return (
    <dl className="lista-dados">
      {itens.map(({ rotulo, valor }) => (
        <div key={rotulo}>
          <dt className="lista-dados__rotulo">{rotulo}</dt>
          <dd className="lista-dados__valor">{valor || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}