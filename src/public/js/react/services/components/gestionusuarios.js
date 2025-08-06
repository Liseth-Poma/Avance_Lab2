import React, { useState, useEffect } from 'react';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', username: '' });
  const [showUserForm, setShowUserForm] = useState(false);

  // Servicios API integrados en el componente
  const apiBase = 'https://jsonplaceholder.typicode.com';
  
  const userService = {
    getUsers: () => fetch(`${apiBase}/users`).then(res => res.json()),
    createUser: (user) => fetch(`${apiBase}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }).then(res => res.json()),
    deleteUser: (id) => fetch(`${apiBase}/users/${id}`, { method: 'DELETE' })
  };

  const messageService = {
    getMessages: () => fetch(`${apiBase}/posts`).then(res => res.json())
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
    fetchMessages();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await messageService.getMessages();
      setMessages(data.slice(0, 10)); // Solo primeros 10 mensajes
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.username) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const newUserData = await userService.createUser(newUser);
      setUsers([...users, { ...newUserData, id: users.length + 1 }]);
      setNewUser({ name: '', email: '', username: '' });
      setShowUserForm(false);
      setError(null);
    } catch (err) {
      setError('Error al crear usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    setLoading(true);
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }
    } catch (err) {
      setError('Error al eliminar usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserMessages = (userId) => {
    return messages.filter(msg => msg.userId === userId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Gestión de Usuarios del Chat
        </h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setShowUserForm(!showUserForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showUserForm ? 'Cancelar' : 'Agregar Usuario'}
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showUserForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3">Nuevo Usuario</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nombre completo"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleCreateUser}
              disabled={loading}
              className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de usuarios */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4">Usuarios Registrados ({users.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map(user => (
              <div
                key={user.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedUser?.id === user.id 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'bg-white border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{user.name}</h4>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {getUserMessages(user.id).length} posts
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalles del usuario seleccionado */}
        <div className="bg-gray-50 rounded-lg p-4">
          {selectedUser ? (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Detalles de {selectedUser.name}
              </h3>
              <div className="space-y-3">
                <div>
                  <strong>Email:</strong> {selectedUser.email}
                </div>
                <div>
                  <strong>Username:</strong> @{selectedUser.username}
                </div>
                <div>
                  <strong>Website:</strong> {selectedUser.website || 'No disponible'}
                </div>
                <div>
                  <strong>Teléfono:</strong> {selectedUser.phone || 'No disponible'}
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">
                    Posts del usuario ({getUserMessages(selectedUser.id).length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {getUserMessages(selectedUser.id).map(msg => (
                      <div key={msg.id} className="bg-white p-2 rounded border">
                        <h5 className="font-medium text-sm">{msg.title}</h5>
                        <p className="text-xs text-gray-600 truncate">{msg.body}</p>
                      </div>
                    ))}
                    {getUserMessages(selectedUser.id).length === 0 && (
                      <p className="text-gray-500 text-sm">No hay posts disponibles</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Selecciona un usuario para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManager;