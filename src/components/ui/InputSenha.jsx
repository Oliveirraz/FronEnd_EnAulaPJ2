import { IconEye, IconEyeOff, IconLock } from '@tabler/icons-react'
import { useState } from 'react'
import Input from './Input.jsx'

// Campo de senha com cadeado e botão para mostrar ou ocultar o que foi digitado.
export default function InputSenha(props) {
  const [visivel, setVisivel] = useState(false)

  return (
    <Input
      {...props}
      type={visivel ? 'text' : 'password'}
      icone={IconLock}
      acaoFinal={
        <button
          type="button"
          className="campo__acao"
          aria-label="Mostrar senha"
          aria-pressed={visivel}
          onClick={() => setVisivel((atual) => !atual)}
        >
          {visivel ? <IconEyeOff size="1.25rem" /> : <IconEye size="1.25rem" />}
        </button>
      }
    />
  )
}