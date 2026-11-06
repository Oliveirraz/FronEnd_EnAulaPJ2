import { IconLoader2 } from '@tabler/icons-react'
import './Button.css'

export default function Button({
  carregando = false,
  disabled = false,
  variante = 'primario',
  type = 'button',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={['botao', variante !== 'primario' && `botao--${variante}`, className]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      {carregando && <IconLoader2 className="botao__carregando" size="1.25rem" aria-hidden="true" />}
      {children}
    </button>
  )
}