import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import UploadFoto from '../../components/ui/UploadFoto.jsx'
import useCadastro from '../../hooks/useCadastro.js'
import { cadastrarAluno } from '../../services/api.js'
import CamposComuns from './CamposComuns.jsx'
import './Formulario.css'

const VALORES_INICIAIS = { nome: '', email: '', senha: '', confirmarSenha: '' }

export default function AlunoForm() {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched', defaultValues: VALORES_INICIAIS })
  const [foto, setFoto] = useState(null)
  const { enviar, erroServidor } = useCadastro(cadastrarAluno, setError)

  // Retornar a promessa mantém isSubmitting ativo enquanto o envio acontece.
  function aoEnviar({ nome, email, senha }) {
    return enviar({ nome: nome.trim(), email: email.trim(), senha }, foto)
  }

  return (
    <form className="formulario" onSubmit={handleSubmit(aoEnviar)} noValidate>
      <UploadFoto aoMudar={setFoto} />

      <div className="formulario__campos">
        <CamposComuns register={register} errors={errors} getValues={getValues} />
      </div>

      {erroServidor && <Aviso tipo="erro">{erroServidor}</Aviso>}

      <Button type="submit" carregando={isSubmitting}>
        {isSubmitting ? 'Criando conta...' : 'Criar conta de aluno'}
      </Button>
    </form>
  )
}