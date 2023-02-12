const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const { format } = require("date-fns");
const path = require("path");
const isValid = require("date-fns/isValid");
module.exports = app;

app.use(express.json());

const db_path = path.join(__dirname, "todoApplication.db");

let db = null;

const initalizeDbAndServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server is Running!");
    });
  } catch (error) {
    console.log(`Database Error ${error.message}`);
  }
};
initalizeDbAndServer();

let todoStatusList = ["TO DO", "IN PROGRESS", "DONE"];
let todoPriorityList = ["HIGH", "MEDIUM", "LOW"];
let todoCategoryList = ["WORK", "HOME", "LEARNING"];

//API 1

app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q } = request.query;
  if (status !== undefined && priority !== undefined) {
    if (
      todoStatusList.includes(status) === true &&
      todoPriorityList.includes(priority) === true
    ) {
      const getTodoStatusAndPriorityQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate
            FROM todo WHERE status='${status}' AND priority='${priority}';`;
      const statusAndPriorityTodoList = await db.all(
        getTodoStatusAndPriorityQuery
      );
      response.send(statusAndPriorityTodoList);
    } else {
      response.status(400);
      response.send("Invalid Query Parameters");
    }
  } else if (status !== undefined && category !== undefined) {
    if (
      todoStatusList.includes(status) === true &&
      todoCategoryList.includes(category) === true
    ) {
      const getTodoStatusAndCategoryQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate
            FROM todo WHERE status='${status}' AND category='${category}';`;
      const statusAndCategoryTodoList = await db.all(
        getTodoStatusAndCategoryQuery
      );
      response.send(statusAndCategoryTodoList);
    } else {
      response.status(400);
      response.send("Invalid Query Parameters");
    }
  } else if (category !== undefined && priority !== undefined) {
    if (
      todoCategoryList.includes(category) === true &&
      todoPriorityList.includes(priority) === true
    ) {
      const getCategoryAndPriorityQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate
            FROM todo WHERE category='${category}' AND priority='${priority}';`;
      const categoryPriorityTodoList = await db.all(
        getCategoryAndPriorityQuery
      );
      response.send(categoryPriorityTodoList);
    } else {
      response.status(400);
      response.send("Invalid Query Parameters");
    }
  } else if (status !== undefined) {
    if (todoStatusList.includes(status) === true) {
      const getTodoStatusQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate
            FROM todo WHERE status='${status}';`;
      const statusTodoList = await db.all(getTodoStatusQuery);
      response.send(statusTodoList);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== undefined) {
    if (todoPriorityList.includes(priority) === true) {
      const getTodoPriorityQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate
            FROM todo WHERE priority='${priority}';`;
      const priorityTodoList = await db.all(getTodoPriorityQuery);
      response.send(priorityTodoList);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (search_q !== undefined) {
    const getSearchTextQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate
      FROM todo WHERE todo LIKE '%${search_q}%';`;
    const searchTextList = await db.all(getSearchTextQuery);
    response.send(searchTextList);
  } else if (category !== undefined) {
    if (todoCategoryList.includes(category) === true) {
      const getCategoryQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate
      FROM todo WHERE category='${category}';`;
      const categoryTodoList = await db.all(getCategoryQuery);
      response.send(categoryTodoList);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getSpecificTodoQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate
    FROM todo WHERE id=${todoId};`;
  const getTodo = await db.get(getSpecificTodoQuery);
  response.send(getTodo);
});

//API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isValid(new Date(date)) === true) {
    const formatDate = format(new Date(date), "yyyy-MM-dd");
    const getDueDateQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate
    FROM todo WHERE due_date= '${formatDate}';`;
    const getTodoDetails = await db.all(getDueDateQuery);
    response.send(getTodoDetails);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (
    todoStatusList.includes(status) === true &&
    todoPriorityList.includes(priority) === true &&
    todoCategoryList.includes(category) === true &&
    isValid(new Date(dueDate)) === true
  ) {
    const formatDate = format(new Date(dueDate), "yyyy-MM-dd");
    const insertTodoQuery = `INSERT INTO todo(id,todo,category,priority,status,due_date)
        VALUES(${id},'${todo}','${category}','${priority}','${status}','${formatDate}');`;
    await db.run(insertTodoQuery);
    response.send("Todo Successfully Added");
  } else {
    if (todoStatusList.includes(status) === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (todoCategoryList.includes(category) === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else if (isValid(new Date(dueDate)) === false) {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
});

//API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  if (status !== undefined) {
    if (todoStatusList.includes(status) === true) {
      const updateStatusQuery = `UPDATE todo SET status='${status}' WHERE id=${todoId};`;
      await db.run(updateStatusQuery);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== undefined) {
    if (todoPriorityList.includes(priority) === true) {
      const updatePriorityQuery = `UPDATE todo SET priority='${priority}' WHERE id=${todoId};`;
      await db.run(updatePriorityQuery);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (category !== undefined) {
    if (todoCategoryList.includes(category) === true) {
      const updateCategoryQuery = `UPDATE todo SET category='${category}' WHERE id=${todoId};`;
      await db.run(updateCategoryQuery);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (todo !== undefined) {
    const updateTodoText = `UPDATE todo SET todo='${todo}' WHERE id=${todoId};`;
    await db.run(updateTodoText);
    response.send("Todo Updated");
  } else {
    if (isValid(new Date(dueDate)) === true) {
      const updateDate = `UPDATE todo SET due_date='${dueDate}' WHERE id=${todoId};`;
      await db.run(updateDate);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

//API 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
