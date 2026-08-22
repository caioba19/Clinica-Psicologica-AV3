import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';

// Layout Principal
import { AppLayout } from './components/layout/AppLayout';

// Páginas Públicas & Institucionais
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ComoFuncionaPage } from './pages/public/ComoFuncionaPage';
import { ParaPsicologosPage } from './pages/public/ParaPsicologosPage';
import { ParaEmpresasPage } from './pages/public/ParaEmpresasPage';
import { BlogPage } from './pages/public/BlogPage';

// Páginas Internas do Sistema (Com AppLayout)
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AgendaPage } from './pages/agenda/AgendaPage';
import { PacientesListPage } from './pages/pacientes/PacientesListPage';
import { PacienteFormPage } from './pages/pacientes/PacienteFormPage';
import { SessoesPage } from './pages/sessoes/SessoesPage';
import { FinanceiroPage } from './pages/financeiro/FinanceiroPage';
import { RelatoriosPage } from './pages/relatorios/RelatoriosPage';
import { AdminUsuariosPage } from './pages/admin/AdminUsuariosPage';
import { PerfilPage } from './pages/perfil/PerfilPage';
import { ConfiguracoesPage } from './pages/configuracoes/ConfiguracoesPage';
import { PacientePortalPage } from './pages/paciente/PacientePortalPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Rota Raiz: Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Rotas Públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
              <Route path="/como-funciona" element={<ComoFuncionaPage />} />
              <Route path="/para-psicologos" element={<ParaPsicologosPage />} />
              <Route path="/para-empresas" element={<ParaEmpresasPage />} />
              <Route path="/blog" element={<BlogPage />} />

              {/* Área Autenticada / Interna (Possui o AppLayout como invólucro) */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/pacientes" element={<PacientesListPage />} />
                <Route path="/pacientes/novo" element={<PacienteFormPage />} />
                <Route path="/pacientes/:id/editar" element={<PacienteFormPage />} />
                <Route path="/sessoes" element={<SessoesPage />} />
                <Route path="/financeiro" element={<FinanceiroPage />} />
                <Route path="/relatorios" element={<RelatoriosPage />} />
                
                {/* Rota Administrativa e atalho */}
                <Route path="/admin" element={<Navigate to="/admin/usuarios" replace />} />
                <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
                
                <Route path="/paciente/portal" element={<PacientePortalPage />} />
                <Route path="/perfil" element={<PerfilPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
              </Route>

              {/* Rota 404 para caminhos inexistentes */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
};

export default App;