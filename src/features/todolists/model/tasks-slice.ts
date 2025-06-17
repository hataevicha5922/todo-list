import { createSlice, nanoid } from "@reduxjs/toolkit"
import { createTodolistTC, deleteTodolistTC } from "./todolists-slice"
import { createAppSlice } from "@/common/utils"
import { tasksApi } from "../api/tasksApi"
import { DomainTask } from "../api/tasksApi.types"
import { TaskPriority, TaskStatus } from "@/common/enums"

export const tasksSlice = createAppSlice({
  name: "tasks",
  initialState: {} as TasksState,
  selectors: {
    selectTasks: (state) => state,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTodolistTC.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(deleteTodolistTC.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
  },
  reducers: (create) => ({
    deleteTaskAC: create.reducer<{ todolistId: string; taskId: string }>((state, action) => {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex((task) => task.id === action.payload.taskId)
      if (index !== -1) {
        tasks.splice(index, 1)
      }
    }),
    createTaskAC: create.reducer<{ todolistId: string; title: string }>((state, action) => {
      const newTask: DomainTask = {
        title: action.payload.title,
        todoListId: action.payload.todolistId,
        startDate: "",
        priority: TaskPriority.Low,
        description: "",
        deadline: "",
        status: TaskStatus.New,
        addedDate: "",
        order: 0,
        id: nanoid(),
      }
      state[action.payload.todolistId].unshift(newTask)
    }),
    changeTaskStatusAC: create.reducer<{ todolistId: string; taskId: string; isDone: boolean }>((state, action) => {
      const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
      if (task) {
        task.status = action.payload.isDone ? TaskStatus.Completed : TaskStatus.New
      }
    }),
    changeTaskTitleAC: create.reducer<{ todolistId: string; taskId: string; title: string }>((state, action) => {
      const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
      if (task) {
        task.title = action.payload.title
      }
    }),
    fetchTasksTC: create.asyncThunk(
      async (todolistId: string, thunkAPI) => {
        try {
          const res = await tasksApi.getTasks(todolistId)
          return { todolistId, tasks: res.data.items }
        } catch (err) {
          return thunkAPI.rejectWithValue(err)
        }
      },
      {
        fulfilled: (state, action) => {
          state[action.payload.todolistId] = action.payload.tasks
        },
      },
    ),
  }),
})

export const { selectTasks } = tasksSlice.selectors
export const { deleteTaskAC, createTaskAC, changeTaskStatusAC, changeTaskTitleAC, fetchTasksTC } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer

export type Task = {
  id: string
  title: string
  isDone: boolean
}

export type TasksState = Record<string, DomainTask[]>
