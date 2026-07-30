
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';

const DashboardLayout = ({ menuItems, children }) => {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar menuItems={menuItems} />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

