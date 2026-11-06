import { IconAlertCircle, IconCircleCheck, IconInfoCircle } from '@tabler/icons-react'
import './Aviso.css'

// Mensagem de destaque com ícone. O ícone é decorativo: o sentido está no texto.
// Erros usam role="alert" (lido na hora); sucessos e informações usam role="status" (lido com calma).
const TIPOS = {
  erro: { Icone: IconAlertCircle, role: 'alert' },
  sucesso: { Icone: IconCircleCheck, role: 'status' },
  info: { Icone: IconInfoCircle, role: 'status' },
}

export default function Aviso({ tipo = 'erro', children }) {
  const { Icone, role } = TIPOS[tipo]

  return (
    <div className={`aviso aviso--${tipo}`} role={role}>
      <Icone className="aviso__icone" size="1.25rem" aria-hidden="true" />
      <p className="aviso__texto">{children}</p>
    </div>
  )
}