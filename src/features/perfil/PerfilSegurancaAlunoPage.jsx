// src/features/perfil/PerfilSegurancaAlunoPage.jsx

import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { IconCamera, IconLock, IconShieldCheck, IconTrash } from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import Input from '../../components/ui/Input.jsx'
import UploadFoto from '../../components/ui/UploadFoto.jsx'

import {
  atualizarAluno,
  entrar,
  enviarFotoAluno,
  excluirAluno,
  excluirFotoAluno,
} from '../../services/api.js'
import { limparSessao, lerSessao } from '../../services/sessao.js'
import './PerfilSegurancaAlunoPage.css'

export default function PerfilSegurancaAlunoPage() {
  const { aluno, carregando, erro, tentarDeNovo } = useOutletContext()
  const navigate = useNavigate()
  const sessao = lerSessao()

  const [foto, setFoto] = useState(null)
  const [salvandoFoto, setSalvandoFoto] = useState(false)
  const [removendoFoto, setRemovendoFoto] = useState(false)
  const [mensagemFoto, setMensagemFoto] = useState('')
  const [erroFoto, setErroFoto] = useState('')

  const [salvandoDados, setSalvandoDados] = useState(false)
  const [mensagemDados, setMensagemDados] = useState('')
  const [erroDados, setErroDados] = useState('')

  const [excluindo, setExcluindo] = useState(false)
  const [erroExclusao, setErroExclusao] = useState('')

  async function handleSalvarFoto(evento) {
    evento.preventDefault()
    setMensagemFoto('')
    setErroFoto('')

    if (!foto) {
      setErroFoto('Escolha uma imagem antes de salvar.')
      return
    }

    setSalvandoFoto(true)
    try {
      await enviarFotoAluno(aluno.id, foto)
      setFoto(null)
      setMensagemFoto('Foto de perfil atualizada com sucesso!')
      await tentarDeNovo()
    } catch (error) {
      setErroFoto(error.message || 'Não foi possível atualizar sua foto.')
    } finally {
      setSalvandoFoto(false)
    }
  }

  async function handleRemoverFoto() {
    if (!window.confirm('Deseja realmente remover sua foto de perfil?')) return

    setErroFoto('')
    setMensagemFoto('')
    setRemovendoFoto(true)
    try {
      await excluirFotoAluno(aluno.id)
      setFoto(null)
      setMensagemFoto('Foto de perfil removida.')
      await tentarDeNovo()
    } catch (error) {
      setErroFoto(error.message || 'Não foi possível remover sua foto.')
    } finally {
      setRemovendoFoto(false)
    }
  }

  async function handleAtualizarDados(evento) {
    evento.preventDefault()
    const formularioElemento = evento.currentTarget
    const formulario = new FormData(formularioElemento)
    setMensagemDados('')
    setErroDados('')
    setSalvandoDados(true)

    const dados = {
      nome: String(formulario.get('nome') || '').trim(),
      email: aluno.email,
      senha: String(formulario.get('senha') || ''),
    }

    try {
      await atualizarAluno(aluno.id, dados)
      setMensagemDados('Seus dados foram atualizados com sucesso!')
      formularioElemento.reset()
      await tentarDeNovo()
    } catch (error) {
      setErroDados(error.message || 'Não foi possível atualizar seus dados.')
    } finally {
      setSalvandoDados(false)
    }
  }

  async function handleExcluirConta(evento) {
    evento.preventDefault()
    const formulario = evento.currentTarget.form
    const senha = String(new FormData(formulario).get('senha') || '')

    setErroExclusao('')
    if (!senha) {
      setErroExclusao('Digite sua senha no campo acima para confirmar a exclusão.')
      return
    }

    if (!window.confirm('Tem certeza de que deseja excluir sua conta? Essa ação não poderá ser desfeita.')) return

    setExcluindo(true)
    try {
      await entrar({ email: aluno.email, senha, tipo: 'ALUNO' })
      await excluirAluno(aluno.id)
      limparSessao()
      navigate('/login', { replace: true })
    } catch (error) {
      setErroExclusao(error.message || 'Senha incorreta ou não foi possível excluir sua conta.')
    } finally {
      setExcluindo(false)
    }
  }

  if (carregando) return <p role="status">Carregando os seus dados...</p>

  if (erro || !aluno) {
    return (
      <>
        <Aviso tipo="erro">{erro || 'Não foi possível carregar os dados do aluno.'}</Aviso>
        <div className="perfil__acoes">
          <Button onClick={tentarDeNovo}>Tentar de novo</Button>
        </div>
      </>
    )
  }

  return (
    <div className="perfil-seguranca-aluno">
      <title>Segurança | EnAula</title>

      <header className="perfil-seguranca-aluno__introducao">
        <span className="perfil-seguranca-aluno__icone">
          <IconShieldCheck size="1.35rem" />
        </span>

        <div>
          <h1>Segurança e conta</h1>
          <p>Gerencie sua foto, seus dados de acesso e a proteção da sua conta.</p>
        </div>
      </header>

      <CartaoSecao
        titulo="Foto do perfil"
        acao={<IconCamera size="1.3rem" aria-hidden="true" />}
      >
        <form
          onSubmit={handleSalvarFoto}
          className="perfil-seguranca-aluno__formulario"
        >
          <UploadFoto
            key={aluno.fotoUrl || aluno.foto || 'sem-foto'}
            aoMudar={setFoto}
            fotoAtual={aluno.fotoUrl || aluno.foto || null}
          />

          {mensagemFoto && <Aviso tipo="sucesso">{mensagemFoto}</Aviso>}
          {erroFoto && <Aviso tipo="erro">{erroFoto}</Aviso>}

          <div className="perfil__acoes">
            <Button
              type="submit"
              disabled={!foto || salvandoFoto || removendoFoto}
              carregando={salvandoFoto}
            >
              Salvar nova foto
            </Button>

            {(aluno.fotoUrl || aluno.foto) && (
              <Button
                type="button"
                className="perfil-seguranca-aluno__botao-secundario"
                disabled={salvandoFoto || removendoFoto}
                carregando={removendoFoto}
                onClick={handleRemoverFoto}
              >
                Remover foto
              </Button>
            )}
          </div>
        </form>
      </CartaoSecao>

      <CartaoSecao
        titulo="Dados e senha"
        acao={<IconLock size="1.3rem" aria-hidden="true" />}
      >
        <form
          onSubmit={handleAtualizarDados}
          className="perfil-seguranca-aluno__formulario"
        >
          <Input
            rotulo="Nome completo"
            name="nome"
            type="text"
            defaultValue={aluno.nome}
            required
            minLength={3}
            maxLength={100}
          />

          <Input
            rotulo="E-mail"
            name="email"
            type="email"
            defaultValue={aluno.email || sessao?.email || ''}
            disabled
          />

          <Input
            rotulo="Nova senha"
            name="senha"
            type="password"
            autoComplete="new-password"
            required
            minLength={3}
            ajuda="A senha será atualizada junto com seus dados."
          />

          {mensagemDados && <Aviso tipo="sucesso">{mensagemDados}</Aviso>}
          {erroDados && <Aviso tipo="erro">{erroDados}</Aviso>}

          <div className="perfil__acoes">
            <Button
              type="submit"
              disabled={salvandoDados || excluindo}
              carregando={salvandoDados}
            >
              Salvar alterações
            </Button>

            <Button
              type="button"
              variante="perigo"
              disabled={salvandoDados || excluindo}
              carregando={excluindo}
              onClick={handleExcluirConta}
            >
              <IconTrash size="1.1rem" aria-hidden="true" />
              Excluir minha conta
            </Button>
          </div>

          {erroExclusao && <Aviso tipo="erro">{erroExclusao}</Aviso>}
        </form>
      </CartaoSecao>
    </div>
  )
}