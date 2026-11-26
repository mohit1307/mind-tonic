import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { PageLoader } from './Loader';

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
