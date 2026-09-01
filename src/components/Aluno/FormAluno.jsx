import { useState } from "react";

function FormAluno() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Dados do formulário:", form);
    // conexão com a API entra no próximo passo
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="text-light">Nome</label>
      <input
        className="form-control mb-2"
        name="nome"
        value={form.nome}
        onChange={handleChange}
        required
      />

      <label className="text-light">E-mail</label>
      <input
        className="form-control mb-2"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <label className="text-light">Senha</label>
      <input
        type="password"
        className="form-control mb-3"
        name="senha"
        value={form.senha}
        onChange={handleChange}
        required
      />

      <button className="btn btn-success w-100" type="submit">
        Salvar
      </button>
    </form>
  );
}

export default FormAluno;