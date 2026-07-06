import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-4">Sistema de Gestão de Consultas Médicas</h1>
        <p className="text-center text-gray-600 mb-8">Agende consultas, gerencie prontuários e muito mais.</p>
        <div className="flex justify-center gap-4">
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Entrar</Link>
          <Link to="/register" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">Criar Conta</Link>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow">🔹 Agendamento fácil</div>
          <div className="bg-white p-6 rounded-lg shadow">🔹 Prontuários digitais</div>
          <div className="bg-white p-6 rounded-lg shadow">🔹 Lembretes automáticos</div>
        </div>
      </div>
    </div>
  );
};