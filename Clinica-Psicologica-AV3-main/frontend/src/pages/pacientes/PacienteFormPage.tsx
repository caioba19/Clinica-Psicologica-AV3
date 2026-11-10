import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { maskCPF, maskPhone, maskCEP } from '../../utils/masks';
import { isValidCPF, isValidEmail, isValidPhone } from '../../../../shared/src/utils/validators';
import { patientService } from '../../services/patientService';

export const PacienteFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    dataNasc: '',
    genero: 'Feminino',
    estadoCivil: 'Solteiro(a)',
    profissao: '',
    email: '',
    telefone: '',
    telefoneEmergencia: '',
    contatoEmergenciaNome: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: 'SP',
    convenio: 'Particular',
    status: 'Ativo' as 'Ativo' | 'Inativo' | 'Em Espera',
    motivoConsulta: '',
    historicoSaude: '',
    observacoes: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      patientService.getById(id).then((patient) => {
        if (patient) {
          setFormData({
            nome: patient.nome || '',
            cpf: patient.cpf || '',
            rg: '',
            dataNasc: patient.dataNasc ? patient.dataNasc.split(' ')[0] : '',
            genero: patient.genero || 'Feminino',
            estadoCivil: 'Solteiro(a)',
            profissao: '',
            email: patient.email || '',
            telefone: patient.telefone || '',
            telefoneEmergencia: '',
            contatoEmergenciaNome: '',
            cep: '',
            endereco: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: 'SP',
            convenio: patient.convenio || 'Particular',
            status: patient.status || 'Ativo',
            motivoConsulta: patient.motivoConsulta || '',
            historicoSaude: patient.historico || '',
            observacoes: ''
          });
        } else {
          showToast('Paciente não encontrado.', 'danger');
          navigate('/pacientes');
        }
      }).finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'nome' && value.trim().length < 3) {
      error = 'O nome completo deve conter pelo menos 3 caracteres.';
    } else if (name === 'cpf' && value.trim()) {
      if (!isValidCPF(value)) {
        error = 'CPF inválido. Verifique os números digitados.';
      }
    } else if (name === 'email' && value.trim()) {
      if (!isValidEmail(value)) {
        error = 'Formato de e-mail inválido.';
      }
    } else if (name === 'telefone' && value.trim()) {
      if (!isValidPhone(value)) {
        error = 'Telefone deve conter DDD e número válido.';
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = maskCPF(value);
    } else if (name === 'telefone' || name === 'telefoneEmergencia') {
      formattedValue = maskPhone(value);
    } else if (name === 'cep') {
      formattedValue = maskCEP(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    validateField(name, formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      showToast('O nome do paciente é obrigatório.', 'warning');
      return;
    }

    if (!formData.cpf.trim() || !isValidCPF(formData.cpf)) {
      showToast('Por favor, informe um CPF válido com 11 dígitos.', 'warning');
      return;
    }

    if (!formData.telefone.trim() || !isValidPhone(formData.telefone)) {
      showToast('Por favor, informe um telefone válido com DDD.', 'warning');
      return;
    }

    try {
      setLoading(true);
      if (isEditing && id) {
        await patientService.update(id, {
          nome: formData.nome,
          cpf: formData.cpf,
          dataNasc: formData.dataNasc,
          genero: formData.genero,
          email: formData.email,
          telefone: formData.telefone,
          convenio: formData.convenio,
          status: formData.status,
          motivoConsulta: formData.motivoConsulta,
          historico: formData.historicoSaude
        });
        showToast(`Cadastro de ${formData.nome} atualizado com sucesso!`, 'success');
      } else {
        await patientService.create({
          nome: formData.nome,
          cpf: formData.cpf,
          dataNasc: formData.dataNasc,
          genero: formData.genero,
          email: formData.email,
          telefone: formData.telefone,
          convenio: formData.convenio,
          status: formData.status,
          motivoConsulta: formData.motivoConsulta,
          historico: formData.historicoSaude
        });
        showToast(`Paciente ${formData.nome} cadastrado com sucesso!`, 'success');
      }
      navigate('/pacientes');
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar paciente.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const initials = formData.nome
    ? formData.nome.split(' ').filter(Boolean).map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'PX';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEditing ? 'Editar Paciente' : 'Novo Paciente'}</h1>
          <p className="page-subtitle">
            {isEditing ? `Atualize as informações cadastrais de ${formData.nome}` : 'Preencha os dados do paciente para abrir seu prontuário'}
          </p>
        </div>
        <Link to="/pacientes" className="btn-ghost">
          <i className="bi bi-arrow-left me-1"></i> Voltar à Lista
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Foto / Cabeçalho Rápido */}
        <div className="card mb-4">
          <div className="card-body d-flex align-items-center gap-3 p-3">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 700
              }}
            >
              {initials}
            </div>
            <div>
              <strong className="d-block fs-5">{formData.nome || 'Novo Paciente'}</strong>
              <span className="text-muted small">Status: {formData.status} • Modalidade: {formData.convenio}</span>
            </div>
          </div>
        </div>

        {/* 1. Dados Pessoais */}
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title"><i className="bi bi-person me-2 text-primary"></i>1. Dados Pessoais</h3>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Lucas Ferreira Mendes"
                  required
                />
                {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
              </div>
              <div className="col-md-3">
                <label className="form-label">CPF *</label>
                <input
                  type="text"
                  className={`form-control ${errors.cpf ? 'is-invalid' : ''}`}
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  required
                />
                {errors.cpf && <div className="invalid-feedback">{errors.cpf}</div>}
              </div>
              <div className="col-md-3">
                <label className="form-label">RG</label>
                <input
                  type="text"
                  className="form-control"
                  name="rg"
                  value={formData.rg}
                  onChange={handleChange}
                  placeholder="00.000.000-0"
                />
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Data de Nascimento</label>
                <input
                  type="date"
                  className="form-control"
                  name="dataNasc"
                  value={formData.dataNasc}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Gênero</label>
                <select className="form-select" name="genero" value={formData.genero} onChange={handleChange}>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Não-binário">Não-binário</option>
                  <option value="Não informado">Prefiro não informar</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Estado Civil</label>
                <select className="form-select" name="estadoCivil" value={formData.estadoCivil} onChange={handleChange}>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                  <option value="União Estável">União Estável</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Profissão / Ocupação</label>
                <input
                  type="text"
                  className="form-control"
                  name="profissao"
                  value={formData.profissao}
                  onChange={handleChange}
                  placeholder="Ex: Engenheiro"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Contato e Endereço */}
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title"><i className="bi bi-geo-alt me-2 text-primary"></i>2. Contato & Localização</h3>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">E-mail Principal</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="paciente@email.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  required
                />
                {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Contato de Emergência</label>
                <input
                  type="text"
                  className="form-control"
                  name="contatoEmergenciaNome"
                  value={formData.contatoEmergenciaNome}
                  onChange={handleChange}
                  placeholder="Nome e Parentesco"
                />
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">CEP</label>
                <input
                  type="text"
                  className="form-control"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Endereço (Rua, Avenida)</label>
                <input
                  type="text"
                  className="form-control"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua das Flores, 123"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Cidade / UF</label>
                <input
                  type="text"
                  className="form-control"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="São Paulo - SP"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Dados Clínicos & Observações Iniciais */}
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title"><i className="bi bi-file-medical me-2 text-primary"></i>3. Dados Clínicos & Prontuário</h3>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Tipo de Convênio / Pagamento</label>
                <select className="form-select" name="convenio" value={formData.convenio} onChange={handleChange}>
                  <option value="Particular">Particular</option>
                  <option value="Bradesco Saúde">Bradesco Saúde</option>
                  <option value="SulAmérica">SulAmérica</option>
                  <option value="Unimed">Unimed</option>
                  <option value="Amil">Amil</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Status Inicial</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="Ativo">Ativo</option>
                  <option value="Em Espera">Em Espera</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Queixa Principal / Motivo da Procura</label>
              <textarea
                className="form-control"
                rows={3}
                name="motivoConsulta"
                value={formData.motivoConsulta}
                onChange={handleChange}
                placeholder="Descreva a queixa inicial relatada pelo paciente ou responsável..."
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Histórico de Saúde Relevante</label>
              <textarea
                className="form-control"
                rows={3}
                name="historicoSaude"
                value={formData.historicoSaude}
                onChange={handleChange}
                placeholder="Medicações em uso, tratamentos anteriores, diagnósticos prévios..."
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="d-flex justify-content-end gap-2 mb-5">
          <Link to="/pacientes" className="btn-ghost">
            Cancelar
          </Link>
          <button type="submit" className="btn-accent" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Salvando...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1"></i> {isEditing ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
