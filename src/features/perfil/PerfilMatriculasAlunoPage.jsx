
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconRefresh,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconBook2,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import { listarMinhasMatriculas } from '../../services/api.js'

import './PerfilMatriculasAlunoPage.css'

function normalizarLista(resultado) {
  if (Array.isArray(resultado)) return resultado
  if (Array.isArray(resultado?.content)) return resultado.content
  if (Array.isArray(resultado?.data)) return resultado.data
  if (Array.isArray(resultado?.matriculas)) return resultado.matriculas
  if (Array.isArray(resultado?.resultados)) return resultado.resultados
  return []
}

function statusNormalizado(status) {
  const valor = String(status || '').toUpperCase()

  if (['ACEITA', 'APROVADA', 'APROVADO', 'CONFIRMADA'].includes(valor)) {
    return 'ACEITA'
  }

  if (['RECUSADA', 'REJEITADA', 'REJEITADO'].includes(valor)) {
    return 'RECUSADA'
  }

  if (['CANCELADA', 'CANCELADO'].includes(valor)) {
    return 'CANCELADA'
  }

  return 'PENDENTE'
}

function rotuloStatus(status) {
  return ({
    PENDENTE: 'Pendente',
    ACEITA: 'Matrícula aceita',
    RECUSADA: 'Matrícula recusada',
    CANCELADA: 'Cancelada',
  })[status] || 'Pendente'
}

function formatarData(valor) {
  if (!valor) return 'Data não informada'

  const data = new Date(`${String(valor).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(data.getTime())) return String(valor)

  return data.toLocaleDateString('pt-BR')
}


function dadosAula(matricula) {
  const aula = matricula.aula || matricula.dadosAula || {}

  return {
    materia:
      matricula.materiaNome ||
      (typeof matricula.materia === 'string'
        ? matricula.materia
        : matricula.materia?.nome) ||
      aula.materiaNome ||
      (typeof aula.materia === 'string'
        ? aula.materia
        : aula.materia?.nome) ||
      'Matéria não informada',

    professor:
      matricula.nomeProfessor ||
      matricula.professorNome ||
      aula.nomeProfessor ||
      aula.professor?.nome ||
      'Professor não informado',

    data: matricula.dataAula || matricula.data || aula.data,

    horario: matricula.horario || aula.horario,

    modalidade: matricula.modalidade || aula.modalidade,

    valor:
      matricula.valorAula ??
      matricula.valorHoraAula ??
      matricula.valor ??
      aula.valorAula ??
      aula.valorHoraAula ??
      aula.valor,
  }
}


function formatarValor(valor) {
  if (valor == null || valor === '') {
    return 'Valor não informado'
  }

  const numero = Number(valor)

  return Number.isNaN(numero)
    ? String(valor)
    : numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
}

function dataSolicitacao(matricula) {
  return (
    matricula.dataSolicitacao ||
    matricula.createdAt ||
    matricula.dataCriacao
  )
}

export default function PerfilMatriculasAlunoPage() {
  const [matriculas, setMatriculas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [erro, setErro] = useState('')

  const carregarMatriculas = useCallback(async (silencioso = false) => {
    if (silencioso) {
      setAtualizando(true)
    } else {
      setCarregando(true)
    }

    setErro('')

    try {
      const resposta = await listarMinhasMatriculas()

      const lista = normalizarLista(resposta).map((item) => ({
        ...item,
        statusExibicao: statusNormalizado(item.status),
      }))

      lista.sort((a, b) => {
        const dataA = new Date(dataSolicitacao(a) || 0).getTime()
        const dataB = new Date(dataSolicitacao(b) || 0).getTime()

        return dataB - dataA
      })

      setMatriculas(lista)
    } catch (error) {
      setErro(
        error.message ||
        'Não foi possível consultar suas matrículas. Tente novamente.'
      )
    } finally {
      setCarregando(false)
      setAtualizando(false)
    }
  }, [])

  useEffect(() => {
    carregarMatriculas()

    // Atualiza automaticamente a situação da matrícula.
    const intervalo = window.setInterval(() => {
      carregarMatriculas(true)
    }, 30000)

    return () => window.clearInterval(intervalo)
  }, [carregarMatriculas])

  const resumo = useMemo(() => {
    return matriculas.reduce((total, item) => {
      total[item.statusExibicao] =
        (total[item.statusExibicao] || 0) + 1

      return total
    }, {})
  }, [matriculas])

  return (
    <>
      <title>Minhas matrículas | EnAula</title>

      <main className="matriculas-aluno">
        <CartaoSecao titulo="Minhas matrículas">

          <div className="matriculas-aluno__conteudo">

            <p className="matriculas-aluno__descricao">
              Acompanhe suas solicitações e veja quando o professor
              confirmar ou recusar sua participação nas aulas.
            </p>

            {erro && <Aviso tipo="erro">{erro}</Aviso>}

            <div className="matriculas-aluno__cabecalho">

              <div
                className="matriculas-aluno__resumo"
                aria-live="polite"
              >
                <span>
                  <strong>{matriculas.length}</strong> solicitações
                </span>

                <span>
                  <strong>{resumo.PENDENTE || 0}</strong> pendentes
                </span>

                <span>
                  <strong>{resumo.ACEITA || 0}</strong> aceitas
                </span>

                <span>
                  <strong>{resumo.RECUSADA || 0}</strong> recusadas
                </span>
              </div>

              <Button
                variante="contorno"
                onClick={() => carregarMatriculas(true)}
                disabled={carregando || atualizando}
                carregando={atualizando}
              >
                <IconRefresh size="1.1rem" />
                Atualizar status
              </Button>

            </div>

            {carregando ? (
              <p role="status">
                Carregando suas solicitações...
              </p>
            ) : matriculas.length === 0 ? (

              <div className="matriculas-aluno__vazio">

                <IconBook2 size="2.5rem" />

                <strong>
                  Você ainda não solicitou matrícula.
                </strong>

                <p>
                  Quando solicitar participação em uma aula,
                  ela aparecerá aqui com o status Pendente.
                </p>

                <Link to="/aluno/perfil/buscar-aulas">
                  Buscar aulas disponíveis
                </Link>

              </div>

            ) : (

              <div className="matriculas-aluno__lista">

                {matriculas.map((matricula) => {

                  const aula = dadosAula(matricula)
                  const status = matricula.statusExibicao

                  const StatusIcone =
                    status === 'ACEITA'
                      ? IconCircleCheck
                      : status === 'RECUSADA'
                        ? IconCircleX
                        : IconClock

                  const motivo =
                    matricula.motivoRecusa ||
                    matricula.motivo ||
                    matricula.justificativaRecusa

                  return (

                    <article
                      className="matriculas-aluno__item"
                      key={
                        matricula.id ??
                        `${matricula.aulaId}-${dataSolicitacao(matricula)}`
                      }
                    >

                      <div className="matriculas-aluno__topo">

                        <div>
                          <h3>{aula.materia}</h3>

                          <p>
                            Professor: {aula.professor}
                          </p>
                        </div>

                        <span
                          className={`matriculas-aluno__status matriculas-aluno__status--${status.toLowerCase()}`}
                        >
                          <StatusIcone size="1.1rem" />
                          {rotuloStatus(status)}
                        </span>

                      </div>

                      <div className="matriculas-aluno__detalhes">

                        <span>
                          <strong>Data:</strong>{' '}
                          {formatarData(aula.data)}
                        </span>

                        <span>
                          <strong>Horário:</strong>{' '}
                          {aula.horario
                            ? String(aula.horario).slice(0, 5)
                            : 'Não informado'}
                        </span>

                        <span>
                          <strong>Modalidade:</strong>{' '}
                          {aula.modalidade === 'ONLINE'
                            ? 'Online'
                            : aula.modalidade === 'PRESENCIAL'
                              ? 'Presencial'
                              : 'Não informada'}
                        </span>

                        <span>
                          <strong>Valor:</strong>{' '}
                          {formatarValor(aula.valor)}
                        </span>

                        <span>
                          <strong>Solicitada em:</strong>{' '}
                          {dataSolicitacao(matricula)
                            ? new Date(
                                dataSolicitacao(matricula)
                              ).toLocaleString('pt-BR')
                            : 'Data não informada'}
                        </span>

                      </div>

                      {status === 'PENDENTE' && (
                        <p className="matriculas-aluno__mensagem matriculas-aluno__mensagem--pendente">
                          Sua solicitação foi enviada e está
                          aguardando a análise do professor.
                        </p>
                      )}

                      {status === 'ACEITA' && (
                        <p className="matriculas-aluno__mensagem matriculas-aluno__mensagem--aceita">
                          Boa notícia! O professor aceitou sua
                          matrícula. Você já pode se preparar para a aula.
                        </p>
                      )}

                      {status === 'RECUSADA' && (
                        <div className="matriculas-aluno__mensagem matriculas-aluno__mensagem--recusada">

                          <strong>
                            O professor recusou sua solicitação.
                          </strong>

                          {motivo && (
                            <p>Motivo: {motivo}</p>
                          )}

                        </div>
                      )}

                    </article>
                  )
                })}

              </div>
            )}

          </div>
        </CartaoSecao>
      </main>
    </>
  )
}
