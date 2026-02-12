import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Editor from "@monaco-editor/react";
import { challengesApi } from "../services/challengesApi";
import { notify } from "../services/notification";

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
      notify.error("Failed to load challenges");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    notify.warning("Delete Challenge", {
      description:
        "Are you sure you want to delete this challenge? This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await challengesApi.delete(slug);
            notify.success("Challenge deleted");
            fetchTasks();
          } catch {
            notify.error("Failed to delete challenge");
          }
        },
      },
    });
  };

  const TaskForm = ({ task, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      task || {
        title: "",
        slug: "",
        description: "",
        order: tasks.length + 1,
        xp_reward: 50,
        initial_code: "# Write your code here\n",
        test_code: "# assert something\n",
        time_limit: 300,
      },
    );

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (task && task.slug) {
          await challengesApi.update(task.slug, formData);
          notify.success("Challenge updated");
        } else {
          await challengesApi.create(formData);
          notify.success("Challenge created");
        }
        onSave();
      } catch (error) {
        console.error("Failed to save challenge:", error);
        notify.error("Failed to save challenge");
      }
    };

    return (
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {task ? "Edit Challenge" : "New Challenge"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
          >
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-zinc-700 outline-none text-white placeholder-zinc-700"
                placeholder="FizzBuzz"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Slug</label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-zinc-700 outline-none text-white font-mono placeholder-zinc-700"
                placeholder="fizz-buzz"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">
              Description (Markdown)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-zinc-700 outline-none text-white font-mono placeholder-zinc-700 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-zinc-700 outline-none text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                XP Reward
              </label>
              <input
                type="number"
                name="xp_reward"
                value={formData.xp_reward}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-zinc-700 outline-none text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Time Limit (s)
              </label>
              <input
                type="number"
                name="time_limit"
                value={formData.time_limit}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-zinc-700 outline-none text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 h-[300px]">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Initial Code
              </label>
              <div className="flex-1 border border-zinc-800 rounded-md overflow-hidden bg-zinc-950">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={formData.initial_code}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, initial_code: val }))
                  }
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    padding: { top: 10 },
                    background: "#09090b",
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Validation Code
              </label>
              <div className="flex-1 border border-zinc-800 rounded-md overflow-hidden bg-zinc-950">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={formData.test_code}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, test_code: val }))
                  }
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    padding: { top: 10 },
                    background: "#09090b",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-zinc-500 hover:text-white px-4 h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-white text-black hover:bg-zinc-200 px-4 h-9 font-medium"
            >
              Save Challenge
            </Button>
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
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Challenge Management
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTasks}
                disabled={isLoading}
                className="h-8 gap-2 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded-md"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="text-xs font-medium">Refresh</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setEditingTask({})}
                className="h-8 gap-2 bg-white text-black hover:bg-zinc-200 font-medium px-3 rounded-md transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs">Add Challenge</span>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/50">
                  <TableHead className="w-[80px] text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                    #
                  </TableHead>
                  <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                    Challenge
                  </TableHead>
                  <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                    XP Reward
                  </TableHead>
                  <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                    Time Limit
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-700" />
                        <span className="text-xs font-medium text-zinc-600 uppercase tracking-widest">
                          Loading...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-zinc-500 text-sm italic"
                    >
                      No challenges found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="border-zinc-800 hover:bg-zinc-900/40 transition-colors group"
                    >
                      <TableCell className="py-3">
                        <span className="text-xs font-mono text-zinc-600">
                          {task.order.toString().padStart(2, "0")}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white tracking-tight flex items-center gap-2">
                            {task.title}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            /{task.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 font-mono text-xs">
                        <span className="text-zinc-400">
                          {task.xp_reward} XP
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-zinc-500 text-xs">
                          {task.time_limit}s
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTask(task)}
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.slug)}
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded-md"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
          onSave={() => {
            setEditingTask(null);
            fetchTasks();
          }}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default AdminTasks;
