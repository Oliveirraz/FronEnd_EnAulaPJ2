
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  IconFileDescription,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconTrash,
  IconUpload,
  IconDownload,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import Select from '../../components/ui/Select.jsx'

import {
  excluirMaterialApoio,
  enviarMaterialAula,
  listarAulas,
  listarMateriaisDaAula,
  baixarMaterialApoio,
} from '../../services/api.js'

import './PerfilMateriaisPage.css'

const EXTENSOES_PERMITIDAS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.txt',
]

function formatarTamanho(bytes) {
  const tamanho = Number(bytes)

  if (!Number.isFinite(tamanho)) {
    return 'Tamanho indisponível'
  }

  if (tamanho < 1024) {
    return `${tamanho} B`
  }

  if (tamanho < 1024 * 1024) {
    return `${(tamanho / 1024).toFixed(1)} KB`
  }

  return `${(tamanho / (1024 * 1024)).toFixed(1)} MB`
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

function iconeDoArquivo(tipoConteudo, nome) {
  const extensao = nome?.toLowerCase().split('.').pop()

  if (tipoConteudo === 'application/pdf' || extensao === 'pdf') {
    return IconFileTypePdf
  }

  if (['doc', 'docx'].includes(extensao)) {
    return IconFileTypeDoc
  }

  return IconFileDescription
}

// Aceita respostas em formato de lista ou respostas paginadas.
function normalizarLista(resultado) {
  if (Array.isArray(resultado)) {
    return resultado
  }

  if (Array.isArray(resultado?.content)) {
    return resultado.content
  }

  if (Array.isArray(resultado?.data)) {
    return resultado.data
  }

  return []
}

export default function PerfilMateriaisPage() {
  const [aulas, setAulas] = useState([])
  const [aulaSelecionada, setAulaSelecionada] = useState('')
  const [materiais, setMateriais] = useState([])
  const [arquivo, setArquivo] = useState(null)

  const [carregandoAulas, setCarregandoAulas] = useState(true)
  const [carregandoMateriais, setCarregandoMateriais] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [removendoId, setRemovendoId] = useState(null)
  const [baixandoId, setBaixandoId] = useState(null)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const inputArquivoRef = useRef(null)

  // Carrega as aulas do professor.
  const carregarAulas = useCallback(async () => {
    setCarregandoAulas(true)
    setErro('')

    try {
      const resultado = await listarAulas()
      const lista = normalizarLista(resultado)

      setAulas(lista)

      setAulaSelecionada((atual) => {
        const aulaAindaExiste = lista.some(
          (aula) => String(aula.id) === atual,
        )

        if (atual && aulaAindaExiste) {
          return atual
        }

        return lista.length ? String(lista[0].id) : ''
      })
    } catch (error) {
      setAulas([])
      setAulaSelecionada('')
      setErro(
        error.message || 'Não foi possível carregar suas aulas.',
      )
    } finally {
      setCarregandoAulas(false)
    }
  }, [])

  // Carrega os materiais da aula selecionada.
  const carregarMateriais = useCallback(async (aulaId) => {
    if (!aulaId) {
      setMateriais([])
      return
    }

    setCarregandoMateriais(true)

    try {
      const resultado = await listarMateriaisDaAula(aulaId)
      setMateriais(normalizarLista(resultado))
    } catch (error) {
      setMateriais([])
      setErro(
        error.message ||
          'Não foi possível carregar os materiais desta aula.',
      )
    } finally {
      setCarregandoMateriais(false)
    }
  }, [])

  useEffect(() => {
    carregarAulas()
  }, [carregarAulas])

  useEffect(() => {
    if (aulaSelecionada) {
      carregarMateriais(aulaSelecionada)
    } else {
      setMateriais([])
    }
  }, [aulaSelecionada, carregarMateriais])

  // Valida a extensão do arquivo.
  function validarArquivo(selecionado) {
    if (!selecionado) {
      return 'Selecione um arquivo para enviar.'
    }

    const nome = selecionado.name.toLowerCase()

    const extensaoPermitida = EXTENSOES_PERMITIDAS.some(
      (extensao) => nome.endsWith(extensao),
    )

    if (!extensaoPermitida) {
      return 'Formato não permitido. Envie PDF, DOC, DOCX, XLS, XLSX ou TXT.'
    }

    return ''
  }

  // Envia o material.
  async function aoEnviar(evento) {
    evento.preventDefault()

    setErro('')
    setSucesso('')

    if (!aulaSelecionada) {
      setErro('Selecione uma aula antes de enviar o material.')
      return
    }

    const erroArquivo = validarArquivo(arquivo)

    if (erroArquivo) {
      setErro(erroArquivo)
      return
    }

    setEnviando(true)

    try {
      const nomeEnviado = arquivo.name

      await enviarMaterialAula(aulaSelecionada, arquivo)

      setArquivo(null)

      if (inputArquivoRef.current) {
        inputArquivoRef.current.value = ''
      }

      setSucesso(
        `Material "${nomeEnviado}" enviado com sucesso!`,
      )

      await carregarMateriais(aulaSelecionada)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível enviar o material. Tente novamente.',
      )
    } finally {
      setEnviando(false)
    }
  }

  // BAIXAR MATERIAL
  async function aoBaixar(material) {
    const nome =
      material.nomeOriginal ||
      material.nome ||
      'material'

    setErro('')
    setSucesso('')
    setBaixandoId(material.id)

    try {
      await baixarMaterialApoio(material.id, nome)

      setSucesso(
        `Download de "${nome}" iniciado.`,
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível baixar o material.',
      )
    } finally {
      setBaixandoId(null)
    }
  }

  // Exclui um material.
  async function aoRemover(material) {
    const nome =
      material.nomeOriginal ||
      material.nome ||
      'este material'

    const confirmou = window.confirm(
      `Deseja realmente remover o material "${nome}"?`,
    )

    if (!confirmou) return

    setErro('')
    setSucesso('')
    setRemovendoId(material.id)

    try {
      await excluirMaterialApoio(material.id)

      setMateriais((atuais) =>
        atuais.filter(
          (item) => String(item.id) !== String(material.id),
        ),
      )

      setSucesso('Material removido com sucesso.')
    } catch (error) {
      setErro(
        error.message || 'Não foi possível remover o material.',
      )
    } finally {
      setRemovendoId(null)
    }
  }

  const opcoesAulas = aulas
    .filter((aula) => aula.id != null)
    .map((aula) => ({
      valor: String(aula.id),
      texto: [
        aula.materiaNome ||
          aula.materia?.nome ||
          `Aula ${aula.id}`,
        aula.data || aula.dataAula || '',
      ]
        .filter(Boolean)
        .join(' — '),
    }))

  return (
    <CartaoSecao titulo="Materiais de apoio">
      <div className="perfil-materiais">
        <p className="perfil-materiais__descricao">
          Envie arquivos de apoio e associe cada material a uma das
          suas aulas. Os materiais ficam vinculados à aula selecionada.
        </p>

        {erro && <Aviso tipo="erro">{erro}</Aviso>}

        {sucesso && <Aviso tipo="sucesso">{sucesso}</Aviso>}

        {carregandoAulas ? (
          <p role="status">Carregando suas aulas...</p>
        ) : aulas.length === 0 ? (
          <Aviso tipo="info">
            Você ainda não possui aulas cadastradas. Crie uma aula
            antes de enviar materiais.
          </Aviso>
        ) : (
          <>
            <div className="perfil-materiais__selecao">
              <Select
                rotulo="Aula vinculada"
                placeholder="Selecione a aula"
                opcoes={opcoesAulas}
                value={aulaSelecionada}
                onChange={(evento) => {
                  setAulaSelecionada(evento.target.value)
                  setArquivo(null)
                  setErro('')
                  setSucesso('')

                  if (inputArquivoRef.current) {
                    inputArquivoRef.current.value = ''
                  }
                }}
              />
            </div>

            <form
              className="perfil-materiais__envio"
              onSubmit={aoEnviar}
            >
              <div className="perfil-materiais__arquivo">
                <label htmlFor="arquivo-material">
                  Arquivo de apoio
                </label>

                <input
                  ref={inputArquivoRef}
                  id="arquivo-material"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  disabled={enviando}
                  onChange={(evento) => {
                    setArquivo(evento.target.files?.[0] || null)
                    setErro('')
                    setSucesso('')
                  }}
                />

                <small>
                  Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX e TXT.
                </small>

                {arquivo && (
                  <small className="perfil-materiais__arquivo-selecionado">
                    Selecionado: {arquivo.name} (
                    {formatarTamanho(arquivo.size)})
                  </small>
                )}
              </div>

              <Button
                type="submit"
                carregando={enviando}
                disabled={!arquivo || !aulaSelecionada}
              >
                <IconUpload size="1.1rem" aria-hidden="true" />
                Enviar material
              </Button>
            </form>

            <section
              className="perfil-materiais__listagem"
              aria-labelledby="titulo-lista-materiais"
            >
              <div className="perfil-materiais__cabecalho">
                <h3 id="titulo-lista-materiais">
                  Materiais enviados
                </h3>

                <span>
                  {materiais.length}{' '}
                  {materiais.length === 1 ? 'arquivo' : 'arquivos'}
                </span>
              </div>

              {carregandoMateriais ? (
                <p role="status">Carregando materiais...</p>
              ) : materiais.length === 0 ? (
                <div className="perfil-materiais__vazio">
                  <IconFileDescription
                    size="2rem"
                    aria-hidden="true"
                  />

                  <p>
                    Nenhum material foi enviado para esta aula.
                  </p>
                </div>
              ) : (
                <ul className="perfil-materiais__lista">
                  {materiais.map((material) => {
                    const nome =
                      material.nomeOriginal ||
                      material.nome ||
                      'Material sem nome'

                    const IconeArquivo = iconeDoArquivo(
                      material.tipoConteudo || material.contentType,
                      nome,
                    )

                    return (
                      <li
                        className="perfil-materiais__item"
                        key={material.id}
                      >
                        <IconeArquivo
                          size="1.8rem"
                          aria-hidden="true"
                        />

                        <div className="perfil-materiais__detalhes">
                          <strong>{nome}</strong>

                          <span>
                            {formatarTamanho(
                              material.tamanhoBytes ??
                                material.tamanho,
                            )}
                            {' · Enviado em '}
                            {formatarData(
                              material.dataEnvio ||
                                material.createdAt,
                            )}
                          </span>
                        </div>

                        {/* BOTÃO BAIXAR */}
                        <Button
                          disabled={
                            baixandoId === material.id ||
                            removendoId === material.id ||
                            enviando
                          }
                          onClick={() => aoBaixar(material)}
                          aria-label={`Baixar ${nome}`}
                        >
                          <IconDownload
                            size="1.1rem"
                            aria-hidden="true"
                          />

                          {baixandoId === material.id
                            ? 'Baixando...'
                            : 'Baixar'}
                        </Button>

                        {/* BOTÃO REMOVER */}
                        <Button
                          variante="perigo"
                          className="perfil-materiais__remover"
                          disabled={
                            removendoId === material.id ||
                            baixandoId === material.id ||
                            enviando
                          }
                          onClick={() => aoRemover(material)}
                          aria-label={`Remover ${nome}`}
                        >
                          <IconTrash
                            size="1.1rem"
                            aria-hidden="true"
                          />
                          Remover
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </CartaoSecao>
  )
}
