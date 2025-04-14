import useStore from '../../store/todoStore';
import { auth } from '../../firebase/config';

const CategoryTasks = ({ selectedCategory }) => {
  const todos = useStore(state => state.todos);

  // Get the numeric user ID for API tasks
  const getDummyUserId = (firebaseUid) => {
    const hash = firebaseUid.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return Math.abs(hash % 100) + 1;
  };

  // Filter tasks by category and user
  const getCategoryTasks = () => {
    if (!selectedCategory || !auth.currentUser) return [];
    
    return todos.filter(todo => {
      // First check category
      if (todo.category?.id !== selectedCategory.id) return false;

      // Then check user ownership
      if (todo.id <= 150) {
        // API tasks - compare with mapped numeric ID
        return todo.userId === getDummyUserId(auth.currentUser.uid);
      } else {
        // Local tasks - compare with Firebase UID
        return todo.userId === auth.currentUser.uid;
      }
    });
  };

  return (
    <div className="mt-8">
      <div className="space-y-3">
        {getCategoryTasks().map(task => (
          <div
            key={task.id}
            className={`bg-white rounded-lg border p-4 transition-all duration-200 hover:shadow-md
              ${task.completed ? 'border-gray-200' : 'border-gray-300'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                {task.date && (
                  <p className="text-sm text-gray-500 mt-1">
                    Due: {new Date(task.date).toLocaleDateString()}
                    {task.time && ` at ${task.time}`}
                  </p>
                )}
              </div>
              {task.isImportant && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                  Important
                </span>
              )}
            </div>
          </div>
        ))}
        {getCategoryTasks().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks in this category
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTasks; 