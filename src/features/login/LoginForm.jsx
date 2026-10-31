import { IconChalkboard, IconSchool } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import Aviso from '../../components/ui/Aviso.jsx'
import InputSenha from '../../components/ui/InputSenha.jsx'
import Button from '../../components/ui/Button.jsx'
import GrupoOpcoes from '../../components/ui/GrupoOpcoes.jsx'
import Input from '../../components/ui/Input.jsx'
import useLogin from '../../hooks/useLogin.js'
import './LoginPage.css'

// Valores aceitos pelo back end no campo "tipo".
const TIPOS_DE_CONTA = [
  { valor: 'ALUNO', texto: 'Aluno', Icone: IconSchool },
  { valor: 'PROFESSOR', texto: 'Professor', Icone: IconChalkboard },
]

const VALORES_INICIAIS = { tipo: 'ALUNO', email: '', senha: '' }

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched', defaultValues: VALORES_INICIAIS })
  const { enviar, erroServidor } = useLogin()

  // Retornar a promessa mantém isSubmitting ativo enquanto o envio acontece.
  function aoEnviar({ tipo, email, senha }) {
    return enviar({ tipo, email: email.trim(), senha })
  }

  return (
    <form className="login__formulario" onSubmit={handleSubmit(aoEnviar)} noValidate>
      <GrupoOpcoes legenda="Entrar como" opcoes={TIPOS_DE_CONTA} {...register('tipo')} />

            <div className="login__campos">
        <Input
          rotulo="E-mail"
          type="email"
          autoComplete="username"
          erro={errors.email?.message}
          {...register('email', {
            required: 'Informe seu e-mail.',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Informe um e-mail válido.',
            },
          })}
        />

        <InputSenha
          rotulo="Senha"
          autoComplete="current-password"
          erro={errors.senha?.message}
          {...register('senha', { required: 'Informe sua senha.' })}
        />
      </div>

      {erroServidor && <Aviso tipo="erro">{erroServidor}</Aviso>}

      <Button type="submit" carregando={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}