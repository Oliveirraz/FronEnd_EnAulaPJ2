
import { useEffect, useMemo, useState } from 'react'

import {
  IconDownload,
  IconFileDescription,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconSearch,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'

import {
  listarMeusMateriais,
  baixarMaterialApoio,
} from '../../services/api.js'

import './PerfilMateriaisAlunoPage.css'

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
  if (!data) {
    return 'Data não informada'
  }

  const valor = new Date(data)

  if (Number.isNaN(valor.getTime())) {
    return 'Data não informada'
  }

  return valor.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function iconeArquivo(material) {
  const ext = (material.nomeOriginal || '')
    .toLowerCase()
    .split('.')
    .pop()

  if (
    material.tipoConteudo === 'application/pdf' ||
    ext === 'pdf'
  ) {
    return IconFileTypePdf
  }

  if (['doc', 'docx'].includes(ext)) {
    return IconFileTypeDoc
  }

  return IconFileDescription
}

export default function PerfilMateriaisAlunoPage() {
  const [materiais, setMateriais] = useState([])
  const [pesquisa, setPesquisa] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [baixandoId, setBaixandoId] = useState(null)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    let ativo = true

    listarMeusMateriais()
      .then((resultado) => {
        if (ativo) {
          setMateriais(
            Array.isArray(resultado)
              ? resultado
              : resultado?.content || []
          )
        }
      })
      .catch((error) => {
        if (ativo) {
          setErro(
            error.message ||
              'Não foi possível carregar seus materiais.'
          )
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false)
        }
      })

    return () => {
      ativo = false
    }
  }, [])

  const filtrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase()

    if (!termo) {
      return materiais
    }

    return materiais.filter((material) =>
      [
        material.nomeOriginal,
        material.materiaNome,
        material.professorNome,
      ].some((valor) =>
        String(valor || '')
          .toLowerCase()
          .includes(termo)
      )
    )
  }, [materiais, pesquisa])

  async function aoBaixar(material) {
    setErro('')
    setSucesso('')
    setBaixandoId(material.id)

    try {
      await baixarMaterialApoio(
        material.id,
        material.nomeOriginal || 'material'
      )

      setSucesso(
        `Download de "${material.nomeOriginal || 'material'}" iniciado.`
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível baixar o material.'
      )
    } finally {
      setBaixandoId(null)
    }
  }

  return (
    <CartaoSecao titulo="Materiais das minhas aulas">
      <div className="materiais-aluno">
        <p className="materiais-aluno__descricao">
          Acesse e baixe os materiais disponibilizados pelos
          professores das suas aulas com matrícula aceita.
        </p>

        {erro && <Aviso tipo="erro">{erro}</Aviso>}

        {sucesso && (
          <Aviso tipo="sucesso">{sucesso}</Aviso>
        )}

        <label className="materiais-aluno__busca">
          <IconSearch
            size="1.15rem"
            aria-hidden="true"
          />

          <input
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Buscar por material, matéria ou professor"
            aria-label="Buscar materiais"
          />
        </label>

        {carregando ? (
          <p role="status">Carregando materiais...</p>
        ) : filtrados.length === 0 ? (
          <div className="materiais-aluno__vazio">
            <IconFileDescription size="2rem" />

            <p>
              {materiais.length
                ? 'Nenhum material corresponde à busca.'
                : 'Nenhum material foi disponibilizado nas suas aulas matriculadas.'}
            </p>
          </div>
        ) : (
          <ul className="materiais-aluno__lista">
            {filtrados.map((material) => {
              const Icone = iconeArquivo(material)

              return (
                <li
                  className="materiais-aluno__item"
                  key={material.id}
                >
                  <Icone
                    size="1.8rem"
                    aria-hidden="true"
                  />

                  <div className="materiais-aluno__detalhes">
                    <strong>
                      {material.nomeOriginal ||
                        'Material sem nome'}
                    </strong>

                    <span>
                      {material.materiaNome ||
                        `Aula ${material.aulaId}`}
                      {' · Professor: '}
                      {material.professorNome ||
                        'Não informado'}
                    </span>

                    <small>
                      {formatarTamanho(
                        material.tamanhoBytes
                      )}
                      {' · Disponibilizado '}
                      {formatarData(material.dataEnvio)}
                    </small>
                  </div>

                  <Button
                    disabled={baixandoId === material.id}
                    carregando={baixandoId === material.id}
                    onClick={() => aoBaixar(material)}
                  >
                    <IconDownload
                      size="1.1rem"
                      aria-hidden="true"
                    />
                    Baixar
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </CartaoSecao>
  )
}
