import { useEffect, useState } from 'react'
import { useAppStore, useEditor, useChat, useCurrentRepository } from '@/stores/appStore'
import { getModels, aiChat } from '@/services/ai'
import { importRepo, getRepoFiles, getFileContent as apiGetFile } from '@/services/repos'
import { updateFile as apiUpdateFile } from '@/services/files'
import { v4 as uuidv4 } from 'uuid'
import Editor from '@monaco-editor/react'

function TopBar() {
  const theme = useAppStore(s => s.theme)
  const setTheme = useAppStore(s => s.setTheme)
  const currentRepository = useCurrentRepository()
  return (
    <div className="editor-toolbar">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Winky-Coder</span>
        {currentRepository && (
          <span className="text-sm text-slate-400">{currentRepository.name}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>
    </div>
  )
}

function Sidebar({ onOpen }: { onOpen: (path: string) => void }) {
  const repo = useCurrentRepository()
  const files = useAppStore(s => s.fileExplorer.files)
  const setFiles = useAppStore(s => s.setFiles)

  useEffect(() => {
    const load = async () => {
      if (!repo) return
      const res = await getRepoFiles(repo.path, '')
      if (res.success) setFiles(res.data)
    }
    load()
  }, [repo])

  return (
    <div className="sidebar p-3 overflow-y-auto">
      <div className="panel-header">
        <div className="panel-title">Files</div>
      </div>
      <div className="file-tree">
        {files.map((f) => (
          <div key={f.path} className="file-item" onClick={() => !('children' in f) && onOpen(f.path)}>
            {f.type === 'directory' ? '📁' : '📄'} <span className="ml-2">{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatPanel() {
  const { messages, isLoading, selectedModel } = useChat()
  const addMessage = useAppStore(s => s.addMessage)
  const setLoading = useAppStore(s => s.setChatLoading)
  const repo = useCurrentRepository()

  const [input, setInput] = useState('')
  const [models, setModels] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    getModels().then(res => {
      if (res.success) setModels(res.data.map((m: any) => ({ id: m.id, name: m.name })))
    })
  }, [])

  const send = async () => {
    if (!input.trim()) return
    addMessage({ role: 'user', content: input })
    setInput('')
    setLoading(true)
    try {
      const context = repo ? { repoPath: repo.path } : undefined
      const res = await aiChat({ prompt: input, model: selectedModel, context })
      if (res.success) {
        addMessage({ role: 'assistant', content: res.data.content, model: res.data.model, usage: res.data.usage })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header px-4"><div className="panel-title">AI Assistant</div></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`chat-message ${m.role}`}>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {isLoading && <div className="text-slate-400">Thinking<span className="loading-dots"/></div>}
      </div>
      <div className="p-3 border-t border-white/10 flex gap-2">
        <input className="flex-1 input-primary" placeholder="Ask the agent..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){send()}}} />
        <button className="btn-primary" onClick={send}>Send</button>
      </div>
    </div>
  )
}

export default function App() {
  const theme = useAppStore(s => s.theme)
  const setCurrentRepository = useAppStore(s => s.setCurrentRepository)
  const editor = useEditor()
  const setCurrentFile = useAppStore(s => s.setCurrentFile)
  const setEditorDirty = useAppStore(s => s.setEditorDirty)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const openFile = async (path: string) => {
    if (!useAppStore.getState().currentRepository) return
    const repoPath = useAppStore.getState().currentRepository!.path
    const res = await apiGetFile(repoPath, path)
    if (res.success) setCurrentFile(res.data)
  }

  const saveFile = async () => {
    const repo = useAppStore.getState().currentRepository
    const file = editor.currentFile
    if (!repo || !file) return
    await apiUpdateFile(repo.path, file.path, file.content)
    setEditorDirty(false)
  }

  const importExample = async () => {
    const repoUrl = 'https://github.com/facebook/react.git'
    const res = await importRepo(repoUrl, undefined, 'main')
    if (res.success) setCurrentRepository(res.data)
  }

  return (
    <div className="h-full grid" style={{ gridTemplateRows: 'auto 1fr', gridTemplateColumns: '260px 1fr 420px' }}>
      <div className="col-span-3"><TopBar /></div>
      <div className="row-start-2"><Sidebar onOpen={openFile} /></div>
      <div className="row-start-2 border-x border-slate-700 flex flex-col">
        <div className="p-2 flex gap-2">
          <button className="btn-primary" onClick={importExample}>Import Example Repo</button>
          {editor.isDirty && <button className="btn-accent" onClick={saveFile}>Save</button>}
        </div>
        <div className="flex-1">
          <Editor
            className="editor-container"
            theme={useAppStore.getState().theme === 'dark' ? 'vs-dark' : 'vs-light'}
            language={editor.language}
            value={editor.currentFile?.content || ''}
            onChange={(v) => {
              if (!editor.currentFile) return
              setCurrentFile({ ...editor.currentFile, content: v || '' })
              setEditorDirty(true)
            }}
            options={{ fontSize: editor.fontSize, wordWrap: editor.wordWrap, minimap: { enabled: editor.minimap } }}
            height="calc(100% - 48px)"
          />
        </div>
      </div>
      <div className="row-start-2"><ChatPanel /></div>
    </div>
  )
}