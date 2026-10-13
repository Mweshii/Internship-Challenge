// Staff sign-in. On success the server sets a login cookie, and the browser
// then sends that cookie automatically with every later /api request.
import { Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, login } from '../../api/services.js';
import { Alert, SubmitButton } from '../../components/ui/Feedback.jsx';
import { TextField } from '../../components/ui/Field.jsx';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already signed in? Skip the form.
  useEffect(() => {
    getCurrentUser()
      .then(() => navigate('/admin', { replace: true }))
      .catch(() => {
        // Not signed in: stay on this page.
      });
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <form onSubmit={handleSubmit} noValidate className="card w-full max-w-sm space-y-4 p-6 sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50">
            <Lock className="size-6 text-brand-500" aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-xl font-bold text-slate-900">Staff Sign In</h1>
          <p className="mt-1 text-sm text-slate-500">For authorised staff only.</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <TextField label="Email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
        <SubmitButton isSubmitting={isSubmitting} submittingLabel="Signing in...">
          Sign In
        </SubmitButton>
      </form>
    </div>
  );
}
