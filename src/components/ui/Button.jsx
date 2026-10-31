import { IconLoader2 } from '@tabler/icons-react'
import './Button.css'

export default function Button({
  carregando = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`botao ${className}`.trim()}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      {carregando && <IconLoader2 className="botao__carregando" size="1.25rem" aria-hidden="true" />}
      {children}
    </button>
  )
}