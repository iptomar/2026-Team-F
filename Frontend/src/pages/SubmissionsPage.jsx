import React, { useState, useEffect } from 'react';

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('http://localhost:3000/form-submissions'); 
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/form-submissions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSubmissions(prev =>
          prev.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub)
        );
        alert("Estado do pedido atualizado com sucesso!");
      } else {
        alert("Erro ao guardar o estado no servidor.");
      }
    } catch (error) {
      console.error("Erro ao atualizar estado:", error);
    }
  };

  if (loading) return <div className="p-10 text-center">A carregar pedidos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestão de Pedidos</h1>
        <p className="text-gray-600 mb-8">Altere o estado dos pedidos submetidos para refletir a evolução do processo.</p>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-700">ID do Pedido</th>
                <th className="p-4 font-semibold text-gray-700">Data de Submissão</th>
                <th className="p-4 font-semibold text-gray-700">Estado Atual</th>
                <th className="p-4 font-semibold text-gray-700">Ação (Mudar Estado)</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">Nenhum pedido encontrado no sistema.</td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 text-sm text-gray-600">{sub.id.substring(0,8)}...</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(sub.submitted_at).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        sub.status === 'completed' ? 'bg-green-100 text-green-700' :
                        sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        sub.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={sub.status}
                        onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="submitted">Submetido</option>
                        <option value="in_progress">Em Progresso</option>
                        <option value="completed">Concluído</option>
                        <option value="rejected">Rejeitado</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsPage;