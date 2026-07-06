import { Link } from 'react-router-dom';
export const Unauthorized = () => (
  <div className="text-center p-8">
    <h1 className="text-2xl font-bold text-red-600">Acesso negado</h1>
    <p>Você não tem permissão para aceder a esta página.</p>
    <Link to="/dashboard" className="text-blue-600 underline">Voltar</Link>
  </div>
);