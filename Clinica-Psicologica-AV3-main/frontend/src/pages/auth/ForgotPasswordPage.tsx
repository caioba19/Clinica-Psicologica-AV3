import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.post<{ message: string }>('/auth/password/forgot', { email });
      setMessage(result.message);
    } catch (requestError: any) {
      setError(requestError.message || 'A recuperação por e-mail está indisponível.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) return setError('A nova senha deve ter pelo menos 8 caracteres.');
    if (password !== confirmPassword) return setError('As senhas não coincidem.');
    setLoading(true);
    try {
      await api.post('/auth/password/reset', { email, token, novaSenha: password });
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (requestError: any) {
      setError(requestError.message || 'O link expirou ou não é válido. Solicite outro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '32px 16px' }}>
      <div className="card shadow-lg" style={{ maxWidth: '460px', width: '100%', borderRadius: '16px' }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-3">{token ? 'Redefinir senha' : 'Recuperar senha'}</h1>
          <p className="text-secondary">
            {token ? 'Escolha uma nova senha para sua conta.' : 'Informe o e-mail cadastrado. Se a conta existir, enviaremos um link de redefinição válido por 30 minutos.'}
          </p>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {message ? (
            <div className="alert alert-info" role="status">{message}</div>
          ) : token ? (
            <form onSubmit={resetPassword}>
              <label className="form-label" htmlFor="reset-email">E-mail da conta</label>
              <input id="reset-email" type="email" className="form-control mb-3" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <label className="form-label" htmlFor="reset-password">Nova senha</label>
              <input id="reset-password" type="password" autoComplete="new-password" minLength={8} className="form-control mb-3" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <label className="form-label" htmlFor="reset-confirm">Confirme a nova senha</label>
              <input id="reset-confirm" type="password" autoComplete="new-password" minLength={8} className="form-control mb-3" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
              <button className="btn-accent w-100" type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar nova senha'}</button>
            </form>
          ) : (
            <form onSubmit={requestReset}>
              <label className="form-label" htmlFor="reset-request-email">E-mail cadastrado</label>
              <input id="reset-request-email" type="email" className="form-control mb-3" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <button className="btn-accent w-100" type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar link de redefinição'}</button>
            </form>
          )}
          <div className="text-center mt-4"><Link to="/login" className="text-decoration-none small text-muted">Voltar para o login</Link></div>
        </div>
      </div>
    </div>
  );
};
