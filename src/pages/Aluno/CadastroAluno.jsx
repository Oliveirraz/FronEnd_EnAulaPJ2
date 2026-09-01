import "../../assets/css/Aluno/AlunoStyle.css";
import FormUser from "../../components/Aluno/FormAluno"

function CadastroAluno() {
  return (
    <div className="cadastro-aluno-container">
      <div className="aluno-card">
        <h2 className="aluno-title">Cadastro do Aluno</h2>

        <FormUser />
      </div>
    </div>
  );
}

export default CadastroAluno;