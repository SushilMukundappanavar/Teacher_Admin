// load app server using express .....

const express = require("express");
const morgan = require("morgan");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
//to parse the request body to json format
app.use(bodyParser.json());

// to render all the static pages in ./public folder
app.use(express.static("./public"));

//using morgan to track all the server browser details
app.use(morgan("combined"));

//localhost:3003/
app.get("/", (req, res) => {
  console.log("Server Started");

  res.send("Aha! server started and this is my first page :)");
});

function getConnection() {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Roopa!43",
    database: "teacher_student"
  });
}

//push request : register each stdent
app.post("/api/user_create", (req, res) => {
  console.log("trying to create the new user...");
  let teacherEmail = req.body.teacher;
  let studentEmail = req.body.student;

  let connection = getConnection();
  let Insertquery =
    "INSERT INTO teacher_student.teacher_student (teacher_email,student_email,status) VALUES (?,?,'A')";
  connection.query(
    Insertquery,
    [teacherEmail, studentEmail],
    (err, rows, fields) => {
      if (err) {
        console.log("request failed:" + err);
        res.sendstatus(500);
      }
    }
  );
  res.sendStatus(200);
});

//get request : sreach comman students for each teacher
app.get("/api/commonstudents/:id", (req, res) => {
  console.log("fetching user with id " + req.params.id);

  const connection = getConnection();

  const queryString = "select * from teacher_student where teacher_email = ?";
  const userid = req.params.id;
  connection.query(queryString, [userid], (err, rows, fields) => {
    if (err) {
      console.log("request failed:" + err);
      res.sendStatus(500);
    }
    console.log(" db connected and fetching the data");

    let result = rows.map(row => {
      return {
        //  id: row.id,
        student: row.student_email
      };
    });

    finalResult = groupBy("teacher", result);

    res.send(finalResult);
  });

  //res.end();
});

//put request: teacher can suspend the student

app.put("/api/suspend", (req, res) => {
  let studentEmail = req.body.student;
  let updateQuery =
    "update teacher_student.teacher_student set status = 'S' where student_email = ?";
  getConnection().query(updateQuery, [studentEmail], (err, rows, fields) => {
    if (err) {
      console.log("Error while update" + err.message);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(204);
  });
});

function groupBy(key, array) {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    let added = false;
    for (let j = 0; j < result.length; j++) {
      if (result[j][key] === array[i][key]) {
        result[j].students.push(array[i]);
        added = true;
        break;
      }
    }
    if (!added) {
      var entry = { students: [] };
      entry.students.push(array[i]);
      entry[key] = array[i][key];
      result.push(entry);
    }
  }
  return result;
}

//localhost:3003 listner
app.listen(3003, () => {
  console.log("server is up and listening on 3003...");
});
