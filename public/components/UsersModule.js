function UsersModule({ users, onAddUser, currentUser, onDeleteUser }) {
  const isSuperAdmin = currentUser?.role === 'superadmin';

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">
            <i className="fa-solid fa-users-gear"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Gestión de Usuarios, Roles & Credenciales</h2>
              {isSuperAdmin && (
                <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-black border border-amber-200 dark:border-amber-900/50">
                  👑 SUPERADMIN
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Control de cuentas autorizadas con roles superadmin y admin en MySQL</p>
          </div>
        </div>

        <button 
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          onClick={onAddUser}
        >
          <i className="fa-solid fa-user-plus text-xs"></i>
          <span>Crear Nuevo Usuario</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Usuario (Login)</th>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Área Operativa</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Nivel Acceso</th>
                {isSuperAdmin && <th className="py-3 px-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {users.map(u => {
                const isSuper = u.role === 'superadmin';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold ${isSuper ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'}`}>
                        {u.username}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                        isSuper 
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50' 
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
                      }`}>
                        {isSuper ? '👑 SUPERADMIN' : '🛡️ ADMIN'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                        {u.area || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-lg text-[10px] font-black border border-emerald-200 dark:border-emerald-900/50">
                        {u.status || 'Activo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {isSuper ? 'Control Total + BD' : 'Gestión & Facturas'}
                    </td>
                    {isSuperAdmin && (
                      <td className="py-3 px-4 text-right">
                        {u.id !== currentUser?.id && u.username !== 'superadmin' ? (
                          <button 
                            onClick={() => onDeleteUser && onDeleteUser(u.id)}
                            className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs"
                            title="Eliminar usuario"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Principal</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.UsersModule = UsersModule;