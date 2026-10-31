import { IconCamera, IconUser } from '@tabler/icons-react'
import { useEffect, useId, useRef, useState } from 'react'
import './UploadFoto.css'

// Mesmas regras do back end: JPG, PNG ou WEBP, até 2 MB.
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']
const TAMANHO_MAXIMO = 2 * 1024 * 1024

export default function UploadFoto({ aoMudar }) {
  const id = useId()
  const ajudaId = `${id}-ajuda`
  const erroId = `${id}-erro`
  const entradaRef = useRef(null)
  const [previa, setPrevia] = useState(null)
  const [erro, setErro] = useState('')

  // Libera a URL temporária da pré-visualização quando ela troca ou some.
  useEffect(() => {
    return () => {
      if (previa) URL.revokeObjectURL(previa)
    }
  }, [previa])

  function descartar(mensagem = '') {
    setErro(mensagem)
    setPrevia(null)
    aoMudar(null)
    if (entradaRef.current) entradaRef.current.value = ''
  }

  function aoEscolherArquivo(evento) {
    const arquivo = evento.target.files[0]

    if (!arquivo) {
      descartar()
      return
    }
    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      descartar('Use uma imagem JPG, PNG ou WEBP.')
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      descartar('A imagem deve ter no máximo 2 MB.')
      return
    }

    setErro('')
    setPrevia(URL.createObjectURL(arquivo))
    aoMudar(arquivo)
  }

  return (
    <div className="upload-foto">
      {/* O avatar é um atalho para mouse e toque. Teclado e leitor de tela
          usam o campo de arquivo ao lado, por isso ele fica fora da tabulação. */}
      <button
        type="button"
        className="upload-foto__avatar"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => entradaRef.current?.click()}
      >
        <span className="upload-foto__previa">
          {previa ? <img src={previa} alt="" /> : <IconUser size="2.5rem" />}
        </span>
        <span className="upload-foto__camera">
          <IconCamera size="0.95rem" />
        </span>
      </button>

      <div className="upload-foto__corpo">
        <label className="upload-foto__rotulo" htmlFor={id}>
          Foto de perfil (opcional)
        </label>
        <input
          ref={entradaRef}
          id={id}
          className="upload-foto__entrada"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={aoEscolherArquivo}
          aria-describedby={erro ? `${ajudaId} ${erroId}` : ajudaId}
        />
        <p id={ajudaId} className="upload-foto__ajuda">
          JPG, PNG ou WEBP, até 2 MB.
        </p>
        {erro && (
          <p id={erroId} className="upload-foto__erro" role="alert">
            {erro}
          </p>
        )}
        {previa && (
          <button type="button" className="upload-foto__remover" onClick={() => descartar()}>
            Remover foto
          </button>
        )}
      </div>
    </div>
  )
}