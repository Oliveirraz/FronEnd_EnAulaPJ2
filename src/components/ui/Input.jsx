import { useId } from 'react'
import './Campo.css'

// icone: ícone decorativo à esquerda, dentro do campo.
// ajuda: texto de apoio abaixo do campo (ex.: valor mínimo).
// acaoFinal: botão opcional à direita, dentro do campo (ex.: mostrar senha).
export default function Input({
  rotulo,
  erro,
  ajuda,
  icone: Icone,
  acaoFinal,
  className = '',
  ref,
  ...props
}) {
  const id = useId()
  const erroId = `${id}-erro`
  const ajudaId = `${id}-ajuda`
  const descritoPor = [erro && erroId, ajuda && ajudaId].filter(Boolean).join(' ') || undefined
  const classesDoControle = [
    'campo__controle',
    Icone && 'campo__controle--com-icone',
    acaoFinal && 'campo__controle--com-acao',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`campo ${className}`.trim()}>
      <label className="campo__rotulo" htmlFor={id}>
        {rotulo}
      </label>
      <div className="campo__caixa">
        <input
          ref={ref}
          id={id}
          className={classesDoControle}
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={descritoPor}
          {...props}
        />
        {Icone && <Icone className="campo__icone" size="1.25rem" aria-hidden="true" />}
        {acaoFinal}
      </div>
      {ajuda && (
        <p id={ajudaId} className="campo__ajuda">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={erroId} className="campo__erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  )
}