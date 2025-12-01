// // src/components/UserManagement.tsx
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { UserRole, UserProfile } from '../contexts/AuthContext';
// import { Users, Plus, Edit, Trash2, Mail, Shield, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';

// interface UserWithProfile extends UserProfile {
//   email_confirmed_at: string | null;
// }

// export default function UserManagement() {
//   const [users, setUsers] = useState<UserWithProfile[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);

//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     full_name: '',
//     role: 'teacher' as UserRole,
//   });

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('user_profiles')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (error) throw error;
      
//       // Get email confirmation status from auth.users
//       const usersWithAuth = await Promise.all((data || []).map(async (profile) => {
//         const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
//         return {
//           ...profile,
//           email_confirmed_at: authData?.user?.email_confirmed_at || null,
//         };
//       }));

//       setUsers(usersWithAuth);
//     } catch (error) {
//       console.error('Error loading users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

// const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (editingUser) {
//         // Update existing user
//         const { error } = await supabase
//           .from('user_profiles')
//           .update({
//             full_name: formData.full_name,
//             role: formData.role,
//           })
//           .eq('id', editingUser.id);

//         if (error) throw error;
//         alert('Usuario actualizado correctamente');
//       } else {
//         const { error: signUpError } = await supabase.auth.signUp({
//           email: formData.email,
//           password: formData.password,
//           options: {
//             data: {
//               full_name: formData.full_name,
//               role: formData.role,
//             },
//             emailRedirectTo: `${window.location.origin}/auth/callback`,
//           },
//         });

//         if (signUpError) {
//           const msg = signUpError.message || '';
//           if (msg.toLowerCase().includes('user already registered') || msg.toLowerCase().includes('duplicate')) {
//             alert('Ya existe un usuario con ese correo electrónico.');
//           } else {
//             console.error('Error creando usuario:', signUpError);
//             alert(`Error creando usuario: ${signUpError.message}`);
//           }
//           throw signUpError;
//         }

//         alert('Usuario creado correctamente. Se ha enviado un correo de verificación al nuevo usuario.');
//       }

//       setShowForm(false);
//       setEditingUser(null);
//       setFormData({ email: '', password: '', full_name: '', role: 'teacher' });
//       loadUsers();
//     } catch (error: any) {
//       console.error('Error:', error);
//       alert(`Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

// const handleEdit = (user: UserWithProfile) => {
//     setEditingUser(user);
//     setFormData({
//       email: user.email,
//       password: '',
//       full_name: user.full_name,
//       role: user.role,
//     });
//     setShowForm(true);
//   };

//   const handleDelete = async (userId: string) => {
//     if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
//       return;
//     }

//     try {
//       const { error } = await supabase.auth.admin.deleteUser(userId);
//       if (error) throw error;

//       alert('Usuario eliminado correctamente');
//       loadUsers();
//     } catch (error: any) {
//       console.error('Error deleting user:', error);
//       alert(`Error al eliminar usuario: ${error.message}`);
//     }
//   };

//   const toggleUserStatus = async (user: UserWithProfile) => {
//     try {
//       const { error } = await supabase
//         .from('user_profiles')
//         .update({ is_active: !user.is_active })
//         .eq('id', user.id);

//       if (error) throw error;
//       loadUsers();
//     } catch (error: any) {
//       console.error('Error:', error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const getRoleBadge = (role: UserRole) => {
//     const styles = {
//       admin: 'bg-purple-100 text-purple-800 border-purple-200',
//       teacher: 'bg-blue-100 text-blue-800 border-blue-200',
//       student: 'bg-green-100 text-green-800 border-green-200',
//     };

//     const labels = {
//       admin: 'Administrador',
//       teacher: 'Docente',
//       student: 'Estudiante',
//     };

//     const icons = {
//       admin: Shield,
//       teacher: UserIcon,
//       student: UserIcon,
//     };

//     const Icon = icons[role];

//     return (
//       <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[role]}`}>
//         <Icon className="w-3 h-3" />
//         {labels[role]}
//       </span>
//     );
//   };

//   if (loading && users.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-gray-500">Cargando usuarios...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <Users className="w-8 h-8 text-purple-600" />
//             <div>
//               <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
//               <p className="text-sm text-gray-600">
//                 {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={() => {
//               setEditingUser(null);
//               setFormData({ email: '', password: '', full_name: '', role: 'teacher' });
//               setShowForm(true);
//             }}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             Nuevo Usuario
//           </button>
//         </div>

//         {users.length === 0 ? (
//           <div className="text-center py-12 text-gray-500">
//             No hay usuarios registrados
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                     Nombre
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                     Correo
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                     Rol
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                     Estado
//                   </th>

//                   <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                     Acciones
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {users.map((user) => (
//                   <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
//                     <td className="px-4 py-3 text-sm text-gray-900 font-medium">
//                       {user.full_name}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-700">
//                       <div className="flex items-center gap-2">
//                         <Mail className="w-4 h-4 text-gray-400" />
//                         {user.email}
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       {getRoleBadge(user.role)}
//                     </td>
//                     <td className="px-4 py-3">
//                       <button
//                         onClick={() => toggleUserStatus(user)}
//                         className={`px-3 py-1 rounded-full text-xs font-medium ${
//                           user.is_active
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-gray-100 text-gray-800'
//                         }`}
//                       >
//                         {user.is_active ? 'Activo' : 'Inactivo'}
//                       </button>
//                     </td>
                   
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => handleEdit(user)}
//                           className="text-blue-600 hover:text-blue-800 p-1"
//                           title="Editar"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>

//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* User Form Modal */}
//       {showForm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">
//               {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
//             </h3>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Nombre completo *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.full_name}
//                   onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               {!editingUser && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Correo electrónico *
//                     </label>
//                     <input
//                       type="email"
//                       required
//                       value={formData.email}
//                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Contraseña temporal *
//                     </label>
//                     <input
//                       type="password"
//                       required
//                       value={formData.password}
//                       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       minLength={6}
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                       Mínimo 6 caracteres. El usuario podrá cambiarla después.
//                     </p>
//                   </div>
//                 </>
//               )}

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Rol *
//                 </label>
//                 <select
//                   required
//                   value={formData.role}
//                   onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="teacher">Docente</option>
//                   <option value="admin">Administrador</option>
//                   <option value="student">Estudiante</option>
//                 </select>
//               </div>

//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setEditingUser(null);
//                   }}
//                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancelar
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
//                 >
//                   {loading ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear Usuario'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/UserManagement.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole, UserProfile } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Users, Plus, Edit, Trash2, Mail, Shield, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';

interface UserWithProfile extends UserProfile {
  email_confirmed_at: string | null;
}

export default function UserManagement() {
  const { settings, announceMessage, speakText } = useAccessibility();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'teacher' as UserRole,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    announceMessage('Cargando usuarios', 'polite');
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get email confirmation status from auth.users
      const usersWithAuth = await Promise.all((data || []).map(async (profile) => {
        const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
        return {
          ...profile,
          email_confirmed_at: authData?.user?.email_confirmed_at || null,
        };
      }));

      setUsers(usersWithAuth);
      announceMessage(`${usersWithAuth.length} usuarios cargados`, 'polite');
    } catch (error) {
      console.error('Error loading users:', error);
      announceMessage('Error al cargar usuarios', 'assertive');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    announceMessage('Guardando usuario', 'polite');

    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role,
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        
        const message = 'Usuario actualizado correctamente';
        alert(message);
        announceMessage(message, 'assertive');
        if (settings.readAloud) {
          speakText(message);
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              role: formData.role,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          const msg = signUpError.message || '';
          let errorMessage = '';
          
          if (msg.toLowerCase().includes('user already registered') || msg.toLowerCase().includes('duplicate')) {
            errorMessage = 'Ya existe un usuario con ese correo electrónico.';
          } else {
            errorMessage = `Error creando usuario: ${signUpError.message}`;
          }
          
          alert(errorMessage);
          announceMessage(errorMessage, 'assertive');
          if (settings.readAloud) {
            speakText(errorMessage);
          }
          throw signUpError;
        }

        const message = 'Usuario creado correctamente. Se ha enviado un correo de verificación al nuevo usuario.';
        alert(message);
        announceMessage(message, 'assertive');
        if (settings.readAloud) {
          speakText(message);
        }
      }

      setShowForm(false);
      setEditingUser(null);
      setFormData({ email: '', password: '', full_name: '', role: 'teacher' });
      loadUsers();
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = `Error: ${error.message}`;
      alert(errorMsg);
      announceMessage(errorMsg, 'assertive');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserWithProfile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
    });
    setShowForm(true);
    announceMessage(`Editando usuario ${user.full_name}`, 'polite');
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    announceMessage('Eliminando usuario', 'polite');

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      const message = 'Usuario eliminado correctamente';
      alert(message);
      announceMessage(message, 'assertive');
      if (settings.readAloud) {
        speakText(message);
      }
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMsg = `Error al eliminar usuario: ${error.message}`;
      alert(errorMsg);
      announceMessage(errorMsg, 'assertive');
    }
  };

  const toggleUserStatus = async (user: UserWithProfile) => {
    const newStatus = !user.is_active;
    announceMessage(`Cambiando estado de usuario a ${newStatus ? 'activo' : 'inactivo'}`, 'polite');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: newStatus })
        .eq('id', user.id);

      if (error) throw error;
      
      announceMessage(`Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`, 'polite');
      loadUsers();
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = `Error: ${error.message}`;
      alert(errorMsg);
      announceMessage(errorMsg, 'assertive');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      teacher: 'bg-blue-100 text-blue-800 border-blue-200',
      student: 'bg-green-100 text-green-800 border-green-200',
    };

    const labels = {
      admin: 'Administrador',
      teacher: 'Docente',
      student: 'Estudiante',
    };

    const icons = {
      admin: Shield,
      teacher: UserIcon,
      student: UserIcon,
    };

    const Icon = icons[role];

    return (
      <span 
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[role]}`}
        role="status"
        aria-label={`Rol: ${labels[role]}`}
      >
        <Icon className="w-3 h-3" aria-hidden="true" />
        {labels[role]}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-96"
        role="status"
        aria-live="polite"
      >
        <div className="text-gray-500">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
              <p className="text-sm text-gray-600" aria-live="polite">
                {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ email: '', password: '', full_name: '', role: 'teacher' });
              setShowForm(true);
              announceMessage('Abriendo formulario de nuevo usuario', 'polite');
            }}
            onMouseEnter={() => settings.readAloud && speakText('Crear nuevo usuario')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-300"
            aria-label="Crear nuevo usuario"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Nuevo Usuario
          </button>
        </div>

        {users.length === 0 ? (
          <div 
            className="text-center py-12 text-gray-500"
            role="status"
          >
            No hay usuarios registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table 
              className="w-full"
              role="table"
              aria-label="Tabla de usuarios del sistema"
            >
              <thead>
                <tr className="border-b border-gray-200">
                  <th 
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    Nombre
                  </th>
                  <th 
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    Correo
                  </th>
                  <th 
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    Rol
                  </th>
                  <th 
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    Estado
                  </th>
                  <th 
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {user.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" aria-hidden="true" />
                        <span aria-label={`Correo: ${user.email}`}>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleUserStatus(user)}
                        onMouseEnter={() => settings.readAloud && speakText(`Estado: ${user.is_active ? 'Activo' : 'Inactivo'}. Clic para cambiar`)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors focus:ring-2 focus:ring-offset-2 ${
                          user.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'
                        }`}
                        aria-label={`Estado: ${user.is_active ? 'Activo' : 'Inactivo'}. Clic para ${user.is_active ? 'desactivar' : 'activar'}`}
                        aria-pressed={user.is_active}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          onMouseEnter={() => settings.readAloud && speakText(`Editar usuario ${user.full_name}`)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded focus:ring-2 focus:ring-blue-500"
                          aria-label={`Editar usuario ${user.full_name}`}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-labelledby="user-form-title"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 
              id="user-form-title"
              className="text-xl font-bold text-gray-800 mb-4"
            >
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>

            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre completo *
                </label>
                <input
                  id="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo: Nombre completo');
                    }
                    announceMessage('Campo de nombre completo enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Nombre completo')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  aria-required="true"
                />
              </div>

              {!editingUser && (
                <>
                  <div>
                    <label 
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Correo electrónico *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => {
                        if (settings.readAloud) {
                          speakText('Campo: Correo electrónico');
                        }
                        announceMessage('Campo de correo electrónico enfocado');
                      }}
                      onMouseEnter={() => settings.readAloud && speakText('Correo electrónico')}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Contraseña temporal *
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => {
                        if (settings.readAloud) {
                          speakText('Campo: Contraseña temporal');
                        }
                        announceMessage('Campo de contraseña enfocado');
                      }}
                      onMouseEnter={() => settings.readAloud && speakText('Contraseña temporal')}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      minLength={6}
                      aria-required="true"
                      aria-describedby="password-help"
                    />
                    <p 
                      id="password-help"
                      className="text-xs text-gray-500 mt-1"
                    >
                      Mínimo 6 caracteres. El usuario podrá cambiarla después.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label 
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rol *
                </label>
                <select
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Selector de rol');
                    }
                    announceMessage('Campo de rol enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Seleccionar rol')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  aria-required="true"
                >
                  <option value="teacher">Docente</option>
                  <option value="admin">Administrador</option>
                  <option value="student">Estudiante</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                    announceMessage('Formulario cancelado', 'polite');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Cancelar')}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-500"
                  aria-label="Cancelar y cerrar formulario"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  onMouseEnter={() => settings.readAloud && speakText(editingUser ? 'Actualizar usuario' : 'Crear usuario')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-300"
                  aria-label={editingUser ? 'Actualizar información del usuario' : 'Crear nuevo usuario'}
                >
                  {loading ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear Usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading && 'Procesando...'}
      </div>
    </div>
  );
}