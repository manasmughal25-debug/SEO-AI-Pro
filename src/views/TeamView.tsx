import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Trash2, 
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'active' | 'invited';
  avatar?: string;
}

export const TeamView: React.FC = () => {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([
    { id: '1', name: user?.fullName || 'Current User', email: user?.email || '', role: 'Admin', status: 'active', avatar: user?.avatar },
    { id: '2', name: 'Sarah Analyst', email: 'sarah@example.com', role: 'Editor', status: 'active' },
    { id: '3', name: 'James Strategist', email: 'james@example.com', role: 'Viewer', status: 'invited' },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'Viewer',
      status: 'invited'
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-400" />
            Team Collaboration
          </h1>
          <p className="text-slate-400 mt-2">Manage user roles, organization access, and collaborative search strategies.</p>
        </div>

        <form onSubmit={handleInvite} className="flex gap-2">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="team@company.com"
              className="pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-600/20">
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Members</span>
          <div className="text-2xl font-black text-white">{members.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Users</span>
          <div className="text-2xl font-black text-emerald-400">2</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending</span>
          <div className="text-2xl font-black text-amber-400">1</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seats Remaining</span>
          <div className="text-2xl font-black text-slate-400">Unlimited</div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-slate-800/30 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`} 
                        alt={member.name}
                        className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-200 block">{member.name}</span>
                        <span className="text-xs text-slate-500">{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 w-fit">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      {member.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${
                      member.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {member.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-600 hover:text-indigo-400 transition rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-600 hover:text-red-400 transition rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
