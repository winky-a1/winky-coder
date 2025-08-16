import React from 'react';
import { Users, Shield, Settings, Bot } from 'lucide-react';

interface FirebaseProject {
  id: string;
  name: string;
  projectId: string;
}

interface FirebaseAuthUIProps {
  project: FirebaseProject;
}

export const FirebaseAuthUI: React.FC<FirebaseAuthUIProps> = ({ project }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Authentication Manager</h3>
        <p className="text-slate-400 mb-4">
          Manage authentication providers and test auth flows
        </p>
        <div className="flex items-center gap-2 justify-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg text-white text-sm">
            <Bot className="w-4 h-4" />
            AI Setup
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-600 rounded-lg text-white text-sm">
            <Shield className="w-4 h-4" />
            Security Rules
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-lg text-white text-sm">
            <Settings className="w-4 h-4" />
            Providers
          </div>
        </div>
      </div>
    </div>
  );
};