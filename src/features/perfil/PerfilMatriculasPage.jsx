
import { useCallback, useEffect, useState } from 'react'

import {
  IconCheck,
  IconX,
  IconRefresh,
  IconUsers,
  IconCalendarEvent,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'

import {
  listarAulas,
  listarMatriculasAula,
  aceitarMatricula,
  recusarMatricula,
} from '../../services/api.js'

import './PerfilMatriculasPage.css'

function normalizarLista(resultado) {
  if (Array.isArray(resultado)) return resultado
  if (Array.isArray(resultado?.content)) return resultado.content
  if (Array.isArray(resultado?.data)) return resultado.data

  return []
}

function formatarData(data) {
  if (!data) return 'Data não informada'

  const valor = new Date(data)

  if (Number.isNaN(valor.getTime())) {
    return 'Data não informada'
  }

  return valor.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function rotuloStatus(status) {
  const rotulos = {
    PENDENTE: 'Pendente',
    ACEITA: 'Aceita',
    RECUSADA: 'Recusada',
    CANCELADA: 'Cancelada',
  }

  return rotulos[status] || status || 'Não informado'
}

function obterMotivoRecusa(matricula) {
  return matricula.motivoRecusa || matricula.motivo || ''
}

export default function PerfilMatriculasPage() {
  const [aulas, setAulas] = useState([])
  const [aulaSelecionada, setAulaSelecionada] = useState('')
  const [matriculas, setMatriculas] = useState([])

  const [carregandoAulas, setCarregandoAulas] = useState(true)
  const [carregandoMatriculas, setCarregandoMatriculas] = useState(false)

  const [processandoId, setProcessandoId] = useState(null)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const carregarAulas = useCallback(async () => {
    setCarregandoAulas(true)
    setErro('')

    try {
      const resultado = await listarAulas()
      const lista = normalizarLista(resultado)

      setAulas(lista)

      setAulaSelecionada((atual) => {
        if (lista.some((aula) => String(aula.id) === atual)) {
          return atual
        }

        return lista.length ? String(lista[0].id) : ''
      })
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar suas aulas.')
      setAulas([])
      setAulaSelecionada('')
    } finally {
      setCarregandoAulas(false)
    }
  }, [])

  const carregarMatriculas = useCallback(async (aulaId) => {
    if (!aulaId) {
      setMatriculas([])
      return
    }

    setCarregandoMatriculas(true)
    setErro('')
    setSucesso('')

    try {
      const resultado = await listarMatriculasAula(aulaId)

      setMatriculas(normalizarLista(resultado))
    } catch (error) {
      setMatriculas([])
      setErro(
        error.message ||
          'Não foi possível carregar as solicitações de matrícula.'
      )
    } finally {
      setCarregandoMatriculas(false)
    }
  }, [])

  useEffect(() => {
    carregarAulas()
  }, [carregarAulas])

  useEffect(() => {
    if (aulaSelecionada) {
      carregarMatriculas(aulaSelecionada)
    } else {
      setMatriculas([])
    }
  }, [aulaSelecionada, carregarMatriculas])

  async function aoAceitar(matricula) {
    const confirmou = window.confirm(
      `Deseja realmente aceitar a matrícula de ${matricula.nomeAluno}?`
    )

    if (!confirmou) return

    setErro('')
    setSucesso('')
    setProcessandoId(matricula.id)

    try {
      const atualizada = await aceitarMatricula(matricula.id)

      setMatriculas((atuais) =>
        atuais.map((item) =>
          String(item.id) === String(matricula.id)
            ? {
                ...item,
                ...atualizada,
                status: atualizada?.status || 'ACEITA',
              }
            : item
        )
      )

      setSucesso(
        `A matrícula de ${matricula.nomeAluno} foi aceita com sucesso.`
      )
    } catch (error) {
      setErro(
        error.message || 'Não foi possível aceitar a matrícula.'
      )
    } finally {
      setProcessandoId(null)
    }
  }

  async function aoRecusar(matricula) {
    // Solicita obrigatoriamente o motivo da recusa.
    const motivo = window.prompt(
      `Informe o motivo da recusa da matrícula de ${matricula.nomeAluno}:`
    )

    // Se o professor cancelar, não realiza a operação.
    if (motivo === null) return

    const motivoFormatado = motivo.trim()

    // Valida se o motivo foi informado.
    if (!motivoFormatado) {
      setErro('É obrigatório informar o motivo da recusa.')
      return
    }

    // Valida o limite de caracteres.
    if (motivoFormatado.length > 500) {
      setErro('O motivo deve ter no máximo 500 caracteres.')
      return
    }

    // Confirma a decisão do professor.
    const confirmou = window.confirm(
      `Confirma a recusa da matrícula de ${matricula.nomeAluno}?\n\nMotivo: ${motivoFormatado}`
    )

    if (!confirmou) return

    setErro('')
    setSucesso('')
    setProcessandoId(matricula.id)

    try {
      // Envia o ID da matrícula e o motivo para o backend.
      const atualizada = await recusarMatricula(
        matricula.id,
        motivoFormatado
      )

      // Atualiza os dados na tela sem perder o motivo informado.
      setMatriculas((atuais) =>
        atuais.map((item) =>
          String(item.id) === String(matricula.id)
            ? {
                ...item,
                ...atualizada,
                status: atualizada?.status || 'RECUSADA',
                motivoRecusa:
                  atualizada?.motivoRecusa ||
                  atualizada?.motivo ||
                  motivoFormatado,
              }
            : item
        )
      )

      setSucesso(
        `A matrícula de ${matricula.nomeAluno} foi recusada. O motivo foi registrado.`
      )
    } catch (error) {
      setErro(
        error.message || 'Não foi possível recusar a matrícula.'
      )
    } finally {
      setProcessandoId(null)
    }
  }

  const aulaAtual = aulas.find(
    (aula) => String(aula.id) === aulaSelecionada
  )

  const pendentes = matriculas.filter(
    (matricula) => matricula.status === 'PENDENTE'
  ).length

  const decididas = matriculas.length - pendentes

  return (
    <CartaoSecao titulo="Gerenciamento de matrículas">
      <div className="perfil-matriculas">

        <p className="perfil-matriculas__descricao">
          Visualize as solicitações de participação nas suas aulas
          e decida se deseja aceitar ou recusar cada aluno.
        </p>

        {erro && <Aviso tipo="erro">{erro}</Aviso>}

        {sucesso && <Aviso tipo="sucesso">{sucesso}</Aviso>}

        {carregandoAulas ? (
          <p role="status">Carregando suas aulas...</p>
        ) : aulas.length === 0 ? (
          <Aviso tipo="info">
            Você ainda não possui aulas cadastradas.
            Cadastre uma aula para receber solicitações de matrícula.
          </Aviso>
        ) : (
          <>
            <div className="perfil-matriculas__selecao">
              <label htmlFor="matricula-aula">
                <IconCalendarEvent size="1.2rem" />
                Selecione uma aula
              </label>

              <select
                id="matricula-aula"
                value={aulaSelecionada}
                onChange={(evento) => {
                  setAulaSelecionada(evento.target.value)
                }}
              >
                {aulas.map((aula) => (
                  <option key={aula.id} value={aula.id}>
                    {aula.materiaNome ||
                      aula.materia?.nome ||
                      `Aula ${aula.id}`}
                    {' - '}
                    {aula.data || 'Data não informada'}
                  </option>
                ))}
              </select>
            </div>

            {aulaAtual && (
              <div className="perfil-matriculas__aula">
                <strong>
                  {aulaAtual.materiaNome ||
                    aulaAtual.materia?.nome ||
                    'Aula selecionada'}
                </strong>

                <span>
                  {aulaAtual.data || 'Data não informada'}
                  {' · '}
                  {String(aulaAtual.horario || '').slice(0, 5) ||
                    'Horário não informado'}
                </span>
              </div>
            )}

            <div className="perfil-matriculas__resumo">
              <div>
                <span>Solicitações</span>
                <strong>{matriculas.length}</strong>
              </div>

              <div>
                <span>Pendentes</span>
                <strong>{pendentes}</strong>
              </div>

              <div>
                <span>Decididas</span>
                <strong>{decididas}</strong>
              </div>
            </div>

            <div className="perfil-matriculas__cabecalho">
              <h3>
                <IconUsers size="1.3rem" />
                Solicitações recebidas
              </h3>

              <Button
                variante="contorno"
                onClick={() => carregarMatriculas(aulaSelecionada)}
                disabled={carregandoMatriculas || !!processandoId}
              >
                <IconRefresh size="1.1rem" />
                Atualizar
              </Button>
            </div>

            {carregandoMatriculas ? (
              <p role="status">
                Carregando solicitações de matrícula...
              </p>
            ) : matriculas.length === 0 ? (
              <div className="perfil-matriculas__vazio">
                <IconUsers size="2.5rem" />

                <strong>Nenhuma solicitação recebida</strong>

                <p>
                  Quando um aluno solicitar participação nesta aula,
                  a solicitação aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="perfil-matriculas__lista">
                {matriculas.map((matricula) => {
                  const pendente =
                    matricula.status === 'PENDENTE'

                  const processando =
                    String(processandoId) === String(matricula.id)

                  const motivoRecusa = obterMotivoRecusa(matricula)

                  return (
                    <article
                      className="perfil-matriculas__item"
                      key={matricula.id}
                    >
                      <div className="perfil-matriculas__aluno">
                        <div className="perfil-matriculas__avatar">
                          {matricula.nomeAluno
                            ?.charAt(0)
                            .toUpperCase() || 'A'}
                        </div>

                        <div className="perfil-matriculas__dados">
                          <strong>
                            {matricula.nomeAluno ||
                              'Aluno não identificado'}
                          </strong>

                          <span>
                            {matricula.emailAluno ||
                              'E-mail não informado'}
                          </span>

                          <small>
                            Solicitação #{matricula.id}
                            {' · '}
                            {formatarData(matricula.dataSolicitacao)}
                          </small>
                        </div>
                      </div>

                      <div className="perfil-matriculas__status">
                        <span
                          className={`perfil-matriculas__selo perfil-matriculas__selo--${(
                            matricula.status || 'pendente'
                          ).toLowerCase()}`}
                        >
                          {rotuloStatus(matricula.status)}
                        </span>
                      </div>

                      {matricula.status === 'RECUSADA' && (
                        <div className="perfil-matriculas__motivo">
                          <strong>Motivo da recusa:</strong>

                          <p>
                            {motivoRecusa ||
                              'O motivo não foi disponibilizado.'}
                          </p>
                        </div>
                      )}

                      {pendente && (
                        <div className="perfil-matriculas__acoes">
                          <Button
                            disabled={!!processandoId}
                            carregando={processando}
                            onClick={() => aoAceitar(matricula)}
                          >
                            <IconCheck size="1.1rem" />
                            Aceitar
                          </Button>

                          <Button
                            variante="perigo"
                            disabled={!!processandoId}
                            onClick={() => aoRecusar(matricula)}
                          >
                            <IconX size="1.1rem" />
                            Recusar
                          </Button>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </CartaoSecao>
  )
}
