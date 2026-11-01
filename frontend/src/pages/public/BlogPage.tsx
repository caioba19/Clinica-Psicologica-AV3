import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

interface BlogPost {
  id: number;
  tag: string;
  categoria: 'todos' | 'cfp' | 'gestao' | 'telepsicologia' | 'clinica';
  titulo: string;
  resumo: string;
  conteudo: string;
  autor: string;
  crp: string;
  data: string;
  tempo: string;
}

export const BlogPage: React.FC = () => {
  const { showToast } = useToast();
  const [categoriaAtiva, setCategoriaAtiva] = useState<'todos' | 'cfp' | 'gestao' | 'telepsicologia' | 'clinica'>('todos');
  const [artigoSelecionado, setArtigoSelecionado] = useState<BlogPost | null>(null);
  const [newsEmail, setNewsEmail] = useState('');

  const posts: BlogPost[] = [
    {
      id: 1,
      tag: 'Legislação & CFP',
      categoria: 'cfp',
      titulo: 'Como manter o prontuário psicológico seguro segundo a Resolução CFP 01/2009',
      resumo: 'Entenda os requisitos legais de guarda, sigilo ético e estrutura obrigatória de registros de evolução clínica para profissionais e clínicas.',
      conteudo: `A guarda e manutenção do prontuário psicológico é um dos pilares mais sensíveis e essenciais da prática profissional. A Resolução CFP nº 01/2009 estabelece diretrizes rigorosas:

1. **Guarda Documental Obrigatória**: O psicólogo é obrigado a manter os registros arquivados por no mínimo 5 anos após o término do atendimento.
2. **Sigilo e Confidencialidade**: O prontuário deve conter apenas as informações técnicas indispensáveis ao acompanhamento, preservando a intimidade e a dignidade do paciente.
3. **Prontuários Eletrônicos**: A digitalização é expressamente permitida, desde que os sistemas garantam integridade, criptografia e controle restrito de acesso com logs de auditoria.

O PsicoManager foi projetado para atender 100% desses critérios, salvaguardando o psicólogo em qualquer fiscalização do Conselho Regional.`,
      autor: 'Dra. Sofia Mendes',
      crp: 'CRP 06/123456',
      data: '15 de Agosto, 2026',
      tempo: '5 min de leitura'
    },
    {
      id: 2,
      tag: 'Gestão de Consultório',
      categoria: 'gestao',
      titulo: '5 estratégias comprovadas para reduzir as faltas e no-shows na clínica',
      resumo: 'Descubra como lembretes automatizados e regras claras de cancelamento podem aumentar a assiduidade em mais de 70%.',
      conteudo: `As faltas não justificadas representam um dos maiores prejuízos financeiros e terapêuticos na psicologia. Veja 5 estratégias aplicáveis:

1. **Lembretes Automatizados 24h e 2h antes**: Disparos de mensagens de confirmação reduzem o esquecimento em até 75%.
2. **Contrato Terapêutico Claro**: Deixe alinhado desde a primeira sessão a política de cancelamentos e reagendamentos.
3. **Canais de Confirmação Rápida**: Permita que o paciente confirme ou solicite reagendamento com um simples clique.
4. **Reserva de Horários com Pagamento Antecipado ou PIX**: Excelente estratégia para consultas pontuais ou avaliações.
5. **Acompanhamento da Aliança Terapêutica**: Monitore se as faltas recorrentes são sinais de resistência ou necessidade de readequação do plano terapêutico.`,
      autor: 'Dr. Marcelo Andrade',
      crp: 'CRP 03/12345',
      data: '10 de Agosto, 2026',
      tempo: '6 min de leitura'
    },
    {
      id: 3,
      tag: 'Telepsicologia',
      categoria: 'telepsicologia',
      titulo: 'Boas práticas na telepsicologia: enquadre terapêutico e ferramentas seguras',
      resumo: 'Como garantir um espaço de escuta protegido e estável em atendimentos virtuais conforme as normativas vigentes.',
      conteudo: `O atendimento psicológico mediado por tecnologia exige cuidados técnicos e relacionais específicos:

- **Segurança da Plataforma**: Utilize conexões criptografadas ponto a ponto e evite plataformas que gravam áudio/vídeo em servidores públicos.
- **Enquadre do Paciente**: Oriente o cliente sobre a importância de estar em um cômodo privativo, com fones de ouvido e sem interrupções.
- **Plano de Contingência**: Tenha um canal alternativo (telefone/mensagem) caso ocorra instabilidade na conexão durante uma emergência.`,
      autor: 'Juliana Prado',
      crp: 'CRP 03/54321',
      data: '02 de Agosto, 2026',
      tempo: '4 min de leitura'
    },
    {
      id: 4,
      tag: 'TCC & Prática Clínica',
      categoria: 'clinica',
      titulo: 'Como estruturar um Registro de Pensamentos Disfuncionais (RPD) digital',
      resumo: 'Otimize a adesão dos pacientes às tarefas de casa com formulários interativos e acompanhamento compartilhado.',
      conteudo: `Na Terapia Cognitivo-Comportamental, o RPD é uma das ferramentas centrais para identificação de distorções cognitivas. A versão digital do PsicoManager permite ao paciente preencher suas anotações no celular no momento em que a situação ocorre, facilitando a análise durante a sessão seguinte.`,
      autor: 'Dra. Sofia Mendes',
      crp: 'CRP 06/123456',
      data: '28 de Julho, 2026',
      tempo: '7 min de leitura'
    },
    {
      id: 5,
      tag: 'Finanças & Saúde',
      categoria: 'gestao',
      titulo: 'Como emitir recibos e organizar o carnê-leão na psicologia autônoma',
      resumo: 'Guia prático para não ter problemas com a Receita Federal e facilitar a declaração de seus pacientes.',
      conteudo: `Emitir recibos com CPF, nome completo do paciente e número do CRP é uma obrigação do profissional autônomo. No PsicoManager, a emissão é automática a cada pagamento confirmado, gerando histórico pronto para exportação para a contabilidade ou sistema do Carnê-Leão.`,
      autor: 'Renata Farias',
      crp: 'Administração & Gestão',
      data: '20 de Julho, 2026',
      tempo: '5 min de leitura'
    },
    {
      id: 6,
      tag: 'Ética & Sigilo',
      categoria: 'cfp',
      titulo: 'LGPD na Psicologia: o que muda no consentimento e armazenamento de dados?',
      resumo: 'Saiba quais são as exigências para dados sensíveis em saúde mental e como se proteger juridicamente.',
      conteudo: `Dados de saúde mental são classificados como 'dados altamente sensíveis' pela LGPD. O termo de consentimento deve ser livre, informado e específico para o acompanhamento clínico, devendo o sistema contar com restrição estrita de perfis de usuário.`,
      autor: 'Juliana Prado',
      crp: 'CRP 03/54321',
      data: '12 de Julho, 2026',
      tempo: '6 min de leitura'
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail) return;
    showToast('Inscrição realizada com sucesso! Você receberá nossos novos artigos.', 'success');
    setNewsEmail('');
  };

  const filteredPosts = categoriaAtiva === 'todos' 
    ? posts 
    : posts.filter(p => p.categoria === categoriaAtiva);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#173f4b', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#FFFFFF' }}>
          <img
            src="/logo-icon.png"
            alt="PsicoManager Logo"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(92,184,168,0.25)'
            }}
          />
          <span style={{ fontSize: '21px', fontWeight: 800 }}>Psico<span style={{ color: '#5cb8a8' }}>Manager</span></span>
        </Link>

        <nav className="d-none d-md-flex align-items-center gap-4" style={{ fontSize: '14px', fontWeight: 500 }}>
          <Link to="/como-funciona" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Como funciona</Link>
          <Link to="/para-psicologos" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Para psicólogos</Link>
          <Link to="/para-empresas" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Para empresas</Link>
          <Link to="/blog" style={{ color: '#5cb8a8', textDecoration: 'none', fontWeight: 700 }}>Blog</Link>
        </nav>

        <Link to="/login" style={{ background: '#5cb8a8', color: '#12343c', padding: '8px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px' }}>
          Entrar
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '60px 24px', maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: '#5cb8a8', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Artigos, Ética & Boas Práticas
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: '8px', marginBottom: '16px', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
            Blog & Conhecimento Clínico
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', maxWidth: '680px', margin: '0 auto', fontSize: '15.5px', lineHeight: 1.7 }}>
            Conteúdo prático sobre gestão de consultórios, normativas do CFP, psicologia baseada em evidências e inovação na saúde mental.
          </p>

          {/* Filtro de Categorias */}
          <div className="d-flex justify-content-center gap-2 flex-wrap mt-4">
            {[
              { id: 'todos', label: 'Todos os Artigos' },
              { id: 'cfp', label: 'Legislação & CFP' },
              { id: 'gestao', label: 'Gestão de Consultório' },
              { id: 'telepsicologia', label: 'Telepsicologia' },
              { id: 'clinica', label: 'Prática Clínica' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaAtiva(cat.id as any)}
                style={{
                  background: categoriaAtiva === cat.id ? '#5cb8a8' : 'rgba(255,255,255,0.06)',
                  color: categoriaAtiva === cat.id ? '#12343c' : 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: categoriaAtiva === cat.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grade de Artigos */}
        <div className="row g-4 mb-5">
          {filteredPosts.map((p) => (
            <div key={p.id} className="col-md-6 col-lg-4">
              <div
                style={{
                  backgroundColor: '#12262d',
                  borderRadius: '14px',
                  padding: '24px',
                  height: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                onClick={() => setArtigoSelecionado(p)}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ color: '#5cb8a8', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', background: 'rgba(92,184,168,0.12)', padding: '3px 8px', borderRadius: '4px' }}>
                    {p.tag}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{p.tempo}</span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: '8px 0 10px', lineHeight: 1.4 }}>
                  {p.titulo}
                </h3>
                
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
                  {p.resumo}
                </p>

                <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '12.5px', color: '#fff', display: 'block' }}>{p.autor}</strong>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{p.crp}</span>
                  </div>
                  <span style={{ color: '#5cb8a8', fontSize: '13px', fontWeight: 700 }}>
                    Ler <i className="bi bi-arrow-right"></i>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Leitura do Artigo */}
        {artigoSelecionado && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              zIndex: 1060,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setArtigoSelecionado(null)}
          >
            <div
              style={{
                backgroundColor: '#12262d',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '680px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                border: '1px solid rgba(92,184,168,0.3)',
                color: '#fff'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="badge" style={{ background: 'rgba(92,184,168,0.2)', color: '#5cb8a8', fontSize: '11px' }}>
                  {artigoSelecionado.tag}
                </span>
                <button
                  type="button"
                  onClick={() => setArtigoSelecionado(null)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '20px', cursor: 'pointer' }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px', lineHeight: 1.3 }}>
                {artigoSelecionado.titulo}
              </h2>

              <div className="d-flex align-items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '12.5px', color: 'rgba(255,255,255,0.6)' }}>
                <span><i className="bi bi-person me-1"></i> {artigoSelecionado.autor} ({artigoSelecionado.crp})</span>
                <span>•</span>
                <span><i className="bi bi-calendar3 me-1"></i> {artigoSelecionado.data}</span>
                <span>•</span>
                <span><i className="bi bi-clock me-1"></i> {artigoSelecionado.tempo}</span>
              </div>

              <div style={{ fontSize: '14px', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-line' }}>
                {artigoSelecionado.conteudo}
              </div>

              <div className="mt-4 pt-3 text-end" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setArtigoSelecionado(null)}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px' }}
                >
                  Fechar Artigo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Newsletter Box */}
        <div style={{ backgroundColor: '#12262d', borderRadius: '16px', padding: '36px', border: '1px solid rgba(92, 184, 168, 0.4)', textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(92,184,168,0.2)', color: '#5cb8a8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>
            <i className="bi bi-envelope-paper-heart"></i>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            Receba Atualizações Éticas & Modelos de Prontuário CFP
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '13.5px', margin: '0 auto 20px', maxWidth: '540px' }}>
            Cadastre seu e-mail para receber mensalmente novos roteiros de avaliação, dicas de gestão e atualizações normativas.
          </p>

          <form onSubmit={handleSubscribe} className="d-flex justify-content-center gap-2 flex-column flex-sm-row" style={{ maxWidth: '480px', margin: '0 auto' }}>
            <input
              type="email"
              className="form-control"
              placeholder="seu.email@exemplo.com"
              value={newsEmail}
              onChange={(e) => setNewsEmail(e.target.value)}
              required
              style={{ background: '#fff', color: '#17262b' }}
            />
            <button
              type="submit"
              className="btn btn-accent px-4 text-nowrap"
              style={{ background: '#5cb8a8', color: '#12343c', fontWeight: 700, border: 'none' }}
            >
              Inscrever-se
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
