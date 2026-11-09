
import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'

import { TITULACOES } from '../../constants/titulacoes.js'

import {
  atualizarProfessor,
  entrar,
  excluirProfessor,
} from '../../services/api.js'

import { limparSessao } from '../../services/sessao.js'

export default function PerfilSegurancaPage() {
  const { professor, carregando, erro, tentarDeNovo } = useOutletContext()
  const navigate = useNavigate()

  // Estados da atualização dos dados.
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erroFormulario, setErroFormulario] = useState('')

  // Estados da exclusão da conta.
  const [excluindo, setExcluindo] = useState(false)
  const [erroExclusao, setErroExclusao] = useState('')

  // Atualiza os dados do professor.
  async function handleAtualizar(event) {
    const formularioElemento = event.currentTarget
    event.preventDefault()

    setMensagem('')
    setErroFormulario('')
    setSalvando(true)

    const formulario = new FormData(formularioElemento)

    const dados = {
      nome: formulario.get('nome').trim(),
      email: professor.email,
      titulacao: formulario.get('titulacao'),
      valorHoraAula: Number(formulario.get('valorHoraAula')),
      senha: formulario.get('senha'),
    }

    try {
      await atualizarProfessor(professor.id, dados)

      setMensagem('Seus dados foram atualizados com sucesso!')
      formularioElemento.reset()

      await tentarDeNovo()
    } catch (erro) {
      setErroFormulario(
        erro.message || 'Não foi possível atualizar seus dados.'
      )
    } finally {
      setSalvando(false)
    }
  }

  // Valida a senha digitada e exclui a conta.
  async function handleExcluir(event) {
    const formularioElemento = event.currentTarget.form
    const formulario = new FormData(formularioElemento)
    const senha = formulario.get('senha')

    setErroExclusao('')
    
    if (!senha) {
      setErroExclusao('Digite sua senha antes de excluir a conta.')
      return
    }

    setExcluindo(true)

    try {
      // Verifica se a senha está correta.
      await entrar({
        email: professor.email,
        senha,
        tipo: 'PROFESSOR',
      })

      // Exclui a conta.
      await excluirProfessor(professor.id)

      // Encerra a sessão e redireciona para o login.
      limparSessao()
      navigate('/login', { replace: true })
    } catch (erro) {
      setErroExclusao(
        erro.message || 'Senha incorreta ou não foi possível excluir sua conta.'
      )
    } finally {
      setExcluindo(false)
    }
  }

  if (carregando) {
    return <p role="status">Carregando os seus dados...</p>
  }

  if (erro || !professor) {
    return (
      <Aviso tipo="erro">
        {erro || 'Não foi possível carregar os dados do professor.'}
      </Aviso>
    )
  }

  return (
    <>
      <title>Segurança | EnAula</title>

      <CartaoSecao titulo="Atualizar dados da conta">
        <form
          className="perfil-seguranca__formulario"
          onSubmit={handleAtualizar}
        >
          <Input
            rotulo="Nome completo"
            name="nome"
            type="text"
            defaultValue={professor.nome}
            required
            minLength={3}
            maxLength={100}
          />

          <Input
            rotulo="E-mail"
            name="email"
            type="email"
            defaultValue={professor.email}
            disabled
          />

          <Select
            rotulo="Titulação"
            name="titulacao"
            opcoes={TITULACOES}
            defaultValue={professor.titulacao}
            required
          />

          <Input
            rotulo="Valor da hora-aula"
            name="valorHoraAula"
            type="number"
            defaultValue={professor.valorHoraAula}
            min="0"
            step="0.01"
            required
          />

          <Input
            rotulo="Senha para confirmar as alterações"
            name="senha"
            type="password"
            autoComplete="current-password"
            required
            minLength={3}
          />

          {mensagem && (
            <Aviso tipo="sucesso">{mensagem}</Aviso>
          )}

          {erroFormulario && (
            <Aviso tipo="erro">{erroFormulario}</Aviso>
          )}

          {erroExclusao && (
            <Aviso tipo="erro">{erroExclusao}</Aviso>
          )}

          <div className="perfil__acoes">
            <Button
              type="submit"
              disabled={salvando || excluindo}
              carregando={salvando}
            >
              Salvar alterações
            </Button>

            <Button
              type="button"
              variante="perigo"
              disabled={salvando || excluindo}
              carregando={excluindo}
              onClick={handleExcluir}
            >
              Excluir minha conta
            </Button>
          </div>
        </form>
      </CartaoSecao>
    </>
  )
}
