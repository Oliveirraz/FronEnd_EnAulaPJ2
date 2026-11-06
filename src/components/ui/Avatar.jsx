import { IconUser } from '@tabler/icons-react'
import { useState } from 'react'
import './Avatar.css'

// Foto de perfil redonda. Sem foto (src), ou se a imagem não carregar (link vencido,
// armazenamento fora do ar), mostra o ícone de pessoa.
// É decorativo: o nome da pessoa já aparece em texto ao lado.
export default function Avatar({ src, className = '' }) {
  const [falhou, setFalhou] = useState(false)

  return (
    <span className={`avatar ${className}`.trim()} aria-hidden="true">
      {src && !falhou ? (
        <img className="avatar__imagem" src={src} alt="" onError={() => setFalhou(true)} />
      ) : (
        <IconUser size="60%" />
      )}
    </span>
  )
}