import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  PlusIcon, 
  TrashIcon, 
  EditIcon,
  CheckIcon, 
  SearchIcon,
  FilterIcon,
  TagIcon,
  FlagIcon
} from 'lucide-react';

// Priority and Category Configuration
const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
];

const CATEGORIES = [
  { value: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800' },
  { value: 'personal', label: 'Personal', color: 'bg-purple-100 text-purple-800' },
  { value: 'shopping', label: 'Shopping', color: 'bg-pink-100 text-pink-800' },
  { value: 'health', label: 'Health', color: 'bg-green-100 text-green-800' }
];

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    text: '',
    priority: 'medium',
    category: 'personal'
  });
  const [activeTab, setActiveTab] = useState('incomplete');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/todos');
      setTodos(response.data);
    } catch (error) {
      toast.error('Failed to fetch todos');
    }
  };

  // Add new todo
  const addTodo = async () => {
    if (newTodo.text.trim()) {
      try {
        const todoToAdd = {
          ...newTodo,
          completed: false,
          id: Date.now()
        };
        const response = await axios.post('http://localhost:5000/todos', todoToAdd);
        setTodos([...todos, response.data]);
        setNewTodo({ text: '', priority: 'medium', category: 'personal' });
        toast.success('Todo added successfully!');
      } catch (error) {
        toast.error('Failed to add todo');
      }
    } else {
      toast.error('Todo cannot be empty');
    }
  };

  // Edit todo
  const startEditTodo = (todo) => {
    setEditingTodo(todo);
    setNewTodo({
      text: todo.text,
      priority: todo.priority,
      category: todo.category
    });
  };

  // Update todo
  const updateTodo = async () => {
    if (editingTodo) {
      try {
        const updatedTodo = {
          ...editingTodo,
          ...newTodo
        };
        const response = await axios.put(`http://localhost:5000/todos/${editingTodo.id}`, updatedTodo);
        setTodos(todos.map(todo => 
          todo.id === editingTodo.id ? response.data : todo
        ));
        setEditingTodo(null);
        setNewTodo({ text: '', priority: 'medium', category: 'personal' });
        toast.success('Todo updated successfully!');
      } catch (error) {
        toast.error('Failed to update todo');
      }
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id);
      const response = await axios.put(`http://localhost:5000/todos/${id}`, {
        ...todoToUpdate,
        completed: !todoToUpdate.completed
      });
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
      toast(
        todoToUpdate.completed ? 'Todo marked incomplete' : 'Todo completed!',
        { icon: todoToUpdate.completed ? '❌' : '✅' }
      );
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
      toast.success('Todo deleted');
    } catch (error) {
      toast.error('Failed to delete todo');
    }
  };

  // Filter and search todos
  const filteredTodos = todos.filter(todo => 
    (activeTab === 'incomplete' ? !todo.completed : todo.completed) &&
    (searchTerm === '' || 
     todo.text.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterPriority === 'all' || todo.priority === filterPriority) &&
    (filterCategory === 'all' || todo.category === filterCategory)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-6 flex justify-center items-center">
      <Toaster position="top-right" reverseOrder={false} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl"
      >
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('incomplete')}
            className={`flex-1 p-4 flex items-center justify-center space-x-2 ${
              activeTab === 'incomplete' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckIcon />
            <span>Incomplete Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('complete')}
            className={`flex-1 p-4 flex items-center justify-center space-x-2 ${
              activeTab === 'complete' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TagIcon />
            <span>Completed Tasks</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="p-4 bg-gray-50 flex space-x-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <SearchIcon className="absolute left-2 top-3 text-gray-400" size={18} />
          </div>
          
          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
          
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Todo Input Section */}
        <div className="p-4 bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTodo.text}
              onChange={(e) => setNewTodo({...newTodo, text: e.target.value})}
              placeholder="Enter a new todo"
              className="flex-grow p-2 border rounded-lg"
            />
            
            {/* Priority Selector */}
            <select
              value={newTodo.priority}
              onChange={(e) => setNewTodo({...newTodo, priority: e.target.value})}
              className="p-2 border rounded-lg"
            >
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            
            {/* Category Selector */}
            <select
              value={newTodo.category}
              onChange={(e) => setNewTodo({...newTodo, category: e.target.value})}
              className="p-2 border rounded-lg"
            >
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={editingTodo ? updateTodo : addTodo}
              className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {editingTodo ? 'Update' : 'Add'}
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {filteredTodos.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500"
              >
                No todos found
              </motion.div>
            ) : (
              filteredTodos.map(todo => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border rounded-lg shadow-sm p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    {/* Completion Checkbox */}
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="form-checkbox h-5 w-5 text-primary-600"
                    />

                    {/* Todo Details */}
                    <div>
                      <div className="font-medium">{todo.text}</div>
                      <div className="flex space-x-2 mt-1">
                        {/* Priority Tag */}
                        <span className={`px-2 py-1 rounded text-xs ${
                          PRIORITIES.find(p => p.value === todo.priority).color
                        }`}>
                          {PRIORITIES.find(p => p.value === todo.priority).label}
                        </span>
                        
                        {/* Category Tag */}
                        <span className={`px-2 py-1 rounded text-xs ${
                          CATEGORIES.find(c => c.value === todo.category).color
                        }`}>
                          {CATEGORIES.find(c => c.value === todo.category).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditTodo(todo)}
                      className="text-primary-500 hover:text-primary-700"
                    >
                      <EditIcon size={20} />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon size={20} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gray-50 rounded-b-xl flex justify-between text-sm text-gray-600">
          <span>Total Tasks: {todos.length}</span>
          <span>
            Incomplete: {todos.filter(todo => !todo.completed).length} | 
            Completed: {todos.filter(todo => todo.completed).length}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default TodoList;