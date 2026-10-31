import Input from '../../components/ui/Input.jsx'
import InputSenha from '../../components/ui/InputSenha.jsx'
import { IconMail, IconUser } from '@tabler/icons-react'

// Campos compartilhados por aluno e professor (mesmas regras do back end).
export default function CamposComuns({ register, errors, getValues }) {
  return (
    <>
      <Input
        rotulo="Nome completo"
        icone={IconUser}
        className="campo--largo"
        autoComplete="name"
        erro={errors.nome?.message}
        {...register('nome', {
          required: 'Informe seu nome.',
          validate: (valor) =>
            valor.trim().length >= 3 || 'O nome deve ter no mínimo 3 caracteres.',
          maxLength: { value: 100, message: 'O nome deve ter no máximo 100 caracteres.' },
        })}
      />

      <Input
        rotulo="E-mail"
        icone={IconMail}
        type="email"
        className="campo--largo"
        autoComplete="email"
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
        autoComplete="new-password"
        erro={errors.senha?.message}
        {...register('senha', {
          required: 'Crie uma senha.',
          minLength: { value: 3, message: 'A senha deve ter no mínimo 3 caracteres.' },
        })}
      />

      <InputSenha
        rotulo="Confirmar senha"
        autoComplete="new-password"
        erro={errors.confirmarSenha?.message}
        {...register('confirmarSenha', {
          required: 'Repita a senha.',
          validate: (valor) => valor === getValues('senha') || 'As senhas não coincidem.',
        })}
      />

      <Input
        rotulo="Confirmar senha"
        type="password"
        autoComplete="new-password"
        erro={errors.confirmarSenha?.message}
        {...register('confirmarSenha', {
          required: 'Repita a senha.',
          validate: (valor) => valor === getValues('senha') || 'As senhas não coincidem.',
        })}
      />
    </>
  )
}