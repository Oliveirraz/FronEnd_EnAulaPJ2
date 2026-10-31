import { useId } from 'react'
import './Campo.css'
import './Select.css'

// icone: ícone decorativo à esquerda, dentro do campo.
export default function Select({
  rotulo,
  erro,
  opcoes,
  icone: Icone,
  placeholder = 'Selecione',
  className = '',
  defaultValue = '',
  ref,
  ...props
}) {
  const id = useId()
  const erroId = `${id}-erro`

  return (
    <div className={`campo ${className}`.trim()}>
      <label className="campo__rotulo" htmlFor={id}>
        {rotulo}
      </label>
      <div className="campo__caixa">
        <select
          ref={ref}
          id={id}
          className={`campo__controle campo__controle--selecao${Icone ? ' campo__controle--com-icone' : ''}`}
          defaultValue={defaultValue}
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={erro ? erroId : undefined}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {opcoes.map(({ valor, texto }) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
        {Icone && <Icone className="campo__icone" size="1.25rem" aria-hidden="true" />}
      </div>
      {erro && (
        <p id={erroId} className="campo__erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  )
}