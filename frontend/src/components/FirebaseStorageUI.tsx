import React from 'react';
import { Cloud, Upload, Download, Eye } from 'lucide-react';

interface FirebaseProject {
  id: string;
  name: string;
  projectId: string;
}

interface FirebaseStorageUIProps {
  project: FirebaseProject;
}

export const FirebaseStorageUI: React.FC<FirebaseStorageUIProps> = ({ project }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Cloud className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Storage Manager</h3>
        <p className="text-slate-400 mb-4">
          Manage Firebase Storage files with permission checks and previews
        </p>
        <div className="flex items-center gap-2 justify-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg text-white text-sm">
            <Upload className="w-4 h-4" />
            Upload Files
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-600 rounded-lg text-white text-sm">
            <Eye className="w-4 h-4" />
            Preview
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-lg text-white text-sm">
            <Download className="w-4 h-4" />
            Download
          </div>
        </div>
      </div>
    </div>
  );
};