import React from 'react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'recibo' | 'declaracao' | 'laudo' | 'evolucao';
  dados: {
    pacienteNome: string;
    pacienteCpf?: string;
    psicologoNome: string;
    psicologoCrp: string;
    data: string;
    valor?: string;
    detalhes?: string;
  };
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  tipo,
  dados
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getTitulo = () => {
    switch (tipo) {
      case 'recibo': return 'RECIBO DE HONORÁRIOS PSICOLÓGICOS';
      case 'declaracao': return 'DECLARAÇÃO DE COMPARECIMENTO';
      case 'laudo': return 'LAUDO / RELATÓRIO PSICOLÓGICO';
      case 'evolucao': return 'REGISTRO DE EVOLUÇÃO CLÍNICA';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1080,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          color: '#17262b',
          borderRadius: '12px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Ações Superior (Não sai na impressão) */}
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom no-print"
          style={{ backgroundColor: '#f8fafc' }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-pdf-fill text-danger fs-5"></i>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Visualização de Impressão / PDF</span>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              style={{ background: '#2c5f6e', borderColor: '#2c5f6e', fontWeight: 600, fontSize: '13px' }}
              onClick={handlePrint}
            >
              <i className="bi bi-printer me-1"></i> Imprimir / Salvar PDF
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Folha A4 Formatada */}
        <div
          className="p-5 overflow-auto flex-grow-1 print-content"
          style={{ backgroundColor: '#fff', fontFamily: 'Georgia, serif', lineHeight: 1.8 }}
        >
          {/* Cabeçalho Clínico */}
          <div className="text-center pb-4 mb-4" style={{ borderBottom: '2px solid #2c5f6e' }}>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
              <img src="/logo-icon.png" alt="PsicoManager Logo" style={{ width: '26px', height: '26px', borderRadius: '7px', objectFit: 'cover' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#2c5f6e', letterSpacing: '-0.02em', margin: 0 }}>
                PsicoManager Clínica Integrada
              </h2>
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Atendimento Psicológico Especializado • Registro CNES 1234567
            </p>
          </div>

          {/* Título do Documento */}
          <div className="text-center my-4">
            <h3 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#17262b', textDecoration: 'underline' }}>
              {getTitulo()}
            </h3>
          </div>

          {/* Corpo do Documento */}
          <div className="my-4" style={{ fontSize: '14px', textAlign: 'justify' }}>
            {tipo === 'recibo' && (
              <p>
                Recebi de <strong>{dados.pacienteNome}</strong>
                {dados.pacienteCpf && <>, inscrito(a) no CPF sob o nº <strong>{dados.pacienteCpf}</strong></>}, a quantia de <strong>{dados.valor || 'R$ 180,00'}</strong> referente a serviços profissionais de atendimento psicológico clínico realizados no dia <strong>{dados.data}</strong>.
              </p>
            )}

            {tipo === 'declaracao' && (
              <p>
                Declaro para os devidos fins que o(a) paciente <strong>{dados.pacienteNome}</strong> compareceu a esta clínica para atendimento psicológico individual no dia <strong>{dados.data}</strong>, no período de 50 minutos.
              </p>
            )}

            {tipo === 'evolucao' && (
              <div>
                <p><strong>Paciente:</strong> {dados.pacienteNome}</p>
                <p><strong>Data do Atendimento:</strong> {dados.data}</p>
                <p><strong>Registro Clínico:</strong></p>
                <div className="p-3 bg-light rounded border my-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                  {dados.detalhes || 'Sessão com boa adesão terapêutica. Trabalhadas técnicas de reestruturação cognitiva e respiração diafragmática.'}
                </div>
              </div>
            )}

            <p className="mt-4">
              Por ser verdade, firmo o presente documento.
            </p>
          </div>

          {/* Data e Assinatura */}
          <div className="mt-5 pt-4 text-center">
            <p style={{ fontSize: '13px', color: '#475569' }}>
              São Paulo, {dados.data || '17 de Agosto de 2026'}.
            </p>
            <div className="mt-5" style={{ maxWidth: '320px', margin: '40px auto 0', borderTop: '1px solid #94a3b8', paddingTop: '8px' }}>
              <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b' }}>
                {dados.psicologoNome || 'Dra. Sofia Mendes'}
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Psicóloga Clínica • {dados.psicologoCrp || 'CRP 06/123456'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
