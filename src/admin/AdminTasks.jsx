import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, RefreshCw, Layers, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "../components/ui/table";
import Editor from '@monaco-editor/react';
import { challengesApi } from '../services/challengesApi';
import { notify } from '../services/notification';

const AdminTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingTask, setEditingTask] = useState(null); // null = list, {} = new, {id...} = edit

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const data = await challengesApi.getAll();
            setTasks(data.sort((a, b) => a.order - b.order));
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            notify.error("Failed to load tasks");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (slug) => {
        notify.warning("Delete Task", {
            description: "Are you sure you want to delete this task? This cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        await challengesApi.delete(slug);
                        notify.success("Task deleted successfully");
                        fetchTasks();
                    } catch (error) {
                        notify.error("Failed to delete task");
                    }
                }
            }
        });
    };

    const TaskForm = ({ task, onSave, onCancel }) => {
        const [formData, setFormData] = useState(task || {
            title: '',
            slug: '',
            description: '',
            order: tasks.length + 1,
            xp_reward: 50,
            initial_code: '# Write your code here\n',
            test_code: '# assert something\n',
            time_limit: 300
        });

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                if (task && task.slug) {
                    await challengesApi.update(task.slug, formData);
                    notify.success("Task updated successfully");
                } else {
                    await challengesApi.create(formData);
                    notify.success("Task created successfully");
                }
                onSave();
            } catch (error) {
                console.error("Failed to save task:", error);
                notify.error("Failed to save task");
            }
        };

        return (
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">{task ? 'Edit Task' : 'New Task'}</h2>
                    <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0 text-gray-400 hover:text-white"><X size={20} /></Button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400">Title</label>
                            <input 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-purple-500 outline-none text-white placeholder-gray-600"
                                placeholder="e.g. FizzBuzz" 
                                required 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400">Slug (URL)</label>
                            <input 
                                name="slug" 
                                value={formData.slug} 
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-purple-500 outline-none text-white placeholder-gray-600 font-mono"
                                placeholder="e.g. fizz-buzz"
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-400">Description (Markdown)</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange}
                            className="w-full h-32 bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-purple-500 outline-none text-white font-mono placeholder-gray-600 resize-none" 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                         <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400">Order</label>
                            <input 
                                type="number" 
                                name="order" 
                                value={formData.order} 
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-purple-500 outline-none text-white" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400">XP Reward</label>
                            <input 
                                type="number" 
                                name="xp_reward" 
                                value={formData.xp_reward} 
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-purple-500 outline-none text-white" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400">Time Limit (sec)</label>
                             <input 
                                type="number" 
                                name="time_limit" 
                                value={formData.time_limit} 
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-purple-500 outline-none text-white" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-[300px]">
                        <div className="flex flex-col space-y-1">
                            <label className="text-sm font-medium text-gray-400">Initial Code</label>
                            <div className="flex-1 border border-white/10 rounded-md overflow-hidden bg-[#1e1e1e]">
                                <Editor
                                    height="100%"
                                    defaultLanguage="python"
                                    theme="vs-dark"
                                    value={formData.initial_code}
                                    onChange={(val) => setFormData(prev => ({...prev, initial_code: val}))}
                                    options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 10 } }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <label className="text-sm font-medium text-gray-400">Test Code (Hidden)</label>
                            <div className="flex-1 border border-white/10 rounded-md overflow-hidden bg-[#1e1e1e]">
                                <Editor
                                    height="100%"
                                    defaultLanguage="python"
                                    theme="vs-dark"
                                    value={formData.test_code}
                                    onChange={(val) => setFormData(prev => ({...prev, test_code: val}))}
                                    options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 10 } }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">Cancel</Button>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Save Task</Button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {!editingTask ? (
                <>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white tracking-tight">Tasks</h2>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={fetchTasks}
                                disabled={isLoading}
                                className="h-8 gap-2 border-white/10 text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Refresh</span>
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={() => setEditingTask({})} 
                                className="h-8 gap-2 bg-white text-black hover:bg-gray-200 border-0"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add Task</span>
                            </Button>
                        </div>
                    </div>
                
                    <div className="rounded-md border border-white/10 bg-[#0a0a0a]">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="w-[80px] text-gray-400">Order</TableHead>
                                    <TableHead className="text-gray-400">Task Title</TableHead>
                                    <TableHead className="text-gray-400">Reward</TableHead>
                                    <TableHead className="text-gray-400">Time Limit</TableHead>
                                    <TableHead className="text-right text-gray-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-gray-400"/>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : tasks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                                            No tasks found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tasks.map((task) => (
                                        <TableRow key={task.id} className="border-white/10 hover:bg-[#1a1a1a]">
                                            <TableCell className="font-medium text-white">
                                                <div className="h-8 w-8 rounded-sm bg-[#1a1a1a] border border-white/10 flex items-center justify-center font-mono text-sm text-gray-400">
                                                    {task.order}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-white">
                                                <div className="flex flex-col">
                                                    <span className="flex items-center gap-2">
                                                        <Layers className="w-3 h-3 text-purple-400" />
                                                        {task.title}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-normal font-mono truncate max-w-[200px]">{task.slug}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">
                                                    {task.xp_reward} XP
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-gray-400 text-sm">{task.time_limit}s</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingTask(task)}
                                                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-blue-500/10 hover:text-blue-400"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(task.slug)}
                                                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </>
            ) : (
                <TaskForm 
                    task={Object.keys(editingTask).length > 0 ? editingTask : null} 
                    onSave={() => { setEditingTask(null); fetchTasks(); }}
                    onCancel={() => setEditingTask(null)}
                />
            )}
        </div>
    );
};

export default AdminTasks;
