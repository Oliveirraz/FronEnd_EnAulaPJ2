
import { useCallback, useEffect, useMemo, useState } from 'react'
import { IconMapPin, IconSearch, IconX } from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import { buscarAulas } from '../../services/api.js'
import { formatarMoeda } from '../../utils/formatadores.js'

import './BuscaAulasPage.css'

const FILTROS_INICIAIS = {
  materiaId: '',
  professorId: '',
  valorMinimo: '',
  valorMaximo: '',
  modalidade: '',
}

const OPCOES_MODALIDADE = [
  { valor: 'PRESENCIAL', texto: 'Presencial' },
  { valor: 'ONLINE', texto: 'Online' },
]

function formatarData(data) {
  if (!data) return 'Data não informada'

  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarHorario(horario) {
  return horario ? horario.slice(0, 5) : 'Horário não informado'
}

export default function BuscaAulasPage() {
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS)
  const [resultados, setResultados] = useState([])
  const [catalogoInicial, setCatalogoInicial] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  const carregarAulas = useCallback(
    async (filtrosAplicados = FILTROS_INICIAIS, atualizarCatalogo = false) => {
      setCarregando(true)
      setErro('')
      setMensagem('')

      try {
        const resposta = await buscarAulas(filtrosAplicados)

        const lista = Array.isArray(resposta?.resultados)
          ? resposta.resultados
          : []

        setResultados(lista)

        if (atualizarCatalogo) {
          setCatalogoInicial(lista)
        }

        setMensagem(
          resposta?.mensagem ||
            (lista.length
              ? 'Aulas encontradas com sucesso.'
              : 'Nenhuma aula encontrada para os filtros aplicados.')
        )
      } catch (error) {
        setResultados([])
        setErro(
          error.message ||
            'Não foi possível buscar as aulas. Tente novamente.'
        )
      } finally {
        setCarregando(false)
      }
    },
    []
  )

  // Ao abrir a tela, carrega as aulas disponíveis para montar os filtros.
  useEffect(() => {
    Promise.resolve().then(() =>
      carregarAulas(FILTROS_INICIAIS, true)
    )
  }, [carregarAulas])

  // Matérias disponíveis nas aulas encontradas na busca inicial.
  const opcoesMaterias = useMemo(() => {
    const materias = new Map()

    catalogoInicial.forEach((aula) => {
      if (aula.materiaId != null && aula.materia) {
        materias.set(String(aula.materiaId), aula.materia)
      }
    })

    return [...materias.entries()]
      .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
      .map(([valor, texto]) => ({ valor, texto }))
  }, [catalogoInicial])

  // Professores disponíveis nas aulas encontradas na busca inicial.
  const opcoesProfessores = useMemo(() => {
    const professores = new Map()

    catalogoInicial.forEach((aula) => {
      if (aula.professorId != null && aula.nomeProfessor) {
        professores.set(String(aula.professorId), aula.nomeProfessor)
      }
    })

    return [...professores.entries()]
      .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
      .map(([valor, texto]) => ({ valor, texto }))
  }, [catalogoInicial])

  function alterarFiltro(campo, valor) {
    setFiltros((atuais) => ({
      ...atuais,
      [campo]: valor,
    }))
  }

  function aplicarFiltros(evento) {
    evento.preventDefault()

    if (
      filtros.valorMinimo !== '' &&
      filtros.valorMaximo !== '' &&
      Number(filtros.valorMinimo) > Number(filtros.valorMaximo)
    ) {
      setErro('O valor mínimo não pode ser maior que o valor máximo.')
      return
    }

    carregarAulas(filtros)
  }

  function limparFiltros() {
    setFiltros(FILTROS_INICIAIS)
    carregarAulas(FILTROS_INICIAIS, true)
  }

  const raioDescricao =
    filtros.modalidade === 'PRESENCIAL'
      ? 'Raio aplicado: 5 km'
      : filtros.modalidade === 'ONLINE'
        ? 'Raio aplicado: 100 km'
        : 'Raio automático: 5 km para presenciais e 100 km para online'

  return (
    <>
      <title>Buscar aulas | EnAula</title>

      <main className="busca-aulas">
        <CartaoSecao titulo="Encontre sua aula">
          <div className="busca-aulas__conteudo">
            <p className="busca-aulas__descricao">
              Encontre aulas e monitores de acordo com a matéria, o valor e a
              modalidade que você procura.
            </p>

            {erro && <Aviso tipo="erro">{erro}</Aviso>}

            <form
              className="busca-aulas__filtros"
              onSubmit={aplicarFiltros}
            >
              <Select
                rotulo="Matéria"
                placeholder="Todas as matérias"
                opcoes={opcoesMaterias}
                value={filtros.materiaId}
                onChange={(evento) =>
                  alterarFiltro('materiaId', evento.target.value)
                }
              />

              <Select
                rotulo="Professor"
                placeholder="Todos os professores"
                opcoes={opcoesProfessores}
                value={filtros.professorId}
                onChange={(evento) =>
                  alterarFiltro('professorId', evento.target.value)
                }
              />

              <Input
                rotulo="Valor mínimo (R$)"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex.: 30,00"
                value={filtros.valorMinimo}
                onChange={(evento) =>
                  alterarFiltro('valorMinimo', evento.target.value)
                }
              />

              <Input
                rotulo="Valor máximo (R$)"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex.: 100,00"
                value={filtros.valorMaximo}
                onChange={(evento) =>
                  alterarFiltro('valorMaximo', evento.target.value)
                }
              />

              <Select
                rotulo="Modalidade"
                placeholder="Todas as modalidades"
                opcoes={OPCOES_MODALIDADE}
                value={filtros.modalidade}
                onChange={(evento) =>
                  alterarFiltro('modalidade', evento.target.value)
                }
              />

              <div className="busca-aulas__raio">
                <IconMapPin size="1.2rem" aria-hidden="true" />
                <span>{raioDescricao}</span>
              </div>

              <div className="busca-aulas__acoes">
                <Button type="submit" carregando={carregando}>
                  <IconSearch size="1.1rem" aria-hidden="true" />
                  Buscar aulas
                </Button>

                <Button
                  type="button"
                  onClick={limparFiltros}
                  disabled={carregando}
                >
                  <IconX size="1.1rem" aria-hidden="true" />
                  Limpar filtros
                </Button>
              </div>
            </form>

            <section
              className="busca-aulas__resultados"
              aria-labelledby="titulo-resultados"
            >
              <div className="busca-aulas__cabecalho">
                <h2 id="titulo-resultados">Resultados da busca</h2>

                {!carregando && (
                  <span>
                    {resultados.length}{' '}
                    {resultados.length === 1
                      ? 'aula encontrada'
                      : 'aulas encontradas'}
                  </span>
                )}
              </div>

              {carregando && (
                <p role="status">Buscando aulas disponíveis...</p>
              )}

              {!carregando && !erro && resultados.length === 0 && (
                <Aviso tipo="info">
                  {mensagem ||
                    'Nenhuma aula encontrada. Experimente alterar os filtros.'}
                </Aviso>
              )}

              {!carregando && resultados.length > 0 && (
                <div className="busca-aulas__lista">
                  {resultados.map((aula) => (
                    <article
                      className="busca-aulas__card"
                      key={aula.aulaId}
                    >
                      <div className="busca-aulas__card-topo">
                        <div>
                          <h3>{aula.materia}</h3>

                          <p className="busca-aulas__professor">
                            Monitor: {aula.nomeProfessor}
                          </p>
                        </div>

                        <strong className="busca-aulas__preco">
                          {formatarMoeda(aula.valorHoraAula)}
                          <small>/ hora</small>
                        </strong>
                      </div>

                      <div className="busca-aulas__dados">
                        <span>
                          Avaliação média:{' '}
                          {aula.avaliacaoMedia == null
                            ? 'Ainda sem avaliações'
                            : `${Number(aula.avaliacaoMedia).toFixed(1)} / 5`}
                        </span>

                        <span>
                          Distância:{' '}
                          {aula.distanciaKm == null
                            ? 'Não informada'
                            : `${Number(aula.distanciaKm).toFixed(1)} km`}
                        </span>

                        <span>
                          Modalidade:{' '}
                          {aula.modalidade === 'PRESENCIAL'
                            ? 'Presencial'
                            : 'Online'}
                        </span>

                        <span>Data: {formatarData(aula.data)}</span>

                        <span>
                          Horário: {formatarHorario(aula.horario)}
                        </span>

                        <span>
                          Duração: {aula.duracao}{' '}
                          {aula.duracao === 1 ? 'hora' : 'horas'}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </CartaoSecao>
      </main>
    </>
  )
}
